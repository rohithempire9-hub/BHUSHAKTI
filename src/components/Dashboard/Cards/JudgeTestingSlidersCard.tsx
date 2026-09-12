import React from 'react';
import {
  SlidersHorizontal,
  CloudRain,
  Compass,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Gauge
} from 'lucide-react';

interface JudgeTestingSlidersCardProps {
  simulatedRainfall: number;
  onSimulatedRainfallChange: (val: number) => void;
  simulatedDisplacement: number;
  onSimulatedDisplacementChange: (val: number) => void;
  onResetSimulation: () => void;
}

export const JudgeTestingSlidersCard: React.FC<JudgeTestingSlidersCardProps> = ({
  simulatedRainfall,
  onSimulatedRainfallChange,
  simulatedDisplacement,
  onSimulatedDisplacementChange,
  onResetSimulation,
}) => {
  // Compute overall risk level
  const isCritical = simulatedRainfall > 75 || simulatedDisplacement > 4.5;
  const isWarning = !isCritical && (simulatedRainfall > 40 || simulatedDisplacement > 2.0);
  const isSafe = !isCritical && !isWarning;

  // Factor of Safety (FS) geotechnical calculation
  // FS = Resisting Forces / Driving Forces
  const rawFS = 2.15 - (simulatedRainfall / 150) * 1.2 - (simulatedDisplacement / 15) * 0.65;
  const factorOfSafety = Math.max(0.55, +rawFS.toFixed(2));

  const stateTitle = isCritical
    ? 'EMERGENCY'
    : isWarning
    ? 'WARNING'
    : 'STABLE';

  const stateBadgeColor = isCritical
    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-950/50 animate-pulse'
    : isWarning
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider border transition-all whitespace-nowrap shrink-0 ${stateBadgeColor}`}
            >
              {stateTitle}
            </span>
            <span className="text-[11px] text-slate-400 font-mono truncate">
              Factor of Safety: <strong className={factorOfSafety < 1.0 ? 'text-rose-400' : factorOfSafety <= 1.5 ? 'text-amber-400' : 'text-emerald-400'}>FS {factorOfSafety}</strong>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            Alters GIS routes, dual-axis chart, telemetry, and SMS dispatches
          </p>
        </div>

        <button
          id="judge-reset-simulation-btn"
          onClick={onResetSimulation}
          className="p-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-xs flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
          title="Reset to default baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-semibold">Reset</span>
        </button>
      </div>

      {/* Main Sliders Area */}
      <div className="space-y-3.5">
        {/* Slider 1: Simulated Rainfall Intensity (mm) */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-500/20 text-blue-400">
                <CloudRain className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-200">
                Simulated Rainfall Intensity (mm)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
                  simulatedRainfall > 75
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : simulatedRainfall > 40
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {simulatedRainfall} mm/h
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {simulatedRainfall > 75 ? 'Torrential' : simulatedRainfall > 40 ? 'Moderate' : 'Drizzle'}
              </span>
            </div>
          </div>

          <input
            id="judge-rainfall-slider"
            type="range"
            min="0"
            max="150"
            step="1"
            value={simulatedRainfall}
            onChange={(e) => onSimulatedRainfallChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 focus:outline-none"
          />

          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>0 mm (Dry)</span>
            <span className="text-amber-400">40 mm (Alert)</span>
            <span className="text-rose-400 font-bold">75+ mm (Critical Breach)</span>
            <span>150 mm</span>
          </div>
        </div>

        {/* Slider 2: Simulated Slope Displacement (Degrees) */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-amber-500/20 text-amber-400">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-200">
                Simulated Slope Displacement (Degrees)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-xs font-black px-2 py-0.5 rounded border ${
                  simulatedDisplacement > 4.5
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : simulatedDisplacement > 2.0
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {simulatedDisplacement.toFixed(1)}°
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {simulatedDisplacement > 4.5 ? 'Shear Slip' : simulatedDisplacement > 2.0 ? 'Creeping' : 'Stable'}
              </span>
            </div>
          </div>

          <input
            id="judge-displacement-slider"
            type="range"
            min="0"
            max="15"
            step="0.1"
            value={simulatedDisplacement}
            onChange={(e) => onSimulatedDisplacementChange(Number(e.target.value))}
            className="w-full h-2 rounded-lg bg-slate-800 appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 focus:outline-none"
          />

          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>0.0° (Rigid)</span>
            <span className="text-amber-400">2.0° (Creep Threshold)</span>
            <span className="text-rose-400 font-bold">4.5° (Shear Rupture)</span>
            <span>15.0°</span>
          </div>
        </div>
      </div>

      {/* Geotechnical Factor of Safety Bar & Active Impact */}
      <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <div>
            <span className="text-[10px] text-slate-400 block">Computed Slope Factor of Safety (FS):</span>
            <span className="font-bold text-slate-200">
              {factorOfSafety > 1.5 ? 'Stable Equilibrium' : factorOfSafety >= 1.0 ? 'Marginal Stability' : 'Slope Failure Imminent'}
            </span>
          </div>
        </div>

        <div className="text-right font-mono">
          <span
            className={`text-base font-black px-2 py-0.5 rounded border ${
              factorOfSafety < 1.0
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                : factorOfSafety <= 1.5
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
            }`}
          >
            FS: {factorOfSafety}
          </span>
        </div>
      </div>

      {/* Quick Scenario Preset Buttons for Judges */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
          <span>Judge Quick Presets (1-Click Test):</span>
          <span className="text-slate-400 font-normal">Forces cross-card state updates</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            id="preset-dry-baseline-btn"
            onClick={() => {
              onSimulatedRainfallChange(18);
              onSimulatedDisplacementChange(0.4);
            }}
            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold transition-all text-center cursor-pointer"
          >
            <span className="block text-[10px]">🟢 Safe Baseline</span>
            <span className="font-mono text-[9px] text-emerald-400/80">18mm • 0.4°</span>
          </button>

          <button
            id="preset-monsoon-warning-btn"
            onClick={() => {
              onSimulatedRainfallChange(55);
              onSimulatedDisplacementChange(2.6);
            }}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold transition-all text-center cursor-pointer"
          >
            <span className="block text-[10px]">🟡 Monsoon Alert</span>
            <span className="font-mono text-[9px] text-amber-400/80">55mm • 2.6°</span>
          </button>

          <button
            id="preset-cloudburst-emergency-btn"
            onClick={() => {
              onSimulatedRainfallChange(110);
              onSimulatedDisplacementChange(6.8);
            }}
            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/50 text-rose-300 text-[11px] font-bold transition-all text-center cursor-pointer animate-pulse"
          >
            <span className="block text-[10px]">🔴 Cloudburst SOS</span>
            <span className="font-mono text-[9px] text-rose-400/80">110mm • 6.8°</span>
          </button>
        </div>
      </div>
    </div>
  );
};
