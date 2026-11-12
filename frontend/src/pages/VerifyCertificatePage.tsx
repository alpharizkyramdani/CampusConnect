import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Award, CheckCircle2, XCircle, Search, GraduationCap, ShieldCheck, Download } from 'lucide-react';

export const VerifyCertificatePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialHash = searchParams.get('hash') || searchParams.get('number') || '';
  const [query, setQuery] = useState(initialHash);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doVerify = async (hashToVerify: string) => {
    if (!hashToVerify.trim()) return;
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const res = await api.get(`/certificates/verify/${encodeURIComponent(hashToVerify.trim())}`);
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Certificate verification failed. Record not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialHash) {
      doVerify(initialHash);
    }
  }, [initialHash]);

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="font-extrabold text-2xl text-navy tracking-tight">CampusConnect</span>
        </Link>
        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-navy">
          Public Certificate Verification
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Verify digital certificate authenticity issued by accredited universities on CampusConnect
        </p>

        {/* Search Bar */}
        <div className="mt-8 flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Certificate Number (e.g. CERT-UIR-2025-0892) or verify hash"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
            />
          </div>
          <button
            onClick={() => doVerify(query)}
            disabled={loading}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand-600/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Verify'}
          </button>
        </div>

        {/* Verification Result Card */}
        {result && (
          <div className="mt-8 bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Cryptographically Verified Certificate
                </div>
                <h3 className="text-xl font-extrabold text-navy">{result.title}</h3>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider">Recipient Name</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{result.recipient_name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider">Certificate ID</span>
                <span className="text-sm font-mono font-bold text-brand-600 mt-0.5 block">{result.certificate_number}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider">Issuing University</span>
                <span className="text-sm font-bold text-slate-900 mt-0.5 block">{result.university_name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider">Date of Issue</span>
                <span className="text-sm font-semibold text-slate-700 mt-0.5 block">{result.issue_date}</span>
              </div>
              {result.event_name && (
                <div className="sm:col-span-2">
                  <span className="text-slate-400 font-semibold block uppercase tracking-wider">Event / Activity</span>
                  <span className="text-sm font-semibold text-slate-800 mt-0.5 block">{result.event_name}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="truncate max-w-[280px]">Hash: {result.verify_hash}</span>
              {result.file_url && (
                <a
                  href={result.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg font-bold flex items-center gap-1 hover:bg-brand-100"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF File
                </a>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-8 bg-white border-2 border-rose-400 rounded-3xl p-6 sm:p-8 shadow-xl text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                <XCircle className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Verification Error</div>
                <h3 className="text-lg font-bold text-slate-900">{error}</h3>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              The certificate identifier provided does not match any official academic certificate recorded in the CampusConnect national registry. Please check the spelling or ask the holder for the official QR code.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
