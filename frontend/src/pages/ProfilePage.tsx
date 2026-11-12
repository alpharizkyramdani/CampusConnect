import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/ui/Badge';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  GraduationCap,
  Shield,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, studentProfile, lecturerProfile, roleAssignments, activeAssignment } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-navy tracking-tight">Account Profile & Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your verified identity, institutional credentials, and assigned platform roles
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-borderMuted shadow-xs text-center flex flex-col items-center">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563EB&color=fff`}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md ring-2 ring-brand-100"
          />
          <h2 className="mt-4 font-extrabold text-lg text-navy">{user?.name}</h2>
          <p className="text-xs text-slate-400">{user?.email}</p>

          <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
            {roleAssignments.map((a) => (
              <Badge key={a.id} variant="blue" size="sm">
                {a.role?.name}
              </Badge>
            ))}
          </div>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left text-xs space-y-3">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{user?.phone || 'No phone set'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Building className="w-4 h-4 text-slate-400" />
              <span className="truncate">{activeAssignment?.university?.name || 'CampusConnect System'}</span>
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs">
            <h3 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-brand-600" />
              Academic Credentials
            </h3>

            {studentProfile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Student ID (NIM)</span>
                  <span className="font-mono text-sm font-bold text-brand-700 block mt-0.5">{studentProfile.nim}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Study Program</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProfile.study_program || 'Informatics'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Enrollment Year</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProfile.enrollment_year || 2022}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Department</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{studentProfile.department?.name || 'Informatics Engineering'}</span>
                </div>
              </div>
            )}

            {lecturerProfile && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Lecturer ID (NIDN)</span>
                  <span className="font-mono text-sm font-bold text-brand-700 block mt-0.5">{lecturerProfile.nidn}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Academic Title</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{lecturerProfile.title || 'Dr.'}</span>
                </div>
                <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase block text-[10px]">Specialization</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">{lecturerProfile.specialization || 'Computer Science'}</span>
                </div>
              </div>
            )}

            {!studentProfile && !lecturerProfile && (
              <div className="text-xs text-slate-500 py-4">
                Platform-level administrator account.
              </div>
            )}
          </div>

          {/* Active Contextual Assignments */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderMuted shadow-xs">
            <h3 className="text-base font-bold text-navy mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-600" />
              Active Scoped Role Assignments
            </h3>

            <div className="space-y-3">
              {roleAssignments.map((a) => (
                <div key={a.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {a.role?.name}
                      {a.id === activeAssignment?.id && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-brand-600 text-white font-bold">
                          Current Active
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Scope: {a.organization?.name || a.department?.name || a.university?.name || 'Platform Wide'}
                    </div>
                  </div>
                  <Badge variant={a.status === 'active' ? 'emerald' : 'slate'} size="sm">
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
