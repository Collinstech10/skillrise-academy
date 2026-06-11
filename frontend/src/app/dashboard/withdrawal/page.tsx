'use client';
import { Clock, Wallet, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

export default function WithdrawalPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Withdrawal</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Withdraw your earned balance to your bank account</p>
      </div>

      {/* Balance Card */}
      <div className="hero-gradient rounded-2xl p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <p className="text-blue-200 text-sm mb-1">Available Balance</p>
          <p className="font-display text-5xl font-extrabold mb-2">{formatCurrency(user?.balance ?? 0)}</p>
          <p className="text-blue-200 text-xs">Earned from referrals & activities</p>
        </div>
      </div>

      {/* Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Minimum Withdrawal</p>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">₦10,000</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-slate-400 mb-1">Maximum Withdrawal</p>
          <p className="font-display text-2xl font-bold text-slate-900 dark:text-white">₦300,000</p>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="card border-2 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="font-display font-bold text-amber-800 dark:text-amber-400 text-lg">Withdrawal Coming Soon</h3>
            <p className="text-amber-700 dark:text-amber-500 mt-1 text-sm leading-relaxed">
              We&apos;re setting up our secure payment infrastructure to ensure fast, safe withdrawals directly to your Nigerian bank account. This feature will be available very soon!
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '70%' }} />
              </div>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">70% ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Disabled form */}
      <div className="card opacity-60 pointer-events-none select-none">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4">Withdrawal Request</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Amount (₦)</label>
            <input className="input-field" placeholder="Enter amount" disabled />
          </div>
          <div>
            <label className="label">Bank Name</label>
            <input className="input-field" placeholder="e.g. First Bank" disabled />
          </div>
          <div>
            <label className="label">Account Number</label>
            <input className="input-field" placeholder="10-digit account number" disabled />
          </div>
          <div>
            <label className="label">Account Name</label>
            <input className="input-field" placeholder="As on bank records" disabled />
          </div>
          <button disabled className="btn-primary w-full opacity-50 cursor-not-allowed">
            Withdrawal Coming Soon
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="card">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-600" /> Grow Your Balance
        </h3>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
            <span>Share your referral link to earn ₦500 per activated referral</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
            <span>Minimum balance of ₦10,000 required to withdraw</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
            <span>Withdrawals will be processed within 24-48 hours once available</span>
          </div>
        </div>
      </div>
    </div>
  );
}
