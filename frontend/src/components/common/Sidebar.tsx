import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  CalendarCheck2,
  QrCode,
  PackageCheck,
  Wrench,
  Search,
  Users2,
  FileCheck2,
  Award,
  BookOpen,
  FolderLock,
  MessagesSquare,
  Sparkles,
  BarChart3,
  UserCog,
  History,
  Building,
  GraduationCap,
  X,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { activeRole } = useAuth();

  // Role-based menu configuration
  const getNavSections = () => {
    switch (activeRole) {
      case 'super_admin':
        return [
          {
            title: 'Platform Administration',
            items: [
              { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Universities', icon: Building, path: '/universities-manage' },
              { label: 'User Directory', icon: UserCog, path: '/users' },
              { label: 'Platform Analytics', icon: BarChart3, path: '/analytics' },
              { label: 'System Audit Logs', icon: History, path: '/audit-logs' },
            ],
          },
        ];

      case 'campus_admin':
        return [
          {
            title: 'Campus Management',
            items: [
              { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Announcements', icon: Megaphone, path: '/announcements' },
              { label: 'Academic Calendar', icon: CalendarDays, path: '/calendar' },
              { label: 'Campus Events', icon: CalendarCheck2, path: '/events' },
              { label: 'QR Ticket Scanner', icon: QrCode, path: '/scanner' },
              { label: 'Organizations Hub', icon: Users2, path: '/organizations' },
              { label: 'Equipment Inventory', icon: PackageCheck, path: '/facilities' },
              { label: 'Borrowing Records', icon: History, path: '/borrowings' },
              { label: 'Maintenance Reports', icon: Wrench, path: '/maintenance' },
              { label: 'Student Services', icon: FileCheck2, path: '/services' },
              { label: 'Campus Directory', icon: BookOpen, path: '/directory' },
              { label: 'Document Center', icon: FolderLock, path: '/documents' },
              { label: 'User Management', icon: UserCog, path: '/users' },
              { label: 'Campus Analytics', icon: BarChart3, path: '/analytics' },
            ],
          },
        ];

      case 'department_admin':
        return [
          {
            title: 'Department Unit',
            items: [
              { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Equipment Inventory', icon: PackageCheck, path: '/facilities' },
              { label: 'Borrowing Approvals', icon: History, path: '/borrowings' },
              { label: 'Maintenance Reports', icon: Wrench, path: '/maintenance' },
              { label: 'Announcements', icon: Megaphone, path: '/announcements' },
              { label: 'Academic Calendar', icon: CalendarDays, path: '/calendar' },
            ],
          },
        ];

      case 'ukm_admin':
      case 'ormawa_admin':
        return [
          {
            title: 'Organization Console',
            items: [
              { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'My Organization', icon: Users2, path: '/organizations' },
              { label: 'Manage Events', icon: CalendarCheck2, path: '/events' },
              { label: 'QR Attendance Scanner', icon: QrCode, path: '/scanner' },
              { label: 'Announcements', icon: Megaphone, path: '/announcements' },
              { label: 'Campus Directory', icon: BookOpen, path: '/directory' },
            ],
          },
        ];

      case 'lecturer':
        return [
          {
            title: 'Academic Portal',
            items: [
              { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Campus Announcements', icon: Megaphone, path: '/announcements' },
              { label: 'Academic Calendar', icon: CalendarDays, path: '/calendar' },
              { label: 'Campus Events', icon: CalendarCheck2, path: '/events' },
              { label: 'Campus Directory', icon: BookOpen, path: '/directory' },
              { label: 'Discussion Space', icon: MessagesSquare, path: '/discussions' },
            ],
          },
        ];

      case 'student':
      default:
        return [
          {
            title: 'Student Hub',
            items: [
              { label: 'My Dashboard', icon: LayoutDashboard, path: '/dashboard' },
              { label: 'Campus Announcements', icon: Megaphone, path: '/announcements' },
              { label: 'Campus Events & Tickets', icon: CalendarCheck2, path: '/events' },
              { label: 'Academic Calendar', icon: CalendarDays, path: '/calendar' },
              { label: 'Borrow Equipment', icon: PackageCheck, path: '/facilities' },
              { label: 'My Borrowings', icon: History, path: '/borrowings' },
              { label: 'Maintenance Reports', icon: Wrench, path: '/maintenance' },
              { label: 'Lost & Found', icon: Search, path: '/lost-found' },
              { label: 'Organizations (UKM/BEM)', icon: Users2, path: '/organizations' },
              { label: 'Student Services', icon: FileCheck2, path: '/services' },
              { label: 'Digital Certificates', icon: Award, path: '/certificates' },
              { label: 'Activity Portfolio', icon: Sparkles, path: '/portfolio' },
              { label: 'Discussion Space', icon: MessagesSquare, path: '/discussions' },
              { label: 'Campus Directory', icon: BookOpen, path: '/directory' },
            ],
          },
        ];
    }
  };

  const sections = getNavSections();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-navy-dark text-white z-50 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                CampusConnect
              </div>
              <div className="text-[10px] text-brand-300 font-medium tracking-wide">
                MULTI-CAMPUS SYSTEM
              </div>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item, i) => (
                  <NavLink
                    key={i}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tagline */}
        <div className="p-4 border-t border-white/10 text-center">
          <div className="text-[11px] text-slate-400 italic font-medium">
            "One Platform, Every Campus, Connected."
          </div>
        </div>
      </aside>
    </>
  );
};
