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
  ShieldAlert
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
    <div className="space-y-4 sm:space-y-6 w-full max-w-[1720px] mx-auto">
      {/* 1. TOP HERO DASHBOARD BANNER - EXACTLY AS SEEN IN SCREENSHOT */}
      <div className="rounded-2xl bg-gradient-to-b from-[#0e1d44] via-[#0b1738] to-[#070f26] border border-[#1b3470] p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3">
          {/* Status Badges Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0d2745] text-cyan-300 border border-cyan-500/40 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              AI SYSTEM ONLINE
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0e2c3a] text-teal-300 border border-teal-500/40 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              WEATHER LIVE
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#13244a] text-slate-300 border border-slate-600/60 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-75" />
              GIS DATA UPDATED 2 MIN AGO
            </span>
          </div>

          {/* Title & Operational Scope - Functional, Actionable, No Duplicate Brand Name */}
          <div className="mt-1 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-sans">
                Northeast India Multi-Hazard Command &amp; Early Warning Matrix
              </h1>
              <p className="text-xs sm:text-sm text-cyan-300/90 font-medium mt-1">
                Physics-Informed Geotechnical Stability (PINN) • Glacial Lake Outburst (GLOF) • River Basin Inundation
              </p>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Live multi-spectral slope deformation, pore-water pressure sensors, and automated zero-internet cellular evacuation sirens.
              </p>
            </div>

            {/* High-Value Rapid Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={onOpenSmsModal}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-950/60 flex items-center gap-2 cursor-pointer border border-rose-400/40 active:scale-95"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Trigger SMS Warning</span>
              </button>
              <button
                onClick={onOpenEscapeModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer border border-blue-400/40 active:scale-95"
              >
                <Navigation className="w-4 h-4 text-cyan-300" />
                <span>Evacuation Corridors</span>
              </button>
              <button
                onClick={onOpenEvidenceModal}
                className="px-3.5 py-2 rounded-xl bg-[#12234e] hover:bg-[#1a326c] border border-cyan-400/40 text-cyan-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Field Evidence ({evidenceList.length})</span>
              </button>
            </div>
          </div>

          {/* Operational Status and Active Focus Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-[#193268]/70">
            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Telemetry: IMD Doppler + InSAR SAR Interferometry</span>
              </div>
              <span className="text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Feed Stream Active</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-sans">Focus Geotechnical Zone:</span>
              <span className="font-bold text-cyan-300 px-2.5 py-1 rounded-lg bg-[#0d2250] border border-cyan-500/50 shadow-sm flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{activeStation?.name || 'Tawang Sela Pass'}</span>
                <span className="text-[10px] font-mono px-1 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                  FS {activeStation?.riskAssessment?.safetyFactor || '1.04'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 6 KPI METRIC CARDS ROW - HIGH CONTRAST COLORS, NO TEXT OVERFLOW */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* CARD 1: ACTIVE ALERTS */}
        <div
          onClick={() => onNavigate('alerts')}
          className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#240e1e] to-[#150712] border border-[#78183c] hover:border-rose-400/80 shadow-xl transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center gap-1 text-[11px] text-rose-300/90 font-medium truncate min-w-0 mb-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">{kpis.alertSubtitle || `high at ${activeStation?.name}`}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-rose-400 my-1 group-hover:scale-105 transition-transform origin-left">
            {kpis.activeAlerts}
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-200/90 mt-1 truncate">
            ACTIVE ALERTS
          </div>
        </div>

        {/* CARD 2: HIGH RISK ZONES */}
        <div
          onClick={() => onNavigate('risk_map')}
          className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#26170a] to-[#170c04] border border-[#85450e] hover:border-amber-400/80 shadow-xl transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center gap-1 text-[11px] text-amber-300/90 font-medium truncate min-w-0 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{kpis.zoneSubtitle || `within ${activeStation?.state}`}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400 my-1 group-hover:scale-105 transition-transform origin-left">
            {kpis.highRiskZones}
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-200/90 mt-1 truncate">
            HIGH RISK ZONES
          </div>
        </div>

        {/* CARD 3: LANDSLIDE RISK */}
        <div
          onClick={() => onNavigate('landslide')}
          className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#251f08] to-[#161203] border border-[#78590c] hover:border-yellow-400/80 shadow-xl transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center gap-1 text-[11px] text-yellow-300/90 font-medium truncate min-w-0 mb-1.5">
            <Flame className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="truncate">live model · {activeStation?.name || 'Tawang'}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-yellow-400 my-1 group-hover:scale-105 transition-transform origin-left">
            {kpis.landslideRiskPct}%
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-yellow-200/90 mt-1 truncate">
            LANDSLIDE RISK
          </div>
        </div>

        {/* CARD 4: FLOOD RISK */}
        <div
          onClick={() => onNavigate('flood')}
          className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#092238] to-[#041221] border border-[#0e7490] hover:border-cyan-400/80 shadow-xl transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center gap-1 text-[11px] text-cyan-300/90 font-medium truncate min-w-0 mb-1.5">
            <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">river trend · {activeStation?.name || 'Tawang'}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-cyan-400 my-1 group-hover:scale-105 transition-transform origin-left">
            {kpis.floodRiskPct}%
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-200/90 mt-1 truncate">
            FLOOD RISK
          </div>
        </div>

        {/* CARD 5: AFFECTED ROADS */}
        <div
          onClick={() => onNavigate('risk_map')}
          className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#1c1038] to-[#0e0721] border border-[#6b21a8] hover:border-purple-400/80 shadow-xl transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center gap-1 text-[11px] text-purple-300/90 font-medium truncate min-w-0 mb-1.5">
            <Navigation className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="truncate">{kpis.roadSubtitle || '5 blocked near here'}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-purple-400 my-1 group-hover:scale-105 transition-transform origin-left">
            {kpis.affectedRoads}
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-purple-200/90 mt-1 truncate">
            AFFECTED ROADS
          </div>
        </div>

        {/* CARD 6: VILLAGES AT RISK */}
        <div
          onClick={() => onNavigate('risk_map')}
          className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-b from-[#092622] to-[#031411] border border-[#0f766e] hover:border-teal-400/80 shadow-xl transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center gap-1 text-[11px] text-teal-300/90 font-medium truncate min-w-0 mb-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">{kpis.villageSubtitle || `${activeStation?.name} response area`}</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-teal-400 my-1 group-hover:scale-105 transition-transform origin-left">
            {kpis.villagesAtRisk}
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-teal-200/90 mt-1 truncate">
            VILLAGES AT RISK
          </div>
        </div>
      </div>

      {/* 3. 2-COLUMN MAIN WORKSPACE: MAP (LEFT) + AI RISK INTELLIGENCE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT: GIS Interactive Map Viewport (7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3">
          <div className="rounded-2xl bg-[#0a1738] border border-[#162e66] p-4 sm:p-5 shadow-2xl flex-1 flex flex-col min-h-[580px] lg:min-h-[680px]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[#162e66]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                  Interactive GIS Slope & Hazard Map
                </h3>
                <span className="text-xs text-slate-400 hidden sm:inline font-mono">
                  • 20 Stations • 4 Corridors
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenEvidenceModal}
                  className="px-3 py-1.5 rounded-xl bg-[#0f2452] hover:bg-[#15316e] text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Photo Evidence ({evidenceList.length})</span>
                </button>
                <button
                  onClick={() => onNavigate('risk_map')}
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer active:scale-95"
                >
                  Full Map View
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-[#18316c] relative min-h-[480px]">
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
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <div className="rounded-2xl bg-[#0a1738] border border-[#162e66] shadow-2xl flex-1 overflow-hidden">
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
