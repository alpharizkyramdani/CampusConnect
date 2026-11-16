import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Building2, GraduationCap, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';

export const UniversityRegisterPage: React.FC = () => {
  const [universityName, setUniversityName] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register-university', {
        university_name: universityName,
        email,
        website,
        address,
        contact_person: contactPerson,
        contact_phone: contactPhone,
        document_url: documentUrl,
      });

      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit university registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-slate-200/80">
            <img src="/images/pnl-logo.png" alt="PNL" className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>
          <span className="font-extrabold text-2xl text-navy tracking-tight">PNLConnect</span>
        </Link>
        <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-navy">
          Register Your University Institution
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">
          Submit institutional credentials for verification. Approved universities gain full administrative tenancy on CampusConnect.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-borderMuted sm:px-10">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Application Submitted Successfully</h3>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
                Your institutional verification request for <strong className="text-navy">{universityName}</strong> has been received. Our Platform Super Admin team will verify your accreditation documents within 1-2 business days.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  to="/"
                  className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-brand-700 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Official University Name
                </label>
                <input
                  type="text"
                  required
                  value={universityName}
                  onChange={(e) => setUniversityName(e.target.value)}
                  placeholder="e.g. Universitas Gadjah Mandiri"
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Institutional Email (.ac.id / .edu)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rectorate@ugm.ac.id"
                    className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://ugm.ac.id"
                    className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Campus Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Official campus postal address, province, city"
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Authorized Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Vice Rector / IT Director"
                    className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Accreditation / Decree Document Link
                </label>
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="Google Drive or cloud link to Ministry of Education accreditation decree"
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting Application...' : 'Submit University Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

