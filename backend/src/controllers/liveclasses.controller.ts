import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Extract YouTube video ID from various URL formats
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Compute live status based on start_time
function computeStatus(start_time: string, currentStatus: string): string {
  if (currentStatus === 'ended') return 'ended'; // manual override respected
  const start = new Date(start_time).getTime();
  const now = Date.now();
  const fourHoursMs = 4 * 60 * 60 * 1000;

  if (now < start) return 'upcoming';
  if (now >= start && now < start + fourHoursMs) return 'live';
  return 'ended';
}

// ── PUBLIC / USER ────────────────────────────────────────────────────────

export async function getAllLiveClasses(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) throw error;

    const classes = (data ?? []).map(c => ({
      ...c,
      status: computeStatus(c.start_time, c.status),
      youtube_id: extractYouTubeId(c.youtube_url),
    }));

    return res.json({ success: true, data: classes });
  } catch (err) {
    console.error('getAllLiveClasses error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function getLiveClassById(req: Request, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    return res.json({
      success: true,
      data: {
        ...data,
        status: computeStatus(data.start_time, data.status),
        youtube_id: extractYouTubeId(data.youtube_url),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// ── ADMIN ────────────────────────────────────────────────────────────────

export async function adminGetAllLiveClasses(req: AuthRequest, res: Response) {
  try {
    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .select('*')
      .order('start_time', { ascending: false });

    if (error) throw error;

    const classes = (data ?? []).map(c => ({
      ...c,
      status: computeStatus(c.start_time, c.status),
      youtube_id: extractYouTubeId(c.youtube_url),
    }));

    return res.json({ success: true, data: classes });
  } catch (err) {
    console.error('adminGetAllLiveClasses error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function createLiveClass(req: AuthRequest, res: Response) {
  try {
    const { title, description, instructor, thumbnail, youtube_url, start_time, status } = req.body;

    if (!title || !instructor || !youtube_url || !start_time) {
      return res.status(400).json({
        success: false,
        message: 'Title, instructor, YouTube URL, and start time are required',
      });
    }

    if (!extractYouTubeId(youtube_url)) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    }

    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .insert({
        id: uuidv4(),
        title,
        description: description || '',
        instructor,
        thumbnail: thumbnail || '',
        youtube_url,
        start_time,
        status: status || 'upcoming',
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      message: 'Live class created',
      data: { ...data, youtube_id: extractYouTubeId(data.youtube_url) },
    });
  } catch (err) {
    console.error('createLiveClass error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateLiveClass(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, instructor, thumbnail, youtube_url, start_time, status } = req.body;

    if (youtube_url && !extractYouTubeId(youtube_url)) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL' });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (instructor !== undefined) updates.instructor = instructor;
    if (thumbnail !== undefined) updates.thumbnail = thumbnail;
    if (youtube_url !== undefined) updates.youtube_url = youtube_url;
    if (start_time !== undefined) updates.start_time = start_time;
    if (status !== undefined) updates.status = status;

    const { data, error } = await supabaseAdmin
      .from('live_classes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, message: 'Live class not found' });

    return res.json({
      success: true,
      message: 'Live class updated',
      data: { ...data, youtube_id: extractYouTubeId(data.youtube_url) },
    });
  } catch (err) {
    console.error('updateLiveClass error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function deleteLiveClass(req: AuthRequest, res: Response) {
  try {
    const { error } = await supabaseAdmin
      .from('live_classes')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    return res.json({ success: true, message: 'Live class deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Delete failed' });
  }
}

// ── NOTIFICATION SCHEDULER ────────────────────────────────────────────────
// Checks all upcoming live classes and creates notifications for users
// who haven't been notified yet at the 1-day, 1-hour, and 15-min marks.

export async function checkAndSendLiveClassNotifications() {
  try {
    const now = Date.now();

    const { data: upcomingClasses } = await supabaseAdmin
      .from('live_classes')
      .select('*')
      .in('status', ['upcoming', 'live']);

    if (!upcomingClasses?.length) return;

    // Get all active users to notify
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('status', 'active');

    if (!users?.length) return;

    for (const liveClass of upcomingClasses) {
      const startTime = new Date(liveClass.start_time).getTime();
      const diff = startTime - now;

      // Define notification windows (in ms) with tolerance of 2 minutes
      const windows = [
        { ms: 24 * 60 * 60 * 1000, label: '1 day', key: '1day' },
        { ms: 60 * 60 * 1000, label: '1 hour', key: '1hour' },
        { ms: 15 * 60 * 1000, label: '15 minutes', key: '15min' },
      ];

      for (const window of windows) {
        // Check if diff is within 2-minute tolerance of this window
        if (diff > 0 && Math.abs(diff - window.ms) <= 2 * 60 * 1000) {
          const notifKey = `liveclass-${liveClass.id}-${window.key}`;

          // Check if we've already sent this notification (using reference field)
          const { data: existing } = await supabaseAdmin
            .from('notifications')
            .select('id')
            .eq('title', notifKey)
            .limit(1);

          if (existing?.length) continue; // already sent

          // Create notification for all active users
          const notifications = users.map(u => ({
            id: uuidv4(),
            user_id: u.id,
            title: notifKey, // used as dedup key, hidden from display via message formatting
            message: `🔔 ${liveClass.title} starts in ${window.label}.`,
            type: 'course' as const,
            is_read: false,
          }));

          // Insert in batches of 500
          for (let i = 0; i < notifications.length; i += 500) {
            await supabaseAdmin.from('notifications').insert(notifications.slice(i, i + 500));
          }

          console.log(`✅ Sent "${window.label}" notification for "${liveClass.title}" to ${users.length} users`);
        }
      }

      // Auto-update status to 'live' when start time passes (if still 'upcoming')
      if (diff <= 0 && liveClass.status === 'upcoming') {
        await supabaseAdmin
          .from('live_classes')
          .update({ status: 'live' })
          .eq('id', liveClass.id);
      }

      // Auto-update status to 'ended' after 4 hours
      if (diff <= -4 * 60 * 60 * 1000 && liveClass.status === 'live') {
        await supabaseAdmin
          .from('live_classes')
          .update({ status: 'ended' })
          .eq('id', liveClass.id);
      }
    }
  } catch (err) {
    console.error('checkAndSendLiveClassNotifications error:', err);
  }
}
