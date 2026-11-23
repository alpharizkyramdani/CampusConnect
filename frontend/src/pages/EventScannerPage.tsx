import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ticket,
  Camera,
  CameraOff,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

interface VerificationResult {
  success: boolean;
  status: 'VALID_CHECKIN' | 'ALREADY_USED' | 'INVALID_TICKET' | string;
  message: string;
  data?: {
    already_attended?: boolean;
    checked_in_at?: string;
    registration?: {
      id: number;
      ticket_code: string;
      qr_token: string;
      status: string;
      checked_in_at?: string;
      event?: {
        title: string;
        location?: string;
        start_time: string;
      };
      user?: {
        name: string;
        email: string;
        student_profile?: {
          nim: string;
          study_program?: string;
        };
      };
    };
  };
  checked_in_at?: string;
}

export const EventScannerPage: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleVerify = async (token: string) => {
    if (!token.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setScanResult(null);

    try {
      // Endpoint verify-ticket returns standard statuses: VALID_CHECKIN, ALREADY_USED, INVALID_TICKET
      const res = await api.post('/events/verify-ticket', { token: token.trim() });
      setScanResult(res.data);
    } catch (err: any) {
      if (err.response?.data?.status === 'ALREADY_USED' || err.response?.status === 409) {
        setScanResult(err.response.data);
      } else if (err.response?.data?.status === 'INVALID_TICKET') {
        setScanResult({
          success: false,
          status: 'INVALID_TICKET',
          message: err.response.data.message || 'Tiket tidak ditemukan atau kode tidak valid.',
        });
      } else {
        setErrorMsg(err.response?.data?.message || 'Gagal memverifikasi tiket. Silakan periksa kembali kodenya.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cameraActive) {
      setCameraError(null);

      // Check if mediaDevices is supported and available (e.g. requires HTTPS on non-localhost)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'Akses kamera tidak didukung atau diblokir oleh browser (diperlukan HTTPS pada jaringan IP lokal). Gunakan input manual kode tiket di bawah.'
        );
        setCameraActive(false);
        return;
      }

      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 250, height: 250 } },
          false
        );

        scanner.render(
          (decodedText) => {
            handleVerify(decodedText);
            scanner.clear().catch(() => {});
            setCameraActive(false);
          },
          (error) => {
            // Normal frame capture error, can be safely ignored
          }
        );

        scannerRef.current = scanner;

        return () => {
          scanner.clear().catch(() => {});
        };
      } catch (e: any) {
        setCameraError(
          'Gagal menginisialisasi kamera: ' + (e.message || 'Izin kamera ditolak. Gunakan input manual.')
        );
        setCameraActive(false);
      }
    }
  }, [cameraActive]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold rounded-full mb-2">
          <QrCode className="w-3.5 h-3.5 text-brand-600" />
          <span>Gate Scanner & Ticket Verifier PNL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
          Verifikasi Tiket & Presensi Event Kampus
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Scan QR Code digital peserta atau masukkan kode tiket UUID untuk verifikasi presensi sekali pakai.
        </p>
      </div>

      {/* Camera Alert / Error Banner */}
      {cameraError && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 animate-in fade-in">
          <CameraOff className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-bold">Peringatan Akses Kamera:</span> {cameraError}
          </div>
        </div>
      )}

      {/* Scanner Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              Mode Pemindaian Tiket
            </h2>
            <p className="text-xs text-slate-500">
              Pilih pemindaian langsung via kamera atau input kode tiket.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCameraActive(!cameraActive)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
              cameraActive
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            {cameraActive ? 'Hentikan Kamera' : 'Buka Scanner Kamera'}
          </button>
        </div>

        {cameraActive && (
          <div className="mb-6 max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-brand-500 p-2 bg-slate-50">
            <div id="qr-reader" className="w-full" />
            <p className="text-[11px] text-center text-slate-500 mt-2 font-medium">
              Arahkan QR Code tiket peserta ke dalam kotak pemindai.
            </p>
          </div>
        )}

        {/* Manual Barcode / Ticket Input Fallback */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(manualCode);
          }}
          className="space-y-2"
        >
          <label className="block text-xs font-bold text-slate-700">
            Input Manual Kode Tiket / Token QR:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Ticket className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: TCK-2026-X892 atau UUID Token QR..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !manualCode.trim()}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              {loading ? 'Memvalidasi...' : 'Check-In'}
            </button>
          </div>
        </form>

        {/* Scan Result Feedback: VALID_CHECKIN */}
        {scanResult && scanResult.status === 'VALID_CHECKIN' && (
          <div className="mt-8 p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-200/60 text-emerald-800 uppercase tracking-wider mb-0.5">
                  STATUS: VALID_CHECKIN
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {scanResult.data?.registration?.user?.name || 'Peserta Terdaftar'}
                </h3>
                {scanResult.data?.registration?.user?.student_profile?.nim && (
                  <p className="text-xs text-slate-600">
                    NIM: <span className="font-mono font-semibold">{scanResult.data.registration.user.student_profile.nim}</span>
                    {scanResult.data.registration.user.student_profile.study_program && ` • ${scanResult.data.registration.user.student_profile.study_program}`}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-emerald-800 font-semibold">Event:</span>{' '}
                <span className="text-slate-700 font-medium">{scanResult.data?.registration?.event?.title}</span>
              </div>
              <div>
                <span className="text-emerald-800 font-semibold">Kode Tiket:</span>{' '}
                <span className="font-mono font-bold text-slate-800">
                  {scanResult.data?.registration?.ticket_code}
                </span>
              </div>
              <div className="sm:col-span-2 flex items-center gap-1 text-emerald-700 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Waktu Presensi: Baru saja diverifikasi oleh petugas pintu masuk.</span>
              </div>
            </div>
          </div>
        )}

        {/* Scan Result Feedback: ALREADY_USED */}
        {scanResult && scanResult.status === 'ALREADY_USED' && (
          <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-500 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-200/70 text-amber-800 uppercase tracking-wider mb-0.5">
                  STATUS: ALREADY_USED (Presensi Ganda Ditolak)
                </div>
                <h3 className="text-base font-bold text-slate-900">{scanResult.message}</h3>
                {(scanResult.checked_in_at || scanResult.data?.checked_in_at) && (
                  <p className="text-xs text-amber-900 mt-1 flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    Telah digunakan sebelumnya pada: {scanResult.checked_in_at || scanResult.data?.checked_in_at}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scan Result Feedback: INVALID_TICKET */}
        {scanResult && scanResult.status === 'INVALID_TICKET' && (
          <div className="mt-8 p-6 bg-rose-50 border-2 border-rose-500 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-200/70 text-rose-800 uppercase tracking-wider mb-0.5">
                STATUS: INVALID_TICKET
              </div>
              <h3 className="text-sm font-bold text-slate-900">{scanResult.message}</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Pastikan peserta menunjukkan tiket resmi dari portal PNLConnect yang sah.
              </p>
            </div>
          </div>
        )}

        {/* Generic Error Feedback */}
        {errorMsg && (
          <div className="mt-8 p-6 bg-rose-50 border-2 border-rose-400 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Kesalahan Sistem</div>
              <h3 className="text-sm font-bold text-slate-900">{errorMsg}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
