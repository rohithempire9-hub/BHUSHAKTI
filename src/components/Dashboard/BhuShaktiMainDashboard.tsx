import React from 'react';
import { LandslideStation } from '../../types/landslide';
import { SensingNodeDevice, RemoteVillagePin, HighwayRiskSegment, CitizenCrowdsourceReport } from '../../types/bhuShakti';
import { LandslideMap } from '../Map/LandslideMap';
import { AiRiskIntelligencePanel } from './AiRiskIntelligencePanel';
import {
  AlertTriangle,
  MapPin,
  Flame,
  Shield,
  Clock,
  Radio,
  ExternalLink,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Activity
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
  // Current active station or fallback to Tawang / first station
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

  // Station counts by risk level for the Risk Summary Cards
  const totalStations = stations.length;
  const criticalCount = stations.filter((s) => s.riskAssessment?.status === 'critical').length;
  const highCount = stations.filter((s) => s.riskAssessment?.status === 'high').length;
  const moderateCount = stations.filter((s) => s.riskAssessment?.status === 'moderate').length;
  const safeCount = stations.filter(
    (s) => s.riskAssessment?.status === 'safe' || s.riskAssessment?.status === 'low'
  ).length;

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-[1720px] mx-auto">
      {/* 1. RISK SUMMARY METRIC CARDS ROW - HIGH CONTRAST, LIGHT, WCAG COMPLIANT */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
        {/* CARD 1: TOTAL MONITORING STATIONS */}
        <div
          onClick={() => {
            setMapFilterStatus('all');
            onNavigate('risk_map');
          }}
          className="rounded-2xl p-3.5 bg-white border border-slate-200 border-l-4 border-l-blue-600 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">MONITORING STATIONS</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0 font-bold">
              NER
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 my-1 group-hover:text-blue-600 transition-colors truncate">
            {totalStations}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            Active telemetry nodes
          </div>
        </div>

        {/* CARD 2: SAFE STATIONS */}
        <div
          onClick={() => {
            setMapFilterStatus('low');
            onNavigate('risk_map');
          }}
          className="rounded-2xl p-3.5 bg-white border border-slate-200 border-l-4 border-l-emerald-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">SAFE</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 font-bold">
              FS &gt; 1.5
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-700 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {safeCount || 8}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            Low hazard equilibrium
          </div>
        </div>

        {/* CARD 3: MODERATE STATIONS */}
        <div
          onClick={() => {
            setMapFilterStatus('moderate');
            onNavigate('risk_map');
          }}
          className="rounded-2xl p-3.5 bg-white border border-slate-200 border-l-4 border-l-amber-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">MODERATE</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0 font-bold">
              Watch
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-700 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {moderateCount || 4}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            Pore creep watchlist
          </div>
        </div>

        {/* CARD 4: HIGH RISK STATIONS */}
        <div
          onClick={() => {
            setMapFilterStatus('high');
            onNavigate('risk_map');
          }}
          className="rounded-2xl p-3.5 bg-white border border-slate-200 border-l-4 border-l-orange-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-orange-800 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <AlertTriangle className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="truncate">HIGH RISK</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200 shrink-0 font-bold">
              FS 1.0–1.2
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-orange-600 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {highCount || 5}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            Slope warning active
          </div>
        </div>

        {/* CARD 5: CRITICAL STATIONS */}
        <div
          onClick={() => {
            setMapFilterStatus('critical');
            onNavigate('risk_map');
          }}
          className="rounded-2xl p-3.5 bg-white border border-slate-200 border-l-4 border-l-red-600 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-red-800 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <Flame className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span className="truncate">CRITICAL</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300 shrink-0 font-bold animate-pulse">
              FS &lt; 1.0
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-red-600 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {criticalCount || 3}
          </div>
          <div className="text-[10px] text-red-700/80 font-medium truncate">
            Immediate action zones
          </div>
        </div>

        {/* CARD 6: ACTIVE ALERTS */}
        <div
          onClick={() => onNavigate('alerts')}
          className="rounded-2xl p-3.5 bg-white border border-slate-200 border-l-4 border-l-rose-500 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-rose-800 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="truncate">ACTIVE ALERTS</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 shrink-0 font-bold">
              Live SOS
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-600 my-1 group-hover:scale-105 transition-transform origin-left truncate">
            {kpis.activeAlerts ?? 12}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            {kpis.alertSubtitle || `high at ${activeStation?.name || 'Tawang'}`}
          </div>
        </div>

        {/* CARD 7: CURRENT NODE FOCUS */}
        <div
          onClick={() => onNavigate('landslide')}
          className="rounded-2xl p-3.5 bg-white border border-slate-200 border-l-4 border-l-indigo-600 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-800 mb-1 min-w-0">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <Activity className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">FOCUS NODE</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0 font-bold">
              FS {activeStation?.riskAssessment?.safetyFactor ?? '1.04'}
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 my-1 group-hover:text-indigo-600 transition-colors truncate">
            {activeStation?.name || 'Tawang Sela'}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            Rain: {activeStation?.telemetry?.rainfall24hMm ?? 35}mm • VWC {activeStation?.telemetry?.soilMoisturePct ?? 68}%
          </div>
        </div>
      </div>

      {/* 2. 2-COLUMN MAIN WORKSPACE: MAP (LEFT) + AI RISK INTELLIGENCE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT: GIS Interactive Map Viewport */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 min-w-0">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex-1 flex flex-col min-h-[580px] lg:min-h-[680px] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans truncate">
                  Interactive GIS Slope &amp; Hazard Map
                </h3>
                <span className="text-xs text-slate-500 hidden sm:inline font-mono shrink-0">
                  • 20 Stations • 6 Safe Routes • 8 Hubs
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onOpenEvidenceModal}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">Photo Evidence ({evidenceList.length})</span>
                </button>
                <button
                  onClick={() => onNavigate('risk_map')}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  Full Map View
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-200 relative min-h-[480px]">
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

        {/* RIGHT: AI Risk Intelligence Panel */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col min-w-0">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs flex-1 overflow-hidden min-w-0">
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
