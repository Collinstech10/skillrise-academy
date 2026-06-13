'use client';
import { useEffect, useState } from 'react';
import { MessageCircle, Heart, Send, Users, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatDateTime, getInitials, cn } from '@/lib/utils';

interface Post {
  id: string;
  content: string;
  likes: number;
  liked?: boolean;
  created_at: string;
  user: { id: string; fullname: string; username: string; avatar_url?: string };
  comments: Comment[];
  showComments?: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: { fullname: string; username: string; avatar_url?: string };
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/community/posts')
      .then(res => setPosts(res.data.data || []))
      .catch(() => toast.error('Failed to load community posts'))
      .finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (newPost.length > 500) { toast.error('Post too long (max 500 chars)'); return; }
    setPosting(true);
    try {
      const res = await api.post('/community/posts', { content: newPost });
      setPosts(prev => [{ ...res.data.data, comments: [], liked: false }, ...prev]);
      setNewPost('');
      toast.success('Posted!');
    } catch { toast.error('Failed to post'); }
    finally { setPosting(false); }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked }
        : p
      ));
    } catch { toast.error('Failed to like'); }
  };

  const handleComment = async (postId: string) => {
    const content = commentText[postId]?.trim();
    if (!content) return;
    try {
      const res = await api.post(`/community/posts/${postId}/comments`, { content });
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, comments: [...(p.comments || []), res.data.data] }
        : p
      ));
      setCommentText(prev => ({ ...prev, [postId]: '' }));
    } catch { toast.error('Failed to comment'); }
  };

  const toggleComments = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, showComments: !p.showComments } : p));
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-primary-600" /> Community
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Connect, share wins, and learn together</p>
      </div>

      {/* Create post */}
      <div className="card">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials(user?.fullname || 'U')}
          </div>
          <div className="flex-1">
            <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
              className="input-field resize-none" rows={3}
              placeholder="Share a win, ask a question, or motivate others... 🚀" />
            <div className="flex items-center justify-between mt-2">
              <span className={cn('text-xs', newPost.length > 450 ? 'text-red-500' : 'text-slate-400')}>
                {newPost.length}/500
              </span>
              <button onClick={handlePost} disabled={posting || !newPost.trim()}
                className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                {posting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 card animate-pulse bg-slate-100 dark:bg-slate-800" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16">
          <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Be the first to post!</p>
          <p className="text-slate-400 text-sm mt-1">Share your learning journey with the community</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.id} className="card">
              {/* Post header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {post.user?.avatar_url
                    ? <img src={post.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    : getInitials(post.user?.fullname || 'U')}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{post.user?.fullname}</p>
                  <p className="text-xs text-slate-400">@{post.user?.username} · {formatDateTime(post.created_at)}</p>
                </div>
                {post.user?.id === user?.id && (
                  <span className="ml-auto badge badge-info text-xs">You</span>
                )}
              </div>

              {/* Content */}
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{post.content}</p>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => handleLike(post.id)}
                  className={cn('flex items-center gap-1.5 text-sm font-medium transition-colors',
                    post.liked ? 'text-red-500' : 'text-slate-400 hover:text-red-400')}>
                  <Heart className={cn('w-4 h-4', post.liked && 'fill-current')} />
                  {post.likes}
                </button>
                <button onClick={() => toggleComments(post.id)}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary-600 font-medium transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  {post.comments?.length || 0} Comments
                </button>
              </div>

              {/* Comments */}
              {post.showComments && (
                <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  {post.comments?.map(comment => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs font-bold shrink-0">
                        {getInitials(comment.user?.fullname || 'U')}
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{comment.user?.fullname}</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {getInitials(user?.fullname || 'U')}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input value={commentText[post.id] || ''} onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                        className="input-field py-2 text-sm flex-1" placeholder="Write a comment..." />
                      <button onClick={() => handleComment(post.id)}
                        className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
