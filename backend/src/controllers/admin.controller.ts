import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { verifyPaystackTransaction } from '../lib/paystack';
import { v4 as uuidv4 } from 'uuid';

export async function getStats(req: AuthRequest, res: Response) {
  try {
    const [
      { count: total_users },
      { count: active_users },
      { data: revenue },
      { count: total_course_sales },
      { data: recent_payments },
      { data: recent_users },
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('payments').select('amount').eq('status', 'success'),
      supabaseAdmin.from('purchases').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('payments')
        .select('id, amount, status, type, created_at, user:users!payments_user_id_fkey(fullname, email)')
        .order('created_at', { ascending: false }).limit(10),
      supabaseAdmin.from('users')
        .select('id, fullname, username, email, balance, status, role, created_at')
        .order('created_at', { ascending: false }).limit(10),
    ]);

    const total_revenue = revenue?.reduce((s, p) => s + (p.amount || 0), 0) ?? 0;

    return res.json({
      success: true,
      data: {
        total_users: total_users ?? 0,
        active_users: active_users ?? 0,
        total_revenue,
        total_course_sales: total_course_sales ?? 0,
        recent_payments: recent_payments ?? [],
        recent_users: recent_users ?? [],
      },
    });
  } catch (err) {
    console.error('admin getStats:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    let query = supabaseAdmin
      .from('users')
      .select('id, fullname, username, email, phone, balance, status, role, referral_code, created_at')
      .order('created_at', { ascending: false })
      .range((+page - 1) * +limit, +page * +limit - 1);

    if (status) query = query.eq('status', status as string);
    if (search) {
      query = query.or(
        `fullname.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, data: data ?? [] });
  } catch (err) {
    console.error('admin getUsers:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const { data, error } = await supabaseAdmin
      .from('users').update({ status }).eq('id', userId)
      .select('id, fullname, status').single();

    if (error) throw error;
    return res.json({ success: true, message: `User ${status}`, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { error } = await supabaseAdmin.from('users').delete().eq('id', userId);
    if (error) throw error;
    return res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Delete failed' });
  }
}

export async function getCourses(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, data: data ?? [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function createCourse(req: AuthRequest, res: Response) {
  try {
    const { title, description, price, category, level, duration, video_url, pdf_url } = req.body;
    if (!title || !description || !price) {
      return res.status(400).json({ success: false, message: 'Title, description, price required' });
    }

    let thumbnail = '';
    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const fileName = `thumbnails/${uuidv4()}.${ext}`;
      await supabaseAdmin.storage.from('skillrise').upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype, upsert: true,
      });
      const { data: { publicUrl } } = supabaseAdmin.storage.from('skillrise').getPublicUrl(fileName);
      thumbnail = publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({
        id: uuidv4(), title, description, price: Number(price),
        category: category || 'Web Development', level: level || 'Beginner',
        duration, video_url, pdf_url, thumbnail,
      })
      .select().single();

    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Course created', data });
  } catch (err) {
    console.error('createCourse:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateCourse(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, price, category, level, duration, video_url, pdf_url } = req.body;
    const updates: Record<string, unknown> = {
      title, description, price: Number(price),
      category, level, duration, video_url, pdf_url,
    };

    if (req.file) {
      const ext = req.file.originalname.split('.').pop();
      const fileName = `thumbnails/${id}.${ext}`;
      await supabaseAdmin.storage.from('skillrise').upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype, upsert: true,
      });
      const { data: { publicUrl } } = supabaseAdmin.storage.from('skillrise').getPublicUrl(fileName);
      updates.thumbnail = publicUrl;
    }

    const { data, error } = await supabaseAdmin
      .from('courses').update(updates).eq('id', id).select().single();

    if (error) throw error;
    return res.json({ success: true, message: 'Course updated', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function deleteCourse(req: Request, res: Response) {
  try {
    const { error } = await supabaseAdmin.from('courses').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Delete failed' });
  }
}

export async function getPayments(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('payments')
      .select('id, amount, payment_reference, status, type, created_at, user:users!payments_user_id_fkey(fullname, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, data: data ?? [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { data: payment } = await supabaseAdmin
      .from('payments').select('*').eq('id', id).single();
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

    const paystackRes = await verifyPaystackTransaction(payment.payment_reference);
    if (paystackRes.data?.status === 'success') {
      await supabaseAdmin.from('payments').update({ status: 'success' }).eq('id', id);
    }
    return res.json({ success: true, message: 'Payment verification complete' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
}

export async function getReferrals(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('referrals')
      .select(`
        id, reward, created_at,
        referred_user:users!referrals_referred_user_id_fkey(fullname, email, status)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, data: data ?? [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function createAnnouncement(req: Request, res: Response) {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message required' });
    }
    const { data, error } = await supabaseAdmin
      .from('announcements').insert({ id: uuidv4(), title, message }).select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Announcement created', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getAnnouncements(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('announcements').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.json({ success: true, data: data ?? [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
