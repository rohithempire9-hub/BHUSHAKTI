import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  AlertTriangle,
  Waves,
  Mountain,
  MapPin,
  Flame,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Eye,
  Camera,
  Layers,
  Sparkles,
  CloudRain,
  Radio,
  Share2,
  PhoneCall,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  FileText,
  Activity,
  Zap,
  X,
  Gauge,
  Crosshair,
} from 'lucide-react';
import {
  DisasterTwinEngine,
  CameraViewName,
  RainIntensity,
  LayerVisibility,
  ScenarioState,
  InteractiveEntityInfo,
} from './disasterTwinEngine';
import { LandslideStation } from '../../types/landslide';
import { BhuNavSection } from '../Navigation/BhuShaktiSidebar';

interface ScenarioPresetInfo {
  id: 'tawang' | 'subansiri' | 'gangtok';
  title: string;
  badge: string;
  region: string;
  corridor: string;
  riverGorge: string;
  rainfallTrigger: string;
  exposure: string;
}

const SCENARIO_PRESETS: Record<'tawang' | 'subansiri' | 'gangtok', ScenarioPresetInfo> = {
  tawang: {
    id: 'tawang',
    title: 'Tawang Strategic Corridor Cloudburst',
    badge: 'ARUNACHAL NH-13',
    region: 'Tawang Massif (3,024m ASL)',
    corridor: 'NH-13 Trans-Arunachal Highway',
    riverGorge: 'Tawang Chu River Gorge',
    rainfallTrigger: 'Upper Basin Cloudburst (110 mm/h)',
    exposure: '2,840 Villagers • Strategic Logistics Corridor',
  },
  subansiri: {
    id: 'subansiri',
    title: 'Subansiri Gorge Barrier Dam & Flash Surge',
    badge: 'UPPER SUBANSIRI',
    region: 'Subansiri River Basin (2,450m ASL)',
    corridor: 'Daporijo Arterial Supply Lifeline',
    riverGorge: 'Subansiri Rapids Riparian Basin',
    rainfallTrigger: 'Catchment Monsoonal Surcharge (95 mm/h)',
    exposure: '4,120 Villagers • Agrarian Valley Terrace',
  },
  gangtok: {
    id: 'gangtok',
    title: 'Gangtok High-Shear Slope Catastrophe',
    badge: 'SIKKIM CORRIDOR',
    region: 'East Sikkim Escarpment (2,180m ASL)',
    corridor: 'NH-10 Himalayan Supply Artery',
    riverGorge: 'Teesta Tributary Basin',
    rainfallTrigger: 'Multi-Day Monsoonal Saturation (88 mm/h)',
    exposure: '3,650 Residents • Mountain Infrastructure',
  },
};

interface DigitalTwin3DViewProps {
  selectedStation?: LandslideStation | null;
  onNavigate?: (section: BhuNavSection) => void;
  onOpenSmsModal?: () => void;
  onOpenEscapeModal?: () => void;
}

