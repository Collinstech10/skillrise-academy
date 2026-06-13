import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { verifyPaystackTransaction } from '../lib/paystack';
import { v4 as uuidv4 } from 'uuid';

// Helper — upload a file buffer to Supabase Storage
async function uploadFile(
  buffer: Buffer, mimetype: string,
  folder: string, filename: string
): Promise<string> {
  const path = `${folder}/${filename}`;
  const { error } = await supabaseAdmin.storage
    .from('skillrise')
    .upload(path, buffer, { contentType: mimetype, upsert: true });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data: { publicUrl } } = supabaseAdmin.storage.from('skillrise').getPublicUrl(path);
  return publicUrl;
}

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
    if (search) query = query.or(`fullname.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
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
    const { error } = await supabaseAdmin.from('users').delete().eq('id', req.params.userId);
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
    const { title, description, price, category, level, duration } = req.body;
    if (!title || !description || !price) {
      return res.status(400).json({ success: false, message: 'Title, description, price required' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const id = uuidv4();
    let thumbnail = '';
    let video_url = '';
    let pdf_url = '';

    // Upload thumbnail
    if (files?.thumbnail?.[0]) {
      const f = files.thumbnail[0];
      const ext = f.originalname.split('.').pop();
      thumbnail = await uploadFile(f.buffer, f.mimetype, 'thumbnails', `${id}.${ext}`);
    }

    // Upload video
    if (files?.video?.[0]) {
      const f = files.video[0];
      const ext = f.originalname.split('.').pop();
      video_url = await uploadFile(f.buffer, f.mimetype, 'videos', `${id}.${ext}`);
    }

    // Upload PDF
    if (files?.pdf?.[0]) {
      const f = files.pdf[0];
      pdf_url = await uploadFile(f.buffer, f.mimetype, 'pdfs', `${id}.pdf`);
    }

    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({
        id, title, description,
        price: Number(price),
        category: category || 'Web Development',
        level: level || 'Beginner',
        duration: duration || '',
        thumbnail, video_url, pdf_url,
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
    const { title, description, price, category, level, duration } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const updates: Record<string, unknown> = {
      title, description, price: Number(price),
      category, level, duration,
    };

    // Upload new thumbnail if provided
    if (files?.thumbnail?.[0]) {
      const f = files.thumbnail[0];
      const ext = f.originalname.split('.').pop();
      updates.thumbnail = await uploadFile(f.buffer, f.mimetype, 'thumbnails', `${id}.${ext}`);
    }

    // Upload new video if provided
    if (files?.video?.[0]) {
      const f = files.video[0];
      const ext = f.originalname.split('.').pop();
      updates.video_url = await uploadFile(f.buffer, f.mimetype, 'videos', `${id}.${ext}`);
    }

    // Upload new PDF if provided
    if (files?.pdf?.[0]) {
      const f = files.pdf[0];
      updates.pdf_url = await uploadFile(f.buffer, f.mimetype, 'pdfs', `${id}.pdf`);
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
      .select(`id, reward, created_at, referred_user:users!referrals_referred_user_id_fkey(fullname, email, status)`)
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

// JSON-based course create/update (files already uploaded to Supabase from browser)
export async function createCourseJson(req: AuthRequest, res: Response) {
  try {
    const { id, title, description, price, category, level, duration, instructor, thumbnail, video_url, pdf_url } = req.body;
    if (!title || !description || !price) {
      return res.status(400).json({ success: false, message: 'Title, description, price required' });
    }
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({
        id: id || uuidv4(),
        title, description,
        price: Number(price),
        category: category || 'Web Development',
        level: level || 'Beginner',
        duration: duration || '',
        instructor: instructor || 'SkillRise Academy',
        thumbnail: thumbnail || '',
        video_url: video_url || '',
        pdf_url: pdf_url || '',
      })
      .select().single();
    if (error) throw error;
    return res.status(201).json({ success: true, message: 'Course created', data });
  } catch (err) {
    console.error('createCourseJson:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateCourseJson(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, price, category, level, duration, instructor, thumbnail, video_url, pdf_url } = req.body;
    const updates: Record<string, unknown> = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (price) updates.price = Number(price);
    if (category) updates.category = category;
    if (level) updates.level = level;
    if (duration !== undefined) updates.duration = duration;
    if (instructor !== undefined) updates.instructor = instructor;
    if (thumbnail) updates.thumbnail = thumbnail;
    if (video_url !== undefined) updates.video_url = video_url;
    if (pdf_url !== undefined) updates.pdf_url = pdf_url;

    const { data, error } = await supabaseAdmin
      .from('courses').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ success: true, message: 'Course updated', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
