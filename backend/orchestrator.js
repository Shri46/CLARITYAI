const crypto = require('crypto');
const GeminiCache = require('./models/GeminiCache');
const { categorizeWithRules } = require('./rules');
const { categorizeWithGemini } = require('./gemini');

function getHash(text) {
  return crypto.createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
}

async function processTransactions(rows) {
  const results = [];
  const unmatched = [];
  
  // 1. Rules Engine
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const desc = row.description || row.Description || row.Narration || '';
    const date = row.date || row.Date || row['Transaction Date'] || '';
    let amountStr = row.amount || row.Amount || row.Withdrawal || row.Deposit || '0';
    
    // handle case where withdrawal and deposit are separate columns
    if (!row.amount && !row.Amount) {
       const w = parseFloat(row.Withdrawal || 0);
       const d = parseFloat(row.Deposit || 0);
       if (!isNaN(w) && w > 0) amountStr = -w;
       else if (!isNaN(d) && d > 0) amountStr = d;
    }
    const amount = parseFloat(amountStr);
    
    const ruleMatch = categorizeWithRules(desc);
    if (ruleMatch) {
      results.push({
        index: i,
        date,
        description: desc,
        amount,
        ...ruleMatch
      });
    } else {
      unmatched.push({
        index: i,
        date,
        description: desc,
        amount
      });
    }
  }

  if (unmatched.length === 0) return results;

  // 2. Check Database Cache for unmatched
  const stillUnmatched = [];
  try {
    for (const item of unmatched) {
      const hash = getHash(item.description);
      const cached = await GeminiCache.findOne({ description_hash: hash });
      if (cached) {
        results.push({
          ...item,
          category: cached.category,
          confidence: 90,
          source: 'cache'
        });
      } else {
        stillUnmatched.push(item);
      }
    }
  } catch (dbErr) {
    console.warn("DB Cache Error (continuing without cache):", dbErr.message);
    stillUnmatched.push(...unmatched);
  }

  if (stillUnmatched.length === 0) return results.sort((a,b) => a.index - b.index);

  // 3. Gemini API (Batch in chunks of 30)
  const chunkSize = 30;
  for (let i = 0; i < stillUnmatched.length; i += chunkSize) {
    const chunk = stillUnmatched.slice(i, i + chunkSize);
    const geminiResults = await categorizeWithGemini(chunk);
    
    // 4. Merge and Cache
    for (const gRow of geminiResults) {
      const original = chunk.find(c => c.index === gRow.index);
      if (original) {
        const finalRow = {
          ...original,
          category: gRow.category,
          confidence: gRow.confidence,
          source: gRow.source
        };
        results.push(finalRow);
        
        // Save to cache
        if (gRow.source === 'gemini') {
          const hash = getHash(original.description);
          try {
            await GeminiCache.findOneAndUpdate(
              { description_hash: hash },
              { $setOnInsert: { description_hash: hash, category: gRow.category } },
              { upsert: true }
            );
          } catch(err) {
            console.error('Cache insert error', err.message);
          }
        }
      }
    }
  }

  return results.sort((a,b) => a.index - b.index);
}

module.exports = { processTransactions };
