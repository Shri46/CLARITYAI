const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const csv = require('csv-parser');
const stream = require('stream');
const connectDB = require('./db');
const { processTransactions } = require('./orchestrator');
const Statement = require('./models/Statement');
const Transaction = require('./models/Transaction');
const User = require('./models/User');
const Budget = require('./models/Budget');
const { protect } = require('./middleware/auth');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_123', {
    expiresIn: '30d',
  });
};

dotenv.config();

connectDB();
const { initTelegramBot } = require('./telegramBot');
initTelegramBot();
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ClarityAI backend is running' });
});

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Please add all fields' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });
    if (user) {
      res.status(201).json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({ _id: user.id, name: user.name, email: user.email, token: generateToken(user._id) });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/analyze', protect, upload.single('statement'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const results = [];
  const bufferStream = new stream.PassThrough();
  bufferStream.end(req.file.buffer);
  
  // PDF Parsing left as stretch goal for now, handle CSV
  if (req.file.originalname.endsWith('.pdf')) {
    return res.status(400).json({ error: 'PDF parsing is not yet implemented, please upload CSV' });
  }

  bufferStream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        console.log(`Parsed ${results.length} rows from CSV`);
        
        // Process categorization
        const processed = await processTransactions(results);
        
        // Save Statement to DB
        const stmt = await Statement.create({ user_id: req.user.id, filename: req.file.originalname });
        const statementId = stmt._id;
        
        // Save Transactions to DB
        let rulesCount = 0;
        let aiCount = 0;
        
        for (const t of processed) {
          if (t.source === 'rules' || t.source === 'cache') rulesCount++;
          if (t.source === 'gemini') aiCount++;
          
          try {
            await Transaction.create({
              user_id: req.user.id,
              statement_id: statementId,
              date: t.date ? new Date(t.date) : new Date(),
              description: t.description || 'Unknown',
              amount: t.amount || 0,
              category: t.category || 'Other',
              confidence: t.confidence || 0,
              source: t.source || 'unknown'
            });
          } catch (e) {
            console.error("Error inserting transaction", e.message);
          }
        }

        res.json({
          statement_id: statementId,
          transactions: processed,
          stats: {
            total: processed.length,
            rules: rulesCount,
            ai: aiCount,
            rules_percentage: Math.round((rulesCount / processed.length) * 100) || 0,
            ai_percentage: Math.round((aiCount / processed.length) * 100) || 0
          }
        });
      } catch (err) {
        console.error("Analysis Error:", err);
        res.status(500).json({ error: 'Failed to process transactions' });
      }
    });
});

app.get('/api/transactions', protect, async (req, res) => {
  try {
    const result = await Transaction.find({ user_id: req.user.id }).sort({ date: -1 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// BUDGET ENDPOINTS
app.get('/api/budgets', protect, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', protect, async (req, res) => {
  try {
    const { category, amount } = req.body;
    if (!category || typeof amount !== 'number') return res.status(400).json({ error: 'Missing requirements' });
    
    const budget = await Budget.findOneAndUpdate(
      { user_id: req.user.id, category },
      { amount },
      { upsert: true, new: true }
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/budgets/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ error: 'Not found' });
    if (budget.user_id.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });

    await Budget.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/manual-transaction', protect, async (req, res) => {
  try {
    const { date, description, amount } = req.body;
    if (!description || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Missing description or amount' });
    }

    let txDate = new Date();
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
        txDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        txDate = new Date(date);
      }
    }
    
    // Process for AI categorization
    const processed = await processTransactions([{
      index: 0,
      date: date || new Date().toISOString(),
      description,
      amount
    }]);

    const t = processed[0];
    
    // Provide a dummy statement for manual entries
    let stmt = await Statement.findOne({ user_id: req.user.id, filename: 'Manual Entries' });
    if (!stmt) {
      stmt = await Statement.create({ user_id: req.user.id, filename: 'Manual Entries' });
    }

    const newTx = await Transaction.create({
      user_id: req.user.id,
      statement_id: stmt._id,
      date: txDate,
      description: t.description || 'Unknown',
      amount: t.amount || 0,
      category: t.category || 'Other',
      confidence: t.confidence || 0,
      source: t.source || 'manual' // Will be gemini/rules if AI works, or manual
    });
    
    res.json(newTx);
  } catch (err) {
    console.error("Manual Entry Error:", err);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

app.delete('/api/transactions/:id', protect, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.user_id.toString() !== req.user.id) return res.status(401).json({ error: 'Not authorized' });

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
