import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';

const Register = ({ setAuthUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await registerUser({ name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setAuthUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans text-slate-200">
      <div className="absolute inset-0 bg-gradient-to-tl from-indigo-900/20 via-slate-950 to-teal-900/20 z-0"></div>
      
      <div className="relative z-10 w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-lg shadow-teal-500/30 mb-4">
            C
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-2 text-sm">Join ClarityAI to track your finances.</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <input type="text" required className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder-slate-600" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" required className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder-slate-600" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input type="password" required className="w-full bg-slate-950/50 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder-slate-600" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-bold py-3.5 rounded-xl hover:from-indigo-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all shadow-lg hover:shadow-teal-500/25 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-teal-400 font-semibold hover:text-teal-300 transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
