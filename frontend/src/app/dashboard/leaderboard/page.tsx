'use client';
import { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency, getInitials, cn } from '@/lib/utils';

interface LeaderEntry {
  id: string;
  username: string;
  fullname: string;
  avatar_url?: string;
  referral_count: number;
  total_earnings: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(res => setLeaders(res.data.data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-slate-400 font-bold text-sm">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800';
    if (rank === 2) return 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-200 dark:border-slate-600';
    if (rank === 3) return 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800';
    return 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700';
  };

  const myRank = leaders.findIndex(l => l.id === user?.id) + 1;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-500" /> Referral Leaderboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Top earners. Share your link to climb the ranks!</p>
      </div>

      {myRank > 0 && (
        <div className="card border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
              {myRank}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">Your Rank</p>
              <p className="text-sm text-slate-500">Keep referring to move up!</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary-600">{formatCurrency(leaders[myRank - 1]?.total_earnings || 0)}</p>
              <p className="text-xs text-slate-400">{leaders[myRank - 1]?.referral_count || 0} referrals</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-600" /> Rankings
        </h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No referrals yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const isMe = leader.id === user?.id;
              return (
                <div key={leader.id}
                  className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all',
                    getRankBg(rank), isMe && 'ring-2 ring-primary-500')}>
                  <div className="w-8 flex items-center justify-center shrink-0">
                    {getRankIcon(rank)}
                  </div>
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0',
                    rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-slate-400' : rank === 3 ? 'bg-amber-600' : 'bg-primary-500'
                  )}>
                    {leader.avatar_url
                      ? <img src={leader.avatar_url} alt={leader.username} className="w-full h-full rounded-full object-cover" />
                      : getInitials(leader.fullname)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {leader.username} {isMe && <span className="text-primary-500 text-xs">(You)</span>}
                    </p>
                    <p className="text-xs text-slate-400">{leader.referral_count} referrals</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-emerald-600 text-sm">{formatCurrency(leader.total_earnings)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
