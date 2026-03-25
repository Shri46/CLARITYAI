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
    <div className="max-w-md mx-auto mt-10 bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-slate-800 transform transition-all hover:shadow-teal-500/10">
      <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Manual Transaction</h2>
      <p className="text-slate-400 text-sm mb-8">Enter details below. Our AI will automatically categorize it for you.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date</label>
          <input type="date" required className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all [color-scheme:dark]" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
          <input type="text" required placeholder="e.g. Swiggy Food Delivery" className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder-slate-600" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount (₹)</label>
          <input type="number" step="0.01" required placeholder="-250.00" className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder-slate-600" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
          <p className="text-xs text-slate-500 mt-2 font-medium">Use negative for spending, positive for income.</p>
        </div>
        
        <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-teal-500 to-indigo-500 text-white font-bold py-3.5 rounded-xl hover:from-teal-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all shadow-lg hover:shadow-teal-500/25 disabled:opacity-50 flex justify-center items-center gap-2">
          {loading ? (
             <>
               <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               AI Categorizing...
             </>
          ) : 'Save & Categorize'}
        </button>
      </form>
    </div>
  );
};
export default ManualEntry;
