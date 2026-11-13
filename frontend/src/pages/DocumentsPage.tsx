import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Document } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  FolderLock,
  Plus,
  Search,
  Download,
  FileText,
  FileCode,
  Lock,
  Globe,
  History,
  Upload,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload modal
  const [uploadModal, setUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [accessLevel, setAccessLevel] = useState<'public' | 'campus' | 'staff' | 'private'>('campus');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Version History Modal
  const [versionDoc, setVersionDoc] = useState<Document | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [newVersionNum, setNewVersionNum] = useState('v1.1');
  const [newVersionChangelog, setNewVersionChangelog] = useState('');
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);
  const [uploadingVersion, setUploadingVersion] = useState(false);

  const canUpload = hasAnyRole(['super_admin', 'campus_admin', 'department_admin', 'lecturer']);

  const fetchVersions = async (docId: number) => {
    setLoadingVersions(true);
    try {
      const res = await api.get(`/documents/${docId}/versions`);
      if (res.data.success) {
        setVersions(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVersions(false);
    }
  };

  const openVersionModal = (doc: Document) => {
    setVersionDoc(doc);
    fetchVersions(doc.id);
  };

  const handleUploadNewVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionDoc || !newVersionFile) {
      alert('Pilih berkas dokumen baru');
      return;
    }

    setUploadingVersion(true);
    try {
      const formData = new FormData();
      formData.append('version', newVersionNum);
      formData.append('changelog', newVersionChangelog);
      formData.append('file', newVersionFile);

      const res = await api.post(`/documents/${versionDoc.id}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        alert('Versi dokumen baru berhasil diunggah!');
        setNewVersionChangelog('');
        setNewVersionFile(null);
        fetchVersions(versionDoc.id);
        fetchDocs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengunggah versi dokumen baru.');
    } finally {
      setUploadingVersion(false);
    }
  };

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents', {
        params: {
          university_id: activeAssignment?.university_id,
          search: search || undefined,
        },
      });
      if (res.data.success) {
        setDocuments(res.data.data.data || res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [activeAssignment]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file to upload');
      return;
    }
    setUploading(true);

    const formData = new FormData();
    formData.append('university_id', (activeAssignment?.university_id || 1).toString());
    formData.append('title', title);
    formData.append('access_level', accessLevel);
    formData.append('file', file);

    try {
      const res = await api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setUploadModal(false);
        setTitle('');
        setFile(null);
        fetchDocs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      await api.get(`/documents/${doc.id}/download`);
      window.open(doc.file_path, '_blank');
      fetchDocs();
    } catch (e) {
      window.open(doc.file_path, '_blank');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <FolderLock className="w-6 h-6 text-brand-600" />
            Institutional Document Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access academic guides, syllabus templates, research handbooks, and campus policies
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => setUploadModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Upload Document
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDocs()}
            placeholder="Search documents by title or file name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-borderMuted shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center">
            <FolderLock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No campus documents found</h3>
            <p className="text-xs text-slate-500 mt-1">Upload scholastic guidelines or syllabus materials.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Access Scope</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Downloads</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-navy flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-brand-600 flex-shrink-0" />
                      <div>
                        <div>{d.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{d.file_name}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={d.access_level === 'public' ? 'emerald' : d.access_level === 'private' ? 'rose' : 'blue'}>
                        {d.access_level}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {(d.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{d.uploader?.name || 'Staff'}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{d.download_count} times</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openVersionModal(d)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold inline-flex items-center gap-1 transition-colors text-xs"
                        title="Riwayat Versi Dokumen"
                      >
                        <History className="w-3.5 h-3.5 text-slate-500" />
                        <span>Versi</span>
                      </button>
                      <button
                        onClick={() => handleDownload(d)}
                        className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-bold inline-flex items-center gap-1 transition-colors text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModal}
        onClose={() => setUploadModal(false)}
        title="Upload Academic Document"
      >
        <form onSubmit={handleUpload} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block uppercase">Document Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Capstone Project Guidelines 2026"
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">Access Permission</label>
            <select
              value={accessLevel}
              onChange={(e: any) => setAccessLevel(e.target.value)}
              className="mt-1 w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            >
              <option value="campus">Campus Only (Students & Faculty)</option>
              <option value="public">Public / Open Access</option>
              <option value="staff">Staff & Faculty Only</option>
              <option value="private">Private Restricted</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase">File (PDF, DOCX, ZIP up to 20MB)</label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 w-full p-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all"
          >
            {uploading ? 'Uploading...' : 'Save and Upload Document'}
          </button>
        </form>
      </Modal>

      {/* Version History Modal */}
      <Modal
        isOpen={!!versionDoc}
        onClose={() => setVersionDoc(null)}
        title={`Riwayat Versi: ${versionDoc?.title || ''}`}
        maxWidth="xl"
      >
        <div className="space-y-5 text-xs font-sans">
          {/* Version List */}
          <div>
            <div className="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Daftar Riwayat Rilis Dokumen</span>
              <span className="text-[11px] text-slate-400 font-normal">Audit Jejak Versi</span>
            </div>

            {loadingVersions ? (
              <div className="text-center py-6 text-slate-400">Memuat riwayat revisi berkas...</div>
            ) : versions.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                Belum ada versi terdahulu. Dokumen ini merupakan versi rilis pertama.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {versions.map((v) => (
                  <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-white transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-brand-100 text-brand-700 font-bold rounded-md font-mono text-[10px]">
                          {v.version}
                        </span>
                        <span className="font-semibold text-slate-800">{v.file_name}</span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          {(v.file_size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      {v.changelog && (
                        <p className="text-[11px] text-slate-600 mt-1 pl-0.5 leading-relaxed">
                          Catatan: {v.changelog}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Diupload oleh: {v.uploader?.name || 'Staff'} • {new Date(v.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </div>

                    <a
                      href={v.file_path}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-xs flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload New Version Form (Staff/Admin) */}
          {canUpload && (
            <form onSubmit={handleUploadNewVersion} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="font-bold text-navy flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-brand-600" />
                <span>Unggah Revisi Dokumen Baru</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block uppercase text-[10px] mb-1">Nomor Versi</label>
                  <input
                    type="text"
                    value={newVersionNum}
                    onChange={(e) => setNewVersionNum(e.target.value)}
                    placeholder="e.g. v1.1 atau v2.0"
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block uppercase text-[10px] mb-1">Berkas Baru</label>
                  <input
                    type="file"
                    onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                    className="w-full p-1.5 border border-slate-200 rounded-xl bg-white text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block uppercase text-[10px] mb-1">Catatan Perubahan (Changelog)</label>
                <textarea
                  rows={2}
                  value={newVersionChangelog}
                  onChange={(e) => setNewVersionChangelog(e.target.value)}
                  placeholder="Rincian perbaikan bab, tanggal deadline baru, atau revisi tata tertib..."
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white text-xs"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={uploadingVersion || !newVersionFile}
                  className="px-4 py-2 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingVersion ? 'Mengunggah...' : 'Rilis Versi Baru'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

