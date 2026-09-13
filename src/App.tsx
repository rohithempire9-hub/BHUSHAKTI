import React, { useEffect, useState } from 'react';
import {
  LandslideStation,
  SmsSubscriber,
  SmsAlertRecord,
  RiskStatus,
  DisasterEvidenceReport
} from './types/landslide';
import {
  SensingNodeDevice,
  RegisteredDeviceProfile,
  CitizenCrowdsourceReport,
  BhuLanguage
} from './types/bhuShakti';
import {
  INITIAL_SENSING_NODES,
  INITIAL_REGISTERED_DEVICES,
  INITIAL_CITIZEN_REPORTS
} from './data/bhuShaktiData';

import {
  initializeStations,
  updateStationTelemetry,
  getSubscribers,
  getAlertDispatches,
  getDisasterEvidence,
  subscribeToDisasterEvidence,
  subscribeToStations,
  isFirebaseAvailable
} from './services/firebase';

import { BhuShaktiHeader } from './components/Navigation/BhuShaktiHeader';
import { BhuShaktiSidebar, BhuNavSection } from './components/Navigation/BhuShaktiSidebar';
import { CriticalHazardBanner } from './components/Dashboard/CriticalHazardBanner';
import { BhuShaktiBentoDashboard } from './components/Dashboard/BhuShaktiBentoDashboard';
import { MassSosSimulationModal } from './components/SMS/MassSosSimulationModal';

import { LandslideMap } from './components/Map/LandslideMap';
import { PlaceRiskMatrix } from './components/RiskAnalysis/PlaceRiskMatrix';
import { StationDetailModal } from './components/Sensors/StationDetailModal';
import { SmsSystemModal } from './components/SMS/SmsSystemModal';
import { NortheastRiskDashboard } from './components/RiskAnalysis/NortheastRiskDashboard';
import { NaturalDisastersModal } from './components/Disasters/NaturalDisastersModal';
import { DisasterEvidenceModal } from './components/Evidence/DisasterEvidenceModal';
import { syncStationsWithRealWeather } from './services/realWeatherService';

import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Radio,
  MapPin,
  Flame,
  Compass,
  Database,
  Sliders,
  Info,
  History,
  Camera,
  Play,
  Pause,
  LayoutGrid,
  Table,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';

const REFRESH_INTERVAL_MS = 5000;

