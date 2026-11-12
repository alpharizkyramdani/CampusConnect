import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { User, Role, University } from '../types';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  UserCog,
  Search,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  CheckCircle2,
  Building2,
  KeyRound,
  Mail,
  UserPlus,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user, activeAssignment, hasAnyRole } = useAuth();
  const isSuperAdmin = hasAnyRole(['super_admin']);
  const canManageUsers = hasAnyRole(['super_admin', 'campus_admin']);

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUnivFilter, setSelectedUnivFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Create User Modal (e.g. for provisioning Campus Admin on new campus)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Password123!');
  const [newUserRoleId, setNewUserRoleId] = useState('');
  const [newUserUnivId, setNewUserUnivId] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Assign Role Modal
  const [assignModalUser, setAssignModalUser] = useState<any | null>(null);
  const [roleId, setRoleId] = useState('');
  const [assignUnivId, setAssignUnivId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const targetUniv = isSuperAdmin
        ? (selectedUnivFilter ? parseInt(selectedUnivFilter) : undefined)
        : activeAssignment?.university_id;

      const [uRes, rRes, univRes] = await Promise.all([
        api.get('/users', {
          params: {
            university_id: targetUniv,
            role: selectedRole || undefined,
            status: selectedStatus || undefined,
            search: search || undefined,
          },
        }),
        api.get('/roles'),
        api.get('/universities'),
      ]);

      if (uRes.data.success) setUsers(uRes.data.data.data || uRes.data.data || []);
      if (rRes.data.success) {
        setRoles(rRes.data.data || []);
        if (!newUserRoleId && rRes.data.data?.length > 0) {
          const defaultCampusAdminRole = rRes.data.data.find((r: any) => r.slug === 'campus_admin');
          if (defaultCampusAdminRole) setNewUserRoleId(defaultCampusAdminRole.id.toString());
        }
      }
      if (univRes.data.success) {
        setUniversities(univRes.data.data || []);
        if (!newUserUnivId && univRes.data.data?.length > 0) {
          setNewUserUnivId(univRes.data.data[0].id.toString());
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus, selectedUnivFilter, activeAssignment]);

  const handleToggleStatus = async (targetUser: any) => {
    const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    if (!window.confirm(`Are you sure you want to change ${targetUser.name}'s account status to ${newStatus}?`)) return;

    try {
      const res = await api.put(`/users/${targetUser.id}/status`, { status: newStatus });
      if (res.data.success) {
        setFeedbackMsg({ type: 'success', text: `Status updated for ${targetUser.name}.` });
        fetchUsers();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Status change failed.' });
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setFeedbackMsg(null);

    try {
      const targetUniv = isSuperAdmin
        ? (newUserUnivId ? parseInt(newUserUnivId) : null)
        : (activeAssignment?.university_id || null);

      const res = await api.post('/users', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role_id: parseInt(newUserRoleId),
        university_id: targetUniv,
      });

      if (res.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Account created successfully! ${newUserName} can now login with ${newUserEmail}.`,
        });
        setCreateModalOpen(false);
        setNewUserName('');
        setNewUserEmail('');
        fetchUsers();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create user account.' });
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalUser || !roleId) return;
    setAssigning(true);

    try {
      const targetUniv = isSuperAdmin
        ? (assignUnivId ? parseInt(assignUnivId) : (assignModalUser.default_university_id || null))
        : (activeAssignment?.university_id || null);

      const res = await api.post(`/users/${assignModalUser.id}/assign-role`, {
        role_id: parseInt(roleId),
        university_id: targetUniv,
        department_id: activeAssignment?.department_id || null,
      });

      if (res.data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Role assigned successfully to ${assignModalUser.name}.`,
        });
        setAssignModalUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Failed to assign role.' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy tracking-tight flex items-center gap-2.5">
            <UserCog className="w-6 h-6 text-brand-600" />
            User & Scoped Role Governance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage campus user accounts, provision administrators, assign contextual roles, and govern access across universities
          </p>
        </div>

        {canManageUsers && (
          <button
            onClick={() => {
              setCreateModalOpen(true);
              setFeedbackMsg(null);
            }}
            className="px-4 py-2.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create User / Campus Admin</span>
          </button>
        )}
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderMuted shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {isSuperAdmin && (
            <select
              value={selectedUnivFilter}
              onChange={(e) => setSelectedUnivFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              <option value="">All Universities</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>{u.code} - {u.name}</option>
              ))}
            </select>
          )}

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.slug}>{r.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-borderMuted shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <UserCog className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-sm">No user accounts found</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Active Role Assignments</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.role_assignments?.map((a: any) => (
                          <span
                            key={a.id}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200"
                          >
                            {a.role?.name} {a.university ? `(${a.university.code})` : ''}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.status === 'active' ? 'emerald' : u.status === 'suspended' ? 'rose' : 'amber'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setAssignModalUser(u);
                          setRoleId('');
                          setAssignUnivId(u.default_university_id?.toString() || '');
                        }}
                        className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg transition-colors"
                      >
                        + Assign Role
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                          u.status === 'active'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create User / Campus Admin */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision New User / Campus Administrator"
      >
        <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
          <p className="text-xs text-slate-500">
            Create a new account and immediately assign administrative or academic roles to manage campus tenancies.
          </p>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ir. Muhammad Syahputra, M.T."
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. admin@pnl.ac.id"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Initial Password</label>
              <input
                type="password"
                required
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Assigned Role</label>
              <select
                required
                value={newUserRoleId}
                onChange={(e) => setNewUserRoleId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} ({r.scope_level})</option>
                ))}
              </select>
            </div>

            {isSuperAdmin && (
              <div>
                <label className="font-bold text-slate-700 block uppercase mb-1">Target University</label>
                <select
                  required
                  value={newUserUnivId}
                  onChange={(e) => setNewUserUnivId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
                >
                  {universities.map((u) => (
                    <option key={u.id} value={u.id}>{u.code} - {u.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingUser}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>{creatingUser ? 'Creating...' : 'Create & Provision Account'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Role Modal */}
      <Modal
        isOpen={!!assignModalUser}
        onClose={() => setAssignModalUser(null)}
        title={`Assign Contextual Role: ${assignModalUser?.name}`}
      >
        <form onSubmit={handleAssignRoleSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 leading-relaxed">
            Assigning an additional role enables multi-role access. The user can switch seamlessly between roles in their navbar.
          </div>

          <div>
            <label className="font-bold text-slate-700 block uppercase mb-1">Select Role</label>
            <select
              required
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
            >
              <option value="">Select Role...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name} ({r.scope_level})</option>
              ))}
            </select>
          </div>

          {isSuperAdmin && (
            <div>
              <label className="font-bold text-slate-700 block uppercase mb-1">Target University Scope</label>
              <select
                value={assignUnivId}
                onChange={(e) => setAssignUnivId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold"
              >
                <option value="">Default Campus / Unrestricted</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.code} - {u.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={assigning}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {assigning ? 'Assigning...' : 'Confirm Role Assignment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

