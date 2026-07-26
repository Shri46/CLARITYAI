import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api';
import ClarityAILogo from './ClarityAILogo';

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
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 sm:p-10 rounded-2xl shadow-xl shadow-slate-200/50">
        <div className="text-center mb-8">
          <ClarityAILogo className="w-14 h-14 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 mt-1.5 text-xs">Join ClarityAI to track and optimize your wealth</p>
        </div>

        {error && <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs text-center font-medium">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4 text-left">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
            <input type="text" required className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 transition-all text-sm placeholder-slate-400" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
            <input type="email" required className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 transition-all text-sm placeholder-slate-400" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
            <input type="password" required className="w-full bg-slate-50 border border-slate-300 text-slate-900 px-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-700/30 focus:border-teal-700 transition-all text-sm placeholder-slate-400" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" disabled={loading} className="w-full mt-3 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-blue-700/15 text-sm disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-slate-500">
          Already have an account? <Link to="/login" className="text-teal-700 font-bold hover:text-teal-800 transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
