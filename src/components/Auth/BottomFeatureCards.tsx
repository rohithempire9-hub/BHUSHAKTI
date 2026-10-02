import React from 'react';
import { Globe, Activity, Navigation, Box, ArrowUpRight } from 'lucide-react';

interface PreviewCardData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  previewGraphic: React.ReactNode;
}

const PREVIEW_ITEMS: PreviewCardData[] = [
  {
    id: 'satellite-view',
    title: 'Satellite View',
    subtitle: 'Sentinel-2 & CartoDEM Live',
    icon: Globe,
    previewGraphic: (
      <div className="relative w-full h-12 rounded-lg overflow-hidden bg-slate-950 border border-cyan-500/30">
        {/* Realistic Satellite Topography Raster Preview */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=75')`,
            backgroundPosition: 'center 40%'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04192f] via-transparent to-transparent" />
        <div className="absolute top-1 left-1.5 px-1 py-0.2 rounded bg-cyan-950/80 border border-cyan-400/40 text-[8px] font-mono text-cyan-300">
          GIS L-Band
        </div>
      </div>
    )
  },
  {
    id: 'risk-analysis',
    title: 'Risk Analysis',
    subtitle: 'Slope & Liquefaction Index',
    icon: Activity,
    previewGraphic: (
      <div className="relative w-full h-12 rounded-lg overflow-hidden bg-[#04192f] border border-amber-500/40 p-1 flex items-center justify-center">
        {/* Heatmap Spectrum Preview Graphic */}
        <div className="w-full h-full rounded flex items-center justify-between px-1.5 bg-gradient-to-r from-emerald-500/30 via-amber-500/40 to-rose-500/50">
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-emerald-300 font-bold">Stable</span>
            <span className="text-[9px] font-mono text-white font-black">FS 1.42</span>
          </div>
          <div className="w-[1px] h-6 bg-cyan-400/40" />
          <div className="flex flex-col text-right">
            <span className="text-[8px] font-mono text-rose-300 font-bold">Critical</span>
            <span className="text-[9px] font-mono text-rose-400 font-black">94.2%</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'safe-route',
    title: 'Safe Route',
    subtitle: 'Autonomous Escape Corridors',
    icon: Navigation,
    previewGraphic: (
      <div className="relative w-full h-12 rounded-lg overflow-hidden bg-slate-950 border border-emerald-500/40">
        <svg viewBox="0 0 160 50" className="w-full h-full object-cover">
          {/* Hazard Blocked Zone */}
          <circle cx="80" cy="25" r="16" fill="rgba(244,63,94,0.25)" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3,2" />
          {/* Green Safe Route Path Curve */}
          <path d="M10 40 Q50 35 70 12 T130 18 T150 35" stroke="#10b981" strokeWidth="2.5" fill="none" />
          {/* Origin & Destination Beacons */}
          <circle cx="10" cy="40" r="3.5" fill="#38bdf8" />
          <circle cx="150" cy="35" r="3.5" fill="#10b981" />
        </svg>
        <div className="absolute top-1 right-1.5 px-1 py-0.2 rounded bg-emerald-950/80 border border-emerald-400/40 text-[8px] font-mono text-emerald-300">
          NH-13 Open
        </div>
      </div>
    )
  },
  {
    id: 'digital-twin',
    title: '3D Digital Twin',
    subtitle: 'Debris Flow Physics Engine',
    icon: Box,
    previewGraphic: (
      <div className="relative w-full h-12 rounded-lg overflow-hidden bg-[#020b18] border border-cyan-400/40 flex items-center justify-center">
        {/* Wireframe Mesh Preview */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px),
              linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '10px 10px'
          }}
        />
        <div className="relative z-10 flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/50 text-[9px] font-mono text-cyan-200">
          <Box className="w-3 h-3 text-cyan-400" />
          <span>Physics Active</span>
        </div>
      </div>
    )
  }
];

interface BottomFeatureCardsProps {
  className?: string;
}

export const BottomFeatureCards: React.FC<BottomFeatureCardsProps> = ({
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 select-none ${className}`}>
      {PREVIEW_ITEMS.map((item) => {
        const IconComponent = item.icon;

        return (
          <div
            key={item.id}
            className="group relative rounded-2xl bg-[#04192f]/85 hover:bg-[#072442]/90 border border-cyan-400/45 hover:border-cyan-300 p-2.5 backdrop-blur-xl shadow-lg shadow-cyan-950/40 hover:shadow-[0_0_24px_rgba(6,182,212,0.4)] transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            {/* Ambient top specular line */}
            <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent group-hover:via-cyan-300" />

            {/* Visual Preview Graphic */}
            <div className="mb-2 w-full h-14 rounded-lg overflow-hidden border border-cyan-500/25">
              {item.previewGraphic}
            </div>

            {/* Icon + Title Row (matching reference image) */}
            <div className="flex items-center gap-2 px-1 py-0.5">
              <IconComponent className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                {item.title}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
