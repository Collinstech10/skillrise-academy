'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlayCircle, FileText, BookOpen, ChevronRight, Clock, Download, X, ExternalLink, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi } from '@/lib/api';
import { Purchase } from '@/types';
import { formatDate, getCategoryColor, cn } from '@/lib/utils';

function VideoModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const getEmbedUrl = (url: string) => {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    return url;
  };
  const embedUrl = getEmbedUrl(url);
  const isDirect = url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg');

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-white truncate pr-4">{title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              title="Open in new tab">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="bg-black" style={{ position: 'relative', paddingBottom: isDirect ? undefined : '56.25%', height: isDirect ? '450px' : undefined }}>
          {isDirect ? (
            <video src={url} controls autoPlay className="w-full h-full" style={{ height: '450px' }} />
          ) : (
            <iframe src={embedUrl}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          )}
        </div>
        <div className="p-3 bg-slate-800 text-center">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-primary-400 text-sm hover:underline flex items-center justify-center gap-1">
            <ExternalLink className="w-3 h-3" /> Open video in new tab
          </a>
        </div>
      </div>
    </div>
  );
}

function PDFModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const getDownloadUrl = (url: string) => {
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    return url;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl" style={{ height: '90vh' }}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="font-bold text-white truncate pr-4">{title} — PDF Material</h3>
          <div className="flex items-center gap-2 shrink-0">
            <a href={getDownloadUrl(url)} download target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-all">
              <Download className="w-3.5 h-3.5" /> Download PDF
            </a>
            <button onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="h-full" style={{ height: 'calc(90vh - 70px)' }}>
          <iframe
            src={url.includes('drive.google.com')
              ? url.replace('/view', '/preview').replace('/edit', '/preview')
              : `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
            className="w-full h-full border-0"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}

export default function MyCoursesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{ url: string; title: string } | null>(null);
  const [pdfModal, setPdfModal] = useState<{ url: string; title: string } | null>(null);

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
          <div key={i} className="card h-48 animate-pulse bg-slate-100 dark:bg-slate-800" />
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
      {videoModal && (
        <VideoModal url={videoModal.url} title={videoModal.title} onClose={() => setVideoModal(null)} />
      )}
      {pdfModal && (
        <PDFModal url={pdfModal.url} title={pdfModal.title} onClose={() => setPdfModal(null)} />
      )}

      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {purchases.length} course{purchases.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {purchases.map(purchase => {
          const course = purchase.course;
          if (!course) return null;

          return (
            <div key={purchase.id} className="card group flex flex-col">
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                <BookOpen className="w-12 h-12 text-white/20" />
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className={cn('absolute top-3 left-3 badge', getCategoryColor(course.category))}>
                  {course.category}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Enrolled
                </div>
              </div>

              <h3 className="font-display font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-2 flex-1">
                {course.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Clock className="w-3.5 h-3.5" />
                <span>Enrolled {formatDate(purchase.created_at)}</span>
                {course.duration && (
                  <>
                    <span>•</span>
                    <span>{course.duration}</span>
                  </>
                )}
                {course.instructor && (
                  <>
                    <span>•</span>
                    <span>{course.instructor}</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                {/* Video Button */}
                {course.video_url ? (
                  <button
                    onClick={() => setVideoModal({ url: course.video_url!, title: course.title })}
                    className="flex items-center justify-center gap-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold py-3 px-4 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-all text-sm border border-primary-100 dark:border-primary-800">
                    <PlayCircle className="w-4 h-4" /> Watch Video
                  </button>
                ) : (
                  <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-400 font-medium py-3 px-4 rounded-xl text-sm border border-slate-200 dark:border-slate-700">
                    <PlayCircle className="w-4 h-4" /> Video Soon
                  </div>
                )}

                {/* PDF Button */}
                {course.pdf_url ? (
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPdfModal({ url: course.pdf_url!, title: course.title })}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold py-3 px-3 rounded-xl hover:bg-emerald-100 transition-all text-sm border border-emerald-100 dark:border-emerald-800">
                      <FileText className="w-4 h-4" /> View PDF
                    </button>
                    <a
                      href={course.pdf_url.includes('drive.google.com')
                        ? course.pdf_url.replace('/view', '').replace('/edit', '') + '?export=download'
                        : course.pdf_url}
                      download target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all"
                      title="Download PDF">
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 text-slate-400 font-medium py-3 px-4 rounded-xl text-sm border border-slate-200 dark:border-slate-700">
                    <FileText className="w-4 h-4" /> PDF Soon
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link href="/dashboard/courses"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold hover:underline">
          Browse more courses <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
