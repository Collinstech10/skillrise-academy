'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Star, Users, BookOpen, Award, ArrowRight, Check, Zap, Shield, TrendingUp, Monitor, Palette, Megaphone, Bot, BarChart, Lock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import RobotMascot from '@/components/landing/RobotMascot';
import { cn, getCategoryColor } from '@/lib/utils';

const COURSES = [
  { icon: Monitor, category: 'Web Development', title: 'Full-Stack Web Development', desc: 'Master HTML, CSS, JavaScript, React, and Node.js from scratch to pro level.', price: 15000, rating: 4.9, students: 2341 },
  { icon: Palette, category: 'Graphic Design', title: 'Professional Graphic Design', desc: 'Adobe Photoshop, Illustrator & Canva for brand identity and visual content.', price: 12000, rating: 4.8, students: 1876 },
  { icon: Megaphone, category: 'Digital Marketing', title: 'Digital Marketing Mastery', desc: 'SEO, social media, email marketing, and paid ads that drive real results.', price: 10000, rating: 4.7, students: 3102 },
  { icon: Bot, category: 'AI Tools', title: 'AI Tools for Professionals', desc: 'ChatGPT, Midjourney, automation workflows — leverage AI to 10x productivity.', price: 8000, rating: 4.9, students: 4200 },
  { icon: BarChart, category: 'Business Growth', title: 'Business Growth Strategy', desc: 'Build, launch, and scale a profitable business in today\'s digital economy.', price: 18000, rating: 4.8, students: 1543 },
  { icon: Lock, category: 'Cybersecurity', title: 'Ethical Hacking & Security', desc: 'Protect systems and launch a career in high-demand cybersecurity field.', price: 20000, rating: 4.9, students: 987 },
];

const TESTIMONIALS = [
  { name: 'Adaeze Okonkwo', role: 'Frontend Developer at Flutterwave', avatar: 'AO', text: 'SkillRise Academy transformed my career. I went from knowing nothing about web development to landing my dream job in 6 months. The curriculum is world-class.', rating: 5 },
  { name: 'Emeka Nwosu', role: 'Freelance Graphic Designer', avatar: 'EN', text: 'The referral system is incredible! I\'ve earned over ₦50,000 just by sharing the platform with friends. Meanwhile the courses are top-notch.', rating: 5 },
  { name: 'Fatima Abdullahi', role: 'Digital Marketing Manager', avatar: 'FA', text: 'The Digital Marketing course gave me skills that tripled my clients\' ROI. I now run my own agency. Best investment I\'ve ever made.', rating: 5 },
  { name: 'Chidi Obi', role: 'AI Consultant', avatar: 'CO', text: 'The AI Tools course is exactly what I needed. Practical, current, and well-paced. I now charge premium rates for AI consulting work.', rating: 5 },
];

