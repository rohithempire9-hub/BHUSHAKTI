import React from 'react';
import { LandslideStation } from '../../types/landslide';
import { SensingNodeDevice, RemoteVillagePin, HighwayRiskSegment, CitizenCrowdsourceReport } from '../../types/bhuShakti';
import { LandslideMap } from '../Map/LandslideMap';
import { AiRiskIntelligencePanel } from './AiRiskIntelligencePanel';
import {
  AlertTriangle,
  MapPin,
  Flame,
  Waves,
  Navigation,
  Shield,
  Clock,
  Database,
  Radio,
  ExternalLink,
  ShieldAlert,
  CloudRain,
  Droplets,
  Wind,
  Compass
} from 'lucide-react';

interface BhuShaktiMainDashboardProps {
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  sensingNodes: SensingNodeDevice[];
  remoteVillages: RemoteVillagePin[];
  highwaySegments: HighwayRiskSegment[];
  citizenReports: CitizenCrowdsourceReport[];
  simulatedRainfall: number;
  simulatedDisplacement: number;
  simulatedRiskLevel: 'safe' | 'low' | 'warning' | 'high' | 'critical';
  onOpenSmsModal: () => void;
  onOpenEscapeModal: () => void;
  onOpenEvidenceModal: () => void;
  evidenceList: string[];
  mapFilterStatus: string;
  setMapFilterStatus: (status: string) => void;
  mapSearchQuery: string;
  setMapSearchQuery: (query: string) => void;
  onNavigate: (pageId: any) => void;
}

