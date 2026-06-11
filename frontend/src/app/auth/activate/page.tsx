'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, Zap, Users, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { paymentApi } from '@/lib/api';
import { usePaystack, generateReference } from '@/hooks/usePaystack';

const BENEFITS = [
  { icon: BookOpen, text: 'Unlimited access to all 6+ courses' },
  { icon: Users, text: 'Earn ₦500 per successful referral' },
  { icon: Zap, text: 'Instant account activation' },
  { icon: Shield, text: 'Lifetime membership — pay once' },
];

export default function ActivatePage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const { initializePayment } = usePaystack();

  const handlePayment = () => {
    if (!user) { router.push('/auth/login'); return; }
    if (user.status === 'active') { router.push('/dashboard'); return; }

    const reference = generateReference('MEMBER');
    setIsProcessing(true);

    initializePayment({
      email: user.email,
      amount: 2000,
      reference,
      metadata: { userId: user.id, type: 'membership' },
      onSuccess: async (ref) => {
        try {
          const res = await paymentApi.verifyMembership(ref);
          const updatedUser = res.data.data.user;
          setUser(updatedUser);
          setIsSuccess(true);
          toast.success('Membership activated successfully!');
          setTimeout(() => router.push('/dashboard'), 2000);
        } catch {
          toast.error('Payment verification failed. Contact support.');
        } finally {
          setIsProcessing(false);
        }
      },
      onClose: () => {
        setIsProcessing(false);
        toast('Payment cancelled');
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="card shadow-xl text-center py-12">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3">You&apos;re In!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-2">Your membership is now active.</p>
        <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="card shadow-xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Activate Your Membership</h1>
        <p className="text-slate-500 dark:text-slate-400">One-time payment to unlock full access</p>
      </div>

      {/* Price */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-6 text-center mb-6 border border-primary-100 dark:border-primary-800">
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Membership Fee</p>
        <div className="font-display text-5xl font-extrabold text-primary-600 mb-1">₦2,000</div>
        <p className="text-slate-400 text-xs">One-time · Lifetime access</p>
      </div>

      {/* Benefits */}
      <div className="space-y-3 mb-8">
        {BENEFITS.map((b) => (
          <div key={b.text} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center shrink-0">
              <b.icon className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-slate-700 dark:text-slate-300 text-sm">{b.text}</span>
          </div>
        ))}
      </div>

      <button onClick={handlePayment} disabled={isProcessing} className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4">
        {isProcessing ? (
          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
        ) : (
          <><Zap className="w-5 h-5" /> Pay ₦2,000 & Activate</>
        )}
      </button>

      <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" />
        Secured by Paystack · Bank-grade encryption
      </p>

      {user && (
        <p className="text-center text-xs text-slate-400 mt-2">
          Paying as: <span className="font-medium text-slate-600 dark:text-slate-300">{user.email}</span>
        </p>
      )}
    </div>
  );
}
