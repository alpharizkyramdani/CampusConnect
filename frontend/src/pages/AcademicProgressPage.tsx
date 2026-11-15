import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  AlertCircle,
  BarChart2,
  FileText,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  ArrowLeft,
  Users,
  Sparkles,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface Course {
  id?: number;
  course_code: string;
  course_name: string;
  sks: number;
  grade: string;
  grade_point?: number;
  attendance_percentage?: number;
  lecturer_name?: string;
}

interface Semester {
  id: number;
  semester_number: number;
  semester_name: string;
  gpa: number;
  cumulative_gpa: number;
  sks_taken: number;
  sks_passed: number;
  status: string;
  courses: Course[];
}

interface StudentItem {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  nim: string;
  department: string;
  semester: number;
  ipk: number;
  sks_passed: number;
  status: string;
  advisor: string;
  semesters_count: number;
}

export const AcademicProgressPage: React.FC = () => {
  const { user, activeRole } = useAuth();
  const isStaff =
    activeRole === 'lecturer' ||
    activeRole === 'department_admin' ||
    activeRole === 'super_admin' ||
    activeRole === 'campus_admin';

  // For Staff: List view vs Student detail view
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [staffSummary, setStaffSummary] = useState<any>(null);
  const [searchStudent, setSearchStudent] = useState('');
  const [loadingList, setLoadingList] = useState(false);

  // Student KHS Detail Data
  const [data, setData] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null);

  // Input KHS Modal State (for Staff / Admin Jurusan / Dosen)
  const [inputKHSModal, setInputKHSModal] = useState(false);
  const [khsStudentId, setKhsStudentId] = useState<string>('');
  const [khsSemesterNumber, setKhsSemesterNumber] = useState<number>(1);
  const [khsSemesterName, setKhsSemesterName] = useState('Semester 1 Ganjil 2026/2027');
  const [khsCourses, setKhsCourses] = useState<Course[]>([
    { course_code: 'TIF101', course_name: 'Algoritma & Pemrograman Dasar', sks: 3, grade: 'A' },
    { course_code: 'TIF102', course_name: 'Pengantar Teknologi Informasi', sks: 2, grade: 'A' },
    { course_code: 'TIF103', course_name: 'Matematika Diskrit Terapan', sks: 3, grade: 'B+' },
    { course_code: 'TIF104', course_name: 'Praktikum Pemrograman Komputer', sks: 2, grade: 'A' },
  ]);
  const [savingKHS, setSavingKHS] = useState(false);

  // Fetch student list for staff
  const fetchStudentsList = async () => {
    if (!isStaff) return;
    setLoadingList(true);
    try {
      const res = await api.get('/academic-progress/students', {
        params: { search: searchStudent || undefined },
      });
      if (res.data.success) {
        setStudents(res.data.data || []);
        setStaffSummary(res.data.summary || null);
        if (!khsStudentId && res.data.data.length > 0) {
          setKhsStudentId(res.data.data[0].id.toString());
        }
      }
    } catch (e) {
      console.error('Failed to load students list:', e);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch individual student academic progress
  const fetchAcademicDetail = async (targetId?: number) => {
    setLoadingDetail(true);
    try {
      const params = targetId ? { student_id: targetId } : {};
      const res = await api.get('/academic-progress', { params });
      if (res.data.success) {
        setData(res.data.data);
        const activeSem = res.data.data.all_semesters?.find((s: Semester) => s.status === 'active');
        if (activeSem) {
          setExpandedSemester(activeSem.semester_number);
        } else if (res.data.data.all_semesters?.length > 0) {
          setExpandedSemester(res.data.data.all_semesters[res.data.data.all_semesters.length - 1].semester_number);
        }
      }
    } catch (e) {
      console.error('Failed to load academic progress:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    if (isStaff) {
      fetchStudentsList();
    } else {
      fetchAcademicDetail();
    }
  }, [activeRole]);

  useEffect(() => {
    if (isStaff && searchStudent !== undefined) {
      const timeout = setTimeout(() => {
        fetchStudentsList();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [searchStudent]);

  const handleOpenStudentDetail = (id: number) => {
    setSelectedStudentId(id);
    fetchAcademicDetail(id);
  };

  const handleBackToList = () => {
    setSelectedStudentId(null);
    setData(null);
    fetchStudentsList();
  };

  // Course management in KHS modal
  const handleAddCourseRow = () => {
    setKhsCourses([
      ...khsCourses,
      { course_code: `TIF${100 + khsCourses.length + 1}`, course_name: '', sks: 3, grade: 'A' },
    ]);
  };

  const handleRemoveCourseRow = (idx: number) => {
    if (khsCourses.length <= 1) return;
    setKhsCourses(khsCourses.filter((_, i) => i !== idx));
  };

  const handleUpdateCourseRow = (idx: number, field: keyof Course, value: any) => {
    const updated = [...khsCourses];
    updated[idx] = { ...updated[idx], [field]: value };
    setKhsCourses(updated);
  };

  const handleSubmitKHS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!khsStudentId) {
      alert('Pilih mahasiswa terlebih dahulu!');
      return;
    }
    setSavingKHS(true);
    try {
      const res = await api.post('/academic-progress/khs', {
        student_id: parseInt(khsStudentId),
        semester_number: khsSemesterNumber,
        semester_name: khsSemesterName,
        courses: khsCourses,
      });

      if (res.data.success) {
        alert(res.data.message || 'KHS berhasil disimpan!');
        setInputKHSModal(false);
        fetchStudentsList();
        if (selectedStudentId === parseInt(khsStudentId)) {
          fetchAcademicDetail(parseInt(khsStudentId));
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan KHS');
    } finally {
      setSavingKHS(false);
    }
  };

  const handleDownloadTranscript = () => {
    window.print();
  };

  const getGradeBadge = (grade: string) => {
    if (grade === 'A') return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-xs">A (4.00)</span>;
    if (grade === 'A-') return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-xs">A- (3.70)</span>;
    if (grade.startsWith('B')) return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md text-xs">{grade}</span>;
    if (grade.startsWith('C')) return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-xs">{grade}</span>;
    if (grade === 'IP') return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-xs">Berjalan (IP)</span>;
    return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-xs">{grade}</span>;
  };

  // ==========================================
  // VIEW 1: STAFF (LECTURER / DEPT ADMIN) LIST VIEW
  // ==========================================
  if (isStaff && !selectedStudentId) {
    const isLecturer = activeRole === 'lecturer';
    const isDeptAdmin = activeRole === 'department_admin';

    return (
      <div className="max-w-7xl mx-auto space-y-6 font-sans">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-navy tracking-tight">
                  {isLecturer
                    ? 'Portal Bimbingan Akademik (Dosen PA)'
                    : isDeptAdmin
                    ? 'Monitoring & Pengelolaan Akademik Jurusan'
                    : 'Manajemen Rekam Akademik Kampus PNL'}
                </h1>
                <Badge variant="blue" size="sm">
                  {isLecturer ? 'Dosen Pembimbing' : isDeptAdmin ? 'Admin Jurusan TIK' : 'Admin Kampus'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isLecturer
                  ? `Monitoring kemajuan studi mahasiswa bimbingan akademik oleh ${user?.name}. Pantau capaian IPK, persentase kelulusan SKS, dan evaluasi KHS per semester.`
                  : 'Pusat evaluasi prestasi studi mahasiswa Jurusan Teknologi Informasi & Komputer, input nilai KHS semester baru/maba, dan rekap transkrip akademik.'}
              </p>
            </div>
          </div>

          {/* Action: Input KHS Baru */}
          <button
            onClick={() => {
              if (students.length > 0 && !khsStudentId) {
                setKhsStudentId(students[0].id.toString());
              }
              setInputKHSModal(true);
            }}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input / Terbitkan KHS Baru (Termasuk Maba)</span>
          </button>
        </div>

        {/* Staff Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isLecturer ? 'Mahasiswa Bimbingan' : 'Total Mahasiswa Jurusan'}
              </span>
              <Users className="w-4 h-4 text-brand-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-navy">{staffSummary?.total_students || students.length}</div>
            <span className="text-[10px] text-slate-400">Terdaftar di Jurusan TIK PNL</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata IPK</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-navy">
              {staffSummary?.average_gpa ? Number(staffSummary.average_gpa).toFixed(2) : '3.85'}
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">Performa Sangat Memuaskan</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">On-Track (IPK ≥ 3.00)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-600">
              {staffSummary?.on_track_students ?? students.filter((s) => s.ipk >= 3.0).length}
            </div>
            <span className="text-[10px] text-slate-400">Siap Lulus Tepat Waktu</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Perlu Perhatian</span>
              <AlertCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-700">
              {staffSummary?.need_attention ?? students.filter((s) => s.ipk > 0 && s.ipk < 3.0).length}
            </div>
            <span className="text-[10px] text-slate-400">Butuh Konsultasi Tambahan</span>
          </div>
        </div>

        {/* Student Table & Search */}
        <div className="bg-white rounded-3xl border border-borderMuted shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-navy">
                {isLecturer ? 'Daftar Mahasiswa Bimbingan Akademik' : 'Daftar Mahasiswa Jurusan Teknologi Informasi & Komputer'}
              </h2>
              <p className="text-xs text-slate-400">Pilih mahasiswa untuk meninjau detail KHS, transkrip nilai, dan grafik IPS/IPK</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama, NIM, atau email..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          {loadingList ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
              Memuat data mahasiswa bimbingan & jurusan...
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-sm">Tidak ada data mahasiswa ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1">Gunakan tombol di atas untuk menerbitkan KHS pertama bagi mahasiswa baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Mahasiswa</th>
                    <th className="p-3.5">NIM</th>
                    <th className="p-3.5">Prodi & Jurusan</th>
                    <th className="p-3.5 text-center">Semester</th>
                    <th className="p-3.5 text-center">IPK Kumulatif</th>
                    <th className="p-3.5 text-center">SKS Lulus</th>
                    <th className="p-3.5 text-right">Aksi Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={stu.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(stu.name)}&background=2563EB&color=fff`}
                            alt={stu.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{stu.name}</div>
                            <div className="text-[10px] text-slate-400">{stu.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-600">{stu.nim}</td>
                      <td className="p-3.5 text-slate-600">{stu.department}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 text-slate-700">
                          Sem {stu.semester}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        {stu.ipk > 0 ? (
                          <div className="inline-flex items-center gap-1 font-mono font-extrabold text-brand-600 text-xs">
                            <span>{stu.ipk.toFixed(2)}</span>
                            {stu.ipk >= 3.5 && <span className="text-[10px]">✨</span>}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded-md border border-amber-200">
                            Maba / Belum Ada KHS
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-700">
                        {stu.sks_passed} <span className="text-[10px] text-slate-400 font-normal">/ 144</span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleOpenStudentDetail(stu.id)}
                          className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-xs transition-colors border border-brand-200"
                        >
                          Lihat Detail KHS →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Input / Terbitkan KHS Baru */}
        <Modal
          isOpen={inputKHSModal}
          onClose={() => setInputKHSModal(false)}
          title="Input / Terbitkan KHS Mahasiswa (Termasuk Maba)"
          maxWidth="2xl"
        >
          <form onSubmit={handleSubmitKHS} className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
              <strong>Form Input Akademik:</strong> Gunakan form ini untuk memasukkan nilai mata kuliah semester berjalan atau menerbitkan KHS pertama bagi Mahasiswa Baru (Maba). Nilai IPK akan dihitung secara otomatis.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block uppercase mb-1">Pilih Mahasiswa</label>
                <select
                  value={khsStudentId}
                  onChange={(e) => setKhsStudentId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
                  required
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.nim})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block uppercase mb-1">Semester Ke-</label>
                <input
                  type="number"
                  min={1}
                  max={14}
                  value={khsSemesterNumber}
                  onChange={(e) => setKhsSemesterNumber(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block uppercase mb-1">Label Semester</label>
                <input
                  type="text"
                  value={khsSemesterName}
                  onChange={(e) => setKhsSemesterName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  required
                />
              </div>
            </div>

            {/* Courses Table Inputs */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-800 uppercase text-[11px]">Daftar Mata Kuliah & Nilai</span>
                <button
                  type="button"
                  onClick={handleAddCourseRow}
                  className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors border border-brand-200"
                >
                  <Plus className="w-3 h-3" />
                  Tambah Baris MK
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {khsCourses.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <input
                      type="text"
                      placeholder="Kode MK"
                      value={c.course_code}
                      onChange={(e) => handleUpdateCourseRow(idx, 'course_code', e.target.value)}
                      className="w-24 p-1.5 border border-slate-200 rounded-lg bg-white text-xs font-mono"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Nama Mata Kuliah..."
                      value={c.course_name}
                      onChange={(e) => handleUpdateCourseRow(idx, 'course_name', e.target.value)}
                      className="flex-1 p-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                      required
                    />
                    <select
                      value={c.sks}
                      onChange={(e) => handleUpdateCourseRow(idx, 'sks', parseInt(e.target.value))}
                      className="w-20 p-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold"
                    >
                      <option value={1}>1 SKS</option>
                      <option value={2}>2 SKS</option>
                      <option value={3}>3 SKS</option>
                      <option value={4}>4 SKS</option>
                      <option value={6}>6 SKS</option>
                    </select>
                    <select
                      value={c.grade}
                      onChange={(e) => handleUpdateCourseRow(idx, 'grade', e.target.value)}
                      className="w-20 p-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-brand-600"
                    >
                      <option value="A">A (4.0)</option>
                      <option value="A-">A- (3.7)</option>
                      <option value="B+">B+ (3.3)</option>
                      <option value="B">B (3.0)</option>
                      <option value="B-">B- (2.7)</option>
                      <option value="C+">C+ (2.3)</option>
                      <option value="C">C (2.0)</option>
                      <option value="D">D (1.0)</option>
                      <option value="E">E (0.0)</option>
                    </select>
                    {khsCourses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCourseRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Hapus baris"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setInputKHSModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={savingKHS}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>{savingKHS ? 'Menyimpan...' : 'Simpan & Terbitkan KHS'}</span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: INDIVIDUAL STUDENT KHS / TRANSCRIPT VIEW
  // (Used by student themselves OR by staff inspecting a specific student)
  // ==========================================
  if (loadingDetail) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center font-sans">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold text-slate-500">Memuat rekam jejak akademik mahasiswa...</p>
      </div>
    );
  }

  const summary = data?.summary;
  const student = data?.student;
  const chartData = data?.chart_data || [];
  const activeCourses = data?.active_courses || [];
  const semesters: Semester[] = data?.all_semesters || [];
  const isMabaWithoutKHS = semesters.length === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* If Staff is viewing a specific student, render Top Back Button */}
      {isStaff && selectedStudentId && (
        <div className="flex items-center justify-between pb-1">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-brand-600" />
            <span>← Kembali ke Daftar Mahasiswa {activeRole === 'lecturer' ? 'Bimbingan' : 'Jurusan'}</span>
          </button>

          <button
            onClick={() => {
              setKhsStudentId(selectedStudentId.toString());
              setKhsSemesterNumber((semesters.length || 0) + 1);
              setKhsSemesterName(`Semester ${(semesters.length || 0) + 1} 2026/2027`);
              setInputKHSModal(true);
            }}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Input Nilai Semester Baru Mahasiswa Ini</span>
          </button>
        </div>
      )}

      {/* Simulation Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Simulasi Portal Akademik:</strong> Data nilai dan SKS di halaman ini disajikan untuk demonstrasi perkembangan studi internal Politeknik Negeri Lhokseumawe.
          </span>
        </div>
        <button
          onClick={handleDownloadTranscript}
          className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-200 shrink-0 flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Cetak Ringkasan</span>
        </button>
      </div>

      {/* For Maba without KHS yet: Welcome & Guidance Banner */}
      {isMabaWithoutKHS && (
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-navy text-sm">
              Selamat Datang Mahasiswa Baru Politeknik Negeri Lhokseumawe (Semester 1)!
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Saat ini Anda berada di Semester 1. Nilai KHS (Kartu Hasil Studi) dan Indeks Prestasi Kumulatif (IPK) Anda akan terbit secara otomatis setelah Ujian Akhir Semester (UAS) diinput dan divalidasi oleh Dosen Pengampu & Pengelola Akademik Jurusan.
            </p>
            <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-brand-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> KRS Terdaftar Aktif
              </span>
              <span>•</span>
              <span>Presensi Wajib Ujian: Min. 75%</span>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-brand-500/20">
            {student?.name?.charAt(0) || 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-navy tracking-tight">{student?.name}</h1>
              <Badge variant="blue" size="sm">{student?.status}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              NIM: <span className="font-mono font-bold text-slate-700">{student?.nim}</span> • {student?.department} ({student?.faculty})
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Institusi: <strong>{student?.university}</strong> • Dosen Pembimbing: <strong>{student?.academic_advisor}</strong>
            </p>
          </div>
        </div>

        {/* Quick Graduation Progress */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 min-w-[260px]">
          <div className="flex justify-between items-center text-xs font-bold mb-1.5">
            <span className="text-slate-600">Kelulusan SKS Target (144)</span>
            <span className="text-brand-600">{summary?.completion_percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${summary?.completion_percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1.5">
            <span>{summary?.total_sks_passed} SKS Lulus</span>
            <span>Sisa {summary?.remaining_sks} SKS</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cumulative GPA */}
        <div className="bg-white p-5 rounded-3xl border border-borderMuted shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indeks Prestasi Kumulatif (IPK)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-navy">{summary?.cumulative_gpa?.toFixed(2)}</span>
            {summary?.cumulative_gpa >= 3.5 ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Pujian (Cum Laude)
              </span>
            ) : summary?.cumulative_gpa > 0 ? (
              <span className="text-xs font-bold text-brand-600">Sangat Memuaskan</span>
            ) : (
              <span className="text-xs font-bold text-slate-400">Belum Terbit (Maba)</span>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Skala 4.00 Standar Nasional</span>
        </div>

        {/* SKS Passed */}
        <div className="bg-white p-5 rounded-3xl border border-borderMuted shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total SKS Ditempuh</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-brand-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-navy">{summary?.total_sks_taken}</span>
            <span className="text-xs text-slate-400 font-bold">/ 144 SKS</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">100% Mata Kuliah Prasyarat Terpenuhi</span>
        </div>

        {/* Average Attendance */}
        <div className="bg-white p-5 rounded-3xl border border-borderMuted shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata Presensi</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-navy">{summary?.average_attendance}%</span>
            <span className="text-xs font-bold text-emerald-600">Sangat Baik</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Minimal Kehadiran Ujian 75%</span>
        </div>

        {/* Remaining Semesters */}
        <div className="bg-white p-5 rounded-3xl border border-borderMuted shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Semester</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-navy">
              Semester {semesters.length > 0 ? semesters[semesters.length - 1].semester_number : 1}
            </span>
            <span className="text-xs font-bold text-brand-600">Aktif</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Estimasi Lulus: Tepat Waktu (8 Semester)</span>
        </div>
      </div>

      {/* Progress Chart & Active Courses */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GPA & IPS Progression Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-borderMuted shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-extrabold text-navy">Grafik Perkembangan Indeks Prestasi (IPS & IPK)</h2>
                <p className="text-xs text-slate-400">Tren kenaikan prestasi akademik semester demi semester</p>
              </div>
              <span className="px-2.5 py-1 bg-brand-50 text-brand-700 font-bold text-[10px] rounded-lg">
                Performa Konsisten Naik
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIpk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorIps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="semester" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[3.0, 4.0]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="ipk" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIpk)" name="IPK Kumulatif" />
                  <Area type="monotone" dataKey="ips" stroke="#10B981" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorIps)" name="IPS Semester" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Semester Courses Card */}
          <div className="bg-white p-6 rounded-3xl border border-borderMuted shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-navy">Mata Kuliah Semester Ini</h2>
              <span className="text-[10px] font-bold text-slate-400">
                Semester {semesters.length > 0 ? semesters[semesters.length - 1].semester_number : 1} Aktif
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activeCourses.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Belum ada jadwal mata kuliah aktif yang terdata di semester ini.
                </div>
              ) : (
                activeCourses.map((c: Course) => (
                  <div key={c.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-brand-600 block">{c.course_code} ({c.sks} SKS)</span>
                        <h3 className="font-bold text-xs text-navy leading-snug">{c.course_name}</h3>
                      </div>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-[10px]">
                        Berjalan
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200/50">
                      <span className="truncate max-w-[140px]">{c.lecturer_name}</span>
                      <span className="font-bold text-emerald-600">Presensi: {c.attendance_percentage}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Complete Semester History Accordions */}
      <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-navy">Riwayat Hasil Studi Per Semester (KHS)</h2>
          <p className="text-xs text-slate-400">Daftar lengkap seluruh mata kuliah yang telah ditempuh beserta nilai huruf dan mutu</p>
        </div>

        {semesters.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
            <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <div className="font-bold text-slate-700">Belum ada KHS yang diterbitkan</div>
            <div className="mt-1 text-slate-400">Nilai akan muncul setelah dosen menginput nilai semester.</div>
          </div>
        ) : (
          <div className="space-y-3">
            {semesters.map((sem) => {
              const isExpanded = expandedSemester === sem.semester_number;
              return (
                <div key={sem.id} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setExpandedSemester(isExpanded ? null : sem.semester_number)}
                    className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-700 font-black flex items-center justify-center text-xs">
                        {sem.semester_number}
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-navy">{sem.semester_name}</h3>
                        <span className="text-[10px] text-slate-400">
                          Total {sem.sks_taken} SKS • {sem.status === 'active' ? 'Sedang Berjalan' : 'Selesai'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">IPS / IPK</span>
                        <span className="font-extrabold text-xs text-navy font-mono">
                          {sem.gpa.toFixed(2)} / {sem.cumulative_gpa.toFixed(2)}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Kode MK</th>
                            <th className="p-2.5">Nama Mata Kuliah</th>
                            <th className="p-2.5 text-center">SKS</th>
                            <th className="p-2.5">Dosen Pengampu</th>
                            <th className="p-2.5 text-center">Kehadiran</th>
                            <th className="p-2.5 text-right">Nilai Akhir</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {sem.courses?.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-mono text-slate-500 font-bold">{c.course_code}</td>
                              <td className="p-2.5 font-bold text-navy">{c.course_name}</td>
                              <td className="p-2.5 text-center font-bold text-slate-600">{c.sks}</td>
                              <td className="p-2.5 text-slate-500 text-[11px]">{c.lecturer_name || '-'}</td>
                              <td className="p-2.5 text-center font-semibold text-emerald-600">{c.attendance_percentage}%</td>
                              <td className="p-2.5 text-right">{getGradeBadge(c.grade)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Input / Terbitkan KHS Baru (When viewing individual student) */}
      <Modal
        isOpen={inputKHSModal}
        onClose={() => setInputKHSModal(false)}
        title="Input / Terbitkan KHS Mahasiswa"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitKHS} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Semester Ke-</label>
              <input
                type="number"
                min={1}
                max={14}
                value={khsSemesterNumber}
                onChange={(e) => setKhsSemesterNumber(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Label Semester</label>
              <input
                type="text"
                value={khsSemesterName}
                onChange={(e) => setKhsSemesterName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 uppercase text-[11px]">Daftar Mata Kuliah & Nilai</span>
              <button
                type="button"
                onClick={handleAddCourseRow}
                className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors border border-brand-200"
              >
                <Plus className="w-3 h-3" />
                Tambah Baris MK
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {khsCourses.map((c, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <input
                    type="text"
                    placeholder="Kode MK"
                    value={c.course_code}
                    onChange={(e) => handleUpdateCourseRow(idx, 'course_code', e.target.value)}
                    className="w-24 p-1.5 border border-slate-200 rounded-lg bg-white text-xs font-mono"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Nama Mata Kuliah..."
                    value={c.course_name}
                    onChange={(e) => handleUpdateCourseRow(idx, 'course_name', e.target.value)}
                    className="flex-1 p-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                    required
                  />
                  <select
                    value={c.sks}
                    onChange={(e) => handleUpdateCourseRow(idx, 'sks', parseInt(e.target.value))}
                    className="w-20 p-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold"
                  >
                    <option value={1}>1 SKS</option>
                    <option value={2}>2 SKS</option>
                    <option value={3}>3 SKS</option>
                    <option value={4}>4 SKS</option>
                    <option value={6}>6 SKS</option>
                  </select>
                  <select
                    value={c.grade}
                    onChange={(e) => handleUpdateCourseRow(idx, 'grade', e.target.value)}
                    className="w-20 p-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-brand-600"
                  >
                    <option value="A">A (4.0)</option>
                    <option value="A-">A- (3.7)</option>
                    <option value="B+">B+ (3.3)</option>
                    <option value="B">B (3.0)</option>
                    <option value="B-">B- (2.7)</option>
                    <option value="C+">C+ (2.3)</option>
                    <option value="C">C (2.0)</option>
                    <option value="D">D (1.0)</option>
                    <option value="E">E (0.0)</option>
                  </select>
                  {khsCourses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCourseRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Hapus baris"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setInputKHSModal(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={savingKHS}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>{savingKHS ? 'Menyimpan...' : 'Simpan & Terbitkan KHS'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
