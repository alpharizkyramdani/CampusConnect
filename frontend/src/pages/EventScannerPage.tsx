import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  User,
  Ticket,
  Calendar,
  Sparkles,
  Camera,
} from 'lucide-react';

export const EventScannerPage: React.FC = () => {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleVerify = async (token: string) => {
    if (!token.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setScanResult(null);

    try {
      const res = await api.post('/events/verify-ticket', { token: token.trim() });
      if (res.data.success) {
        setScanResult(res.data);
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Duplicate check-in
        setScanResult(err.response.data);
      } else {
        setErrorMsg(err.response?.data?.message || 'Verification failed. Invalid ticket code.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cameraActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          handleVerify(decodedText);
          scanner.clear();
          setCameraActive(false);
        },
        (error) => {
          // ignore stream scan errors
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [cameraActive]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold rounded-full mb-2">
          <QrCode className="w-3.5 h-3.5" />
          <span>Real-time Gate Access Scanner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy">
          Event Attendance & Ticket Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Scan participant digital tickets or enter ticket identifiers to record verified attendance.
        </p>
      </div>

      {/* Scanner Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xl">
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              cameraActive
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            {cameraActive ? 'Stop Camera Scanner' : 'Activate Live Camera Scanner'}
          </button>
        </div>

        {cameraActive && (
          <div className="mb-6 max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-brand-500 p-2 bg-slate-50">
            <div id="qr-reader" className="w-full" />
          </div>
        )}

        {/* Manual Barcode / Ticket Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify(manualCode);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Ticket className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter Ticket Code (e.g. TCK-HACK-ABC123) or paste QR Token"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !manualCode.trim()}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Check-In'}
          </button>
        </form>

        {/* Scan Result Feedback */}
        {scanResult && !scanResult.data?.already_attended && (
          <div className="mt-8 p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Check-In Confirmed
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {scanResult.data?.registration?.user?.name || 'Participant'}
                </h3>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-emerald-800 font-semibold">Event:</span>{' '}
                <span className="text-slate-700">{scanResult.data?.registration?.event?.title}</span>
              </div>
              <div>
                <span className="text-emerald-800 font-semibold">Ticket Code:</span>{' '}
                <span className="font-mono font-bold text-slate-800">
                  {scanResult.data?.registration?.ticket_code}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Duplicate Warning */}
        {scanResult?.data?.already_attended && (
          <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-500 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Duplicate Check-In Detected
                </div>
                <h3 className="text-lg font-bold text-slate-900">{scanResult.message}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="mt-8 p-6 bg-rose-50 border-2 border-rose-400 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Verification Error</div>
              <h3 className="text-sm font-bold text-slate-900">{errorMsg}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
