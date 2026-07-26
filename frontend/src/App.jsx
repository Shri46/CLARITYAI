import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import ManualEntry from './components/ManualEntry';
import Login from './components/Login';
import Register from './components/Register';
import ClarityAILogo from './components/ClarityAILogo';
import { getTransactions } from './api';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const loadData = async () => {
    if (!authUser) return;
    try {
      const txs = await getTransactions();
      let rules = 0, ai = 0;
      txs.forEach(t => {
        if (t.source === 'rules' || t.source === 'cache') rules++;
        if (t.source === 'gemini') ai++;
      });
      setAnalysisData({
        transactions: txs,
        stats: {
          total: txs.length,
          rules,
          ai,
          rules_percentage: Math.round((rules/txs.length)*100)||0,
          ai_percentage: Math.round((ai/txs.length)*100)||0
        }
      });
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (authUser) loadData();
    else setAnalysisData(null);
  }, [authUser]);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    setAuthUser(null);
    setAnalysisData(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-500/20">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <ClarityAILogo className="w-10 h-10 transform group-hover:scale-105 transition-transform duration-300" />
              <div className="flex flex-col">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">Clarity<span className="text-blue-600">AI</span></h1>
                <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">AI Powered Finance</span>
              </div>
            </Link>
            {authUser && (
              <nav className="flex gap-4 items-center">
                <Link to="/manual" className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-3.5 py-2 rounded-xl hover:bg-teal-100 transition-all font-semibold flex items-center gap-1.5 shadow-sm">
                  <span className="text-base leading-none text-teal-600">+</span> Quick Entry
                </Link>
                <Link to="/" className="text-sm text-slate-600 hover:text-teal-700 font-medium transition-colors">Upload</Link>
                <Link to="/dashboard" className="text-sm text-slate-600 hover:text-teal-700 font-medium transition-colors">Dashboard</Link>
                <div className="h-5 w-px bg-slate-200 mx-1"></div>
                <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-rose-600 font-medium transition-colors">Logout</button>
              </nav>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
          
          <Routes>
            <Route path="/login" element={!authUser ? <Login setAuthUser={setAuthUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!authUser ? <Register setAuthUser={setAuthUser} /> : <Navigate to="/" />} />
            <Route path="/" element={authUser ? <Upload onUploadSuccess={loadData} /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={authUser ? <Dashboard data={analysisData} refreshData={loadData} /> : <Navigate to="/login" />} />
            <Route path="/manual" element={authUser ? <ManualEntry onComplete={loadData} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        
        <footer className="bg-white py-6 text-center text-slate-400 text-xs border-t border-slate-200">
          &copy; 2026 ClarityAI. Premium Financial Intelligence Platform.
        </footer>
      </div>
    </Router>
  );
}

export default App;
