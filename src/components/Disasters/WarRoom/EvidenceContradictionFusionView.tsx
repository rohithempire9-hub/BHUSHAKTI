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
  ArrowRight,
  Camera,
  CheckSquare,
  Flame,
  Send,
  RotateCcw,
  Plane,
  Eye,
  FileCheck2
} from 'lucide-react';
import {
  detectRiskContradictions,
  getEvidenceFusionReport
} from '../../../services/bhuShaktiAdvancedIntelligence';
import { EVIDENCE_CONFLICT_RECORDS } from '../../../services/cascadeRiskEngine';

export const EvidenceContradictionFusionView: React.FC = () => {
  const [selectedConflictId, setSelectedConflictId] = useState<string>('conflict-01');
  const [droneDispatched, setDroneDispatched] = useState<boolean>(false);
  const [fieldVerified, setFieldVerified] = useState<boolean>(true);
  const [roadClosureEnforced, setRoadClosureEnforced] = useState<boolean>(false);

  // Configurable sliders to demonstrate live contradiction detection
  const [rainfallVal, setRainfallVal] = useState<number>(88);
  const [soilMoistureVal, setSoilMoistureVal] = useState<number>(94);
  const [slopeVal, setSlopeVal] = useState<number>(42);
  const [satelliteVal, setSatelliteVal] = useState<number>(8);
  const [historyVal, setHistoryVal] = useState<number>(75);

  const selectedConflict =
    EVIDENCE_CONFLICT_RECORDS.find((c) => c.id === selectedConflictId) || EVIDENCE_CONFLICT_RECORDS[0];

  const handleSelectConflictScenario = (conflictId: string) => {
    setSelectedConflictId(conflictId);
    if (conflictId === 'conflict-01') {
      setRainfallVal(88);
      setSoilMoistureVal(94);
      setSlopeVal(42);
      setSatelliteVal(8);
      setHistoryVal(75);
      setFieldVerified(true);
      setDroneDispatched(false);
      setRoadClosureEnforced(false);
    } else {
      setRainfallVal(110);
      setSoilMoistureVal(88);
      setSlopeVal(32);
      setSatelliteVal(12);
      setHistoryVal(62);
      setFieldVerified(false);
      setDroneDispatched(true);
      setRoadClosureEnforced(false);
    }
  };

  const handleSimulateSatelliteBlindspot = () => {
    setSatelliteVal(4);
    setSoilMoistureVal(98);
    setRainfallVal(115);
  };

  const handleHarmonizeSignals = () => {
    setRainfallVal(85);
    setSoilMoistureVal(82);
    setSlopeVal(36);
    setSatelliteVal(45);
    setHistoryVal(68);
  };

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
      {/* 0. INTERACTIVE SCENARIO COMMANDER - THE WHOLE SCENARIO IN YOUR HANDS */}
      <div className="rounded-2xl bg-gradient-to-r from-fuchsia-950/70 via-[#1c0828] to-[#0a183d] border-2 border-fuchsia-500/50 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-fuchsia-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-fuchsia-600 text-white uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                SCENARIO 5 ACTIVE: MULTI-SOURCE EVIDENCE CONFLICT & BAYESIAN FUSION
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                CRITICAL DISCREPANCY ARBITER
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Location: {selectedConflict.location}</span>
            </h1>
            <p className="text-xs text-fuchsia-200/90 mt-1 max-w-3xl">
              Satellite InSAR / Optical pass severely contradicts real-time Ground Patrol & Citizen telemetry. The system automatically weights field credibility, flags sensor divergence, and issues defensive orders.
            </p>
          </div>

          {/* Scenario Selector */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleSelectConflictScenario('conflict-01')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedConflictId === 'conflict-01'
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-900/50 border border-fuchsia-400'
                  : 'bg-[#0b1739] text-fuchsia-300 border border-fuchsia-500/30 hover:bg-[#150a2e]'
              }`}
            >
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Sela Km 44.2 (InSAR vs 45m Crack)</span>
            </button>

            <button
              onClick={() => handleSelectConflictScenario('conflict-02')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedConflictId === 'conflict-02'
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-900/50 border border-fuchsia-400'
                  : 'bg-[#0b1739] text-fuchsia-300 border border-fuchsia-500/30 hover:bg-[#150a2e]'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-300" />
              <span>2. Noney Tupul (Optical vs River Surge)</span>
            </button>
          </div>
        </div>

        {/* Interactive Actions in Commander's Hands */}
        <div className="mt-4 pt-3 border-t border-fuchsia-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-mono text-slate-300 font-bold uppercase">Actions in Your Hands:</span>
            <button
              onClick={handleSimulateSatelliteBlindspot}
              className="px-2.5 py-1 rounded-lg bg-[#0d1633] text-amber-300 hover:text-white border border-amber-500/40 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Satellite className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Satellite Blindspot (Heavy Cloud)</span>
            </button>

            <button
              onClick={() => setDroneDispatched((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                droneDispatched
                  ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400'
                  : 'bg-[#0d1633] text-cyan-300 border border-cyan-500/40 hover:bg-cyan-950/40'
              }`}
            >
              <Plane className="w-3.5 h-3.5 text-cyan-300" />
              <span>{droneDispatched ? 'Drone Recon Streaming Live ✓' : 'Task Aerial Drone Recon'}</span>
            </button>

            <button
              onClick={() => setRoadClosureEnforced((prev) => !prev)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                roadClosureEnforced
                  ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                  : 'bg-[#0d1633] text-rose-300 border border-rose-500/40 hover:bg-rose-950/40'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>{roadClosureEnforced ? 'Level-4 Road Closure Active ✓' : 'Enforce Level-4 Road Closure'}</span>
            </button>

            <button
              onClick={handleHarmonizeSignals}
              className="px-2 py-1 rounded-lg bg-[#0e1d44] text-slate-300 hover:text-white border border-slate-700 text-xs font-mono cursor-pointer transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Harmonize Signals</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-black border ${
                selectedConflict.conflictStatus === 'CRITICAL CONFLICT'
                  ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                  : 'bg-amber-950 text-amber-300 border-amber-500/50'
              }`}
            >
              {selectedConflict.conflictStatus}
            </span>
          </div>
        </div>
      </div>

      {/* 1. SIDE-BY-SIDE CONFLICT ARBITRATION MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stream A: Satellite Remote Sensing */}
        <div className="rounded-2xl bg-[#081533] border border-blue-500/30 p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-mono font-bold text-blue-300 uppercase">Stream A: Satellite InSAR / Optical</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30">
                Weight: 25%
              </span>
            </div>
            <div className="text-xs font-bold text-white mb-2">Spaceborne Telemetry</div>
            <p className="text-xs text-slate-300 bg-[#050e24] p-3 rounded-xl border border-slate-800 leading-relaxed mb-3">
              {selectedConflict.satelliteObservation}
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Sensor Source:</span>
                <span className="text-white">Sentinel-1 C-band SAR / Sentinel-2 MSI</span>
              </div>
              <div className="flex justify-between">
                <span>Limitation:</span>
                <span className="text-amber-400">Cloud attenuation & 6-12 day revisit lag</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated Velocity:</span>
                <span className="text-cyan-300">{satelliteVal} mm/yr Line-of-Sight</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Confidence:</span>
            <span className="font-mono font-bold text-amber-400">42% (Degraded by Obscuration)</span>
          </div>
        </div>

        {/* Center: System Bayesian Conflict Arbiter */}
        <div className="rounded-2xl bg-gradient-to-b from-[#110d29] to-[#081533] border-2 border-fuchsia-500/40 p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-fuchsia-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span className="text-xs font-mono font-bold text-fuchsia-300 uppercase">Bayesian Fusion Arbiter</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-950 text-fuchsia-300 border border-fuchsia-500/30">
                ACTIVE AI AUDIT
              </span>
            </div>

            <div className="text-center py-2">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Inter-Sensor Divergence</div>
              <div className="text-3xl font-mono font-black text-rose-400 mt-1">
                {100 - contradiction.evidenceAgreementScorePct}% DELTA
              </div>
              <div className="text-[11px] text-fuchsia-200 mt-1">
                Contradiction Detected: High Ground Saturation vs Low InSAR Velocity
              </div>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-[#050e24] border border-fuchsia-500/30 text-xs">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Executive Directive:</span>
              </div>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                {selectedConflict.systemActionDirective}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Protocol:</span>
              <span className="text-emerald-400 font-bold">Favor Ground Physical Over Latent Spaceborne</span>
            </div>
            {roadClosureEnforced && (
              <div className="p-2 rounded bg-rose-950/70 border border-rose-500/50 text-[10px] font-mono text-rose-200 text-center font-bold">
                HIGHWAY CLOSURE DIRECTIVE BROADCAST TO BRO & TRAFFIC POLICE
              </div>
            )}
          </div>
        </div>

        {/* Stream B: Ground Patrol & Citizen Report */}
        <div className="rounded-2xl bg-[#081533] border border-emerald-500/30 p-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-emerald-300 uppercase">Stream B: Field Patrol & IoT Array</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                Weight: 75%
              </span>
            </div>
            <div className="text-xs font-bold text-white mb-2">Tactical Ground Truth</div>
            <p className="text-xs text-slate-300 bg-[#050e24] p-3 rounded-xl border border-slate-800 leading-relaxed mb-3">
              {selectedConflict.fieldReportObservation}
            </p>
            <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Field Patrol:</span>
                <span className="text-emerald-300 font-bold">BRO Project Vartak Recon Team</span>
              </div>
              <div className="flex justify-between">
                <span>Verification:</span>
                <span className="text-cyan-300">Geo-tagged High-Res Photo (EXIF GPS Matched)</span>
              </div>
              <div className="flex justify-between">
                <span>Tension Crack Depth:</span>
                <span className="text-rose-400 font-bold">45m length × 12cm aperture</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Patrol Credibility:</span>
            <span className="font-mono font-bold text-emerald-400">96% (Physical Evidence Verified)</span>
          </div>
        </div>
      </div>

      {/* 2. LIVE CONTRADICTION DETECTION STATUS ALERT */}
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

      {/* 3. INTERACTIVE EVIDENCE PARAMETER CONTROLS */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Interactive Evidence Simulator (Live Signal Controls)</h3>
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
                className="p-3 rounded-xl bg-[#050e24] border border-slate-800 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white mb-0.5">
                    {pair.sourceA} vs {pair.sourceB}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Correlation analysis: {pair.status} relationship across sensor nodes
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      pair.status === 'ALIGNED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : pair.status === 'DIVERGENT'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {pair.status}
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">{pair.correlationPct}% Match</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 8-Source Evidence Fusion Breakdown (Feature 17) */}
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>8-Source Evidence Fusion (Feature 17)</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-300 font-bold">
              Agreement: {fusion.evidenceAgreementPct}% ({fusion.sourcesSupportingElevatedRisk}/{fusion.totalAvailableSources} Active)
            </span>
          </div>

          <div className="space-y-2">
            {fusion.sources.map((src) => {
              const IconComp = iconMap[src.iconName] || Radio;
              return (
                <div
                  key={src.id}
                  className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-[#0a183d] text-cyan-300">
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-[11px]">{src.sourceType}</div>
                      <div className="text-[10px] text-slate-400">{src.findingSummary}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-cyan-300 font-bold">{src.confidenceScore}% Conf</div>
                      <div className="text-[9px] text-slate-500">{src.weightPct}% Wt</div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        src.supportsElevatedRisk
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {src.status}
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
