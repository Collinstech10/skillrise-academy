'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, X, FileText, Video, CheckCircle, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { Course } from '@/types';
import { formatCurrency, formatDate, getCategoryColor, cn } from '@/lib/utils';
import { uploadToSupabase, formatFileSize, UploadProgress } from '@/lib/upload';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES = ['Web Development', 'Graphic Design', 'Digital Marketing', 'AI Tools', 'Business Growth', 'Cybersecurity'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

interface CourseFormData {
  title: string; description: string; price: string;
  category: string; level: string; duration: string; instructor: string;
}

const EMPTY: CourseFormData = {
  title: '', description: '', price: '',
  category: CATEGORIES[0], level: LEVELS[0], duration: '', instructor: '',
};

interface FileState {
  file: File | null;
  progress: number;
  uploading: boolean;
  url: string;
  error: string;
}

const EMPTY_FILE: FileState = { file: null, progress: 0, uploading: false, url: '', error: '' };

function UploadBox({
  label, accept, fileState, onChange, icon: Icon, color, maxSize, hint,
}: {
  label: string; accept: string; fileState: FileState;
  onChange: (f: File | null) => void; icon: React.ElementType;
  color: string; maxSize: number; hint: string;
}) {
  const hasFile = !!fileState.file;
  const hasUrl = !!fileState.url;
  const isUploading = fileState.uploading;
  const isDone = fileState.progress === 100 && hasUrl;

  return (
    <div>
      <label className="text-slate-400 text-xs font-medium block mb-1.5">{label}</label>
      <label className={cn(
        'flex items-start gap-3 border-2 border-dashed rounded-xl p-4 transition-all',
        isDone ? 'border-emerald-500 bg-emerald-900/10 cursor-default' :
        isUploading ? 'border-blue-500 bg-blue-900/10 cursor-wait' :
        hasFile ? 'border-primary-500 bg-primary-900/10 cursor-pointer' :
        'border-slate-600 bg-slate-800/50 hover:border-primary-400 cursor-pointer'
      )}>
        {/* Icon */}
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
          isDone ? 'bg-emerald-600/20' : isUploading ? 'bg-blue-600/20' : color)}>
          {isDone
            ? <CheckCircle className="w-5 h-5 text-emerald-400" />
            : <Icon className="w-5 h-5 text-slate-300" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {!hasFile ? (
            <>
              <p className="text-slate-300 text-sm font-medium">Upload {label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{hint}</p>
              <p className="text-slate-600 text-xs mt-0.5">Max {formatFileSize(maxSize)}</p>
            </>
          ) : isDone ? (
            <>
              <p className="text-emerald-400 text-sm font-medium truncate">✓ {fileState.file!.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{formatFileSize(fileState.file!.size)} · Uploaded</p>
            </>
          ) : isUploading ? (
            <>
              <p className="text-blue-400 text-sm font-medium truncate">{fileState.file!.name}</p>
              <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${fileState.progress}%` }}
                />
              </div>
              <p className="text-blue-400 text-xs mt-1">Uploading... {fileState.progress}%</p>
            </>
          ) : (
            <>
              <p className="text-slate-300 text-sm font-medium truncate">{fileState.file!.name}</p>
              <p className="text-slate-500 text-xs mt-0.5">{formatFileSize(fileState.file!.size)} · Ready to upload</p>
            </>
          )}

          {fileState.error && (
            <p className="text-red-400 text-xs mt-1">❌ {fileState.error}</p>
          )}
        </div>

        {/* Remove button */}
        {hasFile && !isUploading && (
          <button type="button" onClick={e => { e.preventDefault(); onChange(null); }}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Hidden input */}
        {!isDone && !isUploading && (
          <input type="file" accept={accept} className="hidden" onChange={e => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (f.size > maxSize) {
              toast.error(`File too large. Max ${formatFileSize(maxSize)}`);
              return;
            }
            onChange(f);
          }} />
        )}
      </label>
    </div>
  );
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseFormData>(EMPTY);
  const [thumbnail, setThumbnail] = useState<FileState>(EMPTY_FILE);
  const [video, setVideo] = useState<FileState>(EMPTY_FILE);
  const [pdf, setPdf] = useState<FileState>(EMPTY_FILE);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getCourses()
      .then(res => setCourses(res.data.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const resetModal = () => {
    setForm(EMPTY);
    setThumbnail(EMPTY_FILE);
    setVideo(EMPTY_FILE);
    setPdf(EMPTY_FILE);
  };

  const openCreate = () => { setEditCourse(null); resetModal(); setShowModal(true); };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({
      title: course.title, description: course.description,
      price: String(course.price), category: course.category,
      level: course.level || LEVELS[0], duration: course.duration || '',
      instructor: course.instructor || '',
    });
    setThumbnail({ ...EMPTY_FILE, url: course.thumbnail || '' });
    setVideo({ ...EMPTY_FILE, url: course.video_url || '' });
    setPdf({ ...EMPTY_FILE, url: course.pdf_url || '' });
    setShowModal(true);
  };

  const uploadFile = async (
    fileState: FileState,
    setter: React.Dispatch<React.SetStateAction<FileState>>,
    folder: 'thumbnails' | 'videos' | 'pdfs',
    courseId: string,
    ext: string
  ): Promise<string> => {
    if (!fileState.file) return fileState.url;
    setter(prev => ({ ...prev, uploading: true, error: '', progress: 0 }));
    try {
      const url = await uploadToSupabase(
        fileState.file,
        folder,
        `${courseId}.${ext}`,
        (p: UploadProgress) => setter(prev => ({ ...prev, progress: p.percent }))
      );
      setter(prev => ({ ...prev, uploading: false, progress: 100, url }));
      return url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setter(prev => ({ ...prev, uploading: false, error: msg }));
      throw new Error(msg);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.price) {
      toast.error('Title, description, and price are required'); return;
    }

    setSaving(true);
    try {
      const courseId = editCourse?.id || uuidv4();

      // Upload all files to Supabase directly from browser
      const [thumbUrl, videoUrl, pdfUrl] = await Promise.all([
        thumbnail.file
          ? uploadFile(thumbnail, setThumbnail, 'thumbnails', courseId,
              thumbnail.file.name.split('.').pop() || 'jpg')
          : Promise.resolve(thumbnail.url),
        video.file
          ? uploadFile(video, setVideo, 'videos', courseId,
              video.file.name.split('.').pop() || 'mp4')
          : Promise.resolve(video.url),
        pdf.file
          ? uploadFile(pdf, setPdf, 'pdfs', courseId, 'pdf')
          : Promise.resolve(pdf.url),
      ]);

      // Send metadata to backend (no files — just URLs)
      const payload = {
        id: courseId,
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        level: form.level,
        duration: form.duration,
        instructor: form.instructor,
        thumbnail: thumbUrl,
        video_url: videoUrl,
        pdf_url: pdfUrl,
      };

      if (editCourse) {
        const res = await adminApi.updateCourseJson(editCourse.id, payload);
        setCourses(prev => prev.map(c => c.id === editCourse.id ? res.data.data : c));
        toast.success('Course updated!');
      } else {
        const res = await adminApi.createCourseJson(payload);
        setCourses(prev => [res.data.data, ...prev]);
        toast.success('Course created!');
      }
      setShowModal(false);
      resetModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save course';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await adminApi.deleteCourse(id);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success('Course deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeletingId(null); }
  };

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Course Management</h1>
          <p className="text-slate-400 text-sm mt-1">{courses.length} courses · Files upload directly to Supabase</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Course grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No courses yet</p>
          <button onClick={openCreate} className="btn-primary text-sm inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create First Course
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map(course => (
            <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all group">
              <div className="h-36 bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center relative">
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                  : <BookOpen className="w-12 h-12 text-white/20" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className={cn('absolute top-3 left-3 badge', getCategoryColor(course.category))}>{course.category}</span>
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {course.video_url && (
                    <span className="bg-blue-600/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Video className="w-2.5 h-2.5" /> Video
                    </span>
                  )}
                  {course.pdf_url && (
                    <span className="bg-red-600/90 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FileText className="w-2.5 h-2.5" /> PDF
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-1 line-clamp-1 group-hover:text-primary-400 transition-colors">{course.title}</h3>
                <p className="text-slate-500 text-xs mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-400 font-bold">{formatCurrency(course.price)}</p>
                    <p className="text-slate-600 text-xs">{course.level} · {formatDate(course.created_at)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(course)}
                      className="p-2 bg-primary-600/20 hover:bg-primary-600/40 text-primary-400 rounded-lg transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(course.id, course.title)}
                      disabled={deletingId === course.id}
                      className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg transition-all disabled:opacity-50">
                      {deletingId === course.id
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
              <h2 className="font-display font-bold text-white text-lg">
                {editCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button onClick={() => !saving && setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all disabled:opacity-50"
                disabled={saving}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Course details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Course Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className={inputCls} placeholder="e.g. Full-Stack Web Development" />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className={inputCls + ' resize-none'} rows={3} placeholder="What will students learn?" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Price (₦) *</label>
                  <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                    className={inputCls} type="number" min="0" placeholder="e.g. 15000" />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Level</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className={inputCls}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Duration</label>
                  <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                    className={inputCls} placeholder="e.g. 8 hours" />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Instructor Name</label>
                  <input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })}
                    className={inputCls} placeholder="e.g. John Adewale" />
                </div>
              </div>

              {/* File uploads */}
              <div className="border-t border-slate-700 pt-4">
                <p className="text-slate-300 text-sm font-semibold mb-3">📁 Course Files</p>
                <p className="text-slate-500 text-xs mb-4">Files upload directly to Supabase Storage — no size issues</p>

                <div className="space-y-3">
                  <UploadBox
                    label="Course Thumbnail"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    fileState={thumbnail}
                    onChange={f => setThumbnail(f ? { ...EMPTY_FILE, file: f } : { ...EMPTY_FILE, url: editCourse?.thumbnail || '' })}
                    icon={Image}
                    color="bg-indigo-600/20"
                    maxSize={5 * 1024 * 1024}
                    hint="JPG, PNG, WebP · Max 5MB"
                  />

                  <UploadBox
                    label="Course Video"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                    fileState={video}
                    onChange={f => setVideo(f ? { ...EMPTY_FILE, file: f } : { ...EMPTY_FILE, url: editCourse?.video_url || '' })}
                    icon={Video}
                    color="bg-purple-600/20"
                    maxSize={2 * 1024 * 1024 * 1024}
                    hint="MP4, WebM, MOV · Up to 2GB · Uploads directly to Supabase"
                  />

                  <UploadBox
                    label="Course PDF / Study Material"
                    accept="application/pdf"
                    fileState={pdf}
                    onChange={f => setPdf(f ? { ...EMPTY_FILE, file: f } : { ...EMPTY_FILE, url: editCourse?.pdf_url || '' })}
                    icon={FileText}
                    color="bg-red-600/20"
                    maxSize={100 * 1024 * 1024}
                    hint="PDF only · Max 100MB"
                  />
                </div>

                {/* Existing files indicator */}
                {editCourse && (
                  <div className="mt-3 p-3 bg-slate-800 rounded-xl">
                    <p className="text-slate-400 text-xs font-medium mb-2">Current files (leave empty to keep):</p>
                    <div className="flex gap-3 flex-wrap">
                      {editCourse.thumbnail && <span className="text-xs text-slate-500 flex items-center gap-1"><Image className="w-3 h-3" /> Thumbnail ✓</span>}
                      {editCourse.video_url && <span className="text-xs text-slate-500 flex items-center gap-1"><Video className="w-3 h-3" /> Video ✓</span>}
                      {editCourse.pdf_url && <span className="text-xs text-slate-500 flex items-center gap-1"><FileText className="w-3 h-3" /> PDF ✓</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Save button */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => !saving && setShowModal(false)} disabled={saving}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-all disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Uploading & Saving...' : (editCourse ? 'Update Course' : 'Create Course')}
                </button>
              </div>

              {saving && (
                <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-3 text-center">
                  <p className="text-blue-400 text-sm animate-pulse">
                    ⏳ Uploading files directly to Supabase... do not close this window
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
