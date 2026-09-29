import React from 'react';
import {
  MapPin,
  Maximize2,
  Minimize2,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  FileText,
  Activity,
  ShieldAlert,
  Compass,
  Eye,
  Camera
} from 'lucide-react';
import { BHUSAKTHI_LOCATIONS, BhusakthiLocation } from '../../data/bhusakthiLocations';

interface DigitalTwinHeaderProps {
  selectedLocationId: string;
  onLocationChange: (id: string) => void;
  isSimActive: boolean;
  onToggleSimulation: () => void;
  isJudgeDemoActive: boolean;
  onToggleJudgeDemo: () => void;
  onTriggerAiFocus: () => void;
  onToggleLegend: () => void;
  isLegendOpen: boolean;
  onOpenEmergencyBrief: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  currentRiskStatus?: string;
  cameraMode: string;
  onSelectCameraMode: (mode: string) => void;
}

export const DigitalTwinHeader: React.FC<DigitalTwinHeaderProps> = ({
  selectedLocationId,
  onLocationChange,
  isSimActive,
  onToggleSimulation,
  isJudgeDemoActive,
  onToggleJudgeDemo,
  onTriggerAiFocus,
  onToggleLegend,
  isLegendOpen,
  onOpenEmergencyBrief,
  isFullscreen,
  onToggleFullscreen,
  currentRiskStatus = 'HIGH',
  cameraMode,
  onSelectCameraMode
}) => {
  const selectedLocation: BhusakthiLocation =
    BHUSAKTHI_LOCATIONS[selectedLocationId] || BHUSAKTHI_LOCATIONS['agartala'];

  return (
    <div className="absolute top-3 left-3 right-3 z-30 flex flex-col gap-2 pointer-events-none">
      {/* Top Main Command Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Brand & Location Identification */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-lg text-slate-800">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-slate-900 flex items-center gap-1.5">
                BHUSAKTHI AI
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono font-bold">
                3D DIGITAL TWIN
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> SYSTEM ONLINE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
              <span>Location: <strong className="text-slate-800">{selectedLocation.name}</strong></span>
              <span>•</span>
              <span>State: <strong className="text-slate-800">{selectedLocation.state}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                Risk:
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                  {currentRiskStatus}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Source Fidelity Badges */}
        <div className="hidden lg:flex items-center gap-1.5 pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200/90 shadow-sm text-[10px] font-bold font-mono">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> REAL SATELLITE
          </span>
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> REAL DEM
          </span>
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> REAL OSM 3D
          </span>
        </div>

        {/* Location Dropdown & Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Location Selector */}
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-200/90 shadow-lg flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <select
              aria-label="Select monitoring location"
              value={selectedLocationId}
              onChange={(e) => onLocationChange(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-800 outline-none cursor-pointer pr-1"
            >
              {Object.entries(BHUSAKTHI_LOCATIONS).map(([id, loc]) => (
                <option key={id} value={id} className="text-slate-800 bg-white">
                  {loc.name} ({loc.state})
                </option>
              ))}
            </select>
          </div>

          {/* DISASTER SIMULATION BUTTON */}
          <button
            onClick={onToggleSimulation}
            className={`px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black tracking-wide ${
              isSimActive
                ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-white/95 text-amber-700 border-amber-300 hover:bg-amber-50'
            }`}
            title="Toggle 3D Disaster Impact Simulator"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimActive ? 'fill-current animate-pulse' : 'text-amber-500'}`} />
            <span>{isSimActive ? 'SIMULATION ACTIVE' : '⚡ DISASTER SIMULATION'}</span>
          </button>

          {/* JUDGE DEMO MODE BUTTON */}
          <button
            onClick={onToggleJudgeDemo}
            className={`px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black ${
              isJudgeDemoActive
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200 hover:from-indigo-100 hover:to-purple-100'
            }`}
            title="Automated 60-90s Demonstration for Hackathon Judges"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isJudgeDemoActive ? 'STOP DEMO' : '⚡ JUDGE DEMO'}</span>
          </button>

          {/* AI Focus Tour */}
          <button
            onClick={onTriggerAiFocus}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg text-xs font-bold transition-colors cursor-pointer"
            title="Automatically tour hazard, impact, shelter, and route"
          >
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Focus</span>
          </button>

          {/* Map Legend Toggle */}
          <button
            onClick={onToggleLegend}
            className={`p-2 rounded-2xl backdrop-blur-md border shadow-lg transition-all cursor-pointer ${
              isLegendOpen
                ? 'bg-blue-600 text-white border-blue-700'
                : 'bg-white/95 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
            title="Toggle GIS Map Legend"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Emergency Command Brief */}
          <button
            onClick={onOpenEmergencyBrief}
            className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg transition-colors cursor-pointer"
            title="Generate Printable Emergency Brief"
          >
            <FileText className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-2 rounded-2xl bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 border border-slate-200 shadow-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Secondary Sub-Bar: Camera Modes & Presets */}
      <div className="flex items-center gap-1.5 pointer-events-auto self-start bg-white/90 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-200/80 shadow-sm text-[11px] font-bold">
        <Camera className="w-3 h-3 text-slate-400 ml-1" />
        <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Camera:</span>
        {(['ORBIT', 'TOP', 'TERRAIN', 'INCIDENT', 'IMPACT', 'EVACUATION'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => onSelectCameraMode(mode)}
            className={`px-2 py-0.5 rounded-lg text-[10px] transition-all cursor-pointer ${
              cameraMode === mode
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
};
