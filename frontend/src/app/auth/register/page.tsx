'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { User } from '@/types';

const schema = z.object({
  fullname: z.string().min(3, 'Full name must be at least 3 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(11, 'Enter a valid phone number').max(14),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Include at least one uppercase letter').regex(/[0-9]/, 'Include at least one number'),
  confirmPassword: z.string(),
  referral_code: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

function RegisterForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { referral_code: refCode },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { confirmPassword, ...payload } = data;
      const res = await authApi.register(payload);
      const { user, token } = res.data.data;
      setAuth(user as User, token);
      toast.success('Account created! Please activate your membership.');
      router.push('/auth/activate');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Try again.';
      toast.error(message);
    }
  };

  return (
    <div className="card shadow-xl">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-2">Create Your Account</h1>
        <p className="text-slate-500 dark:text-slate-400">Join SkillRise Academy today — it&apos;s free to register</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input {...register('fullname')} className="input-field" placeholder="John Doe" />
            {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname.message}</p>}
          </div>
          <div>
            <label className="label">Username</label>
            <input {...register('username')} className="input-field" placeholder="johndoe" />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Email Address</label>
          <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="label">Phone Number</label>
          <input {...register('phone')} type="tel" className="input-field" placeholder="08012345678" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input {...register('password')} type={showPass ? 'text' : 'password'} className="input-field pr-12" placeholder="Min. 8 characters" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label">Confirm Password</label>
          <div className="relative">
            <input {...register('confirmPassword')} type={showConfirm ? 'text' : 'password'} className="input-field pr-12" placeholder="Repeat password" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <div>
          <label className="label">Referral Code <span className="text-slate-400 font-normal">(optional)</span></label>
          <input {...register('referral_code')} className="input-field" placeholder="Enter referral code" />
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><UserPlus className="w-5 h-5" /> Create Account</>
          )}
        </button>
      </form>

      <p className="text-center mt-5 text-slate-500 dark:text-slate-400 text-sm">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="card shadow-xl p-8 text-center text-slate-500">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
