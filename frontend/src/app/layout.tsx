import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'SkillRise Academy – Level Up Your Skills',
  description: 'Join thousands of learners mastering in-demand skills with SkillRise Academy. Professional courses in Web Dev, Design, Marketing, AI, and more.',
  keywords: 'online learning, web development, digital skills, Nigeria, courses',
  openGraph: {
    title: 'SkillRise Academy',
    description: 'Learn in-demand skills. Grow your career.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #334155',
            },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="beforeInteractive"
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              const theme = localStorage.getItem('skillrise-theme') || 'light';
              if (theme === 'dark') document.documentElement.classList.add('dark');
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
