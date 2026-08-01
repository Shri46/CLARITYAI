const mongoose = require('mongoose');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const dbUrl = 'mongodb://shritans:mongodb4600@ac-twwpktl-shard-00-00.5upodie.mongodb.net:27017,ac-twwpktl-shard-00-01.5upodie.mongodb.net:27017,ac-twwpktl-shard-00-02.5upodie.mongodb.net:27017/?ssl=true&replicaSet=atlas-3jp32m-shard-0&authSource=admin&appName=cai';

async function fix() {
  await mongoose.connect(dbUrl);
  // Clear telegramChatId from all users except adi@gmail.com
  await User.updateMany({ email: { $ne: 'adi@gmail.com' } }, { $set: { telegramChatId: null } });
  
  const adi = await User.findOne({ email: 'adi@gmail.com' });
  if (adi) {
    adi.telegramChatId = '1256175878';
    await adi.save();
    
    // Re-assign the Telegram transactions to Adi's user ID
    const shritanId = '69c942a60b04433e61e16c1a';
    await Transaction.updateMany({ user_id: shritanId }, { $set: { user_id: adi._id } });
    console.log('SUCCESSFULLY LINKED TELEGRAM TO ADI & REASSIGNED TRANSACTIONS!');
  } else {
    console.log('User adi@gmail.com not found');
  }
  process.exit(0);
}
fix();
