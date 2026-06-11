'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, Users, BookOpen, TrendingUp, ArrowRight, Copy, CheckCircle, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { userApi } from '@/lib/api';
import { DashboardStats } from '@/types';
import { formatCurrency, formatDateTime, generateReferralLink } from '@/lib/utils';

function StatCard({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string; color: string; sub?: string }) {
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="mt-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    userApi.getDashboard()
      .then(res => setStats(res.data.data))
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const referralLink = user ? generateReferralLink(user.referral_code) : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="hero-gradient rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <p className="text-blue-200 text-sm font-medium mb-1">Welcome back 👋</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">{user?.username}</h1>
        <p className="text-blue-100 text-sm">
          Membership: <span className={`font-semibold ${user?.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {user?.status === 'active' ? '✓ Active' : '⚠ Pending Activation'}
          </span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Balance" value={formatCurrency(stats?.balance ?? user?.balance ?? 0)}
          color="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" sub="Available" />
        <StatCard icon={Users} label="Referrals" value={String(stats?.total_referrals ?? 0)}
          color="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" sub="Total" />
        <StatCard icon={BookOpen} label="Courses" value={String(stats?.courses_purchased ?? 0)}
          color="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" sub="Enrolled" />
        <StatCard icon={TrendingUp} label="Earnings" value={formatCurrency(stats?.referral_earnings ?? 0)}
          color="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" sub="From referrals" />
      </div>

      {/* Announcements */}
      {stats?.announcements && stats.announcements.length > 0 && (
        <div className="card border-l-4 border-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-bold text-slate-900 dark:text-white">Announcements</h2>
          </div>
          <div className="space-y-3">
            {stats.announcements.map((ann) => (
              <div key={ann.id} className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{ann.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{ann.message}</p>
                <p className="text-xs text-slate-400 mt-2">{formatDateTime(ann.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Referral Card */}
        <div className="card">
          <h2 className="font-display font-bold text-slate-900 dark:text-white mb-1">Your Referral Link</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Earn ₦500 for every friend who activates their membership</p>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
            <p className="text-xs text-slate-400 mb-1">Your Code</p>
            <p className="font-mono font-bold text-primary-600 text-lg">{user?.referral_code}</p>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
              {referralLink}
            </div>
            <button onClick={copyReferralLink} className={`btn-primary py-2 px-4 text-sm flex items-center gap-1.5 ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}>
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-slate-500">Total earned from referrals:</span>
            <span className="font-bold text-emerald-600">{formatCurrency(stats?.referral_earnings ?? 0)}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { href: '/dashboard/courses', label: 'Browse All Courses', icon: BookOpen, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { href: '/dashboard/my-courses', label: 'My Enrolled Courses', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
              { href: '/dashboard/referrals', label: 'View Referral History', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              { href: '/dashboard/withdrawal', label: 'Withdrawal', icon: DollarSign, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-4 h-4" />
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-medium text-sm flex-1">{action.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recent_activity && stats.recent_activity.length > 0 && (
        <div className="card">
          <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recent_activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(item.created_at)}</p>
                </div>
                {item.amount && (
                  <span className={`font-bold text-sm ${item.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
