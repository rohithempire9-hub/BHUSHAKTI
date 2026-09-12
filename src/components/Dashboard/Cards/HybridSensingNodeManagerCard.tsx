import React from 'react';
import {
  Cpu,
  RefreshCw,
  Droplets,
  Compass,
  CloudRain,
  Radio,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SensingNodeDevice } from '../../../types/bhuShakti';

interface HybridSensingNodeManagerCardProps {
  nodes: SensingNodeDevice[];
  onToggleNodeMode: (nodeId: string) => void;
  simulatedRainfall?: number;
  simulatedDisplacement?: number;
}

export const HybridSensingNodeManagerCard: React.FC<HybridSensingNodeManagerCardProps> = ({
  nodes,
  onToggleNodeMode,
  simulatedRainfall = 25,
  simulatedDisplacement = 0.8,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
              Active Monitoring Stations
            </h4>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {nodes.length} Online
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Real-time LoRa telemetry streaming with PINN virtual digital twins
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LoRa IN865 Live</span>
        </div>
      </div>

      {/* Scrolling List of Active Stations */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
        {nodes.map((node, idx) => {
          const isPhysical = node.mode === 'physical';

          // Dynamically scale metrics with the judge's simulation sliders
          const simulatedMoisture = Math.min(
            98,
            Math.max(
              28,
              Math.round(node.soilMoisturePct + ((simulatedRainfall - 25) / 150) * 35)
            )
          );
          const simulatedTilt = +(
            node.tiltAngleDeg +
            (simulatedDisplacement - 0.8) * 0.9
          ).toFixed(1);
          const simulatedPrecip = Math.max(
            4,
            Math.round((node.hourlyRainfallMm ?? 14) + (simulatedRainfall - 25) * 0.85)
          );

          const isCritical = simulatedMoisture > 80 || simulatedTilt > 4.5;
          const isWarning = !isCritical && (simulatedMoisture > 65 || simulatedTilt > 2.0);

          const statusColor = isCritical
            ? 'text-rose-300 border-rose-500/50 bg-rose-500/20'
            : isWarning
            ? 'text-amber-300 border-amber-500/50 bg-amber-500/20'
            : 'text-emerald-300 border-emerald-500/50 bg-emerald-500/20';

          const moistureBarColor = isCritical
            ? 'bg-gradient-to-r from-rose-500 to-red-600'
            : isWarning
            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
            : 'bg-gradient-to-r from-emerald-400 to-teal-500';

          return (
            <div
              key={node.id}
              id={`station-row-${node.id}`}
              className="p-2.5 sm:p-3 rounded-xl bg-slate-950/75 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between gap-2.5 overflow-hidden"
            >
              {/* Row Header: Station Name & Mode Indicator */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <div className="min-w-0 truncate">
                    <span className="font-mono text-xs font-black text-slate-100">
                      {node.nodeCode}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-1.5 truncate">
                      {node.locationName}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${statusColor}`}
                >
                  {isCritical ? 'EMERGENCY' : isWarning ? 'WARNING' : 'STABLE'}
                </span>
              </div>

              {/* Uniform Metrics: Moisture Line, Tilt Number, Precip Gauge */}
              <div className="grid grid-cols-3 gap-2 py-1 px-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px]">
                {/* 1. Soil Moisture Progress Line */}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-slate-400 flex items-center gap-1 truncate">
                      <Droplets className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                      Moisture:
                    </span>
                    <span className="font-mono font-bold text-slate-200 shrink-0">
                      {simulatedMoisture}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${moistureBarColor}`}
                      style={{ width: `${simulatedMoisture}%` }}
                    />
                  </div>
                </div>

                {/* 2. Tilt Displacement Number */}
                <div className="flex flex-col items-center justify-center border-x border-slate-800/80 px-1 min-w-0">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                    <Compass className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                    Tilt:
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${
                      simulatedTilt > 4.5
                        ? 'text-rose-400'
                        : simulatedTilt > 2.0
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {simulatedTilt}°
                  </span>
                </div>

                {/* 3. Hourly Precipitation Gauge */}
                <div className="flex flex-col items-end justify-center min-w-0">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                    <CloudRain className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                    Rain:
                  </span>
                  <span className="font-mono font-bold text-xs text-indigo-300 shrink-0">
                    {simulatedPrecip} mm/h
                  </span>
                </div>
              </div>

              {/* Distinct Toggle Capsule: [Switch between Physical ESP32 / Virtual AI Digital Twin] */}
              <button
                id={`toggle-capsule-${node.id}`}
                onClick={() => onToggleNodeMode(node.id)}
                className={`w-full py-1.5 px-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  isPhysical
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                }`}
                title="Click to toggle operating twin mode"
              >
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isPhysical ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                  />
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-normal shrink-0">
                    Mode:
                  </span>
                  <span className="font-semibold truncate">
                    {isPhysical ? 'Physical ESP32 LoRa' : 'Virtual AI Digital Twin'}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-700/60 text-slate-200 shrink-0 whitespace-nowrap">
                  <RefreshCw className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>Switch to {isPhysical ? 'AI Twin' : 'ESP32'}</span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
