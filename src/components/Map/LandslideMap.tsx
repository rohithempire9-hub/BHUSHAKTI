import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LandslideStation, RiskStatus } from '../../types/landslide';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Search,
  SlidersHorizontal,
  Compass,
  Activity,
  Droplets,
  MapPin,
  Eye,
  EyeOff,
  Gauge,
  Sparkles,
  Info,
  Navigation,
  LocateFixed,
  Globe,
  Waves,
  Radio,
  CheckCircle2,
  Camera,
  Maximize
} from 'lucide-react';
import { DisasterEvidenceReport } from '../../types/landslide';
import { HIGHWAY_RISK_SEGMENTS, REMOTE_VILLAGE_PINS } from '../../data/bhuShaktiData';

/**
 * Returns a concise, recognizable, edible place name for map pins and UI selectors.
 */
export function getCleanPlaceName(station: { id?: string; name?: string; region?: string }): string {
  if (!station || !station.name) return 'Station';
  const raw = station.name.trim();
  const id = station.id || '';
  if (id === 'st-ne-agartala' || raw.toLowerCase().startsWith('agartala')) return 'Agartala';
  if (raw.toLowerCase().includes('tupul') || raw.toLowerCase().includes('noney')) return 'Noney Tupul';
  if (raw.toLowerCase().includes('gangtok') || raw.toLowerCase().includes('burtuk')) return 'Gangtok';
  if (raw.toLowerCase().includes('chungthang') || raw.toLowerCase().includes('lhonak')) return 'Chungthang';
  if (raw.toLowerCase().includes('dima hasao') || raw.toLowerCase().includes('haflong')) return 'Dima Hasao';
  if (raw.toLowerCase().includes('aizawl') || raw.toLowerCase().includes('melthum')) return 'Aizawl';
  if (raw.toLowerCase().includes('kohima') || raw.toLowerCase().includes('peducha')) return 'Kohima';
  if (raw.toLowerCase().includes('rathong')) return 'Rathong Glacier';
  if (raw.toLowerCase().includes('khangri')) return 'Khangri Karpo';
  if (raw.toLowerCase().includes('wayanad')) return 'Wayanad';
  if (raw.toLowerCase().includes('bhalukpong')) return 'Bhalukpong';
  if (raw.toLowerCase().includes('chamoli')) return 'Chamoli';
  if (raw.toLowerCase().includes('umiam') || raw.toLowerCase().includes('barapani')) return 'Umiam';
  if (raw.toLowerCase().includes('tura')) return 'Tura';
  if (raw.toLowerCase().includes('baramura')) return 'Baramura';
  if (raw.toLowerCase().includes('mokokchung')) return 'Mokokchung';
  if (raw.toLowerCase().includes('majuli')) return 'Majuli';
  if (raw.toLowerCase().includes('tawang')) return 'Tawang';
  if (raw.toLowerCase().includes('cherrapunji') || raw.toLowerCase().includes('sohra')) return 'Cherrapunji';
  if (raw.toLowerCase().includes('kurseong') || raw.toLowerCase().includes('mirik')) return 'Kurseong';

  const clean = raw.split(/[-–/]/)[0].trim();
  return clean.length > 18 ? clean.substring(0, 16) + '…' : clean;
}

interface LandslideMapProps {
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  filterStatus: RiskStatus | 'all' | string;
  onFilterChange: (status: any) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenEscapeModal?: () => void;
  evidenceList?: DisasterEvidenceReport[];
  onOpenEvidenceModal?: () => void;
  simulatedRiskLevel?: 'safe' | 'warning' | 'critical';
}

export type MapLayerType = 'topo' | 'dark' | 'satellite' | 'osm';
export type HeatMetricType = 'risk' | 'pore_pressure' | 'moisture' | 'erosion';

