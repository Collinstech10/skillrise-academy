'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, BookOpen, DollarSign, ShoppingBag, TrendingUp, UserCheck, Clock, ChevronRight, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { AdminStats } from '@/types';
import { formatCurrency, formatDateTime, cn } from '@/lib/utils';

function AdminStatCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string; trend?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="font-display text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Platform analytics and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard icon={Users} label="Total Users" value={String(stats?.total_users ?? 0)}
          color="bg-blue-600/20 text-blue-400" trend="+12%" sub="Registered" />
        <AdminStatCard icon={UserCheck} label="Active Users" value={String(stats?.active_users ?? 0)}
          color="bg-emerald-600/20 text-emerald-400" trend="+8%" sub="Paid members" />
        <AdminStatCard icon={DollarSign} label="Total Revenue" value={formatCurrency(stats?.total_revenue ?? 0)}
          color="bg-amber-600/20 text-amber-400" trend="+23%" sub="All payments" />
        <AdminStatCard icon={ShoppingBag} label="Course Sales" value={String(stats?.total_course_sales ?? 0)}
          color="bg-purple-600/20 text-purple-400" trend="+15%" sub="Total purchases" />
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: '/admin/users', label: 'Manage Users', icon: Users, color: 'text-blue-400' },
          { href: '/admin/courses', label: 'Manage Courses', icon: BookOpen, color: 'text-purple-400' },
          { href: '/admin/payments', label: 'View Payments', icon: DollarSign, color: 'text-amber-400' },
          { href: '/admin/referrals', label: 'Referral Records', icon: Activity, color: 'text-emerald-400' },
          { href: '/admin/announcements', label: 'Announcements', icon: Activity, color: 'text-red-400' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 flex items-center gap-3 group transition-all">
            <item.icon className={cn('w-5 h-5', item.color)} />
            <span className="text-slate-300 group-hover:text-white text-sm font-medium transition-colors">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto transition-all group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Recent Users
            </h2>
            <Link href="/admin/users" className="text-xs text-primary-400 hover:text-primary-300 font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {(stats?.recent_users ?? []).slice(0, 5).map(user => (
              <div key={user.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.fullname?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.fullname}</p>
                  <p className="text-slate-500 text-xs truncate">{user.email}</p>
                </div>
                <span className={cn('badge text-xs',
                  user.status === 'active' ? 'badge-success' : user.status === 'suspended' ? 'badge-danger' : 'badge-warning'
                )}>
                  {user.status}
                </span>
              </div>
            ))}
            {!stats?.recent_users?.length && (
              <p className="text-slate-500 text-sm text-center py-4">No users yet</p>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" /> Recent Payments
            </h2>
            <Link href="/admin/payments" className="text-xs text-primary-400 hover:text-primary-300 font-medium">View all →</Link>
          </div>
          <div className="space-y-3">
            {(stats?.recent_payments ?? []).slice(0, 5).map(payment => (
              <div key={payment.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                <div className="w-8 h-8 bg-amber-600/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{payment.user?.fullname}</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {formatDateTime(payment.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-bold text-sm">{formatCurrency(payment.amount)}</p>
                  <span className={cn('badge text-xs',
                    payment.status === 'success' ? 'badge-success' : payment.status === 'failed' ? 'badge-danger' : 'badge-warning'
                  )}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
            {!stats?.recent_payments?.length && (
              <p className="text-slate-500 text-sm text-center py-4">No payments yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
