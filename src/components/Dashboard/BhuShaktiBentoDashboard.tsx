import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Cpu,
  Radio,
  Camera,
  TrendingUp,
  SlidersHorizontal,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ShieldCheck,
  AlertTriangle,
  Flame,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import {
  SensingNodeDevice,
  RegisteredDeviceProfile,
  CitizenCrowdsourceReport,
  BhuLanguage
} from '../../types/bhuShakti';
import { LandslideStation } from '../../types/landslide';
import { LandslideMap } from '../Map/LandslideMap';
import { RainfallSaturationChart } from '../Analytics/RainfallSaturationChart';
import { HybridSensingNodeManagerCard } from './Cards/HybridSensingNodeManagerCard';
import { EmergencySmsConsoleCard } from './Cards/EmergencySmsConsoleCard';
import { CrowdsourcedFieldReportCard } from './Cards/CrowdsourcedFieldReportCard';
import { JudgeTestingSlidersCard } from './Cards/JudgeTestingSlidersCard';
import { HybridSensingGrid } from '../Sensors/HybridSensingGrid';
import { SmsEarlyWarningHub } from '../SMS/SmsEarlyWarningHub';
import { CitizenReportingPortal } from '../CitizenReports/CitizenReportingPortal';
import { BhuNavSection } from '../Navigation/BhuShaktiSidebar';
import { TRANSLATIONS } from '../../utils/translations';

export type BentoPageId = 'card-1' | 'card-2' | 'card-3' | 'card-4' | 'card-5' | 'card-6' | 'all';

interface BhuShaktiBentoDashboardProps {
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  sensingNodes: SensingNodeDevice[];
  onToggleNodeMode: (nodeId: string) => void;
  onUpdateNodeTelemetry: (nodeId: string, updates: Partial<SensingNodeDevice>) => void;
  registeredDevices: RegisteredDeviceProfile[];
  citizenReports: CitizenCrowdsourceReport[];
  onSubmitCitizenReport: (report: Omit<CitizenCrowdsourceReport, 'id' | 'timestamp'>) => void;
  onUpdateCitizenReportStatus?: (reportId: string, status: CitizenCrowdsourceReport['status']) => void;
  currentLanguage: BhuLanguage;
  onSimulateMassSos: () => void;
  currentSection: BhuNavSection;
  onOpenEvidenceModal: () => void;
  evidenceList?: any[];
  onReturnToBento?: () => void;
  // Dynamic Simulation Parameters for Judge interaction
  simulatedRainfall?: number;
  onSimulatedRainfallChange?: (val: number) => void;
  simulatedDisplacement?: number;
  onSimulatedDisplacementChange?: (val: number) => void;
  onResetSimulation?: () => void;
}

