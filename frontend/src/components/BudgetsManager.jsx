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

  if (loading) return <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 animate-pulse h-64"></div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 h-full">
      <h3 className="text-base font-bold text-slate-900 mb-5">Monthly Budgets</h3>
      
      <form onSubmit={handleAddBudget} className="flex gap-3 mb-5">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 flex-1 font-medium cursor-pointer">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" placeholder="₹ Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 w-28 placeholder-slate-400 font-medium" />
        <button type="submit" className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-xl font-semibold text-xs transition-colors shadow-sm">Set</button>
      </form>

      <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
        {budgets.length === 0 ? (
           <div className="text-center py-8 text-slate-400 text-xs font-medium">No active category budgets set.</div>
        ) : budgets.map(b => {
          const spent = (catTotals && catTotals[b.category]) || 0;
          const pct = Math.min((spent / b.amount) * 100, 100);
          const isWarning = pct >= 90;
          const isDanger = pct >= 100;
          
          return (
            <div key={b._id} className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70 relative group hover:border-slate-300 transition-colors">
              <button onClick={() => handleDelete(b._id)} className="absolute top-3.5 right-3 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Budget">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <div className="flex justify-between items-end mb-2 pr-6">
                <div>
                  <h4 className="text-slate-900 font-bold text-xs">{b.category}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    <span className={isDanger ? 'text-rose-600 font-bold' : 'text-slate-800 font-medium'}>₹{spent.toLocaleString()}</span> 
                    {' '}/ ₹{b.amount.toLocaleString()}
                  </p>
                </div>
                {isWarning && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isDanger ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                    {isDanger ? 'Exceeded' : 'Near Limit'}
                  </span>
                )}
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                <div className={`h-1.5 rounded-full transition-all duration-1000 ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-teal-600'}`} style={{ width: `${pct}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetsManager;