export const LandslideMap: React.FC<LandslideMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  filterStatus,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onOpenEscapeModal,
  evidenceList = [],
  onOpenEvidenceModal,
  simulatedRiskLevel,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesGroupRef = useRef<L.LayerGroup | null>(null);
  const escapeGroupRef = useRef<L.LayerGroup | null>(null);
  const evidenceGroupRef = useRef<L.LayerGroup | null>(null);
  const highwayGroupRef = useRef<L.LayerGroup | null>(null);
  const villageGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);

  // Map state - Default to satellite to match the screenshot 'Esri World Imagery'
  const [mapLayer, setMapLayer] = useState<MapLayerType>('satellite');
  const [showHeatMap, setShowHeatMap] = useState<boolean>(true);
  const [showEscapeRoute, setShowEscapeRoute] = useState<boolean>(true);
  const [showEvidencePins, setShowEvidencePins] = useState<boolean>(true);
  const [showHighways, setShowHighways] = useState<boolean>(true);
  const [showVillages, setShowVillages] = useState<boolean>(true);
  const [showFloodLayer, setShowFloodLayer] = useState<boolean>(false);
  const [heatMetric, setHeatMetric] = useState<HeatMetricType>('risk');
  const [heatRadius, setHeatRadius] = useState<number>(45);
  const [showStationPins, setShowStationPins] = useState<boolean>(true);
  const [showHeatCircles, setShowHeatCircles] = useState<boolean>(false);
  const [isHeatConfigOpen, setIsHeatConfigOpen] = useState<boolean>(false);
  const [isHeatPluginReady, setIsHeatPluginReady] = useState<boolean>(false);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Dynamically load leaflet.heat after verifying global L
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).L = L;
      import('leaflet.heat')
        .then(() => {
          // Monkey-patch simpleheat to prevent zero-dimension canvas getImageData crashes
          if (typeof window !== 'undefined' && (window as any).simpleheat) {
            const shProto = (window as any).simpleheat.prototype;
            if (shProto && !shProto._bhushaktiGuarded) {
              shProto._bhushaktiGuarded = true;
              const origDraw = shProto.draw;
              shProto.draw = function (minOpacity: any) {
                if (!this._width || !this._height || this._width <= 0 || this._height <= 0) {
                  return this;
                }
                try {
                  return origDraw.call(this, minOpacity);
                } catch (err) {
                  console.warn('[simpleheat] Suppressed draw error:', err);
                  return this;
                }
              };
            }
          }

          // Monkey-patch Leaflet HeatLayer _redraw & _reset
          if ((L as any).HeatLayer) {
            const hlProto = (L as any).HeatLayer.prototype;
            if (hlProto && !hlProto._bhushaktiGuarded) {
              hlProto._bhushaktiGuarded = true;
              const origRedraw = hlProto._redraw;
              hlProto._redraw = function () {
                if (!this._map) return this;
                const size = this._map.getSize();
                if (!size || size.x <= 0 || size.y <= 0) {
                  return this;
                }
                try {
                  return origRedraw.apply(this, arguments);
                } catch (err) {
                  console.warn('[HeatLayer] Suppressed redraw on invalid map size:', err);
                  return this;
                }
              };

              const origReset = hlProto._reset;
              hlProto._reset = function () {
                if (!this._map) return this;
                const size = this._map.getSize();
                if (!size || size.x <= 0 || size.y <= 0) {
                  return this;
                }
                try {
                  return origReset.apply(this, arguments);
                } catch (err) {
                  console.warn('[HeatLayer] Suppressed reset on invalid map size:', err);
                  return this;
                }
              };
            }
          }

          setIsHeatPluginReady(true);
        })
        .catch((err) => {
          console.warn('[Leaflet] Heatmap plugin could not be dynamically loaded:', err);
        });
    }
  }, []);

  // Monitor map container resizing with ResizeObserver
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        setContainerDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.invalidateSize({ pan: false });
          } catch {}
        }
      }
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(container);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  // Initialize Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any lingering Leaflet instance or ID on DOM container
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }

    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    try {
      // Default center on Northeast India (Assam, Sikkim, Meghalaya, Manipur, Mizoram, Nagaland, Arunachal, Tripura)
      const map = L.map(mapContainerRef.current, {
        center: [26.0, 92.6],
        zoom: 6,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
      circlesGroupRef.current = L.layerGroup().addTo(map);
      escapeGroupRef.current = L.layerGroup().addTo(map);
      evidenceGroupRef.current = L.layerGroup().addTo(map);
      highwayGroupRef.current = L.layerGroup().addTo(map);
      villageGroupRef.current = L.layerGroup().addTo(map);

      // Attribution control
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);
    } catch (err) {
      console.warn('[Leaflet] Map creation caught:', err);
    }

    return () => {
      if (heatLayerRef.current && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.removeLayer(heatLayerRef.current);
        } catch {}
        heatLayerRef.current = null;
      }
      if (markersGroupRef.current && mapInstanceRef.current) {
        try {
          markersGroupRef.current.clearLayers();
        } catch {}
      }
      if (circlesGroupRef.current && mapInstanceRef.current) {
        try {
          circlesGroupRef.current.clearLayers();
        } catch {}
      }
      if (escapeGroupRef.current && mapInstanceRef.current) {
        try {
          escapeGroupRef.current.clearLayers();
        } catch {}
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update Tile Layer - Using robust Esri & OpenStreetMap tile servers (NO API key required, NO watermark)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let attribution = '';

    if (mapLayer === 'dark') {
      // Esri World Dark Gray Canvas: High-tech dark GIS theme, free and reliable with no API key requirement
      tileUrl = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, HERE, Garmin &copy; OpenStreetMap contributors';
    } else if (mapLayer === 'topo') {
      // Esri World Topographic: Rich terrain elevation and contours
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, USGS, NOAA';
    } else if (mapLayer === 'satellite') {
      // Esri World Imagery: Real satellite imagery
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, Earthstar Geographics';
    } else {
      // OpenStreetMap Standard: Detailed street and community geography
      tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);
  }, [mapLayer]);

  // Filter stations based on search and status with strict coordinate validation and case-insensitive matching
  const normalizedFilter = (filterStatus || 'all').toString().trim().toLowerCase();
  const filteredStations = stations.filter((st) => {
    if (
      !st ||
      typeof st.latitude !== 'number' ||
      isNaN(st.latitude) ||
      !isFinite(st.latitude) ||
      typeof st.longitude !== 'number' ||
      isNaN(st.longitude) ||
      !isFinite(st.longitude)
    ) {
      return false;
    }

    const stStatus = (st.riskAssessment?.status || 'moderate').toString().toLowerCase();
    let matchesStatus = true;
    if (normalizedFilter === 'all' || normalizedFilter === 'all_stations' || normalizedFilter === '' || normalizedFilter === '*') {
      matchesStatus = true;
    } else if (normalizedFilter === 'safe' || normalizedFilter === 'safe_only') {
      matchesStatus = stStatus === 'safe';
    } else if (normalizedFilter === 'critical') {
      matchesStatus = stStatus === 'critical';
    } else if (normalizedFilter === 'high') {
      matchesStatus = stStatus === 'high';
    } else if (normalizedFilter === 'moderate') {
      matchesStatus = stStatus === 'moderate';
    } else if (normalizedFilter === 'at_risk' || normalizedFilter === 'warning' || normalizedFilter === 'alert') {
      matchesStatus = stStatus === 'critical' || stStatus === 'high' || stStatus === 'moderate';
    } else {
      matchesStatus = stStatus === normalizedFilter;
    }

    const query = (searchQuery || '').trim().toLowerCase();
    if (!query) return matchesStatus;

    const cleanName = getCleanPlaceName(st).toLowerCase();
    const matchesSearch =
      cleanName.includes(query) ||
      (st.name || '').toLowerCase().includes(query) ||
      (st.region || '').toLowerCase().includes(query) ||
      (st.country || '').toLowerCase().includes(query) ||
      (st.id || '').toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

  // 1. DYNAMIC HEAT MAP VISUALIZATION LAYER (Leaflet.heat powered by latest ML risk model)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing heat layer if present
    if (heatLayerRef.current) {
      try {
        map.removeLayer(heatLayerRef.current);
      } catch (e) {
        // Ignored
      }
      heatLayerRef.current = null;
    }

    if (!showHeatMap || !isHeatPluginReady || typeof (L as any).heatLayer !== 'function') return;

    // Build heat points [lat, lng, intensity] based on filteredStations and selected telemetry metric
    const heatPoints: [number, number, number][] = [];

    filteredStations.forEach((st) => {
      if (
        typeof st.latitude !== 'number' ||
        isNaN(st.latitude) ||
        !isFinite(st.latitude) ||
        typeof st.longitude !== 'number' ||
        isNaN(st.longitude) ||
        !isFinite(st.longitude)
      ) {
        return;
      }

      let intensity = 0.2;

      if (heatMetric === 'risk') {
        // Blended weight from ML landslide risk score and failure probability
        const scoreNorm = (st.riskAssessment?.riskScore ?? 50) / 100;
        const probNorm = (st.riskAssessment?.failureProbabilityPct ?? 50) / 100;
        intensity = Math.min(1.0, Math.max(0.05, scoreNorm * 0.7 + probNorm * 0.3));

        if (st.riskAssessment?.status === 'safe') {
          intensity = 0.12; // Low/Cool thermal signature for Safe Zones
        } else if (st.riskAssessment?.status === 'critical') {
          intensity = 1.0; // Maximum hot thermal signature
        }
      } else if (heatMetric === 'pore_pressure') {
        // Pore water pressure: critical threshold typically > 35 kPa
        intensity = Math.min(1.0, Math.max(0.08, (st.telemetry?.poreWaterPressureKpa ?? 20) / 50));
      } else if (heatMetric === 'moisture') {
        // Volumetric soil moisture: critical threshold > 80%
        intensity = Math.min(1.0, Math.max(0.08, (st.telemetry?.soilMoisturePct ?? 50) / 100));
      } else if (heatMetric === 'erosion') {
        // Live erosion velocity: critical > 20 mm/yr
        intensity = Math.min(1.0, Math.max(0.08, (st.telemetry?.erosionRateMmPerYr ?? 10) / 32));
      }

      // Add primary station sensor point
      heatPoints.push([st.latitude, st.longitude, intensity]);

      // Add realistic surrounding slope gradient dispersion points to model geographic soil creep & catchment diffusion
      const dispersionCount = st.riskAssessment?.status === 'critical' ? 8 : st.riskAssessment?.status === 'high' ? 6 : 4;
      const dispersionRadiusDeg = st.riskAssessment?.status === 'critical' ? 0.09 : 0.055;

      for (let i = 0; i < dispersionCount; i++) {
        const angle = (i / dispersionCount) * Math.PI * 2;
        const dist = dispersionRadiusDeg * (0.35 + (i % 3) * 0.25);
        const subLat = st.latitude + Math.sin(angle) * dist;
        const subLng = st.longitude + Math.cos(angle) * dist;
        if (
          typeof subLat === 'number' &&
          !isNaN(subLat) &&
          isFinite(subLat) &&
          typeof subLng === 'number' &&
          !isNaN(subLng) &&
          isFinite(subLng)
        ) {
          const subIntensity = intensity * 0.72;
          heatPoints.push([subLat, subLng, subIntensity]);
        }
      }
    });

    // Strictly validate all heat points before handing to Leaflet
    const safeHeatPoints = heatPoints.filter(
      ([lat, lng, w]) =>
        typeof lat === 'number' &&
        !isNaN(lat) &&
        isFinite(lat) &&
        typeof lng === 'number' &&
        !isNaN(lng) &&
        isFinite(lng) &&
        typeof w === 'number' &&
        !isNaN(w) &&
        isFinite(w)
    );

    if (safeHeatPoints.length > 0) {
      const mapSize = map.getSize();
      if (!mapSize || mapSize.x <= 0 || mapSize.y <= 0) {
        return;
      }

      try {
        const heat = (L as any).heatLayer(safeHeatPoints, {
          radius: heatRadius,
          blur: 26,
          maxZoom: 16,
          max: 1.0,
          minOpacity: 0.42,
          gradient: {
            0.0: '#10b981', // Safe Zone (Emerald green)
            0.3: '#06b6d4', // Low Hazard (Cyan)
            0.5: '#eab308', // Moderate Risk (Amber/Yellow)
            0.72: '#f97316', // High Risk (Orange)
            1.0: '#ef4444', // Critical Alert (Vivid Red)
          },
        });

        heat.addTo(map);
        heatLayerRef.current = heat;
      } catch (err) {
        console.warn('[Leaflet] Heatmap layer construction error:', err);
      }
    }
  }, [filteredStations, showHeatMap, heatMetric, heatRadius, isHeatPluginReady, containerDimensions]);

  // 2. RENDER STATION MARKER PINS & HAZARD BUFFER CIRCLES
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const circlesGroup = circlesGroupRef.current;
    if (!map || !markersGroup || !circlesGroup) return;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();

    if (!showStationPins && !showHeatCircles) return;

    filteredStations.forEach((station) => {
      if (
        typeof station.latitude !== 'number' ||
        isNaN(station.latitude) ||
        !isFinite(station.latitude) ||
        typeof station.longitude !== 'number' ||
        isNaN(station.longitude) ||
        !isFinite(station.longitude)
      ) {
        return;
      }

      const { status } = station.riskAssessment || { status: 'moderate' };
      const isSelected = selectedStation?.id === station.id;

      // Color scheme based on status
      let color = '#10b981'; // safe: emerald
      let badgeLabel = 'SAFE';

      if (status === 'critical') {
        color = '#ef4444'; // critical: red
        badgeLabel = 'CRITICAL';
      } else if (status === 'high') {
        color = '#f97316'; // high: orange
        badgeLabel = 'HIGH RISK';
      } else if (status === 'moderate') {
        color = '#eab308'; // moderate: amber
        badgeLabel = 'MODERATE';
      }

      // Safe Zone requirement: "if it is a safe zone then show safe only"
      const isSafe = status === 'safe';

      // 2A. Edible & Good-Looking Clean Place Name Tag Marker
      if (showStationPins) {
        const placeName = getCleanPlaceName(station);
        const iconHtml = `
          <div class="custom-place-tag group cursor-pointer" style="transform: translate(-50%, -100%);">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-xl transition-all duration-200 ${
              isSelected
                ? 'bg-[#081b36] text-white border-2 border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-500/50 scale-105 z-50'
                : isSafe
                ? 'bg-[#06151c]/95 hover:bg-[#0b2432] text-slate-100 border border-emerald-500/60 hover:border-emerald-400 hover:scale-105 shadow-black/80'
                : status === 'critical'
                ? 'bg-[#20080d]/95 hover:bg-[#340f16] text-white border border-rose-500/80 hover:border-rose-400 hover:scale-105 shadow-black/80'
                : status === 'high'
                ? 'bg-[#1f1005]/95 hover:bg-[#331a08] text-slate-100 border border-orange-500/70 hover:border-orange-400 hover:scale-105 shadow-black/80'
                : 'bg-[#1b1505]/95 hover:bg-[#2b2208] text-slate-100 border border-amber-500/60 hover:border-amber-400 hover:scale-105 shadow-black/80'
            }">
              <span class="w-2 h-2 rounded-full shrink-0 ${
                isSafe
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                  : status === 'critical'
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.95)]'
                  : status === 'high'
                  ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.9)]'
                  : 'bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.8)]'
              }"></span>
              
              <span class="font-bold tracking-tight text-[11px] leading-tight select-none ${
                isSelected ? 'text-cyan-300' : 'text-slate-100'
              }">
                ${placeName}
              </span>
            </div>
            <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] ${
              isSelected
                ? 'border-t-cyan-400'
                : isSafe
                ? 'border-t-emerald-500'
                : status === 'critical'
                ? 'border-t-rose-500'
                : status === 'high'
                ? 'border-t-orange-500'
                : 'border-t-amber-500'
            } mx-auto -mt-[0.5px]"></div>
          </div>
        `;

        try {
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-clean-place-icon',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const marker = L.marker([station.latitude, station.longitude], {
            icon: customIcon,
            zIndexOffset: isSelected ? 1000 : isSafe ? 10 : status === 'critical' ? 50 : 20,
          });

          // Interactive Popup
          const popupHtml = `
            <div class="text-slate-900 font-sans p-1.5 min-w-[220px]">
              <div class="flex items-center justify-between gap-1.5 pb-1.5 mb-1.5 border-b border-slate-200">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${color};"></span>
                  <span class="font-bold text-xs truncate text-slate-900">${station.name}</span>
                </div>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                  isSafe ? 'bg-emerald-100 text-emerald-800' : status === 'critical' ? 'bg-rose-100 text-rose-800' : status === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                }">${isSafe ? 'SAFE' : badgeLabel}</span>
              </div>
              <div class="text-[11px] text-slate-600 mb-2">${station.region}, ${station.country}</div>
              
              <div class="grid grid-cols-2 gap-1.5 text-[11px] mb-2.5 bg-slate-100/90 p-2 rounded-lg">
                <div><span class="text-slate-500">Risk Score:</span> <strong class="${isSafe ? 'text-emerald-700' : 'text-rose-700'}">${station.riskAssessment?.riskScore ?? 50}%</strong></div>
                <div><span class="text-slate-500">Safety (FS):</span> <strong>${station.riskAssessment?.safetyFactor ?? 1.5}</strong></div>
                <div><span class="text-slate-500">Rain 24h:</span> <strong>${station.telemetry?.rainfall24hMm ?? 0} mm</strong></div>
                <div><span class="text-slate-500">Moisture:</span> <strong>${station.telemetry?.soilMoisturePct ?? 50}%</strong></div>
                <div><span class="text-slate-500">Pore Press:</span> <strong>${station.telemetry?.poreWaterPressureKpa ?? 15} kPa</strong></div>
                <div><span class="text-slate-500">Elevation:</span> <strong>${station.elevationM ?? 1000} m</strong></div>
              </div>

              <button id="inspect-btn-${station.id}" class="w-full text-center py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white cursor-pointer transition-colors shadow-sm">
                Select &amp; View Telemetry
              </button>
            </div>
          `;

          marker.bindPopup(popupHtml);

          marker.on('click', () => {
            onSelectStation(station);
          });

          marker.on('popupopen', () => {
            const btn = document.getElementById(`inspect-btn-${station.id}`);
            if (btn) {
              btn.onclick = () => onSelectStation(station);
            }
          });

          markersGroup.addLayer(marker);
        } catch (err) {
          console.warn('[Leaflet] Marker placement error:', err);
        }
      }

      // 2B. Add Heat / Risk Buffer Circles if enabled
      if (showHeatCircles) {
        try {
          const radiusMeters = isSafe ? 15000 : status === 'critical' ? 45000 : 30000;
          const circle = L.circle([station.latitude, station.longitude], {
            radius: radiusMeters,
            color: color,
            fillColor: color,
            fillOpacity: isSafe ? 0.08 : status === 'critical' ? 0.28 : 0.16,
            weight: isSafe ? 1 : 2,
            dashArray: isSafe ? '4, 4' : undefined,
          });
          circlesGroup.addLayer(circle);
        } catch (err) {
          console.warn('[Leaflet] Circle placement error:', err);
        }
      }
    });
  }, [filteredStations, selectedStation, showStationPins, showHeatCircles]);

  // 3. RENDER SAFE ESCAPE ROUTE & WAYPOINTS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const escapeGroup = escapeGroupRef.current;
    if (!map || !escapeGroup) return;

    escapeGroup.clearLayers();

    if (!showEscapeRoute || !selectedStation?.escapeRoute) return;

    const escape = selectedStation.escapeRoute;
    const waypoints = escape.safeWaypoints || [];

    // Path coordinates starting from station
    const pathCoords: [number, number][] = [];
    if (
      typeof selectedStation.latitude === 'number' &&
      !isNaN(selectedStation.latitude) &&
      isFinite(selectedStation.latitude) &&
      typeof selectedStation.longitude === 'number' &&
      !isNaN(selectedStation.longitude) &&
      isFinite(selectedStation.longitude)
    ) {
      pathCoords.push([selectedStation.latitude, selectedStation.longitude]);
    }

    waypoints.forEach((wp) => {
      if (
        typeof wp.lat === 'number' &&
        !isNaN(wp.lat) &&
        isFinite(wp.lat) &&
        typeof wp.lng === 'number' &&
        !isNaN(wp.lng) &&
        isFinite(wp.lng)
      ) {
        if (wp.type === 'Safe Shelter' || wp.type === 'Evacuation Hub') {
          pathCoords.push([wp.lat, wp.lng]);
        }
      }
    });

    if (pathCoords.length >= 2) {
      try {
        const polyline = L.polyline(pathCoords, {
          color: '#10b981',
          weight: 4,
          dashArray: '8, 8',
          opacity: 0.9,
        });
        polyline.bindTooltip(
          `Safe Route: ${escape.primaryRouteName} (${escape.distanceKm} km, ~${escape.estimatedEscapeMins}m)`,
          { sticky: true }
        );
        escapeGroup.addLayer(polyline);
      } catch (err) {
        console.warn('[Leaflet] Escape polyline error:', err);
      }
    }

    // Add Waypoint markers
    waypoints.forEach((wp) => {
      if (
        typeof wp.lat !== 'number' ||
        isNaN(wp.lat) ||
        !isFinite(wp.lat) ||
        typeof wp.lng !== 'number' ||
        isNaN(wp.lng) ||
        !isFinite(wp.lng)
      ) {
        return;
      }

      const isShelter = wp.type === 'Safe Shelter';
      const isHub = wp.type === 'Evacuation Hub';
      const isBlocked = wp.type === 'Blocked Road';

      const iconHtml = `
        <div class="flex flex-col items-center cursor-pointer">
          <div class="px-2 py-0.5 rounded-full text-xs font-bold shadow-lg border text-white flex items-center gap-1 ${
            isShelter
              ? 'bg-emerald-600 border-emerald-300 shadow-emerald-950 ring-2 ring-emerald-400/40'
              : isHub
              ? 'bg-cyan-600 border-cyan-300 shadow-cyan-950'
              : 'bg-rose-600 border-rose-300 shadow-rose-950 animate-bounce'
          }">
            <span>${isShelter ? '🛡️' : isHub ? '🏛️' : isBlocked ? '⛔' : '⚠️'}</span>
            <span class="text-[10px] whitespace-nowrap">${wp.type}</span>
          </div>
          <div class="mt-0.5 px-1.5 py-0.2 rounded bg-slate-950/90 text-white border border-slate-700 text-[9px] font-bold whitespace-nowrap shadow-md">
            ${wp.name}
          </div>
        </div>
      `;

      try {
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-escape-marker',
          iconSize: [120, 36],
          iconAnchor: [60, 18],
        });

        const marker = L.marker([wp.lat, wp.lng], { icon: customIcon });
        marker.bindPopup(`
          <div class="p-2 text-slate-900 font-sans text-xs">
            <strong class="${isShelter ? 'text-emerald-700' : isBlocked ? 'text-rose-700' : 'text-slate-800'}">${wp.name}</strong>
            <div class="text-[11px] text-slate-600 mt-1">Type: ${wp.type}</div>
            ${isShelter ? `<div class="text-emerald-600 font-bold mt-1">+${escape.elevationGainM}m Vertical Elevation Safety</div>` : ''}
          </div>
        `);
        escapeGroup.addLayer(marker);
      } catch (err) {
        console.warn('[Leaflet] Waypoint marker error:', err);
      }
    });
  }, [selectedStation, showEscapeRoute]);

  // 4. RENDER DISASTER EVIDENCE PHOTO MARKERS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const evidenceGroup = evidenceGroupRef.current;
    if (!map || !evidenceGroup) return;

    evidenceGroup.clearLayers();
    if (!showEvidencePins || !evidenceList || evidenceList.length === 0) return;

    evidenceList.forEach((ev) => {
      if (
        typeof ev.latitude !== 'number' ||
        isNaN(ev.latitude) ||
        !isFinite(ev.latitude) ||
        typeof ev.longitude !== 'number' ||
        isNaN(ev.longitude) ||
        !isFinite(ev.longitude)
      ) {
        return;
      }

      const isCritical = ev.severityLevel === 'critical';
      const iconHtml = `
        <div class="relative flex flex-col items-center cursor-pointer group">
          <div class="w-8 h-8 rounded-xl ${
            isCritical
              ? 'bg-rose-600 border-2 border-rose-300 shadow-rose-950/80 animate-pulse'
              : 'bg-amber-600 border-2 border-amber-300 shadow-amber-950/80'
          } flex items-center justify-center text-white shadow-xl transform transition-transform group-hover:scale-125">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
          </div>
          <div class="mt-1 px-1.5 py-0.2 rounded bg-slate-950/90 text-[9px] font-black text-rose-300 border border-rose-500/40 shadow-md whitespace-nowrap">
            PHOTO: ${ev.disasterType}
          </div>
        </div>
      `;

      try {
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-evidence-marker',
          iconSize: [110, 48],
          iconAnchor: [55, 24],
        });

        const marker = L.marker([ev.latitude, ev.longitude], { icon: customIcon });

        marker.bindPopup(`
          <div class="p-2.5 text-slate-900 font-sans text-xs max-w-xs">
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                isCritical ? 'bg-rose-600' : 'bg-amber-600'
              }">
                ${ev.disasterType}
              </span>
              <span class="text-[10px] font-bold text-slate-500 font-mono">${ev.identificationConfidencePct}% AI Confidence</span>
            </div>
            <img src="${ev.photoUrl}" alt="${ev.locationName}" style="width:100%; height:110px; object-fit:cover; border-radius:8px; margin-bottom:6px;" />
            <strong class="text-slate-900 block text-xs">${ev.locationName}</strong>
            <div class="text-[11px] text-slate-600 mb-1">${ev.region}</div>
            <p class="text-[10.5px] text-slate-700 italic line-clamp-2">"${ev.userObservations}"</p>
            <div class="mt-2 text-[10px] text-slate-500">
              Reported by <strong>${ev.reporterName}</strong> (${ev.reporterRole})
            </div>
          </div>
        `);

        evidenceGroup.addLayer(marker);
      } catch (err) {
        console.warn('[Leaflet] Evidence marker error:', err);
      }
    });
  }, [evidenceList, showEvidencePins]);

  // 5. RENDER NER HIGHWAY TOPOGRAPHIC RISK CORRIDORS (NH-10, NH-27, NH-29)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const highwayGroup = highwayGroupRef.current;
    if (!map || !highwayGroup) return;

    highwayGroup.clearLayers();
    if (!showHighways) return;

    HIGHWAY_RISK_SEGMENTS.forEach((hw) => {
      // Dynamic shift based on simulatedRiskLevel
      const effectiveRisk =
        simulatedRiskLevel === 'critical'
          ? 'emergency'
          : simulatedRiskLevel === 'warning'
          ? (hw.overallRisk === 'low' ? 'warning' : hw.overallRisk)
          : simulatedRiskLevel === 'safe'
          ? 'low'
          : hw.overallRisk;

      const isEmergency = effectiveRisk === 'emergency';
      const isWarning = effectiveRisk === 'warning';
      const strokeColor = isEmergency ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

      try {
        const validCoords = hw.coordinates.filter(
          (c) =>
            Array.isArray(c) &&
            c.length >= 2 &&
            typeof c[0] === 'number' &&
            !isNaN(c[0]) &&
            isFinite(c[0]) &&
            typeof c[1] === 'number' &&
            !isNaN(c[1]) &&
            isFinite(c[1])
        );
        if (validCoords.length < 2) return;

        // Outer glow buffer representing simulated topographic risk zone
        const bufferPolyline = L.polyline(validCoords, {
          color: strokeColor,
          weight: 12,
          opacity: 0.25,
          lineCap: 'round',
          lineJoin: 'round',
        });
        highwayGroup.addLayer(bufferPolyline);

        // Core road line
        const corePolyline = L.polyline(validCoords, {
          color: strokeColor,
          weight: 5,
          opacity: 0.95,
          dashArray: isEmergency ? '8, 6' : undefined,
        });

        corePolyline.bindTooltip(
          `<strong>${hw.highwayCode}: ${hw.segmentName}</strong><br/>Risk Score: ${isEmergency ? 92 : isWarning ? 68 : 24}% (${effectiveRisk.toUpperCase()})<br/>Active Blockades: ${isEmergency ? 3 : hw.activeBlockades}`,
          { sticky: true }
        );
        highwayGroup.addLayer(corePolyline);

        // Render critical points on the highway
        hw.criticalPoints.forEach((cp) => {
          if (
            typeof cp.lat !== 'number' ||
            isNaN(cp.lat) ||
            !isFinite(cp.lat) ||
            typeof cp.lng !== 'number' ||
            isNaN(cp.lng) ||
            !isFinite(cp.lng)
          ) {
            return;
          }
          const cpStatus =
            simulatedRiskLevel === 'critical'
              ? 'emergency'
              : simulatedRiskLevel === 'warning'
              ? (cp.status === 'low' ? 'warning' : cp.status)
              : simulatedRiskLevel === 'safe'
              ? 'low'
              : cp.status;
          const cpColor = cpStatus === 'emergency' ? '#ef4444' : cpStatus === 'warning' ? '#f59e0b' : '#10b981';
          const pointIcon = L.divIcon({
            html: `
              <div class="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black text-white shadow-xl whitespace-nowrap cursor-pointer" style="background-color:${cpColor}; border:1px solid rgba(255,255,255,0.4);">
                <span>${cpStatus === 'emergency' ? '🚨' : cpStatus === 'warning' ? '⚠️' : '✅'}</span>
                <span>${hw.highwayCode} ${cp.kmMarker}</span>
              </div>
            `,
            className: 'custom-highway-critical-marker',
            iconSize: [120, 22],
            iconAnchor: [60, 11],
          });

          const cpMarker = L.marker([cp.lat, cp.lng], { icon: pointIcon });
          cpMarker.bindPopup(`
            <div class="p-2 text-slate-900 font-sans text-xs">
              <strong class="text-slate-900 block font-bold">${hw.highwayCode} - ${cp.kmMarker}</strong>
              <div class="text-[11px] text-slate-600 mt-0.5">${cp.description}</div>
              <div class="mt-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style="background:${cpColor}">
                Status: ${cpStatus.toUpperCase()}
              </div>
            </div>
          `);
          highwayGroup.addLayer(cpMarker);
        });
      } catch (err) {
        console.warn('[Leaflet] Highway corridor render error:', err);
      }
    });
  }, [showHighways, simulatedRiskLevel]);

  // 6. RENDER REMOTE VILLAGE PINS ACROSS NER
  useEffect(() => {
    const map = mapInstanceRef.current;
    const villageGroup = villageGroupRef.current;
    if (!map || !villageGroup) return;

    villageGroup.clearLayers();
    if (!showVillages) return;

    REMOTE_VILLAGE_PINS.forEach((vil) => {
      if (
        typeof vil.latitude !== 'number' ||
        isNaN(vil.latitude) ||
        !isFinite(vil.latitude) ||
        typeof vil.longitude !== 'number' ||
        isNaN(vil.longitude) ||
        !isFinite(vil.longitude)
      ) {
        return;
      }
      const isEmergency = vil.riskStatus === 'emergency';
      const isWarning = vil.riskStatus === 'warning';
      const color = isEmergency ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

      const iconHtml = `
        <div class="flex flex-col items-center cursor-pointer group">
          <div class="px-2 py-1 rounded-xl font-bold text-[10px] text-white shadow-lg flex items-center gap-1.5 border border-white/30 transform group-hover:scale-110 transition-transform" style="background:${color};">
            <span>🏡</span>
            <span class="whitespace-nowrap">${vil.villageName}</span>
          </div>
          <div class="mt-0.5 px-1 rounded bg-slate-950/80 text-[8.5px] font-mono text-slate-300 border border-slate-700">
            Pop: ${vil.populationAtRisk.toLocaleString()}
          </div>
        </div>
      `;

      try {
        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-village-marker',
          iconSize: [110, 38],
          iconAnchor: [55, 19],
        });

        const marker = L.marker([vil.latitude, vil.longitude], { icon: customIcon });
        marker.bindPopup(`
          <div class="p-2.5 text-slate-900 font-sans text-xs max-w-xs">
            <div class="flex items-center justify-between gap-1 mb-1">
              <strong class="text-slate-900 text-sm">${vil.villageName}</strong>
              <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase text-white" style="background:${color};">
                ${vil.riskStatus.toUpperCase()}
              </span>
            </div>
            <div class="text-[11px] text-slate-600 mb-1">
              ${vil.district}, ${vil.state} • Elev: ${vil.elevationM}m
            </div>
            <div class="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-slate-800 mb-1.5">
              <strong>Advisory:</strong> ${vil.currentAdvisory}
            </div>
            <div class="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <span>🛡️ Safe Shelter:</span>
              <span>${vil.safeShelterHaven}</span>
            </div>
            <div class="text-[10px] text-slate-500 mt-1">
              Highway Link: <strong>${vil.associatedHighway}</strong> | Pop: <strong>${vil.populationAtRisk}</strong>
            </div>
          </div>
        `);

        villageGroup.addLayer(marker);
      } catch (err) {
        console.warn('[Leaflet] Village pin error:', err);
      }
    });
  }, [showVillages]);

  const initialFitRef = useRef<boolean>(false);

  // Pan to selected station with strict coordinate check
  useEffect(() => {
    if (
      selectedStation &&
      typeof selectedStation.latitude === 'number' &&
      !isNaN(selectedStation.latitude) &&
      isFinite(selectedStation.latitude) &&
      typeof selectedStation.longitude === 'number' &&
      !isNaN(selectedStation.longitude) &&
      isFinite(selectedStation.longitude) &&
      mapInstanceRef.current
    ) {
      try {
        const container = mapContainerRef.current;
        if (container && container.clientWidth > 10 && container.clientHeight > 10) {
          mapInstanceRef.current.invalidateSize();
          mapInstanceRef.current.flyTo([selectedStation.latitude, selectedStation.longitude], 10, {
            duration: 1.2,
          });
        }
      } catch (err) {
        console.warn('[Leaflet] flyTo error:', err);
      }
    }
  }, [selectedStation]);

  const fitAllStations = () => {
    const map = mapInstanceRef.current;
    if (!map || stations.length === 0) return;
    const container = mapContainerRef.current;
    if (!container || container.clientWidth < 10 || container.clientHeight < 10) return;

    const validCoords = stations
      .filter(
        (s) =>
          typeof s.latitude === 'number' &&
          !isNaN(s.latitude) &&
          isFinite(s.latitude) &&
          typeof s.longitude === 'number' &&
          !isNaN(s.longitude) &&
          isFinite(s.longitude)
      )
      .map((s) => [s.latitude, s.longitude] as [number, number]);
    if (validCoords.length === 0) return;
    try {
      map.invalidateSize();
      const bounds = L.latLngBounds(validCoords);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 11, animate: false });
      }
    } catch (err) {
      console.warn('[Leaflet] fitBounds error:', err);
    }
  };

  // Initial fit to show all places clearly on load
  useEffect(() => {
    if (!initialFitRef.current && stations.length > 0 && mapInstanceRef.current) {
      initialFitRef.current = true;
      const timer = setTimeout(() => {
        fitAllStations();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [stations]);

  return (
    <div
      id="landslide-map-wrapper"
      className="relative isolate z-0 w-full h-full min-h-[350px] rounded-2xl overflow-hidden border border-indigo-500/20 shadow-inner bg-[#080e22]"
    >
      {/* Map Canvas Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top-Left: Search Bar & Floating Select Place Dropdown */}
      <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-1.5 flex-wrap max-w-[calc(100%-160px)]">
        {/* Search Input */}
        <div className="flex items-center bg-[#0b1433]/95 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 shadow-xl w-36 sm:w-44 pointer-events-auto">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search place..."
            className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full min-w-0"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-slate-400 hover:text-white ml-1 px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Compact Select Place with Clean Names */}
        <div className="bg-[#0b1433]/95 backdrop-blur-md border border-indigo-500/40 rounded-xl px-2.5 py-1 shadow-xl flex items-center gap-1.5 pointer-events-auto">
          <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-wider shrink-0 hidden sm:inline">
            PLACE:
          </span>
          <select
            value={selectedStation?.id || ''}
            onChange={(e) => {
              const found = stations.find((s) => s.id === e.target.value);
              if (found) {
                onSelectStation(found);
                if (
                  mapInstanceRef.current &&
                  typeof found.latitude === 'number' &&
                  !isNaN(found.latitude) &&
                  isFinite(found.latitude) &&
                  typeof found.longitude === 'number' &&
                  !isNaN(found.longitude) &&
                  isFinite(found.longitude)
                ) {
                  mapInstanceRef.current.flyTo([found.latitude, found.longitude], 10, { duration: 1.2 });
                }
              }
            }}
            className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[170px] truncate"
          >
            {stations.map((st) => {
              const clean = getCleanPlaceName(st);
              const region = st.region ? st.region.split(',')[0].replace(/District/i, '').trim() : '';
              return (
                <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                  {clean} {region ? `(${region})` : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Right Side: Vertically Aligned Inside Map Controls */}
      <div className="absolute top-3 right-3 bottom-12 z-10 pointer-events-none flex flex-col items-end">
        <div className="pointer-events-auto flex flex-col items-end gap-1.5 max-h-full overflow-y-auto pr-0.5 no-scrollbar py-0.5">
          {/* Zoom Controls */}
          <div className="flex flex-col bg-[#0b1433]/95 backdrop-blur-md border border-slate-700/80 rounded-xl overflow-hidden shadow-xl">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="h-[1px] bg-slate-800" />
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fit All Monitored Places Button */}
          <button
            type="button"
            onClick={fitAllStations}
            className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0b1433]/95 backdrop-blur-md border border-slate-700/80 hover:border-cyan-400/60 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-xl cursor-pointer w-36 active:scale-95"
            title="View all 20 monitored landslide places"
          >
            <div className="flex items-center gap-1.5">
              <Maximize className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Fit All ({stations.length})</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1 rounded bg-indigo-500/20 text-indigo-300">
              ALL
            </span>
          </button>

          {/* Current Location Button */}
          <button
            type="button"
            onClick={() => {
              if (
                selectedStation &&
                typeof selectedStation.latitude === 'number' &&
                !isNaN(selectedStation.latitude) &&
                isFinite(selectedStation.latitude) &&
                typeof selectedStation.longitude === 'number' &&
                !isNaN(selectedStation.longitude) &&
                isFinite(selectedStation.longitude) &&
                mapInstanceRef.current
              ) {
                try {
                  mapInstanceRef.current.flyTo([selectedStation.latitude, selectedStation.longitude], 10);
                } catch (err) {
                  console.warn('[Leaflet] Current location flyTo error:', err);
                }
              }
            }}
            className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0b1433]/95 backdrop-blur-md border border-slate-700/80 hover:border-cyan-400/60 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-xl cursor-pointer w-36 active:scale-95"
            title="Fly to selected station location"
          >
            <div className="flex items-center gap-1.5">
              <LocateFixed className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">Current Loc</span>
            </div>
          </button>

          {/* Basemap Segmented Toggle (Satellite / Terrain) */}
          <div className="flex flex-col bg-[#0b1433]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-0.5 shadow-xl w-36">
            <button
              type="button"
              onClick={() => setMapLayer('satellite')}
              className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapLayer === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 shrink-0 text-cyan-300" />
                <span>Satellite</span>
              </div>
              {mapLayer === 'satellite' && <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />}
            </button>
            <button
              type="button"
              onClick={() => setMapLayer('topo')}
              className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapLayer === 'topo'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 shrink-0 text-amber-300" />
                <span>Terrain</span>
              </div>
              {mapLayer === 'topo' && <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />}
            </button>
          </div>

          {/* Flood Risk Toggle */}
          <button
            type="button"
            onClick={() => setShowFloodLayer(!showFloodLayer)}
            className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border w-36 cursor-pointer active:scale-95 ${
              showFloodLayer
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-cyan-900/50'
                : 'bg-[#0b1433]/95 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Flood</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${showFloodLayer ? 'bg-cyan-200 animate-pulse' : 'bg-slate-600'}`} />
          </button>

          {/* Landslide Heatmap Toggle */}
          <button
            type="button"
            onClick={() => setShowHeatMap(!showHeatMap)}
            className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border w-36 cursor-pointer active:scale-95 ${
              showHeatMap
                ? 'bg-amber-600 text-white border-amber-400 shadow-amber-900/50'
                : 'bg-[#0b1433]/95 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Landslide</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${showHeatMap ? 'bg-amber-200 animate-pulse' : 'bg-slate-600'}`} />
          </button>

          {/* Safe Escape Route Toggle */}
          <button
            type="button"
            onClick={() => setShowEscapeRoute(!showEscapeRoute)}
            className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border w-36 cursor-pointer active:scale-95 ${
              showEscapeRoute
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950'
                : 'bg-[#0b1433]/95 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span>Safe Route</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${showEscapeRoute ? 'bg-emerald-200 animate-pulse' : 'bg-slate-600'}`} />
          </button>

          {/* NH Highway Corridors Toggle */}
          <button
            type="button"
            onClick={() => setShowHighways(!showHighways)}
            className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border w-36 cursor-pointer active:scale-95 ${
              showHighways
                ? 'bg-amber-600 text-white border-amber-400 shadow-amber-950/40'
                : 'bg-[#0b1433]/95 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Toggle simulated topographic heatmaps for NH-10, NH-27, and NH-29"
          >
            <div className="flex items-center gap-1.5">
              <span>🛣️</span>
              <span className="truncate">NH Corridors</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${showHighways ? 'bg-amber-200 animate-pulse' : 'bg-slate-600'}`} />
          </button>

          {/* Remote Village Pins Toggle */}
          <button
            type="button"
            onClick={() => setShowVillages(!showVillages)}
            className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border w-36 cursor-pointer active:scale-95 ${
              showVillages
                ? 'bg-teal-600 text-white border-teal-400 shadow-teal-950/40'
                : 'bg-[#0b1433]/95 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Toggle interactive pins for remote NER villages"
          >
            <div className="flex items-center gap-1.5">
              <span>🏡</span>
              <span className="truncate">Villages</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${showVillages ? 'bg-teal-200 animate-pulse' : 'bg-slate-600'}`} />
          </button>

          {/* Photo Evidence Layer & Modal Toggle */}
          <button
            type="button"
            onClick={() => {
              if (onOpenEvidenceModal) {
                onOpenEvidenceModal();
              } else {
                setShowEvidencePins(!showEvidencePins);
              }
            }}
            className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xl border w-36 cursor-pointer active:scale-95 ${
              showEvidencePins
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-rose-400 shadow-rose-950/40'
                : 'bg-[#0b1433]/95 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-600'
            }`}
            title="Field Disaster Photo Evidence & AI Identification"
          >
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span className="truncate">Evidence</span>
            </div>
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-[10px] text-white font-mono font-bold">
              {evidenceList.length}
            </span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Left Tag */}
      <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex items-center gap-2 text-[10px] sm:text-[11px] bg-[#0b1433]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 text-slate-300 shadow-xl">
        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span>Esri World Imagery • 11 Sept 2026, 10:16 am DEMO</span>
      </div>
    </div>
  );
};
