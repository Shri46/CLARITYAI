import React, { useMemo } from 'react';

const SUBSCRIPTION_KEYWORDS = ['netflix', 'spotify', 'amazon', 'hotstar', 'youtube', 'gym', 'apple', 'google', 'cloud', 'hosting', 'canva', 'adobe', 'prime', 'jio', 'airtel'];

const SubscriptionsTracker = ({ transactions }) => {
  const subscriptions = useMemo(() => {
    const subs = [];
    const seen = new Set();
    
    transactions.forEach(t => {
      const desc = (t.description || '').toLowerCase();
      
      const isSub = SUBSCRIPTION_KEYWORDS.some(k => desc.includes(k));
      if (isSub && t.amount < 0) { 
        const keyword = SUBSCRIPTION_KEYWORDS.find(k => desc.includes(k));
        if (!seen.has(keyword)) {
          seen.add(keyword);
          subs.push({
            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            amount: Math.abs(t.amount),
            date: t.date 
          });
        }
      }
    });
    return subs.sort((a,b) => b.amount - a.amount);
  }, [transactions]);

  const total = subscriptions.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800 h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Subscriptions</h3>
          <p className="text-sm text-slate-400 mt-1">Monthly recurring</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
          <span className="font-bold text-rose-400">₹{total.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[220px]">
        {subscriptions.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm">No active subscriptions detected.</div>
        ) : subscriptions.map((s, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold uppercase group-hover:bg-slate-700 transition-colors shadow-inner">
                {s.name.substring(0,2)}
              </div>
              <div>
                <span className="text-slate-200 font-medium capitalize block">{s.name}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Auto-Debit</span>
              </div>
            </div>
            <span className="text-slate-300 font-bold">₹{s.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsTracker;
