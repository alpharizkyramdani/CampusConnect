import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, ChevronDown, CheckCircle } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { roleAssignments, activeAssignment, switchRole } = useAuth();
  const [open, setOpen] = React.useState(false);

  if (roleAssignments.length <= 1) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold rounded-full">
        <Shield className="w-3.5 h-3.5" />
        <span>{activeAssignment?.role?.name || 'User'}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-xs font-semibold rounded-lg transition-colors"
      >
        <Shield className="w-3.5 h-3.5 text-brand-600" />
        <span className="max-w-[120px] truncate">{activeAssignment?.role?.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-brand-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Switch Active Role
            </div>
            {roleAssignments.map((assignment) => {
              const isActive = assignment.id === activeAssignment?.id;
              const subtext = assignment.organization?.name || assignment.department?.name || assignment.university?.name || 'Platform Level';

              return (
                <button
                  key={assignment.id}
                  onClick={() => {
                    switchRole(assignment.id);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-slate-50 transition-colors ${
                    isActive ? 'bg-brand-50/70 text-brand-700 font-medium' : 'text-slate-700'
                  }`}
                >
                  <div className="mt-0.5">
                    {isActive ? (
                      <CheckCircle className="w-4 h-4 text-brand-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold truncate">{assignment.role?.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{subtext}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