interface TimelineStep {
  timeStr: string;
  stepName: string;
  label: string;
  targetProgress: number;
  rainfall: number;
  saturation: number;
  fs: number;
  porePressure: number;
  discharge: number;
  floodDepth: number;
  roadBlocked: boolean;
  villageAtRisk: boolean;
  desc: string;
  cameraView: CameraViewName;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    timeStr: '00:00',
    stepName: 'BASELINE',
    label: 'Normal Equilibrium',
    targetProgress: 0.0,
    rainfall: 0,
    saturation: 32,
    fs: 1.65,
    porePressure: 12,
    discharge: 42,
    floodDepth: 0,
    roadBlocked: false,
    villageAtRisk: false,
    desc: 'Tawang corridor in stable equilibrium. NH-13 clear, river discharge normal.',
    cameraView: 'OVERVIEW',
  },
  {
    timeStr: '00:10',
    stepName: 'HEAVY RAIN',
    label: 'Monsoon Cloudburst',
    targetProgress: 0.12,
    rainfall: 48,
    saturation: 58,
    fs: 1.48,
    porePressure: 32,
    discharge: 75,
    floodDepth: 0,
    roadBlocked: false,
    villageAtRisk: false,
    desc: 'Sustained monsoon downpour over upper catchment basin delivering 48 mm/h rainfall.',
    cameraView: 'MOUNTAIN',
  },
  {
    timeStr: '00:20',
    stepName: 'SOIL SATURATION',
    label: 'Hydrostatic Uplift',
    targetProgress: 0.25,
    rainfall: 72,
    saturation: 84,
    fs: 1.28,
    porePressure: 64,
    discharge: 110,
    floodDepth: 0,
    roadBlocked: false,
    villageAtRisk: false,
    desc: 'Volumetric soil moisture breaches 84%; pore-water pressure spikes to 64 kPa.',
    cameraView: 'LANDSLIDE',
  },
  {
    timeStr: '00:30',
    stepName: 'SLOPE INSTABILITY',
    label: 'Tension Cracks Emerge',
    targetProgress: 0.38,
    rainfall: 95,
    saturation: 94,
    fs: 1.04,
    porePressure: 82,
    discharge: 145,
    floodDepth: 0,
    roadBlocked: false,
    villageAtRisk: false,
    desc: '45m crown tension fracture opens along 42° slope interface. Factor of safety critically degrades.',
    cameraView: 'LANDSLIDE',
  },
  {
    timeStr: '00:40',
    stepName: 'LANDSLIDE',
    label: 'Crown Shear Failure',
    targetProgress: 0.5,
    rainfall: 110,
    saturation: 98,
    fs: 0.82,
    porePressure: 98,
    discharge: 180,
    floodDepth: 0,
    roadBlocked: true,
    villageAtRisk: false,
    desc: 'Slope failure initiates! Over 18,000 m³ of rock, saturated soil, and debris shear downhill.',
    cameraView: 'IMPACT',
  },
  {
    timeStr: '00:50',
    stepName: 'ROAD BLOCKED',
    label: 'NH-13 Severed',
    targetProgress: 0.62,
    rainfall: 105,
    saturation: 96,
    fs: 0.76,
    porePressure: 92,
    discharge: 210,
    floodDepth: 0.6,
    roadBlocked: true,
    villageAtRisk: false,
    desc: 'Debris avalanche buries 240m of Strategic Highway NH-13 under 4.5m of boulders and mud.',
    cameraView: 'IMPACT',
  },
  {
    timeStr: '01:00',
    stepName: 'RIVER BLOCKAGE',
    label: 'Debris Gorge Dam',
    targetProgress: 0.75,
    rainfall: 98,
    saturation: 95,
    fs: 0.74,
    porePressure: 88,
    discharge: 290,
    floodDepth: 1.8,
    roadBlocked: true,
    villageAtRisk: true,
    desc: 'Runout mass chokes the river gorge, forming a 6m high temporary landslide barrier dam.',
    cameraView: 'RIVER',
  },
  {
    timeStr: '01:10',
    stepName: 'FLOOD',
    label: 'Cascade Inundation',
    targetProgress: 0.88,
    rainfall: 85,
    saturation: 92,
    fs: 0.72,
    porePressure: 84,
    discharge: 360,
    floodDepth: 2.8,
    roadBlocked: true,
    villageAtRisk: true,
    desc: 'River overtops earthen blockage; violent surge floods downstream agricultural flats and lower village.',
    cameraView: 'VILLAGE',
  },
  {
    timeStr: '01:20',
    stepName: 'EMERGENCY RESPONSE',
    label: 'Evacuation Mandate',
    targetProgress: 1.0,
    rainfall: 70,
    saturation: 90,
    fs: 0.7,
    porePressure: 80,
    discharge: 320,
    floodDepth: 2.4,
    roadBlocked: true,
    villageAtRisk: true,
    desc: 'Automated siren trigger & First 10 Minutes protocol dispatched. High Ridge Assembly active.',
    cameraView: 'OVERVIEW',
  },
];

