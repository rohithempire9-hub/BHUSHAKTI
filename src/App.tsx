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
import { BhuShaktiMainDashboard } from './components/Dashboard/BhuShaktiMainDashboard';
import { LandslidePageView } from './components/Pages/LandslidePageView';
import { FloodPageView } from './components/Pages/FloodPageView';
import { Disaster3DPageView } from './components/Pages/Disaster3DPageView';
import { WeatherPageView } from './components/Pages/WeatherPageView';
import { HistoricalPageView } from './components/Pages/HistoricalPageView';
import { SettingsPageView } from './components/Pages/SettingsPageView';
import { RainfallSaturationChart } from './components/Analytics/RainfallSaturationChart';
import { CitizenReportingPortal } from './components/CitizenReports/CitizenReportingPortal';
import { SmsEarlyWarningHub } from './components/SMS/SmsEarlyWarningHub';
import { MassSosSimulationModal } from './components/SMS/MassSosSimulationModal';

import { LandslideMap } from './components/Map/LandslideMap';
import { PlaceRiskMatrix } from './components/RiskAnalysis/PlaceRiskMatrix';
import { StationDetailModal } from './components/Sensors/StationDetailModal';
import { SmsSystemModal } from './components/SMS/SmsSystemModal';
import { NortheastRiskDashboard } from './components/RiskAnalysis/NortheastRiskDashboard';
import { NaturalDisastersModal } from './components/Disasters/NaturalDisastersModal';
import { DisasterEvidenceModal } from './components/Evidence/DisasterEvidenceModal';
import { syncStationsWithRealWeather } from './services/realWeatherService';

