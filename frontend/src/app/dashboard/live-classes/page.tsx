'use client';
import { useEffect, useState, useCallback } from 'react';
import { Radio, Clock, Calendar, User, Play, X, ExternalLink, Video, Bell, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { liveClassApi } from '@/lib/api';
import { LiveClass } from '@/types';
import { cn } from '@/lib/utils';

function formatClassDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatClassTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Countdown hook
function useCountdown(target: string) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; total: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0, total: 0,
  });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, total: diff });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [target]);

  return timeLeft;
}

function StatusBadge({ status }: { status: LiveClass['status'] }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-red-500/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        LIVE NOW
      </span>
    );
  }
  if (status === 'upcoming') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
        🟢 Upcoming
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-slate-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
      ⚫ Ended
    </span>
  );
}

function CountdownTimer({ startTime }: { startTime: string }) {
  const { days, hours, minutes, seconds, total } = useCountdown(startTime);

  if (total <= 0) return null;

  const units = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hrs' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ];

  return (
    <div className="flex gap-2">
      {units.map(u => (
        <div key={u.label} className="bg-primary-600 text-white rounded-lg px-2.5 py-1.5 text-center min-w-[48px]">
          <div className="font-display font-bold text-lg leading-none tabular-nums">{String(u.value).padStart(2, '0')}</div>
          <div className="text-[10px] text-primary-100 mt-0.5">{u.label}</div>
        </div>
      ))}
    </div>
  );
}

function VideoPlayerModal({ liveClass, onClose }: { liveClass: LiveClass; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <StatusBadge status="live" />
            <h3 className="font-bold text-white truncate">{liveClass.title}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={liveClass.youtube_url} target="_blank" rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              title="Open in YouTube">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
          <iframe
            width="100%"
            height="500"
            src={`https://www.youtube.com/embed/${liveClass.youtube_id}?autoplay=1`}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        <div className="p-4 bg-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300 text-sm">
            <User className="w-4 h-4 text-primary-400" />
            <span>{liveClass.instructor}</span>
          </div>
          <p className="text-slate-500 text-xs">Stay on SkillRise Academy to chat with other learners</p>
        </div>
      </div>
    </div>
  );
}

