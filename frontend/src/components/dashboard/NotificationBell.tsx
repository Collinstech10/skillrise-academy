'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Radio, Megaphone, DollarSign, BookOpen, Info, Check } from 'lucide-react';
import { userApi } from '@/lib/api';
import { formatDateTime, cn } from '@/lib/utils';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'referral' | 'course' | 'payment';
  is_read: boolean;
  created_at: string;
}

const ICONS: Record<string, React.ElementType> = {
  info: Info,
  success: Check,
  warning: Info,
  referral: DollarSign,
  course: Radio,
  payment: DollarSign,
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = () => {
    userApi.getNotifications()
      .then(res => setNotifications(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60 * 1000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleMarkAllRead = async () => {
    try {
      await userApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await userApi.markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      } catch {}
    }
    // If it's a live class notification, navigate there
    if (notif.message.includes('Live Class') || notif.message.includes('starts in')) {
      router.push('/dashboard/live-classes');
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-400 text-sm">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map(notif => {
                const Icon = ICONS[notif.type] || Info;
                const isLiveClass = notif.message.includes('Live Class') || notif.message.includes('starts in');
                return (
                  <button key={notif.id} onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      'w-full flex items-start gap-3 p-3 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-left',
                      !notif.is_read && 'bg-primary-50/50 dark:bg-primary-900/10'
                    )}>
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      isLiveClass ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm', !notif.is_read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400')}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(notif.created_at)}</p>
                      {isLiveClass && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-primary-600 hover:underline">
                          <Radio className="w-3 h-3" /> Join Live Class →
                        </span>
                      )}
                    </div>
                    {!notif.is_read && <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-1.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