// Central SIH Intelligence Modules
import { LandslideMemoryView } from './components/Memory/LandslideMemoryView';
import { DigitalTwin3DView } from './components/DigitalTwin/DigitalTwin3DView';
import { WhatIfSimulatorView } from './components/Simulator/WhatIfSimulatorView';
import { EmergencyResponseView } from './components/Emergency/EmergencyResponseView';
import { PostDisasterForensicView } from './components/Reports/PostDisasterForensicView';
import { BhuShaktiCopilotModal } from './components/Copilot/BhuShaktiCopilotModal';
import { SihDemoBar, DemoScenarioId } from './components/Demo/SihDemoBar';
import { DisasterIntelligenceSuite } from './components/Disasters/DisasterIntelligenceSuite';

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
  const [isDarkMode] = useState<boolean>(true);
  const [currentNavSection, setCurrentNavSection] = useState<BhuNavSection>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [mapFilterStatus, setMapFilterStatus] = useState('ALL');
  const [mainViewMode, setMainViewMode] = useState<
    'bento' | 'risk_matrix' | 'regional_overview' | 'telemetry_grid'
  >('bento');

  // Modals State
  const [massSosModalOpen, setMassSosModalOpen] = useState(false);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [disastersModalOpen, setDisastersModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [copilotModalOpen, setCopilotModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Central SIH Evaluation Scenario State
  const [activeDemoScenario, setActiveDemoScenario] = useState<DemoScenarioId>('none');
  const [landslideSubTab, setLandslideSubTab] = useState<'memory' | 'sensors'>('memory');
  const [historicalSubTab, setHistoricalSubTab] = useState<'forensic' | 'archive'>('forensic');
  const [warRoomInitialTab, setWarRoomInitialTab] = useState<
    'chainbreaker' | 'contradiction' | 'sihflow' | 'dna' | 'timemachine' | 'domino' | 'priority' | 'costofdelay' | 'drill' | 'commander' | 'judgechallenge'
  >('sihflow');

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
    setActiveDemoScenario('none');
    setWarRoomInitialTab('sihflow');
  };

  const handleSelectDemoScenario = (scenario: DemoScenarioId) => {
    setActiveDemoScenario(scenario);
    if (scenario === 'tawang_escalation') {
      const tawangStation = stations.find((s) => s.id === 'tawang-pass-01') || stations[0];
      if (tawangStation) setSelectedStation(tawangStation);
      setSimulatedRainfall(155);
      setSimulatedDisplacement(7.2);
      setDismissedCriticalBanner(false);
      setCurrentNavSection('landslide');
      setLandslideSubTab('memory');
    } else if (scenario === 'assam_flood') {
      const assamStation = stations.find((s) => s.region.includes('Assam') || s.id === 'dima-hasao-03') || stations[1];
      if (assamStation) setSelectedStation(assamStation);
      setSimulatedRainfall(130);
      setCurrentNavSection('flood');
    } else if (scenario === 'multi_cascade') {
      const tawangStation = stations.find((s) => s.id === 'tawang-pass-01') || stations[0];
      if (tawangStation) setSelectedStation(tawangStation);
      setCurrentNavSection('emergency_response');
    } else if (scenario === 'offline_outage') {
      setMassSosModalOpen(true);
    } else if (scenario === 'evidence_conflict') {
      const tawangStation = stations.find((s) => s.id === 'tawang-pass-01') || stations[0];
      if (tawangStation) setSelectedStation(tawangStation);
      setEvidenceModalOpen(true);
    }
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
      id: `cit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

  const handleSearchLocation = (query: string) => {
    setGlobalSearchQuery(query);
    if (query.trim().length > 1) {
      const match = stations.find((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.state.toLowerCase().includes(query.toLowerCase()) ||
        s.region.toLowerCase().includes(query.toLowerCase())
      );
      if (match) {
        setSelectedStation(match);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden bg-topo-dots">
      {/* 1. TOP AUTHORITATIVE ENTERPRISE HEADER */}
      <div className="relative z-40">
        <BhuShaktiHeader
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          onNavigate={(sec) => {
            setCurrentNavSection(sec);
            setIsMobileMenuOpen(false);
          }}
          searchQuery={globalSearchQuery}
          onSearchChange={handleSearchLocation}
          activeAlertsCount={criticalNodes.length + criticalCount}
          onOpenSmsModal={() => setSmsModalOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          activeScenario={activeDemoScenario}
          onSelectScenario={handleSelectDemoScenario}
        />
      </div>

      {/* 2. CRITICAL HAZARD WARNING BANNER */}
      {!dismissedCriticalBanner && criticalNodes.length > 0 && (
        <div className="px-4 sm:px-6 pt-3 max-w-[1720px] mx-auto w-full">
          <CriticalHazardBanner
            criticalNodes={criticalNodes}
            onTriggerMassSos={() => setMassSosModalOpen(true)}
            onInspectNode={(node) => {
              const matched = stations.find((s) => s.id === node.stationId || s.name.toLowerCase().includes(node.locationName.toLowerCase())) || stations[0];
              if (matched) setSelectedStation(matched);
              setInspectModalOpen(true);
            }}
            onDismiss={() => setDismissedCriticalBanner(true)}
          />
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT AREA WITH VERTICAL LEFT MENU */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1720px] mx-auto w-full">
        {/* Authoritative Sidebar - White / Light Navigation Panel */}
        <BhuShaktiSidebar
          currentSection={currentNavSection}
          onSelectSection={(sec) => {
            setCurrentNavSection(sec);
            setIsMobileMenuOpen(false);
          }}
          currentLanguage={currentLanguage}
          pendingReportsCount={citizenReports.filter((r) => r.status === 'Pending Review').length}
          activeCriticalNodesCount={criticalNodes.length}
          registeredDevicesCount={registeredDevices.length}
          onOpenSmsModal={() => setSmsModalOpen(true)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Center Viewport: Each Menu Item Opens in Its Dedicated Smooth View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* VIEW 1: DASHBOARD (MAIN COMMAND CENTER) */}
          {currentNavSection === 'dashboard' && (
            <BhuShaktiMainDashboard
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(st) => selectStation(st)}
              sensingNodes={sensingNodes}
              remoteVillages={[]}
              highwaySegments={[]}
              citizenReports={citizenReports}
              simulatedRainfall={simulatedRainfall}
              simulatedDisplacement={simulatedDisplacement}
              simulatedRiskLevel={isJudgeEmergency ? 'critical' : simulatedRainfall > 40 ? 'warning' : 'safe'}
              onOpenSmsModal={() => setSmsModalOpen(true)}
              onOpenEscapeModal={() => setCurrentNavSection('emergency_response')}
              onOpenEvidenceModal={() => setEvidenceModalOpen(true)}
              evidenceList={evidenceList.map((e) => e.id)}
              mapFilterStatus={mapFilterStatus}
              setMapFilterStatus={setMapFilterStatus}
              mapSearchQuery={globalSearchQuery}
              setMapSearchQuery={setGlobalSearchQuery}
              onNavigate={(pageId) => setCurrentNavSection(pageId)}
            />
          )}

          {/* VIEW 2: RISK MAP (FULL-PAGE GIS SPATIAL WORKBENCH) */}
          {currentNavSection === 'risk_map' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 font-sans">
                    Interactive GIS Landslide &amp; Topographical Hazard Map
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    High-resolution satellite topography, hazard heatmaps, safe zones, and NH-10 / NH-13 evacuation routes.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEvidenceModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-sm flex items-center gap-2 border border-slate-300 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>Photo Evidence ({evidenceList.length})</span>
                  </button>
                  <button
                    onClick={() => setMassSosModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Dispatch Siren</span>
                  </button>
                </div>
              </div>

              <div className="h-[750px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                <LandslideMap
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(st) => selectStation(st)}
                  filterStatus={mapFilterStatus}
                  onFilterChange={setMapFilterStatus}
                  searchQuery={globalSearchQuery}
                  onSearchChange={setGlobalSearchQuery}
                  onOpenEvidenceModal={() => setEvidenceModalOpen(true)}
                  evidenceList={evidenceList.map((e) => e.id)}
                  simulatedRiskLevel={isJudgeEmergency ? 'critical' : simulatedRainfall > 40 ? 'warning' : 'safe'}
                />
              </div>
            </div>
          )}

          {/* VIEW 3: LANDSLIDE (SLOPE MEMORY ENGINE & PINN SENSORS) */}
          {currentNavSection === 'landslide' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl w-fit shadow-sm">
                <button
                  onClick={() => setLandslideSubTab('memory')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    landslideSubTab === 'memory'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Slope Memory &amp; AI Fingerprint
                </button>
                <button
                  onClick={() => setLandslideSubTab('sensors')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    landslideSubTab === 'sensors'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Live Sensor Mesh &amp; Inclinometers
                </button>
              </div>

              {landslideSubTab === 'memory' ? (
                <LandslideMemoryView
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(st) => selectStation(st)}
                  onOpenSmsModal={() => setMassSosModalOpen(true)}
                  onOpenSimulator={() => setCurrentNavSection('what_if')}
                />
              ) : (
                <LandslidePageView
                  sensingNodes={sensingNodes}
                  onToggleNodeMode={handleToggleNodeMode}
                  onUpdateNodeTelemetry={handleUpdateNodeTelemetry}
                  stations={stations}
                  onSelectStation={(st) => {
                    selectStation(st);
                    setInspectModalOpen(true);
                  }}
                  onTriggerMassSos={() => setMassSosModalOpen(true)}
                  simulatedRainfall={simulatedRainfall}
                  onSimulatedRainfallChange={setSimulatedRainfall}
                  simulatedDisplacement={simulatedDisplacement}
                  onSimulatedDisplacementChange={setSimulatedDisplacement}
                  onResetSimulation={handleResetSimulation}
                  isLiveStreamActive={isLiveStreamActive}
                  onToggleLiveStream={() => setIsLiveStreamActive((prev) => !prev)}
                />
              )}
            </div>
          )}

          {/* VIEW 4: FLOOD (RIVER BASIN & INUNDATION ENGINE) */}
          {currentNavSection === 'flood' && (
            <FloodPageView
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(st) => selectStation(st)}
              onTriggerMassSos={() => setMassSosModalOpen(true)}
            />
          )}

          {/* VIEW 4B: DISASTER INTELLIGENCE & WAR ROOM (DNA, TIME MACHINE, DOMINO, PRIORITY SCORE) */}
          {currentNavSection === 'war_room' && (
            <DisasterIntelligenceSuite
              initialTab={warRoomInitialTab}
              activeScenario={activeDemoScenario}
              onSelectScenario={handleSelectDemoScenario}
              onOpenSmsModal={() => setMassSosModalOpen(true)}
            />
          )}

          {/* VIEW 5: 3D DIGITAL TWIN (DISASTER KINEMATICS & TERRAIN PARTICLES) */}
          {currentNavSection === 'disaster_3d' && (
            <DigitalTwin3DView />
          )}

          {/* VIEW 5B: WHAT-IF SCENARIO & INTERVENTION SIMULATOR */}
          {currentNavSection === 'what_if' && (
            <WhatIfSimulatorView />
          )}

          {/* VIEW 5C: EMERGENCY RESPONSE & RESOURCE OPTIMIZER */}
          {currentNavSection === 'emergency_response' && (
            <EmergencyResponseView
              onOpenSmsModal={() => setMassSosModalOpen(true)}
              activeScenario={activeDemoScenario}
              onNavigateToWarRoom={(tab) => {
                setCurrentNavSection('war_room');
                setWarRoomInitialTab(tab as any);
              }}
            />
          )}

          {/* VIEW 6: WEATHER (NORTHEAST WEATHER HUB & LIVE RADAR) */}
          {currentNavSection === 'weather' && (
            <WeatherPageView
              stations={stations}
              onRefreshWeather={handleSyncLiveWeather}
              isWeatherRefreshing={isSyncingWeather}
              selectedStation={selectedStation}
              onSelectStation={(st) => {
                selectStation(st);
                setInspectModalOpen(true);
              }}
            />
          )}

          {/* VIEW 7: ANALYTICS (RAINFALL & SATURATION DUAL-AXIS) */}
          {currentNavSection === 'analytics' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-slate-900 font-sans">
                    Dual-Axis Rainfall &amp; Soil Moisture Saturation Analytics
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Antecedent precipitation index (API), hydraulic conductivity, and pore pressure trigger thresholds.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono">Focus Zone:</span>
                  <span className="px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
                    {selectedStation?.name || 'Tawang Sela Pass'}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <RainfallSaturationChart
                  currentStationName={selectedStation?.name}
                  simulatedRainfall={simulatedRainfall}
                  simulatedDisplacement={simulatedDisplacement}
                />
              </div>
            </div>
          )}

          {/* VIEW 8: HISTORICAL & POST-DISASTER FORENSIC AUDIT */}
          {currentNavSection === 'historical' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-xl w-fit shadow-sm">
                <button
                  onClick={() => setHistoricalSubTab('forensic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    historicalSubTab === 'forensic'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Post-Disaster Forensic Audit Reports
                </button>
                <button
                  onClick={() => setHistoricalSubTab('archive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    historicalSubTab === 'archive'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  12 Historical Disaster Archives
                </button>
              </div>

              {historicalSubTab === 'forensic' ? (
                <PostDisasterForensicView />
              ) : (
                <HistoricalPageView />
              )}
            </div>
          )}

          {/* VIEW 9: FIELD REPORTS (CROWDSOURCED GEOPORTAL & PHOTO EVIDENCE) */}
          {currentNavSection === 'field_reports' && (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <CitizenReportingPortal
                reports={citizenReports}
                onSubmitReport={handleSubmitCitizenReport}
                onUpdateReportStatus={handleUpdateCitizenReportStatus}
                currentLanguage={currentLanguage}
              />
            </div>
          )}

          {/* VIEW 10: ALERTS (ZERO-INTERNET SMS EARLY WARNING GATEWAY) */}
          {currentNavSection === 'alerts' && (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <SmsEarlyWarningHub
                registeredDevices={registeredDevices}
                currentLanguage={currentLanguage}
                stations={stations}
                subscribers={subscribers}
                initialStation={selectedStation}
                onSimulateMassSos={() => setMassSosModalOpen(true)}
                onDispatchIndividualAlert={(device) => {
                  setPrefilledSmsMessage(
                    `EMERGENCY: Immediate landslide warning for ${device.region} (${device.deviceName}). Evacuate to high ground immediately.`
                  );
                  setSmsModalOpen(true);
                }}
              />
            </div>
          )}

          {/* VIEW 11: AI INSIGHTS (16 NER RISK MATRIX & STABILITY SCORE) */}
          {currentNavSection === 'ai_insights' && (
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

          {/* VIEW 12: SETTINGS (LOCALIZATION, LORA GATEWAY, SYSTEM CONFIG) */}
          {currentNavSection === 'settings' && (
            <SettingsPageView
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              onResetSimulation={handleResetSimulation}
            />
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

      {/* BHUSAKTHI COPILOT AI MODAL */}
      <BhuShaktiCopilotModal
        isOpen={copilotModalOpen}
        onClose={() => setCopilotModalOpen(false)}
        stations={stations}
        selectedStation={selectedStation}
        onNavigateSection={(sec) => setCurrentNavSection(sec)}
      />

      {/* FLOATING ACTION BUTTON TO OPEN BHUSAKTHI COPILOT FROM ANY SCREEN */}
      <button
        id="floating-copilot-trigger"
        onClick={() => setCopilotModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xl shadow-blue-600/30 border border-blue-400 flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-blue-200" />
        <span className="tracking-wide font-sans">BHUSAKTHI COPILOT</span>
        <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[9px] font-mono border border-white/30">
          AI
        </span>
      </button>
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
    <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 shadow-sm">
      <div className="text-[9px] uppercase tracking-wide text-slate-500 font-semibold">
        {label}
      </div>
      <div className="text-xs font-mono font-bold text-slate-900 mt-0.5">
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
      <span className="text-[10px] text-slate-500 block font-medium">{label}</span>
      <span className="font-bold text-slate-900 font-mono">{value}</span>
    </div>
  );
}

