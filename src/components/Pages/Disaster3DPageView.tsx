import React, { useState } from 'react';
import {
  Globe,
  Sliders,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  Layers,
  Activity,
  Flame,
  Droplets
} from 'lucide-react';

interface Disaster3DPageViewProps {
  simulatedRainfall: number;
  onSimulatedRainfallChange: (val: number) => void;
  simulatedDisplacement: number;
  onSimulatedDisplacementChange: (val: number) => void;
  onResetSimulation: () => void;
  onTriggerMassSos: () => void;
}

export const Disaster3DPageView: React.FC<Disaster3DPageViewProps> = ({
  simulatedRainfall,
  onSimulatedRainfallChange,
  simulatedDisplacement,
  onSimulatedDisplacementChange,
  onResetSimulation,
  onTriggerMassSos,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTerrainMode, setActiveTerrainMode] = useState<'3d_mesh' | 'cross_section' | 'shear_stress'>('3d_mesh');

  // Dynamic Factor of Safety (FS):
  // Baseline FS = 1.45
  // Rain reduces FS by (rainfall / 100) * 0.55
  // Displacement reduces FS by (displacement / 10) * 0.45
  const baseFs = 1.45;
  const rainPenalty = (simulatedRainfall / 100) * 0.55;
  const dispPenalty = (simulatedDisplacement / 10) * 0.45;
  const currentFs = Math.max(0.42, Number((baseFs - rainPenalty - dispPenalty).toFixed(2)));

  const isCriticalFailure = currentFs < 1.0;
  const isWarning = currentFs >= 1.0 && currentFs < 1.25;

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-[#0b1738] border border-[#1b3470] p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                Computational Geodynamics
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  isCriticalFailure
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isCriticalFailure ? 'CATASTROPHIC SLOPE FAILURE IMMINENT' : isWarning ? 'WARNING DEFORMATION' : 'EQUILIBRIUM STABLE'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              3D Disaster View &amp; Geotechnical Simulation Bench
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Finite Element &amp; Physics-Informed Neural Network (PINN) slope kinematics with stress-state visualization.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Kinematics' : 'Simulate Failure Loop'}</span>
          </button>
          <button
            onClick={onResetSimulation}
            className="px-3.5 py-2.5 bg-[#0f2352] hover:bg-[#142e6a] text-cyan-300 rounded-xl border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3D Stage & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Visualization Canvas (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl bg-[#0a1738] border border-[#162e66] p-5 shadow-2xl flex flex-col justify-between min-h-[580px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#162e66]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                3D Terrain Kinematics Projection
              </h3>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#071129] border border-[#18316c]">
              {(['3d_mesh', 'cross_section', 'shear_stress'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setActiveTerrainMode(mode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    activeTerrainMode === mode
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG 3D Elevation Cross-Section */}
          <div className="flex-1 my-4 flex items-center justify-center relative overflow-hidden rounded-xl bg-gradient-to-b from-[#060e22] to-[#040817] border border-[#142857] p-4">
            <svg
              viewBox="0 0 800 450"
              className="w-full h-full max-h-[440px]"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#081534" />
                  <stop offset="100%" stopColor="#040b1b" />
                </linearGradient>

                <linearGradient id="mountainRock" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="70%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>

                <linearGradient id="failureRupture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Sky Background */}
              <rect x="0" y="0" width="800" height="450" fill="url(#skyGrad)" />

              {/* Background mountain ridges */}
              <polygon points="0,320 180,180 340,260 520,130 680,240 800,160 800,450 0,450" fill="#0f1f44" opacity="0.6" />
              <polygon points="0,360 220,240 420,310 600,190 780,290 800,280 800,450 0,450" fill="#132757" opacity="0.8" />

              {/* Foreground Slope with Dynamic Slip Arc */}
              <path
                d="M 50,420 L 260,280 L 480,140 L 720,70 L 780,420 Z"
                fill="url(#mountainRock)"
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Dynamic Failure Slip Wedge (expands and slides when rain/disp are high) */}
              <path
                d={`M ${480 + simulatedDisplacement * 4},${140 + simulatedDisplacement * 8} Q ${350 + simulatedDisplacement * 2},${220 + simulatedRainfall * 0.4} ${260},${280} Q ${380},${260} ${480 + simulatedDisplacement * 4},${140 + simulatedDisplacement * 8}`}
                fill={isCriticalFailure ? 'url(#failureRupture)' : '#38bdf820'}
                stroke={isCriticalFailure ? '#f43f5e' : '#38bdf8'}
                strokeWidth={isCriticalFailure ? 3 : 1.5}
                strokeDasharray={isCriticalFailure ? '6 4' : 'none'}
              />

              {/* Water table saturation level */}
              <path
                d={`M 120,400 Q 320,${340 - simulatedRainfall * 0.5} 620,${220 - simulatedRainfall * 0.4}`}
                fill="none"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeDasharray="5 5"
              />

              {/* Annotations */}
              <text x="630" y="210" fill="#06b6d4" fontSize="11" fontWeight="bold">
                Pore Pressure Line ({Math.round(simulatedRainfall * 0.85 + 24)} kPa)
              </text>
              <text x="270" y="270" fill={isCriticalFailure ? '#fb7185' : '#e2e8f0'} fontSize="12" fontWeight="bold">
                Toe Rupture Point
              </text>
              <text x="500" y="125" fill="#facc15" fontSize="12" fontWeight="bold">
                Tension Crack Crown
              </text>

              {/* Dynamic Failure Banner on Canvas */}
              {isCriticalFailure && (
                <g transform="translate(250, 40)">
                  <rect x="0" y="0" width="300" height="42" rx="10" fill="#881337" stroke="#f43f5e" strokeWidth="2" />
                  <text x="150" y="26" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
                    ⚠️ SHEAR FAILURE TRIGGERED (FS: {currentFs})
                  </text>
                </g>
              )}
            </svg>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-[#162e66]">
            <span>Elevation: 3,024m ASL (Sela Pass)</span>
            <span>Soil: Himalayan Colluvium / Mica Schist</span>
            <span>Internal Friction Angle φ: 32.4°</span>
          </div>
        </div>

        {/* Right: Geotechnical Sliders & Factor of Safety (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Factor of Safety Card */}
          <div
            className={`rounded-2xl p-5 border shadow-2xl transition-all ${
              isCriticalFailure
                ? 'bg-gradient-to-b from-[#2e0e1f] to-[#17050e] border-rose-500 shadow-rose-950/50'
                : isWarning
                ? 'bg-gradient-to-b from-[#2e1c0c] to-[#170c04] border-amber-500 shadow-amber-950/50'
                : 'bg-gradient-to-b from-[#092238] to-[#041221] border-emerald-500 shadow-emerald-950/50'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
              Slope Stability Diagnostic
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <h4 className="text-sm font-bold text-white">Factor of Safety (FS)</h4>
              <span
                className={`text-4xl font-black font-mono ${
                  isCriticalFailure ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {currentFs}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2">
              {isCriticalFailure
                ? 'Critically unstable (FS < 1.0). Driving gravitational forces exceed resisting shear strength.'
                : isWarning
                ? 'Marginal stability (1.0 ≤ FS < 1.25). Immediate road closure and geotechnical inspection recommended.'
                : 'Safe slope equilibrium (FS ≥ 1.25). Nominal conditions.'}
            </p>

            {isCriticalFailure && (
              <button
                onClick={onTriggerMassSos}
                className="mt-4 w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/40 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>Trigger Emergency Cell Broadcast</span>
              </button>
            )}
          </div>

          {/* Sliders Box */}
          <div className="rounded-2xl bg-[#0a1738] border border-[#162e66] p-5 shadow-2xl space-y-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Perturbation Bench</span>
            </h4>

            {/* Rainfall Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-200">
                <span>Rainfall Intensity:</span>
                <span className="font-mono text-cyan-300 font-bold">{simulatedRainfall} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                value={simulatedRainfall}
                onChange={(e) => onSimulatedRainfallChange(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Displacement Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-200">
                <span>Shear Creep Displacement:</span>
                <span className="font-mono text-amber-300 font-bold">{simulatedDisplacement} cm</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={simulatedDisplacement}
                onChange={(e) => onSimulatedDisplacementChange(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Quick Scenario Buttons */}
            <div className="pt-2 border-t border-[#18316c]">
              <span className="text-[11px] text-slate-400 font-medium block mb-2">Preset Disaster Scenarios:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onSimulatedRainfallChange(160);
                    onSimulatedDisplacementChange(9.5);
                  }}
                  className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer text-left"
                >
                  ⚡ Cloudburst Failure
                </button>
                <button
                  onClick={() => {
                    onSimulatedRainfallChange(80);
                    onSimulatedDisplacementChange(4.2);
                  }}
                  className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer text-left"
                >
                  🌧️ Monsoon Saturation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