export default function App() {
  // Core Domain State
  const [stations, setStations] = useState<LandslideStation[]>([]);
  const [subscribers, setSubscribers] = useState<SmsSubscriber[]>([]);
  const [alertDispatches, setAlertDispatches] = useState<SmsAlertRecord[]>([]);
  const [evidenceList, setEvidenceList] = useState<DisasterEvidenceReport[]>([]);

  const [selectedStation, setSelectedStation] =
    useState<LandslideStation | null>(null);

  // BhuShakti IoT & Citizen Crowdsourced Portal State
  const [sensingNodes, setSensingNodes] = useState<SensingNodeDevice[]>(INITIAL_SENSING_NODES);
  const [registeredDevices, setRegisteredDevices] = useState<RegisteredDeviceProfile[]>(INITIAL_REGISTERED_DEVICES);
  const [citizenReports, setCitizenReports] = useState<CitizenCrowdsourceReport[]>(INITIAL_CITIZEN_REPORTS);

  // Layout & Navigation State
  const [currentLanguage, setCurrentLanguage] = useState<BhuLanguage>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [currentNavSection, setCurrentNavSection] = useState<BhuNavSection>('live_map');
  const [mainViewMode, setMainViewMode] = useState<
    'bento' | 'risk_matrix' | 'regional_overview' | 'telemetry_grid'
  >('bento');

  // Modals State
  const [massSosModalOpen, setMassSosModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [disastersModalOpen, setDisastersModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  const [prefilledSmsMessage, setPrefilledSmsMessage] =
    useState<string | null>(null);
  const [dismissedCriticalBanner, setDismissedCriticalBanner] = useState(false);

  // Sync state
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(true);
  const [isSyncingWeather, setIsSyncingWeather] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // Judge Simulation Interactive Testing State
  const [simulatedRainfall, setSimulatedRainfall] = useState<number>(25);
  const [simulatedDisplacement, setSimulatedDisplacement] = useState<number>(0.8);

  const handleResetSimulation = () => {
    setSimulatedRainfall(25);
    setSimulatedDisplacement(0.8);
    setDismissedCriticalBanner(false);
  };

  // ---------------------------------------------------------------------------
  // Keep selected zone synchronized with the latest Firestore station object.
  // ---------------------------------------------------------------------------
  const applyStations = (latestStations: LandslideStation[]) => {
    setStations(latestStations);

    setSelectedStation((currentSelected) => {
      if (!currentSelected) {
        return latestStations[0] ?? null;
      }

      const refreshed = latestStations.find(
        (station) => station.id === currentSelected.id
      );

      return refreshed ?? latestStations[0] ?? null;
    });

    setLastSyncTime(
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );
  };

  // ---------------------------------------------------------------------------
  // Initial loading & Real-time Listeners
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let unsubscribeEvidence: (() => void) | undefined;
    let unsubscribeStations: (() => void) | undefined;

    async function loadData() {
      try {
        const loadedStations = await initializeStations();

        if (cancelled) return;

        applyStations(loadedStations);

        const loadedSubs = await getSubscribers();
        if (!cancelled) setSubscribers(loadedSubs);

        const loadedDispatches = await getAlertDispatches();
        if (!cancelled) setAlertDispatches(loadedDispatches);

        const loadedEvidence = await getDisasterEvidence();
        if (!cancelled) setEvidenceList(loadedEvidence);

        unsubscribeEvidence = subscribeToDisasterEvidence((liveEvidence) => {
          if (!cancelled) {
            setEvidenceList(liveEvidence);
          }
        });

        unsubscribeStations = subscribeToStations((liveStations) => {
          if (!cancelled && liveStations.length > 0) {
            applyStations(liveStations);
          }
        });

        setFirebaseConnected(isFirebaseAvailable());
      } catch (error) {
        console.error('[BhuShakti] Initial data loading failed:', error);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
      unsubscribeEvidence?.();
      unsubscribeStations?.();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Sensor micro-fluctuation telemetry ticker for IoT Nodes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isLiveStreamActive) return;

    const interval = setInterval(() => {
      setSensingNodes((prevNodes) =>
        prevNodes.map((node) => {
          const moistureJitter = Number(((Math.random() - 0.49) * 0.3).toFixed(1));
          const tiltJitter = Number(((Math.random() - 0.5) * 0.05).toFixed(2));
          const newMoisture = Math.min(99, Math.max(25, Number((node.soilMoisturePct + moistureJitter).toFixed(1))));
          const newTilt = Math.max(0.2, Number((node.tiltAngleDeg + tiltJitter).toFixed(1)));
          const newRisk = newMoisture > 80 ? 'emergency' : newMoisture > 65 ? 'warning' : 'low';
          const newSafetyFactor = Number(Math.max(0.65, (2.2 - (newMoisture / 100) * 1.5 - (newTilt / 10) * 0.5)).toFixed(2));

          return {
            ...node,
            soilMoisturePct: newMoisture,
            tiltAngleDeg: newTilt,
            riskLevel: newRisk,
            safetyFactor: newSafetyFactor,
            lastPacketReceived: 'Just now',
          };
        })
      );

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLiveStreamActive]);

  // Toggle Physical ESP32 vs Virtual AI mode on a node
  const handleToggleNodeMode = (nodeId: string) => {
    setSensingNodes((prev) =>
      prev.map((node) => {
        if (node.id !== nodeId) return node;
        const newMode = node.mode === 'physical' ? 'virtual' : 'physical';
        return {
          ...node,
          mode: newMode,
          label: `${node.nodeCode} (${newMode === 'physical' ? 'Physical ESP32' : 'Virtual AI'})`,
        };
      })
    );
  };

  // Update telemetry for a node (e.g. from slider)
  const handleUpdateNodeTelemetry = (nodeId: string, updates: Partial<SensingNodeDevice>) => {
    setSensingNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
    );
  };

  // Submit crowdsourced citizen report
  const handleSubmitCitizenReport = (newReportData: Omit<CitizenCrowdsourceReport, 'id' | 'timestamp'>) => {
    const newReport: CitizenCrowdsourceReport = {
      ...newReportData,
      id: `cit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setCitizenReports((prev) => [newReport, ...prev]);
  };

  // Update status of a citizen report
  const handleUpdateCitizenReportStatus = (reportId: string, status: CitizenCrowdsourceReport['status']) => {
    setCitizenReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status } : r))
    );
  };

  // Station selection
  const selectStation = (station: LandslideStation | null) => {
    if (!station) return;
    setSelectedStation(station);
    setStations((previous) =>
      previous.map((item) =>
        item.id === station.id ? station : item
      )
    );
  };

  // Manual telemetry update from StationDetailModal
  const handleUpdateStationTelemetry = async (
    stationId: string,
    simulatedChanges: Partial<LandslideStation['telemetry']>
  ) => {
    const target = stations.find((station) => station.id === stationId);
    if (!target) return;

    try {
      const updated = await updateStationTelemetry(
        stationId,
        simulatedChanges,
        target
      );
      setStations((previous) =>
        previous.map((station) =>
          station.id === updated.id ? updated : station
        )
      );
      setSelectedStation(updated);
    } catch (error) {
      console.error('[BhuShakti] Station telemetry update failed:', error);
    }
  };

  // Simulate rainstorm event on a specific station
  const handleTriggerSimulatedRain = (stationId: string) => {
    const target = stations.find((s) => s.id === stationId);
    if (!target) return;
    const currentRainRate = target.telemetry?.rainfallRateMmH || 15;
    const currentRain24h = target.telemetry?.rainfall24hMm || 30;
    const currentMoisture = target.telemetry?.soilMoisturePct || 50;
    const currentPore = target.telemetry?.poreWaterPressureKpa || 35;
    void handleUpdateStationTelemetry(stationId, {
      rainfallRateMmH: Math.max(75, currentRainRate + 40),
      rainfall24hMm: Math.max(90, currentRain24h + 50),
      soilMoisturePct: Math.min(96, currentMoisture + 25),
      poreWaterPressureKpa: currentPore + 20,
    });
  };

  // Manual live weather synchronization
  const handleSyncLiveWeather = async () => {
    if (isSyncingWeather || stations.length === 0) return;
    setIsSyncingWeather(true);
    try {
      const updated = await syncStationsWithRealWeather(stations);
      applyStations(updated);
    } catch (error) {
      console.warn('[BhuShakti] Weather sync error:', error);
    } finally {
      setIsSyncingWeather(false);
    }
  };

  // Critical nodes evaluation for hazard banner & emergency detection
  const isJudgeEmergency = simulatedRainfall > 75 || simulatedDisplacement > 4.5;
  const criticalNodes = sensingNodes.filter(
    (n) => (n.soilMoisturePct > 80 && (n.tiltAngleDeg > 2.0 || n.riskLevel === 'emergency')) || isJudgeEmergency
  );

  const safeCount = stations.filter(
    (station) => station.riskAssessment?.status === 'safe'
  ).length;
  const moderateCount = stations.filter(
    (station) => station.riskAssessment?.status === 'moderate'
  ).length;
  const highCount = stations.filter(
    (station) => station.riskAssessment?.status === 'high'
  ).length;
  const criticalCount = stations.filter(
    (station) => station.riskAssessment?.status === 'critical'
  ).length;
  const totalPlaces = stations.length;

  const selectedTelemetry = selectedStation?.telemetry;
  const selectedRisk = selectedStation?.riskAssessment;

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-200 flex flex-col ${
        isDarkMode
          ? 'bg-[#0a0f1d] text-slate-100 selection:bg-indigo-500 selection:text-white'
          : 'bg-slate-100 text-slate-900 selection:bg-cyan-600 selection:text-white'
      }`}
    >
      {/* 1. TOP AUTHORITATIVE ENTERPRISE HEADER */}
      <BhuShaktiHeader
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onTriggerMassSos={() => setMassSosModalOpen(true)}
        activeAlertsCount={criticalNodes.length + criticalCount}
      />

      {/* View Switcher Sub-Header Bar */}
      <div className="border-b border-slate-700/80 bg-[#0b1329] px-4 sm:px-6 py-2.5 shadow-md sticky top-[60px] z-40">
        <div className="max-w-[1720px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Main View Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#10192e] rounded-xl border border-slate-700/80 shadow-inner">
            <button
              id="tab-bento-view"
              onClick={() => setMainViewMode('bento')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-sm ${
                mainViewMode === 'bento'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/35 border border-indigo-400/50 scale-[1.02]'
                  : 'bg-[#182338] text-slate-200 hover:text-white hover:bg-[#253554] border border-slate-700/80'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-300" />
              <span>Multi-Page Command Center</span>
            </button>

            <button
              id="tab-risk-matrix"
              onClick={() => setMainViewMode('risk_matrix')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-sm ${
                mainViewMode === 'risk_matrix'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/35 border border-emerald-400/50 scale-[1.02]'
                  : 'bg-[#182338] text-slate-200 hover:text-white hover:bg-[#253554] border border-slate-700/80'
              }`}
            >
              <Table className="w-3.5 h-3.5 text-emerald-300" />
              <span>16 NER Risk Matrix &amp; Simulator</span>
            </button>

            <button
              id="tab-regional-overview"
              onClick={() => setMainViewMode('regional_overview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-sm ${
                mainViewMode === 'regional_overview'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/35 border border-purple-400/50 scale-[1.02]'
                  : 'bg-[#182338] text-slate-200 hover:text-white hover:bg-[#253554] border border-slate-700/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-purple-300" />
              <span>Regional Vulnerability Hub</span>
            </button>

            <button
              id="tab-telemetry-grid"
              onClick={() => setMainViewMode('telemetry_grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer shadow-sm ${
                mainViewMode === 'telemetry_grid'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/35 border border-cyan-400/50 scale-[1.02]'
                  : 'bg-[#182338] text-slate-200 hover:text-white hover:bg-[#253554] border border-slate-700/80'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-300" />
              <span>Live Sensor Telemetry Grid</span>
            </button>
          </div>

          {/* Quick Action Badges & Live Status */}
          <div className="flex items-center gap-2.5">
            <button
              id="open-disasters-header-btn"
              onClick={() => setDisastersModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Disasters Archive (12)</span>
            </button>

            <button
              id="open-evidence-header-btn"
              onClick={() => setEvidenceModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 hover:from-rose-900 hover:to-amber-900 border border-rose-500/50 text-rose-200 hover:text-white transition-all shadow-md cursor-pointer font-bold"
            >
              <Camera className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Photo Evidence</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono">
                {evidenceList.length} Photos
              </span>
            </button>

            <button
              id="open-sms-system-btn"
              onClick={() => setSmsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-rose-950/50 transition-all cursor-pointer border border-rose-400/30"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Emergency SMS Gateway</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {subscribers.length} Registered
              </span>
            </button>

            <div
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10192e] border border-slate-700/80 text-[11px] text-slate-300 font-mono"
              title="Cloud Firestore sensor storage"
            >
              <Database className="w-3 h-3 text-cyan-400" />
              <span>Firestore:</span>
              <span className="text-emerald-400 font-bold">
                {firebaseConnected ? 'Synced' : 'Active'}
              </span>
            </div>

            <button
              onClick={() => setIsLiveStreamActive((value) => !value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs ${
                isLiveStreamActive
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Pause/resume live telemetry"
            >
              {isLiveStreamActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Pause className="w-3 h-3" />
                  Live ({lastSyncTime})
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Paused
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. CRITICAL HAZARD WARNING BANNER */}
      {!dismissedCriticalBanner && criticalNodes.length > 0 && (
        <div className="px-4 sm:px-6 pt-3 max-w-[1720px] mx-auto w-full">
          <CriticalHazardBanner
            criticalNodes={criticalNodes}
            onTriggerMassSos={() => setMassSosModalOpen(true)}
            onInspectNode={(_node) => {
              setMassSosModalOpen(true);
            }}
            onDismiss={() => setDismissedCriticalBanner(true)}
          />
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1720px] mx-auto w-full">
        {/* Authoritative Sidebar */}
        <BhuShaktiSidebar
          currentSection={currentNavSection}
          onSelectSection={(sec) => {
            setCurrentNavSection(sec);
            if (sec === 'risk_matrix') {
              setMainViewMode('risk_matrix');
            } else if (sec === 'historical_logs') {
              setDisastersModalOpen(true);
            } else {
              setMainViewMode('bento');
            }
          }}
          currentLanguage={currentLanguage}
          pendingReportsCount={citizenReports.filter((r) => r.status === 'Pending Review').length}
          activeCriticalNodesCount={criticalNodes.length}
          registeredDevicesCount={registeredDevices.length}
        />

        {/* Dynamic Center Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main View: Multi-Page Bento Command Center */}
          {mainViewMode === 'bento' && (
            <BhuShaktiBentoDashboard
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(st) => selectStation(st)}
              onInspectStation={(st) => {
                selectStation(st);
                setInspectModalOpen(true);
              }}
              sensingNodes={sensingNodes}
              onToggleNodeMode={handleToggleNodeMode}
              onUpdateNodeTelemetry={handleUpdateNodeTelemetry}
              registeredDevices={registeredDevices}
              citizenReports={citizenReports}
              onSubmitCitizenReport={handleSubmitCitizenReport}
              onUpdateCitizenReportStatus={handleUpdateCitizenReportStatus}
              currentLanguage={currentLanguage}
              onSimulateMassSos={() => setMassSosModalOpen(true)}
              currentSection={currentNavSection}
              onOpenEvidenceModal={() => setEvidenceModalOpen(true)}
              evidenceList={evidenceList}
              simulatedRainfall={simulatedRainfall}
              onSimulatedRainfallChange={setSimulatedRainfall}
              simulatedDisplacement={simulatedDisplacement}
              onSimulatedDisplacementChange={setSimulatedDisplacement}
              onResetSimulation={handleResetSimulation}
              onReturnToBento={() => setCurrentNavSection('overview')}
            />
          )}

          {/* Main View: 16 NER Risk Matrix & Simulator */}
          {mainViewMode === 'risk_matrix' && (
            <PlaceRiskMatrix
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(station) => {
                selectStation(station);
                setInspectModalOpen(true);
              }}
              onTriggerSimulatedRain={handleTriggerSimulatedRain}
              onOpenInspectModal={() => setInspectModalOpen(true)}
              onOpenSmsModal={() => setSmsModalOpen(true)}
            />
          )}

          {/* Main View: Regional Vulnerability Hub */}
          {mainViewMode === 'regional_overview' && (
            <NortheastRiskDashboard
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(station) => selectStation(station)}
              onInspectStation={(station) => {
                selectStation(station);
                setInspectModalOpen(true);
              }}
              onOpenSmsModal={() => setSmsModalOpen(true)}
              onOpenDisastersModal={() => setDisastersModalOpen(true)}
              onSyncLiveWeather={handleSyncLiveWeather}
              isSyncingWeather={isSyncingWeather}
            />
          )}

          {/* Main View: Live Sensor Telemetry Grid */}
          {mainViewMode === 'telemetry_grid' && (
            <div className="space-y-6">
              {/* STATUS CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                  onClick={() => setMainViewMode('risk_matrix')}
                  className="cursor-pointer bg-[#101a30] border border-emerald-500/40 hover:border-emerald-500 p-4 rounded-2xl shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      SAFE ZONES
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
                      Safe Only
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {safeCount}
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      / {totalPlaces}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-300 mt-1">
                    Low vulnerability • Factor of Safety ≥ 1.80
                  </div>
                </div>

                <div
                  onClick={() => setMainViewMode('risk_matrix')}
                  className="cursor-pointer bg-[#101a30] border border-amber-500/30 hover:border-amber-500/60 p-4 rounded-2xl shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      MODERATE ADVISORY
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300">
                      Yellow
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {moderateCount}
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      / {totalPlaces}
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-300/80 mt-1">
                    Elevated moisture & drainage inspection
                  </div>
                </div>

                <div
                  onClick={() => setMainViewMode('risk_matrix')}
                  className="cursor-pointer bg-[#101a30] border border-orange-500/30 hover:border-orange-500/60 p-4 rounded-2xl shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-orange-400 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      HIGH RISK WARNING
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-950/60 text-orange-300">
                      Orange
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {highCount}
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      / {totalPlaces}
                    </span>
                  </div>
                  <div className="text-[11px] text-orange-300/80 mt-1">
                    Shear strength degrading • Standby ready
                  </div>
                </div>

                <div
                  onClick={() => setMainViewMode('risk_matrix')}
                  className="cursor-pointer bg-[#101a30] border border-rose-500/40 hover:border-rose-500 p-4 rounded-2xl shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 animate-bounce" />
                      CRITICAL EVACUATION
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50">
                      Red Alert
                    </span>
                  </div>
                  <div className="text-3xl font-extrabold text-rose-400 font-mono">
                    {criticalCount}
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      / {totalPlaces}
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-300 mt-1 font-semibold">
                    FS &lt; 1.05 • Immediate automated SMS dispatch
                  </div>
                </div>
              </div>

              {/* SELECTED ZONE INPUTS */}
              {selectedStation && selectedTelemetry && selectedRisk && (
                <div className="bg-[#101a30] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                          Risk Analysis — Selected Zone
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Inputs are taken directly from the currently selected monitoring zone:{' '}
                        <span className="text-cyan-300 font-semibold">{selectedStation.name}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">
                        Current Risk
                      </div>
                      <div className="text-lg font-black uppercase text-white">
                        {selectedRisk.status}
                        <span className="text-cyan-300 ml-2 font-mono">
                          FS {selectedRisk.safetyFactor}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mt-4">
                    <RiskInput label="Temperature" value={`${selectedTelemetry.temperatureC} °C`} />
                    <RiskInput label="Soil Moisture" value={`${selectedTelemetry.soilMoisturePct} %`} />
                    <RiskInput label="Pore Pressure" value={`${selectedTelemetry.poreWaterPressureKpa} kPa`} />
                    <RiskInput label="24h Rainfall" value={`${selectedTelemetry.rainfall24hMm} mm`} />
                    <RiskInput label="Rainfall Rate" value={`${selectedTelemetry.rainfallRateMmH} mm/h`} />
                    <RiskInput label="Vibration" value={`${selectedTelemetry.vibrationMmS} mm/s`} />
                    <RiskInput label="Displacement" value={`${selectedTelemetry.displacementMm} mm`} />
                    <RiskInput label="Tilt" value={`${selectedTelemetry.tiltAngleDeg}°`} />
                  </div>

                  <div className="mt-3 text-[11px] text-slate-400">
                    Geotechnical parameters:{' '}
                    <span className="text-slate-200 ml-1">
                      slope {selectedStation.slopeAngleDeg}°, soil {selectedStation.soilType},
                      vegetation {selectedStation.vegetationCoverPct}%, fault distance {selectedStation.faultDistanceKm} km.
                    </span>
                  </div>
                </div>
              )}

              {/* Station Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    All {stations.length} Northeast India Monitored Sensor Stations
                  </h3>
                  <span className="text-xs text-slate-400">
                    Click any station card to inspect telemetry &amp; geotechnical details
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {stations.map((station) => {
                    const isSafe = station.riskAssessment?.status === 'safe';
                    const isSelected = selectedStation?.id === station.id;

                    return (
                      <div
                        key={station.id}
                        onClick={() => {
                          selectStation(station);
                          setInspectModalOpen(true);
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all bg-[#101a30] hover:scale-[1.01] ${
                          isSelected
                            ? 'border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                            : isSafe
                            ? 'border-emerald-500/30 hover:border-emerald-500'
                            : station.riskAssessment?.status === 'critical'
                            ? 'border-rose-500/40 hover:border-rose-500'
                            : 'border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white truncate">
                              {station.name}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {station.region}, {station.country}
                            </p>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-extrabold uppercase border shrink-0 ${
                              isSafe
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                : station.riskAssessment?.status === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                                : station.riskAssessment?.status === 'high'
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            }`}
                          >
                            {isSafe
                              ? 'SAFE'
                              : `${station.riskAssessment?.status} (${station.riskAssessment?.riskScore}%)`}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs my-3 bg-[#080d1a] p-2.5 rounded-xl border border-slate-800/80">
                          <TelemetryItem
                            label="Temperature"
                            value={`${station.telemetry.temperatureC}°C`}
                          />
                          <TelemetryItem
                            label="Soil Moisture"
                            value={`${station.telemetry.soilMoisturePct}%`}
                          />
                          <TelemetryItem
                            label="Pore Pressure"
                            value={`${station.telemetry.poreWaterPressureKpa} kPa`}
                          />
                          <TelemetryItem
                            label="24h Rain"
                            value={`${station.telemetry.rainfall24hMm} mm`}
                          />
                          <TelemetryItem
                            label="Vibration"
                            value={`${station.telemetry.vibrationMmS} mm/s`}
                          />
                          <TelemetryItem
                            label="Displacement"
                            value={`${station.telemetry.displacementMm} mm`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span>Slope: {station.slopeAngleDeg}°</span>
                          <span className="font-mono font-bold text-indigo-300">
                            FS: {station.riskAssessment?.safetyFactor}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODALS                                                             */}
      {/* ------------------------------------------------------------------ */}

      <NaturalDisastersModal
        isOpen={disastersModalOpen}
        onClose={() => setDisastersModalOpen(false)}
        selectedStationName={selectedStation?.name}
      />

      <StationDetailModal
        isOpen={inspectModalOpen}
        station={selectedStation}
        onClose={() => setInspectModalOpen(false)}
        onUpdateStationTelemetry={handleUpdateStationTelemetry}
        onOpenSmsModalForStation={(station) => {
          selectStation(station);
          setInspectModalOpen(false);
          setSmsModalOpen(true);
        }}
        onOpenEvidenceForStation={(station) => {
          selectStation(station);
          setInspectModalOpen(false);
          setEvidenceModalOpen(true);
        }}
      />

      <DisasterEvidenceModal
        isOpen={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        stations={stations}
        selectedStation={selectedStation}
        evidenceList={evidenceList}
        onSelectStation={(station) => selectStation(station)}
        onOpenSmsModalWithAlert={(alertMsg, stationId) => {
          if (stationId) {
            const found = stations.find(
              (station) => station.id === stationId
            );
            if (found) {
              selectStation(found);
            }
          }
          setPrefilledSmsMessage(alertMsg);
          setEvidenceModalOpen(false);
          setSmsModalOpen(true);
        }}
      />

      <SmsSystemModal
        isOpen={smsModalOpen}
        onClose={() => {
          setSmsModalOpen(false);
          setPrefilledSmsMessage(null);
        }}
        stations={stations}
        subscribers={subscribers}
        onSubscribersChange={setSubscribers}
        alertDispatches={alertDispatches}
        onDispatchesChange={setAlertDispatches}
        initialStation={selectedStation}
        initialMessage={prefilledSmsMessage}
      />

      <MassSosSimulationModal
        isOpen={massSosModalOpen}
        onClose={() => setMassSosModalOpen(false)}
        registeredDevices={registeredDevices}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}

function RiskInput({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#080d1a] border border-slate-800 rounded-lg px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">
        {value}
      </div>
    </div>
  );
}

function TelemetryItem({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="text-[10px] text-slate-400 block">{label}</span>
      <span className="font-bold text-white font-mono">{value}</span>
    </div>
  );
}

