import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { RoleSwitcher } from './RoleSwitcher';
import { NotificationDropdown } from './NotificationDropdown';
import { Menu, LogOut, User as UserIcon, Building2, ChevronDown, Sparkles, Settings, MessageSquare, Search, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, activeAssignment, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const universityName = activeAssignment?.university?.name || 'Platform View';
  const universityCode = activeAssignment?.university?.code;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-borderMuted h-16 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Brand/Scope */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* University Tenant Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 rounded-xl transition-all cursor-pointer">
          <Building2 className="w-4 h-4 text-brand-600" />
          <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
            <span className="truncate max-w-[140px] sm:max-w-[220px]">{universityName}</span>
            {universityCode && (
              <span className="px-1.5 py-0.5 bg-brand-600 text-white text-[10px] rounded-md font-mono">
                {universityCode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-3 hidden md:block">
        <button
          onClick={() => navigate('/search')}
          className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-slate-400 bg-slate-100/80 hover:bg-slate-200/70 border border-slate-200 rounded-xl transition-all text-left shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
          <span className="flex-1 truncate">Cari civitas, event, buku, lowongan, gedung...</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
            /search
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => navigate('/search')}
          className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors md:hidden"
          title="Pencarian Global"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Role Switcher */}
        <RoleSwitcher />

        {/* Messages */}
        <Link
          to="/messages"
          className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors relative"
          title="Pesan Kampus (DM)"
        >
          <MessageSquare className="w-5 h-5" />
        </Link>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563EB&color=fff`}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 ring-2 ring-brand-100"
            />
            <div className="hidden md:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-900 truncate max-w-[120px]">{user?.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>

                <Link
                  to="/portfolio"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  Student Portfolio
                </Link>

                <Link
                  to="/settings/privacy"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Privasi & Keamanan Akun
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </Link>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

