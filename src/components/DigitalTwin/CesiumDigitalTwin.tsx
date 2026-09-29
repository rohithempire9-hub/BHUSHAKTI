import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Compass,
  Layers,
  MapPin,
  Mountain,
  Eye,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Waves,
  Navigation,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  Radio,
  ExternalLink,
  X
} from 'lucide-react';
import {
  GeospatialLocation,
  REAL_GEOSPATIAL_LOCATIONS,
  getRealGeospatialLocation
} from './realGeospatialData';
import { getElevationForLatLng } from './locationDemStore';

interface CesiumDigitalTwinProps {
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
  onOpenSmsModal?: () => void;
  onOpenEscapeModal?: () => void;
}

export type ImageryMode = 'SATELLITE' | 'STREET_MAP';

export interface CesiumLayerState {
  satellite: boolean;
  terrain: boolean;
  roads: boolean;
  rivers: boolean;
  infrastructure: boolean;
  landslideRisk: boolean;
  floodRisk: boolean;
  sensors: boolean;
  evacuationRoutes: boolean;
}

export const CesiumDigitalTwin: React.FC<CesiumDigitalTwinProps> = ({
  selectedLocationId,
  onLocationChange,
  onOpenSmsModal,
  onOpenEscapeModal
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const dataSourcesRef = useRef<{
    roads?: any;
    rivers?: any;
    infrastructure?: any;
    landslideRisk?: any;
    floodRisk?: any;
    sensors?: any;
    evacuationRoutes?: any;
  }>({});

  const [cesiumReady, setCesiumReady] = useState(false);
  const [cesiumError, setCesiumError] = useState<string | null>(null);
  const [terrainStatus, setTerrainStatus] = useState<'ACTIVE' | 'UNCONFIGURED' | 'ERROR'>('ACTIVE');
  const [terrainLabel, setTerrainLabel] = useState<string>('Cesium World Terrain (Ion Key Active • Real DEM)');
  const [terrainNotice, setTerrainNotice] = useState<string>('Initializing Geospatial Engine...');
  const [imageryMode, setImageryMode] = useState<ImageryMode>('SATELLITE');
  const [imageryStatus, setImageryStatus] = useState<string>('Esri World Satellite Imagery (Live Sub-Meter)');
  
  const [layers, setLayers] = useState<CesiumLayerState>({
    satellite: true,
    terrain: true,
    roads: true,
    rivers: true,
    infrastructure: true,
    landslideRisk: true,
    floodRisk: true,
    sensors: true,
    evacuationRoutes: true
  });

  const [showInspector, setShowInspector] = useState(true);
  const [selectedEntityInfo, setSelectedEntityInfo] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentLocation = getRealGeospatialLocation(selectedLocationId);

  // --------------------------------------------------------------------------
  // 1. INITIALIZE CESIUM VIEWER
  // --------------------------------------------------------------------------
  useEffect(() => {
    let checkInterval: any = null;
    let isMounted = true;

    const initCesium = async () => {
      if (typeof window === 'undefined' || !containerRef.current) return;
      const Cesium = (window as any).Cesium;
      if (!Cesium) {
        setTerrainNotice('Loading CesiumJS 3D Geospatial Engine from CDN...');
        return;
      }

      if (viewerRef.current) return;

      try {
        const createCopernicusDemTerrainProvider = (CesiumObj: any) => {
          const tilingScheme = new CesiumObj.GeographicTilingScheme();
          return new CesiumObj.CustomHeightmapTerrainProvider({
            width: 32,
            height: 32,
            tilingScheme: tilingScheme,
            callback: (x: number, y: number, level: number) => {
              const width = 32;
              const height = 32;
              const buffer = new Float32Array(width * height);
              const rect = tilingScheme.tileXYToRectangle(x, y, level);
              const west = CesiumObj.Math.toDegrees(rect.west);
              const south = CesiumObj.Math.toDegrees(rect.south);
              const east = CesiumObj.Math.toDegrees(rect.east);
              const north = CesiumObj.Math.toDegrees(rect.north);

              for (let r = 0; r < height; r++) {
                const lat = north - (r / (height - 1)) * (north - south);
                for (let c = 0; c < width; c++) {
                  const lon = west + (c / (width - 1)) * (east - west);
                  buffer[r * width + c] = getElevationForLatLng(lat, lon);
                }
              }
              return buffer;
            }
          });
        };

        const ionToken = (import.meta as any).env?.VITE_CESIUM_ION_TOKEN || '';
        let terrainProvider: any = null;

        if (ionToken && ionToken.trim() !== '') {
          Cesium.Ion.defaultAccessToken = ionToken.trim();
          try {
            terrainProvider = await Cesium.createWorldTerrainAsync({
              requestVertexNormals: true,
              requestWaterMask: true
            });
            setTerrainStatus('ACTIVE');
            setTerrainLabel('Cesium World Terrain (Ion Key Active • Real DEM)');
            setTerrainNotice('✓ Cesium World Terrain Connected (Ion Key Active • Real 3D Elevation)');
          } catch (tErr) {
            console.warn('[BHUSAKTHI AI] Cesium World Terrain fallback to Copernicus DEM:', tErr);
            terrainProvider = createCopernicusDemTerrainProvider(Cesium);
            setTerrainStatus('ACTIVE');
            setTerrainLabel('Copernicus 30m DEM (Real 3D Elevation Active)');
            setTerrainNotice('✓ Real 3D DEM Elevation Active (Copernicus 30m Ground Truth)');
          }
        } else {
          terrainProvider = createCopernicusDemTerrainProvider(Cesium);
          setTerrainStatus('ACTIVE');
          setTerrainLabel('Copernicus 30m DEM (Real 3D Elevation Active)');
          setTerrainNotice('✓ Real 3D DEM Elevation Active (Copernicus 30m Ground Truth)');
        }

        // Esri High-Resolution World Imagery Provider (Real Satellite Imagery, free & global)
        const esriImageryProvider = new Cesium.ArcGisMapServerImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
          enablePickFeatures: false
        });

        const viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
          animation: false,
          navigationHelpButton: false,
          fullscreenButton: false,
          terrainProvider: terrainProvider,
          imageryProvider: esriImageryProvider,
          requestRenderMode: false,
          maximumRenderTimeChange: Infinity
        });

        // Atmospheric and Lighting Polish
        viewer.scene.globe.enableLighting = true;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        viewer.scene.skyAtmosphere.show = true;
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.0002;

        // Hide Cesium credit banner to keep the UI clean
        const creditContainer = viewer.cesiumWidget.creditContainer;
        if (creditContainer) {
          creditContainer.style.display = 'none';
        }

        viewerRef.current = viewer;
        if (isMounted) {
          setCesiumReady(true);
        }

        // Entity Click Selection Handler
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction((movement: any) => {
          const pickedObject = viewer.scene.pick(movement.position);
          if (Cesium.defined(pickedObject) && pickedObject.id) {
            const entity = pickedObject.id;
            const props = entity.properties ? entity.properties.getValue() : {};
            setSelectedEntityInfo({
              name: entity.name || props.name || 'Geospatial Entity',
              category: props.category || props.type || props.level || 'GIS Feature',
              description: props.description || props.details || 'Real geographic feature loaded from OpenStreetMap & BHUSAKTHI dataset.',
              status: props.status || props.safetyFactor ? `Factor of Safety: ${props.safetyFactor}` : null,
              level: props.level || null,
              sensorId: props.sensorId || null,
              displacementMm: props.displacementMm ?? null,
              moisturePercent: props.moisturePercent ?? null
            });
          } else {
            setSelectedEntityInfo(null);
          }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      } catch (err: any) {
        console.error('[BHUSAKTHI AI] Failed to initialize Cesium Viewer:', err);
        if (isMounted) {
          setCesiumError(err.message || 'Failed to initialize 3D Geospatial Viewer');
        }
      }
    };

    if ((window as any).Cesium) {
      initCesium();
    } else {
      checkInterval = setInterval(() => {
        if ((window as any).Cesium) {
          clearInterval(checkInterval);
          initCesium();
        }
      }, 300);
    }

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          // ignore cleanup error
        }
        viewerRef.current = null;
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // 2. LOAD LOCATION GEOGRAPHIC LAYERS & FLY CAMERA
  // --------------------------------------------------------------------------
  const loadLocationLayers = useCallback(async (location: GeospatialLocation) => {
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;
    if (!viewer || !Cesium) return;

    // 1. Clear previous location data sources cleanly
    const ds = dataSourcesRef.current;
    if (ds.roads) viewer.dataSources.remove(ds.roads, true);
    if (ds.rivers) viewer.dataSources.remove(ds.rivers, true);
    if (ds.infrastructure) viewer.dataSources.remove(ds.infrastructure, true);
    if (ds.landslideRisk) viewer.dataSources.remove(ds.landslideRisk, true);
    if (ds.floodRisk) viewer.dataSources.remove(ds.floodRisk, true);
    if (ds.sensors) viewer.dataSources.remove(ds.sensors, true);
    if (ds.evacuationRoutes) viewer.dataSources.remove(ds.evacuationRoutes, true);
    dataSourcesRef.current = {};

    try {
      // 2. Load Real Roads (OpenStreetMap GeoJSON)
      if (location.roadsGeoJson) {
        const roadsSource = await Cesium.GeoJsonDataSource.load(location.roadsGeoJson, {
          clampToGround: true
        });
        const entities = roadsSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const props = entity.properties ? entity.properties.getValue() : {};
          if (entity.polyline) {
            entity.polyline.material = Cesium.Color.fromCssColorString(props.color || '#f59e0b');
            entity.polyline.width = props.width || 3;
            entity.polyline.clampToGround = true;
          }
        }
        roadsSource.show = layers.roads;
        viewer.dataSources.add(roadsSource);
        dataSourcesRef.current.roads = roadsSource;
      }

      // 3. Load Real Rivers & Waterways
      if (location.riversGeoJson) {
        const riversSource = await Cesium.GeoJsonDataSource.load(location.riversGeoJson, {
          clampToGround: true
        });
        const entities = riversSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const props = entity.properties ? entity.properties.getValue() : {};
          if (entity.polyline) {
            entity.polyline.material = Cesium.Color.fromCssColorString(props.color || '#0284c7');
            entity.polyline.width = props.width || 7;
            entity.polyline.clampToGround = true;
          }
        }
        riversSource.show = layers.rivers;
        viewer.dataSources.add(riversSource);
        dataSourcesRef.current.rivers = riversSource;
      }

      // 4. Load Real Infrastructure Landmarks
      if (location.infrastructureGeoJson) {
        const infraSource = await Cesium.GeoJsonDataSource.load(location.infrastructureGeoJson, {
          clampToGround: true
        });
        const entities = infraSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const props = entity.properties ? entity.properties.getValue() : {};
          const isHospital = props.category === 'medical';
          const isHaven = props.category === 'cultural_haven' || props.category === 'safe_haven';
          const isHelipad = props.category === 'helipad';
          
          entity.point = new Cesium.PointGraphics({
            pixelSize: 12,
            color: isHospital ? Cesium.Color.fromCssColorString('#ef4444') : isHaven ? Cesium.Color.fromCssColorString('#f59e0b') : isHelipad ? Cesium.Color.fromCssColorString('#3b82f6') : Cesium.Color.fromCssColorString('#10b981'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2.5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          });

          entity.label = new Cesium.LabelGraphics({
            text: entity.name || props.name,
            font: 'bold 11px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            pixelOffset: new Cesium.Cartesian2(0, -14),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          });
        }
        infraSource.show = layers.infrastructure;
        viewer.dataSources.add(infraSource);
        dataSourcesRef.current.infrastructure = infraSource;
      }

      // 5. Load BHUSAKTHI Landslide Risk Overlays
      if (location.landslideRiskGeoJson) {
        const lsSource = await Cesium.GeoJsonDataSource.load(location.landslideRiskGeoJson, {
          clampToGround: true
        });
        const entities = lsSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const props = entity.properties ? entity.properties.getValue() : {};
          if (entity.polygon) {
            const col = Cesium.Color.fromCssColorString(props.color || '#ef4444').withAlpha(props.fillOpacity || 0.4);
            entity.polygon.material = col;
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.fromCssColorString(props.color || '#ef4444');
            entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
          }
        }
        lsSource.show = layers.landslideRisk;
        viewer.dataSources.add(lsSource);
        dataSourcesRef.current.landslideRisk = lsSource;
      }

      // 6. Load BHUSAKTHI Flood Risk Extent
      if (location.floodRiskGeoJson) {
        const flSource = await Cesium.GeoJsonDataSource.load(location.floodRiskGeoJson, {
          clampToGround: true
        });
        const entities = flSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const props = entity.properties ? entity.properties.getValue() : {};
          if (entity.polygon) {
            entity.polygon.material = Cesium.Color.fromCssColorString(props.color || '#0284c7').withAlpha(props.fillOpacity || 0.38);
            entity.polygon.outline = true;
            entity.polygon.outlineColor = Cesium.Color.fromCssColorString(props.color || '#0284c7');
            entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
          }
        }
        flSource.show = layers.floodRisk;
        viewer.dataSources.add(flSource);
        dataSourcesRef.current.floodRisk = flSource;
      }

      // 7. Load IoT Geotechnical Sensor Nodes
      if (location.sensorsGeoJson) {
        const sensorSource = await Cesium.GeoJsonDataSource.load(location.sensorsGeoJson, {
          clampToGround: true
        });
        const entities = sensorSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const props = entity.properties ? entity.properties.getValue() : {};
          const isCritical = props.status === 'CRITICAL_ALERT';
          entity.point = new Cesium.PointGraphics({
            pixelSize: 14,
            color: isCritical ? Cesium.Color.RED : Cesium.Color.CYAN,
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          });
          entity.label = new Cesium.LabelGraphics({
            text: `📡 ${props.sensorId}: ${props.name}`,
            font: 'bold 10px monospace',
            fillColor: isCritical ? Cesium.Color.YELLOW : Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.TOP,
            pixelOffset: new Cesium.Cartesian2(0, 14),
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          });
        }
        sensorSource.show = layers.sensors;
        viewer.dataSources.add(sensorSource);
        dataSourcesRef.current.sensors = sensorSource;
      }

      // 8. Load Evacuation Corridors
      if (location.evacuationRoutesGeoJson) {
        const evacSource = await Cesium.GeoJsonDataSource.load(location.evacuationRoutesGeoJson, {
          clampToGround: true
        });
        const entities = evacSource.entities.values;
        for (let i = 0; i < entities.length; i++) {
          const entity = entities[i];
          const props = entity.properties ? entity.properties.getValue() : {};
          if (entity.polyline) {
            entity.polyline.material = Cesium.Color.fromCssColorString(props.color || '#10b981');
            entity.polyline.width = props.width || 4;
            entity.polyline.clampToGround = true;
          }
        }
        evacSource.show = layers.evacuationRoutes;
        viewer.dataSources.add(evacSource);
        dataSourcesRef.current.evacuationRoutes = evacSource;
      }

      // 9. Smooth Geographic Camera Flight to the Location
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          location.longitude,
          location.latitude,
          location.camera.altitudeMeters
        ),
        orientation: {
          heading: Cesium.Math.toRadians(location.camera.headingDegrees),
          pitch: Cesium.Math.toRadians(location.camera.pitchDegrees),
          roll: 0.0
        },
        duration: 2.2
      });

    } catch (layerErr) {
      console.error('[BHUSAKTHI AI] Error loading location layers:', layerErr);
    }
  }, [layers]);

  // When Cesium is ready or selected location changes
  useEffect(() => {
    if (!cesiumReady || !viewerRef.current) return;
    loadLocationLayers(currentLocation);
  }, [cesiumReady, selectedLocationId, loadLocationLayers, currentLocation]);

  // Sync Layer Visibility toggles
  useEffect(() => {
    const ds = dataSourcesRef.current;
    if (ds.roads) ds.roads.show = layers.roads;
    if (ds.rivers) ds.rivers.show = layers.rivers;
    if (ds.infrastructure) ds.infrastructure.show = layers.infrastructure;
    if (ds.landslideRisk) ds.landslideRisk.show = layers.landslideRisk;
    if (ds.floodRisk) ds.floodRisk.show = layers.floodRisk;
    if (ds.sensors) ds.sensors.show = layers.sensors;
    if (ds.evacuationRoutes) ds.evacuationRoutes.show = layers.evacuationRoutes;
  }, [layers]);

  // --------------------------------------------------------------------------
  // CAMERA CONTROLS
  // --------------------------------------------------------------------------
  const handleZoomIn = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.zoomIn(viewerRef.current.camera.positionCartographic.height * 0.35);
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.zoomOut(viewerRef.current.camera.positionCartographic.height * 0.45);
  };

  const handleResetCamera = () => {
    if (!viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        currentLocation.longitude,
        currentLocation.latitude,
        currentLocation.camera.altitudeMeters
      ),
      orientation: {
        heading: Cesium.Math.toRadians(currentLocation.camera.headingDegrees),
        pitch: Cesium.Math.toRadians(currentLocation.camera.pitchDegrees),
        roll: 0.0
      },
      duration: 1.5
    });
  };

  const handleTiltPerspective = () => {
    if (!viewerRef.current) return;
    const Cesium = (window as any).Cesium;
    const currentPitch = Cesium.Math.toDegrees(viewerRef.current.camera.pitch);
    const targetPitch = currentPitch > -50 ? -89.0 : -35.0; // Toggle oblique vs top-down nadir
    
    viewerRef.current.camera.flyTo({
      destination: viewerRef.current.camera.position,
      orientation: {
        heading: viewerRef.current.camera.heading,
        pitch: Cesium.Math.toRadians(targetPitch),
        roll: 0.0
      },
      duration: 1.2
    });
  };

  // Toggle Satellite vs Street Map
  const handleToggleImagery = (mode: ImageryMode) => {
    const viewer = viewerRef.current;
    const Cesium = (window as any).Cesium;
    if (!viewer || !Cesium) return;

    viewer.imageryLayers.removeAll();

    if (mode === 'SATELLITE') {
      const esri = new Cesium.ArcGisMapServerImageryProvider({
        url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
        enablePickFeatures: false
      });
      viewer.imageryLayers.addImageryProvider(esri);
      setImageryMode('SATELLITE');
      setImageryStatus('Esri World Satellite Imagery (Live Sub-Meter)');
    } else {
      const osm = new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
      });
      viewer.imageryLayers.addImageryProvider(osm);
      setImageryMode('STREET_MAP');
      setImageryStatus('OpenStreetMap Cartographic GIS Tiles');
    }
  };

  const toggleLayer = (key: keyof CesiumLayerState) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden select-none">
      {/* ==================================================================== */}
      {/* CESIUM 3D CANVAS CONTAINER                                           */}
      {/* ==================================================================== */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading or Error Overlay */}
      {!cesiumReady && !cesiumError && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-50 text-white">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
          <h3 className="text-sm font-black tracking-wider uppercase text-emerald-400">Loading Geospatial Engine</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm text-center font-mono">
            {terrainNotice}
          </p>
        </div>
      )}

      {cesiumError && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-50 text-white p-6">
          <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
          <h3 className="text-base font-bold text-rose-400">3D Geospatial Engine Error</h3>
          <p className="text-xs text-slate-300 mt-2 max-w-md text-center">{cesiumError}</p>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TOP FLOATING HEADER: BRANDING & LOCATION SELECTOR                    */}
      {/* ==================================================================== */}
      <div className="absolute top-3 left-3 right-3 z-30 flex items-center justify-between pointer-events-none">
        {/* Brand Badge */}
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700/80 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-black tracking-wider uppercase text-white flex items-center gap-1.5">
              BHUSAKTHI AI <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-normal">CESIUM 3D GIS</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">
              {currentLocation.name}
            </span>
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 shadow-xl flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <select
              aria-label="Select monitoring location"
              value={selectedLocationId}
              onChange={(e) => onLocationChange(e.target.value)}
              className="bg-transparent text-xs font-black text-white outline-none cursor-pointer pr-1"
            >
              {Object.values(REAL_GEOSPATIAL_LOCATIONS).map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md text-slate-300 hover:text-white border border-slate-700/80 shadow-xl transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D GIS View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* STATUS BANNER (REAL SATELLITE & TERRAIN VERIFICATION)                */}
      {/* ==================================================================== */}
      <div className="absolute top-16 left-3 right-3 z-20 pointer-events-none flex justify-center">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/70 shadow-lg text-[10px] text-slate-300 flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <strong className="text-white">REAL SATELLITE:</strong> {imageryStatus}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className={`w-1.5 h-1.5 rounded-full ${terrainStatus === 'ACTIVE' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <strong className="text-white">TERRAIN:</strong>{' '}
            {terrainLabel}
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> OpenStreetMap GIS Real Roads & Rivers
          </span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* FLOATING LOCATION GEOSPATIAL DOSSIER PANEL                           */}
      {/* ==================================================================== */}
      {showInspector ? (
        <div className="absolute bottom-6 left-3 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 border border-slate-700/90 shadow-2xl w-80 text-xs text-slate-200 pointer-events-auto transition-all animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-rose-500 font-bold">📍</span>
              <span className="font-black text-white text-xs tracking-tight truncate">
                {currentLocation.shortName} Geospatial Dossier
              </span>
            </div>
            <button
              onClick={() => setShowInspector(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              title="Minimize dossier"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2 font-mono text-[10.5px]">
            <div className="flex justify-between items-center bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 uppercase font-sans text-[9px]">Coordinates:</span>
              <strong className="text-white text-[10px]">
                {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
              </strong>
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 uppercase font-sans text-[9px]">Elevation (DEM):</span>
              <strong className="text-emerald-400 text-[10px]">
                {currentLocation.elevationMeters.toLocaleString()} m ASL
              </strong>
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 uppercase font-sans text-[9px]">Road Network:</span>
              <span className="text-amber-300 truncate max-w-[150px]" title={currentLocation.roadNetworkName}>
                {currentLocation.roadNetworkName}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 uppercase font-sans text-[9px]">Drainage Basin:</span>
              <span className="text-sky-300 truncate max-w-[150px]" title={currentLocation.riverNetworkName}>
                {currentLocation.riverNetworkName}
              </span>
            </div>

            <div className="flex justify-between items-center bg-slate-800/60 px-2.5 py-1.5 rounded-xl border border-slate-700/50">
              <span className="text-slate-400 uppercase font-sans text-[9px]">Hazard Level:</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase ${
                currentLocation.riskSummary.level === 'VERY HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                currentLocation.riskSummary.level === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}>
                {currentLocation.riskSummary.level}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-sans">
              Population: <strong>{currentLocation.riskSummary.affectedPopulation.toLocaleString()}</strong>
            </span>
            {onOpenSmsModal && (
              <button
                onClick={onOpenSmsModal}
                className="px-2.5 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <Radio className="w-3 h-3" /> Emergency SOS
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowInspector(true)}
          className="absolute bottom-6 left-3 z-30 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/80 text-white text-xs font-bold flex items-center gap-1.5 shadow-xl hover:bg-slate-800 cursor-pointer pointer-events-auto"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span>{currentLocation.shortName} Info</span>
        </button>
      )}

      {/* ==================================================================== */}
      {/* INTERACTIVE FEATURE PICKER POPUP (WHEN CLICKING AN ENTITY)           */}
      {/* ==================================================================== */}
      {selectedEntityInfo && (
        <div className="absolute top-24 right-3 z-30 bg-slate-900/95 backdrop-blur-md rounded-2xl p-3.5 border border-slate-700 shadow-2xl max-w-xs text-xs text-slate-200 pointer-events-auto animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <strong className="text-white text-xs truncate">{selectedEntityInfo.name}</strong>
            </div>
            <button
              onClick={() => setSelectedEntityInfo(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            {selectedEntityInfo.description}
          </p>
          {selectedEntityInfo.status && (
            <div className="bg-slate-800/80 px-2 py-1 rounded-lg text-[10px] font-mono text-emerald-300 mb-1.5">
              {selectedEntityInfo.status}
            </div>
          )}
          {selectedEntityInfo.sensorId && (
            <div className="bg-slate-800/80 px-2 py-1 rounded-lg text-[10px] font-mono text-cyan-300 flex justify-between">
              <span>Displacement: {selectedEntityInfo.displacementMm} mm</span>
              <span>Moisture: {selectedEntityInfo.moisturePercent}%</span>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* FLOATING GIS LAYER CONTROLS (RIGHT DOCK)                             */}
      {/* ==================================================================== */}
      <div className="absolute top-24 right-3 z-20 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl text-[11px] text-slate-200 pointer-events-auto w-48">
        <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
          <span>GIS Layers</span>
          <Layers className="w-3 h-3 text-emerald-400" />
        </div>

        {/* Imagery Mode Toggle */}
        <div className="flex rounded-xl bg-slate-800/80 p-0.5 border border-slate-700/60 my-0.5">
          <button
            onClick={() => handleToggleImagery('SATELLITE')}
            className={`flex-1 py-1 text-[9.5px] font-bold rounded-lg transition-all cursor-pointer ${
              imageryMode === 'SATELLITE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => handleToggleImagery('STREET_MAP')}
            className={`flex-1 py-1 text-[9.5px] font-bold rounded-lg transition-all cursor-pointer ${
              imageryMode === 'STREET_MAP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Map (OSM)
          </button>
        </div>

        {/* Layer Switches */}
        <button
          onClick={() => toggleLayer('roads')}
          className={`flex items-center justify-between px-2 py-1 rounded-xl transition-colors cursor-pointer ${
            layers.roads ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>Real Roads (OSM)</span>
          <span className={`w-2 h-2 rounded-full ${layers.roads ? 'bg-amber-400' : 'bg-slate-600'}`} />
        </button>

        <button
          onClick={() => toggleLayer('rivers')}
          className={`flex items-center justify-between px-2 py-1 rounded-xl transition-colors cursor-pointer ${
            layers.rivers ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>Real Rivers & Gorge</span>
          <span className={`w-2 h-2 rounded-full ${layers.rivers ? 'bg-sky-400' : 'bg-slate-600'}`} />
        </button>

        <button
          onClick={() => toggleLayer('infrastructure')}
          className={`flex items-center justify-between px-2 py-1 rounded-xl transition-colors cursor-pointer ${
            layers.infrastructure ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>Settlements / Havens</span>
          <span className={`w-2 h-2 rounded-full ${layers.infrastructure ? 'bg-emerald-400' : 'bg-slate-600'}`} />
        </button>

        <button
          onClick={() => toggleLayer('landslideRisk')}
          className={`flex items-center justify-between px-2 py-1 rounded-xl transition-colors cursor-pointer ${
            layers.landslideRisk ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>Landslide Hazards</span>
          <span className={`w-2 h-2 rounded-full ${layers.landslideRisk ? 'bg-rose-400' : 'bg-slate-600'}`} />
        </button>

        <button
          onClick={() => toggleLayer('floodRisk')}
          className={`flex items-center justify-between px-2 py-1 rounded-xl transition-colors cursor-pointer ${
            layers.floodRisk ? 'bg-blue-500/20 text-blue-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>Flood Inundation</span>
          <span className={`w-2 h-2 rounded-full ${layers.floodRisk ? 'bg-blue-400' : 'bg-slate-600'}`} />
        </button>

        <button
          onClick={() => toggleLayer('sensors')}
          className={`flex items-center justify-between px-2 py-1 rounded-xl transition-colors cursor-pointer ${
            layers.sensors ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>IoT Stations</span>
          <span className={`w-2 h-2 rounded-full ${layers.sensors ? 'bg-cyan-400' : 'bg-slate-600'}`} />
        </button>

        <button
          onClick={() => toggleLayer('evacuationRoutes')}
          className={`flex items-center justify-between px-2 py-1 rounded-xl transition-colors cursor-pointer ${
            layers.evacuationRoutes ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>Evacuation Corridors</span>
          <span className={`w-2 h-2 rounded-full ${layers.evacuationRoutes ? 'bg-emerald-400' : 'bg-slate-600'}`} />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* CAMERA NAVIGATION CONTROLS (BOTTOM-RIGHT FLOATING DOCK)              */}
      {/* ==================================================================== */}
      <div className="absolute bottom-6 right-3 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl pointer-events-auto">
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
          title="Toggle Oblique 3D Perspective vs Top-Down Nadir"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reset Camera to Location Center"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
