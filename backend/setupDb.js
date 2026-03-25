const connectDB = require('./db');
const Statement = require('./models/Statement');
const Transaction = require('./models/Transaction');
const GeminiCache = require('./models/GeminiCache');

async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Clearing existing data...');
    await Statement.deleteMany({});
    await Transaction.deleteMany({});
    await GeminiCache.deleteMany({});
    
    console.log('Database setup complete! Mongoose handles schema creation automatically.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();
