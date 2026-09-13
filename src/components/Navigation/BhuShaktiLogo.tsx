import React from 'react';

interface BhuShaktiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BhuShaktiLogo: React.FC<BhuShaktiLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-11 sm:h-11',
    lg: 'w-14 h-14',
  }[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 ${dimensions} ${className}`}
      title="BhuShakti AI - Geospatial Hazard Intelligence"
    >
      {/* Ambient background bloom to sink naturally into dark navy headers (#060e22) */}
      <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-md pointer-events-none -z-10 group-hover:bg-cyan-400/30 transition-colors" />

      {/* Outer bezel that sinks into the background with radial dark vignette */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-[#0e214d]/90 via-[#0a1636]/95 to-[#050c20] p-1.5 flex items-center justify-center border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(56,189,248,0.3),0_4px_12px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Subtle internal grid/radar background */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:8px_8px] opacity-15 pointer-events-none" />

        {/* Vector Geological Peak & Sensor Pulse Artwork */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_6px_rgba(6,182,212,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="bs-peak-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            <linearGradient id="bs-peak-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>

            <linearGradient id="bs-fore-left" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="bs-fore-right" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#075985" />
            </linearGradient>

            <linearGradient id="bs-pulse-line" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
              <stop offset="25%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#22d3ee" />
              <stop offset="75%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Radar Early-Warning Pulse Waves radiating from the mountain summit */}
          <path
            d="M34 26 C43 20, 57 20, 66 26"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M26 18 C40 9, 60 9, 74 18"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.35"
          />

          {/* Secondary background peak (Sikkim / Tawang range) */}
          <polygon
            points="24,76 42,42 60,76"
            fill="#1e3a8a"
            opacity="0.5"
          />
          <polygon
            points="48,76 68,36 86,76"
            fill="#172554"
            opacity="0.6"
          />

          {/* Main Himalayan Pinnacle - Left Facet */}
          <polygon
            points="50,28 22,78 50,78"
            fill="url(#bs-peak-left)"
          />

          {/* Main Himalayan Pinnacle - Right Facet */}
          <polygon
            points="50,28 50,78 78,78"
            fill="url(#bs-peak-right)"
          />

          {/* Center Ridge Highlight */}
          <line
            x1="50"
            y1="28"
            x2="50"
            y2="78"
            stroke="#e0f2fe"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Foreground Dynamic Strata Pyramid (Bhu / Earth) */}
          <polygon
            points="50,46 32,80 50,80"
            fill="url(#bs-fore-left)"
            opacity="0.9"
          />
          <polygon
            points="50,46 50,80 68,80"
            fill="url(#bs-fore-right)"
            opacity="0.9"
          />

          {/* Horizontal Seismograph / Sensor Telemetry Wave at the base */}
          <path
            d="M10 82 L34 82 L42 74 L46 88 L52 70 L56 86 L62 82 L90 82"
            stroke="url(#bs-pulse-line)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* AI Beacon Node on Summit (Glowing Sensor Pin) */}
          <circle cx="50" cy="28" r="4.5" fill="#f0fdf4" />
          <circle cx="50" cy="28" r="7" stroke="#22d3ee" strokeWidth="1.5" opacity="0.8" />
          <circle cx="50" cy="28" r="2" fill="#38bdf8" />
        </svg>
      </div>
    </div>
  );
};
