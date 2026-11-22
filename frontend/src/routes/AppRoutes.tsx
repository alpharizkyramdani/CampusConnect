import React from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { RoleName } from '../types';
import { Layout } from '../components/common/Layout';
import { PageTransition } from '../components/common/PageTransition';

// Public Pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { VerifyCertificatePage } from '../pages/VerifyCertificatePage';

// Protected Pages
import { DashboardPage } from '../pages/DashboardPage';
import { AnnouncementsPage } from '../pages/AnnouncementsPage';
import { EventsPage } from '../pages/EventsPage';
import { EventScannerPage } from '../pages/EventScannerPage';
import { AcademicCalendarPage } from '../pages/AcademicCalendarPage';
import { FacilitiesPage } from '../pages/FacilitiesPage';
import { BorrowingsPage } from '../pages/BorrowingsPage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { LostFoundPage } from '../pages/LostFoundPage';
import { OrganizationsPage } from '../pages/OrganizationsPage';
import { StudentServicesPage } from '../pages/StudentServicesPage';
import { CertificatesPage } from '../pages/CertificatesPage';
import { PortfolioPage } from '../pages/PortfolioPage';
import { DiscussionsPage } from '../pages/DiscussionsPage';
import { DirectoryPage } from '../pages/DirectoryPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { UserManagementPage } from '../pages/UserManagementPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { CampusFeedPage } from '../pages/CampusFeedPage';
import { MessagesPage } from '../pages/MessagesPage';
import { ModerationDashboardPage } from '../pages/ModerationDashboardPage';
import { AcademicProgressPage } from '../pages/AcademicProgressPage';
import { CampusMapPage } from '../pages/CampusMapPage';
import { CareerCenterPage } from '../pages/CareerCenterPage';
import { DigitalLibraryPage } from '../pages/DigitalLibraryPage';
import { GlobalSearchPage } from '../pages/GlobalSearchPage';
import { PrivacySettingsPage } from '../pages/PrivacySettingsPage';

interface ProtectedRouteProps {
  allowedRoles?: RoleName[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading, activeRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold text-slate-500">Memuat PNLConnect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && activeRole && !allowedRoles.includes(activeRole as RoleName)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages with Smooth Transition */}
      <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
      <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
      <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
      <Route path="/register-student" element={<PageTransition><RegisterPage /></PageTransition>} />
      <Route path="/register-lecturer" element={<PageTransition><RegisterPage /></PageTransition>} />
      <Route path="/verify" element={<PageTransition><VerifyCertificatePage /></PageTransition>} />
      <Route path="/verify/:hash" element={<PageTransition><VerifyCertificatePage /></PageTransition>} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analytics" element={<DashboardPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/scanner"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'campus_admin', 'ukm_admin', 'ormawa_admin']} />
            }
          >
            <Route index element={<EventScannerPage />} />
          </Route>
          <Route path="/calendar" element={<AcademicCalendarPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/borrowings" element={<BorrowingsPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/lost-found" element={<LostFoundPage />} />
          <Route path="/organizations" element={<OrganizationsPage />} />
          <Route path="/services" element={<StudentServicesPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/feed" element={<CampusFeedPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/discussions" element={<DiscussionsPage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/universities-manage" element={<DirectoryPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'campus_admin']} />
            }
          >
            <Route index element={<UserManagementPage />} />
          </Route>
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['super_admin']} />
            }
          >
            <Route index element={<AuditLogsPage />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/privacy" element={<PrivacySettingsPage />} />
          <Route path="/academic-progress" element={<AcademicProgressPage />} />
          <Route path="/campus-map" element={<CampusMapPage />} />
          <Route path="/career-center" element={<CareerCenterPage />} />
          <Route path="/digital-library" element={<DigitalLibraryPage />} />
          <Route path="/search" element={<GlobalSearchPage />} />
          <Route
            path="/moderation"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'campus_admin']} />
            }
          >
            <Route index element={<ModerationDashboardPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
