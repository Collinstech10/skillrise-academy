'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronDown, Star, Users, BookOpen, Award, ArrowRight, Check,
  Zap, Shield, TrendingUp, Monitor, Palette, Megaphone, Bot,
  BarChart, Lock, Play, Clock, Globe, CheckCircle, Gift,
  DollarSign, Flame, MessageCircle
} from 'lucide-react';
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
  { name: 'Adaeze Okonkwo', role: 'Frontend Developer at Flutterwave', avatar: 'AO', text: 'SkillRise Academy transformed my career. I went from knowing nothing about web development to landing my dream job in 6 months.', rating: 5, earned: '₦12,500' },
  { name: 'Emeka Nwosu', role: 'Freelance Graphic Designer', avatar: 'EN', text: 'The referral system is incredible! I\'ve earned over ₦50,000 just by sharing the platform. Meanwhile the courses are top-notch.', rating: 5, earned: '₦50,000' },
  { name: 'Fatima Abdullahi', role: 'Digital Marketing Manager', avatar: 'FA', text: 'The Digital Marketing course gave me skills that tripled my clients\' ROI. I now run my own agency.', rating: 5, earned: '₦28,000' },
  { name: 'Chidi Obi', role: 'AI Consultant', avatar: 'CO', text: 'The AI Tools course is exactly what I needed. Practical, current, and well-paced. I now charge premium rates.', rating: 5, earned: '₦35,500' },
];

const FAQS = [
  { q: 'How do I get started on SkillRise Academy?', a: 'Simply create an account, complete your membership activation (₦2,000 one-time fee), and you instantly unlock access to our full course marketplace.' },
  { q: 'How does the referral system work?', a: 'Each registered user receives a unique referral link. Share it with friends — when they activate their membership, you earn ₦500 automatically credited to your balance.' },
  { q: 'What payment methods are supported?', a: 'We use Paystack, which supports all Nigerian debit/credit cards, bank transfers, and USSD payments. All transactions are secure and verified.' },
  { q: 'Can I access courses on mobile?', a: 'Yes! SkillRise Academy is fully responsive and mobile-optimized. Learn anywhere, anytime on any device.' },
  { q: 'What is the minimum withdrawal amount?', a: 'The minimum withdrawal is ₦10,000 and maximum is ₦300,000. Withdrawal functionality will be available soon.' },
  { q: 'Are the courses updated regularly?', a: 'Yes, all courses are regularly reviewed and updated to reflect the latest industry trends and best practices.' },
];

// Live activity feed data
const ACTIVITIES = [
  { name: 'Chiamaka O.', action: 'just enrolled in', course: 'Web Development', time: '2 mins ago', avatar: 'CO' },
  { name: 'Biodun A.', action: 'earned', course: '₦500 referral bonus', time: '5 mins ago', avatar: 'BA' },
  { name: 'Seun M.', action: 'just enrolled in', course: 'AI Tools', time: '8 mins ago', avatar: 'SM' },
  { name: 'Ngozi K.', action: 'earned', course: '₦500 referral bonus', time: '12 mins ago', avatar: 'NK' },
  { name: 'Tunde F.', action: 'just enrolled in', course: 'Digital Marketing', time: '15 mins ago', avatar: 'TF' },
  { name: 'Amaka R.', action: 'just enrolled in', course: 'Cybersecurity', time: '18 mins ago', avatar: 'AR' },
  { name: 'Kunle B.', action: 'earned', course: '₦1,000 referral bonus', time: '22 mins ago', avatar: 'KB' },
  { name: 'Yetunde P.', action: 'just enrolled in', course: 'Graphic Design', time: '25 mins ago', avatar: 'YP' },
];

function LiveActivityFeed() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % ACTIVITIES.length);
        setVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const activity = ACTIVITIES[current];
  return (
    <div className={cn(
      'fixed bottom-6 left-6 z-40 max-w-xs transition-all duration-400',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    )}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-3 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
          {activity.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
            <span className="font-bold">{activity.name}</span>{' '}
            {activity.action}{' '}
            <span className="font-semibold text-primary-600">{activity.course}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> {activity.time}
          </p>
        </div>
        <div className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
      </div>
    </div>
  );
}

