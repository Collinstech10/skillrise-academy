'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Radio, X, Image, CheckCircle, Video, Calendar, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { LiveClass } from '@/types';
import { cn } from '@/lib/utils';
import { uploadToSupabase, UploadProgress } from '@/lib/upload';
import { v4 as uuidv4 } from 'uuid';

interface FormData {
  title: string;
  description: string;
  instructor: string;
  youtube_url: string;
  date: string;
  time: string;
  status: 'upcoming' | 'live' | 'ended';
}

const EMPTY_FORM: FormData = {
  title: '', description: '', instructor: '', youtube_url: '',
  date: '', time: '', status: 'upcoming',
};

interface ThumbState {
  file: File | null;
  progress: number;
  uploading: boolean;
  url: string;
  error: string;
}

const EMPTY_THUMB: ThumbState = { file: null, progress: 0, uploading: false, url: '', error: '' };

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function formatDateForDisplay(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function StatusBadge({ status }: { status: LiveClass['status'] }) {
  const config = {
    live: { label: 'LIVE NOW', cls: 'bg-red-600 text-white' },
    upcoming: { label: '🟢 Upcoming', cls: 'bg-emerald-600/20 text-emerald-400' },
    ended: { label: '⚫ Ended', cls: 'bg-slate-700 text-slate-400' },
  };
  const c = config[status];
  return <span className={cn('badge text-xs', c.cls)}>{c.label}</span>;
}

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState<LiveClass | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [thumbnail, setThumbnail] = useState<ThumbState>(EMPTY_THUMB);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getLiveClasses()
      .then(res => setClasses(res.data.data || []))
      .catch(() => toast.error('Failed to load live classes'))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setThumbnail(EMPTY_THUMB);
  };

  const openCreate = () => { setEditClass(null); resetForm(); setShowModal(true); };

  const openEdit = (lc: LiveClass) => {
    setEditClass(lc);
    const dt = new Date(lc.start_time);
    const date = dt.toISOString().split('T')[0];
    const time = dt.toTimeString().slice(0, 5);
    setForm({
      title: lc.title,
      description: lc.description || '',
      instructor: lc.instructor,
      youtube_url: lc.youtube_url,
      date, time,
      status: lc.status,
    });
    setThumbnail({ ...EMPTY_THUMB, url: lc.thumbnail || '' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.instructor || !form.youtube_url || !form.date || !form.time) {
      toast.error('Title, instructor, YouTube URL, date, and time are required');
      return;
    }
    if (!extractYouTubeId(form.youtube_url)) {
      toast.error('Invalid YouTube URL. Use a format like https://www.youtube.com/watch?v=VIDEO_ID');
      return;
    }

    setSaving(true);
    try {
      const id = editClass?.id || uuidv4();
      let thumbnailUrl = thumbnail.url;

      // Upload thumbnail if a new file was selected
      if (thumbnail.file) {
        setThumbnail(prev => ({ ...prev, uploading: true, error: '' }));
        try {
          const ext = thumbnail.file.name.split('.').pop() || 'jpg';
          thumbnailUrl = await uploadToSupabase(
            thumbnail.file,
            'thumbnails',
            `liveclass-${id}.${ext}`,
            (p: UploadProgress) => setThumbnail(prev => ({ ...prev, progress: p.percent }))
          );
          setThumbnail(prev => ({ ...prev, uploading: false, progress: 100, url: thumbnailUrl }));
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Thumbnail upload failed';
          setThumbnail(prev => ({ ...prev, uploading: false, error: msg }));
          throw new Error(msg);
        }
      }

      const start_time = new Date(`${form.date}T${form.time}:00`).toISOString();

      const payload = {
        title: form.title,
        description: form.description,
        instructor: form.instructor,
        youtube_url: form.youtube_url,
        thumbnail: thumbnailUrl,
        start_time,
        status: form.status,
      };

      if (editClass) {
        const res = await adminApi.updateLiveClass(editClass.id, payload);
        setClasses(prev => prev.map(c => c.id === editClass.id ? res.data.data : c));
        toast.success('Live class updated!');
      } else {
        const res = await adminApi.createLiveClass({ id, ...payload });
        setClasses(prev => [res.data.data, ...prev]);
        toast.success('Live class created!');
      }
      setShowModal(false);
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save live class';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteLiveClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      toast.success('Live class deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeletingId(null); }
  };

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-red-500" /> Live Classes
          </h1>
          <p className="text-slate-400 text-sm mt-1">{classes.length} classes scheduled</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Create Live Class
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-56 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <Radio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No live classes scheduled</p>
          <button onClick={openCreate} className="btn-primary text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create First Live Class
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map(lc => (
            <div key={lc.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all group">
              <div className="h-36 bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center relative">
                {lc.thumbnail
                  ? <img src={lc.thumbnail} alt={lc.title} className="absolute inset-0 w-full h-full object-cover" />
                  : <Video className="w-12 h-12 text-white/20" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3"><StatusBadge status={lc.status} /></div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-primary-400 transition-colors">{lc.title}</h3>
                <div className="space-y-1 mb-3">
                  <p className="text-slate-500 text-xs flex items-center gap-1.5"><User className="w-3 h-3" /> {lc.instructor}</p>
                  <p className="text-slate-500 text-xs flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {formatDateForDisplay(lc.start_time)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <a href={lc.youtube_url} target="_blank" rel="noopener noreferrer"
                    className="text-primary-400 text-xs hover:underline truncate max-w-[140px]">
                    View on YouTube
                  </a>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(lc)}
                      className="p-2 bg-primary-600/20 hover:bg-primary-600/40 text-primary-400 rounded-lg transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(lc.id, lc.title)}
                      disabled={deletingId === lc.id}
                      className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all disabled:opacity-50">
                      {deletingId === lc.id
                        ? <div className="w-3.5 h-3.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && !saving && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                {editClass ? 'Edit Live Class' : 'Create Live Class'}
              </h2>
              <button onClick={() => !saving && setShowModal(false)} disabled={saving}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Class Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className={inputCls} placeholder="e.g. Web Development Live Class" />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className={inputCls + ' resize-none'} rows={3} placeholder="What will this class cover?" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Instructor Name *</label>
                  <input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })}
                    className={inputCls} placeholder="e.g. Collins" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as FormData['status'] })} className={inputCls}>
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date *
                  </label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Start Time *
                  </label>
                  <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })}
                    className={inputCls} />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">YouTube Live URL *</label>
                <input value={form.youtube_url} onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                  className={inputCls} placeholder="https://www.youtube.com/watch?v=VIDEO_ID" />
                {form.youtube_url && !extractYouTubeId(form.youtube_url) && (
                  <p className="text-red-400 text-xs mt-1">⚠️ Could not detect a valid YouTube video ID</p>
                )}
                {form.youtube_url && extractYouTubeId(form.youtube_url) && (
                  <p className="text-emerald-400 text-xs mt-1">✓ Video ID: {extractYouTubeId(form.youtube_url)}</p>
                )}
              </div>

              {/* Thumbnail upload */}
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Thumbnail Image</label>
                <label className={cn(
                  'flex items-start gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all',
                  thumbnail.progress === 100 && thumbnail.url ? 'border-emerald-500 bg-emerald-900/10' :
                  thumbnail.uploading ? 'border-blue-500 bg-blue-900/10 cursor-wait' :
                  thumbnail.file ? 'border-primary-500 bg-primary-900/10' :
                  'border-slate-600 bg-slate-800/50 hover:border-primary-400'
                )}>
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    thumbnail.progress === 100 && thumbnail.url ? 'bg-emerald-600/20' : 'bg-indigo-600/20')}>
                    {thumbnail.progress === 100 && thumbnail.url
                      ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                      : <Image className="w-5 h-5 text-slate-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    {!thumbnail.file && !thumbnail.url ? (
                      <>
                        <p className="text-slate-300 text-sm font-medium">Upload thumbnail</p>
                        <p className="text-slate-500 text-xs mt-0.5">JPG, PNG, WebP · Max 5MB</p>
                      </>
                    ) : thumbnail.uploading ? (
                      <>
                        <p className="text-blue-400 text-sm font-medium truncate">{thumbnail.file?.name}</p>
                        <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${thumbnail.progress}%` }} />
                        </div>
                        <p className="text-blue-400 text-xs mt-1">Uploading... {thumbnail.progress}%</p>
                      </>
                    ) : thumbnail.progress === 100 && thumbnail.url ? (
                      <>
                        <p className="text-emerald-400 text-sm font-medium">✓ Thumbnail ready</p>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">{thumbnail.url}</p>
                      </>
                    ) : thumbnail.url ? (
                      <>
                        <p className="text-slate-300 text-sm font-medium">Current thumbnail set</p>
                        <p className="text-slate-500 text-xs mt-0.5">Click to replace</p>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-300 text-sm font-medium truncate">{thumbnail.file?.name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">Ready to upload</p>
                      </>
                    )}
                    {thumbnail.error && <p className="text-red-400 text-xs mt-1">❌ {thumbnail.error}</p>}
                  </div>
                  {!thumbnail.uploading && (
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
                      setThumbnail({ ...EMPTY_THUMB, file: f });
                    }} />
                  )}
                </label>
              </div>

              {/* Save buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => !saving && setShowModal(false)} disabled={saving}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Saving...' : (editClass ? 'Update Class' : 'Create Class')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
