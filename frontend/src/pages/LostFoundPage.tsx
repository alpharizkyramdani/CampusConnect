import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { LostFoundItem, ItemClaim } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

export const LostFoundPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Post Item Modal
  const [postModal, setPostModal] = useState(false);
  const [type, setType] = useState<'lost' | 'found'>('lost');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Claim Modal
  const [claimItem, setClaimItem] = useState<LostFoundItem | null>(null);
  const [proofDescription, setProofDescription] = useState('');
  const [proofPhotoUrl, setProofPhotoUrl] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Review Claims Modal (Admin)
  const [reviewModalItem, setReviewModalItem] = useState<LostFoundItem | null>(null);
  const [claimsList, setClaimsList] = useState<ItemClaim[]>([]);
  const [claimsLoading, setClaimsLoading] = useState(false);

  const canModerate = hasAnyRole(['super_admin', 'campus_admin']);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/lost-found', {
        params: {
          university_id: activeAssignment?.university_id,
          type: selectedType || undefined,
          category: selectedCategory || undefined,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setItems(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedType, selectedCategory, activeAssignment]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/lost-found', {
        university_id: activeAssignment?.university_id || 1,
        type,
        title,
        category,
        description,
        location,
        event_date: eventDate,
        photo_url: photoUrl || null,
        contact_info: contactInfo || null,
      });

      if (res.data.success) {
        setPostModal(false);
        setTitle('');
        setDescription('');
        setLocation('');
        fetchItems();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimItem) return;
    setClaiming(true);

    try {
      const res = await api.post(`/lost-found/${claimItem.id}/claim`, {
        proof_description: proofDescription,
        proof_photo_url: proofPhotoUrl || null,
      });

      if (res.data.success) {
        setClaimSuccess(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setClaiming(false);
    }
  };

  const openClaimsReview = async (item: LostFoundItem) => {
    setReviewModalItem(item);
    setClaimsLoading(true);
    try {
      const res = await api.get(`/lost-found/${item.id}/claims`);
      if (res.data.success) {
        setClaimsList(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaimsLoading(false);
    }
  };

  const handleReviewClaimAction = async (claimId: number, status: 'approved' | 'rejected') => {
    try {
      const res = await api.post(`/claims/${claimId}/review`, { status });
      if (res.data.success) {
        if (reviewModalItem) openClaimsReview(reviewModalItem);
        fetchItems();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Review action failed');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <Search className="w-6 h-6 text-brand-600" />
            Campus Lost & Found Bulletin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Reconnecting students with misplaced laptops, IDs, wallets, keys, and accessories across campus grounds
          </p>
        </div>

        <button
          onClick={() => setPostModal(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Post Lost / Found Item
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedType === '' ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedType('lost')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedType === 'lost' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Lost Items
          </button>
          <button
            onClick={() => setSelectedType('found')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              selectedType === 'found' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Found Items
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
            placeholder="Search items by keywords..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-borderMuted">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No items found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later or post your item notice.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <div
              key={it.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-44 overflow-hidden bg-slate-100 relative">
                  <img
                    src={it.photo_url || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'}
                    alt={it.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shadow-xs ${
                        it.type === 'lost' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                      }`}
                    >
                      {it.type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={it.status === 'claimed' || it.status === 'resolved' ? 'emerald' : 'blue'} size="sm">
                      {it.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block mb-1">
                    {it.category}
                  </span>
                  <h3 className="font-bold text-sm text-navy line-clamp-1">{it.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{it.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{it.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{it.event_date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex gap-2">
                {it.type === 'found' && it.status === 'open' && (
                  <button
                    onClick={() => {
                      setClaimItem(it);
                      setClaimSuccess(false);
                      setProofDescription('');
                    }}
                    className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    Claim This Item
                  </button>
                )}

                {canModerate && (
                  <button
                    onClick={() => openClaimsReview(it)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Claims ({it.claims_count || 0})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <Modal
        isOpen={postModal}
        onClose={() => setPostModal(false)}
        title="Post Lost or Found Bulletin"
      >
        <form onSubmit={handlePostSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Post Type</label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="lost">I Lost Something</option>
                <option value="found">I Found Something</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Item Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              >
                <option value="electronics">Electronics (Laptop, Phone, Charger)</option>
                <option value="documents">Documents & Student ID Cards</option>
                <option value="keys">Keys & Access Cards</option>
                <option value="clothing">Jackets & Clothing</option>
                <option value="bags">Backpacks & Wallets</option>
                <option value="other">Other Campus Articles</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Item Title / Summary</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Silver iPad Air with green magnetic folio"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase">Campus Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Library 2nd Floor, Hall B"
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase">Date Lost / Found</label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
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
            <label className="font-bold text-slate-700 block uppercase">Detailed Description & Distinctive Marks</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Color, brand, keychains, stickers, or serial number cues..."
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {submitting ? 'Publishing...' : 'Publish Bulletin Entry'}
          </button>
        </form>
      </Modal>

      {/* Claim Item Modal */}
      <Modal
        isOpen={!!claimItem}
        onClose={() => setClaimItem(null)}
        title={claimSuccess ? 'Claim Submitted' : `Claim Item: ${claimItem?.title}`}
      >
        {claimSuccess ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-navy">Ownership Claim Submitted</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Campus Security & Administration will verify your proof description. You will be contacted once verified to collect the item.
            </p>
            <button
              onClick={() => setClaimItem(null)}
              className="mt-4 px-6 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleClaimSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 leading-relaxed">
              <strong>Private Verification:</strong> To protect student privacy, your proof of ownership is visible only to campus administrators and will not be displayed on public bulletin boards.
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase">Proof of Ownership Description</label>
              <textarea
                required
                rows={4}
                value={proofDescription}
                onChange={(e) => setProofDescription(e.target.value)}
                placeholder="Specify private identifiers (e.g. lockscreen wallpaper, stickers, contents inside wallet, serial number)..."
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase">Proof Photo Link (Purchase receipt, matching box)</label>
              <input
                type="url"
                value={proofPhotoUrl}
                onChange={(e) => setProofPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={claiming}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
            >
              {claiming ? 'Submitting...' : 'Submit Proof of Ownership'}
            </button>
          </form>
        )}
      </Modal>

      {/* Admin Claims Review Modal */}
      <Modal
        isOpen={!!reviewModalItem}
        onClose={() => setReviewModalItem(null)}
        title={`Review Claims for: ${reviewModalItem?.title}`}
        maxWidth="xl"
      >
        <div className="space-y-4 text-xs">
          {claimsLoading ? (
            <div className="text-center py-6 text-slate-400">Loading claims...</div>
          ) : claimsList.length === 0 ? (
            <div className="text-center py-6 text-slate-400">No student claims submitted yet for this item.</div>
          ) : (
            claimsList.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{c.user?.name} ({c.user?.email})</div>
                  <Badge variant={c.status === 'approved' ? 'emerald' : c.status === 'rejected' ? 'rose' : 'amber'}>
                    {c.status}
                  </Badge>
                </div>
                <div className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {c.proof_description}
                </div>
                {c.status === 'pending' && (
                  <div className="pt-2 flex gap-2 justify-end">
                    <button
                      onClick={() => handleReviewClaimAction(c.id, 'approved')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                    >
                      Approve Ownership
                    </button>
                    <button
                      onClick={() => handleReviewClaimAction(c.id, 'rejected')}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold"
                    >
                      Reject Claim
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

