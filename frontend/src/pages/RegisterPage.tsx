import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { University, Faculty, Department } from '../types';
import { GraduationCap, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'lecturer' ? 'lecturer' : 'student';
  const [roleType, setRoleType] = useState<'student' | 'lecturer'>(initialType);

  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [universityId, setUniversityId] = useState('5');
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [nim, setNim] = useState('');
  const [studyProgram, setStudyProgram] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState('2024');

  // Lecturer specific
  const [nidn, setNidn] = useState('');
  const [title, setTitle] = useState('');
  const [specialization, setSpecialization] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDepartmentChange = (deptId: string) => {
    setDepartmentId(deptId);
    if (deptId) {
      const parentFaculty = faculties.find((f) =>
        (f.departments || []).some((d) => d.id.toString() === deptId)
      );
      if (parentFaculty) {
        setFacultyId(parentFaculty.id.toString());
      }
    } else {
      setFacultyId('');
    }
  };

  useEffect(() => {
    api.get('/universities').then((res) => {
      if (res.data.success && res.data.data?.length > 0) {
        setUniversities(res.data.data);
        const pnl = res.data.data.find((u: any) => u.code === 'PNL') || res.data.data[0];
        setUniversityId(pnl.id.toString());
      }
    });
  }, []);

  useEffect(() => {
    if (universityId) {
      api.get(`/universities/${universityId}/faculties`).then((res) => {
        if (res.data.success) setFaculties(res.data.data);
      });
      api.get(`/universities/${universityId}/departments`).then((res) => {
        if (res.data.success) setDepartments(res.data.data);
      });
    }
  }, [universityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = roleType === 'student' ? '/auth/register-student' : '/auth/register-lecturer';
      const payload: any = {
        name,
        email,
        password,
        university_id: parseInt(universityId),
        faculty_id: facultyId ? parseInt(facultyId) : null,
        department_id: departmentId ? parseInt(departmentId) : null,
      };

      if (roleType === 'student') {
        payload.nim = nim;
        payload.study_program = studyProgram;
        payload.enrollment_year = parseInt(enrollmentYear);
      } else {
        payload.nidn = nidn;
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
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-13 h-13 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-slate-200/80">
            <img src="/images/pnl-logo.png" alt="PNL" className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>
          <span className="font-extrabold text-2xl text-navy tracking-tight">PNLConnect</span>
        </Link>
        <h2 className="mt-3 text-2xl font-extrabold text-navy">
          Pendaftaran Akun Civitas PNL
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Ekosistem Digital Terpadu Politeknik Negeri Lhokseumawe
        </p>

        {/* Role Type Selector Tabs */}
        <div className="mt-6 inline-flex p-1 bg-slate-200/70 rounded-2xl">
          <button
            type="button"
            onClick={() => setRoleType('student')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              roleType === 'student' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendaftaran Mahasiswa
          </button>
          <button
            type="button"
            onClick={() => setRoleType('lecturer')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              roleType === 'lecturer' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pendaftaran Dosen / Tendik
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-borderMuted sm:px-10">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nama Lengkap
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
                  placeholder={roleType === 'student' ? 'nama@student.pnl.ac.id' : 'nama@pnl.ac.id'}
                  className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kampus
                </label>
                <div className="mt-1.5 px-3.5 py-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-sm font-semibold text-blue-900 flex items-center justify-between">
                  <span>Politeknik Negeri Lhokseumawe</span>
                  <span className="text-[10px] bg-brand-600 text-white font-mono px-2 py-0.5 rounded-md font-bold">
                    PNL
                  </span>
                </div>
              </div>
            </div>

            {/* Role-specific Fields */}
            {roleType === 'student' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Student ID (NIM)
                    </label>
                    <input
                      type="text"
                      required
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      placeholder="e.g. 22051204099"
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Enrollment Year
                    </label>
                    <input
                      type="number"
                      required
                      value={enrollmentYear}
                      onChange={(e) => setEnrollmentYear(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Department / Jurusan
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="">Pilih Jurusan / Departemen...</option>
                      {faculties.length > 0
                        ? faculties.map((f) => (
                            <optgroup key={f.id} label={f.name}>
                              {(f.departments || []).map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name} ({d.code})
                                </option>
                              ))}
                            </optgroup>
                          ))
                        : departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Study Program / Peminatan
                    </label>
                    <input
                      type="text"
                      value={studyProgram}
                      onChange={(e) => setStudyProgram(e.target.value)}
                      placeholder="e.g. Teknik Informatika"
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Lecturer ID (NIDN/NIP)
                    </label>
                    <input
                      type="text"
                      required
                      value={nidn}
                      onChange={(e) => setNidn(e.target.value)}
                      placeholder="e.g. 0012058801"
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Academic Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Dr., S.T., M.Kom."
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Jurusan / Departemen Dosen
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => handleDepartmentChange(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    >
                      <option value="">Pilih Jurusan / Departemen...</option>
                      {faculties.length > 0
                        ? faculties.map((f) => (
                            <optgroup key={f.id} label={f.name}>
                              {(f.departments || []).map((d) => (
                                <option key={d.id} value={d.id}>
                                  {d.name} ({d.code})
                                </option>
                              ))}
                            </optgroup>
                          ))
                        : departments.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Bidang Keahlian / Riset
                    </label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Rekayasa Perangkat Lunak & AI"
                      className="mt-1.5 w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