function LiveClassCard({ liveClass, onJoin }: { liveClass: LiveClass; onJoin: (lc: LiveClass) => void }) {
  const { total } = useCountdown(liveClass.start_time);
  const isLive = liveClass.status === 'live';
  const isEnded = liveClass.status === 'ended';
  const isUpcoming = liveClass.status === 'upcoming';

  return (
    <div className={cn(
      'card-hover overflow-hidden group transition-all',
      isLive && 'ring-2 ring-red-500 shadow-lg shadow-red-500/10'
    )}>
      {/* Thumbnail */}
      <div className="h-48 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
        {liveClass.thumbnail ? (
          <img src={liveClass.thumbnail} alt={liveClass.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Video className="w-16 h-16 text-white/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <StatusBadge status={liveClass.status} />
        </div>

        {/* Play overlay for live */}
        {isLive && (
          <button onClick={() => onJoin(liveClass)}
            className="absolute inset-0 flex items-center justify-center group">
            <div className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/50 transition-all group-hover:scale-110 animate-pulse">
              <Play className="w-7 h-7 text-white fill-white ml-0.5" />
            </div>
          </button>
        )}

        {/* Countdown for upcoming */}
        {isUpcoming && total > 0 && (
          <div className="absolute bottom-3 left-3 right-3">
            <CountdownTimer startTime={liveClass.start_time} />
          </div>
        )}
      </div>

      {/* Details */}
      <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {liveClass.title}
      </h3>

      {liveClass.description && (
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-2">{liveClass.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
        <div className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>{liveClass.instructor}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatClassDate(liveClass.start_time)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatClassTime(liveClass.start_time)}</span>
        </div>
      </div>

      {/* Join button */}
      <button
        onClick={() => onJoin(liveClass)}
        disabled={isEnded}
        className={cn(
          'w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all',
          isLive && 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 hover:-translate-y-0.5',
          isUpcoming && 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100',
          isEnded && 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
        )}
      >
        {isLive && <><Radio className="w-4 h-4" /> Join Live Class Now</>}
        {isUpcoming && <><Bell className="w-4 h-4" /> View Class Details</>}
        {isEnded && <><X className="w-4 h-4" /> Class Ended</>}
      </button>
    </div>
  );
}

function ClassDetailsModal({ liveClass, onClose, onJoinLive }: { liveClass: LiveClass; onClose: () => void; onJoinLive: () => void }) {
  const { days, hours, minutes, seconds, total } = useCountdown(liveClass.start_time);
  const startTimeFormatted = formatClassTime(liveClass.start_time);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Thumbnail */}
        <div className="h-40 bg-gradient-to-br from-primary-600 to-primary-800 relative">
          {liveClass.thumbnail ? (
            <img src={liveClass.thumbnail} alt={liveClass.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center"><Video className="w-12 h-12 text-white/20" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3"><StatusBadge status={liveClass.status} /></div>
          <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/30 hover:bg-black/50 text-white rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">{liveClass.title}</h2>
          {liveClass.description && (
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{liveClass.description}</p>
          )}

          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-primary-500" /> Instructor: <span className="font-semibold">{liveClass.instructor}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-primary-500" /> {formatClassDate(liveClass.start_time)}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-primary-500" /> {startTimeFormatted}
            </div>
          </div>

          {liveClass.status === 'live' ? (
            <button onClick={onJoinLive}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all">
              <Radio className="w-5 h-5" /> Join Live Class Now
            </button>
          ) : liveClass.status === 'upcoming' ? (
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl p-4 text-center">
              <p className="text-primary-700 dark:text-primary-400 font-semibold text-sm mb-3">
                This class starts at {startTimeFormatted}
              </p>
              {total > 0 && (
                <div className="flex justify-center">
                  <CountdownTimer startTime={liveClass.start_time} />
                </div>
              )}
              <p className="text-slate-400 text-xs mt-3 flex items-center justify-center gap-1.5">
                <Bell className="w-3.5 h-3.5" /> We'll notify you when it's about to start
              </p>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-center">
              <p className="text-slate-500 text-sm font-medium">This class has ended</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingClass, setPlayingClass] = useState<LiveClass | null>(null);
  const [detailsClass, setDetailsClass] = useState<LiveClass | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await liveClassApi.getAll();
      setClasses(res.data.data || []);
    } catch {
      toast.error('Failed to load live classes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
    // Refresh status every 30 seconds to catch live transitions
    const interval = setInterval(fetchClasses, 30000);
    return () => clearInterval(interval);
  }, [fetchClasses]);

  const handleJoin = (lc: LiveClass) => {
    if (lc.status === 'live') {
      setPlayingClass(lc);
    } else {
      setDetailsClass(lc);
    }
  };

  const handleJoinFromDetails = () => {
    if (detailsClass) {
      setPlayingClass(detailsClass);
      setDetailsClass(null);
    }
  };

  const liveNow = classes.filter(c => c.status === 'live');
  const upcoming = classes.filter(c => c.status === 'upcoming');
  const ended = classes.filter(c => c.status === 'ended');

  return (
    <div className="space-y-8">
      {playingClass && (
        <VideoPlayerModal liveClass={playingClass} onClose={() => setPlayingClass(null)} />
      )}
      {detailsClass && (
        <ClassDetailsModal liveClass={detailsClass} onClose={() => setDetailsClass(null)} onJoinLive={handleJoinFromDetails} />
      )}

      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Radio className="w-7 h-7 text-red-500" /> Live Classes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Join live sessions with instructors — interact, learn, and ask questions in real-time</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-48 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse mb-4" />
              <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 card">
          <Radio className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">No live classes scheduled</h3>
          <p className="text-slate-500">Check back soon for upcoming live sessions!</p>
        </div>
      ) : (
        <>
          {/* Live Now */}
          {liveNow.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Live Now</h2>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {liveNow.map(lc => <LiveClassCard key={lc.id} liveClass={lc} onJoin={handleJoin} />)}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span>🟢</span> Upcoming Classes
              </h2>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcoming.map(lc => <LiveClassCard key={lc.id} liveClass={lc} onJoin={handleJoin} />)}
              </div>
            </div>
          )}

          {/* Ended */}
          {ended.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2 opacity-60">
                <span>⚫</span> Past Classes
              </h2>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-60">
                {ended.map(lc => <LiveClassCard key={lc.id} liveClass={lc} onJoin={handleJoin} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
