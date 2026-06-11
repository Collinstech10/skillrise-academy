'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Moon, Sun, GraduationCap } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    setIsDark(document.documentElement.classList.contains('dark'));
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('skillrise-theme', newDark ? 'dark' : 'light');
  };

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-sm border-b border-slate-100 dark:border-slate-800' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white">SkillRise</span>
              <span className="font-display font-bold text-lg text-primary-600"> Academy</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="nav-link">Courses</a>
            <a href="#testimonials" className="nav-link">Reviews</a>
            <a href="#faq" className="nav-link">FAQ</a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary py-2 px-5 text-sm">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-secondary py-2 px-5 text-sm">Login</Link>
                <Link href="/auth/register" className="btn-primary py-2 px-5 text-sm">Sign Up Free</Link>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={toggleDark} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {isOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 py-4 space-y-1">
            <a href="#courses" className="block px-4 py-2 nav-link" onClick={() => setIsOpen(false)}>Courses</a>
            <a href="#testimonials" className="block px-4 py-2 nav-link" onClick={() => setIsOpen(false)}>Reviews</a>
            <a href="#faq" className="block px-4 py-2 nav-link" onClick={() => setIsOpen(false)}>FAQ</a>
            <div className="flex gap-3 px-4 pt-3">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm w-full text-center">Dashboard</Link>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-secondary py-2 px-4 text-sm flex-1 text-center">Login</Link>
                  <Link href="/auth/register" className="btn-primary py-2 px-4 text-sm flex-1 text-center">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
