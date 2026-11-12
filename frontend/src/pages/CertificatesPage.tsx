import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Certificate } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Award,
  Plus,
  ShieldCheck,
  Download,
  ExternalLink,
  QrCode,
  Calendar,
  Building,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const CertificatesPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // QR Modal
  const [qrModalCert, setQrModalCert] = useState<Certificate | null>(null);

  // Issue Certificate Modal (for Admin)
  const [issueModal, setIssueModal] = useState(false);
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState('');
  const [eventId, setEventId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [fileUrl, setFileUrl] = useState('');
  const [issuing, setIssuing] = useState(false);

  const canIssue = hasAnyRole(['super_admin', 'campus_admin', 'ukm_admin', 'ormawa_admin']);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/certificates');
      if (res.data.success) {
        setCertificates(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIssuing(true);
    try {
      const res = await api.post('/certificates/issue', {
        university_id: activeAssignment?.university_id || 1,
        user_id: parseInt(userId),
        event_id: eventId ? parseInt(eventId) : null,
        title,
        issue_date: issueDate,
        file_url: fileUrl || null,
      });

      if (res.data.success) {
        setIssueModal(false);
        setTitle('');
        fetchCertificates();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-brand-600" />
            Verified Digital Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-proof scholastic credentials, event participation certificates, and QR-verifiable authentications
          </p>
        </div>

        {canIssue && (
          <button
            onClick={() => setIssueModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Issue Certificate
          </button>
        )}
      </div>

      {/* Certificates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No certificates recorded yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Certificates are automatically awarded when you attend verified campus hackathons, workshops, or academic competitions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const verificationUrl = `${window.location.origin}/verify?hash=${cert.verify_hash}`;
            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border-2 border-slate-200 hover:border-brand-500 shadow-xs hover:shadow-xl transition-all p-6 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-brand-50 rounded-full -z-0 opacity-60" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
                      {cert.certificate_number}
                    </span>
                    <Badge variant="emerald" size="sm">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </Badge>
                  </div>

                  <h3 className="font-bold text-base text-navy leading-snug">{cert.title}</h3>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div>Recipient: <strong className="text-slate-900">{cert.recipient_name}</strong></div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      Issued on {new Date(cert.issue_date).toLocaleDateString()}
                    </div>
                    {cert.event && (
                      <div className="text-[11px] text-brand-600 font-semibold truncate">
                        Activity: {cert.event.title}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 relative z-10">
                  <button
                    onClick={() => setQrModalCert(cert)}
                    className="flex-1 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    Verify QR
                  </button>
                  {cert.file_url && (
                    <a
                      href={cert.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Verification Modal */}
      <Modal
        isOpen={!!qrModalCert}
        onClose={() => setQrModalCert(null)}
        title="Public Certificate QR Verification"
      >
        {qrModalCert && (
          <div className="text-center py-4 space-y-4">
            <div className="bg-canvas p-6 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <QRCodeSVG
                value={`${window.location.origin}/verify?hash=${qrModalCert.verify_hash}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <div>
              <div className="font-mono text-xs font-bold text-brand-600">{qrModalCert.certificate_number}</div>
              <h4 className="text-base font-bold text-navy mt-1">{qrModalCert.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Awarded to: {qrModalCert.recipient_name}</p>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Scanning this QR code opens CampusConnect's cryptographic verification registry confirming institutional seal and issue date.
            </p>
          </div>
        )}
      </Modal>

      {/* Issue Modal */}
      <Modal
        isOpen={issueModal}
        onClose={() => setIssueModal(false)}
        title="Issue Digital Academic Certificate"
      >
        <form onSubmit={handleIssue} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Recipient User ID</label>
            <input
              type="number"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 7 (Alex Chandra)"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Certificate Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best Developer — Annual Autonomous Hackathon"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Event ID (Optional)</label>
              <input
                type="number"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="e.g. 1"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Issue Date</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">PDF File Cloud Link (Optional)</label>
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={issuing}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {issuing ? 'Issuing...' : 'Generate and Cryptographically Seal Certificate'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

