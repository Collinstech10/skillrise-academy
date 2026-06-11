'use client';
import { useEffect, useState } from 'react';
import { Share2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { Referral } from '@/types';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getReferrals()
      .then(res => setReferrals(res.data.data))
      .catch(() => toast.error('Failed to load referrals'))
      .finally(() => setLoading(false));
  }, []);

  const totalRewards = referrals.reduce((s, r) => s + r.reward, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Referral Management</h1>
        <p className="text-slate-400 text-sm mt-1">Track all referral activity and rewards</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-white font-display text-2xl font-bold">{referrals.length}</p>
          <p className="text-slate-500 text-xs mt-1">Total Referrals</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-emerald-400 font-display text-2xl font-bold">{formatCurrency(totalRewards)}</p>
          <p className="text-slate-500 text-xs mt-1">Total Rewards Paid</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-primary-400 font-display text-2xl font-bold">₦500</p>
          <p className="text-slate-500 text-xs mt-1">Per Referral Rate</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-px">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-800 animate-pulse" />)}</div>
        ) : referrals.length === 0 ? (
          <div className="text-center py-16">
            <Share2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500">No referrals yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Referred User', 'Status', 'Date', 'Reward'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-slate-400 font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {referrals.map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{r.referred_user?.fullname}</p>
                      <p className="text-slate-500 text-xs">{r.referred_user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('badge', r.referred_user?.status === 'active' ? 'badge-success' : 'badge-warning')}>
                        {r.referred_user?.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{formatCurrency(r.reward)}</td>
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
