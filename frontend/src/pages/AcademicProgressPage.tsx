import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/ui/Badge';
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
  id: number;
  course_code: string;
  course_name: string;
  sks: number;
  grade: string;
  grade_point: number;
  attendance_percentage: number;
  lecturer_name: string;
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

export const AcademicProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null);

  const fetchAcademicData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic-progress');
      if (res.data.success) {
        setData(res.data.data);
        // Expand the active semester by default
        const activeSem = res.data.data.all_semesters?.find((s: Semester) => s.status === 'active');
        if (activeSem) {
          setExpandedSemester(activeSem.semester_number);
        }
      }
    } catch (e) {
      console.error('Failed to load academic progress:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const handleDownloadTranscript = () => {
    window.print();
  };

  const getGradeBadge = (grade: string) => {
    if (grade === 'A') return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md text-xs">A (4.00)</span>;
    if (grade === 'A-') return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md text-xs">A- (3.70)</span>;
    if (grade.startsWith('B')) return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md text-xs">{grade}</span>;
    if (grade === 'IP') return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md text-xs">Berjalan (IP)</span>;
    return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-xs">{grade}</span>;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center">
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Simulation Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Simulasi Portal Akademik:</strong> Data nilai dan SKS di halaman ini disajikan untuk demonstrasi perkembangan studi internal dan tidak terhubung ke PDDikti/SIAKAD eksternal.
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
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Pujian (Cum Laude)
            </span>
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
            <span className="text-3xl font-black text-navy">Semester 5</span>
            <span className="text-xs font-bold text-brand-600">Aktif</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Estimasi Lulus: Tepat Waktu (8 Semester)</span>
        </div>
      </div>

      {/* Progress Chart & Active Courses */}
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
            <span className="text-[10px] font-bold text-slate-400">Semester 5 Aktif</span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {activeCourses.map((c: Course) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Complete Semester History Accordions */}
      <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-navy">Riwayat Hasil Studi Per Semester (KHS)</h2>
          <p className="text-xs text-slate-400">Daftar lengkap seluruh mata kuliah yang telah ditempuh beserta nilai huruf dan mutu</p>
        </div>

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
      </div>
    </div>
  );
};

