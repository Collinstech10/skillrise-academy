'use client';
import { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, UserX, Trash2, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { User } from '@/types';
import { formatDate, formatCurrency, cn } from '@/lib/utils';

const STATUS_FILTERS = ['all', 'active', 'pending', 'suspended'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search, status: statusFilter !== 'all' ? statusFilter : undefined });
      setUsers(res.data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleStatusChange = async (userId: string, status: string) => {
    setActionLoading(userId + status);
    try {
      await adminApi.updateUserStatus(userId, status);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: status as User['status'] } : u));
      toast.success(`User ${status} successfully`);
    } catch {
      toast.error('Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    setActionLoading(userId + 'delete');
    try {
      await adminApi.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all registered users</p>
        </div>
        <button onClick={fetchUsers} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-400' },
          { label: 'Active', value: stats.active, color: 'text-emerald-400' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
          { label: 'Suspended', value: stats.suspended, color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
            <p className={cn('font-display text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-slate-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-500"
            placeholder="Search by name, email, username..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize',
                statusFilter === f ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              )}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-px">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  {['User', 'Contact', 'Balance', 'Status', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {user.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.fullname}</p>
                          <p className="text-slate-500 text-xs">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-300 text-xs">{user.email}</p>
                      <p className="text-slate-500 text-xs">{user.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-emerald-400 font-medium">{formatCurrency(user.balance)}</td>
                    <td className="px-4 py-3">
                      <span className={cn('badge',
                        user.status === 'active' ? 'badge-success' :
                        user.status === 'suspended' ? 'badge-danger' : 'badge-warning'
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', user.role === 'admin' ? 'badge-info' : 'bg-slate-700 text-slate-300')}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {user.status !== 'active' && (
                          <button onClick={() => handleStatusChange(user.id, 'active')}
                            disabled={!!actionLoading}
                            title="Activate"
                            className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg transition-all disabled:opacity-50">
                            {actionLoading === user.id + 'active'
                              ? <div className="w-3.5 h-3.5 border border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                              : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {user.status !== 'suspended' && (
                          <button onClick={() => handleStatusChange(user.id, 'suspended')}
                            disabled={!!actionLoading}
                            title="Suspend"
                            className="p-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 rounded-lg transition-all disabled:opacity-50">
                            {actionLoading === user.id + 'suspended'
                              ? <div className="w-3.5 h-3.5 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                              : <UserX className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button onClick={() => handleDelete(user.id, user.fullname)}
                          disabled={!!actionLoading}
                          title="Delete"
                          className="p-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all disabled:opacity-50">
                          {actionLoading === user.id + 'delete'
                            ? <div className="w-3.5 h-3.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
