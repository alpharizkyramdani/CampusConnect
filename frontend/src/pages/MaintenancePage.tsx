import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { MaintenanceReport } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageUploadField } from '../components/ui/ImageUploadField';
import {
  Wrench,
  Plus,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';

export const MaintenancePage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [reports, setReports] = useState<MaintenanceReport[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [submitModal, setSubmitModal] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [priority, setPriority] = useState<string>('medium');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status Update Modal (for Admin / Sarpras)
  const [updateModal, setUpdateModal] = useState<MaintenanceReport | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [technicianNotes, setTechnicianNotes] = useState<string>('');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const canModerate = hasAnyRole(['super_admin', 'campus_admin', 'department_admin', 'sarpras_admin']);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/maintenance', {
        params: {
          university_id: activeAssignment?.university_id,
          status: selectedStatus || undefined,
        },
      });
      if (res.data.success) {
        setReports(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedStatus, activeAssignment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/maintenance', {
        university_id: activeAssignment?.university_id || 1,
        title,
        location,
        category,
        priority,
        description,
        photo_url: photoUrl || null,
      });

      if (res.data.success) {
        setSubmitModal(false);
        setTitle('');
        setLocation('');
        setDescription('');
        fetchReports();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateModal) return;
    setUpdating(true);

    try {
      const res = await api.put(`/maintenance/${updateModal.id}/status`, {
        status: newStatus,
        notes: resolutionNotes,
        resolution_notes: resolutionNotes,
        technician_notes: technicianNotes,
        completion_photo_url: completionPhotoUrl || null,
      });

      if (res.data.success) {
        setUpdateModal(null);
        fetchReports();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal memperbarui status perbaikan sarpras');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-brand-600" />
            Facility Maintenance & Damage Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Report broken laboratory appliances, electrical faults, HVAC leaks, and track physical repairs
          </p>
        </div>

        <button
          onClick={() => setSubmitModal(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Submit Damage Report
        </button>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-wrap gap-1.5">
        {['', 'submitted', 'under_review', 'assigned', 'in_progress', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              selectedStatus === st ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st === '' ? 'All Reports' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No active damage reports</h3>
          <p className="text-xs text-slate-500 mt-1">Campus facilities are in prime operational shape.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {r.photo_url && (
                  <div className="h-40 overflow-hidden bg-slate-100">
                    <img src={r.photo_url} alt={r.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                      {r.category}
                    </span>
                    <Badge variant={r.priority === 'critical' || r.priority === 'high' ? 'rose' : 'amber'} size="sm">
                      {r.priority}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-sm text-navy">{r.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{r.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {r.location}
                    </span>
                    <Badge variant={r.status === 'resolved' ? 'emerald' : r.status === 'in_progress' ? 'blue' : 'amber'} size="sm">
                      {r.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {r.resolution_notes && (
                    <div className="mt-2.5 p-2 bg-emerald-50 text-[11px] text-emerald-800 rounded-lg">
                      <strong>Resolution:</strong> {r.resolution_notes}
                    </div>
                  )}

                  {r.technician_notes && (
                    <div className="mt-2.5 p-2 bg-blue-50 text-[11px] text-blue-900 rounded-lg">
                      <strong>Catatan Teknisi Sarpras:</strong> {r.technician_notes}
                    </div>
                  )}

                  {r.completion_photo_url && (
                    <div className="mt-2 p-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                      <img src={r.completion_photo_url} alt="Foto Selesai" className="w-10 h-10 object-cover rounded-md" />
                      <span className="text-[10px] text-slate-500 font-medium">Foto Bukti Selesai Perbaikan</span>
                    </div>
                  )}
                </div>
              </div>

              {canModerate && (
                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setUpdateModal(r);
                      setNewStatus(r.status);
                      setResolutionNotes(r.resolution_notes || '');
                      setTechnicianNotes(r.technician_notes || '');
                      setCompletionPhotoUrl(r.completion_photo_url || '');
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                  >
                    Update Status & Tindak Lanjut Sarpras
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Report Modal */}
      <Modal
        isOpen={submitModal}
        onClose={() => setSubmitModal(false)}
        title="Report Facility Damage / Issue"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Issue Headline</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Broken projector mount in Hall C"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Facility Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="plumbing">Plumbing & Water</option>
                <option value="electrical">Electrical & Lighting</option>
                <option value="hvac">HVAC / Air Conditioning</option>
                <option value="furniture">Desks / Chairs / Furniture</option>
                <option value="structural">Doors / Windows / Wall</option>
                <option value="it_equipment">Lab Hardware / IT</option>
                <option value="other">Other Campus Facility</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Priority Severity</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical / Hazard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Exact Room / Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Building B, Floor 2, Room 204"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <ImageUploadField
            label="Foto Kerusakan / Kendala Fasilitas"
            value={photoUrl}
            onChange={setPhotoUrl}
            placeholder="Atau tautan URL foto kerusakan: https://..."
            helperText="Unggah foto bukti kerusakan atau kendala fasilitas dari HP atau laptop."
          />

          <div>
            <label className="font-bold text-slate-700 block uppercase">Detailed Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, hazards, and affected equipment..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {submitting ? 'Submitting...' : 'Submit Maintenance Ticket'}
          </button>
        </form>
      </Modal>

      {/* Admin Update Modal */}
      <Modal
        isOpen={!!updateModal}
        onClose={() => setUpdateModal(null)}
        title={`Update Report: ${updateModal?.title}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Resolution Lifecycle Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            >
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned to Field Technician</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved / Fixed</option>
              <option value="rejected">Rejected / Invalid</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Catatan Resolusi / Tindakan Admin</label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Deskripsi tindak lanjut atau disposisi tim lapangan..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Catatan Teknisi Sarpras (Spesifik Lapangan)</label>
            <textarea
              rows={2}
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="Pengecekan komponen, penggantian suku cadang, atau uji coba operasional..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Foto Bukti Selesai Perbaikan (URL / Path)</label>
            <input
              type="text"
              value={completionPhotoUrl}
              onChange={(e) => setCompletionPhotoUrl(e.target.value)}
              placeholder="https://... atau uploads/maintenance/fixed_01.jpg"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            {updating ? 'Menyimpan...' : 'Simpan Pembaruan Sarpras'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

