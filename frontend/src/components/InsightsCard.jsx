import React, { useState } from 'react';
import { getInsights } from '../api';

const InsightsCard = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await getInsights();
      setInsights(data.insights);
    } catch (err) {
      console.error("Failed to load insights", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-indigo-500/20 h-full flex flex-col relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
           <span className="text-xl">✨</span>
           <h3 className="text-lg font-bold text-indigo-100">AI Spending Analysis</h3>
        </div>
        {!insights && !loading && (
          <button onClick={fetchInsights} className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-4 py-1.5 rounded-xl text-sm font-bold transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            Analyze
          </button>
        )}
      </div>

      <div className="flex-1 relative z-10 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg className="animate-spin h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-indigo-300/70 text-sm font-medium animate-pulse">Gemini is studying your habits...</p>
          </div>
        ) : insights ? (
          <ul className="space-y-4">
            {insights.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                <span className="text-indigo-400 mt-1 flex-shrink-0">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 text-sm text-center">Click analyze to get 3 plain-English insights about your spending behaviors mapped directly by Google Gemini.</p>
        )}
      </div>
    </div>
  );
};

export default InsightsCard;
