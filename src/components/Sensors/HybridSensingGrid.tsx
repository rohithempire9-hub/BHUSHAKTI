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
  ShieldAlert
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

  return (
    <div id="hybrid-sensing-grid-panel" className="flex flex-col h-full">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100 font-sans tracking-tight">
              Hybrid Sensing Grid Manager
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
              {nodes.length} Nodes Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time LoRa telemetry streaming with Physics-Informed Neural Network (PINN) virtual twins
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({nodes.length})
          </button>
          <button
            onClick={() => setActiveFilter('physical')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeFilter === 'physical'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Physical ESP32 ({nodes.filter((n) => n.mode === 'physical').length})
          </button>
          <button
            onClick={() => setActiveFilter('virtual')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeFilter === 'virtual'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Virtual AI ({nodes.filter((n) => n.mode === 'virtual').length})
          </button>
          <button
            onClick={() => setActiveFilter('critical')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activeFilter === 'critical'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Emergency ({nodes.filter((n) => n.riskLevel === 'emergency').length})
          </button>
        </div>
      </div>

      {/* Grid of Streaming Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 overflow-y-auto pr-0.5">
        {filteredNodes.map((node) => {
          const isPhysical = node.mode === 'physical';
          const isCritical = node.riskLevel === 'emergency';
          const isWarning = node.riskLevel === 'warning';
          const isSafe = node.riskLevel === 'low';
          const isCalibrating = calibratingNodeId === node.id;

          // Color psychology
          const badgeBg = isCritical
            ? 'bg-rose-500/15 text-rose-400 border-rose-500/40'
            : isWarning
            ? 'bg-amber-500/15 text-amber-400 border-amber-500/40'
            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40';

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
              className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-200 border ${
                isCritical
                  ? 'bg-gradient-to-b from-[#191427] to-[#0f172a] border-rose-500/60 shadow-lg shadow-rose-950/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
              }`}
            >
              {/* Top Node Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-100">
                        {node.nodeCode}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          isPhysical
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        }`}
                      >
                        {isPhysical ? 'Physical ESP32' : 'Virtual AI'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                      {node.locationName} • {node.state}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${badgeBg}`}
                  >
                    {isCritical ? 'Emergency' : isWarning ? 'Warning' : 'Stable'}
                  </span>
                </div>

                {/* Switch Mode Toggle Bar */}
                <div className="mb-3 p-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Sliders className="w-3 h-3 text-slate-400" />
                    <span className="font-medium">Node Operating Mode:</span>
                  </div>

                  <button
                    onClick={() => onToggleNodeMode(node.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                      isPhysical
                        ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500/50 hover:bg-emerald-600/40'
                        : 'bg-cyan-600/30 text-cyan-200 border-cyan-500/50 hover:bg-cyan-600/40'
                    }`}
                    title="Switch between Physical ESP32 / Virtual AI Mode"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    <span>
                      {isPhysical ? 'Switch to Virtual AI' : 'Switch to ESP32 Mode'}
                    </span>
                  </button>
                </div>

                {/* Real-time Telemetry Metrics */}
                <div className="space-y-2.5 text-xs">
                  {/* Soil Moisture Progress Bar & Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <Droplets className="w-3 h-3 text-cyan-400" />
                        Soil Moisture (VWC)
                      </span>
                      <span className="font-mono font-bold text-slate-100">
                        {node.soilMoisturePct.toFixed(1)}%
                        {node.soilMoisturePct > 80 && (
                          <span className="ml-1 text-[10px] text-rose-400 font-black">(&gt;80% Limit)</span>
                        )}
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${moistureBarColor}`}
                        style={{ width: `${Math.min(100, Math.max(0, node.soilMoisturePct))}%` }}
                      />
                    </div>

                    {/* Virtual Mode Interactive Calibration Slider */}
                    {!isPhysical && (
                      <div className="mt-1 flex items-center gap-2">
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
                          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                          title="Simulate soil moisture variance"
                        />
                        <span className="text-[9px] text-cyan-300 font-mono shrink-0">Simulate</span>
                      </div>
                    )}
                  </div>

                  {/* Dual Grid: Tilt Angle & Hourly Rainfall */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Tilt Angle */}
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="flex items-center gap-1">
                          <Compass className="w-2.5 h-2.5 text-amber-400" />
                          Inclinometer Tilt
                        </span>
                        <span className="font-bold text-slate-200">{node.tiltAngleDeg.toFixed(1)}°</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono">
                        <span>Disp: {(node.tiltAngleDeg * 0.45).toFixed(1)} cm</span>
                        <span className={node.tiltAngleDeg > 3.0 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          {node.tiltAngleDeg > 3.0 ? 'CRITICAL' : 'Normal'}
                        </span>
                      </div>
                    </div>

                    {/* Hourly Rainfall */}
                    <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="flex items-center gap-1">
                          <CloudRain className="w-2.5 h-2.5 text-blue-400" />
                          Rainfall Rate
                        </span>
                        <span className="font-bold text-slate-200">{node.hourlyRainfallMm.toFixed(0)} mm/h</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono">
                        <span>24h: {node.rainfall24hMm.toFixed(0)} mm</span>
                        <span className="text-blue-400">{node.hourlyRainfallMm > 40 ? 'Heavy' : 'Moderate'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Geotechnical Safety Factor & Pore Pressure */}
                  <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-slate-400 text-[10px]">Factor of Safety (FS): </span>
                      <span
                        className={`font-mono font-black ${
                          node.safetyFactor < 1.0
                            ? 'text-rose-400'
                            : node.safetyFactor < 1.3
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {node.safetyFactor.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px]">Pore Pressure: </span>
                      <span className="font-mono font-bold text-slate-200">
                        {node.poreWaterPressureKpa.toFixed(1)} kPa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diagnostics Mode Details */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                  {isPhysical ? (
                    /* Physical ESP32 Hardware Diagnostics */
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-emerald-400" />
                        <span>RSSI: {node.rssiDbm ?? -68} dBm</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Battery className="w-3 h-3 text-emerald-400" />
                        <span>{node.batteryVoltage ?? 3.92}V ({node.batteryPct ?? 88}%)</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-500">
                        <span>LoRa {node.loraFrequencyMhz ?? 865.2}MHz</span>
                      </div>
                    </div>
                  ) : (
                    /* Virtual AI Neural Model Diagnostics */
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <div className="flex items-center gap-1 text-cyan-300 font-semibold">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>{node.pinnModelName ?? 'GeoPINN-NER-v4'}</span>
                      </div>
                      <span className="text-slate-400">
                        AI Conf: <strong className="text-cyan-400">{node.aiConfidencePct ?? 97.4}%</strong>
                      </span>
                      <span className="text-slate-500">Noise: {node.syntheticNoisePct ?? 1.2}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Actions */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                {onSelectNodeForInspection && (
                  <button
                    onClick={() => onSelectNodeForInspection(node)}
                    className="text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Full Telemetry</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}

                {onTriggerSosForNode && (
                  <button
                    onClick={() => onTriggerSosForNode(node)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isCritical
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950/60'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Radio className="w-3 h-3" />
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
