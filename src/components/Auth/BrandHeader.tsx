import React from 'react';
import { BhuShaktiLogo } from './BhuShaktiLogo';

interface BrandHeaderProps {
  subtitleLang?: string;
  taglineLang?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  subtitleLang = 'Disaster Intelligence Platform',
  taglineLang = 'Real-time insights. Safer communities.\nA resilient tomorrow.'
}) => {
  return (
    <div className="flex flex-col space-y-3 select-none">
      {/* Top row with Logo and Brand name */}
      <div className="flex items-center gap-3.5 sm:gap-4">
        {/* Geometric ribbon BHUSAKTHI logo from reference */}
        <BhuShaktiLogo size={58} className="transform hover:scale-105 transition-transform" />

        {/* Brand Name Typography */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-none font-sans drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              BHUSAKTHI <span className="text-[#00D9FF] font-mono">AI</span>
            </h1>
          </div>
          <span className="text-sm sm:text-base lg:text-[19px] font-medium text-slate-200 tracking-wide mt-1.5 drop-shadow">
            {subtitleLang}
          </span>
        </div>
      </div>

      {/* Italic mission statement (2 lines, exactly matching reference image) */}
      <div className="text-xs sm:text-sm lg:text-[15px] italic font-light text-cyan-200/90 tracking-wide pl-1 max-w-md drop-shadow leading-relaxed">
        <p>Real-time insights. Safer communities.</p>
        <p>A resilient tomorrow.</p>
      </div>
    </div>
  );
};
