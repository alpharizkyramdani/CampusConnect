import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Facility, FacilityCategory } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  PackageCheck,
  Search,
  Plus,
  MapPin,
  CheckCircle,
  AlertTriangle,
  History,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacilitiesPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [categories, setCategories] = useState<FacilityCategory[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [loading, setLoading] = useState(true);

  // Borrow Modal
  const [borrowModal, setBorrowModal] = useState<Facility | null>(null);
  const [borrowQty, setBorrowQty] = useState('1');
  const [borrowPurpose, setBorrowPurpose] = useState('');
  const [borrowDate, setBorrowDate] = useState('');
  const [returnDueDate, setReturnDueDate] = useState('');
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [borrowLoading, setBorrowLoading] = useState(false);

  // Add Equipment Modal (Department Admin)
  const [addModal, setAddModal] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'damaged' | 'in_repair'>('good');
  const [totalQty, setTotalQty] = useState('1');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const canManageInventory = hasAnyRole(['super_admin', 'campus_admin', 'department_admin']);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await api.get('/facilities', {
        params: {
          university_id: activeAssignment?.university_id,
          department_id: activeAssignment?.department_id,
          condition: selectedCondition || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setFacilities(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [selectedCondition, activeAssignment]);

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowModal) return;
    setBorrowLoading(true);

    try {
      const res = await api.post('/borrowings', {
        facility_id: borrowModal.id,
        quantity: parseInt(borrowQty),
        purpose: borrowPurpose,
        borrow_date: borrowDate,
        return_due_date: returnDueDate,
      });

      if (res.data.success) {
        setBorrowSuccess(true);
        fetchFacilities();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit borrowing request');
    } finally {
      setBorrowLoading(false);
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/facilities', {
        university_id: activeAssignment?.university_id || 1,
        department_id: activeAssignment?.department_id || 1,
        name,
        code,
        condition,
        total_quantity: parseInt(totalQty),
        location,
        description,
        photo_url: photoUrl || null,
      });

      if (res.data.success) {
        setAddModal(false);
        setName('');
        setCode('');
        fetchFacilities();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add equipment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <PackageCheck className="w-6 h-6 text-brand-600" />
            Campus Facility & Equipment Inventory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department-owned laboratory equipment, hardware kits, presentation media, and loan requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/borrowings"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <History className="w-4 h-4 text-slate-600" />
            Loan Queue
          </Link>

          {canManageInventory && (
            <button
              onClick={() => setAddModal(true)}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchFacilities()}
            placeholder="Search equipment by name or code..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['', 'excellent', 'good', 'fair', 'in_repair'].map((cond) => (
            <button
              key={cond}
              onClick={() => setSelectedCondition(cond)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                selectedCondition === cond ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cond === '' ? 'All Conditions' : cond.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : facilities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No inventory records available</h3>
          <p className="text-xs text-slate-500 mt-1">Try broadening your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac) => {
            const isAvailable = fac.available_quantity > 0;
            return (
              <div
                key={fac.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden bg-slate-100 relative">
                    <img
                      src={fac.photo_url || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80'}
                      alt={fac.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-navy text-white shadow-xs">
                        {fac.code}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant={fac.condition === 'excellent' || fac.condition === 'good' ? 'emerald' : 'amber'} size="sm">
                        {fac.condition}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider mb-1">
                      {fac.department?.name || 'Department Hardware'}
                    </div>
                    <h3 className="font-bold text-sm text-navy line-clamp-1">{fac.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{fac.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" /> Location
                        </span>
                        <span className="font-semibold text-slate-800">{fac.location || 'Lab Building'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Availability</span>
                        <span className="font-bold">
                          <span className={isAvailable ? 'text-emerald-600' : 'text-rose-600'}>
                            {fac.available_quantity}
                          </span>{' '}
                          / {fac.total_quantity} units
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => {
                      setBorrowModal(fac);
                      setBorrowSuccess(false);
                    }}
                    disabled={!isAvailable}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isAvailable
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" />
                    {isAvailable ? 'Submit Borrow Request' : 'Currently Unavailable'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Borrow Request Modal */}
      <Modal
        isOpen={!!borrowModal}
        onClose={() => setBorrowModal(null)}
        title={borrowSuccess ? 'Borrow Request Submitted' : `Borrow Equipment: ${borrowModal?.name}`}
      >
        {borrowSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy">Request Received</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your borrowing application has been routed to the Department Administrator for review. You will receive an approval notification when ready for pickup.
            </p>
            <button
              onClick={() => setBorrowModal(null)}
              className="mt-4 px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleBorrowSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 leading-relaxed">
              <strong>Concurrency Protection:</strong> Department Admin approval is required before pickup. Available stock: <strong>{borrowModal?.available_quantity}</strong> units.
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase">Requested Quantity</label>
              <input
                type="number"
                min="1"
                max={borrowModal?.available_quantity || 1}
                required
                value={borrowQty}
                onChange={(e) => setBorrowQty(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block uppercase">Borrow Date</label>
                <input
                  type="date"
                  required
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block uppercase">Return Due Date</label>
                <input
                  type="date"
                  required
                  value={returnDueDate}
                  onChange={(e) => setReturnDueDate(e.target.value)}
                  className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase">Academic Purpose & Usage Details</label>
              <textarea
                required
                rows={3}
                value={borrowPurpose}
                onChange={(e) => setBorrowPurpose(e.target.value)}
                placeholder="State the capstone project, lab course, or student organization activity..."
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={borrowLoading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              {borrowLoading ? 'Submitting Request...' : 'Submit Request to Department Admin'}
            </button>
          </form>
        )}
      </Modal>

      {/* Add Equipment Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Add Equipment to Department Inventory"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Equipment Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raspberry Pi 5 Embedded Developer Kit"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Equipment Asset Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. TI-RPI-05"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Total Quantity</label>
              <input
                type="number"
                min="1"
                required
                value={totalQty}
                onChange={(e) => setTotalQty(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Condition</label>
              <select
                value={condition}
                onChange={(e: any) => setCondition(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="in_repair">In Repair</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Lab / Storage Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lab Hardware Room 204"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Photo URL</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Specifications & Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hardware details, accessories included..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {saving ? 'Adding...' : 'Save Equipment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

