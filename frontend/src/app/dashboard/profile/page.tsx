'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, Lock, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store';
import { userApi, authApi } from '@/lib/api';
import { getInitials } from '@/lib/utils';

const profileSchema = z.object({
  fullname: z.string().min(3, 'At least 3 characters'),
  phone: z.string().min(11, 'Valid phone required'),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(6, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords must match', path: ['confirmPassword'] });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullname: user?.fullname || '', phone: user?.phone || '' },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await userApi.uploadAvatar(formData);
      setUser({ ...user!, avatar_url: res.data.data.avatar_url });
      toast.success('Profile picture updated!');
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const res = await userApi.updateProfile(data);
      setUser({ ...user!, ...res.data.data });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await authApi.changePassword(data.oldPassword, data.newPassword);
      toast.success('Password changed successfully!');
      passwordForm.reset();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>

      {/* Avatar */}
      <div className="card text-center">
        <div className="relative inline-block mb-4">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.fullname} className="w-24 h-24 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-3xl ring-4 ring-primary-100 dark:ring-primary-900">
              {getInitials(user.fullname)}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadingAvatar}
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            {uploadingAvatar ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : <Camera className="w-4 h-4" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{user.fullname}</h2>
        <p className="text-slate-500 dark:text-slate-400">@{user.username}</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
            {user.status}
          </span>
          <span className="badge badge-info">{user.role}</span>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="card">
          <p className="text-slate-400 text-xs mb-1">Email</p>
          <p className="text-slate-900 dark:text-white font-medium truncate">{user.email}</p>
        </div>
        <div className="card">
          <p className="text-slate-400 text-xs mb-1">Referral Code</p>
          <p className="text-primary-600 font-mono font-bold">{user.referral_code}</p>
        </div>
      </div>

      {/* Edit Profile */}
      <div className="card">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-5">Edit Profile</h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input {...profileForm.register('fullname')} className="input-field" />
            {profileForm.formState.errors.fullname && (
              <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.fullname.message}</p>
            )}
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input {...profileForm.register('phone')} className="input-field" />
            {profileForm.formState.errors.phone && (
              <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.phone.message}</p>
            )}
          </div>
          <button type="submit" disabled={profileForm.formState.isSubmitting} className="btn-primary flex items-center gap-2">
            {profileForm.formState.isSubmitting
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-600" /> Change Password
        </h2>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {(['oldPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <div key={field}>
              <label className="label">{field === 'oldPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
              <input {...passwordForm.register(field)} type="password" className="input-field" placeholder="••••••••" />
              {passwordForm.formState.errors[field] && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors[field]?.message}</p>
              )}
            </div>
          ))}
          <button type="submit" disabled={passwordForm.formState.isSubmitting} className="btn-primary flex items-center gap-2">
            {passwordForm.formState.isSubmitting
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Lock className="w-4 h-4" />}
            Update Password
          </button>
        </form>
      </div>

      {/* Logout */}
      <button onClick={logout} className="w-full py-3 px-6 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2">
        <LogOut className="w-5 h-5" /> Sign Out of Account
      </button>
    </div>
  );
}
