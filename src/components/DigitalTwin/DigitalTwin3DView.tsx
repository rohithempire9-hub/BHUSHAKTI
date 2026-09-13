import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Layers,
  Compass,
  Eye,
  Sliders,
  Maximize2,
  AlertTriangle,
  Info,
  Waves,
  Mountain,
  MapPin,
  Flame,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { LandslideStation } from '../../types/landslide';

interface DigitalTwin3DViewProps {
  selectedStation: LandslideStation | null;
  onOpenSmsAlert?: () => void;
}

type SimulationMode = 'landslide' | 'flood';

const LANDSLIDE_STEPS = [
  { step: 1, title: 'Torrential Precipitation', desc: 'Sustained monsoon cloudburst delivering 28 mm/h rainfall onto Sela Pass colluvial slopes.' },
  { step: 2, title: 'Soil Saturation Increases', desc: 'Volumetric soil water content breaches 84%; pore-water pressure rises to 71 kPa, causing hydrostatic uplift.' },
  { step: 3, title: 'Slope Unstable & FS Degradation', desc: 'Limit equilibrium Factor of Safety drops from 1.62 to 1.04; shear stresses equal resisting friction.' },
  { step: 4, title: 'Tension Cracks Emerge', desc: 'A 45m arcuate tension fracture opens along the upper crown with a 12cm opening aperture.' },
  { step: 5, title: 'Shear Failure Initiation', desc: 'Crown rupture detaches; basal shear slip activates along the 48° weathered bedrock interface.' },
  { step: 6, title: 'Dynamic Debris Fluidization', desc: 'Over 18,000 metric tons of fractured gneiss, mud, and boulders accelerate down the gully.' },
  { step: 7, title: 'Downslope Channeled Travel', desc: 'Debris avalanche accelerates to 42 km/h through the natural chute towards the transportation corridor.' },
  { step: 8, title: 'Highway & Bridge Impact', desc: 'High-energy avalanche deposits across 380m of NH-13, striking the Sela South Portal bridge abutment.' },
  { step: 9, title: 'Final Impact & Runout Cone', desc: 'Deposit fan stabilizes with 4.5m average depth. Lifeline highway severed; emergency detour activated.' },
];

const FLOOD_STEPS = [
  { step: 1, title: 'Heavy Rainfall Trigger', desc: 'Cloudburst over upper catchment basin generates 180mm runoff.' },
  { step: 2, title: 'Surface Runoff Surcharge', desc: 'High-gradient mountain torrents funnel water into primary river tributaries (Orange flow).' },
  { step: 3, title: 'River Discharge Escalation', desc: 'Main river channel level rises by 3.8 meters (Red High Flow status).' },
  { step: 4, title: 'Debris Siltation & Damming', desc: 'Landslide debris impedes gorge flow, creating an artificial upstream siltation lake.' },
  { step: 5, title: 'Bank Embankment Overflow', desc: 'River overtops natural levees and revetments (Purple Overflow status).' },
  { step: 6, title: 'Low-Elevation Inundation', desc: 'Water and slurry flood low-lying agricultural terraces and village schools (Dark Blue flooded area).' },
];

