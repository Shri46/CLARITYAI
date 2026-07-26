import React, { useState } from 'react';
import { deleteTransaction } from '../api';

const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Bills & Utilities", 
  "Entertainment", "Health", "Finance", "Education", "Travel", 
  "Income", "Transfer", "Other"
];

const TransactionsTable = ({ transactions, refreshData }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortRule, setSortRule] = useState('date-desc');
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setDeletingId(id);
      try {
        await deleteTransaction(id);
        if (refreshData) refreshData();
      } catch (err) {
        alert('Failed to delete');
      }
      setDeletingId(null);
    }
  };

  const filteredData = [...transactions].filter(t => {
    if (filter !== 'All' && t.category !== filter) return false;
    if (searchTerm && !t.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sortRule === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (sortRule === 'date-asc')  return new Date(a.date) - new Date(b.date);
    if (sortRule === 'amt-desc')  return Math.abs(Number(b.amount)) - Math.abs(Number(a.amount));
    if (sortRule === 'amt-asc')   return Math.abs(Number(a.amount)) - Math.abs(Number(b.amount));
    return 0;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between p-4 bg-slate-50 border-b border-slate-200 gap-3">
        <input 
          type="text" 
          placeholder="Search transactions..." 
          className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 text-xs w-full sm:w-64 shadow-2xs text-slate-900 placeholder-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 text-xs shadow-2xs text-slate-700 font-medium cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 text-xs shadow-2xs text-slate-700 font-medium cursor-pointer"
            value={sortRule}
            onChange={(e) => setSortRule(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amt-desc">Highest Amount</option>
            <option value="amt-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80">
          <thead className="bg-slate-50/80">
            <tr className="text-left text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              <th className="px-6 py-3.5">Date</th>
              <th className="px-6 py-3.5">Description</th>
              <th className="px-6 py-3.5 text-right">Amount</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Source</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredData.slice(0, 50).map(t => (
              <tr key={t._id || t.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-6 py-3.5 whitespace-nowrap text-xs text-slate-500 font-medium">
                  {new Date(t.date || Date.now()).toLocaleDateString('en-GB')}
                </td>
                <td className="px-6 py-3.5 text-xs text-slate-900 font-semibold max-w-xs truncate" title={t.description}>
                  {t.description || 'Unknown'}
                </td>
                <td className={`px-6 py-3.5 whitespace-nowrap text-xs text-right font-bold ${Number(t.amount) >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                  ₹{Math.abs(Number(t.amount)).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                </td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-3.5">
                  {t.source === 'rules' || t.source === 'cache' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Rule
                    </span>
                  ) : t.source === 'gemini' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      ✨ AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-semibold text-slate-400 border border-slate-200">
                      Manual
                    </span>
                  )}
                </td>
                <td className="px-6 py-3.5 text-right">
                   <button 
                     onClick={() => handleDelete(t._id || t.id)}
                     disabled={deletingId === (t._id || t.id)}
                     className="text-rose-600 hover:text-rose-800 font-semibold text-xs disabled:opacity-50 transition-colors"
                   >
                     {deletingId === (t._id || t.id) ? 'Deleting...' : 'Delete'}
                   </button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs">
                  No transactions found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredData.length > 50 && (
          <div className="p-3 text-center text-xs text-slate-400 border-t border-slate-100 bg-slate-50/50 font-medium">
            Showing first 50 transactions...
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;
