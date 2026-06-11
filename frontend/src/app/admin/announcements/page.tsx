'use client';
import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { Announcement } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getAnnouncements()
      .then(res => setAnnouncements(res.data.data))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) { toast.error('Title and message required'); return; }
    setSaving(true);
    try {
      const res = await adminApi.createAnnouncement({ title, message });
      setAnnouncements(prev => [res.data.data, ...prev]);
      setTitle(''); setMessage('');
      toast.success('Announcement sent to all users!');
    } catch {
      toast.error('Failed to create announcement');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-500';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Announcements</h1>
        <p className="text-slate-400 text-sm mt-1">Send platform-wide notifications to all users</p>
      </div>

      {/* Create form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-display font-bold text-white mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary-400" /> New Announcement
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} placeholder="Announcement title..." />
          </div>
          <div>
            <label className="text-slate-400 text-xs font-medium block mb-1.5">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              className={inputCls + ' resize-none'} rows={4} placeholder="Write your message to all users..." />
          </div>
          <button onClick={handleCreate} disabled={saving}
            className="btn-primary flex items-center gap-2">
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Megaphone className="w-4 h-4" />}
            {saving ? 'Sending...' : 'Send to All Users'}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-display font-bold text-white mb-4">Previous Announcements</h2>
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-800 rounded-xl animate-pulse" />)}</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">No announcements yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-white">{ann.title}</p>
                    <p className="text-slate-400 text-sm mt-1 leading-relaxed">{ann.message}</p>
                    <p className="text-slate-600 text-xs mt-2">{formatDateTime(ann.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