function EarningsCalculator() {
  const [referrals, setReferrals] = useState(10);
  const earnings = referrals * 500;
  const monthly = earnings;

  return (
    <div className="card border-2 border-primary-100 dark:border-primary-900 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
      <h3 className="font-display font-bold text-slate-900 dark:text-white text-xl mb-1 flex items-center gap-2">
        <DollarSign className="w-6 h-6 text-primary-600" /> Earnings Calculator
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">See how much you can earn from referrals</p>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Friends you refer</span>
          <span className="font-display font-bold text-primary-600 text-lg">{referrals}</span>
        </div>
        <input type="range" min="1" max="100" value={referrals}
          onChange={e => setReferrals(Number(e.target.value))}
          className="w-full h-2 bg-primary-200 dark:bg-primary-800 rounded-full appearance-none cursor-pointer accent-primary-600" />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 mb-1">You earn per referral</p>
          <p className="font-display text-2xl font-bold text-emerald-600">₦500</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Total earnings</p>
          <p className="font-display text-2xl font-bold text-primary-600">₦{monthly.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800 mb-4">
        <p className="text-emerald-700 dark:text-emerald-400 text-sm text-center font-medium">
          🎉 Refer {referrals} friends = <strong>₦{monthly.toLocaleString()}</strong> in your account!
        </p>
      </div>

      <Link href="/auth/register" className="btn-primary w-full text-center block">
        Start Earning Now →
      </Link>
    </div>
  );
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const elapsed = Date.now() - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar />
      <LiveActivityFeed />

      {/* Hero */}
      <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden pt-16">
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
            <div className="text-white">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-blue-200 mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span><strong className="text-white">2,847</strong> learners online right now</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Learn Skills.<br />
                <span className="text-blue-300">Earn Money.</span><br />
                Rise Fast.
              </h1>

              <p className="text-blue-100 text-lg sm:text-xl leading-relaxed mb-6 max-w-lg">
                Nigeria&apos;s fastest-growing skills platform. Learn in-demand digital skills AND earn ₦500 for every friend you refer. Join 10,000+ rising professionals.
              </p>

              {/* Value props */}
              <div className="space-y-2 mb-8">
                {[
                  '✅ One-time membership — only ₦2,000',
                  '✅ Earn ₦500 for every referral, no limit',
                  '✅ Download videos & PDFs for offline learning',
                  '✅ Certificate of completion for every course',
                ].map(item => (
                  <p key={item} className="text-blue-100 text-sm">{item}</p>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link href="/auth/register"
                  className="bg-white text-primary-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl text-center text-lg flex items-center justify-center gap-2 shadow-xl transition-all hover:-translate-y-0.5">
                  Start Free Today <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/auth/login"
                  className="glass text-white font-semibold px-8 py-4 rounded-xl text-center text-lg hover:bg-white/20 transition-all">
                  Sign In
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['AO', 'EN', 'FA', 'CO', 'TK'].map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-primary-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                  <p className="text-blue-200 text-xs mt-0.5">Loved by 10,000+ learners</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl scale-150" />
                <RobotMascot size={260} />
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

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" fill="white" className="dark:fill-slate-900" />
          </svg>
        </div>
      </section>

      {/* Stats counter */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 10000, suffix: '+', label: 'Active Learners', icon: Users, color: 'text-blue-600' },
              { value: 6, suffix: '', label: 'Expert Courses', icon: BookOpen, color: 'text-purple-600' },
              { value: 2500000, suffix: '+', label: 'Referral Paid Out', icon: DollarSign, color: 'text-emerald-600', prefix: '₦' },
              { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: Star, color: 'text-amber-600' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3', `bg-${stat.color.split('-')[1]}-50 dark:bg-${stat.color.split('-')[1]}-900/20`)}>
                  <stat.icon className={cn('w-6 h-6', stat.color)} />
                </div>
                <p className={cn('font-display text-3xl font-extrabold', stat.color)}>
                  {stat.prefix || ''}<CountUp target={stat.value} />{stat.suffix}
                </p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why SkillRise */}
      <section className="py-20 mesh-bg dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why SkillRise Academy</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Built different. Built for <span className="gradient-text">your growth.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: 'Expert-Crafted Courses', desc: 'Courses designed by industry practitioners. No fluff — pure, actionable knowledge with video + PDF materials.', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
              { icon: Gift, title: 'Earn While You Learn', desc: 'Refer friends and earn ₦500 per successful activation. No cap, no limits — real money in your account.', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
              { icon: Shield, title: 'Secure Platform', desc: 'Bank-grade security with Paystack. Your data and money are always protected.', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              { icon: Award, title: 'Completion Certificates', desc: 'Earn a verified certificate for every completed course. Add it to your CV and LinkedIn profile.', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
              { icon: Globe, title: 'Offline Access', desc: 'Download videos and PDFs to your device. Learn even without internet connection.', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
              { icon: TrendingUp, title: 'Leaderboard & Rankings', desc: 'Compete with other learners. Top referrers are featured on the leaderboard and win bonuses.', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' },
            ].map(f => (
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

      {/* Earnings Calculator */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-label mb-3">Referral System</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                How much can you <span className="gradient-text">actually earn?</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Every person you refer who activates their membership earns you ₦500 instantly. There&apos;s no cap — the more you share, the more you earn. Many of our users make back their membership fee within days.
              </p>
              <div className="space-y-4">
                {[
                  { refs: 4, label: 'Recover your ₦2,000 membership fee', color: 'text-blue-600' },
                  { refs: 20, label: 'Earn ₦10,000 — withdraw to bank', color: 'text-emerald-600' },
                  { refs: 100, label: 'Earn ₦50,000 in a month', color: 'text-purple-600' },
                ].map(item => (
                  <div key={item.refs} className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm bg-slate-100 dark:bg-slate-800', item.color)}>
                      {item.refs}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <EarningsCalculator />
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-20 mesh-bg dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Course Catalogue</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Skills the market <span className="gradient-text">demands right now</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map(course => (
              <div key={course.title} className="card-hover group overflow-hidden">
                <div className="h-44 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <course.icon className="w-16 h-16 text-white/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className={cn('absolute top-3 left-3 badge', getCategoryColor(course.category))}>
                    {course.category}
                  </div>
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                </div>
                <h3 className="font-display font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">{course.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 line-clamp-2">{course.desc}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                  <Video className="w-3.5 h-3.5" />
                  <span>Video + PDF</span>
                  <span>•</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Certificate</span>
                </div>
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
              <Flame className="w-8 h-8 text-orange-300" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Earn ₦500 Per Referral — No Limit</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Share your unique link. When friends activate their membership, ₦500 drops in your account instantly. Withdraw once you hit ₦10,000.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
              {[
                { step: '1', text: 'Register free' },
                { step: '2', text: 'Share your link' },
                { step: '3', text: 'Get ₦500' },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-lg">{s.step}</div>
                  <p className="text-blue-200 text-xs">{s.text}</p>
                </div>
              ))}
            </div>
            <Link href="/auth/register" className="bg-white text-primary-700 hover:bg-blue-50 font-bold px-8 py-4 rounded-xl inline-flex items-center gap-2 text-lg transition-all">
              Join & Start Earning <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Student Stories</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Real people. <span className="gradient-text">Real results.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card border-l-4 border-primary-500 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="badge badge-success">Earned {t.earned}</span>
                </div>
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
      <section id="faq" className="py-20 mesh-bg dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="section-label mb-3">FAQ</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Common Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card">
                <button className="w-full flex items-center justify-between text-left gap-4"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
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

      {/* Final CTA */}
      <section className="py-24 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-blue-200 mb-6">
            <Flame className="w-4 h-4 text-orange-300" />
            <span>Limited time — Join today and start earning immediately</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-6">Ready to Rise?</h2>
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto">
            For just ₦2,000 one-time, you get lifetime access to all courses, a referral system that pays you, and a community of 10,000+ learners.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register"
              className="bg-white text-primary-700 hover:bg-blue-50 font-bold px-10 py-4 rounded-xl text-lg flex items-center justify-center gap-2 shadow-xl transition-all">
              Get Started — Only ₦2,000 <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/auth/login"
              className="glass text-white font-semibold px-10 py-4 rounded-xl text-lg hover:bg-white/20 transition-all text-center">
              I have an account
            </Link>
          </div>
          <p className="text-blue-300 text-sm mt-6 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" /> Secured by Paystack · One-time payment · Lifetime access
          </p>
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

// Missing Video component import fix
function Video({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.883v6.234a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
