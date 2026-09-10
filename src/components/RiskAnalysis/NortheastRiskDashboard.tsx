import React, { useState } from 'react';
import { LandslideStation } from '../../types/landslide';
import { auditStationSafety } from '../../services/safeZoneAuditor';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  ShieldCheck,
  AlertTriangle,
  Flame,
  Activity,
  Droplets,
  CloudRain,
  History,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  ExternalLink,
  Sliders,
  ChevronRight,
  Info
} from 'lucide-react';

interface NortheastRiskDashboardProps {
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  onInspectStation: (station: LandslideStation) => void;
  onOpenSmsModal: () => void;
  onOpenDisastersModal: () => void;
  onSyncLiveWeather: () => void;
  isSyncingWeather: boolean;
}

export const NortheastRiskDashboard: React.FC<NortheastRiskDashboardProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onInspectStation,
  onOpenSmsModal,
  onOpenDisastersModal,
  onSyncLiveWeather,
  isSyncingWeather,
}) => {
  const [activeChartMetric, setActiveChartMetric] = useState<'safetyFactor' | 'porePressure' | 'rainfall'>('safetyFactor');
  const [activeSubTab, setActiveSubTab] = useState<'graph' | 'safeAudit' | 'activeList'>('graph');

  // Currently focused station (defaults to selectedStation, or first critical station)
  const currentStation =
    selectedStation ||
    stations.find((s) => s.riskAssessment.status === 'critical') ||
    stations[0];

  // Run or retrieve the safe audit result
  const auditResult = currentStation ? auditStationSafety(currentStation) : null;

  // Categorize stations safely
  const criticalStations = stations.filter((s) => s.riskAssessment?.status === 'critical');
  const highStations = stations.filter((s) => s.riskAssessment?.status === 'high');
  const moderateStations = stations.filter((s) => s.riskAssessment?.status === 'moderate');
  const safeStations = stations.filter((s) => s.riskAssessment?.status === 'safe');

  // Prepare chart data for Northeast India places
  const chartData = stations.map((st) => ({
    id: st.id,
    name: (st.name ? st.name.split(' ')[0] : 'Station') + (st.name?.includes('NH-10') ? ' (NH10)' : ''),
    fullName: st.name ?? 'Monitoring Station',
    region: st.region ?? 'Northeast India',
    safetyFactor: st.riskAssessment?.safetyFactor ?? 1.5,
    riskScore: st.riskAssessment?.riskScore ?? 50,
    porePressureKpa: st.telemetry?.poreWaterPressureKpa ?? 15,
    soilMoisturePct: st.telemetry?.soilMoisturePct ?? 50,
    rainfall24hMm: st.telemetry?.rainfall24hMm ?? 0,
    erosionLiveMmH: st.telemetry?.erosionLiveMmH ?? 0.5,
    status: st.riskAssessment?.status ?? 'moderate',
    isSafe: st.riskAssessment?.status === 'safe',
    rawStation: st,
  }));

  const getBarColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#f43f5e'; // rose-500
      case 'high':
        return '#f97316'; // orange-500
      case 'moderate':
        return '#eab308'; // yellow-500
      case 'safe':
        return '#10b981'; // emerald-500
      default:
        return '#6366f1';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-5 shadow-2xl flex flex-col space-y-4">
      {/* 1. Header with Live Weather Sync & Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Northeast Risk & Safe Zone Telemetry
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              NE India (16 Places)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Original geological data, BIS 14458 safe zone declaration & live satellite telemetry
          </p>
        </div>

        {/* Live Weather Sync Action */}
        <button
          id="sync-real-weather-btn"
          onClick={onSyncLiveWeather}
          disabled={isSyncingWeather}
          title="Fetch original, non-static live weather observations for Northeast India"
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWeather ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isSyncingWeather ? 'Fetching Live Open-Meteo...' : 'Sync Live Weather'}</span>
        </button>
      </div>

      {/* 2. Active Risk vs Safe Areas Ratio Strip */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/30">
          <div className="text-xs font-bold text-rose-400 flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 animate-pulse" />
            Critical
          </div>
          <div className="text-lg font-black text-rose-300">{criticalStations.length}</div>
          <div className="text-[9px] text-slate-400">FS &lt; 1.05</div>
        </div>

        <div className="p-2 rounded-xl bg-orange-950/40 border border-orange-500/30">
          <div className="text-xs font-bold text-orange-400 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            High
          </div>
          <div className="text-lg font-black text-orange-300">{highStations.length}</div>
          <div className="text-[9px] text-slate-400">FS &lt; 1.35</div>
        </div>

        <div className="p-2 rounded-xl bg-yellow-950/30 border border-yellow-500/30">
          <div className="text-xs font-bold text-yellow-400 flex items-center justify-center gap-1">
            <Activity className="w-3 h-3" />
            Moderate
          </div>
          <div className="text-lg font-black text-yellow-300">{moderateStations.length}</div>
          <div className="text-[9px] text-slate-400">FS &lt; 1.75</div>
        </div>

        <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-sm shadow-emerald-900/30">
          <div className="text-xs font-black text-emerald-300 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            SAFE
          </div>
          <div className="text-lg font-black text-emerald-300">{safeStations.length}</div>
          <div className="text-[9px] text-emerald-400 font-bold">FS &ge; 1.80</div>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
        <button
          id="btn-subtab-graph"
          onClick={() => setActiveSubTab('graph')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'graph'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Real-Time Graph
        </button>
        <button
          id="btn-subtab-audit"
          onClick={() => setActiveSubTab('safeAudit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
            activeSubTab === 'safeAudit'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Declare Area Safe (BIS Audit)
        </button>
        <button
          id="btn-subtab-list"
          onClick={() => setActiveSubTab('activeList')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            activeSubTab === 'activeList'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Active Areas vs Safe ({stations.length})
        </button>
      </div>

      {/* SUB-VIEW 1: REAL-TIME COMPARATIVE GRAPH */}
      {activeSubTab === 'graph' && (
        <div className="space-y-3">
          {/* Graph Metric Selector */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold">Graph Metric:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveChartMetric('safetyFactor')}
                className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors ${
                  activeChartMetric === 'safetyFactor'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Factor of Safety (FS)
              </button>
              <button
                onClick={() => setActiveChartMetric('porePressure')}
                className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors ${
                  activeChartMetric === 'porePressure'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pore Pressure (kPa)
              </button>
              <button
                onClick={() => setActiveChartMetric('rainfall')}
                className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors ${
                  activeChartMetric === 'rainfall'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                24h Rain (mm)
              </button>
            </div>
          </div>

          {/* Recharts BarChart */}
          <div className="h-[210px] w-full bg-slate-950/70 rounded-xl p-2 border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    const raw = e.activePayload[0].payload.rawStation;
                    onSelectStation(raw);
                  }
                }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="font-bold text-white">{d.fullName}</div>
                          <div className="text-slate-400 text-[10px]">{d.region}</div>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-slate-300">Factor of Safety:</span>
                            <span
                              className={`font-black ${
                                d.safetyFactor >= 1.8
                                  ? 'text-emerald-400'
                                  : d.safetyFactor < 1.05
                                  ? 'text-rose-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {d.safetyFactor}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            Pore Pressure: <span className="font-mono text-cyan-400">{d.porePressureKpa} kPa</span>
                          </div>
                          <div className="text-[11px] text-slate-300">
                            24h Rain: <span className="font-mono text-blue-400">{d.rainfall24hMm} mm</span>
                          </div>
                          <div className="text-[10px] text-indigo-400 font-semibold pt-1">
                            Click bar to inspect station
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {activeChartMetric === 'safetyFactor' && (
                  <>
                    <ReferenceLine y={1.05} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Critical Failure (FS 1.05)', fill: '#f43f5e', fontSize: 8 }} />
                    <ReferenceLine y={1.75} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Safe Zone (FS 1.75)', fill: '#10b981', fontSize: 8 }} />
                    <Bar dataKey="safetyFactor" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                      ))}
                    </Bar>
                  </>
                )}
                {activeChartMetric === 'porePressure' && (
                  <>
                    <ReferenceLine y={15} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Safe < 15 kPa', fill: '#10b981', fontSize: 8 }} />
                    <ReferenceLine y={45} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Critical > 45 kPa', fill: '#f43f5e', fontSize: 8 }} />
                    <Bar dataKey="porePressureKpa" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </>
                )}
                {activeChartMetric === 'rainfall' && (
                  <Bar dataKey="rainfall24hMm" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              Emerald = Certified Safe Zone
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              Rose = Critical Active Hazard
            </span>
            <span>Click any bar to audit safety</span>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: GEOTECHNICAL SAFE ZONE AUDITOR */}
      {activeSubTab === 'safeAudit' && currentStation && auditResult && (
        <div className="space-y-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
          {/* Station selector */}
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-300">Station to Audit:</label>
            <select
              value={currentStation.id}
              onChange={(e) => {
                const target = stations.find((s) => s.id === e.target.value);
                if (target) onSelectStation(target);
              }}
              className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — {st.riskAssessment.status.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Audit Verification Banner */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              auditResult.isCertifiedSafe
                ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/50 border-rose-500/80 text-rose-200'
            }`}
          >
            {auditResult.isCertifiedSafe ? (
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-black text-sm flex items-center gap-2">
                {auditResult.isCertifiedSafe
                  ? 'OFFICIALLY DECLARED SAFE ZONE'
                  : 'UNSAFE: FAILS SAFE ZONE THRESHOLDS'}
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-300">
                  {auditResult.certificateId}
                </span>
              </div>
              <p className="text-[11px] mt-1 leading-relaxed opacity-90">
                {auditResult.geotechnicalNotes}
              </p>
            </div>
          </div>

          {/* Mathematical Criteria Checklist */}
          <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
            {auditResult.criteria.map((crit) => (
              <div
                key={crit.id}
                className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                  crit.isPassed
                    ? 'bg-slate-900/80 border-emerald-500/30 text-slate-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {crit.isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="font-semibold">{crit.title}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-white">{crit.measuredValue}</span>
                  <span className="text-[9px] text-slate-400 ml-1.5">({crit.requiredThreshold})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: ACTIVE RISK AREAS VS SAFE AREAS COMPARATIVE LIST */}
      {activeSubTab === 'activeList' && (
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Warning Areas ({criticalStations.length + highStations.length} Places)
          </div>
          {[...criticalStations, ...highStations].map((st) => (
            <div
              key={st.id}
              onClick={() => onSelectStation(st)}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-white">{st.name}</div>
                <div className="text-[10px] text-slate-400">{st.region}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-300 font-mono">
                  FS {st.riskAssessment.safetyFactor} | {st.telemetry.poreWaterPressureKpa} kPa
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    st.riskAssessment.status === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  }`}
                >
                  {st.riskAssessment.status}
                </span>
              </div>
            </div>
          ))}

          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider pt-2">
            Declared Safe Areas ({safeStations.length} Places)
          </div>
          {safeStations.map((st) => (
            <div
              key={st.id}
              onClick={() => onSelectStation(st)}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 hover:border-emerald-500/60 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div>
                <div className="text-xs font-bold text-white">{st.name}</div>
                <div className="text-[10px] text-slate-400">{st.region}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-emerald-300/80 font-mono">
                  FS {st.riskAssessment.safetyFactor} (Stable Bedrock)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  SAFE
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Natural Disaster History Teaser & Action Bar */}
      {currentStation && currentStation.disasterHistory && currentStation.disasterHistory.length > 0 && (
        <div className="p-3 bg-slate-950 border border-indigo-500/30 rounded-xl text-xs space-y-1.5">
          <div className="flex items-center justify-between text-indigo-300 font-bold">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-indigo-400" />
              Area History & Recorded Natural Disasters
            </span>
            <button
              id="view-all-disasters-btn"
              onClick={onOpenDisastersModal}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 cursor-pointer font-semibold"
            >
              View All History Archive ({currentStation.disasterHistory.length}+ Events)
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 font-semibold line-clamp-1">
            {currentStation.disasterHistory[0].eventTitle} ({currentStation.disasterHistory[0].year})
          </p>
          <p className="text-[10px] text-slate-400 line-clamp-2">
            {currentStation.disasterHistory[0].impactDescription}
          </p>
        </div>
      )}

      {/* 5. Bottom Quick Action Controls */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          id="trigger-sms-quick-btn"
          onClick={onOpenSmsModal}
          className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Emergency SMS Alert</span>
        </button>

        <button
          id="inspect-station-quick-btn"
          onClick={() => onInspectStation(currentStation)}
          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Deep Sensor Inspector</span>
        </button>
      </div>
    </div>
  );
};
