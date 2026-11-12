import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ServiceType, ServiceRequest } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  FileCheck2,
  Plus,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  Download,
} from 'lucide-react';

export const StudentServicesPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Submit Request Modal
  const [submitModalType, setSubmitModalType] = useState<ServiceType | null>(null);
  const [notes, setNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Admin Process Modal
  const [processModal, setProcessModal] = useState<ServiceRequest | null>(null);
  const [adminStatus, setAdminStatus] = useState<string>('completed');
  const [adminNotes, setAdminNotes] = useState('');
  const [resultDocUrl, setResultDocUrl] = useState('');
  const [updating, setUpdating] = useState(false);

  const isCampusAdmin = hasAnyRole(['super_admin', 'campus_admin']);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesRes, reqsRes] = await Promise.all([
        api.get('/service-types', { params: { university_id: activeAssignment?.university_id } }),
        api.get('/service-requests', { params: { university_id: activeAssignment?.university_id } }),
      ]);
      if (typesRes.data.success) setServiceTypes(typesRes.data.data || []);
      if (reqsRes.data.success) setRequests(reqsRes.data.data.data || reqsRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeAssignment]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalType) return;
    setSubmitting(true);

    try {
      const res = await api.post('/service-requests', {
        service_type_id: submitModalType.id,
        notes,
        attachment_url: attachmentUrl || null,
      });

      if (res.data.success) {
        setSubmitSuccess(true);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processModal) return;
    setUpdating(true);

    try {
      const res = await api.put(`/service-requests/${processModal.id}/status`, {
        status: adminStatus,
        admin_notes: adminNotes,
        result_document_url: resultDocUrl || null,
      });

      if (res.data.success) {
        setProcessModal(null);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update service request');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
          <FileCheck2 className="w-6 h-6 text-brand-600" />
          Centralized Student Services Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Apply for academic transcripts, student enrollment certificates, recommendation letters, and track document processing
        </p>
      </div>

      {/* Available Services Catalog */}
      <div>
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider mb-4">
          Available Institutional Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceTypes.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700">
                    {t.code}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ~{t.processing_days} days
                  </span>
                </div>
                <h3 className="font-bold text-sm text-navy">{t.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{t.description}</p>
                {t.requirements && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200/80">
                    <span className="font-bold text-slate-700 block mb-0.5">Requirements:</span>
                    <span className="whitespace-pre-line">{t.requirements}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSubmitModalType(t);
                    setSubmitSuccess(false);
                    setNotes('');
                  }}
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                >
                  Apply for this Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submitted Requests Tracking */}
      <div>
        <h2 className="text-sm font-bold text-navy uppercase tracking-wider mb-4">
          {isCampusAdmin ? 'All Campus Service Submissions' : 'My Service Requests Tracking'}
        </h2>
        <div className="bg-white rounded-2xl border border-borderMuted shadow-xs overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No service requests submitted yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Request #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Service Type</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-brand-600">{r.request_number}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{r.user?.name}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{r.serviceType?.name}</td>
                      <td className="py-3.5 px-4 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={r.status === 'completed' ? 'emerald' : r.status === 'rejected' ? 'rose' : r.status === 'processing' ? 'blue' : 'amber'}
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {isCampusAdmin && (
                          <button
                            onClick={() => {
                              setProcessModal(r);
                              setAdminStatus(r.status);
                              setAdminNotes(r.admin_notes || '');
                              setResultDocUrl(r.result_document_url || '');
                            }}
                            className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg"
                          >
                            Review / Update
                          </button>
                        )}
                        {!isCampusAdmin && r.result_document_url && (
                          <a
                            href={r.result_document_url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg inline-flex items-center gap-1 hover:bg-emerald-100"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </a>
                        )}
                        {!isCampusAdmin && !r.result_document_url && (
                          <span className="text-slate-400 text-[11px] italic">In Queue</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={!!submitModalType}
        onClose={() => setSubmitModalType(null)}
        title={submitSuccess ? 'Service Request Submitted' : `Submit Request: ${submitModalType?.name}`}
      >
        {submitSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy">Request Registered</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your administrative request has been dispatched to Academic Services. Estimated turnaround time is ~{submitModalType?.processing_days} business days.
            </p>
            <button
              onClick={() => setSubmitModalType(null)}
              className="mt-4 px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Application Notes & Purpose</label>
              <textarea
                required
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="State the purpose for this document (e.g. Exchange scholarship, visa application, parent health insurance)..."
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase">Required Document Attachment URL (Optional)</label>
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="Link to supporting documents if required..."
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </Modal>

      {/* Admin Process Modal */}
      <Modal
        isOpen={!!processModal}
        onClose={() => setProcessModal(null)}
        title={`Process Request: ${processModal?.request_number}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Request Status</label>
            <select
              value={adminStatus}
              onChange={(e) => setAdminStatus(e.target.value)}
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            >
              <option value="submitted">Submitted</option>
              <option value="processing">Processing in Registrar Office</option>
              <option value="completed">Completed / Document Issued</option>
              <option value="rejected">Rejected / Invalid Information</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Signed Result Document URL (PDF)</label>
            <input
              type="url"
              value={resultDocUrl}
              onChange={(e) => setResultDocUrl(e.target.value)}
              placeholder="Cloud storage link to stamped and signed document"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Administrator Remarks</label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Notes for student..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {updating ? 'Saving...' : 'Update Request Status'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
