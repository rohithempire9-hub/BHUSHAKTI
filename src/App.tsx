import React, { useEffect, useState } from 'react';
import {
  LandslideStation,
  SmsSubscriber,
  SmsAlertRecord,
  RiskStatus,
  DisasterEvidenceReport
} from './types/landslide';

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
  Pause
} from 'lucide-react';

const REFRESH_INTERVAL_MS = 5000;

export default function App() {
  const [stations, setStations] = useState<LandslideStation[]>([]);
  const [subscribers, setSubscribers] = useState<SmsSubscriber[]>([]);
  const [alertDispatches, setAlertDispatches] = useState<SmsAlertRecord[]>([]);
  const [evidenceList, setEvidenceList] = useState<DisasterEvidenceReport[]>([]);

  const [selectedStation, setSelectedStation] =
    useState<LandslideStation | null>(null);

  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [disastersModalOpen, setDisastersModalOpen] = useState(false);
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);

  const [prefilledSmsMessage, setPrefilledSmsMessage] =
    useState<string | null>(null);

  const [isSyncingWeather, setIsSyncingWeather] = useState(false);

  const [activeViewTab, setActiveViewTab] = useState<
    'map' | 'risk_matrix' | 'telemetry_grid'
  >('map');

  const [mapFilterStatus, setMapFilterStatus] =
    useState<RiskStatus | 'all'>('all');

  const [searchQuery, setSearchQuery] = useState('');

  /*
   * IMPORTANT:
   * The browser no longer generates fake/random sensor readings.
   *
   * server.ts is now the autonomous sensor simulator:
   *
   * Virtual/Physical Sensor
   *        ↓
   * /api/sensors/telemetry
   *        ↓
   * Risk Engine
   *        ↓
   * Firestore
   *        ↓
   * This App polls Firestore every 5 seconds
   *
   * Later, a physical ESP32/LoRa node can send telemetry to the same API.
   */
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('Waiting...');
  const [firebaseConnected, setFirebaseConnected] = useState(false);

  // ---------------------------------------------------------------------------
  // Keep selected zone synchronized with the latest Firestore station object.
  // This is important because the backend continuously changes telemetry/risk.
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
  // Initial loading
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let unsubscribeEvidence: (() => void) | undefined;

    async function loadData() {
      try {
        const loadedStations = await initializeStations();

        if (cancelled) return;

        setStations(loadedStations);
        setSelectedStation(loadedStations[0] ?? null);

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

        setFirebaseConnected(isFirebaseAvailable());
      } catch (error) {
        console.error('[BhuShakti] Initial data loading failed:', error);
      }
    }

    void loadData();

    return () => {
      cancelled = true;
      unsubscribeEvidence?.();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // AUTONOMOUS LIVE SENSOR VIEW
  //
  // Do NOT use Math.random() here.
  // The backend virtual sensor stream is responsible for generating telemetry.
  // This only reads the latest Firestore state.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isLiveStreamActive) return;

    let cancelled = false;

    const refreshFromFirestore = async () => {
      try {
        const latestStations = await initializeStations();

        if (cancelled || latestStations.length === 0) return;

        applyStations(latestStations);
      } catch (error) {
        console.warn(
          '[BhuShakti] Live Firestore station refresh failed:',
          error
        );
      }
    };

    void refreshFromFirestore();

    const interval = window.setInterval(
      () => void refreshFromFirestore(),
      REFRESH_INTERVAL_MS
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isLiveStreamActive]);

  // ---------------------------------------------------------------------------
  // Station selection
  //
  // Every map/card/risk-matrix selection comes through this function.
  // Therefore the selected zone becomes the direct input to the risk dashboard.
  // ---------------------------------------------------------------------------
  const selectStation = (station: LandslideStation | null) => {
    if (!station) return;

    setSelectedStation(station);

    setStations((previous) =>
      previous.map((item) =>
        item.id === station.id ? station : item
      )
    );
  };

  // ---------------------------------------------------------------------------
  // Manual telemetry update from StationDetailModal
  // ---------------------------------------------------------------------------
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
      console.error(
        '[BhuShakti] Station telemetry update failed:',
        error
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Manual live weather synchronization
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Risk counts
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Selected-zone risk inputs
  //
  // These values are read directly from selectedStation.telemetry.
  // The riskAssessment shown below is the result produced for this station.
  // ---------------------------------------------------------------------------
  const selectedTelemetry = selectedStation?.telemetry;
  const selectedRisk = selectedStation?.riskAssessment;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-600 selection:text-white">

      {/* ------------------------------------------------------------------ */}
      {/* HEADER                                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-[500] px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                BhuShakti
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Northeast India Geotechnical AI
                </span>
              </h1>

              <p className="text-xs text-slate-400">
                Landslide Early Warning & Real-Time Soil Stability System Across
                Northeast India
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">

            <button
              id="open-disasters-header-btn"
              onClick={() => setDisastersModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-amber-300 transition-colors cursor-pointer"
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

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
              title="Cloud Firestore sensor storage"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cloud DB:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {firebaseConnected ? 'Firestore Active' : 'Offline'}
              </span>
            </div>

            <button
              onClick={() => setIsLiveStreamActive((value) => !value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                isLiveStreamActive
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
              title="Pause/resume the dashboard's live Firestore refresh"
            >
              {isLiveStreamActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Pause className="w-3 h-3" />
                  Live Sensor Stream ({lastSyncTime})
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Live View Paused
                </>
              )}
            </button>

            <button
              id="open-sms-system-btn"
              onClick={() => setSmsModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-rose-950/50 transition-all cursor-pointer border border-rose-400/30"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Emergency SMS Gateway</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {subscribers.length} Registered
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* MAIN                                                               */}
      {/* ------------------------------------------------------------------ */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6 flex-1">

        {/* STATUS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div
            onClick={() => {
              setActiveViewTab('map');
              setMapFilterStatus('safe');
            }}
            className="cursor-pointer bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-500 p-4 rounded-2xl shadow-xl transition-all"
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
            onClick={() => {
              setActiveViewTab('map');
              setMapFilterStatus('moderate');
            }}
            className="cursor-pointer bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 p-4 rounded-2xl shadow-xl transition-all"
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
            onClick={() => {
              setActiveViewTab('map');
              setMapFilterStatus('high');
            }}
            className="cursor-pointer bg-slate-900/90 border border-orange-500/30 hover:border-orange-500/60 p-4 rounded-2xl shadow-xl transition-all"
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
            onClick={() => {
              setActiveViewTab('map');
              setMapFilterStatus('critical');
            }}
            className="cursor-pointer bg-slate-900/90 border border-rose-500/40 hover:border-rose-500 p-4 rounded-2xl shadow-xl transition-all"
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
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Risk Analysis — Selected Zone
                  </h2>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Inputs are taken directly from the currently selected monitoring
                  zone: <span className="text-cyan-300 font-semibold">{selectedStation.name}</span>
                </p>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase">
                  Current Risk
                </div>
                <div className="text-lg font-black uppercase text-white">
                  {selectedRisk.status}
                  <span className="text-cyan-300 ml-2">
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
              Geotechnical inputs used by the risk engine:
              <span className="text-slate-200 ml-1">
                slope {selectedStation.slopeAngleDeg}°, soil {selectedStation.soilType},
                vegetation {selectedStation.vegetationCoverPct}%, fault distance {selectedStation.faultDistanceKm} km.
              </span>
            </div>
          </div>
        )}

        {/* VIEW TABS */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 flex-wrap">

            <button
              id="tab-map-view"
              onClick={() => setActiveViewTab('map')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeViewTab === 'map'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Interactive GIS Map
            </button>

            <button
              id="tab-risk-matrix"
              onClick={() => setActiveViewTab('risk_matrix')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeViewTab === 'risk_matrix'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Place-to-Place Risk Matrix
            </button>

            <button
              id="tab-telemetry-grid"
              onClick={() => setActiveViewTab('telemetry_grid')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeViewTab === 'telemetry_grid'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              Live Sensor Telemetry
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Click a station to make it the active risk-analysis zone.</span>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MAP VIEW                                                         */}
        {/* ---------------------------------------------------------------- */}
        {activeViewTab === 'map' && (
          <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              <div className="lg:col-span-7 space-y-3">
                <LandslideMap
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(station) => selectStation(station)}
                  filterStatus={mapFilterStatus}
                  onFilterChange={setMapFilterStatus}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  evidenceList={evidenceList}
                  onOpenEvidenceModal={() => setEvidenceModalOpen(true)}
                />
              </div>

              <div className="lg:col-span-5">
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
              </div>
            </div>

            {/* MONITORED STATION CARDS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Northeast India Monitored Sensor Stations
                </h3>

                <span className="text-xs text-slate-400">
                  {stations.length} live Firestore stations
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
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
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/20'
                          : isSafe
                          ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400'
                          : station.riskAssessment?.status === 'critical'
                          ? 'bg-slate-900/80 border-rose-500/40 hover:border-rose-400'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <span className="font-bold text-xs text-white truncate">
                          {station.name}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                            isSafe
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : station.riskAssessment?.status === 'critical'
                              ? 'bg-rose-500/20 text-rose-300'
                              : station.riskAssessment?.status === 'high'
                              ? 'bg-orange-500/20 text-orange-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {isSafe ? 'SAFE' : station.riskAssessment?.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mb-2 truncate">
                        {station.region}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-950/70 p-2 rounded-lg text-slate-300">
                        <div>
                          Temp:
                          <strong className="text-white font-mono ml-1">
                            {station.telemetry.temperatureC}°C
                          </strong>
                        </div>

                        <div>
                          Erosion:
                          <strong className="text-white font-mono ml-1">
                            {station.telemetry.erosionRateMmPerYr} mm/y
                          </strong>
                        </div>

                        <div>
                          Moisture:
                          <strong className="text-white font-mono ml-1">
                            {station.telemetry.soilMoisturePct}%
                          </strong>
                        </div>

                        <div>
                          Pore P:
                          <strong className="text-white font-mono ml-1">
                            {station.telemetry.poreWaterPressureKpa} kPa
                          </strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 mt-2 border-t border-slate-800">
                        <span>
                          FS:
                          <strong className="text-indigo-300 font-mono ml-1">
                            {station.riskAssessment?.safetyFactor}
                          </strong>
                        </span>

                        <span className="text-cyan-400 font-medium">
                          {isSelected ? 'Selected Zone' : 'Click to inspect'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DISASTER HISTORY BANNER */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <History className="w-5 h-5 text-amber-400" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    Northeast India Natural Disasters Historical Archive
                  </h4>

                  <p className="text-xs text-slate-400 mt-1">
                    Historical landslide, flood, GLOF and earthquake records are
                    available for station context.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDisastersModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                <History className="w-3.5 h-3.5" />
                Explore Disaster History
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* RISK MATRIX                                                      */}
        {/* ---------------------------------------------------------------- */}
        {activeViewTab === 'risk_matrix' && (
          <PlaceRiskMatrix
            stations={stations}
            onSelectStation={(station) => {
              selectStation(station);
              setInspectModalOpen(true);
            }}
            onTriggerSimulatedRain={(id) => {
              void handleUpdateStationTelemetry(id, {
                rainfall24hMm: 110,
                soilMoisturePct: 88,
                poreWaterPressureKpa: 42,
                erosionRateMmPerYr: 26.5
              });
            }}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TELEMETRY GRID                                                   */}
        {/* ---------------------------------------------------------------- */}
        {activeViewTab === 'telemetry_grid' && (
          <div className="space-y-4">

            <div>
              <h3 className="text-base font-bold text-white">
                Real-Time Geological Sensor Telemetry
              </h3>

              <p className="text-xs text-slate-400 mt-1">
                Values below are read from the latest Firestore station state.
                The backend risk engine recalculates risk when telemetry changes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    className={`p-4 rounded-2xl border cursor-pointer transition-all bg-slate-900/80 ${
                      isSelected
                        ? 'border-cyan-400'
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

                    <div className="grid grid-cols-2 gap-2 text-xs my-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
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
        )}
      </main>

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
    <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-2">
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