const FAQS = [
  { q: 'How do I get started on SkillRise Academy?', a: 'Simply create an account, complete your membership activation (₦2,000 one-time fee), and you instantly unlock access to our full course marketplace.' },
  { q: 'How does the referral system work?', a: 'Each registered user receives a unique referral link. Share it with friends — when they activate their membership, you earn ₦500 automatically credited to your balance.' },
  { q: 'What payment methods are supported?', a: 'We use Paystack, which supports all Nigerian debit/credit cards, bank transfers, and USSD payments. All transactions are secure and verified.' },
  { q: 'Can I access courses on mobile?', a: 'Yes! SkillRise Academy is fully responsive and mobile-optimized. Learn anywhere, anytime on any device.' },
  { q: 'What is the minimum withdrawal amount?', a: 'The minimum withdrawal is ₦10,000 and maximum is ₦300,000. Withdrawal functionality will be available soon.' },
  { q: 'Are the courses updated regularly?', a: 'Yes, all courses are regularly reviewed and updated to reflect the latest industry trends and best practices.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />

      {/* Hero */}
      <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden pt-16">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl" />
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }} />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-blue-200 mb-8">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Nigeria's fastest-growing skills platform</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Rise Above.<br />
                <span className="text-blue-300">Learn Skills</span><br />
                That Pay.
              </h1>

              <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg">
                Master in-demand digital skills, earn from referrals, and build a career that thrives in the modern economy. Join 10,000+ learners already rising.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/auth/register" className="btn-outline text-center text-lg px-8 py-4 flex items-center justify-center gap-2">
                  Start Learning Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/auth/login" className="glass text-white font-semibold px-8 py-4 rounded-xl text-center text-lg hover:bg-white/20 transition-all">
                  Sign In
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: '10K+', label: 'Active Learners' },
                  { value: '6', label: 'Expert Courses' },
                  { value: '₦500', label: 'Per Referral' },
                ].map((stat) => (
                  <div key={stat.label} className="glass rounded-xl p-4 text-center">
                    <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-blue-200 text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Robot */}
            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl scale-150" />
                <RobotMascot size={260} />

                {/* Floating cards */}
                <div className="absolute -top-4 -right-8 glass rounded-xl p-3 text-white text-sm whitespace-nowrap animate-bounce" style={{ animationDuration: '3s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs">Course Unlocked!</div>
                      <div className="text-blue-200 text-xs">Web Dev Pro</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-8 glass rounded-xl p-3 text-white text-sm whitespace-nowrap" style={{ animation: 'float 3.5s ease-in-out infinite' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs">Referral Earned!</div>
                      <div className="text-blue-200 text-xs">+₦500 added</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" fill="white" className="dark:fill-slate-900"/>
          </svg>
        </div>
      </section>

      {/* Why SkillRise */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Why SkillRise Academy</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Built different. Built for <span className="gradient-text">your growth.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to learn, earn, and grow — all in one platform.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Expert-Crafted Courses', desc: 'Courses designed by industry practitioners. No fluff — pure, actionable knowledge.', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { icon: Users, title: 'Earn While You Learn', desc: 'Refer friends and earn ₦500 per successful activation. Real money, no limits.', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: Shield, title: 'Secure Platform', desc: 'Bank-grade security with Paystack integration. Your data and money are always safe.', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              { icon: TrendingUp, title: 'Career-Focused Content', desc: 'Every course maps to real job roles and freelance opportunities in today\'s market.', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
              { icon: Zap, title: 'Instant Access', desc: 'Enroll and start learning immediately. No waiting, no delays, no friction.', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
              { icon: Award, title: 'Progress Tracking', desc: 'Track your learning journey with detailed progress reports and completion certificates.', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
            ].map((f) => (
              <div key={f.title} className="card-hover group">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110', f.color)}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-24 mesh-bg dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Course Catalogue</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Skills the market <span className="gradient-text">demands right now</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((course) => (
              <div key={course.title} className="card-hover group overflow-hidden">
                {/* Thumbnail placeholder */}
                <div className="h-44 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <course.icon className="w-16 h-16 text-white/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={cn('absolute top-3 left-3 badge', getCategoryColor(course.category))}>
                    {course.category}
                  </div>
                </div>

                <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">{course.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{course.desc}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-sm mb-1">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                      <span className="text-slate-600 dark:text-slate-400 ml-1">{course.rating}</span>
                    </div>
                    <span className="text-xs text-slate-400">{course.students.toLocaleString()} students</span>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-primary-600 text-lg">₦{course.price.toLocaleString()}</div>
                    <Link href="/auth/register" className="text-xs text-primary-500 hover:underline">Enroll →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-4">
              Access All Courses <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Referral Banner */}
      <section className="py-20 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <div className="glass rounded-3xl p-10 sm:p-16">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Earn ₦500 Per Referral</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Share your unique link. When friends activate their membership, ₦500 drops in your account. No cap, no limits — the more you share, the more you earn.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-outline text-lg px-8 py-4">Join & Start Earning</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-label mb-3">Student Stories</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Real people. <span className="gradient-text">Real results.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card border-l-4 border-primary-500">
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{t.name}</div>
                    <div className="text-sm text-slate-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 mesh-bg dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="section-label mb-3">FAQ</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Common Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card">
                <button className="w-full flex items-center justify-between text-left gap-4" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={cn('w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200', openFaq === i && 'rotate-180')} />
                </button>
                {openFaq === i && (
                  <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6">Ready to Rise?</h2>
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">Join 10,000+ learners who chose to invest in themselves. Your future self will thank you.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-outline text-lg px-10 py-4 flex items-center gap-2 justify-center">
              Get Started Today <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login" className="glass text-white font-semibold px-10 py-4 rounded-xl text-lg hover:bg-white/20 transition-all text-center">
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">SkillRise Academy</span>
            </div>
            <p className="text-slate-500 text-sm">© 2024 SkillRise Academy. All rights reserved.</p>
            <div className="flex gap-6 text-slate-500 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
