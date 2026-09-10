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
  Split
} from 'lucide-react';

interface PlaceRiskMatrixProps {
  stations: LandslideStation[];
  onSelectStation: (station: LandslideStation) => void;
  onTriggerSimulatedRain: (stationId: string) => void;
}

type SortField = 'risk' | 'safetyFactor' | 'erosion' | 'moisture' | 'porePressure' | 'temperature';

export const PlaceRiskMatrix: React.FC<PlaceRiskMatrixProps> = ({
  stations,
  onSelectStation,
  onTriggerSimulatedRain,
}) => {
  const [selectedPlaceAId, setSelectedPlaceAId] = useState<string>(stations[0]?.id || '');
  const [selectedPlaceBId, setSelectedPlaceBId] = useState<string>(
    stations.find((s) => s.riskAssessment.status === 'safe')?.id || stations[18]?.id || stations[1]?.id || ''
  );
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
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
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
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Compare: Critical vs. Safe Baseline
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

        {/* Comparison Cards */}
        {placeA && placeB && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card A */}
            <div
              className={`p-5 rounded-xl border transition-all ${
                placeA.riskAssessment.status === 'safe'
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-950/30'
                  : placeA.riskAssessment.status === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/30'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-base font-bold text-white">{placeA.name}</h4>
                  <p className="text-xs text-slate-400">{placeA.region}, {placeA.country}</p>
                </div>
                {/* Safe zone requirement: show SAFE ONLY */}
                {placeA.riskAssessment.status === 'safe' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    SAFE
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase flex items-center gap-1 border ${
                      placeA.riskAssessment.status === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : placeA.riskAssessment.status === 'high'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {placeA.riskAssessment.status} ({placeA.riskAssessment.riskScore}%)
                  </span>
                )}
              </div>

              {/* Status Headline */}
              {placeA.riskAssessment.status === 'safe' ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-300 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">Stable Geotechnical Zone</strong>
                    Soil cohesion is high, pore pressure is negligible, and slope safety factor ({placeA.riskAssessment.safetyFactor}) far exceeds failure thresholds.
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 mb-4">
                  <strong className="block font-bold mb-0.5">Failure Probability: {placeA.riskAssessment.failureProbabilityPct}%</strong>
                  {placeA.riskAssessment.mlPredictionWindow}
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    Temperature
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeA.telemetry.temperatureC}°C
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                    Soil Erosion Rate
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeA.telemetry.erosionRateMmPerYr} mm/yr
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Live: {placeA.telemetry.erosionLiveMmH} mm/h
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    Soil Moisture
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeA.telemetry.soilMoisturePct}%
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Pore Pressure
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeA.telemetry.poreWaterPressureKpa} kPa
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">Slope Incline</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeA.slopeAngleDeg}°
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">Factor of Safety (FS)</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeA.riskAssessment.safetyFactor}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onSelectStation(placeA)}
                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors text-center"
                >
                  View Complete Station Details
                </button>
                <button
                  onClick={() => onTriggerSimulatedRain(placeA.id)}
                  title="Simulate Rainstorm Event"
                  className="py-1.5 px-3 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  Simulate Rain
                </button>
              </div>
            </div>

            {/* Card B */}
            <div
              className={`p-5 rounded-xl border transition-all ${
                placeB.riskAssessment.status === 'safe'
                  ? 'bg-emerald-950/20 border-emerald-500/40 shadow-emerald-950/30'
                  : placeB.riskAssessment.status === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-rose-950/30'
                  : 'bg-slate-950/80 border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-base font-bold text-white">{placeB.name}</h4>
                  <p className="text-xs text-slate-400">{placeB.region}, {placeB.country}</p>
                </div>
                {/* Safe zone requirement: show SAFE ONLY */}
                {placeB.riskAssessment.status === 'safe' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    SAFE
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-extrabold uppercase flex items-center gap-1 border ${
                      placeB.riskAssessment.status === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : placeB.riskAssessment.status === 'high'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {placeB.riskAssessment.status} ({placeB.riskAssessment.riskScore}%)
                  </span>
                )}
              </div>

              {/* Status Headline */}
              {placeB.riskAssessment.status === 'safe' ? (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-lg p-3 text-xs text-emerald-300 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">Stable Geotechnical Zone</strong>
                    Soil cohesion is high, pore pressure is negligible, and slope safety factor ({placeB.riskAssessment.safetyFactor}) far exceeds failure thresholds.
                  </div>
                </div>
              ) : (
                <div className="bg-rose-950/30 border border-rose-500/30 rounded-lg p-3 text-xs text-rose-300 mb-4">
                  <strong className="block font-bold mb-0.5">Failure Probability: {placeB.riskAssessment.failureProbabilityPct}%</strong>
                  {placeB.riskAssessment.mlPredictionWindow}
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    Temperature
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeB.telemetry.temperatureC}°C
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-rose-400" />
                    Soil Erosion Rate
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeB.telemetry.erosionRateMmPerYr} mm/yr
                    <span className="text-[10px] text-slate-400 block font-normal">
                      Live: {placeB.telemetry.erosionLiveMmH} mm/h
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    Soil Moisture
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeB.telemetry.soilMoisturePct}%
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Pore Pressure
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeB.telemetry.poreWaterPressureKpa} kPa
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">Slope Incline</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeB.slopeAngleDeg}°
                  </div>
                </div>

                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-slate-400">Factor of Safety (FS)</div>
                  <div className="text-sm font-bold text-white mt-1">
                    {placeB.riskAssessment.safetyFactor}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onSelectStation(placeB)}
                  className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors text-center"
                >
                  View Complete Station Details
                </button>
                <button
                  onClick={() => onTriggerSimulatedRain(placeB.id)}
                  title="Simulate Rainstorm Event"
                  className="py-1.5 px-3 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  Simulate Rain
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. COMPREHENSIVE 20-PLACE RISK ASSESSMENT TABLE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
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
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterView('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                filterView === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All 20 Places
            </button>
            <button
              onClick={() => setFilterView('safe_only')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterView === 'safe_only' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-emerald-950/30'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Safe Only
            </button>
            <button
              onClick={() => setFilterView('at_risk')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filterView === 'at_risk' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-rose-950/30'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              At Risk (Warning/Critical)
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
                        onClick={() => onSelectStation(station)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors"
                        title="Inspect station telemetry"
                      >
                        <ChevronRight className="w-4 h-4" />
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
