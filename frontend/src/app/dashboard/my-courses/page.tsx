'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, FileText, BookOpen, ChevronRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi } from '@/lib/api';
import { Purchase } from '@/types';
import { formatDate, getCategoryColor, cn } from '@/lib/utils';

export default function MyCoursesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseApi.getMyCourses()
      .then(res => setPurchases(res.data.data))
      .catch(() => toast.error('Failed to load your courses'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card h-32 animate-pulse bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>
        <div className="text-center py-24 card">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Purchase your first course to start learning</p>
          <Link href="/dashboard/courses" className="btn-primary inline-flex">Browse Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{purchases.length} course{purchases.length !== 1 ? 's' : ''} enrolled</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {purchases.map(purchase => {
          const course = purchase.course;
          if (!course) return null;

          return (
            <div key={purchase.id} className="card group">
              {/* Header */}
              <div className="h-36 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                <BookOpen className="w-12 h-12 text-white/20" />
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className={cn('absolute top-3 left-3 badge', getCategoryColor(course.category))}>
                  {course.category}
                </div>
              </div>

              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">{course.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Clock className="w-3.5 h-3.5" />
                <span>Enrolled {formatDate(purchase.created_at)}</span>
              </div>

              {/* Progress bar placeholder */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span>0%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: '0%' }} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {course.video_url ? (
                  <a href={course.video_url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold py-2.5 px-4 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all text-sm">
                    <PlayCircle className="w-4 h-4" /> Watch Videos
                  </a>
                ) : (
                  <button disabled className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-400 font-semibold py-2.5 px-4 rounded-xl text-sm cursor-not-allowed">
                    <PlayCircle className="w-4 h-4" /> Videos Coming
                  </button>
                )}

                {course.pdf_url ? (
                  <a href={course.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold py-2.5 px-4 rounded-xl hover:bg-emerald-100 transition-all text-sm">
                    <FileText className="w-4 h-4" /> PDF
                  </a>
                ) : (
                  <button disabled className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-400 font-semibold py-2.5 px-4 rounded-xl text-sm cursor-not-allowed">
                    <FileText className="w-4 h-4" /> PDF
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link href="/dashboard/courses" className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Browse more courses <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
