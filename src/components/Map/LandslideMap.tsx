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
  CheckCircle2
} from 'lucide-react';

interface LandslideMapProps {
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  filterStatus: RiskStatus | 'all';
  onFilterChange: (status: RiskStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenEscapeModal?: () => void;
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
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesGroupRef = useRef<L.LayerGroup | null>(null);
  const escapeGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);

  // Map state - Default to satellite to match the screenshot 'Esri World Imagery'
  const [mapLayer, setMapLayer] = useState<MapLayerType>('satellite');
  const [showHeatMap, setShowHeatMap] = useState<boolean>(true);
  const [showEscapeRoute, setShowEscapeRoute] = useState<boolean>(true);
  const [showFloodLayer, setShowFloodLayer] = useState<boolean>(false);
  const [heatMetric, setHeatMetric] = useState<HeatMetricType>('risk');
  const [heatRadius, setHeatRadius] = useState<number>(45);
  const [showStationPins, setShowStationPins] = useState<boolean>(true);
  const [showHeatCircles, setShowHeatCircles] = useState<boolean>(false);
  const [isHeatConfigOpen, setIsHeatConfigOpen] = useState<boolean>(false);
  const [isHeatPluginReady, setIsHeatPluginReady] = useState<boolean>(false);

  // Dynamically load leaflet.heat after verifying global L
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).L = L;
      import('leaflet.heat')
        .then(() => {
          setIsHeatPluginReady(true);
        })
        .catch((err) => {
          console.warn('[Leaflet] Heatmap plugin could not be dynamically loaded:', err);
        });
    }
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

  // Filter stations based on search and status with strict coordinate validation
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
    const matchesStatus = filterStatus === 'all' ? true : st.riskAssessment?.status === filterStatus;
    const matchesSearch =
      (st.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.country || '').toLowerCase().includes(searchQuery.toLowerCase());
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
  }, [filteredStations, showHeatMap, heatMetric, heatRadius, isHeatPluginReady]);

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

      // 2A. Marker Pin
      if (showStationPins) {
        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            ${
              status === 'critical'
                ? `<div class="absolute -inset-2 rounded-full bg-rose-600/40 animate-ping"></div>`
                : ''
            }
            ${
              isSelected
                ? `<div class="absolute -inset-3 rounded-full border-2 border-cyan-400 animate-pulse"></div>`
                : ''
            }
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 transform group-hover:scale-125 ${
              isSafe
                ? 'bg-emerald-600 border-2 border-emerald-300 text-white shadow-emerald-900/50'
                : status === 'critical'
                ? 'bg-rose-600 border-2 border-rose-300 text-white shadow-rose-900/80 animate-bounce'
                : status === 'high'
                ? 'bg-orange-500 border-2 border-orange-200 text-white shadow-orange-900/60'
                : 'bg-amber-500 border-2 border-amber-200 text-white shadow-amber-900/60'
            }">
              <span class="text-[10px] font-extrabold tracking-tighter">
                ${isSafe ? '✓' : (station.riskAssessment?.riskScore ?? 50) + '%'}
              </span>
            </div>

            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold shadow-md ${
              isSafe
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : status === 'critical'
                ? 'bg-rose-950 text-rose-200 border border-rose-500'
                : status === 'high'
                ? 'bg-amber-950 text-orange-200 border border-orange-500'
                : 'bg-yellow-950 text-yellow-200 border border-yellow-500'
            }">
              ${isSafe ? 'SAFE' : station.name.split(' ')[0]}
            </div>
          </div>
        `;

        try {
          const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-landslide-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const marker = L.marker([station.latitude, station.longitude], {
            icon: customIcon,
          });

          // Interactive Popup
          const popupHtml = `
            <div class="text-slate-900 font-sans p-1 min-w-[220px]">
              <div class="flex items-center justify-between pb-1 mb-1 border-b border-slate-200">
                <span class="font-bold text-xs truncate">${station.name}</span>
                <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }">${isSafe ? 'SAFE' : badgeLabel}</span>
              </div>
              <div class="text-[11px] text-slate-600 mb-2">${station.region}, ${station.country}</div>
              
              <div class="grid grid-cols-2 gap-1 text-[11px] mb-2 bg-slate-50 p-1.5 rounded">
                <div><strong>Temp:</strong> ${station.telemetry?.temperatureC ?? 24}°C</div>
                <div><strong>Moisture:</strong> ${station.telemetry?.soilMoisturePct ?? 50}%</div>
                <div><strong>Erosion:</strong> ${station.telemetry?.erosionRateMmPerYr ?? 10} mm/y</div>
                <div><strong>Pore Press:</strong> ${station.telemetry?.poreWaterPressureKpa ?? 15} kPa</div>
                <div><strong>FS:</strong> ${station.riskAssessment?.safetyFactor ?? 1.5}</div>
                <div><strong>Rain 24h:</strong> ${station.telemetry?.rainfall24hMm ?? 0} mm</div>
              </div>

              <button id="inspect-btn-${station.id}" class="w-full text-center py-1.5 text-xs font-semibold rounded bg-slate-900 text-white hover:bg-slate-800 cursor-pointer">
                Inspect Full Station Telemetry
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
        mapInstanceRef.current.flyTo([selectedStation.latitude, selectedStation.longitude], 9, {
          duration: 1.2,
        });
      } catch (err) {
        console.warn('[Leaflet] flyTo error:', err);
      }
    }
  }, [selectedStation]);

  const fitAllStations = () => {
    if (!mapInstanceRef.current || stations.length === 0) return;
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
      const bounds = L.latLngBounds(validCoords);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
    } catch (err) {
      console.warn('[Leaflet] fitBounds error:', err);
    }
  };

  return (
    <div
      id="landslide-map-wrapper"
      className="relative w-full h-[520px] lg:h-[580px] rounded-3xl overflow-hidden border border-indigo-500/20 shadow-2xl bg-[#080e22]"
    >
      {/* Map Canvas Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Bar: Controls & Filters */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col md:flex-row items-stretch md:items-start justify-between gap-3 pointer-events-none">
        {/* Left Side: Search Bar & Floating Select Place Dropdown */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Search Input */}
          <div className="flex items-center bg-[#0b1433]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl px-3 py-2 shadow-xl w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              id="map-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search location..."
              className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full"
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

          {/* Floating SELECT PLACE Card (matching screenshot) */}
          <div className="bg-[#0b1433]/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-3 shadow-2xl min-w-[260px]">
            <div className="text-[10px] font-extrabold text-cyan-400 tracking-wider uppercase mb-1 flex items-center justify-between">
              <span>SELECT PLACE</span>
              <span className="text-[9px] text-slate-400 font-mono">{stations.length} Available</span>
            </div>
            <select
              value={selectedStation?.id || ''}
              onChange={(e) => {
                const found = stations.find((s) => s.id === e.target.value);
                if (found) onSelectStation(found);
              }}
              className="w-full bg-[#070d22] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                  {st.name}, {st.region}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 mt-2 text-[10.5px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE DASHBOARD • {selectedStation?.name || 'Agartala'}</span>
            </div>
          </div>
        </div>

        {/* Top-Right Floating Controls (Pills matching screenshot) */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
          {/* Current Location Button */}
          <button
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0b1433]/90 backdrop-blur-md border border-slate-700/80 hover:border-slate-500 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-xl cursor-pointer"
          >
            <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
            <span>Current Location</span>
          </button>

          {/* Satellite Layer Toggle */}
          <button
            onClick={() => setMapLayer('satellite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-xl cursor-pointer border ${
              mapLayer === 'satellite'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-900/50'
                : 'bg-[#0b1433]/90 backdrop-blur-md border-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>

          {/* Terrain Layer Toggle */}
          <button
            onClick={() => setMapLayer('topo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-xl cursor-pointer border ${
              mapLayer === 'topo'
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-900/50'
                : 'bg-[#0b1433]/90 backdrop-blur-md border-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Terrain</span>
          </button>

          {/* Flood Risk Toggle */}
          <button
            onClick={() => setShowFloodLayer(!showFloodLayer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-xl cursor-pointer border ${
              showFloodLayer
                ? 'bg-cyan-600 text-white border-cyan-400'
                : 'bg-[#0b1433]/90 backdrop-blur-md border-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5 text-cyan-300" />
            <span>Flood</span>
          </button>

          {/* Landslide Heatmap Toggle */}
          <button
            onClick={() => setShowHeatMap(!showHeatMap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-xl cursor-pointer border ${
              showHeatMap
                ? 'bg-amber-600 text-white border-amber-400'
                : 'bg-[#0b1433]/90 backdrop-blur-md border-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Landslide</span>
          </button>

          {/* Safe Escape Route Toggle */}
          <button
            onClick={() => setShowEscapeRoute(!showEscapeRoute)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold transition-all shadow-xl cursor-pointer border ${
              showEscapeRoute
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-950'
                : 'bg-[#0b1433]/90 backdrop-blur-md border-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-300" />
            <span>Safe Route</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-[#0b1433]/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-0.5 shadow-xl">
            <button
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Left Tag (matching screenshot) */}
      <div className="absolute bottom-3 left-4 z-[400] pointer-events-none flex items-center gap-2 text-[11px] bg-[#0b1433]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800 text-slate-300 shadow-xl">
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
        <span>Esri World Imagery • 11 Sept 2026, 10:16 am DEMO</span>
      </div>
    </div>
  );
};
