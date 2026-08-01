import React, { useMemo } from 'react';

const InsightsCard = ({ transactions = [] }) => {
  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const bullets = [];
    const catTotals = {};
    let totalSpend = 0;
    let income = 0;
    let expenses = 0;
    const monthlySpend = {};
    const weekdaySpend = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (amt < 0) {
        const absAmt = Math.abs(amt);
        expenses += absAmt;
        totalSpend += absAmt;
        const cat = t.category || 'Other';
        catTotals[cat] = (catTotals[cat] || 0) + absAmt;

        const d = new Date(t.date || Date.now());
        const monthYear = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlySpend[monthYear] = (monthlySpend[monthYear] || 0) + absAmt;

        const dayOfWeek = d.getDay();
        weekdaySpend[dayOfWeek] = (weekdaySpend[dayOfWeek] || 0) + absAmt;
      } else if (amt > 0) {
        income += amt;
      }
    });

    // 1. Top spending category
    const sortedCats = Object.entries(catTotals)
      .filter(([cat]) => cat !== 'Income' && cat !== 'Transfer')
      .sort((a, b) => b[1] - a[1]);

    if (sortedCats.length > 0) {
      const [topCat, topAmt] = sortedCats[0];
      const pct = totalSpend > 0 ? ((topAmt / totalSpend) * 100).toFixed(0) : 0;
      bullets.push(`Your top spending category is ${topCat}, accounting for ${pct}% (₹${topAmt.toLocaleString()}) of total expenses.`);
    }

    // 2. Second highest category comparison
    if (sortedCats.length >= 2) {
      const [secondCat, secondAmt] = sortedCats[1];
      const diff = sortedCats[0][1] - secondAmt;
      bullets.push(`${sortedCats[0][0]} spending is ₹${diff.toLocaleString()} more than ${secondCat} (₹${secondAmt.toLocaleString()}). Consider balancing these areas.`);
    }

    // 3. Savings insight
    if (income > 0) {
      const savingsRate = ((income - expenses) / income * 100).toFixed(1);
      if (savingsRate >= 20) {
        bullets.push(`Great job! Your savings rate is ${savingsRate}%. You're saving ₹${(income - expenses).toLocaleString()} this period.`);
      } else if (savingsRate > 0) {
        bullets.push(`Your savings rate is ${savingsRate}%. Try to aim for at least 20% — you need to save ₹${((income * 0.2) - (income - expenses)).toLocaleString()} more.`);
      } else {
        bullets.push(`⚠️ You're spending more than you earn. Expenses exceed income by ₹${(expenses - income).toLocaleString()}.`);
      }
    } else {
      bullets.push(`Total expenses this period: ₹${totalSpend.toLocaleString()} across ${sortedCats.length} categories.`);
    }

    // 4. Spending day pattern
    const dayEntries = Object.entries(weekdaySpend);
    if (dayEntries.length > 0) {
      const topDay = dayEntries.sort((a, b) => b[1] - a[1])[0];
      bullets.push(`You tend to spend the most on ${dayNames[topDay[0]]}s (₹${topDay[1].toLocaleString()}). Plan ahead to avoid impulse purchases.`);
    }

    // 5. Average transaction size
    const expenseTxs = transactions.filter(t => Number(t.amount) < 0);
    if (expenseTxs.length > 0) {
      const avgExpense = totalSpend / expenseTxs.length;
      bullets.push(`Your average transaction size is ₹${avgExpense.toFixed(0)}. You have ${expenseTxs.length} expense transactions recorded.`);
    }

    return bullets.slice(0, 5);
  }, [transactions]);

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/50 p-6 rounded-2xl shadow-sm border border-indigo-100 h-full flex flex-col relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center gap-2 mb-5 relative z-10">
         <span className="text-xl">✨</span>
         <h3 className="text-base font-bold text-slate-900">AI Financial Insights</h3>
      </div>

      <div className="flex-1 relative z-10">
        {insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700 text-xs leading-relaxed bg-white/80 p-3 rounded-xl border border-indigo-100/60 shadow-2xs">
                <span className="text-indigo-600 mt-0.5 flex-shrink-0">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 text-xs text-center leading-relaxed py-6">No transaction data available to generate insights.</p>
        )}
      </div>
    </div>
  );
};

export default InsightsCard;