export const DigitalTwin3DView: React.FC<DigitalTwin3DViewProps> = ({
  selectedStation,
  onOpenSmsAlert,
}) => {
  const [activeMode, setActiveMode] = useState<SimulationMode>('landslide');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.5x, 1x, 2x

  // 3D Controls
  const [rotationX, setRotationX] = useState<number>(35); // tilt angle
  const [rotationY, setRotationY] = useState<number>(45); // azimuth
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layer Toggles
  const [showTerrain, setShowTerrain] = useState<boolean>(true);
  const [showSatelliteOverlay, setShowSatelliteOverlay] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showRivers, setShowRivers] = useState<boolean>(true);
  const [showVillages, setShowVillages] = useState<boolean>(true);
  const [showHazardZones, setShowHazardZones] = useState<boolean>(true);
  const [showWaterFlow, setShowWaterFlow] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const maxSteps = activeMode === 'landslide' ? LANDSLIDE_STEPS.length : FLOOD_STEPS.length;
    const intervalTime = 2500 / playbackSpeed;

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= maxSteps - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, activeMode]);

  // Handle canvas mouse drag for 3D Orbit
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotationY((prev) => (prev + deltaX * 0.5) % 360);
    setRotationX((prev) => Math.max(10, Math.min(80, prev - deltaY * 0.3)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleResetView = () => {
    setRotationX(35);
    setRotationY(45);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  // Render 3D Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background sky / atmospheric gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#04091a');
    skyGrad.addColorStop(0.6, '#081436');
    skyGrad.addColorStop(1, '#0e2354');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + panOffset.x, height / 2 + panOffset.y + 40);
    ctx.scale(zoomLevel, zoomLevel * Math.cos((rotationX * Math.PI) / 180));
    ctx.rotate((rotationY * Math.PI) / 180);

    // Draw 3D Isometric Terrain Grid
    const gridSize = 24;
    const step = 22;
    const half = (gridSize * step) / 2;

    // Draw mountain elevation surface
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = -half + i * step;
        const y = -half + j * step;

        // Realistic mountain ridge function
        const distFromCenter = Math.hypot(i - 12, j - 12);
        const elevation =
          Math.sin(i * 0.25) * 35 +
          Math.cos(j * 0.25) * 45 +
          Math.exp(-distFromCenter * 0.15) * 60;

        if (showTerrain) {
          ctx.beginPath();
          ctx.rect(x, y, step, step);

          // Color based on elevation & mode
          const shade = Math.min(240, Math.max(20, Math.round(elevation * 2)));
          if (showSatelliteOverlay) {
            ctx.fillStyle = `rgb(${Math.round(shade * 0.35 + 10)}, ${Math.round(shade * 0.5 + 25)}, ${Math.round(shade * 0.3 + 35)})`;
          } else {
            ctx.fillStyle = `rgb(16, ${Math.round(40 + shade * 0.4)}, ${Math.round(80 + shade * 0.6)})`;
          }
          ctx.fill();
          ctx.strokeStyle = 'rgba(30, 58, 138, 0.4)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw Main River Channel (Blue)
    if (showRivers) {
      ctx.beginPath();
      ctx.moveTo(-half, half * 0.4);
      ctx.bezierCurveTo(-half * 0.2, half * 0.2, half * 0.1, half * 0.6, half, half * 0.5);
      ctx.strokeStyle = activeMode === 'flood' && currentStepIndex >= 3 ? '#ef4444' : '#2563eb';
      ctx.lineWidth = activeMode === 'flood' && currentStepIndex >= 4 ? 20 : 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Flow direction arrows / particle line
      if (showWaterFlow) {
        ctx.strokeStyle = activeMode === 'flood' && currentStepIndex >= 4 ? '#a855f7' : '#38bdf8';
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw Strategic Highway Corridor (NH-13)
    if (showRoads) {
      ctx.beginPath();
      ctx.moveTo(-half * 0.8, -half * 0.7);
      ctx.lineTo(-half * 0.2, -half * 0.3);
      ctx.lineTo(half * 0.4, half * 0.1);
      ctx.lineTo(half * 0.8, half * 0.7);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Road centerline
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw Villages & Infrastructure Nodes
    if (showVillages) {
      const villages = [
        { x: half * 0.45, y: half * 0.15, label: 'Jang Community' },
        { x: -half * 0.6, y: -half * 0.5, label: 'Baisakhi Depot' },
        { x: half * 0.2, y: half * 0.55, label: 'River Hamlets' },
      ];
      villages.forEach((v) => {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(v.x, v.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    // SIMULATION ANIMATION OVERLAY
    if (activeMode === 'landslide') {
      // Step-based landslide growth
      const progress = (currentStepIndex + 1) / LANDSLIDE_STEPS.length;
      const startX = -half * 0.1;
      const startY = -half * 0.4;
      const endX = half * 0.3;
      const endY = half * 0.05;

      const currentEndX = startX + (endX - startX) * progress;
      const currentEndY = startY + (endY - startY) * progress;

      // Draw tension crack if step >= 4
      if (currentStepIndex >= 3) {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(startX, startY, 25, 0, Math.PI);
        ctx.stroke();
      }

      // Draw flowing debris path if step >= 5
      if (currentStepIndex >= 4) {
        const grad = ctx.createLinearGradient(startX, startY, currentEndX, currentEndY);
        grad.addColorStop(0, '#e11d48');
        grad.addColorStop(0.5, '#d97706');
        grad.addColorStop(1, '#78350f');

        ctx.beginPath();
        ctx.moveTo(startX - 20, startY);
        ctx.quadraticCurveTo((startX + currentEndX) / 2 - 30, (startY + currentEndY) / 2, currentEndX - 35, currentEndY);
        ctx.lineTo(currentEndX + 35, currentEndY);
        ctx.quadraticCurveTo((startX + currentEndX) / 2 + 30, (startY + currentEndY) / 2, startX + 20, startY);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Debris particles
        for (let p = 0; p < 25; p++) {
          const px = startX + (currentEndX - startX) * Math.random() + (Math.random() - 0.5) * 30;
          const py = startY + (currentEndY - startY) * Math.random() + (Math.random() - 0.5) * 30;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Highway blockage marker if step >= 8
      if (currentStepIndex >= 7) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(currentEndX, currentEndY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    } else {
      // FLOOD SIMULATION MODE
      const floodRadius = (currentStepIndex + 1) * 22;
      ctx.fillStyle = 'rgba(30, 58, 138, 0.65)';
      ctx.beginPath();
      ctx.ellipse(half * 0.1, half * 0.45, floodRadius * 1.6, floodRadius, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    // 2D Screen Overlay: Compass Rose & Orientation
    ctx.save();
    ctx.translate(width - 55, 55);
    ctx.rotate((rotationY * Math.PI) / 180);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(7, 0);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, 22);
    ctx.lineTo(7, 0);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }, [
    rotationX,
    rotationY,
    zoomLevel,
    panOffset,
    showTerrain,
    showSatelliteOverlay,
    showRoads,
    showRivers,
    showVillages,
    showWaterFlow,
    activeMode,
    currentStepIndex,
  ]);

  const activeStepList = activeMode === 'landslide' ? LANDSLIDE_STEPS : FLOOD_STEPS;
  const currentStep = activeStepList[currentStepIndex];

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-12">
      {/* 1. TOP CONTROL BAR */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              3D DIGITAL TWIN &amp; KINEMATIC SIMULATOR
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              PHYSICS-BASED RUNOUT
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            3D Terrain Digital Twin &amp; Multi-Hazard Simulation
          </h1>
          <p className="text-xs text-cyan-300/90 mt-1 max-w-2xl">
            Interactive WebGL mountain topography showing failure kinematics, debris runout cones, and river inundation patterns.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-1 rounded-xl bg-[#09132d] border border-[#1a346e] flex items-center gap-1">
            <button
              onClick={() => {
                setActiveMode('landslide');
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'landslide'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>3D Landslide Kinematics</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('flood');
                setCurrentStepIndex(0);
                setIsPlaying(false);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'flood'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Waves className="w-4 h-4 text-cyan-300" />
              <span>3D Flood &amp; Water Flow</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3D VIEWPORT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CANVAS VIEWPORT (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative rounded-2xl bg-[#050b1d] border border-[#162e66] shadow-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center select-none">
            {/* 3D Canvas */}
            <canvas
              ref={canvasRef}
              width={960}
              height={540}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full object-cover cursor-grab active:cursor-grabbing"
            />

            {/* Orbit HUD Instructions */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-slate-300 pointer-events-none">
              Click &amp; Drag to Orbit (Tilt: {Math.round(rotationX)}°, Yaw: {Math.round(rotationY)}°)
            </div>

            {/* 3D Viewport Controls (Overlay Top-Right) */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="w-8 h-8 rounded-lg bg-[#0e214d] hover:bg-cyan-600 text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="w-8 h-8 rounded-lg bg-[#0e214d] hover:bg-cyan-600 text-white text-xs font-bold flex items-center justify-center transition-all cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <button
                onClick={handleResetView}
                className="px-2.5 h-8 rounded-lg bg-[#0e214d] hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Disclaimer Strip */}
            <div className="absolute bottom-3 left-3 right-3 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-[10px] text-amber-200 flex items-center justify-between pointer-events-none">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>SCENARIO VISUALIZATION</strong>: Kinematic risk simulation for decision support. Not a deterministic physical forecast.</span>
              </span>
              <span className="font-mono text-cyan-300">Station: {selectedStation?.name || 'Tawang Sela Pass'}</span>
            </div>
          </div>

          {/* SIMULATION TIMELINE CONTROLS */}
          <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-4 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause Simulation' : 'Start Simulation'}</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#0e214d] hover:bg-[#142d69] text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              </div>

              {/* Speed Controller */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400 mr-1">Speed:</span>
                {[0.5, 1, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPlaybackSpeed(s)}
                    className={`px-2.5 py-1 rounded-lg border cursor-pointer font-bold ${
                      playbackSpeed === s
                        ? 'bg-cyan-500 text-white border-cyan-400'
                        : 'bg-[#0e214d] text-slate-400 border-[#1a3670]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Step indicator */}
              <div className="font-mono text-xs text-cyan-300 font-bold">
                Step {currentStep.step} of {activeStepList.length}
              </div>
            </div>

            {/* Step Progress Scrubber */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={0}
                max={activeStepList.length - 1}
                value={currentStepIndex}
                onChange={(e) => {
                  setCurrentStepIndex(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="w-full h-2 bg-[#0c1e47] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{activeStepList[0].title}</span>
                <span>{activeStepList[activeStepList.length - 1].title}</span>
              </div>
            </div>

            {/* Active Step Description Card */}
            <div className="p-3.5 rounded-xl bg-[#0c1c42] border border-cyan-500/40 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-black flex items-center justify-center shrink-0 text-xs">
                {currentStep.step}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                  {currentStep.title}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {currentStep.desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LAYER TOGGLES & WATER FLOW INTELLIGENCE (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Layer Controls Card */}
          <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#162e66]">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                3D Geospatial Layer Toggles
              </h3>
            </div>

            <div className="space-y-2">
              {[
                { label: '3D High-Res CartoDEM Terrain', active: showTerrain, toggle: () => setShowTerrain(!showTerrain) },
                { label: 'Satellite Surface Texture', active: showSatelliteOverlay, toggle: () => setShowSatelliteOverlay(!showSatelliteOverlay) },
                { label: 'Strategic Highways & Roads (NH-13)', active: showRoads, toggle: () => setShowRoads(!showRoads) },
                { label: 'Main River Drainage Basin', active: showRivers, toggle: () => setShowRivers(!showRivers) },
                { label: 'Villages & Critical Infrastructure', active: showVillages, toggle: () => setShowVillages(!showVillages) },
                { label: 'Dynamic Flow Vectors & Particle Runoff', active: showWaterFlow, toggle: () => setShowWaterFlow(!showWaterFlow) },
              ].map((l) => (
                <button
                  key={l.label}
                  onClick={l.toggle}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    l.active
                      ? 'bg-[#102456] border-cyan-500/50 text-white'
                      : 'bg-[#0b1738] border-[#152a5c] text-slate-400'
                  }`}
                >
                  <span>{l.label}</span>
                  <span
                    className={`w-3 h-3 rounded-full ${
                      l.active ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Water Flow Intelligence Legend (Prompt mandated colors) */}
          <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#162e66]">
              <Waves className="w-4 h-4 text-cyan-300" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Water Flow Intelligence Legend
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Color standards for hydrological discharge and overland flow:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b193d] border border-[#162e66]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#2563eb]" />
                  <span className="font-bold text-white">Main River Channel</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">BLUE</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b193d] border border-[#162e66]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#38bdf8]" />
                  <span className="font-bold text-white">Normal Tributary Flow</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-300">LIGHT BLUE</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b193d] border border-[#162e66]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#f97316]" />
                  <span className="font-bold text-white">Surface Runoff / Hill Torrent</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">ORANGE</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b193d] border border-[#162e66]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#ef4444]" />
                  <span className="font-bold text-white">High Flow / Silt Surcharge</span>
                </div>
                <span className="text-[10px] font-mono text-rose-400">RED</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b193d] border border-[#162e66]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#a855f7]" />
                  <span className="font-bold text-white">Levee / Bank Overflow</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400">PURPLE</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0b193d] border border-[#162e66]">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded bg-[#1e3a8a]" />
                  <span className="font-bold text-white">Submerged Flooded Lowland</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400">DARK BLUE</span>
              </div>
            </div>

            {onOpenSmsAlert && (
              <button
                onClick={onOpenSmsAlert}
                className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-white" />
                <span>Trigger Downstream Inundation SMS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
