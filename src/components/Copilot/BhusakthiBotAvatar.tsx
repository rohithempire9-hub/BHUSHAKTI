import React, { useState, useEffect } from 'react';

export type BotAvatarState = 'idle' | 'thinking' | 'speaking' | 'success' | 'error';
export type BotAvatarSize = 'small' | 'medium' | 'large' | number;

export interface BhusakthiBotAvatarProps {
  state?: BotAvatarState;
  size?: BotAvatarSize;
  onClick?: () => void;
  className?: string;
  showStatusIndicator?: boolean;
  status?: 'online' | 'processing' | 'offline';
  voiceActive?: boolean;
  tooltipText?: string;
  isBouncing?: boolean;
}

const SIZE_MAP: Record<'small' | 'medium' | 'large', { px: number; textClass: string; badgeSize: string }> = {
  small: { px: 32, textClass: 'text-[9px]', badgeSize: 'w-2 h-2' },
  medium: { px: 52, textClass: 'text-xs', badgeSize: 'w-2.5 h-2.5' },
  large: { px: 68, textClass: 'text-sm', badgeSize: 'w-3 h-3' }
};

export const BhusakthiBotAvatar: React.FC<BhusakthiBotAvatarProps> = ({
  state = 'idle',
  size = 'medium',
  onClick,
  className = '',
  showStatusIndicator = false,
  status = 'online',
  voiceActive = false,
  tooltipText = 'Ask BHUSAKTHI AI',
  isBouncing: propBouncing = false
}) => {
  const [internalBouncing, setInternalBouncing] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Compute pixel dimensions
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size]?.px || 52;
  const badgeSizeClass = typeof size === 'string' ? SIZE_MAP[size]?.badgeSize || 'w-2.5 h-2.5' : 'w-2.5 h-2.5';

  const isClickable = Boolean(onClick);
  const isSpeaking = state === 'speaking' || voiceActive;
  const isThinking = state === 'thinking';
  const isError = state === 'error';
  const isSuccess = state === 'success';

  // Animation CSS selector based on state
  const animationClass = isThinking
    ? 'animate-bot-thinking'
    : isSpeaking
    ? 'animate-bot-speaking'
    : 'animate-bot-float';

  const handleClick = (e: React.MouseEvent) => {
    if (!onClick) return;
    setInternalBouncing(true);
    setTimeout(() => setInternalBouncing(false), 350);
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      setInternalBouncing(true);
      setTimeout(() => setInternalBouncing(false), 350);
      onClick();
    }
  };

  // Status color badge
  const statusColor = status === 'online'
    ? 'bg-emerald-400 border-emerald-200'
    : status === 'processing' || isThinking
    ? 'bg-amber-400 border-amber-200'
    : 'bg-rose-400 border-rose-200';

  return (
    <div
      role={isClickable ? 'button' : 'img'}
      tabIndex={isClickable ? 0 : undefined}
      aria-label="Open BHUSAKTHI AI Copilot"
      title={tooltipText}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex items-center justify-center select-none group ${
        isClickable ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400' : ''
      } ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize
      }}
    >
      {/* Voice sound waves on left and right: )) 🤖 (( */}
      {isSpeaking && (
        <>
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 pointer-events-none animate-bot-wave-left flex flex-col gap-1 items-end">
            <span className="w-1.5 h-3 border-l-2 border-sky-400 rounded-l-full" />
            <span className="w-2.5 h-5 border-l-2 border-cyan-400 rounded-l-full" />
            <span className="w-1.5 h-3 border-l-2 border-sky-400 rounded-l-full" />
          </div>
          <div className="absolute -right-2 top-1/2 -translate-y-1/2 pointer-events-none animate-bot-wave-right flex flex-col gap-1 items-start">
            <span className="w-1.5 h-3 border-r-2 border-sky-400 rounded-r-full" />
            <span className="w-2.5 h-5 border-r-2 border-cyan-400 rounded-r-full" />
            <span className="w-1.5 h-3 border-r-2 border-sky-400 rounded-r-full" />
          </div>
        </>
      )}

      {/* Outer ambient glow halo */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
          isThinking
            ? 'opacity-100 bg-sky-400/20 blur-md animate-pulse'
            : isSpeaking
            ? 'opacity-90 bg-cyan-400/20 blur-md'
            : isError
            ? 'opacity-80 bg-rose-400/20 blur-sm'
            : 'opacity-0 group-hover:opacity-100 bg-sky-400/15 blur-sm'
        }`}
      />

      {/* Robot Body Container with Floating + Click Bounce Animations */}
      <div
        className={`w-full h-full flex items-center justify-center transition-transform duration-200 transform-gpu ${
          internalBouncing || propBouncing ? 'animate-bot-bounce' : animationClass
        } ${isClickable ? 'group-hover:scale-105' : ''}`}
      >
        {/* Attempt loading reference image if available; seamlessly fallback to CGI SVG */}
        {!imgError && (
          <img
            src="/mnt/data/a_clean_high_quality_modern_3d_cgi_style_illustr.png"
            alt="BHUSAKTHI Copilot Robot"
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-contain filter drop-shadow-md rounded-2xl ${
              imgLoaded ? 'block' : 'hidden'
            }`}
          />
        )}

        {/* High-Quality 3D CGI Vector Robot (Pixar/Apple-Style Light Blue AI Assistant) */}
        {(imgError || !imgLoaded) && (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full drop-shadow-md overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Head Shell Light-Blue 3D Gradient */}
              <linearGradient id="headCgiGrad" x1="20" y1="15" x2="80" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="25%" stopColor="#bae6fd" />
                <stop offset="70%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>

              {/* Visor Deep Glossy Gradient */}
              <linearGradient id="visorCgiGrad" x1="50" y1="36" x2="50" y2="68" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0b1329" />
                <stop offset="60%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>

              {/* Eye Glowing Cyan Gradient */}
              <linearGradient id="eyeCyanGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              {/* Antenna Glowing Orb Radial Gradient */}
              <radialGradient id="antennaGlowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </radialGradient>

              {/* Top Glass Specular Highlight */}
              <linearGradient id="specularGrad" x1="50" y1="18" x2="50" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>

              {/* Eye Glow Filter */}
              <filter id="eyeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. TOP ANTENNA STEM & GLOWING TIP */}
            <g className={isThinking ? 'animate-bot-antenna' : ''}>
              {/* Antenna base */}
              <rect x="47" y="12" width="6" height="6" rx="2" fill="#0284c7" />
              {/* Curved antenna stem */}
              <path
                d="M50 14 C50 8, 54 4, 57 2"
                stroke="#38bdf8"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Glowing antenna orb */}
              <circle
                cx="58"
                cy="2"
                r="4.5"
                fill="url(#antennaGlowGrad)"
                className={isThinking ? 'animate-ping' : ''}
              />
              <circle
                cx="58"
                cy="2"
                r="3.5"
                fill="#38bdf8"
                filter="url(#eyeGlow)"
              />
            </g>

            {/* 2. SIDE AUDIO NODES (EARS) */}
            {/* Left ear */}
            <rect x="13" y="44" width="7" height="16" rx="3.5" fill="#0369a1" />
            <rect x="15" y="47" width="3" height="10" rx="1.5" fill="#38bdf8" />
            {/* Right ear */}
            <rect x="80" y="44" width="7" height="16" rx="3.5" fill="#0369a1" />
            <rect x="82" y="47" width="3" height="10" rx="1.5" fill="#38bdf8" />

            {/* 3. MAIN ROBOT HEAD SHELL (3D CGI Soft Rounded Capsule) */}
            <rect
              x="18"
              y="18"
              width="64"
              height="60"
              rx="26"
              fill="url(#headCgiGrad)"
              stroke="#bae6fd"
              strokeWidth="1.5"
            />

            {/* 4. TOP SPECULAR HIGHLIGHT (Glossy Plastic / Ceramic Look) */}
            <path
              d="M32 21 C42 19, 58 19, 68 21 C72 23, 76 27, 76 31 C66 26, 34 26, 24 31 C24 27, 28 23, 32 21 Z"
              fill="url(#specularGrad)"
            />

            {/* 5. VISOR SCREEN DISPLAY (Curved dark glossy display screen) */}
            <rect
              x="26"
              y="34"
              width="48"
              height="30"
              rx="12"
              fill="url(#visorCgiGrad)"
              stroke="#38bdf8"
              strokeWidth="0.8"
            />

            {/* Visor Glare Reflection */}
            <path
              d="M29 37 C40 35, 60 35, 71 37 C67 42, 33 42, 29 37 Z"
              fill="#ffffff"
              fillOpacity="0.15"
            />

            {/* 6. EXPRESSIVE GLOWING CYAN EYES */}
            <g className={isThinking ? '' : 'animate-bot-blink'}>
              {/* Left Eye */}
              <ellipse
                cx="39"
                cy="48"
                rx={isThinking ? 4 : isSpeaking ? 5.5 : 5}
                ry={isSpeaking ? 3.5 : 6}
                fill="url(#eyeCyanGrad)"
                filter="url(#eyeGlow)"
              />
              {/* Left Eye Specular Reflection */}
              <circle cx="41" cy="46" r="1.5" fill="#ffffff" fillOpacity="0.8" />

              {/* Right Eye */}
              <ellipse
                cx="61"
                cy="48"
                rx={isThinking ? 4 : isSpeaking ? 5.5 : 5}
                ry={isSpeaking ? 3.5 : 6}
                fill="url(#eyeCyanGrad)"
                filter="url(#eyeGlow)"
              />
              {/* Right Eye Specular Reflection */}
              <circle cx="63" cy="46" r="1.5" fill="#ffffff" fillOpacity="0.8" />
            </g>

            {/* 7. FRIENDLY MOUTH / STATUS LIGHT */}
            {isSpeaking ? (
              /* Animated Speaking Mouth */
              <path
                d="M45 56 Q50 61 55 56 Q50 58 45 56 Z"
                fill="#38bdf8"
                filter="url(#eyeGlow)"
              />
            ) : isError ? (
              /* Sympathetic / Gentle Inquiring Line */
              <path
                d="M46 58 Q50 56 54 58"
                stroke="#f87171"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              /* Warm Friendly Smile */
              <path
                d="M45 56 Q50 61 55 56"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}

            {/* 8. CHEST COLLAR & MINIATURE BADGE */}
            <path
              d="M34 78 Q50 82 66 78 L69 88 Q50 92 31 88 Z"
              fill="#0369a1"
            />
            {/* Core power node */}
            <circle cx="50" cy="85" r="2.5" fill="#38bdf8" filter="url(#eyeGlow)" />
          </svg>
        )}
      </div>

      {/* Tiny Online / Thinking / Offline Status Indicator */}
      {showStatusIndicator && (
        <span
          className={`absolute bottom-0 right-0 ${badgeSizeClass} rounded-full border-2 shadow-xs transition-colors duration-200 ${statusColor} ${
            status === 'processing' || isThinking ? 'animate-ping' : ''
          }`}
          title={`Status: ${status.toUpperCase()}`}
        />
      )}
    </div>
  );
};
