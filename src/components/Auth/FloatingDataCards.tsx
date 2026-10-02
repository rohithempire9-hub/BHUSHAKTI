import React from 'react';
import { CloudRain, Mountain, Droplets, ArrowUp } from 'lucide-react';

interface FloatingDataCardsProps {
  className?: string;
}

export const FloatingDataCards: React.FC<FloatingDataCardsProps> = ({
  className = ''
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 select-none pointer-events-none ${className}`}>
      {/* CARD 1: Rainfall (128 mm ↑) */}
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#04192f]/85 border border-cyan-400/50 backdrop-blur-xl shadow-lg shadow-cyan-950/60 hover:border-cyan-300 transition-all transform hover:-translate-y-1">
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
          <CloudRain className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-200/80 font-bold">
            Rainfall
          </span>
          <div className="flex items-center gap-1">
            <span className="text-base sm:text-lg font-black text-white font-mono leading-none">
              128 mm
            </span>
            <ArrowUp className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* CARD 2: Slope (32°) */}
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#04192f]/85 border border-cyan-400/50 backdrop-blur-xl shadow-lg shadow-cyan-950/60 hover:border-cyan-300 transition-all transform hover:-translate-y-1">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
          <Mountain className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-amber-200/80 font-bold">
            Slope
          </span>
          <div className="flex items-center gap-1">
            <span className="text-base sm:text-lg font-black text-white font-mono leading-none">
              32°
            </span>
          </div>
        </div>
      </div>

      {/* CARD 3: Soil Moisture (78%) */}
      <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#04192f]/85 border border-cyan-400/50 backdrop-blur-xl shadow-lg shadow-cyan-950/60 hover:border-cyan-300 transition-all transform hover:-translate-y-1">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
          <Droplets className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-mono tracking-wider text-blue-200/80 font-bold">
            Soil Moisture
          </span>
          <div className="flex items-center gap-1">
            <span className="text-base sm:text-lg font-black text-white font-mono leading-none">
              78%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
