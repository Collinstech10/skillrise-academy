'use client';
import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BookOpen, X, Upload, FileText, Video, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { Course } from '@/types';
import { formatCurrency, formatDate, getCategoryColor, cn } from '@/lib/utils';

const CATEGORIES = ['Web Development', 'Graphic Design', 'Digital Marketing', 'AI Tools', 'Business Growth', 'Cybersecurity'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

interface CourseFormData {
  title: string;
  description: string;
  price: string;
  category: string;
  level: string;
  duration: string;
}

const EMPTY_FORM: CourseFormData = {
  title: '', description: '', price: '',
  category: CATEGORIES[0], level: LEVELS[0], duration: '',
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<CourseFormData>(EMPTY_FORM);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getCourses()
      .then(res => setCourses(res.data.data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditCourse(null);
    setForm(EMPTY_FORM);
    setThumbnail(null);
    setVideoFile(null);
    setPdfFile(null);
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({
      title: course.title, description: course.description,
      price: String(course.price), category: course.category,
      level: course.level || LEVELS[0], duration: course.duration || '',
    });
    setThumbnail(null);
    setVideoFile(null);
    setPdfFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.price) {
      toast.error('Title, description, and price are required');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      if (videoFile) fd.append('video', videoFile);
      if (pdfFile) fd.append('pdf', pdfFile);

      if (editCourse) {
        const res = await adminApi.updateCourse(editCourse.id, fd);
        setCourses(prev => prev.map(c => c.id === editCourse.id ? res.data.data : c));
        toast.success('Course updated!');
      } else {
        const res = await adminApi.createCourse(fd);
        setCourses(prev => [res.data.data, ...prev]);
        toast.success('Course created!');
      }
      setShowModal(false);
    } catch {
      toast.error('Failed to save course');
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
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const inputCls = 'w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-500';

  const FileUploadBox = ({
    label, accept, file, icon: Icon, color, maxMB, onSelect,
    existingUrl, fileType,
  }: {
    label: string; accept: string; file: File | null; icon: React.ElementType;
    color: string; maxMB: number; onSelect: (f: File | null) => void;
    existingUrl?: string; fileType: string;
  }) => (
    <div>
      <label className="text-slate-400 text-xs font-medium block mb-1.5">{label}</label>
      <label className={cn(
        'flex items-center gap-3 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all',
        file ? 'border-emerald-500 bg-emerald-900/10' : 'border-slate-600 bg-slate-800 hover:border-primary-500'
      )}>
        {file ? (
          <>
            <div className="w-9 h-9 bg-emerald-600/20 rounded-lg flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-emerald-400 text-sm font-medium truncate">{file.name}</p>
              <p className="text-slate-500 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
            <button type="button" onClick={e => { e.preventDefault(); onSelect(null); }}
              className="p-1 text-slate-400 hover:text-red-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </>
        ) : existingUrl ? (
          <>
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', color)}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 text-sm font-medium">Current {fileType} uploaded</p>
              <p className="text-slate-500 text-xs">Click to replace</p>
            </div>
          </>
        ) : (
          <>
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', color)}>
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">Upload {label}</p>
              <p className="text-slate-500 text-xs">Max {maxMB}MB · {accept.replace(/\./g, '').toUpperCase()}</p>
            </div>
          </>
        )}
        <input type="file" accept={accept} className="hidden" onChange={e => {
          const f = e.target.files?.[0];
          if (!f) return;
          if (f.size > maxMB * 1024 * 1024) { toast.error(`Max ${maxMB}MB`); return; }
          onSelect(f);
        }} />
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Course Management</h1>
          <p className="text-slate-400 text-sm mt-1">{courses.length} courses in marketplace</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

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
            <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all">
              <div className="h-36 bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center relative">
                {course.thumbnail
                  ? <img src={course.thumbnail} alt={course.title} className="absolute inset-0 w-full h-full object-cover" />
                  : <BookOpen className="w-12 h-12 text-white/20" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className={cn('absolute top-3 left-3 badge', getCategoryColor(course.category))}>{course.category}</span>
                {/* File indicators */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {course.video_url && (
                    <span className="bg-blue-600/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Video className="w-2.5 h-2.5" /> Video
                    </span>
                  )}
                  {course.pdf_url && (
                    <span className="bg-red-600/80 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                      <FileText className="w-2.5 h-2.5" /> PDF
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-slate-500 text-xs mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-400 font-bold">{formatCurrency(course.price)}</p>
                    <p className="text-slate-600 text-xs">{formatDate(course.created_at)}</p>
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="font-display font-bold text-white text-lg">
                {editCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Text fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Course Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                    className={inputCls} placeholder="e.g. Full-Stack Web Development" />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-400 text-xs font-medium block mb-1.5">Description *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className={inputCls + ' resize-none'} rows={3} placeholder="Course description..." />
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
              </div>

              {/* File uploads */}
              <div className="border-t border-slate-700 pt-4 space-y-3">
                <p className="text-slate-300 text-sm font-semibold">Course Files</p>

                <FileUploadBox
                  label="Course Thumbnail (Image)"
                  accept="image/*"
                  file={thumbnail}
                  icon={Upload}
                  color="bg-blue-600/20 text-blue-400"
                  maxMB={2}
                  onSelect={setThumbnail}
                  existingUrl={editCourse?.thumbnail}
                  fileType="thumbnail"
                />

                <FileUploadBox
                  label="Course Video"
                  accept="video/mp4,video/webm,video/ogg,video/mpeg"
                  file={videoFile}
                  icon={Video}
                  color="bg-purple-600/20 text-purple-400"
                  maxMB={500}
                  onSelect={setVideoFile}
                  existingUrl={editCourse?.video_url}
                  fileType="video"
                />

                <FileUploadBox
                  label="Course PDF / Study Material"
                  accept=".pdf,application/pdf"
                  file={pdfFile}
                  icon={FileText}
                  color="bg-red-600/20 text-red-400"
                  maxMB={50}
                  onSelect={setPdfFile}
                  existingUrl={editCourse?.pdf_url}
                  fileType="PDF"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2">
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Uploading...' : (editCourse ? 'Update Course' : 'Create Course')}
                </button>
              </div>

              {saving && (
                <div className="bg-slate-800 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-sm animate-pulse">⏳ Uploading files to storage... please wait</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
