import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Fetch user balance
    const { data: user } = await supabaseAdmin
      .from('users').select('balance').eq('id', userId).single();

    // Referral stats
    const { data: referrals } = await supabaseAdmin
      .from('referrals').select('reward').eq('referrer_id', userId);

    const total_referrals = referrals?.length ?? 0;
    const referral_earnings = referrals?.reduce((s, r) => s + (r.reward || 0), 0) ?? 0;

    // Courses count
    const { count: courses_purchased } = await supabaseAdmin
      .from('purchases').select('*', { count: 'exact', head: true }).eq('user_id', userId);

    // Recent activity — last 10 referrals + payments
    const { data: recentPayments } = await supabaseAdmin
      .from('payments')
      .select('id, amount, status, type, created_at')
      .eq('user_id', userId)
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentReferrals } = await supabaseAdmin
      .from('referrals')
      .select('id, reward, created_at')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    const recent_activity = [
      ...(recentPayments?.map(p => ({
        id: p.id, type: 'payment',
        description: p.type === 'membership' ? 'Membership activation' : 'Course purchase',
        amount: p.amount, created_at: p.created_at,
      })) ?? []),
      ...(recentReferrals?.map(r => ({
        id: r.id, type: 'referral',
        description: 'Referral bonus earned',
        amount: r.reward, created_at: r.created_at,
      })) ?? []),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

    // Active announcements
    const { data: announcements } = await supabaseAdmin
      .from('announcements')
      .select('id, title, message, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    return res.json({
      success: true,
      data: {
        balance: user?.balance ?? 0,
        total_referrals,
        referral_earnings,
        courses_purchased: courses_purchased ?? 0,
        recent_activity,
        announcements: announcements ?? [],
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getReferrals(req: AuthRequest, res: Response) {
  try {
    const { data: referrals, error } = await supabaseAdmin
      .from('referrals')
      .select(`
        id, reward, created_at,
        referred_user:users!referrals_referred_user_id_fkey(fullname, username, email, status)
      `)
      .eq('referrer_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: referrals ?? [] });
  } catch (err) {
    console.error('getReferrals error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { fullname, phone } = req.body;
    const updates: Record<string, unknown> = {};
    if (fullname) updates.fullname = fullname;
    if (phone) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'Nothing to update' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.user!.id)
      .select('id, fullname, username, email, phone, referral_code, balance, status, role, avatar_url, created_at')
      .single();

    if (error) throw error;
    return res.json({ success: true, message: 'Profile updated', data: user });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Update failed' });
  }
}

export async function uploadAvatar(req: AuthRequest, res: Response) {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const ext = file.originalname.split('.').pop();
    const fileName = `avatars/${req.user!.id}-${Date.now()}.${ext}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('skillrise')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseAdmin.storage.from('skillrise').getPublicUrl(fileName);

    await supabaseAdmin.from('users').update({ avatar_url: publicUrl }).eq('id', req.user!.id);

    return res.json({ success: true, data: { avatar_url: publicUrl } });
  } catch (err) {
    console.error('uploadAvatar error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
}

export async function getLeaderboard(req: AuthRequest, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('referrals')
      .select('referrer_id, reward');

    if (error) throw error;

    const map = new Map<string, { count: number; earnings: number }>();
    for (const r of data ?? []) {
      const existing = map.get(r.referrer_id) || { count: 0, earnings: 0 };
      map.set(r.referrer_id, { count: existing.count + 1, earnings: existing.earnings + r.reward });
    }

    if (map.size === 0) return res.json({ success: true, data: [] });

    const userIds = Array.from(map.keys());
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, username, fullname, avatar_url')
      .in('id', userIds);

    const leaderboard = (users ?? [])
      .map(u => ({
        id: u.id, username: u.username, fullname: u.fullname, avatar_url: u.avatar_url,
        referral_count: map.get(u.id)?.count || 0,
        total_earnings: map.get(u.id)?.earnings || 0,
      }))
      .sort((a, b) => b.total_earnings - a.total_earnings)
      .slice(0, 20);

    return res.json({ success: true, data: leaderboard });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('id, message, type, is_read, created_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    return res.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error('getNotifications error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', req.user!.id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response) {
  try {
    await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user!.id)
      .eq('is_read', false);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
