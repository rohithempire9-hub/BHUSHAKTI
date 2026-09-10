import React, { useState, useEffect } from 'react';
import {
  LandslideStation,
  SmsSubscriber,
  SmsAlertRecord,
  RiskStatus
} from './types/landslide';
import {
  initializeStations,
  updateStationTelemetry,
  getSubscribers,
  getAlertDispatches,
  isFirebaseAvailable
} from './services/firebase';
import { LandslideMap } from './components/Map/LandslideMap';
import { PlaceRiskMatrix } from './components/RiskAnalysis/PlaceRiskMatrix';
import { StationDetailModal } from './components/Sensors/StationDetailModal';
import { SmsSystemModal } from './components/SMS/SmsSystemModal';
import { NortheastRiskDashboard } from './components/RiskAnalysis/NortheastRiskDashboard';
import { NaturalDisastersModal } from './components/Disasters/NaturalDisastersModal';
import { syncStationsWithRealWeather } from './services/realWeatherService';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Radio,
  MapPin,
  Flame,
  Droplets,
  Layers,
  Thermometer,
  CloudRain,
  Compass,
  Database,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Play,
  Pause,
  Zap,
  Sliders,
  Sparkles,
  Info,
  History
} from 'lucide-react';

export default function App() {
  const [stations, setStations] = useState<LandslideStation[]>([]);
  const [subscribers, setSubscribers] = useState<SmsSubscriber[]>([]);
  const [alertDispatches, setAlertDispatches] = useState<SmsAlertRecord[]>([]);
  const [selectedStation, setSelectedStation] = useState<LandslideStation | null>(null);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [disastersModalOpen, setDisastersModalOpen] = useState(false);
  const [isSyncingWeather, setIsSyncingWeather] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'map' | 'risk_matrix' | 'telemetry_grid'>('map');

  // Filter & Search state for Map and Tables
  const [mapFilterStatus, setMapFilterStatus] = useState<RiskStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live Simulation state
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);

  // Initial Data Loading from Firebase / Cloud Firestore
  useEffect(() => {
    async function loadData() {
      const loadedStations = await initializeStations();
      setStations(loadedStations);
      setSelectedStation(loadedStations[0]);

      const loadedSubs = await getSubscribers();
      setSubscribers(loadedSubs);

      const loadedDispatches = await getAlertDispatches();
      setAlertDispatches(loadedDispatches);

      setFirebaseConnected(isFirebaseAvailable());
    }
    loadData();
  }, []);

  // Real-Time Sensor Telemetry Simulation Interval
  useEffect(() => {
    if (!isLiveStreamActive || stations.length === 0) return;

    const interval = setInterval(() => {
      // Pick 2 random stations to introduce natural environmental micro-fluctuations
      const idxA = Math.floor(Math.random() * stations.length);
      const targetStation = stations[idxA];
      if (!targetStation) return;

      // Small realistic fluctuations: temperature diurnal drift, slight pore pressure respiration
      const tempDelta = Number(((Math.random() - 0.5) * 0.4).toFixed(1));
      const poreDelta = Number(((Math.random() - 0.48) * 0.6).toFixed(1));
      const rainDelta = targetStation.riskAssessment.status === 'critical' ? Number((Math.random() * 0.8).toFixed(1)) : 0;
      const liveErosionDelta = Number(((Math.random() - 0.5) * 0.15).toFixed(2));

      const updatedTelemetry = {
        temperatureC: Number(Math.max(2, targetStation.telemetry.temperatureC + tempDelta).toFixed(1)),
        poreWaterPressureKpa: Number(Math.max(5, targetStation.telemetry.poreWaterPressureKpa + poreDelta).toFixed(1)),
        rainfall24hMm: Number((targetStation.telemetry.rainfall24hMm + rainDelta).toFixed(1)),
        erosionLiveMmH: Number(Math.max(0.1, targetStation.telemetry.erosionLiveMmH + liveErosionDelta).toFixed(1)),
      };

      updateStationTelemetry(targetStation.id, updatedTelemetry, targetStation).then((updatedSt) => {
        setStations((prev) => prev.map((s) => (s.id === updatedSt.id ? updatedSt : s)));
        if (selectedStation?.id === updatedSt.id) {
          setSelectedStation(updatedSt);
        }
      });

      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveStreamActive, stations, selectedStation]);

  // Handle manual station telemetry update from detail modal
  const handleUpdateStationTelemetry = async (
    stationId: string,
    simulatedChanges: any
  ) => {
    const target = stations.find((s) => s.id === stationId);
    if (!target) return;

    const updated = await updateStationTelemetry(stationId, simulatedChanges, target);
    setStations((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setSelectedStation(updated);
  };

  // Sync stations with live real meteorological weather from Open-Meteo
  const handleSyncLiveWeather = async () => {
    if (isSyncingWeather || stations.length === 0) return;
    setIsSyncingWeather(true);
    try {
      const updated = await syncStationsWithRealWeather(stations);
      setStations(updated);
      if (selectedStation) {
        const match = updated.find((s) => s.id === selectedStation.id);
        if (match) setSelectedStation(match);
      }
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Weather sync error:', err);
    } finally {
      setIsSyncingWeather(false);
    }
  };

  // Safe count & stats
  const safeCount = stations.filter((s) => s.riskAssessment.status === 'safe').length;
  const moderateCount = stations.filter((s) => s.riskAssessment.status === 'moderate').length;
  const highCount = stations.filter((s) => s.riskAssessment.status === 'high').length;
  const criticalCount = stations.filter((s) => s.riskAssessment.status === 'critical').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* 1. TOP HIGH-TECH MONITORING NAVIGATION HEADER */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-[500] px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
              <Activity className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
                  BhuShakti
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Northeast India Geotechnical AI
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Landslide Early Warning & Real-Time Soil Stability System Across Northeast India (16 Places)
              </p>
            </div>
          </div>

          {/* Cloud Infrastructure & Status Telemetry */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Historical Disasters Button */}
            <button
              id="open-disasters-header-btn"
              onClick={() => setDisastersModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-amber-500/30 text-amber-300 transition-colors cursor-pointer"
              title="View historical natural disasters of Northeast India"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Disasters Archive (12)</span>
            </button>

            {/* Cloud Firestore Indicator */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300"
              title="Cloud Firestore Scalable Sensor Storage"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cloud DB:</span>
              <span className="text-emerald-400 font-mono font-bold">
                {firebaseConnected ? 'Firestore Active' : 'Synced (16 Places)'}
              </span>
            </div>

            {/* Live Telemetry Ticker Toggle */}
            <button
              onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                isLiveStreamActive
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {isLiveStreamActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <Pause className="w-3 h-3" />
                  Live Sensor Stream ({lastSyncTime})
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Simulation Paused
                </>
              )}
            </button>

            {/* SMS Early Warning System Button */}
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

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 space-y-6 flex-1">
        {/* STATS & STATUS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* SAFE ZONES CARD - Highlighted prominently as requested */}
          <div
            onClick={() => {
              setActiveViewTab('map');
              setMapFilterStatus('safe');
            }}
            className="cursor-pointer bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-500 p-4 rounded-2xl shadow-xl transition-all group"
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
            <div className="text-3xl font-extrabold text-white font-mono group-hover:text-emerald-400 transition-colors">
              {safeCount}
              <span className="text-sm font-normal text-slate-400 ml-1">/ 20 Places</span>
            </div>
            <div className="text-[11px] text-emerald-300 mt-1">
              Low vulnerability • Factor of Safety &ge; 1.80
            </div>
          </div>

          {/* MODERATE ADVISORY */}
          <div
            onClick={() => {
              setActiveViewTab('map');
              setMapFilterStatus('moderate');
            }}
            className="cursor-pointer bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 p-4 rounded-2xl shadow-xl transition-all group"
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
            <div className="text-3xl font-extrabold text-white font-mono group-hover:text-amber-400 transition-colors">
              {moderateCount}
              <span className="text-sm font-normal text-slate-400 ml-1">/ 20 Places</span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1">
              Elevated moisture & drainage inspection
            </div>
          </div>

          {/* HIGH WARNING */}
          <div
            onClick={() => {
              setActiveViewTab('map');
              setMapFilterStatus('high');
            }}
            className="cursor-pointer bg-slate-900/90 border border-orange-500/30 hover:border-orange-500/60 p-4 rounded-2xl shadow-xl transition-all group"
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
            <div className="text-3xl font-extrabold text-white font-mono group-hover:text-orange-400 transition-colors">
              {highCount}
              <span className="text-sm font-normal text-slate-400 ml-1">/ 20 Places</span>
            </div>
            <div className="text-[11px] text-orange-300/80 mt-1">
              Shear strength degrading • Standby ready
            </div>
          </div>

          {/* CRITICAL ALERT */}
          <div
            onClick={() => {
              setActiveViewTab('map');
              setMapFilterStatus('critical');
            }}
            className="cursor-pointer bg-slate-900/90 border border-rose-500/40 hover:border-rose-500 p-4 rounded-2xl shadow-xl transition-all group relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-600/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 animate-bounce" />
                CRITICAL EVACUATION
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/50">
                Red Alert
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white font-mono text-rose-400">
              {criticalCount}
              <span className="text-sm font-normal text-slate-400 ml-1">/ 20 Places</span>
            </div>
            <div className="text-[11px] text-rose-300 mt-1 font-semibold">
              FS &lt; 1.0 • Immediate automated SMS dispatch
            </div>
          </div>
        </div>

        {/* 3. VIEW SELECTION TABS */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
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
              Interactive GIS Map (20 Monitored Places)
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
              Place-to-Place Risk Matrix & Comparative Analysis
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
              Live Sensor Telemetry Grid
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-indigo-400" />
            <span>Click any station marker or card to open detailed sensor inspector</span>
          </div>
        </div>

        {/* 4. VIEW CONTENT */}
        {activeViewTab === 'map' && (
          <div className="space-y-6">
            {/* Top Split Layout: Shrunken Map on the left, Real-Time Graph & Risk/Safe Telemetry on the right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Map Column (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-3">
                <LandslideMap
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(st) => {
                    setSelectedStation(st);
                  }}
                  filterStatus={mapFilterStatus}
                  onFilterChange={setMapFilterStatus}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>

              {/* Graph & Geotechnical Risk Dashboard Column (lg:col-span-5) */}
              <div className="lg:col-span-5">
                <NortheastRiskDashboard
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(st) => setSelectedStation(st)}
                  onInspectStation={(st) => {
                    setSelectedStation(st);
                    setInspectModalOpen(true);
                  }}
                  onOpenSmsModal={() => setSmsModalOpen(true)}
                  onOpenDisastersModal={() => setDisastersModalOpen(true)}
                  onSyncLiveWeather={handleSyncLiveWeather}
                  isSyncingWeather={isSyncingWeather}
                />
              </div>
            </div>

            {/* Historical Natural Disasters Archive Highlight Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <History className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Northeast India Natural Disasters Historical Archive
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                      12 Major Catastrophes Recorded
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Geotechnical records of past disasters: 2022 Tupul Disaster (61 fatalities), 2023 South Lhonak GLOF (100+ deaths), 2024 Cyclone Remal landslides, 1897 & 1950 Great Earthquakes.
                  </p>
                </div>
              </div>

              <button
                id="open-disasters-banner-btn"
                onClick={() => setDisastersModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>Explore Disaster History</span>
              </button>
            </div>

            {/* Quick Horizontal Grid of Northeast Monitored Places */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Northeast India Monitored Sensor Stations (16 Locations)
                </h3>
                <span className="text-xs text-slate-400">Click any card to open deep sensor inspector</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {stations.map((station) => {
                  const isSafe = station.riskAssessment.status === 'safe';
                  return (
                    <div
                      key={station.id}
                      onClick={() => {
                        setSelectedStation(station);
                        setInspectModalOpen(true);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${
                        isSafe
                          ? 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400'
                          : station.riskAssessment.status === 'critical'
                          ? 'bg-slate-900/80 border-rose-500/40 hover:border-rose-400'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-xs text-white truncate max-w-[140px]">
                          {station.name}
                        </span>
                        {/* Safe Zone Rule: If safe, show "SAFE" only! */}
                        {isSafe ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            SAFE
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              station.riskAssessment.status === 'critical'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {station.riskAssessment.status}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 mb-2 truncate">
                        {station.region}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-950/70 p-2 rounded-lg text-slate-300">
                        <div>Temp: <strong className="text-white font-mono">{station.telemetry.temperatureC}°C</strong></div>
                        <div>Erosion: <strong className="text-white font-mono">{station.telemetry.erosionRateMmPerYr} mm/y</strong></div>
                        <div>Moisture: <strong className="text-white font-mono">{station.telemetry.soilMoisturePct}%</strong></div>
                        <div>Pore P: <strong className="text-white font-mono">{station.telemetry.poreWaterPressureKpa} kPa</strong></div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 mt-2 border-t border-slate-800">
                        <span>FS: <strong className="text-indigo-300 font-mono">{station.riskAssessment.safetyFactor}</strong></span>
                        <span className="text-cyan-400 font-medium">Click to inspect</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PLACE-TO-PLACE RISK MATRIX */}
        {activeViewTab === 'risk_matrix' && (
          <PlaceRiskMatrix
            stations={stations}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setInspectModalOpen(true);
            }}
            onTriggerSimulatedRain={(id) => {
              handleUpdateStationTelemetry(id, {
                rainfall24hMm: 110,
                soilMoisturePct: 88,
                poreWaterPressureKpa: 42.0,
                erosionRateMmPerYr: 26.5,
              });
            }}
          />
        )}

        {/* TAB: LIVE SENSOR TELEMETRY GRID (ALL 20 PLACES) */}
        {activeViewTab === 'telemetry_grid' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Real-Time Geological Sensor Telemetry (All 20 Stations)
                </h3>
                <p className="text-xs text-slate-400">
                  Streaming ambient temperature, volumetric soil moisture, active erosion rate, pore water pressure, and extensometer creep.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stations.map((station) => {
                const isSafe = station.riskAssessment.status === 'safe';
                return (
                  <div
                    key={station.id}
                    onClick={() => {
                      setSelectedStation(station);
                      setInspectModalOpen(true);
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all hover:border-slate-600 bg-slate-900/80 ${
                      isSafe
                        ? 'border-emerald-500/30 hover:border-emerald-500'
                        : station.riskAssessment.status === 'critical'
                        ? 'border-rose-500/40 hover:border-rose-500'
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                          {station.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{station.region}, {station.country}</p>
                      </div>

                      {/* Strict Safe Zone Rule: If safe, show "SAFE" only! */}
                      {isSafe ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          SAFE
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
                            station.riskAssessment.status === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                              : station.riskAssessment.status === 'high'
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          }`}
                        >
                          {station.riskAssessment.status} ({station.riskAssessment.riskScore}%)
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs my-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Temperature</span>
                        <span className="font-bold text-white font-mono">{station.telemetry.temperatureC}°C</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Soil Erosion</span>
                        <span className="font-bold text-white font-mono">{station.telemetry.erosionRateMmPerYr} mm/y</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Soil Moisture</span>
                        <span className="font-bold text-white font-mono">{station.telemetry.soilMoisturePct}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Pore Pressure</span>
                        <span className="font-bold text-white font-mono">{station.telemetry.poreWaterPressureKpa} kPa</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span>Slope: {station.slopeAngleDeg}°</span>
                      <span className="font-mono font-bold text-indigo-300">
                        FS: {station.riskAssessment.safetyFactor}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 5. MODALS */}
      {/* Historical Natural Disasters Archive Modal */}
      <NaturalDisastersModal
        isOpen={disastersModalOpen}
        onClose={() => setDisastersModalOpen(false)}
        selectedStationName={selectedStation?.name}
      />

      {/* Station Detailed Telemetry & AI Diagnosis Modal */}
      <StationDetailModal
        isOpen={inspectModalOpen}
        station={selectedStation}
        onClose={() => setInspectModalOpen(false)}
        onUpdateStationTelemetry={handleUpdateStationTelemetry}
        onOpenSmsModalForStation={(st) => {
          setSelectedStation(st);
          setInspectModalOpen(false);
          setSmsModalOpen(true);
        }}
      />

      {/* Cellular SMS Early Warning Modal */}
      <SmsSystemModal
        isOpen={smsModalOpen}
        onClose={() => setSmsModalOpen(false)}
        stations={stations}
        subscribers={subscribers}
        onSubscribersChange={setSubscribers}
        alertDispatches={alertDispatches}
        onDispatchesChange={setAlertDispatches}
        initialStation={selectedStation}
      />
    </div>
  );
}
