import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FacilityBorrowing } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  History,
  CheckCircle,
  XCircle,
  ArrowRight,
  PackageCheck,
  Calendar,
  User,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const BorrowingsPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [borrowings, setBorrowings] = useState<FacilityBorrowing[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Return modal
  const [returnModal, setReturnModal] = useState<FacilityBorrowing | null>(null);
  const [returnCondition, setReturnCondition] = useState<'excellent' | 'good' | 'fair' | 'damaged'>('good');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isDeptAdmin = hasAnyRole(['super_admin', 'campus_admin', 'department_admin']);

  const fetchBorrowings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/borrowings', {
        params: {
          department_id: isDeptAdmin ? activeAssignment?.department_id : undefined,
          status: selectedStatus || undefined,
          my_borrowings: !isDeptAdmin ? 'true' : undefined,
        },
      });
      if (res.data.success) {
        setBorrowings(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, [selectedStatus, activeAssignment]);

  const handleApprove = async (id: number) => {
    if (!window.confirm('Approve this equipment borrowing request?')) return;
    try {
      const res = await api.post(`/borrowings/${id}/approve`);
      if (res.data.success) {
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      const res = await api.post(`/borrowings/${id}/reject`, { admin_notes: reason });
      if (res.data.success) {
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleRecordPickup = async (id: number) => {
    if (!window.confirm('Record that the student has picked up the equipment in person?')) return;
    try {
      const res = await api.post(`/borrowings/${id}/pickup`);
      if (res.data.success) {
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Pickup record failed');
    }
  };

  const handleRecordReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModal) return;
    setActionLoading(true);

    try {
      const res = await api.post(`/borrowings/${returnModal.id}/return`, {
        return_condition: returnCondition,
        admin_notes: adminNotes,
      });

      if (res.data.success) {
        setReturnModal(null);
        setAdminNotes('');
        fetchBorrowings();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record return');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="emerald">Approved / Ready</Badge>;
      case 'borrowed':
        return <Badge variant="blue">Currently Borrowed</Badge>;
      case 'returned':
        return <Badge variant="slate">Returned</Badge>;
      case 'rejected':
        return <Badge variant="rose">Rejected</Badge>;
      case 'overdue':
        return <Badge variant="rose">Overdue</Badge>;
      case 'pending':
      default:
        return <Badge variant="amber">Pending Approval</Badge>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-brand-600" />
            Equipment Borrowing Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isDeptAdmin
              ? 'Evaluate student borrowing requests, record hardware pickups, and register returned condition.'
              : 'Track your personal equipment requests and loan return deadlines.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['', 'pending', 'approved', 'borrowed', 'returned'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedStatus === st ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'All Records' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Borrowings Table / Cards */}
      <div className="bg-white rounded-2xl border border-borderMuted shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading loan records...</div>
        ) : borrowings.length === 0 ? (
          <div className="p-12 text-center">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No borrowing records found</h3>
            <p className="text-xs text-slate-500 mt-1">New equipment requests will appear in this log.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Borrower</th>
                  <th className="py-3.5 px-4">Equipment</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {borrowings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{b.user?.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{b.user?.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy">{b.facility?.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{b.facility?.code}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{b.quantity}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>Borrow: {new Date(b.borrow_date).toLocaleDateString()}</div>
                      <div className="text-[11px] text-slate-400">Due: {new Date(b.return_due_date).toLocaleDateString()}</div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(b.status)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {isDeptAdmin && b.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(b.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(b.id)}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isDeptAdmin && b.status === 'approved' && (
                        <button
                          onClick={() => handleRecordPickup(b.id)}
                          className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                        >
                          Record Pickup
                        </button>
                      )}

                      {isDeptAdmin && b.status === 'borrowed' && (
                        <button
                          onClick={() => {
                            setReturnModal(b);
                            setReturnCondition('good');
                            setAdminNotes('');
                          }}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 inline-flex transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Record Return
                        </button>
                      )}

                      {!isDeptAdmin && (
                        <span className="text-slate-400 text-[11px] italic">
                          {b.status === 'pending' ? 'Under Review' : b.status === 'approved' ? 'Ready for Pickup' : 'Recorded'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Return Modal */}
      <Modal
        isOpen={!!returnModal}
        onClose={() => setReturnModal(null)}
        title={`Record Return: ${returnModal?.facility?.name}`}
      >
        <form onSubmit={handleRecordReturn} className="space-y-4 text-xs">
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 leading-relaxed">
            Recording this return will restore <strong>{returnModal?.quantity}</strong> unit(s) to the department's available stock.
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Inspected Return Condition</label>
            <select
              value={returnCondition}
              onChange={(e: any) => setReturnCondition(e.target.value)}
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            >
              <option value="excellent">Excellent — pristine shape</option>
              <option value="good">Good — normal usage</option>
              <option value="fair">Fair — minor cosmetic wear</option>
              <option value="damaged">Damaged — requires maintenance / repair</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Inspection Notes</label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="All cables, accessories, and kits accounted for..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {actionLoading ? 'Saving...' : 'Confirm Equipment Return'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
