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
    <div className="bg-gradient-to-br from-indigo-50/90 via-white to-teal-50/50 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-indigo-100 h-full flex flex-col relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-2">
           <span className="text-xl">✨</span>
           <h3 className="text-base font-bold text-slate-900">AI Financial Insights</h3>
        </div>
        {!insights && !loading && (
          <button onClick={fetchInsights} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm">
            Analyze
          </button>
        )}
      </div>

      <div className="flex-1 relative z-10 flex flex-col justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <svg className="animate-spin h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-indigo-900/80 text-xs font-semibold animate-pulse">Gemini is studying your habits...</p>
          </div>
        ) : insights ? (
          <ul className="space-y-3.5">
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
          <p className="text-slate-500 text-xs text-center leading-relaxed">Click analyze to generate 3 smart plain-English insights about your spending behaviors powered by Google Gemini.</p>
        )}
      </div>
    </div>
  );
};

export default InsightsCard;
