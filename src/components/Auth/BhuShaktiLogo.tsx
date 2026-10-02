import React from 'react';

interface BhuShaktiLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const BhuShaktiLogo: React.FC<BhuShaktiLogoProps> = ({
  className = '',
  size = 48,
  glow = true
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer ambient specular glow */}
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-70 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,217,255,0.6) 0%, rgba(20,123,255,0.2) 60%, transparent 100%)'
          }}
        />
      )}

      {/* Interlocking Ribbon Mountain Peak Symbol */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_12px_rgba(0,217,255,0.7)]"
      >
        <defs>
          {/* Cyan to Electric Blue ribbon gradient */}
          <linearGradient id="bhuRibbonLeft" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#006DFF" />
            <stop offset="45%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          <linearGradient id="bhuRibbonRight" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0052D4" />
            <stop offset="50%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#99EEFF" />
          </linearGradient>

          <linearGradient id="bhuLoopBottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="100%" stopColor="#087CFF" />
          </linearGradient>

          {/* Subtle 3D inner shadow filter */}
          <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00D9FF" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Outer peak loop - Left side */}
        <path
          d="M20 72 C12 60 16 42 28 28 L46 12 C48.5 9 51.5 9 54 12 L72 28 C84 42 88 60 80 72 C74 82 62 86 50 86 C38 86 26 82 20 72 Z"
          stroke="url(#bhuRibbonLeft)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-300"
        />

        {/* Inner intersecting ribbons forming geometric mountain & infinity crest */}
        <path
          d="M32 68 C24 56 30 38 48 20 C52 24 64 36 68 46 C72 56 68 68 56 70 C46 72 38 72 32 68 Z"
          fill="url(#bhuLoopBottom)"
          opacity="0.25"
        />

        {/* Front overlapping ribbon strand */}
        <path
          d="M26 62 C34 48 48 24 50 20 L74 62 C78 70 70 78 60 78 C50 78 44 70 50 60 C56 50 62 44 50 24"
          stroke="url(#bhuRibbonRight)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Apex brilliant highlight point */}
        <circle cx="50" cy="18" r="3.5" fill="#FFFFFF" filter="url(#logoGlow)" />
        <circle cx="28" cy="66" r="2.5" fill="#00D9FF" />
        <circle cx="72" cy="66" r="2.5" fill="#00D9FF" />
      </svg>
    </div>
  );
};