export const BhuShaktiMainDashboard: React.FC<BhuShaktiMainDashboardProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  sensingNodes,
  remoteVillages,
  highwaySegments,
  citizenReports,
  simulatedRainfall,
  simulatedDisplacement,
  simulatedRiskLevel,
  onOpenSmsModal,
  onOpenEscapeModal,
  onOpenEvidenceModal,
  evidenceList,
  mapFilterStatus,
  setMapFilterStatus,
  mapSearchQuery,
  setMapSearchQuery,
  onNavigate,
}) => {
  // Current active station or fallback to Tawang / first critical station
  const activeStation =
    selectedStation ||
    stations.find((s) => s.id === 'tawang-pass-01' || s.name.toLowerCase().includes('tawang')) ||
    stations[0];

  const kpis = activeStation?.kpis || {
    activeAlerts: 12,
    highRiskZones: 27,
    landslideRiskPct: 84,
    floodRiskPct: 54,
    affectedRoads: 18,
    villagesAtRisk: 42,
    alertSubtitle: `high at ${activeStation?.name || 'Tawang'}`,
    zoneSubtitle: `within ${activeStation?.state || 'Arunachal Pradesh'}`,
    roadSubtitle: '5 blocked near here',
    villageSubtitle: `${activeStation?.name || 'Tawang'} response area`,
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-[1720px] mx-auto">
      {/* 1. 7 KPI METRIC CARDS ROW - MODERN, COLORFUL, GLASS-EFFECT & MEANINGFUL ICONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
        {/* CARD 1: CURRENT RISK */}
        {(() => {
          const rawStatus = activeStation?.riskAssessment?.status || 'moderate';
          const isCritical = rawStatus === 'critical';
          const isHigh = rawStatus === 'high';
          const isMod = rawStatus === 'moderate';
          const statusLabel = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : isMod ? 'MODERATE' : 'LOW';
          const cardBg = isCritical
            ? 'from-rose-950/80 via-rose-900/40 to-slate-950/80 border-rose-500/60 hover:border-rose-400 text-rose-300 shadow-rose-950/40'
            : isHigh
            ? 'from-orange-950/80 via-orange-900/40 to-slate-950/80 border-orange-500/60 hover:border-orange-400 text-orange-300 shadow-orange-950/40'
            : isMod
            ? 'from-amber-950/80 via-amber-900/40 to-slate-950/80 border-amber-500/60 hover:border-amber-400 text-amber-300 shadow-amber-950/40'
            : 'from-emerald-950/80 via-emerald-900/40 to-slate-950/80 border-emerald-500/60 hover:border-emerald-400 text-emerald-300 shadow-emerald-950/40';
          const valueColor = isCritical
            ? 'text-rose-400'
            : isHigh
            ? 'text-orange-400'
            : isMod
            ? 'text-amber-400'
            : 'text-emerald-400';

          return (
            <div
              onClick={() => onNavigate('landslide')}
              className={`rounded-2xl p-3.5 bg-gradient-to-b ${cardBg} border backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0`}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold mb-1 min-w-0">
                <span className="flex items-center gap-1.5 min-w-0 truncate">
                  <Flame className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">CURRENT RISK</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/50 border border-white/10 shrink-0">
                  FS {activeStation?.riskAssessment?.safetyFactor ?? '1.04'}
                </span>
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono tracking-tight my-1 ${valueColor} group-hover:scale-105 transition-transform origin-left truncate`}>
                {statusLabel}
              </div>
              <div className="text-[10px] text-slate-300/80 font-medium truncate">
                {activeStation?.name || 'Monitored Node'}
              </div>
            </div>
          );
        })()}

        {/* CARD 2: RAINFALL (mm) */}
        <div
          onClick={() => onNavigate('weather')}
          className="rounded-2xl p-3.5 bg-gradient-to-b from-sky-950/75 via-sky-900/30 to-slate-950/80 border border-sky-500/50 hover:border-sky-400 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-sky-300 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <CloudRain className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">RAINFALL</span>
            </span>
            <span className="text-[10px] font-mono text-sky-200/80 shrink-0">24h Cumul</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-sky-400 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {activeStation?.telemetry?.rainfall24hMm !== undefined
              ? `${activeStation.telemetry.rainfall24hMm} mm`
              : '--'}
          </div>
          <div className="text-[10px] text-slate-300/80 font-medium truncate">
            Rate: {activeStation?.telemetry?.rainfallRateMmH ?? 0} mm/h
          </div>
        </div>

        {/* CARD 3: SOIL MOISTURE (%) */}
        <div
          onClick={() => onNavigate('landslide')}
          className="rounded-2xl p-3.5 bg-gradient-to-b from-indigo-950/75 via-indigo-900/30 to-slate-950/80 border border-indigo-500/50 hover:border-indigo-400 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <Droplets className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">SOIL MOISTURE</span>
            </span>
            <span className="text-[10px] font-mono text-indigo-200/80 shrink-0">VWC</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-indigo-300 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {activeStation?.telemetry?.soilMoisturePct !== undefined
              ? `${activeStation.telemetry.soilMoisturePct}%`
              : '--'}
          </div>
          <div className="text-[10px] text-slate-300/80 font-medium truncate">
            Pore: {activeStation?.telemetry?.poreWaterPressureKpa ?? 16} kPa
          </div>
        </div>

        {/* CARD 4: WIND SPEED (km/h) */}
        <div
          onClick={() => onNavigate('weather')}
          className="rounded-2xl p-3.5 bg-gradient-to-b from-teal-950/75 via-teal-900/30 to-slate-950/80 border border-teal-500/50 hover:border-teal-400 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-teal-300 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">WIND SPEED</span>
            </span>
            <span className="text-[10px] font-mono text-teal-200/80 shrink-0">Surface</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-teal-300 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {(activeStation?.telemetry as any)?.windSpeedKmh !== undefined
              ? `${(activeStation.telemetry as any).windSpeedKmh} km/h`
              : '--'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium truncate">
            {(activeStation?.telemetry as any)?.windSpeedKmh !== undefined
              ? 'Anemometer Active'
              : 'Data unavailable'}
          </div>
        </div>

        {/* CARD 5: SLOPE (degrees) */}
        <div
          onClick={() => onNavigate('risk_map')}
          className="rounded-2xl p-3.5 bg-gradient-to-b from-amber-950/75 via-amber-900/30 to-slate-950/80 border border-amber-500/50 hover:border-amber-400 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-300 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">SLOPE</span>
            </span>
            <span className="text-[10px] font-mono text-amber-200/80 shrink-0">Incline</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-400 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {activeStation?.slopeAngleDeg !== undefined
              ? `${activeStation.slopeAngleDeg}°`
              : '--'}
          </div>
          <div className="text-[10px] text-slate-300/80 font-medium truncate">
            Elev: {activeStation?.elevationM ?? 1200}m
          </div>
        </div>

        {/* CARD 6: ACTIVE ALERTS (count) */}
        <div
          onClick={() => onNavigate('alerts')}
          className="rounded-2xl p-3.5 bg-gradient-to-b from-rose-950/75 via-rose-900/30 to-slate-950/80 border border-rose-500/60 hover:border-rose-400 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-300 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">ACTIVE ALERTS</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/90 text-rose-300 border border-rose-500/40 shrink-0">Live</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-400 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {kpis.activeAlerts ?? 12}
          </div>
          <div className="text-[10px] text-rose-300/80 font-medium truncate">
            {kpis.alertSubtitle || `high at ${activeStation?.name || 'Tawang'}`}
          </div>
        </div>

        {/* CARD 7: AFFECTED AREAS (count) */}
        <div
          onClick={() => {
            setMapFilterStatus('high');
            onNavigate('risk_map');
          }}
          className="rounded-2xl p-3.5 bg-gradient-to-b from-orange-950/75 via-orange-900/30 to-slate-950/80 border border-orange-500/60 hover:border-orange-400 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-orange-300 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="truncate">AFFECTED AREAS</span>
            </span>
            <span className="text-[10px] font-mono text-orange-200/80 shrink-0">Hotspots</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-orange-400 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {kpis.highRiskZones ?? 27}
          </div>
          <div className="text-[10px] text-orange-300/80 font-medium truncate">
            {kpis.zoneSubtitle || `within ${activeStation?.state || 'Northeast'}`}
          </div>
        </div>
      </div>

      {/* 2. 2-COLUMN MAIN WORKSPACE: MAP (LEFT) + AI RISK INTELLIGENCE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT: GIS Interactive Map Viewport (7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 min-w-0">
          <div className="rounded-2xl bg-slate-900/65 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] flex-1 flex flex-col min-h-[580px] lg:min-h-[680px] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-white/10 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans truncate">
                  Interactive GIS Slope & Hazard Map
                </h3>
                <span className="text-xs text-slate-400 hidden sm:inline font-mono shrink-0">
                  • 20 Stations • 5 Safe Routes • 8 Hubs
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onOpenEvidenceModal}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Photo Evidence ({evidenceList.length})</span>
                </button>
                <button
                  onClick={() => onNavigate('risk_map')}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer active:scale-95"
                >
                  Full Map View
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/10 relative min-h-[480px]">
              <LandslideMap
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={onSelectStation}
                filterStatus={mapFilterStatus}
                onFilterChange={setMapFilterStatus}
                searchQuery={mapSearchQuery}
                onSearchChange={setMapSearchQuery}
                onOpenEvidenceModal={onOpenEvidenceModal}
                evidenceList={evidenceList}
                simulatedRiskLevel={simulatedRiskLevel}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: AI Risk Intelligence Panel (5 cols on lg, 4 on xl) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-w-0">
          <div className="rounded-2xl bg-slate-900/65 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] flex-1 overflow-hidden min-w-0">
            <AiRiskIntelligencePanel
              station={activeStation}
              onOpenSmsModal={onOpenSmsModal}
              onOpenEscapeModal={onOpenEscapeModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
