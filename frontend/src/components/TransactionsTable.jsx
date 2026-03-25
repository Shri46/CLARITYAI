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
      <div className="flex flex-col sm:flex-row justify-between p-4 bg-gray-50 border-b border-gray-100 gap-4">
        <input 
          type="text" 
          placeholder="Search descriptions..." 
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm w-full sm:w-64 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="px-4 py-2 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm shadow-sm bg-slate-950/50 text-slate-200 cursor-pointer transition-colors"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className="px-4 py-2 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-sm shadow-sm bg-slate-950/50 text-slate-200 cursor-pointer transition-colors"
          value={sortRule}
          onChange={(e) => setSortRule(e.target.value)}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amt-desc">Highest Amount</option>
          <option value="amt-asc">Lowest Amount</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800/60">
          <thead className="bg-slate-900/50">
            <tr className="text-left text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-transparent">
            {filteredData.slice(0, 50).map(t => (
              <tr key={t._id || t.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                  {new Date(t.date || Date.now()).toLocaleDateString('en-GB')}
                </td>
                <td className="px-6 py-4 text-sm text-slate-200 font-medium max-w-xs truncate" title={t.description}>
                  {t.description || 'Unknown'}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${Number(t.amount) >= 0 ? 'text-teal-400' : 'text-slate-100'}`}>
                  ₹{Math.abs(Number(t.amount)).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits:2})}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {t.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {t.source === 'rules' || t.source === 'cache' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Rule
                    </span>
                  ) : t.source === 'gemini' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-sm">
                      ✨ AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-500 border border-slate-700">
                      Manual
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                   <button 
                     onClick={() => handleDelete(t._id || t.id)}
                     disabled={deletingId === (t._id || t.id)}
                     className="text-rose-500 hover:text-rose-400 font-medium text-xs disabled:opacity-50 transition-colors"
                   >
                     {deletingId === (t._id || t.id) ? 'Del...' : 'Delete'}
                   </button>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredData.length > 50 && (
          <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100">
            Showing first 50 transactions...
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsTable;
