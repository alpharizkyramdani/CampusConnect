import React, { useState } from 'react';
import api from '../../services/api';
import { Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label = 'Foto / Gambar',
  value,
  onChange,
  placeholder = 'Atau tempel URL gambar: https://...',
  helperText = 'Mendukung format JPG, PNG, WEBP, GIF (Maks. 5 MB) langsung dari galeri HP/laptop.',
  required = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success && res.data.url) {
        onChange(res.data.url);
      } else {
        setError('Gagal mengunggah foto.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengunggah foto dari perangkat.');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2 text-xs font-sans">
      <div className="flex items-center justify-between">
        <label className="font-bold text-slate-700 block uppercase tracking-wide">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {uploading && (
          <span className="text-[11px] text-brand-600 font-semibold flex items-center gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" />
            Mengunggah...
          </span>
        )}
      </div>

      {/* Preview Card if image is selected */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 flex items-center gap-3">
          <img
            src={value}
            alt="Preview"
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-[11px] font-semibold text-slate-700 truncate">{value}</div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] flex items-center gap-1 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Ganti Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-[10px] font-semibold transition-colors flex items-center gap-0.5"
              >
                <X className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Action Bar & URL Input */
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs">
              <Upload className="w-3.5 h-3.5" />
              <span>Ambil dari Galeri / Perangkat</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <span className="text-[11px] text-slate-400">atau tempel link gambar di bawah:</span>
          </div>

          <div className="relative">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-white text-xs focus:outline-hidden focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {helperText && (
            <p className="text-[10px] text-slate-400 leading-tight">
              {helperText}
            </p>
          )}

          {error && (
            <p className="text-[11px] text-rose-600 font-semibold">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

