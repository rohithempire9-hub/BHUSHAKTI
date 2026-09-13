import React from 'react';
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
  RotateCcw
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
}) => {
  const activeAlertNodes = sensingNodes.filter((n) => n.riskLevel === 'emergency');

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-[#0b1738] border border-[#1b3470] p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Landslide Geotechnical Core
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {activeAlertNodes.length > 0 ? `${activeAlertNodes.length} CRITICAL ALERTS` : 'SLOPES STABLE'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Landslide Telemetry &amp; PINN Slope Stability Manager
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Live IoT Edge accelerometers, pore water pressure transducers &amp; Physics-Informed Neural Network digital twins.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onTriggerMassSos}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/30 border border-rose-400/40 text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcast Slope SOS</span>
          </button>
        </div>
      </div>

      {/* Quick Perturbation Bench for Landslides */}
      <div className="rounded-2xl bg-[#0a1738] border border-[#162e66] p-4 sm:p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[#162e66]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Geotechnical Perturbation Sliders
            </h3>
          </div>
          <button
            onClick={onResetSimulation}
            className="px-3 py-1 rounded-lg bg-[#0e214d] hover:bg-[#132c66] text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rainfall Slider */}
          <div className="p-3.5 rounded-xl bg-[#071129] border border-[#18316c]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Monsoon Rainfall Intensity</span>
              <span className="text-xs font-mono font-black text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                {simulatedRainfall} mm/h
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={simulatedRainfall}
              onChange={(e) => onSimulatedRainfallChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0 mm/h (Dry)</span>
              <span>50 mm/h (Heavy)</span>
              <span>120+ mm/h (Cloudburst)</span>
            </div>
          </div>

          {/* Displacement Slider */}
          <div className="p-3.5 rounded-xl bg-[#071129] border border-[#18316c]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Downslope Shear Displacement</span>
              <span className="text-xs font-mono font-black text-amber-300 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
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
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>0.0 cm (Static)</span>
              <span>2.5 cm (Creep)</span>
              <span>8.0+ cm (Catastrophic Failure)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Telemetry Grid */}
      <div className="rounded-2xl bg-[#0a1738] border border-[#162e66] p-4 sm:p-6 shadow-2xl">
        <HybridSensingGrid
          nodes={sensingNodes}
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
