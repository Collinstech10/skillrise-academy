'use client';
import { useEffect, useState } from 'react';
import { Search, Star, Users, BookOpen, ShoppingCart, CheckCircle, Monitor, Palette, Megaphone, Bot, BarChart, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi, paymentApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Course } from '@/types';
import { formatCurrency, getCategoryColor, cn } from '@/lib/utils';
import { usePaystack, generateReference } from '@/hooks/usePaystack';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Web Development': Monitor,
  'Graphic Design': Palette,
  'Digital Marketing': Megaphone,
  'AI Tools': Bot,
  'Business Growth': BarChart,
  'Cybersecurity': Lock,
};

const CATEGORIES = ['All', 'Web Development', 'Graphic Design', 'Digital Marketing', 'AI Tools', 'Business Growth', 'Cybersecurity'];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { initializePayment } = usePaystack();

  useEffect(() => {
    courseApi.getAll()
      .then(res => setCourses(res.data.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || c.category === category;
    return matchSearch && matchCat;
  });

  const handlePurchase = (course: Course) => {
    if (!user) return;
    if (course.purchased) { toast('You already own this course!'); return; }

    const reference = generateReference('COURSE');
    setPurchasing(course.id);

    initializePayment({
      email: user.email,
      amount: course.price,
      reference,
      metadata: { userId: user.id, courseId: course.id, type: 'course' },
      onSuccess: async (ref) => {
        try {
          await paymentApi.verifyCourse(ref, course.id);
          setCourses(prev => prev.map(c => c.id === course.id ? { ...c, purchased: true } : c));
          toast.success(`"${course.title}" unlocked!`);
        } catch {
          toast.error('Payment verified but course unlock failed. Contact support.');
        } finally {
          setPurchasing(null);
        }
      },
      onClose: () => { setPurchasing(null); toast('Payment cancelled'); },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Course Marketplace</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Invest in yourself — browse and purchase expert-led courses</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10" placeholder="Search courses..." />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className={cn('px-4 py-2 rounded-full text-sm font-medium transition-all',
              category === cat
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300'
            )}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card">
              <div className="h-44 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse mb-4" />
              <div className="h-5 bg-slate-100 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">No courses found matching your criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(course => {
            const Icon = CATEGORY_ICONS[course.category] || BookOpen;
            return (
              <div key={course.id} className="card-hover group overflow-hidden flex flex-col">
                {/* Thumbnail */}
                <div className="h-44 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <Icon className="w-16 h-16 text-white/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {course.thumbnail && (
                    <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className={cn('absolute top-3 left-3 badge', getCategoryColor(course.category))}>{course.category}</div>
                  {course.purchased && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Owned
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col">
                  <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">{course.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" /> 4.8
                    </div>
                    {course.duration && <div className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{course.duration}</div>}
                    {course.level && <span className="badge badge-info">{course.level}</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-display text-xl font-bold text-primary-600">{formatCurrency(course.price)}</div>
                    <button onClick={() => handlePurchase(course)} disabled={!!course.purchased || purchasing === course.id}
                      className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                        course.purchased
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 cursor-default'
                          : 'btn-primary py-2'
                      )}>
                      {purchasing === course.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : course.purchased ? (
                        <><CheckCircle className="w-4 h-4" /> Enrolled</>
                      ) : (
                        <><ShoppingCart className="w-4 h-4" /> Buy Now</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