export const DigitalTwin3DView: React.FC<DigitalTwin3DViewProps> = ({
  selectedStation,
  onNavigate,
  onOpenSmsModal,
  onOpenEscapeModal,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<DisasterTwinEngine | null>(null);

  // Playback & Step State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x

  // Camera & Mode State
  const [activeCameraView, setActiveCameraView] = useState<CameraViewName>('OVERVIEW');
  const [isCinematicMode, setIsCinematicMode] = useState<boolean>(false);

  // UI Panels & Scenario State
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isAiExplainOpen, setIsAiExplainOpen] = useState<boolean>(true);
  const [isResponseBannerVisible, setIsResponseBannerVisible] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<InteractiveEntityInfo | null>(null);
  const [activeScenarioPreset, setActiveScenarioPreset] = useState<'tawang' | 'subansiri' | 'gangtok'>('tawang');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Layer Toggles
  const [layers, setLayers] = useState<LayerVisibility>({
    terrain: true,
    forest: true,
    roads: true,
    rivers: true,
    villages: true,
    rain: true,
    landslide: true,
    flood: true,
    impactZone: true,
    contours: false,
    sensors: true,
    warningSigns: true,
  });

  // What-If Sliders
  const [whatIfRainDelta, setWhatIfRainDelta] = useState<number>(30); // +30%
  const [whatIfSoilMoisture, setWhatIfSoilMoisture] = useState<number>(88);
  const [whatIfRiverLevel, setWhatIfRiverLevel] = useState<number>(3.4);
  const [whatIfSlopeInstability, setWhatIfSlopeInstability] = useState<number>(0.92);

  // Initialize Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;
    const engine = new DisasterTwinEngine(containerRef.current, (info) => {
      setSelectedEntity(info);
    });
    engineRef.current = engine;

    const handleResize = () => {
      if (containerRef.current && engineRef.current) {
        engineRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Sync simulation progress to 3D engine
  const applyStepState = useCallback((stepIdx: number, customProgress?: number) => {
    const step = TIMELINE_STEPS[stepIdx];
    if (!step) return;

    const prog = customProgress !== undefined ? customProgress : step.targetProgress;
    setProgress(prog);
    setCurrentStepIdx(stepIdx);

    const scenarioState: ScenarioState = {
      stepIndex: stepIdx,
      progress: prog,
      rainfallMmH: step.rainfall,
      soilSaturationPct: step.saturation,
      factorOfSafety: step.fs,
      porePressureKpa: step.porePressure,
      riverDischargeM3s: step.discharge,
      floodWaterDepthM: step.floodDepth,
      roadBlocked: step.roadBlocked,
      villageAtRisk: step.villageAtRisk,
      statusText: `${step.stepName}: ${step.label} (${step.desc})`,
    };

    if (engineRef.current) {
      engineRef.current.setSimulationProgress(prog, scenarioState);
    }

    // Show Emergency Response banner if impact has occurred
    if (stepIdx >= 5) {
      setIsResponseBannerVisible(true);
    } else {
      setIsResponseBannerVisible(false);
    }
  }, []);

  // Timeline Auto-play Loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 3000 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStepIdx((prev) => {
        if (prev >= TIMELINE_STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        applyStepState(next);
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, applyStepState]);

  // Handle Layer Toggle
  const toggleLayer = (key: keyof LayerVisibility) => {
    const updated = { ...layers, [key]: !layers[key] };
    setLayers(updated);
    if (engineRef.current) {
      engineRef.current.setLayerVisibility(updated);
    }
  };

  // Camera preset handler
  const handleSelectCamera = (view: CameraViewName) => {
    setActiveCameraView(view);
    setIsCinematicMode(false);
    if (engineRef.current) {
      engineRef.current.setCameraView(view);
    }
  };

  // Cinematic mode toggle
  const handleToggleCinematic = () => {
    if (engineRef.current) {
      const active = engineRef.current.toggleCinematicTour();
      setIsCinematicMode(active);
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Quick Sensor Focus helper
  const handleFocusSensor = (sensorKey: 'sensor_tiltmeter' | 'sensor_piezometer' | 'sensor_aws' | 'sensor_river_radar') => {
    const step = TIMELINE_STEPS[currentStepIdx] || TIMELINE_STEPS[0];
    if (sensorKey === 'sensor_tiltmeter') {
      handleSelectCamera('SLOPE');
      setSelectedEntity({
        id: 'sensor_tiltmeter',
        name: 'BhuShakti Inclinometer Node INCL-01 (Shear Creep)',
        category: 'sensor',
        metrics: {
          'Sensor Type': 'Bi-Axial Subsurface MEMS Inclinometer',
          'Shear Creep Tilt': `${(progress * 6.8 + 1.2).toFixed(2)}°`,
          'Displacement Rate': `${(progress * 18.5 + 0.4).toFixed(1)} mm/hr`,
          'LoRa Telemetry': '433 MHz • -68 dBm • Battery 98%',
        },
        status: progress >= 0.35 ? 'CRITICAL DISPLACEMENT ACCELERATION' : 'NOMINAL EQUILIBRIUM',
        aiRecommendation: 'Real-time inclinometer indicates active progressive shear creep along 42° plane. Immediate downslope hazard clearance recommended.',
      });
    } else if (sensorKey === 'sensor_piezometer') {
      handleSelectCamera('SLOPE');
      setSelectedEntity({
        id: 'sensor_piezometer',
        name: 'BhuShakti Piezometer PIEZ-04 (Pore-Water Hydrostatic)',
        category: 'sensor',
        metrics: {
          'Pore-Water Pressure': `${step.porePressure} kPa`,
          'Groundwater Head': `+${(progress * 4.6 + 0.8).toFixed(1)}m elevation`,
          'Effective Stress': `${Math.max(12, Math.round(100 - step.porePressure * 0.85))}% of baseline`,
          'Borehole Depth': '14.5m below surface',
        },
        status: step.porePressure >= 65 ? 'HYDROSTATIC UPLIFT CRITICAL' : 'EQUILIBRIUM HYDROLOGY',
        aiRecommendation: 'Hydrostatic pore-water uplift has reduced normal clamping stress by over 50%. Saturated liquefaction failure imminent.',
      });
    } else if (sensorKey === 'sensor_aws') {
      handleSelectCamera('MOUNTAIN');
      setSelectedEntity({
        id: 'sensor_aws',
        name: 'Automatic Weather Station (AWS-02 High Catchment)',
        category: 'sensor',
        metrics: {
          'Precipitation Rate': `${step.rainfall} mm/h`,
          '24h Cumulative Rain': `${Math.round(step.rainfall * 2.8 + 48)} mm`,
          'Soil Saturation': `${step.saturation}% volumetric`,
          'Anemometer Wind': `${Math.round(step.rainfall * 0.45 + 18)} km/h`,
        },
        status: step.rainfall >= 70 ? 'CLOUDBURST THRESHOLD BREACHED' : 'MONITORING PRECIPITATION',
        aiRecommendation: 'Catchment precipitation intensity exceeded 70 mm/h. Automatic flash cascade alert dispatched to disaster management network.',
      });
    } else if (sensorKey === 'sensor_river_radar') {
      handleSelectCamera('RIVER');
      setSelectedEntity({
        id: 'sensor_river_radar',
        name: 'Ultrasonic River Stage Radar (RAD-03 Bridge Pier)',
        category: 'sensor',
        metrics: {
          'River Stage Surcharge': `+${step.floodDepth.toFixed(2)}m above datum`,
          'River Discharge': `${step.discharge} m³/s`,
          'Gorge Barrier Dam': progress >= 0.58 ? 'Landslide Barrier Damming Active' : 'Free Flowing',
          'Ultrasonic Range': '15.4m to riverbed',
        },
        status: step.floodDepth >= 1.2 ? 'SURGE FLOODING' : 'STABLE STREAMFLOW',
        aiRecommendation: 'Upstream landslide dam forming water surcharge. Downstream evacuation alert triggered for riverbank agrarian parcels.',
      });
    }
  };

  // Reset entire disaster twin
  const handleReset = () => {
    setIsPlaying(false);
    setIsCinematicMode(false);
    setIsResponseBannerVisible(false);
    setSelectedEntity(null);
    applyStepState(0, 0);
    if (engineRef.current) {
      engineRef.current.resetSimulation();
    }
  };

  // Trigger cascade disaster shortcut
  const handleTriggerCascade = () => {
    handleReset();
    setIsCinematicMode(true);
    if (engineRef.current) {
      engineRef.current.toggleCinematicTour(true);
    }
    setIsPlaying(true);
  };

  const currentStep = TIMELINE_STEPS[currentStepIdx] || TIMELINE_STEPS[0];

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full ${
        isFullscreen ? 'h-screen fixed inset-0 z-50 rounded-none' : 'h-[calc(100vh-80px)] min-h-[720px] rounded-3xl'
      } bg-slate-900 overflow-hidden border border-slate-200/40 shadow-2xl flex flex-col isolate select-none transition-all`}
    >
      {/* 3D WebGL Canvas Container (85–90% Viewport Presence) */}
      <div
        ref={containerRef}
        id="disaster-twin-3d-canvas"
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* ============================================================== */}
      {/* TOP FLOATING HUD: HEADER, SCENARIO & SIMULATION STATUS         */}
      {/* ============================================================== */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2.5 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Top-Left: Digital Twin Title, Scenario Presets & Metadata */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-2.5 px-3.5 border border-slate-200/90 shadow-lg pointer-events-auto flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
              <Mountain className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-black tracking-wider uppercase text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                  BHUSHAKTI 3D
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                  {SCENARIO_PRESETS[activeScenarioPreset].badge}
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight mt-0.5 truncate">
                {SCENARIO_PRESETS[activeScenarioPreset].title}
              </h1>
              <p className="text-[9px] text-slate-500 font-medium truncate">
                {SCENARIO_PRESETS[activeScenarioPreset].region} • {SCENARIO_PRESETS[activeScenarioPreset].corridor}
              </p>
            </div>

            {/* Scenario Preset Selector Tabs */}
            <div className="hidden md:flex items-center gap-1 pl-2 border-l border-slate-200">
              {(['tawang', 'subansiri', 'gangtok'] as const).map((scKey) => (
                <button
                  key={scKey}
                  onClick={() => {
                    setActiveScenarioPreset(scKey);
                    handleReset();
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                    activeScenarioPreset === scKey
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  title={SCENARIO_PRESETS[scKey].title}
                >
                  {scKey}
                </button>
              ))}
            </div>
          </div>

          {/* Top-Center: Current Disaster Phase Pill */}
          <div className="bg-white/95 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-slate-200/90 shadow-lg pointer-events-auto flex items-center gap-2 mx-auto">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                currentStepIdx >= 6
                  ? 'bg-rose-500 animate-ping'
                  : currentStepIdx >= 4
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-black text-slate-900 uppercase font-mono tracking-wider">
              {currentStep.stepName}:
            </span>
            <span
              className={`text-xs font-bold ${
                currentStepIdx >= 6
                  ? 'text-rose-600'
                  : currentStepIdx >= 4
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }`}
            >
              {currentStep.label}
            </span>
            <span className="hidden sm:inline-block text-[11px] font-mono font-bold text-slate-400 border-l border-slate-200 pl-2">
              FS: {currentStep.fs.toFixed(2)}
            </span>
          </div>

          {/* Top-Right: Camera Presets, Fullscreen & Controls */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200/90 shadow-lg pointer-events-auto flex items-center gap-1 flex-wrap">
            {/* Camera Preset Buttons */}
            {(
              [
                { id: 'OVERVIEW', label: 'Overview', icon: Compass },
                { id: 'MOUNTAIN', label: 'Peak', icon: Mountain },
                { id: 'SLOPE', label: 'Slope', icon: Flame },
                { id: 'ROAD', label: 'Road', icon: AlertTriangle },
                { id: 'RIVER', label: 'River', icon: Waves },
                { id: 'VILLAGE', label: 'Village', icon: MapPin },
                { id: 'AERIAL', label: 'Aerial', icon: Eye },
              ] as const
            ).map((cam) => {
              const Icon = cam.icon;
              const isSelected = activeCameraView === cam.id && !isCinematicMode;
              return (
                <button
                  key={cam.id}
                  onClick={() => handleSelectCamera(cam.id)}
                  className={`px-2 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title={`Switch camera to ${cam.label} angle`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">{cam.label}</span>
                </button>
              );
            })}

            {/* Cinematic Drone Tour Toggle */}
            <button
              onClick={handleToggleCinematic}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isCinematicMode
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-500/30 animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
              title="Automated Drone Cinematic Disaster Tour"
            >
              <Camera className="w-3.5 h-3.5 text-rose-500 group-hover:text-white" />
              <span className="hidden sm:inline">Drone</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={handleToggleFullscreen}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Secondary HUD Row: Quick IoT Station Jump Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-xl p-1.5 px-3 border border-slate-200/80 shadow-md flex items-center gap-1.5 text-[11px] font-bold">
            <span className="text-[10px] font-mono uppercase text-slate-500 font-black mr-1 flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-600" />
              <span>3D SENSORS:</span>
            </span>
            <button
              onClick={() => handleFocusSensor('sensor_tiltmeter')}
              className="px-2 py-0.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>INCL-01 Tiltmeter</span>
            </button>
            <button
              onClick={() => handleFocusSensor('sensor_piezometer')}
              className="px-2 py-0.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span>PIEZ-04 Piezometer</span>
            </button>
            <button
              onClick={() => handleFocusSensor('sensor_aws')}
              className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>AWS-02 Rain Gauge</span>
            </button>
            <button
              onClick={() => handleFocusSensor('sensor_river_radar')}
              className="px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-mono text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span>RAD-03 River Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* LEFT FLOATING LAYER TOGGLES (Interactive Scene Controls)       */}
      {/* ============================================================== */}
      <div className="absolute left-3 top-28 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-2 border border-slate-200/90 shadow-xl space-y-1 w-44">
        <div className="px-2 py-1 text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-1 mb-1">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>3D SCENE LAYERS</span>
        </div>

        {/* Contour Lines ON/OFF */}
        <button
          onClick={() => toggleLayer('contours')}
          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            layers.contours
              ? 'bg-cyan-50 text-cyan-900 border border-cyan-300 font-bold'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span>📈</span>
            <span>Contours</span>
          </div>
          <span
            className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
              layers.contours ? 'bg-cyan-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {layers.contours ? 'ON' : 'OFF'}
          </span>
        </button>

        {(
          [
            { key: 'terrain', label: 'Terrain', icon: '🌄' },
            { key: 'forest', label: 'Forest', icon: '🌲' },
            { key: 'roads', label: 'NH-13 Road', icon: '🛣' },
            { key: 'rivers', label: 'River Gorge', icon: '🌊' },
            { key: 'villages', label: 'Village', icon: '🏘' },
            { key: 'rain', label: 'Precipitation', icon: '🌧' },
            { key: 'landslide', label: 'Slide Debris', icon: '⛰' },
            { key: 'flood', label: 'Flood Inundation', icon: '🌊' },
            { key: 'impactZone', label: 'Impact Zone', icon: '🚨' },
            { key: 'sensors', label: 'IoT Sensors', icon: '📡' },
            { key: 'warningSigns', label: 'Hazard Signs', icon: '⚠️' },
          ] as const
        ).map((layer) => {
          const isActive = layers[layer.key] !== false;
          return (
            <button
              key={layer.key}
              onClick={() => toggleLayer(layer.key)}
              className={`w-full flex items-center justify-between px-2 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-900 border border-blue-200/60 font-bold'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span>{layer.icon}</span>
                <span>{layer.label}</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  isActive ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* RIGHT FLOATING PANELS: WHAT-IF CONTROLS & AI EXPLANATION       */}
      {/* ============================================================== */}
      <div className="absolute right-4 top-24 z-20 space-y-3 pointer-events-none max-w-xs sm:w-80">
        {/* 1. What-If Scenario Simulator Panel */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden pointer-events-auto">
          <div
            onClick={() => setIsWhatIfOpen(!isWhatIfOpen)}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 border-b border-slate-100"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                WHAT-IF SIMULATION
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 transition-transform ${
                isWhatIfOpen ? 'rotate-180' : ''
              }`}
            />
          </div>

          {isWhatIfOpen && (
            <div className="p-3.5 text-xs space-y-3">
              <div className="text-[10px] text-slate-500 font-medium">
                Stress-test slope and river under hypothetical weather anomalies.
              </div>

              {/* Rain Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-600 font-bold">Rainfall:</span>
                  <span className="font-extrabold text-blue-600">+{whatIfRainDelta}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={whatIfRainDelta}
                  onChange={(e) => setWhatIfRainDelta(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 rounded-lg bg-slate-200"
                />
              </div>

              {/* Soil Moisture Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-600 font-bold">Soil Moisture:</span>
                  <span className="font-extrabold text-amber-600">{whatIfSoilMoisture}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={whatIfSoilMoisture}
                  onChange={(e) => setWhatIfSoilMoisture(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-1.5 rounded-lg bg-slate-200"
                />
              </div>

              {/* River Level Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-600 font-bold">River Surcharge:</span>
                  <span className="font-extrabold text-cyan-600">+{whatIfRiverLevel}m</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  step="0.2"
                  value={whatIfRiverLevel}
                  onChange={(e) => setWhatIfRiverLevel(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer h-1.5 rounded-lg bg-slate-200"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    applyStepState(4); // Jump to Landslide event with amplified values
                  }}
                  className="flex-1 py-1.5 px-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-[11px] shadow-sm cursor-pointer"
                >
                  RUN SCENARIO
                </button>
                <button
                  onClick={() => {
                    setWhatIfRainDelta(30);
                    setWhatIfSoilMoisture(88);
                    setWhatIfRiverLevel(3.4);
                    setWhatIfSlopeInstability(0.92);
                  }}
                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] cursor-pointer"
                >
                  RESET
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. AI Explanation Panel */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden pointer-events-auto">
          <div
            onClick={() => setIsAiExplainOpen(!isAiExplainOpen)}
            className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50 border-b border-slate-100"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-black text-slate-900 uppercase tracking-tight">
                🧠 BHUSHAKTI AI
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-mono font-black rounded-md">
                84 / 100
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  isAiExplainOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          {isAiExplainOpen && (
            <div className="p-3.5 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-800">CURRENT RISK STATE:</span>
                <span className="text-rose-600 font-mono">VERY HIGH</span>
              </div>

              <div className="text-[10px] font-bold uppercase text-slate-500 font-mono tracking-wider">
                PHYSICS-INFORMED PINN WEIGHTS:
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-700">
                  <span>Precipitation (24h)</span>
                  <span className="font-mono font-bold text-slate-900">30%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[30%]" />
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Soil Moisture Saturation</span>
                  <span className="font-mono font-bold text-slate-900">20%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[20%]" />
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Slope Angle (42° shear)</span>
                  <span className="font-mono font-bold text-slate-900">20%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[20%]" />
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Historical Colluvial Slide</span>
                  <span className="font-mono font-bold text-slate-900">15%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[15%]" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>DEMO CONFIDENCE:</span>
                <span className="font-bold text-emerald-600">78.4%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* EMERGENCY RESPONSE OVERLAY (Appears after disaster impact)      */}
      {/* ============================================================== */}
      {isResponseBannerVisible && (
        <div className="absolute bottom-28 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-rose-300 shadow-2xl flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shrink-0 animate-pulse shadow-md shadow-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  🚨 EMERGENCY RESPONSE ACTIVATED
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Impact Zone Surcharged
                </span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Threatened Assets: <strong className="text-slate-900">42 Villages</strong> •{' '}
                <strong className="text-slate-900">18 Roads Blocked</strong> •{' '}
                <strong className="text-slate-900">12 Critical Lifelines</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (onOpenEscapeModal) onOpenEscapeModal();
                else if (onNavigate) onNavigate('emergency_response');
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Safe Route</span>
            </button>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('war_room');
              }}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>First 10 Minutes</span>
            </button>

            <button
              onClick={() => {
                if (onNavigate) onNavigate('emergency_response');
              }}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Resource Optimizer</span>
            </button>

            <button
              onClick={() => {
                if (onOpenSmsModal) onOpenSmsModal();
              }}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast SMS</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BOTTOM ACTION BAR & INTERACTIVE SIMULATION TIMELINE             */}
      {/* ============================================================== */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xl space-y-2.5">
        {/* Step Indicator Badges & Timeline Scrubber */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {TIMELINE_STEPS.map((step, idx) => {
            const isCurrent = currentStepIdx === idx;
            const isPast = currentStepIdx > idx;
            return (
              <button
                key={step.stepName}
                onClick={() => applyStepState(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                    : isPast
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                title={step.desc}
              >
                <span className="font-mono text-[10px] opacity-80">{step.timeStr}</span>
                <span>{step.stepName}</span>
              </button>
            );
          })}
        </div>

        {/* Primary Controls & Scenario Action Triggers */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Play/Pause & Speed */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-sm ${
                isPlaying
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'PAUSE' : 'SIMULATE'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs font-mono font-bold">
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <div className="hidden md:block text-xs text-slate-600 font-medium truncate max-w-sm ml-2">
              {currentStep.desc}
            </div>
          </div>

          {/* Disaster Event Shortcut Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => applyStepState(1)}
              className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <CloudRain className="w-3.5 h-3.5 text-cyan-600" />
              <span>Heavy Rain</span>
            </button>

            <button
              onClick={() => applyStepState(4)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>Trigger Slide</span>
            </button>

            <button
              onClick={() => applyStepState(7)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Waves className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulate Flood</span>
            </button>

            <button
              onClick={handleTriggerCascade}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black transition-all shadow-md shadow-red-500/25 cursor-pointer flex items-center gap-1.5"
              title="Run full cascade: Landslide -> River Gorge Dam -> Flood Inundation"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Cascade Event</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
