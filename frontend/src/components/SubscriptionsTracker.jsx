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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 h-full flex flex-col">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recurring Subscriptions</h3>
          <p className="text-xs text-slate-500 mt-0.5">Estimated auto-debits</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
          <span className="font-bold text-xs text-rose-700">₹{total.toLocaleString()}/mo</span>
        </div>
      </div>
      
      <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[220px]">
        {subscriptions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">No recurring subscriptions detected.</div>
        ) : subscriptions.map((s, idx) => (
          <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50/70 rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 text-xs font-bold uppercase shadow-2xs">
                {s.name.substring(0,2)}
              </div>
              <div>
                <span className="text-slate-900 text-xs font-bold capitalize block">{s.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">Recurring</span>
              </div>
            </div>
            <span className="text-slate-900 text-xs font-bold">₹{s.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsTracker;
