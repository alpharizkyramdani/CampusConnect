import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, UserRoleAssignment, StudentProfile, LecturerProfile } from '../types';

interface AuthContextType {
  user: User | null;
  roleAssignments: UserRoleAssignment[];
  activeAssignment: UserRoleAssignment | null;
  activeRole: string;
  studentProfile: StudentProfile | null;
  lecturerProfile: LecturerProfile | null;
  unreadCount: number;
  loading: boolean;
  login: (data: any) => void;
  logout: () => Promise<void>;
  switchRole: (assignmentId: number) => void;
  refreshUser: () => Promise<void>;
  hasRole: (slug: string) => boolean;
  hasAnyRole: (slugs: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<UserRoleAssignment[]>([]);
  const [activeAssignment, setActiveAssignment] = useState<UserRoleAssignment | null>(null);
  const [activeRole, setActiveRole] = useState<string>('student');
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [lecturerProfile, setLecturerProfile] = useState<LecturerProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('campusconnect_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        const data = response.data.data;
        setUser(data.user);
        setRoleAssignments(data.role_assignments || []);
        setStudentProfile(data.student_profile || null);
        setLecturerProfile(data.lecturer_profile || null);
        setUnreadCount(data.unread_notifications || 0);

        // Check stored preferred role assignment
        const savedAssignmentId = localStorage.getItem('campusconnect_active_assignment_id');
        const found = data.role_assignments?.find((a: UserRoleAssignment) => a.id.toString() === savedAssignmentId);
        
        const currentActive = found || data.role_assignments?.[0] || null;
        setActiveAssignment(currentActive);
        setActiveRole(currentActive?.role?.slug || 'student');
      }
    } catch (err) {
      console.error('Failed to authenticate token:', err);
      localStorage.removeItem('campusconnect_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (data: any) => {
    localStorage.setItem('campusconnect_token', data.token);
    setUser(data.user);
    setRoleAssignments(data.role_assignments || []);
    const initialAssignment = data.active_assignment || data.role_assignments?.[0] || null;
    setActiveAssignment(initialAssignment);
    setActiveRole(initialAssignment?.role?.slug || data.active_role || 'student');
    if (initialAssignment) {
      localStorage.setItem('campusconnect_active_assignment_id', initialAssignment.id.toString());
    }
  };

  const switchRole = (assignmentId: number) => {
    const selected = roleAssignments.find((a) => a.id === assignmentId);
    if (selected) {
      setActiveAssignment(selected);
      setActiveRole(selected.role?.slug || 'student');
      localStorage.setItem('campusconnect_active_assignment_id', selected.id.toString());
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('campusconnect_token');
      localStorage.removeItem('campusconnect_active_assignment_id');
      setUser(null);
      setRoleAssignments([]);
      setActiveAssignment(null);
      setActiveRole('student');
    }
  };

  const hasRole = (slug: string) => {
    return roleAssignments.some((a) => a.role?.slug === slug && a.status === 'active');
  };

  const hasAnyRole = (slugs: string[]) => {
    return roleAssignments.some((a) => a.role?.slug && slugs.includes(a.role.slug) && a.status === 'active');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        roleAssignments,
        activeAssignment,
        activeRole,
        studentProfile,
        lecturerProfile,
        unreadCount,
        loading,
        login,
        logout,
        switchRole,
        refreshUser,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
