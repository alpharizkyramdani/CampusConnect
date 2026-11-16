import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Modal } from '../components/ui/Modal';
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      const res = await api.post('/auth/reset-password', {
        email: resetEmail,
        new_password: resetNewPassword,
      });

      if (res.data.success) {
        setResetSuccess(res.data.message || 'Password reset successfully!');
        setPassword(resetNewPassword);
        setEmail(resetEmail);
      }
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Password reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

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
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError(`Gagal terhubung ke server backend (${api.defaults.baseURL}). Pastikan koneksi internet dan server backend aktif.`);
      } else {
        setError('Login gagal. Periksa kembali email dan password Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-13 h-13 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-slate-200/80 group-hover:scale-105 transition-transform">
            <img src="/images/pnl-logo.png" alt="PNL" className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl text-navy tracking-tight block">PNLConnect</span>
            <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider block -mt-0.5">
              Politeknik Negeri Lhokseumawe
            </span>
          </div>
        </Link>
        <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-navy">
          Masuk ke Portal Civitas PNL
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Ekosistem Digital Terpadu Politeknik Negeri Lhokseumawe
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
                Alamat Email
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
                  placeholder="nama@pnl.ac.id / nama@student.pnl.ac.id"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setResetModalOpen(true); setResetSuccess(''); setResetError(''); }}
                  className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
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
              {loading ? 'Memverifikasi...' : 'Masuk Portal Civitas'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600 space-y-2 border-t border-slate-100 pt-5">
            <div>
              Mahasiswa Baru / Belum ada akun?{' '}
              <Link to="/register?type=student" className="font-bold text-brand-600 hover:text-brand-700">
                Daftar Akun Mahasiswa
              </Link>
            </div>
            <div>
              Dosen atau Tenaga Pendidik?{' '}
              <Link to="/register?type=lecturer" className="font-bold text-brand-600 hover:text-brand-700">
                Daftar Akun Dosen PNL
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Password Portal"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-xs text-slate-500">
            Enter your registered university email and set a new password. Your account password will be updated directly.
          </p>

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resetSuccess}</span>
            </div>
          )}

          {resetError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{resetError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email</label>
            <input
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="e.g. mahasiswa@pnl.ac.id"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min. 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              value={resetNewPassword}
              onChange={(e) => setResetNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={resetLoading}
              className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {resetLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

