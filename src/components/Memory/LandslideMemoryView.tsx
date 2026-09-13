import React, { useState } from 'react';
import {
  INITIAL_SLOPE_REGISTRY,
  getDisasterFingerprint,
  computeWhyNowExplanation,
  getDataQualityScorecard
} from '../../services/landslideMemoryEngine';
import { SlopeMemoryRecord } from '../../types/sihIntelligence';
import { LandslideStation } from '../../types/landslide';
import {
  Brain,
  Layers,
  History,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BarChart3,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Search,
  Sparkles,
  RefreshCw,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface LandslideMemoryViewProps {
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  onOpenSimulation: () => void;
  onOpenWhatIf: () => void;
}

export const LandslideMemoryView: React.FC<LandslideMemoryViewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onOpenSimulation,
  onOpenWhatIf,
}) => {
  const [selectedSlopeId, setSelectedSlopeId] = useState<string>('TAW-042');
  const [showMatchModal, setShowMatchModal] = useState<boolean>(false);
  const [simulatedRainDelta, setSimulatedRainDelta] = useState<number>(0);

  const currentSlope =
    INITIAL_SLOPE_REGISTRY.find((s) => s.slopeId === selectedSlopeId) ||
    INITIAL_SLOPE_REGISTRY[0];

  const fingerprint = getDisasterFingerprint(currentSlope);
  const whyNow = computeWhyNowExplanation(selectedStation, simulatedRainDelta);
  const dataQuality = getDataQualityScorecard();

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-12">
      {/* 1. HEADER BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                SLOPE MEMORY ENGINE v3.2
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                AI PATTERN CORRELATION
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                DATA HEALTH: {dataQuality.confidenceGrade} ({dataQuality.overallConfidencePct}%)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">
              Landslide Memory &amp; Disaster Fingerprint Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-cyan-300/90 mt-1 max-w-3xl">
              Remembers historical geo-failures, matches multi-spectral environmental signatures, explains why risk escalated, and quantifies prediction certainty.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowMatchModal(true)}
              className="px-3.5 py-2 rounded-xl bg-[#13285c] hover:bg-[#1a3880] border border-cyan-400/40 text-cyan-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <History className="w-4 h-4 text-cyan-400" />
              <span>View Historical Event Match</span>
            </button>
            <button
              onClick={onOpenSimulation}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border border-blue-400/40 active:scale-95"
            >
              <Layers className="w-4 h-4 text-cyan-300" />
              <span>3D Digital Twin Simulation</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SLOPE ID SELECTOR STRIP */}
      <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-4 shadow-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Northeast Vulnerable Slope Registry (Unique Slope IDs)</span>
          </div>
          <span className="text-[11px] font-mono text-cyan-400/80">
            Click to compare live telemetry with historical failure conditions
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {INITIAL_SLOPE_REGISTRY.map((slope) => {
            const isSelected = selectedSlopeId === slope.slopeId;
            return (
              <button
                key={slope.slopeId}
                onClick={() => {
                  setSelectedSlopeId(slope.slopeId);
                  const matchedStation = stations.find((st) => st.id === slope.stationId);
                  if (matchedStation) onSelectStation(matchedStation);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#102a64] border-cyan-400 shadow-lg shadow-cyan-900/40 ring-1 ring-cyan-400'
                    : 'bg-[#0b1b42] border-[#18346e] hover:bg-[#0e2354] hover:border-cyan-500/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black font-mono text-cyan-300">{slope.slopeId}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                      slope.similarityScorePct >= 90
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {slope.similarityScorePct}% MATCH
                  </span>
                </div>
                <div className="text-[11px] font-bold text-white truncate">{slope.slopeName.split(' ')[0]} {slope.slopeName.split(' ')[1]}</div>
                <div className="text-[10px] text-slate-400 truncate">{slope.state}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DUAL COLUMN: DISASTER FINGERPRINT (LEFT) + "WHY NOW?" EXPLANATION (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: DISASTER FINGERPRINT RADAR & METRICS (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-2xl flex-1 flex flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#162e66]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <h3 className="text-base font-black text-white uppercase tracking-wider font-sans">
                    Disaster Fingerprint: Current vs Historical Event
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Slope ID: <strong className="text-cyan-300 font-mono">{currentSlope.slopeId}</strong> • Historical Failure:{' '}
                  <span className="text-amber-300 font-semibold">{currentSlope.historicalEventName} ({currentSlope.historicalDisasterYear})</span>
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-[#112456] border border-cyan-500/40 text-right">
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Pattern Match</span>
                <span className="text-lg font-black font-mono text-cyan-300">{fingerprint.overallSimilarityPct}%</span>
              </div>
            </div>

            {/* Radar / Comparative Visualizer */}
            <div className="my-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fingerprint.metrics}>
                    <PolarGrid stroke="#1e3a8a" />
                    <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={{ fontSize: 9 }} />
                    <Radar
                      name="Current Environmental Telemetry"
                      dataKey="currentValue"
                      stroke="#22d3ee"
                      fill="#06b6d4"
                      fillOpacity={0.45}
                    />
                    <Radar
                      name="Historical Failure Conditions"
                      dataKey="historicalValue"
                      stroke="#f59e0b"
                      fill="#d97706"
                      fillOpacity={0.25}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#091533', borderColor: '#1b3470', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Numerical Factor Comparison Table */}
              <div className="md:col-span-6 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Fingerprint Factor Comparison
                </div>
                {fingerprint.metrics.slice(0, 5).map((m) => (
                  <div key={m.name} className="p-2 rounded-lg bg-[#0b1b42] border border-[#152e66] text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Historical: {m.rawHistorical} {m.unit}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-cyan-300 font-bold block">{m.rawCurrent} {m.unit}</span>
                      <span className="text-[10px] text-emerald-400">
                        {Math.round(100 - Math.abs(m.currentValue - m.historicalValue))}% match
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verdict Explanation Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#170e28] to-[#0d1c42] border border-amber-500/40 text-xs text-slate-200 flex items-start gap-3 mt-auto">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 uppercase font-mono block text-[11px]">
                  AI Memory Diagnostic Verdict
                </span>
                <p className="mt-0.5 leading-relaxed text-slate-200">
                  {fingerprint.explanation}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {currentSlope.similarityFactors.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#11234e] text-cyan-300 border border-cyan-500/30"
                    >
                      {f.factor}: {f.matchPct}%
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: "WHY NOW?" EXPLAINABLE RISK ENGINE (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#162e66]">
              <div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-fuchsia-400" />
                  <h3 className="text-base font-black text-white uppercase tracking-wider font-sans">
                    "Why Now?" AI Engine
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Why did the risk escalate from yesterday?
                </p>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-400">Score:</span>
                <span className="text-rose-400 font-black px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40">
                  +{whyNow.deltaScore} pts
                </span>
              </div>
            </div>

            {/* Waterfall Contribution Bar Chart */}
            <div className="mt-4 mb-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Yesterday Risk Score: <strong className="text-slate-200 font-mono">{whyNow.previousRiskScore}/100</strong></span>
                <span className="text-rose-300 font-bold">Today: <strong className="text-rose-400 font-mono text-sm">{whyNow.currentRiskScore}/100</strong></span>
              </div>
              <div className="w-full h-3 rounded-full bg-[#0d2250] overflow-hidden flex">
                <div style={{ width: `${whyNow.previousRiskScore}%` }} className="bg-slate-500 h-full" title="Yesterday Baseline" />
                <div style={{ width: `${whyNow.deltaScore}%` }} className="bg-gradient-to-r from-amber-500 to-rose-500 h-full animate-pulse" title="24h Escalation Delta" />
              </div>
            </div>

            {/* Contribution Waterfall Breakdown */}
            <div className="space-y-2 my-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Factor Contribution Waterfall
              </div>
              {whyNow.contributions.map((c) => (
                <div
                  key={c.factor}
                  className="p-2.5 rounded-xl bg-[#0b1b42] border border-[#162e66] flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-200 truncate">{c.factor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Baseline {c.previousVal} → Current {c.currentVal}
                    </div>
                  </div>
                  <span className="font-mono font-black text-rose-400 shrink-0 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/40">
                    +{c.scoreContribution}
                  </span>
                </div>
              ))}
            </div>

            {/* Explainable AI Primary Diagnosis */}
            <div className="p-3.5 rounded-xl bg-[#0e1d44] border border-[#1b3874] text-xs text-slate-300 mt-auto">
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono uppercase text-[11px] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Explainable AI Synthesis</span>
              </div>
              <p className="leading-relaxed">
                {whyNow.primaryExplanation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PREDICTION CONFIDENCE & DATA QUALITY HEALTH MONITOR */}
      <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#162e66]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-black text-white uppercase tracking-wider font-sans">
                Prediction Confidence &amp; Data Health Monitor
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Never displays blind scores — every risk estimate is backed by sensor health and evidence certainty.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Model Certainty:</span>
            <span className="font-bold text-emerald-300 px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/40">
              Confidence = {dataQuality.overallConfidencePct}% [{dataQuality.confidenceGrade}]
            </span>
          </div>
        </div>

        {/* 6 Streams Health Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-4">
          {dataQuality.streams.map((stream) => (
            <div
              key={stream.streamName}
              className="p-3 rounded-xl bg-[#0b1a3e] border border-[#162e66] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stream.status === 'GREEN'
                        ? 'bg-emerald-400'
                        : stream.status === 'YELLOW'
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                      stream.status === 'GREEN'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : stream.status === 'YELLOW'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-rose-950 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {stream.statusLabel}
                  </span>
                </div>
                <div className="text-xs font-bold text-white leading-snug">{stream.streamName.split('(')[0]}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">{stream.freshnessText}</div>
              </div>
              <div className="text-[10px] text-slate-300/80 mt-2 pt-2 border-t border-[#142654] leading-tight">
                {stream.notes}
              </div>
            </div>
          ))}
        </div>

        {/* Data Limitation Notice */}
        <div className="mt-4 p-3 rounded-xl bg-[#0d1e47] border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{dataQuality.confidenceExplanation}</span>
          </div>
          <button
            onClick={onOpenWhatIf}
            className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shrink-0 transition-all cursor-pointer"
          >
            Simulate With Missing Streams
          </button>
        </div>
      </div>

      {/* 5. HISTORICAL EVENT DETAIL MODAL */}
      {showMatchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#091533] border border-[#1e3c7a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#18326a]">
              <div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                  Historical Incident Archive Match
                </span>
                <h2 className="text-lg font-black text-white">{currentSlope.historicalEventName} ({currentSlope.historicalDisasterYear})</h2>
              </div>
              <button
                onClick={() => setShowMatchModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 rounded bg-[#10234e]"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 my-4 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-[#0d1e47] border border-[#1a3875]">
                <strong className="text-white block mb-1">Geological &amp; Environmental Pre-Conditions:</strong>
                <p>{currentSlope.geologyType} • Elevation: {currentSlope.elevationM}m • Incline: {currentSlope.slopeAngleDeg}°</p>
                <p className="mt-1">
                  Historical Failure Threshold: Rainfall: {currentSlope.historicalRainfallMm} mm/24h • Soil Saturation: {currentSlope.historicalSoilMoisturePct}% • Creep: {currentSlope.historicalGroundMovementMm} mm/day.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200">
                <strong className="text-rose-300 block mb-1">Disaster Impact Consequence:</strong>
                <p>{currentSlope.historicalImpactDescription}</p>
                <p className="font-bold font-mono mt-1">Fatalities: {currentSlope.historicalFatalities}</p>
              </div>

              <div className="p-3 rounded-xl bg-[#0c1c42] border border-cyan-500/40">
                <strong className="text-cyan-300 block mb-1">Self-Learning Post-Disaster Takeaway:</strong>
                <p>
                  "Toe debuttressing from highway widening removed passive resistance. When rainfall exceeded 150mm over 48 hours, hydrostatic pore pressure triggered rotational slip. Real-time piezometers now alert at 65 kPa, giving 14 hours warning."
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#18326a]">
              <button
                onClick={() => setShowMatchModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
