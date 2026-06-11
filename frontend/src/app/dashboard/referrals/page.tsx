'use client';
import { useEffect, useState } from 'react';
import { Users, Copy, CheckCircle, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Referral } from '@/types';
import { formatCurrency, formatDate, generateReferralLink } from '@/lib/utils';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuthStore();

  const referralLink = user ? generateReferralLink(user.referral_code) : '';
  const totalEarned = referrals.reduce((sum, r) => sum + r.reward, 0);

  useEffect(() => {
    userApi.getReferrals()
      .then(res => setReferrals(res.data.data))
      .catch(() => toast.error('Failed to load referrals'))
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Join SkillRise Academy', text: 'Learn digital skills and earn! Use my referral link:', url: referralLink });
    } else {
      copyLink();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Referral Program</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Earn ₦500 for every friend who activates their membership</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Referrals', value: String(referrals.length) },
          { label: 'Total Earned', value: formatCurrency(totalEarned) },
          { label: 'Per Referral', value: '₦500' },
        ].map(s => (
          <div key={s.label} className="card text-center">
            <p className="font-display text-2xl font-bold text-primary-600 mb-1">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="card border-2 border-primary-100 dark:border-primary-900">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary-600" /> Your Referral Link
        </h2>

        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-400 mb-1">Unique Code</p>
          <p className="font-mono font-bold text-primary-600 text-xl tracking-widest">{user?.referral_code}</p>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-slate-400 font-mono truncate">
            {referralLink}
          </div>
          <button onClick={copyLink} className={`btn-primary px-4 text-sm flex items-center gap-2 ${copied ? 'bg-emerald-600' : ''}`}>
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button onClick={shareLink} className="btn-secondary px-4 text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Referral History */}
      <div className="card">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-primary-600" /> Referral History
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No referrals yet</p>
            <p className="text-sm text-slate-400 mt-1">Share your link to start earning!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left text-slate-500 dark:text-slate-400 font-medium pb-3">User</th>
                  <th className="text-left text-slate-500 dark:text-slate-400 font-medium pb-3">Status</th>
                  <th className="text-left text-slate-500 dark:text-slate-400 font-medium pb-3">Date</th>
                  <th className="text-right text-slate-500 dark:text-slate-400 font-medium pb-3">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {referrals.map(r => (
                  <tr key={r.id}>
                    <td className="py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{r.referred_user?.fullname}</div>
                      <div className="text-xs text-slate-400">{r.referred_user?.email}</div>
                    </td>
                    <td className="py-3">
                      <span className={`badge ${r.referred_user?.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {r.referred_user?.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{formatDate(r.created_at)}</td>
                    <td className="py-3 text-right font-bold text-emerald-600">{formatCurrency(r.reward)}</td>
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
