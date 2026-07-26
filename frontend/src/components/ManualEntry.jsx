import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addManualTransaction } from '../api';

const ManualEntry = ({ onComplete }) => {
  const [formData, setFormData] = useState({ date: '', description: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addManualTransaction({
        date: formData.date,
        description: formData.description,
        amount: Number(formData.amount)
      });
      if (onComplete) onComplete();
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to add transaction. Check console for details.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-6 bg-white border border-slate-200/80 p-8 rounded-2xl shadow-xl shadow-slate-200/50">
      <div className="text-center mb-6">
        <div className="w-10 h-10 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-center text-teal-700 text-xl mx-auto mb-2.5">
          ✏️
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Add Transaction</h2>
        <p className="text-slate-500 text-xs mt-1">Enter transaction details. ClarityAI will categorize it automatically.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Date</label>
          <input type="date" required className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 transition-all text-sm" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
          <input type="text" required placeholder="e.g. Swiggy Food Delivery" className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 transition-all text-sm placeholder-slate-400" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Amount (₹)</label>
          <input type="number" step="0.01" required placeholder="-250.00" className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 transition-all text-sm placeholder-slate-400" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          <p className="text-[11px] text-slate-400 mt-1.5 font-medium">Negative (-) for spending, positive (+) for income.</p>
        </div>
        
        <button type="submit" disabled={loading} className="w-full mt-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-blue-700/15 text-sm disabled:opacity-50 flex justify-center items-center gap-2">
          {loading ? (
             <>
               <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Categorizing...
             </>
          ) : 'Save & Categorize'}
        </button>
      </form>
    </div>
  );
};
export default ManualEntry;
