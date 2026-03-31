require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const User = require('./models/User');
const Statement = require('./models/Statement');
const Transaction = require('./models/Transaction');
const { processTransactions } = require('./orchestrator');

const initTelegramBot = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("No Telegram Bot token provided. Bot disabled.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  console.log("Telegram Bot started!");

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    if (text.startsWith('/start')) {
       bot.sendMessage(chatId, "Welcome to ClarityAI Bot! Send me an expense like 'spent 500 on Starbucks' and I will automatically categorize and add it to your dashboard. Type /logout to unlink your account.");
       return;
    }

    try {
      // Look up user by Telegram Chat ID
      let user = await User.findOne({ telegramChatId: String(chatId) });

      if (text.startsWith('/logout') || text.startsWith('/unlink')) {
         if (user) {
            user.telegramChatId = null;
            await user.save();
            bot.sendMessage(chatId, "✅ Successfully logged out! Your Telegram account is now unlinked.\n\nReply with a different ClarityAI account email to link a new account.");
         } else {
            bot.sendMessage(chatId, "You are not currently linked to any account.");
         }
         return;
      }
      
      if (!user) {
        // Setup linking if email is provided
        if (text.includes('@')) {
          const emailInput = text.trim().toLowerCase();
          const targetUser = await User.findOne({ email: emailInput });
          
          if (targetUser) {
            targetUser.telegramChatId = String(chatId);
            await targetUser.save();
            bot.sendMessage(chatId, `✅ Success! Your Telegram account is now linked to ${targetUser.email}. You can now send me expenses like "Spent 500 on Swiggy".`);
          } else {
            bot.sendMessage(chatId, `No ClarityAI account found matching "${emailInput}". Please check your spelling or register on the web app.`);
          }
          return;
        }
        
        bot.sendMessage(chatId, "Before logging expenses, please reply with your ClarityAI account email (e.g. user@example.com) to securely link your account.");
        return;
      }

      // Simple heuristic: extract the first number as amount
      const amountMatch = text.match(/[\d,]+(?:\.\d+)?/);
      if (!amountMatch) {
         bot.sendMessage(chatId, "I couldn't find an amount in your message. Please include a number, e.g. '500 for groceries'.");
         return;
      }

      const amountStr = amountMatch[0].replace(/,/g, '');
      const parsedAmount = parseFloat(amountStr);
      
      // Determine if it's income or expense. Default to expense (negative) unless keyword says otherwise
      const isIncome = /earned|received|income|salary|deposit/.test(text.toLowerCase());
      const amount = isIncome ? parsedAmount : -parsedAmount;

      bot.sendMessage(chatId, `Processing entry: ${amount} for "${text}"...`);

      const processed = await processTransactions([{
        index: 0,
        date: new Date().toISOString(),
        description: text,
        amount: amount
      }]);

      const t = processed[0];

      let stmt = await Statement.findOne({ user_id: user._id, filename: 'Telegram Entries' });
      if (!stmt) {
        stmt = await Statement.create({ user_id: user._id, filename: 'Telegram Entries' });
      }

      const newTx = await Transaction.create({
        user_id: user._id,
        statement_id: stmt._id,
        date: new Date(),
        description: t.description || 'Unknown',
        amount: t.amount || 0,
        category: t.category || 'Other',
        confidence: t.confidence || 0,
        source: t.source || 'telegram'
      });

      bot.sendMessage(chatId, `✅ Added successfully!\nAmount: ${newTx.amount}\nCategory: ${newTx.category} (${newTx.source})\nConfidence: ${newTx.confidence}%`);
      
    } catch (error) {
      console.error("Telegram Bot Error:", error);
      bot.sendMessage(chatId, "Sorry, I ran into an error processing your transaction.");
    }
  });
};

module.exports = { initTelegramBot };
