import React from 'react';
import { LandslideStation } from '../../types/landslide';
import { SensingNodeDevice, RemoteVillagePin, HighwayRiskSegment, CitizenCrowdsourceReport, BhuLanguage } from '../../types/bhuShakti';
import { TRANSLATIONS } from '../../utils/translations';
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
  currentLanguage?: BhuLanguage;
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
  currentLanguage = 'en',
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

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
      {/* 1. RISK SUMMARY METRIC CARDS ROW - COLORFUL ACCENTS, WHITE CARDS, SOFT SHADOWS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-3.5">
        {/* CARD 1: TOTAL MONITORING STATIONS (Blue) */}
        <div
          onClick={() => {
            setMapFilterStatus('all');
            onNavigate('risk_map');
          }}
          className="relative rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 mb-1 min-w-0 pt-0.5">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200/70 flex items-center justify-center shrink-0">
                <MapPin className="w-3 h-3 text-blue-600" />
              </div>
              <span className="truncate font-bold">{t.metricMonitoring}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shrink-0 font-bold">
              NER
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-blue-700 group-hover:scale-105 transition-transform truncate">
              {totalStations}
            </div>
            {/* Mini visual sparkline */}
            <div className="h-4 flex items-end gap-0.5 shrink-0 opacity-80">
              <span className="w-1 h-2 rounded-t bg-blue-300" />
              <span className="w-1 h-3 rounded-t bg-blue-400" />
              <span className="w-1 h-2.5 rounded-t bg-blue-500" />
              <span className="w-1 h-4 rounded-t bg-blue-600" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate flex items-center justify-between">
            <span>{t.activeIoTTelemetry}</span>
            <span className="text-blue-600 font-mono text-[9px] font-bold">100% UP</span>
          </div>
        </div>

        {/* CARD 2: SAFE STATIONS (Green) */}
        <div
          onClick={() => {
            setMapFilterStatus('low');
            onNavigate('risk_map');
          }}
          className="relative rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:shadow-emerald-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-900 mb-1 min-w-0 pt-0.5">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <div className="w-5 h-5 rounded-md bg-emerald-50 border border-emerald-200/70 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              </div>
              <span className="truncate font-bold">{t.metricSafe}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 font-bold">
              FS &gt; 1.5
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-700 group-hover:scale-105 transition-transform origin-left truncate">
              {safeCount || 8}
            </div>
            {/* Mini visual sparkline */}
            <div className="h-4 flex items-end gap-0.5 shrink-0 opacity-80">
              <span className="w-1 h-3 rounded-t bg-emerald-300" />
              <span className="w-1 h-3.5 rounded-t bg-emerald-400" />
              <span className="w-1 h-3 rounded-t bg-emerald-500" />
              <span className="w-1 h-3.5 rounded-t bg-emerald-600" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate flex items-center justify-between">
            <span>{t.factorOfSafetyStable}</span>
            <span className="text-emerald-700 font-mono text-[9px] font-bold">STABLE</span>
          </div>
        </div>

        {/* CARD 3: MODERATE STATIONS (Orange) */}
        <div
          onClick={() => {
            setMapFilterStatus('moderate');
            onNavigate('risk_map');
          }}
          className="relative rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:shadow-amber-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 mb-1 min-w-0 pt-0.5">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0">
                <Compass className="w-3 h-3 text-amber-600" />
              </div>
              <span className="truncate font-bold">{t.metricModerate}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shrink-0 font-bold">
              Watch
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-600 group-hover:scale-105 transition-transform origin-left truncate">
              {moderateCount || 4}
            </div>
            {/* Mini visual sparkline */}
            <div className="h-4 flex items-end gap-0.5 shrink-0 opacity-80">
              <span className="w-1 h-2 rounded-t bg-amber-300" />
              <span className="w-1 h-2.5 rounded-t bg-amber-400" />
              <span className="w-1 h-3.5 rounded-t bg-amber-500" />
              <span className="w-1 h-3 rounded-t bg-amber-600" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate flex items-center justify-between">
            <span>{t.increasedVibration}</span>
            <span className="text-amber-700 font-mono text-[9px] font-bold">CREEP</span>
          </div>
        </div>

        {/* CARD 4: HIGH RISK STATIONS (Red/Orange) */}
        <div
          onClick={() => {
            setMapFilterStatus('high');
            onNavigate('risk_map');
          }}
          className="relative rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:shadow-orange-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-600 to-red-500" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-orange-900 mb-1 min-w-0 pt-0.5">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <div className="w-5 h-5 rounded-md bg-orange-50 border border-orange-200/70 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
              </div>
              <span className="truncate font-bold">{t.metricHigh}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 shrink-0 font-bold">
              FS 1.0–1.2
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-orange-600 group-hover:scale-105 transition-transform origin-left truncate">
              {highCount || 5}
            </div>
            {/* Mini visual sparkline */}
            <div className="h-4 flex items-end gap-0.5 shrink-0 opacity-80">
              <span className="w-1 h-2 rounded-t bg-orange-300" />
              <span className="w-1 h-3 rounded-t bg-orange-400" />
              <span className="w-1 h-4 rounded-t bg-orange-500" />
              <span className="w-1 h-4.5 rounded-t bg-red-500" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate flex items-center justify-between">
            <span>{t.porePressureSurge}</span>
            <span className="text-orange-700 font-mono text-[9px] font-bold">ALERT</span>
          </div>
        </div>

        {/* CARD 5: CRITICAL STATIONS (Red/Pink) */}
        <div
          onClick={() => {
            setMapFilterStatus('critical');
            onNavigate('risk_map');
          }}
          className="relative rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:shadow-red-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-pink-500" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-red-900 mb-1 min-w-0 pt-0.5">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <div className="w-5 h-5 rounded-md bg-red-50 border border-red-200/70 flex items-center justify-center shrink-0">
                <Flame className="w-3 h-3 text-red-600" />
              </div>
              <span className="truncate font-bold">{t.metricCritical}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-red-100 text-red-800 border border-red-300 shrink-0 font-bold animate-pulse">
              FS &lt; 1.0
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-red-600 group-hover:scale-105 transition-transform origin-left truncate">
              {criticalCount || 3}
            </div>
            {/* Mini visual sparkline */}
            <div className="h-4 flex items-end gap-0.5 shrink-0 opacity-80">
              <span className="w-1 h-3 rounded-t bg-rose-400" />
              <span className="w-1 h-4 rounded-t bg-red-500" />
              <span className="w-1 h-5 rounded-t bg-red-600" />
              <span className="w-1 h-5 rounded-t bg-rose-600" />
            </div>
          </div>
          <div className="text-[10px] text-red-700/90 font-medium truncate flex items-center justify-between">
            <span>{t.immediateAction}</span>
            <span className="text-red-600 font-mono text-[9px] font-bold animate-pulse">SURGE</span>
          </div>
        </div>

        {/* CARD 6: ACTIVE SOS (Magenta) */}
        <div
          onClick={() => onNavigate('alerts')}
          className="relative rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:shadow-fuchsia-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-rose-400" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-fuchsia-900 mb-1 min-w-0 pt-0.5">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <div className="w-5 h-5 rounded-md bg-fuchsia-50 border border-fuchsia-200/70 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-3 h-3 text-fuchsia-600" />
              </div>
              <span className="truncate font-bold">{t.metricActiveSos}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 shrink-0 font-bold">
              Live SOS
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-fuchsia-600 group-hover:scale-105 transition-transform origin-left truncate">
              {kpis.activeAlerts ?? 12}
            </div>
            {/* Mini pulse bars */}
            <div className="h-4 flex items-end gap-0.5 shrink-0 opacity-80">
              <span className="w-1 h-3 rounded-t bg-fuchsia-400 animate-pulse" />
              <span className="w-1 h-4 rounded-t bg-pink-500 animate-pulse" />
              <span className="w-1 h-2 rounded-t bg-fuchsia-600 animate-pulse" />
              <span className="w-1 h-4.5 rounded-t bg-rose-500 animate-pulse" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate flex items-center justify-between">
            <span className="truncate">{kpis.alertSubtitle || `high at ${activeStation?.name || 'Tawang'}`}</span>
          </div>
        </div>

        {/* CARD 7: FOCUS NODE (Purple/Blue) */}
        <div
          onClick={() => onNavigate('landslide')}
          className="relative rounded-2xl p-3.5 bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:shadow-purple-500/10 transition-all duration-200 cursor-pointer group flex flex-col justify-between overflow-hidden hover:-translate-y-0.5 min-w-0"
        >
          {/* Top colored accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-purple-900 mb-1 min-w-0 pt-0.5">
            <span className="flex items-center gap-1.5 min-w-0 truncate">
              <div className="w-5 h-5 rounded-md bg-purple-50 border border-purple-200/70 flex items-center justify-center shrink-0">
                <Activity className="w-3 h-3 text-purple-600" />
              </div>
              <span className="truncate font-bold">{t.metricFocusNode}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 shrink-0 font-bold">
              FS {activeStation?.riskAssessment?.safetyFactor ?? '1.04'}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-1 my-1">
            <div className="text-lg sm:text-xl font-black text-purple-950 group-hover:text-purple-700 transition-colors truncate">
              {activeStation?.name || 'Tawang Sela'}
            </div>
            {/* Mini sparkline */}
            <div className="h-4 flex items-end gap-0.5 shrink-0 opacity-80">
              <span className="w-1 h-2 rounded-t bg-purple-300" />
              <span className="w-1 h-3 rounded-t bg-indigo-400" />
              <span className="w-1 h-2.5 rounded-t bg-blue-500" />
              <span className="w-1 h-3.5 rounded-t bg-purple-600" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            Rain: {activeStation?.telemetry?.rainfall24hMm ?? 35}mm • VWC {activeStation?.telemetry?.soilMoisturePct ?? 68}%
          </div>
        </div>
      </div>

      {/* 2. 2-COLUMN BALANCED WORKSPACE: MAP (APPROX 58% LEFT) + AI RISK INTELLIGENCE (APPROX 42% RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* LEFT: GIS Interactive Map Viewport (~58% desktop ratio) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-3 min-w-0">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex-1 flex flex-col min-h-[520px] lg:min-h-[600px] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-sans truncate">
                  {t.gisMapHeader}
                </h3>
                <span className="text-xs text-slate-500 hidden sm:inline font-mono shrink-0">
                  • 20 Stations • 6 Safe Routes • 8 Hubs
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Photo Evidence button: White button with blue border & blue icon */}
                <button
                  onClick={onOpenEvidenceModal}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50/50 text-blue-700 border border-blue-300 hover:border-blue-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{t.photoEvidence} ({evidenceList.length})</span>
                </button>
                {/* Full Map View: Strong blue gradient button */}
                <button
                  onClick={() => onNavigate('risk_map')}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  {t.fullMapView}
                </button>
              </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-200 relative min-h-[440px]">
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
                currentLanguage={currentLanguage}
              />
            </div>
          </div>
        </div>

        {/* RIGHT: AI Risk Intelligence Panel (~42% desktop ratio with more usable space) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col min-w-0">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-xs flex-1 overflow-hidden min-w-0">
            <AiRiskIntelligencePanel
              station={activeStation}
              currentLanguage={currentLanguage}
              onOpenSmsModal={onOpenSmsModal}
              onOpenEscapeModal={onOpenEscapeModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

