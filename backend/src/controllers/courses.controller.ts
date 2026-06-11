import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';

export async function getAllCourses(req: AuthRequest, res: Response) {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // If authenticated, mark purchased courses
    if (req.user) {
      const { data: purchases } = await supabaseAdmin
        .from('purchases')
        .select('course_id')
        .eq('user_id', req.user.id);

      const purchasedIds = new Set(purchases?.map(p => p.course_id) ?? []);
      const coursesWithPurchased = courses?.map(c => ({
        ...c,
        purchased: purchasedIds.has(c.id),
      }));
      return res.json({ success: true, data: coursesWithPurchased ?? [] });
    }

    return res.json({ success: true, data: courses ?? [] });
  } catch (err) {
    console.error('getAllCourses error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getCourseById(req: Request, res: Response) {
  try {
    const { data: course, error } = await supabaseAdmin
      .from('courses').select('*').eq('id', req.params.id).single();

    if (error || !course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    return res.json({ success: true, data: course });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getMyCourses(req: AuthRequest, res: Response) {
  try {
    const { data: purchases, error } = await supabaseAdmin
      .from('purchases')
      .select('id, user_id, course_id, amount, created_at, course:courses(*)')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, data: purchases ?? [] });
  } catch (err) {
    console.error('getMyCourses error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function purchaseCourse(req: AuthRequest, res: Response) {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId required' });

    // Check course exists
    const { data: course } = await supabaseAdmin
      .from('courses').select('*').eq('id', courseId).single();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check not already purchased
    const { data: existing } = await supabaseAdmin
      .from('purchases')
      .select('id').eq('user_id', req.user!.id).eq('course_id', courseId).maybeSingle();

    if (existing) return res.status(400).json({ success: false, message: 'Course already purchased' });

    return res.json({ success: true, data: { course, message: 'Ready to purchase' } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
