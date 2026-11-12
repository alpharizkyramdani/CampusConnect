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

  const canUpload = hasAnyRole(['super_admin', 'campus_admin', 'department_admin', 'lecturer']);

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
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDownload(d)}
                        className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg font-bold inline-flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
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
    </div>
  );
};

