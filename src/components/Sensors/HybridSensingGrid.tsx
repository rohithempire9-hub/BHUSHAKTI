import React, { useState } from 'react';
import {
  Cpu,
  Radio,
  Sliders,
  Battery,
  Wifi,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Compass,
  CloudRain,
  Layers,
  ArrowUpRight,
  Zap,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';
import { SensingNodeDevice, SensingNodeMode } from '../../types/bhuShakti';

interface HybridSensingGridProps {
  nodes: SensingNodeDevice[];
  onToggleNodeMode: (nodeId: string) => void;
  onUpdateNodeTelemetry: (nodeId: string, updates: Partial<SensingNodeDevice>) => void;
  onSelectNodeForInspection?: (node: SensingNodeDevice) => void;
  onTriggerSosForNode?: (node: SensingNodeDevice) => void;
}

export const HybridSensingGrid: React.FC<HybridSensingGridProps> = ({
  nodes,
  onToggleNodeMode,
  onUpdateNodeTelemetry,
  onSelectNodeForInspection,
  onTriggerSosForNode,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'physical' | 'virtual' | 'critical'>('all');
  const [calibratingNodeId, setCalibratingNodeId] = useState<string | null>(null);

  const filteredNodes = nodes.filter((node) => {
    if (activeFilter === 'physical') return node.mode === 'physical';
    if (activeFilter === 'virtual') return node.mode === 'virtual';
    if (activeFilter === 'critical') return node.riskLevel === 'emergency';
    return true;
  });

  const physicalCount = nodes.filter((n) => n.mode === 'physical').length;
  const virtualCount = nodes.filter((n) => n.mode === 'virtual').length;
  const emergencyCount = nodes.filter((n) => n.riskLevel === 'emergency').length;

  return (
    <div id="hybrid-sensing-grid-panel" className="flex flex-col w-full">
      {/* Header & Filter Controls: Decompressed and Fully Responsive */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#18326a]">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white font-sans tracking-tight">
                  Hybrid Sensing Mesh Manager
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#0c1f4a] text-cyan-300 border border-cyan-500/40">
                  {nodes.length} Nodes Online
                </span>
                {emergencyCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                    {emergencyCount} Emergency Alert{emergencyCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Real-time LoRa telemetry streaming integrated with Physics-Informed Neural Network (PINN) slope digital twins.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills: Scrollable or wrapped cleanly without squashing */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#061026] border border-[#142956] rounded-xl text-xs overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-cyan-500 text-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            All ({nodes.length})
          </button>
          <button
            onClick={() => setActiveFilter('physical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'physical'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'text-emerald-300/80 hover:text-emerald-200 hover:bg-emerald-950/40'
            }`}
          >
            Physical ESP32 ({physicalCount})
          </button>
          <button
            onClick={() => setActiveFilter('virtual')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'virtual'
                ? 'bg-cyan-400 text-black shadow-md'
                : 'text-cyan-300/80 hover:text-cyan-200 hover:bg-cyan-950/40'
            }`}
          >
            Virtual AI ({virtualCount})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeFilter === 'critical'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-rose-300/80 hover:text-rose-200 hover:bg-rose-950/40'
            }`}
          >
            Emergency ({emergencyCount})
          </button>
        </div>
      </div>

      {/* Responsive Flex-Layout for Sensor Cards:
          - Collapses strictly into a single column on devices narrower than 640px (<sm: w-full)
          - Expands into 2 columns on >=640px (sm: w-[calc(50%-8px)])
          - Expands into 3 columns on >=1280px (xl: w-[calc(33.333%-11px)])
      */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 w-full">
        {filteredNodes.map((node) => {
          const isPhysical = node.mode === 'physical';
          const isCritical = node.riskLevel === 'emergency';
          const isWarning = node.riskLevel === 'warning';
          const isSafe = node.riskLevel === 'low';

          // Robust, high-contrast badge styling with explicit containment
          const badgeBg = isCritical
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-rose-950/50'
            : isWarning
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60';

          const moistureBarColor =
            node.soilMoisturePct > 80
              ? 'bg-gradient-to-r from-rose-500 to-red-600'
              : node.soilMoisturePct > 65
              ? 'bg-gradient-to-r from-amber-400 to-amber-500'
              : 'bg-gradient-to-r from-emerald-400 to-teal-500';

          return (
            <div
              key={node.id}
              id={`node-card-${node.id}`}
              className={`w-full sm:w-[calc(50%-8px)] xl:w-[calc(33.333%-11px)] flex flex-col justify-between rounded-2xl p-4 sm:p-5 transition-all duration-200 border relative overflow-hidden ${
                isCritical
                  ? 'bg-gradient-to-b from-[#1c1228] to-[#0d162f] border-rose-500/60 shadow-xl shadow-rose-950/40'
                  : 'bg-[#081533] border-[#152e66] hover:border-[#1e418f] shadow-lg'
              }`}
            >
              {/* Top Node Header: Code, Mode, Name & Unbreakable Classification Badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-black text-slate-100 tracking-tight">
                        {node.nodeCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border whitespace-nowrap shrink-0 ${
                          isPhysical
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                        }`}
                      >
                        {isPhysical ? 'Physical ESP32' : 'Virtual AI'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium truncate mt-1">
                      {node.locationName} • <span className="text-slate-400">{node.state}</span>
                    </div>
                  </div>

                  {/* Classification Badge: Strictly contained, whitespace-nowrap, never comes out of the box */}
                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border whitespace-nowrap shadow-sm ${badgeBg}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          isCritical
                            ? 'bg-rose-400 animate-pulse'
                            : isWarning
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span>{isCritical ? 'EMERGENCY' : isWarning ? 'WARNING' : 'STABLE'}</span>
                    </span>
                  </div>
                </div>

                {/* Switch Mode Toggle Bar: Spacious and cleanly wrapped */}
                <div className="mb-3.5 p-2 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between gap-2 overflow-hidden">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 min-w-0 truncate">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-medium truncate">Twin Mode:</span>
                    <span className="font-bold text-slate-200 truncate">
                      {isPhysical ? 'ESP32 Hardware' : 'PINN Neural Twin'}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleNodeMode(node.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border whitespace-nowrap ${
                      isPhysical
                        ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-200 border-cyan-500/40 hover:bg-cyan-500/30'
                    }`}
                    title="Switch between Physical ESP32 / Virtual AI Twin"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Switch to {isPhysical ? 'AI Twin' : 'ESP32'}</span>
                  </button>
                </div>

                {/* Real-time Telemetry Metrics */}
                <div className="space-y-3 text-xs">
                  {/* Soil Moisture Progress Bar & Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                        Soil Moisture (VWC)
                      </span>
                      <span className="font-mono font-bold text-slate-100 text-xs">
                        {node.soilMoisturePct.toFixed(1)}%
                        {node.soilMoisturePct > 80 && (
                          <span className="ml-1.5 text-[10px] text-rose-400 font-black">(&gt;80% Limit)</span>
                        )}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-[#050e22] overflow-hidden border border-[#142854]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${moistureBarColor}`}
                        style={{ width: `${Math.min(100, Math.max(0, node.soilMoisturePct))}%` }}
                      />
                    </div>

                    {/* Virtual Mode Interactive Calibration Slider */}
                    {!isPhysical && (
                      <div className="mt-2 flex items-center gap-2 p-1.5 rounded-lg bg-[#050e22]/60 border border-[#132854]">
                        <input
                          type="range"
                          min="30"
                          max="98"
                          step="0.5"
                          value={node.soilMoisturePct}
                          onChange={(e) => {
                            const newMoisture = parseFloat(e.target.value);
                            const newRisk = newMoisture > 80 ? 'emergency' : newMoisture > 65 ? 'warning' : 'low';
                            onUpdateNodeTelemetry(node.id, {
                              soilMoisturePct: newMoisture,
                              riskLevel: newRisk,
                            });
                          }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          title="Simulate soil moisture variance"
                        />
                        <span className="text-[10px] text-cyan-300 font-mono font-bold shrink-0">Simulate</span>
                      </div>
                    )}
                  </div>

                  {/* Dual Grid: Tilt Angle & Hourly Rainfall */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Tilt Angle */}
                    <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854]">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Compass className="w-3 h-3 text-amber-400" />
                          Inclinometer
                        </span>
                        <span className="font-bold text-slate-100 font-mono">{node.tiltAngleDeg.toFixed(1)}°</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Disp: {(node.tiltAngleDeg * 0.45).toFixed(1)} cm</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold whitespace-nowrap uppercase ${
                            node.tiltAngleDeg > 3.0
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                              : 'text-emerald-400'
                          }`}
                        >
                          {node.tiltAngleDeg > 3.0 ? 'CRITICAL' : 'NORMAL'}
                        </span>
                      </div>
                    </div>

                    {/* Hourly Rainfall */}
                    <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854]">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <CloudRain className="w-3 h-3 text-blue-400" />
                          Rainfall Rate
                        </span>
                        <span className="font-bold text-slate-100 font-mono">{node.hourlyRainfallMm.toFixed(0)} mm/h</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">24h: {node.rainfall24hMm.toFixed(0)} mm</span>
                        <span className={`font-bold ${node.hourlyRainfallMm > 40 ? 'text-rose-400' : 'text-blue-400'}`}>
                          {node.hourlyRainfallMm > 40 ? 'Heavy' : 'Moderate'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Geotechnical Safety Factor & Pore Pressure */}
                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between gap-2 text-xs flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-slate-400 text-[11px]">Safety Factor:</span>
                      <span
                        className={`font-mono font-black text-xs px-2 py-0.5 rounded border ${
                          node.safetyFactor < 1.0
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800'
                            : node.safetyFactor < 1.3
                            ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                            : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        FS {node.safetyFactor.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-slate-400 text-[11px]">Pore Pressure:</span>
                      <span className="font-mono font-bold text-slate-100 text-xs">
                        {node.poreWaterPressureKpa.toFixed(1)} kPa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diagnostics Mode Details */}
                <div className="mt-3.5 pt-2.5 border-t border-[#142854]">
                  {isPhysical ? (
                    /* Physical ESP32 Hardware Diagnostics */
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        <span>RSSI: {node.rssiDbm ?? -68} dBm</span>
                      </div>
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Battery className="w-3 h-3 text-emerald-400" />
                        <span>{node.batteryVoltage ?? 3.92}V ({node.batteryPct ?? 88}%)</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 whitespace-nowrap">
                        <span>LoRa {node.loraFrequencyMhz ?? 865.2}MHz</span>
                      </div>
                    </div>
                  ) : (
                    /* Virtual AI Neural Model Diagnostics */
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1 text-cyan-300 font-semibold whitespace-nowrap">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>{node.pinnModelName ?? 'GeoPINN-NER-v4'}</span>
                      </div>
                      <span className="text-slate-300 whitespace-nowrap">
                        AI Conf: <strong className="text-cyan-400">{node.aiConfidencePct ?? 97.4}%</strong>
                      </span>
                      <span className="text-slate-400 whitespace-nowrap">Noise: {node.syntheticNoisePct ?? 1.2}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Actions: Unbreakable layout */}
              <div className="mt-4 pt-3 border-t border-[#142854] flex flex-wrap sm:flex-nowrap items-center justify-between gap-2">
                {onSelectNodeForInspection && (
                  <button
                    onClick={() => onSelectNodeForInspection(node)}
                    className="px-3 py-1.5 rounded-lg bg-[#0e224e] hover:bg-[#142f6d] text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-[#1b3a7a] whitespace-nowrap"
                  >
                    <span>Full Telemetry</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                  </button>
                )}

                {onTriggerSosForNode && (
                  <button
                    onClick={() => onTriggerSosForNode(node)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm border ${
                      isCritical
                        ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-950/50'
                        : 'bg-[#0e224e] hover:bg-[#142f6d] text-slate-200 border-[#1b3a7a]'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 text-rose-300" />
                    <span>Dispatch Warning SMS</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
