import React from 'react';
import {
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  X,
  Droplets,
  CloudRain,
  Mountain,
  Compass,
  Layers,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Clock,
  Radio,
  Sliders,
  Crosshair
} from 'lucide-react';
import {
  DisasterType,
  SimulationSeverity,
  SimulationParams,
  SimulationPhase,
  SimulationImpactResult,
  DISASTER_TYPE_METADATA
} from './disasterSimulationData';

interface DisasterControlPanelProps {
  locationName: string;
  stateName: string;
  simParams: SimulationParams;
  impactResult: SimulationImpactResult;
  onUpdateParams: (updater: (prev: SimulationParams) => SimulationParams) => void;
  onSetPhase: (phase: SimulationPhase) => void;
  onClose: () => void;
  onFocusHazardSite: () => void;
  onToggleCutaway: () => void;
  isCutawayActive: boolean;
  onToggleWaterFlow: () => void;
  isWaterFlowActive: boolean;
  onFindSafestDestination: () => void;
  onFindSafeRoute: () => void;
}

export const DisasterControlPanel: React.FC<DisasterControlPanelProps> = ({
  locationName,
  stateName,
  simParams,
  impactResult,
  onUpdateParams,
  onSetPhase,
  onClose,
  onFocusHazardSite,
  onToggleCutaway,
  isCutawayActive,
  onToggleWaterFlow,
  isWaterFlowActive,
  onFindSafestDestination,
  onFindSafeRoute
}) => {
  return (
    <div className="absolute top-28 left-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xl w-92 max-h-[calc(100vh-8.5rem)] overflow-y-auto text-xs text-slate-800 pointer-events-auto flex flex-col gap-3 font-sans">
      {/* Title & Close */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <strong className="text-slate-900 text-xs font-black tracking-wider uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            DISASTER IMPACT SIMULATOR
          </strong>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          title="Close Simulation Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Location Bar with Mode Badges */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/70 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-400 font-mono">SIMULATION TARGET</div>
          <div className="text-xs font-bold text-slate-800">{locationName}, {stateName}</div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200/70 font-bold">
            🟠 SIMULATION
          </span>
        </div>
      </div>

      {/* BEFORE / DURING / AFTER Phase Switcher */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
          Temporal Progression
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['before', 'during', 'after'] as SimulationPhase[]).map((ph) => {
            const isActive = impactResult.phase === ph;
            return (
              <button
                key={ph}
                onClick={() => onSetPhase(ph)}
                className={`py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {ph}
              </button>
            );
          })}
        </div>
      </div>

      {/* Disaster Scenario Selector */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-700">Disaster Scenario</label>
          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
            {DISASTER_TYPE_METADATA[simParams.disasterType]?.tag}
          </span>
        </div>
        <select
          aria-label="Select disaster scenario"
          value={simParams.disasterType}
          onChange={(e) =>
            onUpdateParams((p) => ({
              ...p,
              disasterType: e.target.value as DisasterType
            }))
          }
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-900 outline-none cursor-pointer focus:border-amber-500"
        >
          <option value="landslide">Landslide (Debris Flow Runout)</option>
          <option value="flash_flood">Flash Flood (Rapid Catchment Inundation)</option>
          <option value="river_flood">River Flood (Riparian Basin Overflow)</option>
          <option value="heavy_rainfall">Cloudburst / Extreme Rainfall</option>
          <option value="river_blockage">Landslide → River Blockage (Choke Dam)</option>
          <option value="cascade">Landslide → Flood Cascade (DISASTER DOMINO)</option>
        </select>
        <p className="text-[10px] text-slate-500 leading-tight">
          {DISASTER_TYPE_METADATA[simParams.disasterType]?.description}
        </p>
      </div>

      {/* Hazard Severity */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-slate-700">Simulated Severity</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['moderate', 'high', 'extreme'] as SimulationSeverity[]).map((sev) => {
            const isSelected = simParams.severity === sev;
            const style =
              sev === 'extreme'
                ? isSelected ? 'bg-rose-600 text-white font-black' : 'bg-slate-50 text-slate-600 hover:bg-rose-50'
                : sev === 'high'
                ? isSelected ? 'bg-orange-600 text-white font-black' : 'bg-slate-50 text-slate-600 hover:bg-orange-50'
                : isSelected ? 'bg-amber-600 text-white font-black' : 'bg-slate-50 text-slate-600 hover:bg-amber-50';

            return (
              <button
                key={sev}
                onClick={() => onUpdateParams((p) => ({ ...p, severity: sev }))}
                className={`py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-slate-200/80 transition-all cursor-pointer ${style}`}
              >
                {sev}
              </button>
            );
          })}
        </div>
      </div>

      {/* Environmental Sliders */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        {/* Rainfall */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500">Rainfall:</span>
            <span className="text-blue-700 font-bold font-mono">{simParams.rainfallMm} mm/24h</span>
          </div>
          <input
            type="range"
            min="60"
            max="320"
            step="10"
            value={simParams.rainfallMm}
            onChange={(e) => onUpdateParams((p) => ({ ...p, rainfallMm: Number(e.target.value) }))}
            className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="text-[9px] text-slate-400 font-mono">Prototype Input</div>
        </div>

        {/* Soil Saturation */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500">Soil Saturation:</span>
            <span className="text-amber-700 font-bold font-mono">{simParams.soilSaturationPct}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="100"
            step="5"
            value={simParams.soilSaturationPct}
            onChange={(e) => onUpdateParams((p) => ({ ...p, soilSaturationPct: Number(e.target.value) }))}
            className="w-full accent-amber-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="text-[9px] text-slate-400 font-mono">Prototype Input</div>
        </div>
      </div>

      {/* Disaster Timeline (00:00 to 15:00) */}
      <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Timeline</span>
          </div>
          <span className="font-mono text-blue-700 font-black text-[11px]">
            {String(Math.floor(simParams.timelineMinutes)).padStart(2, '0')}:
            {String(Math.round((simParams.timelineMinutes % 1) * 60)).padStart(2, '0')} / 15:00 MIN
          </span>
        </div>

        {/* Timeline Scrubber */}
        <input
          type="range"
          min="0"
          max="15"
          step="0.5"
          value={simParams.timelineMinutes}
          onChange={(e) =>
            onUpdateParams((p) => ({
              ...p,
              timelineMinutes: Number(e.target.value),
              isPlaying: false
            }))
          }
          className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
        />

        {/* Milestone Badge & Detail */}
        <div className="p-2 rounded-lg bg-white border border-slate-200 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                impactResult.phase === 'after'
                  ? 'bg-rose-500'
                  : impactResult.phase === 'during'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500'
              }`} />
              {impactResult.currentMilestoneText}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
              {impactResult.phase}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            {impactResult.currentMilestoneDetail}
          </p>
        </div>

        {/* Controls Dock */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            {/* Rewind */}
            <button
              onClick={() => onUpdateParams((p) => ({ ...p, timelineMinutes: 0, isPlaying: false }))}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
              title="Reset Timeline to 00:00"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Step -1m */}
            <button
              onClick={() =>
                onUpdateParams((p) => ({
                  ...p,
                  timelineMinutes: Math.max(0, p.timelineMinutes - 1),
                  isPlaying: false
                }))
              }
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700 cursor-pointer"
              title="Previous minute"
            >
              -1m
            </button>

            {/* Play / Pause Toggle */}
            <button
              onClick={() => onUpdateParams((p) => ({ ...p, isPlaying: !p.isPlaying }))}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                simParams.isPlaying
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {simParams.isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[11px]">PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[11px]">RUN SIMULATION</span>
                </>
              )}
            </button>

            {/* Step +1m */}
            <button
              onClick={() =>
                onUpdateParams((p) => ({
                  ...p,
                  timelineMinutes: Math.min(15, p.timelineMinutes + 1),
                  isPlaying: false
                }))
              }
              className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700 cursor-pointer"
              title="Next minute"
            >
              +1m
            </button>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200">
            {([1, 2, 5] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => onUpdateParams((p) => ({ ...p, speedMultiplier: sp }))}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                  simParams.speedMultiplier === sp
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decision-Support Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={onFindSafestDestination}
          className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Find Safest Destination</span>
        </button>

        <button
          onClick={onFindSafeRoute}
          className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>Find Safe Route</span>
        </button>
      </div>

      {/* Specialized 3D Visual Modes: Cutaway & Water Flow */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onToggleCutaway}
          className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isCutawayActive
              ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title="Expose Subsurface Regolith & Bedrock Shear Slip Plane"
        >
          <Layers className="w-3.5 h-3.5 text-purple-500" />
          <span>{isCutawayActive ? 'Anatomy Active' : 'Terrain Cutaway'}</span>
        </button>

        <button
          onClick={onToggleWaterFlow}
          className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            isWaterFlowActive
              ? 'bg-cyan-600 text-white border-cyan-700 shadow-sm'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title="Show Directional Runoff Drainage Vectors"
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-500" />
          <span>{isWaterFlowActive ? 'Drainage Active' : 'Start Water Flow'}</span>
        </button>
      </div>

      {/* Re-center Camera */}
      <button
        onClick={onFocusHazardSite}
        className="w-full py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Crosshair className="w-3 h-3 text-slate-500" />
        <span>Center 3D Camera on Hazard Origin</span>
      </button>
    </div>
  );
};
