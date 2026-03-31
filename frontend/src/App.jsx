import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Upload from './components/Upload';
import Dashboard from './components/Dashboard';
import ManualEntry from './components/ManualEntry';
import Login from './components/Login';
import Register from './components/Register';
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
      <div className="min-h-screen bg-slate-950 flex flex-col font-sans selection:bg-teal-500/30">
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-tr from-teal-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                C
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">ClarityAI</h1>
            </Link>
            {authUser && (
              <nav className="flex gap-6 items-center">
                <Link to="/manual" className="text-sm bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-500/20 text-teal-400 px-4 py-2 rounded-xl hover:from-teal-500/20 hover:to-indigo-500/20 transition-all font-medium flex items-center gap-2">
                  <span className="text-lg leading-none">+</span> Manual
                </Link>
                <Link to="/" className="text-slate-400 hover:text-teal-400 font-medium transition-colors">Upload</Link>
                <Link to="/dashboard" className="text-slate-400 hover:text-teal-400 font-medium transition-colors">Dashboard</Link>
                <div className="h-6 w-px bg-slate-800 mx-2"></div>
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 font-medium transition-colors text-sm">Logout</button>
              </nav>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
          <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none"></div>
          
          <Routes>
            <Route path="/login" element={!authUser ? <Login setAuthUser={setAuthUser} /> : <Navigate to="/" />} />
            <Route path="/register" element={!authUser ? <Register setAuthUser={setAuthUser} /> : <Navigate to="/" />} />
            <Route path="/" element={authUser ? <Upload onUploadSuccess={loadData} /> : <Navigate to="/login" />} />
            <Route path="/dashboard" element={authUser ? <Dashboard data={analysisData} refreshData={loadData} /> : <Navigate to="/login" />} />
            <Route path="/manual" element={authUser ? <ManualEntry onComplete={loadData} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        
        <footer className="bg-slate-950 py-8 text-center text-slate-500 text-sm border-t border-slate-900/50">
          &copy; 2026 ClarityAI. Powered by Hybrid Intelligence.
        </footer>
      </div>
    </Router>
  );
}

export default App;
