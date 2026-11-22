import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { University, Faculty, Department } from '../types';
import {
  GraduationCap,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  User,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const initialType =
    location.pathname === '/register-lecturer' || searchParams.get('type') === 'lecturer'
      ? 'lecturer'
      : 'student';
  const [roleType, setRoleType] = useState<'student' | 'lecturer'>(initialType);

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const universityId = '5'; // Strict PNL

  // Student specific
  const [nim, setNim] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState('2025');
  const [departmentId, setDepartmentId] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [facultyId, setFacultyId] = useState('');

  // Lecturer specific
  const [nip, setNip] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [title, setTitle] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [lecturerDeptId, setLecturerDeptId] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load PNL Departments and Faculties
  useEffect(() => {
    api.get(`/universities/${universityId}/faculties`).then((res) => {
      if (res.data.success) setFaculties(res.data.data);
    });
    api.get(`/universities/${universityId}/departments`).then((res) => {
      if (res.data.success) setDepartments(res.data.data);
    });
  }, []);

  // --- Real-time Student NIM parsing & auto-detection ---
  const cleanNim = useMemo(() => nim.replace(/\D/g, '').slice(0, 13), [nim]);
  const nimYear = cleanNim.length >= 4 ? cleanNim.slice(0, 4) : '';
  const nimProdiCode = cleanNim.length >= 9 ? cleanNim.slice(4, 9) : '';
  const nimStudentSeq = cleanNim.length >= 13 ? cleanNim.slice(9, 13) : cleanNim.slice(9);

  const matchedDept = useMemo(() => {
    if (nimProdiCode.length === 5) {
      return departments.find((d) => d.prodi_code === nimProdiCode);
    }
    return null;
  }, [nimProdiCode, departments]);

  const matchedFaculty = useMemo(() => {
    if (matchedDept?.faculty_id) {
      return faculties.find((f) => f.id === matchedDept.faculty_id);
    }
    return null;
  }, [matchedDept, faculties]);

  // Sync auto-detected values for student
  useEffect(() => {
    if (roleType === 'student') {
      if (nimYear && parseInt(nimYear) >= 2000) {
        setEnrollmentYear(nimYear);
      }
      if (matchedDept) {
        setDepartmentId(matchedDept.id.toString());
        setStudyProgram(matchedDept.name);
        if (matchedDept.faculty_id) {
          setFacultyId(matchedDept.faculty_id.toString());
        }
      } else if (nimProdiCode.length === 5 && !matchedDept) {
        setDepartmentId('');
        setStudyProgram('');
      }
    }
  }, [cleanNim, matchedDept, nimYear, roleType]);

  // --- Real-time Lecturer NIP parsing & validation ---
  const cleanNip = useMemo(() => nip.replace(/\D/g, '').slice(0, 18), [nip]);
  const nipBirthYear = cleanNip.length >= 4 ? cleanNip.slice(0, 4) : '';
  const nipBirthMonth = cleanNip.length >= 6 ? cleanNip.slice(4, 6) : '';
  const nipBirthDay = cleanNip.length >= 8 ? cleanNip.slice(6, 8) : '';
  const nipTmtYear = cleanNip.length >= 12 ? cleanNip.slice(8, 12) : '';
  const nipTmtMonth = cleanNip.length >= 14 ? cleanNip.slice(12, 14) : '';
  const nipGenderDigit = cleanNip.length >= 15 ? cleanNip.slice(14, 15) : '';
  const nipSequence = cleanNip.length >= 18 ? cleanNip.slice(15, 18) : cleanNip.slice(15);

  const isNipGenderValid = useMemo(() => {
    if (!nipGenderDigit) return true;
    if (gender === 'L') return nipGenderDigit === '1';
    if (gender === 'P') return nipGenderDigit === '2';
    return false;
  }, [nipGenderDigit, gender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Pre-flight validation
    if (roleType === 'student') {
      if (cleanNim.length !== 13) {
        setError('NIM mahasiswa PNL wajib terdiri dari tepat 13 digit angka.');
        return;
      }
      if (!matchedDept) {
        setError(`Kode prodi '${nimProdiCode}' pada NIM tidak terdaftar di Politeknik Negeri Lhokseumawe.`);
        return;
      }
    } else {
      if (cleanNip.length !== 18) {
        setError('NIP dosen PNL wajib terdiri dari tepat 18 digit angka.');
        return;
      }
      if (!isNipGenderValid) {
        setError(
          `Digit ke-15 NIP Anda (${nipGenderDigit}) tidak cocok dengan jenis kelamin ${
            gender === 'L' ? 'Laki-laki (wajib angka 1)' : 'Perempuan (wajib angka 2)'
          }.`
        );
        return;
      }
      if (!lecturerDeptId) {
        setError('Silakan pilih Program Studi / Jurusan homebase dosen.');
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = roleType === 'student' ? '/auth/register-student' : '/auth/register-lecturer';
      const payload: any = {
        name,
        email,
        password,
        university_id: 5,
      };

      if (roleType === 'student') {
        payload.nim = cleanNim;
        payload.department_id = matchedDept ? matchedDept.id : parseInt(departmentId);
        payload.faculty_id = matchedDept?.faculty_id || (facultyId ? parseInt(facultyId) : null);
        payload.study_program = matchedDept ? matchedDept.name : studyProgram;
        payload.enrollment_year = parseInt(enrollmentYear);
      } else {
        payload.nip = cleanNip;
        payload.nidn = cleanNip;
        payload.gender = gender;
        payload.department_id = parseInt(lecturerDeptId);
        payload.title = title;
        payload.specialization = specialization;
      }

      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        // Auto-login
        const loginRes = await api.post('/auth/login', { email, password });
        if (loginRes.data.success) {
          login(loginRes.data.data);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Pendaftaran gagal. Mohon periksa kembali data input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-2xl text-navy tracking-tight block">PNLConnect</span>
            <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider block -mt-1">
              Politeknik Negeri Lhokseumawe
            </span>
          </div>
        </Link>

        <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-navy">
          Pendaftaran Akun Civitas PNL
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Portal khusus terverifikasi untuk Mahasiswa Aktif dan Dosen / Tenaga Pendidik Politeknik Negeri Lhokseumawe.
        </p>

        {/* Role Type Selector Tabs */}
        <div className="mt-6 inline-flex p-1.5 bg-slate-200/80 rounded-2xl shadow-inner border border-slate-300/40">
          <button
            type="button"
            onClick={() => {
              setRoleType('student');
              setError('');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              roleType === 'student'
                ? 'bg-white text-brand-700 shadow-md shadow-brand-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Mahasiswa PNL (NIM 13 Digit)
          </button>
          <button
            type="button"
            onClick={() => {
              setRoleType('lecturer');
              setError('');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              roleType === 'lecturer'
                ? 'bg-white text-brand-700 shadow-md shadow-brand-900/5'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            Dosen / Tendik (NIP 18 Digit)
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-borderMuted">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs sm:text-sm text-rose-700 animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Kampus Lock Badge */}
            <div className="p-3.5 bg-brand-50/60 border border-brand-200/60 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-brand-600" />
                <div>
                  <div className="text-xs font-bold text-navy">Kampus Terverifikasi</div>
                  <div className="text-xs text-slate-600">Politeknik Negeri Lhokseumawe (PNL)</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-brand-600 text-white shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5" /> PNL CIVITAS
              </span>
            </div>

            {/* Nama & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nama Lengkap Civitas
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cut Mutia / Teuku Umar"
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Akun
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={roleType === 'student' ? 'mhs@student.pnl.ac.id' : 'dosen@pnl.ac.id'}
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* ================= SECTION MAHASISWA ================= */}
            {roleType === 'student' ? (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nomor Induk Mahasiswa (NIM)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {cleanNim.length}/13 Digit
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 2025553010078"
                    className="mt-1.5 w-full font-mono text-base tracking-wider px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />

                  {/* Realtime NIM Structure Visualizer */}
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Struktur NIM PNL (13 Digit):</span>
                      <span className="text-brand-600 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Auto-Deteksi Prodi
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-center">
                      <div className={`p-2 rounded-lg border ${nimYear.length === 4 ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                        <div className="text-[10px] uppercase font-sans text-slate-500">Tahun Masuk (4)</div>
                        <div className="text-sm mt-0.5">{nimYear || 'YYYY'}</div>
                      </div>

                      <div className={`p-2 rounded-lg border ${matchedDept ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : nimProdiCode.length === 5 ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                        <div className="text-[10px] uppercase font-sans text-slate-500">Kode Prodi (5)</div>
                        <div className="text-sm mt-0.5">{nimProdiCode || 'PRODI'}</div>
                      </div>

                      <div className={`p-2 rounded-lg border ${cleanNim.length === 13 ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold' : 'bg-white border-slate-200 text-slate-400'}`}>
                        <div className="text-[10px] uppercase font-sans text-slate-500">No. Urut Mhs (4)</div>
                        <div className="text-sm mt-0.5">{nimStudentSeq || '0000'}</div>
                      </div>
                    </div>

                    {/* Live Detection Feedback */}
                    {nimProdiCode.length === 5 && (
                      <div className="pt-1">
                        {matchedDept ? (
                          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>
                              Terdeteksi: <strong>{matchedDept.name}</strong> ({matchedFaculty?.name || 'PNL'}) - Angkatan {nimYear || 'Terdeteksi'}
                            </span>
                          </div>
                        ) : (
                          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-xs font-medium">
                            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <span>
                              Kode prodi &lsquo;<strong>{nimProdiCode}</strong>&rsquo; tidak terdaftar pada program studi PNL.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Auto-filled Department & Faculty Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Program Studi Terdeteksi
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={matchedDept ? matchedDept.name : 'Menunggu input NIM...'}
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Tahun Masuk / Angkatan
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={nimYear ? `Angkatan ${nimYear}` : 'Menunggu input NIM...'}
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* ================= SECTION DOSEN / TENDIK ================= */
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {/* Gender Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Jenis Kelamin (Menentukan Digit ke-15 NIP)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setGender('L')}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        gender === 'L'
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      Laki-laki (Digit ke-15: 1)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('P')}
                      className={`p-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                        gender === 'P'
                          ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs ring-2 ring-rose-500/20'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <User className="w-4 h-4 text-rose-600" />
                      Perempuan (Digit ke-15: 2)
                    </button>
                  </div>
                </div>

                {/* NIP Input */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Nomor Induk Pegawai (NIP ASN Dosen)
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {cleanNip.length}/18 Digit
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 198001012005011001"
                    className="mt-1.5 w-full font-mono text-base tracking-wider px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />

                  {/* Realtime NIP Visualizer */}
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Struktur NIP Standar BKN (18 Digit):</span>
                      <span className="text-brand-600 font-bold">Validasi Digit ke-15</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 font-mono text-center">
                      <div className="p-1.5 rounded-lg border bg-white border-slate-200">
                        <div className="text-[9px] uppercase font-sans text-slate-500">Tgl Lahir (8)</div>
                        <div className="text-xs font-bold mt-0.5">{nipBirthDay && nipBirthMonth && nipBirthYear ? `${nipBirthDay}/${nipBirthMonth}` : 'YYYYMMDD'}</div>
                      </div>

                      <div className="p-1.5 rounded-lg border bg-white border-slate-200">
                        <div className="text-[9px] uppercase font-sans text-slate-500">TMT PNS (6)</div>
                        <div className="text-xs font-bold mt-0.5">{nipTmtMonth && nipTmtYear ? `${nipTmtMonth}/${nipTmtYear}` : 'YYYYMM'}</div>
                      </div>

                      <div className={`p-1.5 rounded-lg border ${!nipGenderDigit ? 'bg-white border-slate-200' : isNipGenderValid ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' : 'bg-rose-50 border-rose-400 text-rose-900 font-bold'}`}>
                        <div className="text-[9px] uppercase font-sans text-slate-500">Gender (1)</div>
                        <div className="text-xs mt-0.5">{nipGenderDigit || '1/2'}</div>
                      </div>

                      <div className="p-1.5 rounded-lg border bg-white border-slate-200">
                        <div className="text-[9px] uppercase font-sans text-slate-500">No. Urut (3)</div>
                        <div className="text-xs font-bold mt-0.5">{nipSequence || '001'}</div>
                      </div>
                    </div>

                    {/* Gender Digit Verification Status */}
                    {nipGenderDigit && (
                      <div className="pt-1">
                        {isNipGenderValid ? (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            <span>
                              Digit ke-15 bernilai <strong>{nipGenderDigit}</strong>, cocok dengan jenis kelamin {gender === 'L' ? 'Laki-laki (1)' : 'Perempuan (2)'}.
                            </span>
                          </div>
                        ) : (
                          <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg flex items-center gap-2 text-rose-800 text-xs font-semibold">
                            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                            <span>
                              Digit ke-15 NIP bernilai <strong>{nipGenderDigit}</strong>. Tidak cocok dengan jenis kelamin {gender === 'L' ? 'Laki-laki (wajib bernilai 1)' : 'Perempuan (wajib bernilai 2)'}!
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Prodi Selection for Lecturer */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Program Studi Homebase Dosen
                  </label>
                  <select
                    required
                    value={lecturerDeptId}
                    onChange={(e) => setLecturerDeptId(e.target.value)}
                    className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="">Pilih Program Studi Homebase PNL...</option>
                    {faculties.map((f) => (
                      <optgroup key={f.id} label={f.name}>
                        {(f.departments || []).map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} {d.prodi_code ? `[Kode: ${d.prodi_code}]` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Gelar & Spesialisasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Gelar Akademik
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Dr., S.T., M.Kom."
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Bidang Riset / Keahlian
                    </label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. AI & Cloud Computing"
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                (roleType === 'student' && (cleanNim.length !== 13 || !matchedDept)) ||
                (roleType === 'lecturer' && (cleanNip.length !== 18 || !isNipGenderValid || !lecturerDeptId))
              }
              className="w-full mt-4 py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Memproses Pendaftaran...'
              ) : (
                <>
                  Daftar Akun Civitas PNL
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Sudah memiliki akun Civitas PNL?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Masuk ke Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
