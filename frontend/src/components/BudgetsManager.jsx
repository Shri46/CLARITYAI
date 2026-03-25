import React, { useState, useEffect } from 'react';
import { getBudgets, createBudget, deleteBudget } from '../api';

const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Bills & Utilities", 
  "Entertainment", "Health", "Finance", "Education", "Travel", "Other"
];

const BudgetsManager = ({ catTotals }) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState('');

  const fetchBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (err) {
      console.error("Failed to fetch budgets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [catTotals]);

  const handleAddBudget = async (e) => {
    e.preventDefault();
    if (!amount) return;
    try {
      await createBudget({ category, amount: Number(amount) });
      setAmount('');
      fetchBudgets();
    } catch (err) {
      console.error("Failed to default budget", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      fetchBudgets();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 animate-pulse h-64"></div>;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 h-full">
      <h3 className="text-lg font-bold text-white mb-6">Monthly Budgets</h3>
      
      <form onSubmit={handleAddBudget} className="flex gap-4 mb-6">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 flex-1">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="₹" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 w-24" />
        <button type="submit" className="bg-gradient-to-r from-teal-500 to-indigo-500 text-white px-4 py-2 rounded-xl font-bold hover:from-teal-400 hover:to-indigo-400 transition-colors shadow-lg shadow-teal-500/20">Set</button>
      </form>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {budgets.length === 0 ? (
           <div className="text-center py-6 text-slate-500 text-sm">No active budgets. Add one above!</div>
        ) : budgets.map(b => {
          const spent = catTotals[b.category] || 0;
          const pct = Math.min((spent / b.amount) * 100, 100);
          const isWarning = pct >= 90;
          const isDanger = pct >= 100;
          
          return (
            <div key={b._id} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 relative group hover:border-slate-700 transition-colors">
              <button onClick={() => handleDelete(b._id)} className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Budget">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="flex justify-between items-end mb-2 pr-6">
                <div>
                  <h4 className="text-slate-200 font-bold">{b.category}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className={isDanger ? 'text-rose-400 font-bold' : 'text-slate-300'}>₹{spent.toLocaleString()}</span> 
                    {' '}/ ₹{b.amount.toLocaleString()}
                  </p>
                </div>
                {isWarning && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-sm ${isDanger ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                    {isDanger ? 'Over Budget' : 'Near Limit'}
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
                <div className={`h-1.5 rounded-full transition-all duration-1000 ${isDanger ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : isWarning ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'bg-teal-500'}`} style={{ width: `${pct}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetsManager;
