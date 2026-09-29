import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Compass,
  MapPin,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  X,
  Activity,
  AlertTriangle,
  Zap,
  Play,
  Pause,
  FastForward,
  Rewind,
  ShieldCheck,
  ChevronRight,
  Info,
  Clock,
  Sparkles,
  Building,
  Route,
  Users,
  Eye,
  EyeOff,
  Flame,
  Droplets,
  Mountain,
  Waves,
  CloudRain,
  AlertOctagon,
  Layers,
  Crosshair
} from 'lucide-react';
import {
  BHUSAKTHI_LOCATIONS,
  BhusakthiLocation
} from '../../data/bhusakthiLocations';
import {
  DisasterType,
  SimulationSeverity,
  SimulationParams,
  SimulationImpactResult,
  calculateDisasterImpact,
  DISASTER_TYPE_METADATA
} from './disasterSimulationData';

interface CesiumDigitalTwinProps {
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
  onOpenSmsModal?: () => void;
  onOpenEscapeModal?: () => void;
}

// Module-level guard to ensure single Cesium Viewer instance
let cesiumInitialized = false;

export const CesiumDigitalTwin: React.FC<CesiumDigitalTwinProps> = ({
  selectedLocationId,
  onLocationChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // SECTION 3 & 6: Persistent refs
  const viewerRef = useRef<any>(null);
  const buildingsRef = useRef<any>(null);
  const viewerReadyRef = useRef<boolean>(false);
  const viewerCountRef = useRef<number>(0);

  // React UI States
  const [cesiumReady, setCesiumReady] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [showPerfPanel, setShowPerfPanel] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Diagnostic states
  const [viewerCount, setViewerCount] = useState<number>(0);
  const [osmBuildingsStatus, setOsmBuildingsStatus] = useState<string>('LOADING');
  const [terrainStatus, setTerrainStatus] = useState<string>('INITIALIZING');

  // SECTION 2: Selected location from single source of truth
  const selectedLocation = BHUSAKTHI_LOCATIONS[selectedLocationId] || BHUSAKTHI_LOCATIONS['agartala'];

  // ==========================================================================
  // DISASTER IMPACT SIMULATOR STATE & 3D ENTITY MANAGEMENT
  // ==========================================================================
  const [isSimActive, setIsSimActive] = useState<boolean>(false);
  const [showImpactDossier, setShowImpactDossier] = useState<boolean>(true);
  const [simParams, setSimParams] = useState<SimulationParams>({
    disasterType: 'landslide',
    severity: 'high',
    rainfallMm: 180,
    soilSaturationPct: 85,
    timelineMinutes: 0,
    speedMultiplier: 1,
    isPlaying: false
  });

  const simEntitiesRef = useRef<any[]>([]);

  // Calculate dynamic impact metrics based on location and simulation parameters
  const impactResult = useMemo(() => {
    return calculateDisasterImpact(selectedLocationId, simParams);
  }, [selectedLocationId, simParams]);

  // Clear simulation entities from Cesium Viewer
  const clearSimulation3D = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || viewer.isDestroyed()) return;
    simEntitiesRef.current.forEach((entity) => {
      try {
        viewer.entities.remove(entity);
      } catch (e) {}
    });
    simEntitiesRef.current = [];
    viewer.scene.requestRender();
  }, []);

  // Render 3D simulation entities into Cesium Viewer
  const renderSimulation3D = useCallback((impact: SimulationImpactResult) => {
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;
    if (!viewer || viewer.isDestroyed() || !Cesium) return;

    // Remove previous entities
    simEntitiesRef.current.forEach((entity) => {
      try {
        viewer.entities.remove(entity);
      } catch (e) {}
    });
    simEntitiesRef.current = [];

    const newEntities: any[] = [];

    try {
      // 1. Unstable Slope / Impact Area Polygon
      if (impact.unstableSlopePolygon && impact.unstableSlopePolygon.length >= 3) {
        const coords = impact.unstableSlopePolygon.flatMap(([lon, lat]) => [lon, lat]);
        const isWaterHazard = impact.disasterType.includes('flood') || impact.disasterType === 'heavy_rainfall';
        const polygonColor = isWaterHazard
          ? Cesium.Color.fromCssColorString('#0284c7').withAlpha(0.38)
          : Cesium.Color.fromCssColorString('#ef4444').withAlpha(0.38);
        const outlineColor = isWaterHazard
          ? Cesium.Color.fromCssColorString('#38bdf8')
          : Cesium.Color.fromCssColorString('#f87171');

        const slopeEntity = viewer.entities.add({
          name: 'Hazard Zone',
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(coords),
            material: polygonColor,
            outline: true,
            outlineColor: outlineColor,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            classificationType: Cesium.ClassificationType.BOTH
          }
        });
        newEntities.push(slopeEntity);
      }

      // 2. Debris Flow Path (advances with timeline)
      if (impact.debrisFlowPath && impact.debrisFlowPath.length >= 2) {
        const pathCoords = impact.debrisFlowPath.flatMap(([lon, lat]) => [lon, lat]);
        const debrisEntity = viewer.entities.add({
          name: 'Debris Flow Corridor',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(pathCoords),
            width: 8,
            clampToGround: true,
            material: new Cesium.PolylineOutlineMaterialProperty({
              color: Cesium.Color.fromCssColorString('#f97316'),
              outlineColor: Cesium.Color.fromCssColorString('#7c2d12'),
              outlineWidth: 2
            })
          }
        });
        newEntities.push(debrisEntity);
      }

      // 3. Flood Inundation Polygon
      if (
        (impact.disasterType.includes('flood') || impact.disasterType.includes('cascade') || impact.disasterType.includes('river')) &&
        impact.inundationPolygon &&
        impact.inundationPolygon.length >= 3
      ) {
        const inunCoords = impact.inundationPolygon.flatMap(([lon, lat]) => [lon, lat]);
        const inunEntity = viewer.entities.add({
          name: 'Flood Inundation Extent',
          polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(inunCoords),
            material: Cesium.Color.fromCssColorString('#0ea5e9').withAlpha(0.45),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            classificationType: Cesium.ClassificationType.BOTH
          }
        });
        newEntities.push(inunEntity);
      }

      // 4. Blocked Road Segment
      if (impact.blockedRoadSegment && impact.blockedRoadSegment.length >= 2) {
        const roadCoords = impact.blockedRoadSegment.flatMap(([lon, lat]) => [lon, lat]);
        const blockedRoadEntity = viewer.entities.add({
          name: 'Compromised Road Segment',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(roadCoords),
            width: 10,
            clampToGround: true,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString('#ef4444'),
              gapColor: Cesium.Color.fromCssColorString('#7f1d1d'),
              dashLength: 20
            })
          }
        });
        newEntities.push(blockedRoadEntity);

        const midCoord = impact.blockedRoadSegment[Math.floor(impact.blockedRoadSegment.length / 2)];
        const warningPin = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(midCoord[0], midCoord[1], 15),
          point: {
            pixelSize: 10,
            color: Cesium.Color.RED,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: `⚠ ROAD BLOCKED: ${impact.blockedRoadName}`,
            font: 'bold 11px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
        newEntities.push(warningPin);
      }

      // 5. Safe Evacuation Corridor
      if (impact.safeEvacuationPath && impact.safeEvacuationPath.length >= 2) {
        const evacCoords = impact.safeEvacuationPath.flatMap(([lon, lat]) => [lon, lat]);
        const evacEntity = viewer.entities.add({
          name: 'Safe Evacuation Route',
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray(evacCoords),
            width: 6,
            clampToGround: true,
            material: new Cesium.PolylineOutlineMaterialProperty({
              color: Cesium.Color.fromCssColorString('#10b981'),
              outlineColor: Cesium.Color.fromCssColorString('#064e3b'),
              outlineWidth: 2
            })
          }
        });
        newEntities.push(evacEntity);
      }

      // 6. Safe Shelter / Relief Beacon
      if (impact.shelterCoords) {
        const shelterEntity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(impact.shelterCoords[0], impact.shelterCoords[1], 15),
          point: {
            pixelSize: 14,
            color: Cesium.Color.fromCssColorString('#10b981'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: `🛡 SAFE SHELTER: ${impact.shelterName}`,
            font: 'bold 12px sans-serif',
            fillColor: Cesium.Color.fromCssColorString('#34d399'),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -16),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
        newEntities.push(shelterEntity);
      }

      // 7. River Blockage Point
      if (impact.riverBlockagePoint) {
        const damEntity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(impact.riverBlockagePoint[0], impact.riverBlockagePoint[1], 20),
          point: {
            pixelSize: 14,
            color: Cesium.Color.fromCssColorString('#dc2626'),
            outlineColor: Cesium.Color.YELLOW,
            outlineWidth: 3,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: `⚠ DEBRIS DAM / RIVER CHOKE`,
            font: 'bold 12px sans-serif',
            fillColor: Cesium.Color.YELLOW,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -16),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
        newEntities.push(damEntity);
      }

      // 8. Exposed Buildings
      impact.exposedBuildings.forEach((bldg) => {
        const bldgEntity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(bldg.coords[0], bldg.coords[1], 10),
          point: {
            pixelSize: 8,
            color: bldg.status.includes('affected')
              ? Cesium.Color.fromCssColorString('#ef4444')
              : Cesium.Color.fromCssColorString('#f59e0b'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 1.5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          },
          label: {
            text: `${bldg.name} (${bldg.exposure})`,
            font: '10px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -12),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
          }
        });
        newEntities.push(bldgEntity);
      });
    } catch (renderErr) {
      console.warn('[Cesium Simulation Render Error]:', renderErr);
    }

    simEntitiesRef.current = newEntities;
    viewer.scene.requestRender();
  }, []);

  const focusOnHazardZone = useCallback(() => {
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;
    if (!viewer || viewer.isDestroyed() || !Cesium) return;

    const loc = BHUSAKTHI_LOCATIONS[selectedLocationId] || BHUSAKTHI_LOCATIONS['agartala'];
    viewer.camera.cancelFlight();
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        loc.longitude,
        loc.latitude,
        Math.min(loc.cameraHeight * 0.75, 1600)
      ),
      orientation: {
        heading: Cesium.Math.toRadians(loc.heading || 0),
        pitch: Cesium.Math.toRadians(-40),
        roll: 0
      },
      duration: 1.5,
      complete: () => {
        viewer.scene.requestRender();
      }
    });
  }, [selectedLocationId]);

  const getVerifiedIonToken = useCallback((): string => {
    const token = (import.meta as any).env?.VITE_CESIUM_ION_TOKEN;
    if (token && token.trim() !== '') return token.trim();
    try {
      const stored = localStorage.getItem('CESIUM_ION_TOKEN');
      if (stored && stored.trim() !== '') return stored.trim();
    } catch (e) {}
    return '';
  }, []);

  // ==========================================================================
  // SECTION 4: DEDICATED CAMERA FUNCTION
  // ==========================================================================
  const moveCesiumToLocation = useCallback((location: BhusakthiLocation) => {
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;

    if (!viewer || viewer.isDestroyed()) {
      console.error('Cesium viewer unavailable');
      return;
    }

    if (!location) {
      console.error('Location not found');
      return;
    }

    if (!Cesium) {
      console.error('Cesium library not loaded');
      return;
    }

    console.log(
      'Moving Cesium to:',
      location.name,
      location.latitude,
      location.longitude
    );

    viewer.camera.cancelFlight();

    const destination = Cesium.Cartesian3.fromDegrees(
      location.longitude,
      location.latitude,
      location.cameraHeight
    );

    viewer.camera.flyTo({
      destination: destination,
      orientation: {
        heading: Cesium.Math.toRadians(location.heading || 0),
        pitch: Cesium.Math.toRadians(location.pitch || -35),
        roll: 0
      },
      duration: 2.0,
      complete: function () {
        console.log('Cesium arrived at:', location.name);

        try {
          const cartographic = Cesium.Cartographic.fromCartesian(
            viewer.camera.position
          );
          const latitude = Cesium.Math.toDegrees(cartographic.latitude);
          const longitude = Cesium.Math.toDegrees(cartographic.longitude);
          console.log('ACTUAL CESIUM CAMERA:', latitude, longitude);
        } catch (cErr) {}

        viewer.scene.requestRender();
      },
      cancel: function () {
        console.log('Camera flight cancelled');
      }
    });
  }, []);

  // ==========================================================================
  // SECTION 1, 2, 3: INITIALIZE CESIUM VIEWER ONCE
  // ==========================================================================
  useEffect(() => {
    let isMounted = true;
    let pollInterval: any = null;

    const initCesium = async () => {
      if (!isMounted || !containerRef.current) return;
      if (viewerRef.current) return;

      // Hard safety check
      if (cesiumInitialized) {
        console.warn('BLOCKED DUPLICATE CESIUM INITIALIZATION');
        return;
      }
      cesiumInitialized = true;
      console.log('CESIUM VIEWER INITIALIZED');

      const Cesium = (window as any).Cesium;
      if (!Cesium) return;

      try {
        viewerCountRef.current += 1;
        const currentCount = viewerCountRef.current;
        setViewerCount(currentCount);

        // Configure Ion Token
        const token = getVerifiedIonToken();
        if (token) {
          Cesium.Ion.defaultAccessToken = token;
        }

        // Configure World Terrain ONCE
        let terrainObj: any;
        try {
          terrainObj = Cesium.Terrain.fromWorldTerrain();
          setTerrainStatus('ON (Cesium World Terrain)');
        } catch (tErr) {
          terrainObj = new Cesium.EllipsoidTerrainProvider();
          setTerrainStatus('ON (Standard Ellipsoid)');
        }

        // Base Satellite Imagery Layer (Loaded ONCE, never recreated)
        const satelliteProvider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maximumLevel: 19,
          credit: 'Esri, Maxar, Earthstar Geographics'
        });
        const satelliteLayer = new Cesium.ImageryLayer(satelliteProvider);

        // Initialize Cesium Viewer with performance-first configuration
        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayer: satelliteLayer,
          terrain: terrainObj,
          requestRenderMode: true,
          maximumRenderTimeChange: 0.05, // Allows frame progression during flyTo animations
          animation: false,
          timeline: false,
          sceneModePicker: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          navigationHelpButton: false,
          infoBox: false,
          selectionIndicator: false,
          fullscreenButton: false,
          msaaSamples: 1
        });

        // Atmosphere & Lighting
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.globe.showGroundAtmosphere = true;
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.fog.enabled = true;
        viewer.scene.globe.maximumScreenSpaceError = 4;
        viewer.scene.globe.loadingDescendantLimit = 20;

        // Hide Cesium credit container
        if (viewer.cesiumWidget?.creditContainer) {
          viewer.cesiumWidget.creditContainer.style.display = 'none';
        }

        // Handle WebGL / Render Errors gracefully
        viewer.scene.renderError.addEventListener((error: any) => {
          console.error('[Cesium Render Error]:', error);
          setWebglError('3D View temporarily unavailable on this device');
        });

        // Load OSM Buildings ONCE
        try {
          const buildings = await Cesium.createOsmBuildingsAsync({
            scene: viewer.scene
          });
          buildingsRef.current = viewer.scene.primitives.add(buildings);
          if (buildingsRef.current) {
            buildingsRef.current.maximumScreenSpaceError = 8;
            if ('showOutline' in buildingsRef.current) {
              buildingsRef.current.showOutline = false;
            }
          }
          setOsmBuildingsStatus('1 (ACTIVE)');
        } catch (bErr) {
          console.warn('[Cesium] OSM Buildings skipped:', bErr);
          setOsmBuildingsStatus('0 (UNAVAILABLE)');
        }

        // SECTION 6: Set viewer ready ref
        viewerRef.current = viewer;
        viewerReadyRef.current = true;

        if (isMounted) {
          setCesiumReady(true);
        }

        // SECTION 6: Move immediately to the current selected location
        const initialLocation = BHUSAKTHI_LOCATIONS[selectedLocationId] || BHUSAKTHI_LOCATIONS['agartala'];
        if (initialLocation) {
          moveCesiumToLocation(initialLocation);
        }

        viewer.scene.requestRender();

      } catch (err: any) {
        console.error('[Cesium Init Error]:', err);
        setWebglError(err.message || '3D WebGL Initialization Failed');
      }
    };

    if ((window as any).Cesium) {
      initCesium();
    } else {
      pollInterval = setInterval(() => {
        if ((window as any).Cesium) {
          clearInterval(pollInterval);
          initCesium();
        }
      }, 150);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {}
        viewerRef.current = null;
        buildingsRef.current = null;
        viewerReadyRef.current = false;
        cesiumInitialized = false;
      }
    };
  }, [getVerifiedIonToken, moveCesiumToLocation, selectedLocationId]);

  // ==========================================================================
  // SECTION 5: MOST IMPORTANT PART — WATCH LOCATION CHANGE
  // ==========================================================================
  useEffect(() => {
    const location = BHUSAKTHI_LOCATIONS[selectedLocationId];

    if (!location) {
      console.error('Unknown location:', selectedLocationId);
      return;
    }

    if (!viewerRef.current) {
      console.warn('Viewer not ready yet');
      return;
    }

    moveCesiumToLocation(location);
  }, [selectedLocationId, moveCesiumToLocation]);

  // Effect to re-render or clear 3D simulation entities
  useEffect(() => {
    if (!cesiumReady || !viewerRef.current) return;
    if (isSimActive) {
      renderSimulation3D(impactResult);
    } else {
      clearSimulation3D();
    }
  }, [cesiumReady, isSimActive, impactResult, renderSimulation3D, clearSimulation3D]);

  // Effect for automated playback timeline timer
  useEffect(() => {
    if (!isSimActive || !simParams.isPlaying) return;
    const intervalMs = Math.round(1000 / simParams.speedMultiplier);
    const interval = setInterval(() => {
      setSimParams((prev) => {
        if (!prev.isPlaying) return prev;
        if (prev.timelineMinutes >= 12) {
          return { ...prev, isPlaying: false, timelineMinutes: 12 };
        }
        return {
          ...prev,
          timelineMinutes: Number((prev.timelineMinutes + 0.5).toFixed(1))
        };
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isSimActive, simParams.isPlaying, simParams.speedMultiplier]);

  // Camera Controls
  const handleZoomIn = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.zoomIn(viewerRef.current.camera.positionCartographic.height * 0.35);
    viewerRef.current.scene.requestRender();
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.zoomOut(viewerRef.current.camera.positionCartographic.height * 0.45);
    viewerRef.current.scene.requestRender();
  };

  const handleResetCamera = () => {
    const loc = BHUSAKTHI_LOCATIONS[selectedLocationId] || BHUSAKTHI_LOCATIONS['agartala'];
    moveCesiumToLocation(loc);
  };

  const handleTiltPerspective = () => {
    if (!viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const currentPitch = Cesium.Math.toDegrees(viewerRef.current.camera.pitch);
    const targetPitch = currentPitch > -50 ? -89.0 : -35.0;

    viewerRef.current.camera.cancelFlight();
    viewerRef.current.camera.flyTo({
      destination: viewerRef.current.camera.position,
      orientation: {
        heading: viewerRef.current.camera.heading,
        pitch: Cesium.Math.toRadians(targetPitch),
        roll: 0
      },
      duration: 1.0,
      complete: () => {
        viewerRef.current?.scene.requestRender();
      }
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="viewer-wrapper absolute inset-0 w-full h-full overflow-hidden bg-slate-950 select-none">
      {/* ==================================================================== */}
      {/* 1. DEDICATED CESIUM CANVAS (INITIALIZED ONCE, NEVER RECREATED)        */}
      {/* ==================================================================== */}
      <div
        ref={containerRef}
        className="cesium-viewer-container absolute inset-0 w-full h-full z-0"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />

      {/* WebGL Fallback Error Banner */}
      {webglError && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md text-center shadow-2xl space-y-3">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">3D View Temporarily Unavailable</h3>
            <p className="text-xs text-slate-300">
              WebGL hardware acceleration encountered an issue. The 2D map, early warning system, and analysis tools remain fully functional.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reload View
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TOP HEADER: BRANDING & LOCATION SELECTOR (Z-INDEX: 20)               */}
      {/* ==================================================================== */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Brand Header */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              BHUSAKTHI AI <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-normal">3D DIGITAL TWIN</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
              {selectedLocation.name}, {selectedLocation.state}
            </span>
          </div>
        </div>

        {/* Location Dropdown & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Location Selector */}
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <select
              aria-label="Select monitoring location"
              value={selectedLocationId}
              onChange={(e) => {
                const newId = e.target.value;
                console.log('Dropdown selected:', newId);
                onLocationChange(newId);
                const targetLoc = BHUSAKTHI_LOCATIONS[newId];
                if (targetLoc) {
                  moveCesiumToLocation(targetLoc);
                }
              }}
              className="bg-transparent text-xs font-black text-white outline-none cursor-pointer pr-1"
            >
              {Object.entries(BHUSAKTHI_LOCATIONS).map(([id, loc]) => (
                <option key={id} value={id} className="bg-slate-900 text-white">
                  {loc.name} ({loc.state})
                </option>
              ))}
            </select>
          </div>

          {/* DISASTER SIMULATION BUTTON */}
          <button
            onClick={() => {
              setIsSimActive((prev) => {
                const next = !prev;
                if (next) {
                  setShowPerfPanel(false);
                  setSimParams((p) => ({ ...p, isPlaying: true }));
                } else {
                  setSimParams((p) => ({ ...p, isPlaying: false, timelineMinutes: 0 }));
                }
                return next;
              });
            }}
            className={`px-3 py-1.5 rounded-2xl backdrop-blur-md border shadow-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black tracking-wide ${
              isSimActive
                ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/50'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 hover:from-amber-500/30 hover:to-orange-500/30'
            }`}
            title="Toggle 3D Disaster Impact Simulation"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimActive ? 'text-yellow-200 fill-yellow-200 animate-bounce' : 'text-amber-400'}`} />
            <span>{isSimActive ? 'SIMULATION ACTIVE' : '⚡ DISASTER SIMULATION'}</span>
          </button>

          {/* Performance Monitor Toggle */}
          <button
            onClick={() => setShowPerfPanel(!showPerfPanel)}
            className={`p-2 rounded-2xl backdrop-blur-md border shadow-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              showPerfPanel
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700/80'
            }`}
            title="Toggle Performance Diagnostics"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[11px]">Performance</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/80 shadow-xl transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DISASTER IMPACT SIMULATOR CONTROL PANEL (LEFT)                       */}
      {/* ==================================================================== */}
      {isSimActive && (
        <div className="absolute top-16 left-3 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-amber-500/60 shadow-2xl w-88 max-h-[calc(100vh-5.5rem)] overflow-y-auto text-xs text-slate-200 pointer-events-auto flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <strong className="text-white text-xs font-black tracking-wider uppercase flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                DISASTER IMPACT SIMULATOR
              </strong>
            </div>
            <button
              onClick={() => {
                setIsSimActive(false);
                setSimParams((p) => ({ ...p, isPlaying: false, timelineMinutes: 0 }));
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              title="Close Simulation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Location Indicator */}
          <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-mono">SIMULATION REGION</div>
                <div className="text-xs font-bold text-white">{selectedLocation.name}, {selectedLocation.state}</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              3D SYNCED
            </span>
          </div>

          {/* Disaster Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
              <span>Disaster Type</span>
              <span className="text-[10px] font-mono text-amber-400 uppercase">
                {DISASTER_TYPE_METADATA[simParams.disasterType]?.tag}
              </span>
            </label>
            <select
              aria-label="Select disaster type"
              value={simParams.disasterType}
              onChange={(e) =>
                setSimParams((p) => ({
                  ...p,
                  disasterType: e.target.value as DisasterType
                }))
              }
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-amber-400"
            >
              <option value="landslide">Landslide (Debris Flow)</option>
              <option value="flash_flood">Flash Flood (Rapid Inundation)</option>
              <option value="river_flood">River Flood (Catchment Overflow)</option>
              <option value="heavy_rainfall">Heavy Rainfall (Extreme Runoff)</option>
              <option value="river_blockage">Landslide → River Blockage</option>
              <option value="cascade">Landslide → Flood Cascade (Multi-Hazard)</option>
            </select>
            <p className="text-[10px] text-slate-400 leading-tight">
              {DISASTER_TYPE_METADATA[simParams.disasterType]?.description}
            </p>
          </div>

          {/* Severity Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300">Hazard Severity</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['moderate', 'high', 'extreme'] as SimulationSeverity[]).map((sev) => {
                const isSelected = simParams.severity === sev;
                const colors =
                  sev === 'extreme'
                    ? isSelected ? 'bg-rose-600 text-white border-rose-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-rose-500/50'
                    : sev === 'high'
                    ? isSelected ? 'bg-orange-600 text-white border-orange-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-orange-500/50'
                    : isSelected ? 'bg-amber-600 text-white border-amber-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-amber-500/50';

                return (
                  <button
                    key={sev}
                    onClick={() => setSimParams((p) => ({ ...p, severity: sev }))}
                    className={`py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer ${colors}`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Environmental Driving Parameters */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
            {/* Rainfall Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Rainfall:</span>
                <span className="text-cyan-300 font-bold font-mono">{simParams.rainfallMm} mm/24h</span>
              </div>
              <input
                type="range"
                min="60"
                max="320"
                step="10"
                value={simParams.rainfallMm}
                onChange={(e) => setSimParams((p) => ({ ...p, rainfallMm: Number(e.target.value) }))}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Soil Saturation Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400">Saturation:</span>
                <span className="text-amber-400 font-bold font-mono">{simParams.soilSaturationPct}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={simParams.soilSaturationPct}
                onChange={(e) => setSimParams((p) => ({ ...p, soilSaturationPct: Number(e.target.value) }))}
                className="w-full accent-amber-400 h-1 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Timeline Milestones & Narrative */}
          <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulation Timeline</span>
              </div>
              <span className="font-mono text-cyan-300 font-bold text-[11px]">
                T + {String(Math.floor(simParams.timelineMinutes)).padStart(2, '0')}:
                {String(Math.round((simParams.timelineMinutes % 1) * 60)).padStart(2, '0')} / 12:00
              </span>
            </div>

            {/* Timeline Scrubber */}
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={simParams.timelineMinutes}
              onChange={(e) =>
                setSimParams((p) => ({
                  ...p,
                  timelineMinutes: Number(e.target.value),
                  isPlaying: false
                }))
              }
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />

            {/* Current Milestone Status */}
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    impactResult.phase === 'after'
                      ? 'bg-rose-500'
                      : impactResult.phase === 'during'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-emerald-400'
                  }`} />
                  {impactResult.currentMilestoneText}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                  {impactResult.phase}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">
                {impactResult.currentMilestoneDetail}
              </p>
            </div>

            {/* Player Controls Dock */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                {/* Rewind to 0 */}
                <button
                  onClick={() => setSimParams((p) => ({ ...p, timelineMinutes: 0, isPlaying: false }))}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Rewind to 00:00"
                >
                  <Rewind className="w-3.5 h-3.5" />
                </button>

                {/* Step -1m */}
                <button
                  onClick={() =>
                    setSimParams((p) => ({
                      ...p,
                      timelineMinutes: Math.max(0, p.timelineMinutes - 1),
                      isPlaying: false
                    }))
                  }
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                  title="-1 min"
                >
                  -1m
                </button>

                {/* Play / Pause Toggle */}
                <button
                  onClick={() => setSimParams((p) => ({ ...p, isPlaying: !p.isPlaying }))}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    simParams.isPlaying
                      ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {simParams.isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[11px]">PAUSE</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span className="text-[11px]">PLAY</span>
                    </>
                  )}
                </button>

                {/* Step +1m */}
                <button
                  onClick={() =>
                    setSimParams((p) => ({
                      ...p,
                      timelineMinutes: Math.min(12, p.timelineMinutes + 1),
                      isPlaying: false
                    }))
                  }
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-300 cursor-pointer"
                  title="+1 min"
                >
                  +1m
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                {([1, 2, 5] as const).map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setSimParams((p) => ({ ...p, speedMultiplier: sp }))}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      simParams.speedMultiplier === sp
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {sp}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Focus Button */}
          <button
            onClick={focusOnHazardZone}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-900/30 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Center 3D Camera on Impact Site</span>
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3D IMPACT ASSESSMENT & LIFELINE ANALYSIS DOSSIER (RIGHT)            */}
      {/* ==================================================================== */}
      {isSimActive && (
        <div className="absolute top-16 right-3 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-rose-500/40 shadow-2xl w-84 max-h-[calc(100vh-5.5rem)] overflow-y-auto text-xs text-slate-200 pointer-events-auto flex flex-col gap-3 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <strong className="text-white text-xs font-black tracking-wider uppercase">
                CONSEQUENCE REPORT
              </strong>
            </div>
            <button
              onClick={() => setShowImpactDossier(!showImpactDossier)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              title={showImpactDossier ? 'Collapse Report' : 'Expand Report'}
            >
              {showImpactDossier ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showImpactDossier && (
            <>
              {/* Consequence Metrics Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Impact Zone</div>
                  <div className="text-base font-black text-rose-400 font-mono mt-0.5">
                    {impactResult.impactZoneKm2} <span className="text-xs font-normal text-slate-400">km²</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Exposed OSM Buildings</div>
                  <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                    {impactResult.exposedBuildingsCount} <span className="text-xs font-normal text-slate-400">structures</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">At-Risk Population</div>
                  <div className="text-base font-black text-white font-mono mt-0.5">
                    {impactResult.exposedPopulation.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Model Confidence</div>
                  <div className="text-base font-black text-cyan-300 font-mono mt-0.5">
                    {impactResult.confidencePercent}%
                  </div>
                </div>
              </div>

              {/* Lifeline Status */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Route className="w-3.5 h-3.5 text-orange-400" />
                  <span>Lifeline & Transport Infrastructure</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-400 shrink-0">Blocked Corridor:</span>
                    <span className={`font-bold text-right truncate ${
                      impactResult.blockedRoadsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {impactResult.blockedRoadName}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-400 shrink-0">Evacuation Route:</span>
                    <span className="text-emerald-400 font-bold text-right truncate">
                      {impactResult.alternativeRouteName} ({impactResult.evacuationDirection})
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-400 shrink-0">Safe Haven:</span>
                    <span className="text-cyan-300 font-bold text-right truncate">
                      {impactResult.shelterName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Multi-factor AI Explanation ("Why this happened?") */}
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Geological & Meteorological Drivers</span>
                </div>
                <div className="space-y-1.5">
                  {impactResult.whyFactors.slice(0, 4).map((factor, i) => (
                    <div key={i} className="text-[10px] text-slate-300 flex items-start gap-1.5 leading-snug">
                      <ChevronRight className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prototype Disclaimer */}
              <p className="text-[9px] text-slate-500 leading-tight italic bg-slate-950/50 p-2 rounded-lg border border-slate-900">
                ⚠ Consequence estimates are synthesized prototype projections based on local DEM slope angles, catchment geometries, and OpenStreetMap data layers.
              </p>
            </>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 10 & 14: PERFORMANCE & DYNAMIC CAMERA DEBUGGING PANEL        */}
      {/* ==================================================================== */}
      {showPerfPanel && !isSimActive && (
        <div className="absolute top-16 left-3 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/40 shadow-2xl w-80 text-xs text-slate-200 pointer-events-auto font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <strong className="text-white text-xs uppercase tracking-wider">
                CESIUM PERFORMANCE
              </strong>
            </div>
            <button
              onClick={() => setShowPerfPanel(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {/* Cesium Viewer Count — MUST BE 1 */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Cesium Viewer:</span>
              <span className={`font-bold px-1.5 py-0.2 rounded ${viewerCount === 1 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {viewerCount}
              </span>
            </div>

            {/* OSM Buildings */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">OSM Buildings:</span>
              <span className="text-emerald-400 font-bold">{osmBuildingsStatus}</span>
            </div>

            {/* Terrain */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Terrain:</span>
              <span className="text-emerald-400 font-bold">{terrainStatus}</span>
            </div>

            {/* Satellite */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Satellite:</span>
              <span className="text-emerald-400 font-bold">ON (Esri World Imagery)</span>
            </div>

            {/* Animated Layers */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Animated Layers:</span>
              <span className="text-amber-400 font-bold">OFF (Zero CPU Overhead)</span>
            </div>

            {/* FPS */}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">FPS:</span>
              <span className="text-cyan-300 font-bold">60 (On-Demand)</span>
            </div>

            {/* SECTION 10: Dynamic Camera Debug Data */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Camera:</span>
                <span className="text-white font-bold">{selectedLocation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">State:</span>
                <span className="text-slate-300">{selectedLocation.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Latitude:</span>
                <span className="text-cyan-300 font-semibold">{selectedLocation.latitude.toFixed(5)}° N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Longitude:</span>
                <span className="text-cyan-300 font-semibold">{selectedLocation.longitude.toFixed(5)}° E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Camera Height:</span>
                <span className="text-amber-300 font-bold">{selectedLocation.cameraHeight.toLocaleString()} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Render Mode:</span>
                <span className="text-emerald-400 font-bold">requestRenderMode (Active)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* BOTTOM-RIGHT: CAMERA CONTROLS DOCK (Z-INDEX: 20)                     */}
      {/* ==================================================================== */}
      <div className="absolute bottom-6 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-700" />
        <button
          onClick={handleTiltPerspective}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle 3D Oblique View vs Top-Down Nadir"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset Camera to Local View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
