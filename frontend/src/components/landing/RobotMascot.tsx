'use client';
export default function RobotMascot({ size = 200 }: { size?: number }) {
  return (
    <div className="relative inline-block animate-float" style={{ width: size, height: size }}>
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl animate-pulse-slow" />
      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size * 1.1}
        className="relative z-10 drop-shadow-2xl"
      >
        {/* Antenna */}
        <line x1="100" y1="10" x2="100" y2="35" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="100" cy="8" r="5" fill="#3b82f6">
          <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="fill" values="#3b82f6;#60a5fa;#3b82f6" dur="2s" repeatCount="indefinite"/>
        </circle>

        {/* Head */}
        <rect x="55" y="35" width="90" height="80" rx="18" fill="#1d4ed8"/>
        <rect x="57" y="37" width="86" height="76" rx="17" fill="url(#headGrad)"/>

        {/* Eyes */}
        <rect x="68" y="55" width="28" height="22" rx="8" fill="#0f172a"/>
        <rect x="104" y="55" width="28" height="22" rx="8" fill="#0f172a"/>
        <circle cx="82" cy="66" r="8" fill="#38bdf8">
          <animate attributeName="fill" values="#38bdf8;#7dd3fc;#38bdf8" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="118" cy="66" r="8" fill="#38bdf8">
          <animate attributeName="fill" values="#38bdf8;#7dd3fc;#38bdf8" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="85" cy="63" r="3" fill="white" opacity="0.8"/>
        <circle cx="121" cy="63" r="3" fill="white" opacity="0.8"/>

        {/* Mouth */}
        <rect x="75" y="90" width="50" height="14" rx="7" fill="#0f172a"/>
        <rect x="77" y="92" width="12" height="10" rx="3" fill="#10b981">
          <animate attributeName="fill" values="#10b981;#34d399;#10b981" dur="1.5s" repeatCount="indefinite"/>
        </rect>
        <rect x="94" y="92" width="12" height="10" rx="3" fill="#10b981">
          <animate attributeName="fill" values="#10b981;#34d399;#10b981" dur="1.5s" begin="0.3s" repeatCount="indefinite"/>
        </rect>
        <rect x="111" y="92" width="12" height="10" rx="3" fill="#10b981">
          <animate attributeName="fill" values="#10b981;#34d399;#10b981" dur="1.5s" begin="0.6s" repeatCount="indefinite"/>
        </rect>

        {/* Ear pieces */}
        <rect x="40" y="55" width="16" height="30" rx="6" fill="#1e40af"/>
        <rect x="144" y="55" width="16" height="30" rx="6" fill="#1e40af"/>
        <circle cx="48" cy="70" r="5" fill="#60a5fa" opacity="0.8"/>
        <circle cx="152" cy="70" r="5" fill="#60a5fa" opacity="0.8"/>

        {/* Neck */}
        <rect x="88" y="115" width="24" height="15" rx="4" fill="#1e40af"/>

        {/* Body */}
        <rect x="45" y="130" width="110" height="70" rx="20" fill="#1d4ed8"/>
        <rect x="47" y="132" width="106" height="66" rx="19" fill="url(#bodyGrad)"/>

        {/* Chest panel */}
        <rect x="62" y="145" width="76" height="40" rx="10" fill="#0f172a" opacity="0.4"/>

        {/* Chest lights */}
        <circle cx="80" cy="160" r="7" fill="#10b981">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="160" r="7" fill="#3b82f6">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" begin="0.7s" repeatCount="indefinite"/>
        </circle>
        <circle cx="120" cy="160" r="7" fill="#f59e0b">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" begin="1.4s" repeatCount="indefinite"/>
        </circle>

        {/* Progress bar on chest */}
        <rect x="65" y="175" width="70" height="5" rx="3" fill="#0f172a" opacity="0.5"/>
        <rect x="65" y="175" width="45" height="5" rx="3" fill="#10b981">
          <animate attributeName="width" values="20;60;20" dur="4s" repeatCount="indefinite"/>
        </rect>

        {/* Arms */}
        <rect x="20" y="135" width="26" height="55" rx="12" fill="#1e40af"/>
        <rect x="154" y="135" width="26" height="55" rx="12" fill="#1e40af"/>

        {/* Hands */}
        <circle cx="33" cy="196" r="10" fill="#1d4ed8"/>
        <circle cx="167" cy="196" r="10" fill="#1d4ed8"/>

        {/* Legs */}
        <rect x="68" y="200" width="26" height="16" rx="6" fill="#1e40af"/>
        <rect x="106" y="200" width="26" height="16" rx="6" fill="#1e40af"/>

        {/* Feet */}
        <rect x="60" y="212" width="36" height="10" rx="5" fill="#1d4ed8"/>
        <rect x="104" y="212" width="36" height="10" rx="5" fill="#1d4ed8"/>

        <defs>
          <linearGradient id="headGrad" x1="55" y1="35" x2="145" y2="115" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb"/>
            <stop offset="1" stopColor="#1d4ed8"/>
          </linearGradient>
          <linearGradient id="bodyGrad" x1="45" y1="130" x2="155" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2563eb"/>
            <stop offset="1" stopColor="#1e40af"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Floating particles */}
      <div className="absolute top-4 right-0 w-2 h-2 rounded-full bg-blue-400 opacity-70 animate-bounce" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-12 left-0 w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-70 animate-bounce" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-8 right-2 w-2 h-2 rounded-full bg-amber-400 opacity-70 animate-bounce" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}