const PAGE_DEFINITIONS = [
  {
    id: 'card-1' as BentoPageId,
    pageNumber: 1,
    title: 'GIS Spatial Map Tracker',
    shortTitle: 'GIS Map',
    subtitle: 'Interactive geospatial monitoring across NH-10, NH-27, and NH-29 Northeast corridors',
    badge: 'Spatial Core',
    icon: MapPin,
    accentColor: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-400',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'card-2' as BentoPageId,
    pageNumber: 2,
    title: 'Hybrid Sensing Node Manager',
    shortTitle: 'Sensing Grid',
    subtitle: 'ESP32 IoT sensor telemetry & Physics-Informed Neural Network (PINN) digital twin',
    badge: 'Hardware Twin',
    icon: Cpu,
    accentColor: 'from-cyan-500 to-blue-600',
    iconColor: 'text-cyan-400',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  {
    id: 'card-3' as BentoPageId,
    pageNumber: 3,
    title: 'Dual-Axis Rainfall & Saturation Analytics',
    shortTitle: 'Rainfall Analytics',
    subtitle: 'Cumulative antecedent precipitation vs. real-time geotechnical soil saturation thresholds',
    badge: 'Hydro-Geology',
    icon: TrendingUp,
    accentColor: 'from-indigo-500 to-violet-600',
    iconColor: 'text-indigo-400',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
  {
    id: 'card-4' as BentoPageId,
    pageNumber: 4,
    title: 'Emergency SMS & Cell Broadcast Gateway',
    shortTitle: 'SMS Gateway',
    subtitle: 'Zero-internet offline CAP broadcast engine with multi-lingual emergency dispatching',
    badge: 'Civil Defense',
    icon: Radio,
    accentColor: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-400',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'card-5' as BentoPageId,
    pageNumber: 5,
    title: 'Crowdsourced Field Geoportal',
    shortTitle: 'Citizen Reports',
    subtitle: 'Community hazard dropzone with camera EXIF GPS verification & instant incident triage',
    badge: 'Public Intel',
    icon: Camera,
    accentColor: 'from-teal-500 to-emerald-600',
    iconColor: 'text-teal-400',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  },
  {
    id: 'card-6' as BentoPageId,
    pageNumber: 6,
    title: 'Scenario Testing & Simulation Bench',
    shortTitle: 'Simulation Bench',
    subtitle: 'Live stress testing controls perturbing rainfall, displacement, and catastrophic states',
    badge: 'Scenario Lab',
    icon: SlidersHorizontal,
    accentColor: 'from-purple-500 to-pink-600',
    iconColor: 'text-purple-400',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
];

export const BhuShaktiBentoDashboard: React.FC<BhuShaktiBentoDashboardProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  sensingNodes,
  onToggleNodeMode,
  onUpdateNodeTelemetry,
  registeredDevices,
  citizenReports,
  onSubmitCitizenReport,
  onUpdateCitizenReportStatus,
  currentLanguage,
  onSimulateMassSos,
  currentSection,
  onOpenEvidenceModal,
  evidenceList = [],
  onReturnToBento,
  simulatedRainfall = 25,
  onSimulatedRainfallChange = () => {},
  simulatedDisplacement = 0.8,
  onSimulatedDisplacementChange = () => {},
  onResetSimulation = () => {},
}) => {
  // Map sidebar section to initial page
  const sectionToPage = (section: BhuNavSection): BentoPageId => {
    switch (section) {
      case 'live_map': return 'card-1';
      case 'sensing_grid': return 'card-2';
      case 'risk_forecasts': return 'card-3';
      case 'sms_hub': return 'card-4';
      case 'citizen_reports': return 'card-5';
      default: return 'card-1';
    }
  };

  const [activePage, setActivePage] = useState<BentoPageId>(sectionToPage(currentSection));
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapFilterStatus, setMapFilterStatus] = useState<any>('all');
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Keep activePage synced if the user switches sidebar items
  useEffect(() => {
    setActivePage(sectionToPage(currentSection));
  }, [currentSection]);

  // Compute overall risk status derived from judge sliders
  const isCritical = simulatedRainfall > 75 || simulatedDisplacement > 4.5;
  const isWarning = !isCritical && (simulatedRainfall > 40 || simulatedDisplacement > 2.0);
  const simulatedRiskLevel: 'safe' | 'warning' | 'critical' = isCritical
    ? 'critical'
    : isWarning
    ? 'warning'
    : 'safe';

  // Navigation helpers
  const currentPageIndex = PAGE_DEFINITIONS.findIndex((p) => p.id === activePage);
  const currentDef = PAGE_DEFINITIONS[currentPageIndex] || PAGE_DEFINITIONS[0];

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setActivePage(PAGE_DEFINITIONS[currentPageIndex - 1].id);
    } else {
      setActivePage(PAGE_DEFINITIONS[PAGE_DEFINITIONS.length - 1].id);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < PAGE_DEFINITIONS.length - 1) {
      setActivePage(PAGE_DEFINITIONS[currentPageIndex + 1].id);
    } else {
      setActivePage(PAGE_DEFINITIONS[0].id);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#0a0f1d] text-slate-100">
      {/* 1. TOP DEDICATED PAGE TAB NAVIGATION BAR */}
      <div className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-700/80 px-4 sm:px-6 py-3 shadow-xl">
        <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Title & Page Indicator */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Dashboard Module Navigation
              </div>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span>{activePage === 'all' ? 'All Modules (Overview Grid)' : currentDef.title}</span>
                {activePage !== 'all' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Page {currentDef.pageNumber} of 6
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            {PAGE_DEFINITIONS.map((def) => {
              const Icon = def.icon;
              const isActive = activePage === def.id;

              return (
                <button
                  key={def.id}
                  onClick={() => setActivePage(def.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/35 border border-indigo-400/50 scale-[1.02]'
                      : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/70'
                  }`}
                  title={def.title}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : def.iconColor}`} />
                  <span>{def.shortTitle}</span>
                </button>
              );
            })}

            {/* Overview / All Cards Tab */}
            <button
              onClick={() => setActivePage('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activePage === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/35 border border-cyan-300/60 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/70'
              }`}
              title="View all 6 cards in unified grid"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-300" />
              <span>All Cards</span>
            </button>
          </div>

          {/* Quick Prev / Next Arrow Controls */}
          <div className="hidden xl:flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrevPage}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPage}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN CONTENT VIEWPORT */}
      <div className="flex-1 p-4 sm:p-6 max-w-[1720px] mx-auto w-full">
        {/* =========================================================================
            DEDICATED PAGE 1: GIS SPATIAL MAP TRACKER
            ========================================================================= */}
        {activePage === 'card-1' && (
          <div className="space-y-4">
            {/* Page Header Bar */}
            <div className="bg-[#121c33] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                      Module 01 • Geospatial Intelligence
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      LIVE CORRIDORS
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white font-sans">GIS Spatial Map Tracker</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Real-time monitoring across 20 stations in Sikkim, Assam, Meghalaya, Nagaland, and Mizoram corridors.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenEvidenceModal()}
                  className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-teal-600/30 border border-teal-400/40 text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Inspect Photo Evidence ({evidenceList.length})</span>
                </button>
                <button
                  onClick={handleNextPage}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Next: Sensing Grid</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dedicated Map Container with Expansive Full Height */}
            <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-4 shadow-2xl h-[720px] flex flex-col">
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
        )}

        {/* =========================================================================
            DEDICATED PAGE 2: HYBRID SENSING NODE MANAGER
            ========================================================================= */}
        {activePage === 'card-2' && (
          <div className="space-y-4">
            {/* Page Header Bar */}
            <div className="bg-[#121c33] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-inner">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Module 02 • Edge Telemetry
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      5 CLUSTERS ONLINE
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white font-sans">Hybrid Sensing Node Manager</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Physics-Informed Neural Network (PINN) digital twin & virtual ESP32 edge units.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSimulateMassSos}
                  className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black rounded-xl shadow-lg shadow-rose-600/30 border border-rose-400/40 text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Broadcast Cluster SOS</span>
                </button>
                <button
                  onClick={handleNextPage}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Next: Analytics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dedicated Node Grid Component */}
            <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 sm:p-6 shadow-2xl">
              <HybridSensingGrid
                nodes={sensingNodes}
                onToggleNodeMode={onToggleNodeMode}
                onUpdateNodeTelemetry={onUpdateNodeTelemetry}
                onTriggerSosForNode={() => onSimulateMassSos()}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            DEDICATED PAGE 3: DUAL-AXIS RAINFALL & SATURATION ANALYTICS
            ========================================================================= */}
        {activePage === 'card-3' && (
          <div className="space-y-4">
            {/* Page Header Bar */}
            <div className="bg-[#121c33] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-inner">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
                      Module 03 • Geotechnical Thresholds
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      ANTECEDENT RAIN
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white font-sans">Dual-Axis Rainfall & Saturation Analytics</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Live cross-correlation between 24-hour rainfall accumulation and critical soil pore saturation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActivePage('card-6')}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black rounded-xl shadow-lg shadow-cyan-400/30 border border-cyan-200/60 text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Adjust Test Sliders</span>
                </button>
                <button
                  onClick={handleNextPage}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Next: SMS Gateway</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dedicated Chart Component with Expansive Height */}
            <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 sm:p-6 shadow-2xl h-[680px]">
              <RainfallSaturationChart
                simulatedRainfall={simulatedRainfall}
                simulatedDisplacement={simulatedDisplacement}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            DEDICATED PAGE 4: EMERGENCY SMS & CELL BROADCAST GATEWAY
            ========================================================================= */}
        {activePage === 'card-4' && (
          <div className="space-y-4">
            {/* Page Header Bar */}
            <div className="bg-[#121c33] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                      Module 04 • Cell Broadcast Hub
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      OFFLINE CAP v1.2
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white font-sans">Emergency SMS Early Warning Hub</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Autonomous cell broadcast engine dispatching localized warnings to registered village headmen and rescue teams.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSimulateMassSos}
                  className="px-4 py-2.5 bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black rounded-xl shadow-lg shadow-rose-600/35 border border-rose-400/40 text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Simulate Mass SOS Alert</span>
                </button>
                <button
                  onClick={handleNextPage}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Next: Citizen Reports</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dedicated SMS Portal */}
            <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 sm:p-6 shadow-2xl">
              <SmsEarlyWarningHub
                registeredDevices={registeredDevices}
                currentLanguage={currentLanguage}
                onSimulateMassSos={onSimulateMassSos}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            DEDICATED PAGE 5: CROWDSOURCED FIELD REPORT INTAKE
            ========================================================================= */}
        {activePage === 'card-5' && (
          <div className="space-y-4">
            {/* Page Header Bar */}
            <div className="bg-[#121c33] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/40 shadow-inner">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                      Module 05 • Public Intel
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                      {citizenReports.length} REPORTS LOGGED
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white font-sans">Crowdsourced Disaster Reporting Geoportal</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Community reporting dropzone with EXIF geolocation extraction, photo evidence triage, and status review.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNextPage}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <span>Next: Testing Bench</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dedicated Citizen Reporting Portal */}
            <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 sm:p-6 shadow-2xl">
              <CitizenReportingPortal
                reports={citizenReports}
                onSubmitReport={onSubmitCitizenReport}
                onUpdateReportStatus={onUpdateCitizenReportStatus}
                currentLanguage={currentLanguage}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            DEDICATED PAGE 6: SCENARIO TESTING & SIMULATION BENCH
            ========================================================================= */}
        {activePage === 'card-6' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Page Header Bar */}
            <div className="bg-[#121c33] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 shadow-inner">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                      Module 06 • Stress Testing Bench
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isCritical ? 'CRITICAL TRIGGER' : isWarning ? 'WARNING TRIGGER' : 'NORMAL BENCH'}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white font-sans">Scenario Testing &amp; Simulation Sliders</h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Directly simulate monsoon storms and tectonic displacement to verify real-time alert cascade across all modules.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onResetSimulation}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 text-xs transition-all active:scale-95 cursor-pointer"
                >
                  Reset to Baseline
                </button>
                <button
                  onClick={() => setActivePage('card-1')}
                  className="px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  <span>View on GIS Map</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dedicated Sliders Box */}
            <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-6 sm:p-8 shadow-2xl">
              <JudgeTestingSlidersCard
                simulatedRainfall={simulatedRainfall}
                onSimulatedRainfallChange={onSimulatedRainfallChange}
                simulatedDisplacement={simulatedDisplacement}
                onSimulatedDisplacementChange={onSimulatedDisplacementChange}
                onResetSimulation={onResetSimulation}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            OVERVIEW GRID: ALL 6 MODULE CARDS (CLEAN & NON-CLUMSY)
            ========================================================================= */}
        {activePage === 'all' && (
          <div className="space-y-6">
            <div className="bg-[#121c33] border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Comprehensive System Overview
                </span>
                <h2 className="text-xl font-black text-white">All 6 BhuShakti Monitoring Blocks</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Click on any block or "Open Dedicated Page" to examine it in full-screen deep analytical mode.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Click any card below to open its dedicated page</span>
              </div>
            </div>

            {/* 3-Column Responsive Grid with Beautiful Distinct Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* CARD 1 */}
              <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between hover:border-emerald-500/50 transition-all h-[520px]">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Card Block 01</span>
                    <h3 className="text-base font-bold text-white">GIS Spatial Map Tracker</h3>
                    <p className="text-xs text-slate-400">NH-10/27/29 vulnerable corridors</p>
                  </div>
                  <button
                    onClick={() => setActivePage('card-1')}
                    className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-all"
                    title="Open Dedicated Page"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
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

                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">20 Monitored Stations</span>
                  <button
                    onClick={() => setActivePage('card-1')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-emerald-600/30"
                  >
                    <span>Open Dedicated Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 2 */}
              <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between hover:border-cyan-500/50 transition-all h-[520px]">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Card Block 02</span>
                    <h3 className="text-base font-bold text-white">Hybrid Sensing Node Manager</h3>
                    <p className="text-xs text-slate-400">Virtual ESP32 + Neural Network Twin</p>
                  </div>
                  <button
                    onClick={() => setActivePage('card-2')}
                    className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 cursor-pointer transition-all"
                    title="Open Dedicated Page"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <HybridSensingNodeManagerCard
                    nodes={sensingNodes}
                    onToggleNodeMode={onToggleNodeMode}
                    simulatedRainfall={simulatedRainfall}
                    simulatedDisplacement={simulatedDisplacement}
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">5 Clusters Active</span>
                  <button
                    onClick={() => setActivePage('card-2')}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-cyan-600/30"
                  >
                    <span>Open Dedicated Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 3 */}
              <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between hover:border-indigo-500/50 transition-all h-[520px]">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Card Block 03</span>
                    <h3 className="text-base font-bold text-white">Dual-Axis Rainfall Analytics</h3>
                    <p className="text-xs text-slate-400">Antecedent rain vs. soil saturation</p>
                  </div>
                  <button
                    onClick={() => setActivePage('card-3')}
                    className="p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 cursor-pointer transition-all"
                    title="Open Dedicated Page"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <RainfallSaturationChart
                    simulatedRainfall={simulatedRainfall}
                    simulatedDisplacement={simulatedDisplacement}
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">24-Hour Horizon</span>
                  <button
                    onClick={() => setActivePage('card-3')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-indigo-600/30"
                  >
                    <span>Open Dedicated Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 4 */}
              <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between hover:border-amber-500/50 transition-all h-[520px]">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Card Block 04</span>
                    <h3 className="text-base font-bold text-white">Emergency SMS Console</h3>
                    <p className="text-xs text-slate-400">Offline cell broadcast engine</p>
                  </div>
                  <button
                    onClick={() => setActivePage('card-4')}
                    className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 cursor-pointer transition-all"
                    title="Open Dedicated Page"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <EmergencySmsConsoleCard
                    devices={registeredDevices}
                    onSimulateMassSos={onSimulateMassSos}
                    simulatedRiskLevel={simulatedRiskLevel}
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{registeredDevices.length} Subscribers Registered</span>
                  <button
                    onClick={() => setActivePage('card-4')}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-amber-600/30"
                  >
                    <span>Open Dedicated Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 5 */}
              <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between hover:border-teal-500/50 transition-all h-[520px]">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">Card Block 05</span>
                    <h3 className="text-base font-bold text-white">Crowdsourced Field Reports</h3>
                    <p className="text-xs text-slate-400">Community photo dropzone & triage</p>
                  </div>
                  <button
                    onClick={() => setActivePage('card-5')}
                    className="p-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 cursor-pointer transition-all"
                    title="Open Dedicated Page"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <CrowdsourcedFieldReportCard
                    reports={citizenReports}
                    onSubmitReport={onSubmitCitizenReport}
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{citizenReports.length} Reports Logged</span>
                  <button
                    onClick={() => setActivePage('card-5')}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-teal-600/30"
                  >
                    <span>Open Dedicated Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* CARD 6 */}
              <div className="rounded-2xl bg-[#121c33] border border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between hover:border-purple-500/50 transition-all h-[520px]">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Card Block 06</span>
                    <h3 className="text-base font-bold text-white">Scenario Testing Sliders</h3>
                    <p className="text-xs text-slate-400">Dynamic hazard perturbation bench</p>
                  </div>
                  <button
                    onClick={() => setActivePage('card-6')}
                    className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 cursor-pointer transition-all"
                    title="Open Dedicated Page"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  <JudgeTestingSlidersCard
                    simulatedRainfall={simulatedRainfall}
                    onSimulatedRainfallChange={onSimulatedRainfallChange}
                    simulatedDisplacement={simulatedDisplacement}
                    onSimulatedDisplacementChange={onSimulatedDisplacementChange}
                    onResetSimulation={onResetSimulation}
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Rain: {simulatedRainfall}mm | Disp: {simulatedDisplacement}mm</span>
                  <button
                    onClick={() => setActivePage('card-6')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-purple-600/30"
                  >
                    <span>Open Dedicated Page</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
