import React from 'react';
import { Layers, X } from 'lucide-react';

interface MapLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MapLegend: React.FC<MapLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-20 left-3 z-30 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xl w-72 text-xs text-slate-800 pointer-events-auto space-y-2.5 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          <strong className="text-slate-900 text-xs font-black tracking-wider uppercase">
            3D GIS MAP LEGEND
          </strong>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2 text-[11px]">
        {/* Layer 1: Base GIS */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Geographic Layers</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-emerald-600 shrink-0" />
            <span>Real Copernicus DEM 3D Terrain</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-slate-600 shrink-0" />
            <span>Esri High-Res Satellite Imagery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-amber-500 shrink-0" />
            <span>Cesium OpenStreetMap 3D Buildings</span>
          </div>
        </div>

        {/* Layer 2: Simulated Hazards */}
        <div className="space-y-1 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Simulated Hazards</span>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-rose-500/80 border border-rose-600 shrink-0" />
            <span>Unstable Slope / Failure Polygon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-orange-500 rounded shrink-0" />
            <span>Colluvial Debris Runout Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-blue-500/70 shrink-0" />
            <span>Flood Inundation Water Extent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-rose-600 border-dashed rounded shrink-0" />
            <span>Compromised / Blocked Road Segment</span>
          </div>
        </div>

        {/* Layer 3: Evacuation & Havens */}
        <div className="space-y-1 pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Evacuation Lifelines</span>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-blue-600 rounded shrink-0" />
            <span>Primary Recommended Safe Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-1.5 bg-emerald-500 rounded shrink-0" />
            <span>Alternative Secondary Escape Route</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shrink-0" />
            <span>Recommended Safe Haven Sanctuary</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <span>Exposed / At-Risk Structure</span>
          </div>
        </div>

        {/* Fidelity Badges Guide */}
        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="px-1 rounded bg-emerald-100 text-emerald-800 font-bold font-mono text-[9px]">REAL DATA</span>
            <span>Sensor telemetry & official DEM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1 rounded bg-amber-100 text-amber-800 font-bold font-mono text-[9px]">SIMULATION</span>
            <span>Calculated scenario physics</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="px-1 rounded bg-blue-100 text-blue-800 font-bold font-mono text-[9px]">ESTIMATE</span>
            <span>Synthesized proximity exposure</span>
          </div>
        </div>
      </div>
    </div>
  );
};
