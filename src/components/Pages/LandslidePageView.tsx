import React, { useState } from 'react';
import { SensingNodeDevice } from '../../types/bhuShakti';
import { LandslideStation } from '../../types/landslide';
import { HybridSensingGrid } from '../Sensors/HybridSensingGrid';
import {
  Flame,
  Cpu,
  Activity,
  Radio,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Sparkles,
  Pause,
  Play
} from 'lucide-react';

interface LandslidePageViewProps {
  sensingNodes: SensingNodeDevice[];
  onToggleNodeMode: (nodeId: string) => void;
  onUpdateNodeTelemetry: (nodeId: string, updates: Partial<SensingNodeDevice>) => void;
  stations: LandslideStation[];
  onSelectStation: (station: LandslideStation) => void;
  onTriggerMassSos: () => void;
  simulatedRainfall: number;
  onSimulatedRainfallChange: (val: number) => void;
  simulatedDisplacement: number;
  onSimulatedDisplacementChange: (val: number) => void;
  onResetSimulation: () => void;
  isLiveStreamActive?: boolean;
  onToggleLiveStream?: () => void;
}

export const LandslidePageView: React.FC<LandslidePageViewProps> = ({
  sensingNodes,
  onToggleNodeMode,
  onUpdateNodeTelemetry,
  stations,
  onSelectStation,
  onTriggerMassSos,
  simulatedRainfall,
  onSimulatedRainfallChange,
  simulatedDisplacement,
  onSimulatedDisplacementChange,
  onResetSimulation,
  isLiveStreamActive = true,
  onToggleLiveStream,
}) => {
  const [showPerturbationBench, setShowPerturbationBench] = useState<boolean>(true);
  
  // Local pause state and frozen telemetry snapshot
  const [isLocallyPaused, setIsLocallyPaused] = useState<boolean>(false);
  const [frozenNodes, setFrozenNodes] = useState<SensingNodeDevice[] | null>(null);
  const [frozenTimestamp, setFrozenTimestamp] = useState<string>('');

  const isPaused = isLocallyPaused || !isLiveStreamActive;

  const handleTogglePause = () => {
    if (isPaused) {
      // Resume updates
      setIsLocallyPaused(false);
      setFrozenNodes(null);
      setFrozenTimestamp('');
      if (onToggleLiveStream && !isLiveStreamActive) {
        onToggleLiveStream();
      }
    } else {
      // Freeze updates
      setIsLocallyPaused(true);
      setFrozenNodes([...sensingNodes]);
      setFrozenTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      if (onToggleLiveStream && isLiveStreamActive) {
        onToggleLiveStream();
      }
    }
  };

  const currentDisplayedNodes = isPaused && frozenNodes ? frozenNodes : sensingNodes;
  const activeAlertNodes = currentDisplayedNodes.filter((n) => n.riskLevel === 'emergency');
  const warningNodes = currentDisplayedNodes.filter((n) => n.riskLevel === 'warning');

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto pb-10">
      {/* Top Header Card: Spacious & High Contrast */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0a1638] via-[#091535] to-[#061026] border border-[#1b3674] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                  GEOTECHNICAL CORE v4.1
                </span>

                {/* Live Stream / Frozen Status Capsule */}
                {isPaused ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    FROZEN FOR INSPECTION ({frozenTimestamp || 'ACTIVE'})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
                    LIVE TELEMETRY STREAM
                  </span>
                )}
                
                {/* Dynamic Status Capsule */}
                {activeAlertNodes.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm animate-pulse whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    {activeAlertNodes.length} CRITICAL ALERTS ACTIVE
                  </span>
                ) : warningNodes.length > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/50 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    {warningNodes.length} STATIONS ON ELEVATED WATCH
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ALL MONITORED SLOPES STABLE
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-sans tracking-tight">
                Live Sensor Mesh &amp; PINN Slope Stability
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Autonomous real-time IoT Inclinometers, Pore Water Pressure transducers, and continuous Physics-Informed Neural Network (PINN) slope twins across high-risk Himalayan corridors.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* DEDICATED PAUSE / RESUME LIVE UPDATES BUTTON */}
            <button
              id="btn-pause-live-updates"
              onClick={handleTogglePause}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95 whitespace-nowrap ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 shadow-emerald-950/50 ring-2 ring-emerald-400/40'
                  : 'bg-[#0e224e] hover:bg-[#142e68] text-amber-300 border border-amber-500/40 hover:border-amber-400'
              }`}
              title={
                isPaused
                  ? 'Click to resume real-time sensor updates'
                  : 'Click to freeze sensor grid to inspect data points without changing'
              }
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 text-white fill-white" />
                  <span>Resume Live Updates</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 text-amber-400" />
                  <span>Pause Live Updates</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowPerturbationBench(!showPerturbationBench)}
              className="px-3.5 py-2 rounded-xl bg-[#0e224e] hover:bg-[#142e68] text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>{showPerturbationBench ? 'Hide' : 'Open'} Perturbation Sliders</span>
              {showPerturbationBench ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={onTriggerMassSos}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-900/40 border border-rose-400/40 flex items-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Broadcast Slope SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inspection Freeze Banner Alert */}
      {isPaused && (
        <div className="rounded-xl bg-amber-950/40 border border-amber-500/40 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-lg">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 shrink-0">
              <Pause className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>Inspection Mode Active — Live Updates Paused</span>
                {frozenTimestamp && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-900/60 border border-amber-400/30 text-amber-300">
                    Snapshotted at {frozenTimestamp}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                All sensor readings, pore-water pressure metrics, and inclinometer tilt degrees are locked so you can inspect individual node telemetry without values shifting.
              </p>
            </div>
          </div>
          <button
            onClick={handleTogglePause}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors shrink-0 self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Unfreeze Grid</span>
          </button>
        </div>
      )}

      {/* Geotechnical Perturbation Bench (Collapsible & Spacious) */}
      {showPerturbationBench && (
        <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 sm:p-6 shadow-xl transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#142854]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Live Geotechnical Stress Perturbation Sandbox
                </h3>
                <p className="text-[11px] text-slate-400">
                  Manipulate rainfall threshold or shear creep to observe live PINN neural twin reaction in real time.
                </p>
              </div>
            </div>

            <button
              onClick={onResetSimulation}
              className="px-3 py-1.5 rounded-xl bg-[#0e214d] hover:bg-[#132c66] text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monsoon Rainfall Rate Slider */}
            <div className="p-4 rounded-xl bg-[#050e22] border border-[#142854]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-200">Monsoon Rainfall Intensity</span>
                <span className="text-xs font-mono font-black text-cyan-300 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-700/60">
                  {simulatedRainfall} mm/h
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={simulatedRainfall}
                onChange={(e) => onSimulatedRainfallChange(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                <span>0 mm/h (Dry)</span>
                <span>50 mm/h (Monsoon)</span>
                <span className="text-rose-400 font-bold">120+ mm/h (Cloudburst)</span>
              </div>
            </div>

            {/* Downslope Shear Displacement Slider */}
            <div className="p-4 rounded-xl bg-[#050e22] border border-[#142854]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-200">Downslope Shear Creep Displacement</span>
                <span className="text-xs font-mono font-black text-amber-300 px-2.5 py-1 rounded-md bg-amber-950/80 border border-amber-700/60">
                  {simulatedDisplacement} cm
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={simulatedDisplacement}
                onChange={(e) => onSimulatedDisplacementChange(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-2 font-mono">
                <span>0.0 cm (Static)</span>
                <span>2.5 cm (Creep Phase)</span>
                <span className="text-rose-400 font-bold">8.0+ cm (Slope Slip)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Telemetry Grid Container: Generous Padding & Beautiful Contrast */}
      <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 sm:p-6 shadow-2xl">
        <HybridSensingGrid
          nodes={currentDisplayedNodes}
          onToggleNodeMode={onToggleNodeMode}
          onUpdateNodeTelemetry={onUpdateNodeTelemetry}
          onSelectNodeForInspection={(node) => {
            const match = stations.find((s) => s.id === node.id || s.name.toLowerCase().includes(node.locationName.toLowerCase()));
            if (match) onSelectStation(match);
          }}
          onTriggerSosForNode={onTriggerMassSos}
        />
      </div>
    </div>
  );
};

