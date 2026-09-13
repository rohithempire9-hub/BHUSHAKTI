import React, { useState } from 'react';
import { LandslideStation } from '../../types/landslide';
import {
  ArrowUpDown,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Droplets,
  Thermometer,
  Layers,
  TrendingUp,
  Activity,
  Compass,
  Zap,
  CheckCircle2,
  ChevronRight,
  Split,
  CloudRain,
  FileText,
  Check
} from 'lucide-react';

interface PlaceRiskMatrixProps {
  stations: LandslideStation[];
  selectedStation?: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  onTriggerSimulatedRain?: (stationId: string) => void;
  filterStatus?: string;
  onFilterChange?: (status: string) => void;
  onOpenInspectModal?: () => void;
  onOpenSmsModal?: () => void;
}

type SortField = 'risk' | 'safetyFactor' | 'erosion' | 'moisture' | 'porePressure' | 'temperature';

export const PlaceRiskMatrix: React.FC<PlaceRiskMatrixProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onTriggerSimulatedRain,
  onOpenInspectModal,
  onOpenSmsModal,
}) => {
  const [selectedPlaceAId, setSelectedPlaceAId] = useState<string>(selectedStation?.id || stations[0]?.id || '');
  const [selectedPlaceBId, setSelectedPlaceBId] = useState<string>(
    stations.find((s) => s.riskAssessment.status === 'safe')?.id || stations[18]?.id || stations[1]?.id || ''
  );
  const [simulatingStationId, setSimulatingStationId] = useState<string | null>(null);
  const [rainFeedback, setRainFeedback] = useState<string | null>(null);

  const handleSimulateRain = (stationId: string, stationName: string) => {
    setSimulatingStationId(stationId);
    if (onTriggerSimulatedRain) {
      onTriggerSimulatedRain(stationId);
    }
    setRainFeedback(`🌧️ Torrential monsoon storm (+40mm rain, +25% moisture) applied to ${stationName}! Factor of Safety recalculated.`);
    setTimeout(() => {
      setSimulatingStationId(null);
    }, 1200);
    setTimeout(() => {
      setRainFeedback(null);
    }, 5500);
  };

  // Sync selectedPlaceAId if selectedStation changes from outside
  React.useEffect(() => {
    if (selectedStation?.id) {
      setSelectedPlaceAId(selectedStation.id);
    }
  }, [selectedStation?.id]);
  const [sortField, setSortField] = useState<SortField>('risk');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [filterView, setFilterView] = useState<'all' | 'safe_only' | 'at_risk'>('all');

  const placeA = stations.find((s) => s.id === selectedPlaceAId) || stations[0];
  const placeB = stations.find((s) => s.id === selectedPlaceBId) || stations[1];

  // Sorting
  const sortedStations = [...stations].sort((a, b) => {
    let valA = 0;
    let valB = 0;
    switch (sortField) {
      case 'risk':
        valA = a.riskAssessment.riskScore;
        valB = b.riskAssessment.riskScore;
        break;
      case 'safetyFactor':
        valA = a.riskAssessment.safetyFactor;
        valB = b.riskAssessment.safetyFactor;
        break;
      case 'erosion':
        valA = a.telemetry.erosionRateMmPerYr;
        valB = b.telemetry.erosionRateMmPerYr;
        break;
      case 'moisture':
        valA = a.telemetry.soilMoisturePct;
        valB = b.telemetry.soilMoisturePct;
        break;
      case 'porePressure':
        valA = a.telemetry.poreWaterPressureKpa;
        valB = b.telemetry.poreWaterPressureKpa;
        break;
      case 'temperature':
        valA = a.telemetry.temperatureC;
        valB = b.telemetry.temperatureC;
        break;
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const displayStations = sortedStations.filter((s) => {
    if (filterView === 'safe_only') return s.riskAssessment.status === 'safe';
    if (filterView === 'at_risk') return s.riskAssessment.status !== 'safe';
    return true;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. PLACE-TO-PLACE COMPARATIVE RISK ANALYSIS (Side-by-Side) */}
      <div className="bg-[#101a30] border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 mb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm tracking-wider uppercase">
              <Split className="w-4 h-4" />
              Place-to-Place Geotechnical Differential Analysis
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Direct Risk Comparison Between Monitored Stations
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluate differences in temperature, soil erosion, moisture, and Factor of Safety across any two locations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Quick preset: Most Critical vs Most Safe
                const crit = stations.find((s) => s.riskAssessment.status === 'critical');
                const safe = stations.find((s) => s.riskAssessment.status === 'safe');
                if (crit && safe) {
                  setSelectedPlaceAId(crit.id);
                  setSelectedPlaceBId(safe.id);
                }
              }}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white border border-indigo-400/40 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Split className="w-3.5 h-3.5" />
              <span>Compare: Critical vs. Safe Baseline</span>
            </button>
          </div>
        </div>

        {/* Place Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Place A Selector */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Primary Location (A)
            </label>
            <select
              value={selectedPlaceAId}
              onChange={(e) => setSelectedPlaceAId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — {st.riskAssessment.status === 'safe' ? '[SAFE]' : `[${st.riskAssessment.status.toUpperCase()}: ${st.riskAssessment.riskScore}%]`}
                </option>
              ))}
            </select>
          </div>

          {/* Place B Selector */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Comparison Location (B)
            </label>
            <select
              value={selectedPlaceBId}
              onChange={(e) => setSelectedPlaceBId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — {st.riskAssessment.status === 'safe' ? '[SAFE]' : `[${st.riskAssessment.status.toUpperCase()}: ${st.riskAssessment.riskScore}%]`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Rain Simulation Toast Feedback */}
        {rainFeedback && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border border-cyan-400/60 shadow-xl shadow-cyan-950/50 flex items-center justify-between gap-3 text-cyan-200 text-xs font-semibold">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <CloudRain className="w-4 h-4 animate-bounce" />
              </span>
              <span>{rainFeedback}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] uppercase tracking-wider shrink-0">
              Live Recalculation Applied
            </span>
          </div>
        )}

        {/* Comparison Cards */}
        {placeA && placeB && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A */}
            <div
              className={`p-6 rounded-2xl border-2 transition-all shadow-2xl flex flex-col justify-between ${
                placeA.riskAssessment.status === 'safe'
                  ? 'bg-[#111c2e] border-emerald-500/50 shadow-emerald-950/30'
                  : placeA.riskAssessment.status === 'critical'
                  ? 'bg-[#1e131d] border-rose-500/50 shadow-rose-950/30'
                  : 'bg-[#131b2e] border-amber-500/40 shadow-amber-950/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 mb-1 inline-block">
                      Location A (Primary)
                    </span>
                    <h4 className="text-lg font-black text-white font-sans">{placeA.name}</h4>
                    <p className="text-xs text-slate-400">{placeA.region}, {placeA.country}</p>
                  </div>
                  {/* Safe zone requirement: show SAFE ONLY */}
                  {placeA.riskAssessment.status === 'safe' ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/60 flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      SAFE
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-1.5 border-2 ${
                        placeA.riskAssessment.status === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-rose-950/50'
                          : placeA.riskAssessment.status === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/60'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {placeA.riskAssessment.status} ({placeA.riskAssessment.riskScore}%)
                    </span>
                  )}
                </div>

                {/* Status Headline */}
                {placeA.riskAssessment.status === 'safe' ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200 mb-4 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="block font-bold text-emerald-300">Certified Stable Geotechnical Zone</strong>
                      Soil cohesion is high, pore pressure is negligible, and slope safety factor ({placeA.riskAssessment.safetyFactor}) far exceeds failure thresholds.
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-200 mb-4 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-rose-300 mb-0.5">Failure Probability: {placeA.riskAssessment.failureProbabilityPct}%</strong>
                      {placeA.riskAssessment.mlPredictionWindow}
                    </div>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-indigo-500/40 transition-colors">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                      Temperature
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {placeA.telemetry.temperatureC}°C
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-indigo-500/40 transition-colors">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      Soil Erosion Rate
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {placeA.telemetry.erosionRateMmPerYr} mm/yr
                      <span className="text-[10px] text-slate-400 block font-normal">
                        Live: {placeA.telemetry.erosionLiveMmH} mm/h
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-indigo-500/40 transition-colors">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      Soil Moisture
                    </div>
                    <div className="text-base font-bold text-white mt-1 flex items-center gap-2">
                      <span>{placeA.telemetry.soilMoisturePct}%</span>
                      {simulatingStationId === placeA.id && (
                        <span className="text-[10px] text-cyan-400 font-bold animate-pulse">+25%</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-indigo-500/40 transition-colors">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      Pore Pressure
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {placeA.telemetry.poreWaterPressureKpa} kPa
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-indigo-500/40 transition-colors">
                    <div className="text-slate-400">Slope Incline</div>
                    <div className="text-base font-bold text-white mt-1">
                      {placeA.slopeAngleDeg}°
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-indigo-500/40 transition-colors">
                    <div className="text-slate-400">Factor of Safety (FS)</div>
                    <div className={`text-base font-black mt-1 ${
                      placeA.riskAssessment.safetyFactor >= 1.5 ? 'text-emerald-400' : placeA.riskAssessment.safetyFactor >= 1.0 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {placeA.riskAssessment.safetyFactor}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-700/60 flex flex-wrap sm:flex-nowrap gap-2.5">
                <button
                  onClick={() => {
                    onSelectStation(placeA);
                    if (onOpenInspectModal) onOpenInspectModal();
                  }}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/40 text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Complete Station Details</span>
                </button>
                <button
                  onClick={() => handleSimulateRain(placeA.id, placeA.name)}
                  disabled={simulatingStationId === placeA.id}
                  title="Simulate Torrential Rainstorm Event"
                  className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.98] ${
                    simulatingStationId === placeA.id
                      ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/40 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-400/30 border border-cyan-200/60'
                  }`}
                >
                  <Droplets className={`w-3.5 h-3.5 ${simulatingStationId === placeA.id ? 'animate-bounce' : ''}`} />
                  <span>{simulatingStationId === placeA.id ? 'Raining (+40mm)...' : 'Simulate Rain'}</span>
                </button>
              </div>
            </div>

            {/* Card B */}
            <div
              className={`p-6 rounded-2xl border-2 transition-all shadow-2xl flex flex-col justify-between ${
                placeB.riskAssessment.status === 'safe'
                  ? 'bg-[#111c2e] border-emerald-500/50 shadow-emerald-950/30'
                  : placeB.riskAssessment.status === 'critical'
                  ? 'bg-[#1e131d] border-rose-500/50 shadow-rose-950/30'
                  : 'bg-[#131b2e] border-amber-500/40 shadow-amber-950/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 mb-1 inline-block">
                      Location B (Comparison)
                    </span>
                    <h4 className="text-lg font-black text-white font-sans">{placeB.name}</h4>
                    <p className="text-xs text-slate-400">{placeB.region}, {placeB.country}</p>
                  </div>
                  {/* Safe zone requirement: show SAFE ONLY */}
                  {placeB.riskAssessment.status === 'safe' ? (
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/60 flex items-center gap-1.5 shadow-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      SAFE
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-black uppercase flex items-center gap-1.5 border-2 ${
                        placeB.riskAssessment.status === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-rose-950/50'
                          : placeB.riskAssessment.status === 'high'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/60'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {placeB.riskAssessment.status} ({placeB.riskAssessment.riskScore}%)
                    </span>
                  )}
                </div>

                {/* Status Headline */}
                {placeB.riskAssessment.status === 'safe' ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-200 mb-4 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <strong className="block font-bold text-emerald-300">Certified Stable Geotechnical Zone</strong>
                      Soil cohesion is high, pore pressure is negligible, and slope safety factor ({placeB.riskAssessment.safetyFactor}) far exceeds failure thresholds.
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-200 mb-4 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold text-rose-300 mb-0.5">Failure Probability: {placeB.riskAssessment.failureProbabilityPct}%</strong>
                      {placeB.riskAssessment.mlPredictionWindow}
                    </div>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-cyan-500/40 transition-colors">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                      Temperature
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {placeB.telemetry.temperatureC}°C
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-cyan-500/40 transition-colors">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-rose-400" />
                      Soil Erosion Rate
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {placeB.telemetry.erosionRateMmPerYr} mm/yr
                      <span className="text-[10px] text-slate-400 block font-normal">
                        Live: {placeB.telemetry.erosionLiveMmH} mm/h
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-cyan-500/40 transition-colors">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                      Soil Moisture
                    </div>
                    <div className="text-base font-bold text-white mt-1 flex items-center gap-2">
                      <span>{placeB.telemetry.soilMoisturePct}%</span>
                      {simulatingStationId === placeB.id && (
                        <span className="text-[10px] text-cyan-400 font-bold animate-pulse">+25%</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-cyan-500/40 transition-colors">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                      Pore Pressure
                    </div>
                    <div className="text-base font-bold text-white mt-1">
                      {placeB.telemetry.poreWaterPressureKpa} kPa
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-cyan-500/40 transition-colors">
                    <div className="text-slate-400">Slope Incline</div>
                    <div className="text-base font-bold text-white mt-1">
                      {placeB.slopeAngleDeg}°
                    </div>
                  </div>

                  <div className="bg-[#1a243a] p-3 rounded-xl border border-slate-700/60 hover:border-cyan-500/40 transition-colors">
                    <div className="text-slate-400">Factor of Safety (FS)</div>
                    <div className={`text-base font-black mt-1 ${
                      placeB.riskAssessment.safetyFactor >= 1.5 ? 'text-emerald-400' : placeB.riskAssessment.safetyFactor >= 1.0 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {placeB.riskAssessment.safetyFactor}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-700/60 flex flex-wrap sm:flex-nowrap gap-2.5">
                <button
                  onClick={() => {
                    onSelectStation(placeB);
                    if (onOpenInspectModal) onOpenInspectModal();
                  }}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 border border-indigo-400/40 text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Complete Station Details</span>
                </button>
                <button
                  onClick={() => handleSimulateRain(placeB.id, placeB.name)}
                  disabled={simulatingStationId === placeB.id}
                  title="Simulate Torrential Rainstorm Event"
                  className={`py-2.5 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-[0.98] ${
                    simulatingStationId === placeB.id
                      ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/40 animate-pulse'
                      : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-cyan-400/30 border border-cyan-200/60'
                  }`}
                >
                  <Droplets className={`w-3.5 h-3.5 ${simulatingStationId === placeB.id ? 'animate-bounce' : ''}`} />
                  <span>{simulatingStationId === placeB.id ? 'Raining (+40mm)...' : 'Simulate Rain'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. COMPREHENSIVE 20-PLACE RISK ASSESSMENT TABLE */}
      <div className="bg-[#101a30] border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Comprehensive 20-Station Geotechnical Risk Table
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live sorted metrics for all monitored terrain zones. Safe zones strictly display "SAFE".
            </p>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-1.5 bg-[#0b1329] p-1.5 rounded-xl border border-slate-700/80 text-xs shadow-inner">
            <button
              onClick={() => setFilterView('all')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                filterView === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              All 20 Places
            </button>
            <button
              onClick={() => setFilterView('safe_only')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterView === 'safe_only'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/40'
                  : 'text-emerald-400 hover:text-white hover:bg-emerald-950/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe Only</span>
            </button>
            <button
              onClick={() => setFilterView('at_risk')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterView === 'at_risk'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 border border-rose-400/40'
                  : 'text-rose-400 hover:text-white hover:bg-rose-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>At Risk (Warning/Critical)</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Place & Region</th>
                <th
                  onClick={() => toggleSort('risk')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Risk Classification
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('safetyFactor')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Safety Factor (FS)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('temperature')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Temp (°C)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('erosion')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Soil Erosion (mm/yr)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('moisture')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Moisture (%)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('porePressure')}
                  className="py-3 px-3 cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    Pore Press. (kPa)
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayStations.map((station) => {
                const isSafe = station.riskAssessment.status === 'safe';
                return (
                  <tr
                    key={station.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isSafe ? 'bg-emerald-950/5' : station.riskAssessment.status === 'critical' ? 'bg-rose-950/10' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-medium">
                      <div className="text-white font-bold">{station.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {station.region} • {station.slopeAngleDeg}° slope
                      </div>
                    </td>

                    {/* Strict Safe Zone Rule: If safe, show "SAFE" ONLY */}
                    <td className="py-3 px-3">
                      {isSafe ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          SAFE
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold uppercase border ${
                            station.riskAssessment.status === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                              : station.riskAssessment.status === 'high'
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {station.riskAssessment.status} ({station.riskAssessment.riskScore}%)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold">
                      <span
                        className={
                          station.riskAssessment.safetyFactor >= 1.8
                            ? 'text-emerald-400'
                            : station.riskAssessment.safetyFactor >= 1.3
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }
                      >
                        {station.riskAssessment.safetyFactor}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {station.telemetry.temperatureC}°C
                    </td>

                    <td className="py-3 px-3 font-mono font-medium">
                      <span className={station.telemetry.erosionRateMmPerYr > 20 ? 'text-rose-400 font-bold' : ''}>
                        {station.telemetry.erosionRateMmPerYr} mm/y
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span>{station.telemetry.soilMoisturePct}%</span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              station.telemetry.soilMoisturePct > 70
                                ? 'bg-rose-500'
                                : station.telemetry.soilMoisturePct > 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${station.telemetry.soilMoisturePct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      {station.telemetry.poreWaterPressureKpa} kPa
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectStation(station);
                          if (onOpenInspectModal) onOpenInspectModal();
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
                        title="Inspect station telemetry & analytics"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
