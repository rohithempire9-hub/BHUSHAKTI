import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  CloudRain,
  Droplets,
  Satellite,
  Mountain,
  Map,
  Clock,
  Users,
  Radio,
  Sliders,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  detectRiskContradictions,
  getEvidenceFusionReport
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const EvidenceContradictionFusionView: React.FC = () => {
  // Configurable sliders to demonstrate live contradiction detection
  const [rainfallVal, setRainfallVal] = useState<number>(88);
  const [soilMoistureVal, setSoilMoistureVal] = useState<number>(92);
  const [slopeVal, setSlopeVal] = useState<number>(38);
  const [satelliteVal, setSatelliteVal] = useState<number>(18);
  const [historyVal, setHistoryVal] = useState<number>(35);

  const contradiction = detectRiskContradictions(
    rainfallVal,
    soilMoistureVal,
    slopeVal,
    satelliteVal,
    historyVal
  );

  const fusion = getEvidenceFusionReport(null);

  const iconMap: Record<string, any> = {
    Satellite,
    CloudRain,
    Droplets,
    Mountain,
    Map,
    Clock,
    Users,
    Radio
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
            FEATURE 7 • CONTRADICTION DETECTOR
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
            FEATURE 10 • CROSS-VERIFICATION MATRIX
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
            FEATURE 17 • 8-SOURCE EVIDENCE FUSION
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Multi-Source Risk Contradiction & Evidence Fusion</span>
        </h2>
        <p className="text-xs text-slate-300 max-w-3xl mt-1">
          Compares all available intelligence streams (Doppler Radar, Soil Moisture Dielectric, Slope DEM, Historical Atlas, and Satellite InSAR). Automatically detects divergence and assigns explicit prediction confidence so commanders never act on blind or contradictory signals.
        </p>
      </div>

      {/* 2. Live Contradiction Detection Status Alert */}
      <div
        className={`p-5 rounded-2xl border transition-all shadow-xl ${
          contradiction.hasConflict
            ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/30'
            : 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {contradiction.hasConflict ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                {contradiction.conflictHeadline}
              </h3>
            </div>
            <p className="text-xs text-slate-200 max-w-3xl leading-relaxed">
              {contradiction.explanation}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-[#071330] p-3 rounded-xl border border-slate-700/80">
            <div className="text-center px-2 border-r border-slate-700">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Agreement Score</div>
              <div
                className={`text-xl font-mono font-black ${
                  contradiction.evidenceAgreementScorePct > 75 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {contradiction.evidenceAgreementScorePct}%
              </div>
            </div>
            <div className="text-center px-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Confidence</div>
              <div
                className={`text-xl font-mono font-black ${
                  contradiction.predictionConfidencePct > 70 ? 'text-cyan-300' : 'text-rose-400'
                }`}
              >
                {contradiction.predictionConfidencePct}%
              </div>
            </div>
            <div className="pl-2">
              <span
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border ${
                  contradiction.operationalStatus === 'FIELD_VERIFICATION_REQUIRED'
                    ? 'bg-amber-900/60 text-amber-300 border-amber-500/50'
                    : 'bg-emerald-900/60 text-emerald-300 border-emerald-500/50'
                }`}
              >
                {contradiction.operationalStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive Evidence Parameter Controls (Demonstrating What Causes Contradiction) */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Interactive Evidence Simulator</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Adjust signals to observe real-time contradiction calculation:
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          {/* Rainfall Slider */}
          <div className="p-3 rounded-xl bg-[#060f26] border border-slate-800">
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Rainfall</span>
              <span className="font-mono text-cyan-400">{rainfallVal} mm</span>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              value={rainfallVal}
              onChange={(e) => setRainfallVal(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">Doppler Radar / Gauges</div>
          </div>

          {/* Soil Moisture Slider */}
          <div className="p-3 rounded-xl bg-[#060f26] border border-slate-800">
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Soil Moisture</span>
              <span className="font-mono text-cyan-400">{soilMoistureVal}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={soilMoistureVal}
              onChange={(e) => setSoilMoistureVal(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">FDR / TDR Probe Array</div>
          </div>

          {/* Slope Angle */}
          <div className="p-3 rounded-xl bg-[#060f26] border border-slate-800">
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Slope Angle</span>
              <span className="font-mono text-cyan-400">{slopeVal}°</span>
            </div>
            <input
              type="range"
              min={15}
              max={55}
              value={slopeVal}
              onChange={(e) => setSlopeVal(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">12.5m ALOS DEM Gradient</div>
          </div>

          {/* Satellite Radar Movement */}
          <div className="p-3 rounded-xl bg-[#060f26] border border-slate-800">
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Satellite InSAR</span>
              <span className="font-mono text-cyan-400">{satelliteVal} mm/yr</span>
            </div>
            <input
              type="range"
              min={5}
              max={80}
              value={satelliteVal}
              onChange={(e) => setSatelliteVal(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">Sentinel-1 LOS Velocity</div>
          </div>

          {/* Historical Frequency */}
          <div className="p-3 rounded-xl bg-[#060f26] border border-slate-800">
            <div className="flex justify-between text-slate-300 font-bold mb-1">
              <span>Historical Risk</span>
              <span className="font-mono text-cyan-400">{historyVal}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={95}
              value={historyVal}
              onChange={(e) => setHistoryVal(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">GSI Past Landslide Atlas</div>
          </div>
        </div>
      </div>

      {/* 4. Cross-Verification Agreement Matrix (Feature 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Sensor-Satellite Cross-Verification Matrix</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Pairwise Correlation</span>
          </div>

          <div className="space-y-2">
            {contradiction.agreementMatrix.map((pair, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[#050e24] border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 text-slate-200 font-medium">
                  <span className="font-bold text-white">{pair.sourceA}</span>
                  <span className="text-slate-500">↔</span>
                  <span className="font-bold text-white">{pair.sourceB}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pair.status === 'ALIGNED'
                          ? 'bg-emerald-400'
                          : pair.status === 'DIVERGENT'
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${pair.correlationPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-slate-300 w-9 text-right font-bold">
                    {pair.correlationPct}%
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      pair.status === 'ALIGNED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : pair.status === 'DIVERGENT'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {pair.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 8-Source Evidence Fusion Overview (Feature 17) */}
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Evidence Fusion (8 Independent Sources)</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">
              {fusion.sourcesSupportingElevatedRisk} of {fusion.totalAvailableSources} Agree ({fusion.evidenceAgreementPct}%)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {fusion.sources.map((src) => {
              const Icon = iconMap[src.iconName] || Layers;
              return (
                <div
                  key={src.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                    src.supportsElevatedRisk
                      ? 'bg-[#091a3c] border-cyan-500/40 text-slate-200'
                      : 'bg-[#050e24] border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Icon className="w-4 h-4 text-cyan-300" />
                      <span className="text-[9px] font-mono text-slate-400">{src.weightPct}% Wt</span>
                    </div>
                    <div className="font-bold text-white text-[11px] truncate">{src.sourceType}</div>
                    <div className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-tight">
                      {src.findingSummary}
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-400">{src.freshness.split('(')[0]}</span>
                    <span
                      className={`font-bold ${
                        src.supportsElevatedRisk ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {src.supportsElevatedRisk ? 'HAZARD' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
