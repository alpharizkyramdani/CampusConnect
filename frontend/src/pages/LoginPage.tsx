import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.data);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError('');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-navy tracking-tight">CampusConnect</span>
        </Link>
        <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-navy">
          Sign In to Your Campus Portal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Access your personalized university dashboard and services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-borderMuted sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.ac.id"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Fill */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Quick Test Accounts (Click to Fill)</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => fillDemoAccount('superadmin@campusconnect.id')}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200/80 transition-colors"
              >
                <div className="font-bold truncate">Super Admin</div>
                <div className="text-[10px] text-slate-500 truncate">Platform Level</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin.uir@campusconnect.id')}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200/80 transition-colors"
              >
                <div className="font-bold truncate">Campus Admin</div>
                <div className="text-[10px] text-slate-500 truncate">Univ. Indonesia Raya</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('dept.ti@uir.ac.id')}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200/80 transition-colors"
              >
                <div className="font-bold truncate">Dept Admin</div>
                <div className="text-[10px] text-slate-500 truncate">Informatics Lab</div>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('student.alex@uir.ac.id')}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-brand-50 hover:text-brand-700 border border-slate-200/80 transition-colors"
              >
                <div className="font-bold truncate">Student (Alex)</div>
                <div className="text-[10px] text-slate-500 truncate">Multi-role (Student+UKM)</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600 space-y-1.5">
            <div>
              New student?{' '}
              <Link to="/register-student" className="font-bold text-brand-600 hover:text-brand-700">
                Register Student Account
              </Link>
            </div>
            <div>
              Academic staff?{' '}
              <Link to="/register-lecturer" className="font-bold text-brand-600 hover:text-brand-700">
                Register Lecturer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
