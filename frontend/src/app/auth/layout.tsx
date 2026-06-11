import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen mesh-bg dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">SkillRise</span>
            <span className="font-display font-bold text-lg text-primary-600"> Academy</span>
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <div className="p-4 text-center text-slate-400 text-sm">
        © 2024 SkillRise Academy
      </div>
    </div>
  );
}
