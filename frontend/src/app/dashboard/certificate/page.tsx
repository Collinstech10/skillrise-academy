'use client';
import { useEffect, useState, useRef } from 'react';
import { Award, Download, BookOpen, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Purchase } from '@/types';
import { formatDate } from '@/lib/utils';

function CertificateCard({ purchase, user }: { purchase: Purchase; user: { fullname: string } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const course = purchase.course;
  if (!course) return null;

  const downloadCertificate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d')!;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 1200, 850);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(0.5, '#1d4ed8');
    gradient.addColorStop(1, '#0ea5e9');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 850);

    // White inner box
    ctx.fillStyle = 'rgba(255,255,255,0.97)';
    ctx.roundRect(40, 40, 1120, 770, 20);
    ctx.fill();

    // Blue accent top bar
    ctx.fillStyle = '#1d4ed8';
    ctx.roundRect(40, 40, 1120, 12, [20, 20, 0, 0]);
    ctx.fill();

    // Gold decorative border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(70, 70, 1060, 710);
    ctx.setLineDash([]);

    // Logo text
    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎓 SKILLRISE ACADEMY', 600, 130);

    // Certificate title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 52px Georgia';
    ctx.fillText('Certificate of Completion', 600, 220);

    // Divider
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(400, 240, 400, 3);

    // This is to certify
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Arial';
    ctx.fillText('This is to certify that', 600, 310);

    // Student name
    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 64px Georgia';
    ctx.fillText(user.fullname, 600, 400);

    // Underline name
    const nameWidth = ctx.measureText(user.fullname).width;
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(600 - nameWidth / 2, 415, nameWidth, 2);

    // Has successfully completed
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Arial';
    ctx.fillText('has successfully completed the course', 600, 470);

    // Course name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px Georgia';
    ctx.fillText(course.title, 600, 540);

    // Date and category
    ctx.fillStyle = '#64748b';
    ctx.font = '20px Arial';
    ctx.fillText(`Completed on: ${formatDate(purchase.created_at)}  ·  Category: ${course.category}`, 600, 600);

    // Signatures
    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold italic 26px Georgia';
    ctx.textAlign = 'left';
    ctx.fillText('SkillRise Academy', 160, 700);
    ctx.textAlign = 'right';
    ctx.fillText(course.instructor || 'Course Instructor', 1040, 700);

    // Signature lines
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(120, 715); ctx.lineTo(380, 715); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(820, 715); ctx.lineTo(1080, 715); ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Director, SkillRise Academy', 160, 740);
    ctx.textAlign = 'right';
    ctx.fillText('Course Instructor', 1040, 740);

    // Certificate ID
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Certificate ID: SKR-${purchase.user_id.substring(0, 8).toUpperCase()}-${course.id.substring(0, 8).toUpperCase()}`, 600, 780);

    // Download
    const link = document.createElement('a');
    link.download = `SkillRise-Certificate-${course.title.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Certificate downloaded!');
  };

  return (
    <div className="card border-2 border-amber-100 dark:border-amber-900/30 hover:border-amber-300 transition-all">
      {/* Preview */}
      <div className="h-48 bg-gradient-to-br from-primary-700 via-primary-600 to-sky-500 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-3 border-2 border-amber-400/50 rounded-lg border-dashed" />
        <div className="text-center text-white relative z-10">
          <Award className="w-12 h-12 text-amber-300 mx-auto mb-2" />
          <p className="font-display font-bold text-lg">Certificate of Completion</p>
          <p className="text-blue-200 text-sm mt-1">SkillRise Academy</p>
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{course.category}</p>
          <div className="flex items-center gap-2 mt-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">Completed {formatDate(purchase.created_at)}</span>
          </div>
        </div>
        <button onClick={downloadCertificate}
          className="btn-primary py-2 px-4 text-sm flex items-center gap-2 shrink-0">
          <Download className="w-4 h-4" /> Download
        </button>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    courseApi.getMyCourses()
      .then(res => setPurchases(res.data.data))
      .catch(() => toast.error('Failed to load certificates'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-7 h-7 text-amber-500" /> My Certificates
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Download your certificates to share on LinkedIn and your CV</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="h-64 card animate-pulse bg-slate-100 dark:bg-slate-800" />)}
        </div>
      ) : purchases.length === 0 ? (
        <div className="card text-center py-20">
          <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">No certificates yet</h3>
          <p className="text-slate-500 mb-6">Purchase and complete a course to earn your certificate</p>
          <a href="/dashboard/courses" className="btn-primary inline-flex">Browse Courses</a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {purchases.map(purchase => (
            <CertificateCard key={purchase.id} purchase={purchase} user={{ fullname: user?.fullname || '' }} />
          ))}
        </div>
      )}

      <div className="card bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
          <Award className="w-5 h-5" /> How to use your certificate
        </h3>
        <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-500">
          <li>• Add it to your LinkedIn profile under "Licenses & Certifications"</li>
          <li>• Include it in your CV/resume as a professional qualification</li>
          <li>• Share it on social media to showcase your skills</li>
          <li>• Use it when applying for freelance jobs and contracts</li>
        </ul>
      </div>
    </div>
  );
}
