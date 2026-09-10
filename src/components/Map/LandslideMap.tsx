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
  Info
} from 'lucide-react';

interface LandslideMapProps {
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  filterStatus: RiskStatus | 'all';
  onFilterChange: (status: RiskStatus | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);

  // Map state
  const [mapLayer, setMapLayer] = useState<MapLayerType>('dark');
  const [showHeatMap, setShowHeatMap] = useState<boolean>(true);
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

  // Filter stations based on search and status
  const filteredStations = stations.filter((st) => {
    const matchesStatus = filterStatus === 'all' ? true : st.riskAssessment.status === filterStatus;
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 1. DYNAMIC HEAT MAP VISUALIZATION LAYER (Leaflet.heat powered by latest ML risk model)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing heat layer if present
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!showHeatMap || !isHeatPluginReady || typeof (L as any).heatLayer !== 'function') return;

    // Build heat points [lat, lng, intensity] based on filteredStations and selected telemetry metric
    const heatPoints: [number, number, number][] = [];

    filteredStations.forEach((st) => {
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
        const subIntensity = intensity * 0.72;
        heatPoints.push([subLat, subLng, subIntensity]);
      }
    });

    if (heatPoints.length > 0) {
      try {
        const heat = (L as any).heatLayer(heatPoints, {
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
        console.warn('[Leaflet] HeatLayer creation caught:', err);
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
      const { status } = station.riskAssessment;
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
                ${isSafe ? '✓' : station.riskAssessment.riskScore + '%'}
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
      }

      // 2B. Add Heat / Risk Buffer Circles if enabled
      if (showHeatCircles) {
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
      }
    });
  }, [filteredStations, selectedStation, showStationPins, showHeatCircles]);

  // Pan to selected station
  useEffect(() => {
    if (selectedStation && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedStation.latitude, selectedStation.longitude], 9, {
        duration: 1.2,
      });
    }
  }, [selectedStation]);

  const fitAllStations = () => {
    if (!mapInstanceRef.current || stations.length === 0) return;
    const bounds = L.latLngBounds(stations.map((s) => [s.latitude, s.longitude]));
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
  };

  return (
    <div
      id="landslide-map-wrapper"
      className="relative w-full h-[460px] lg:h-[500px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950"
    >
      {/* Map Canvas Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Bar: Controls & Filters */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
        {/* Search Bar */}
        <div className="pointer-events-auto flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 shadow-xl w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Northeast places, states (e.g. Gangtok, Noney, Assam)..."
            className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-slate-400 hover:text-white ml-1 px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-xl overflow-x-auto">
          <button
            id="filter-all"
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All ({stations.length})
          </button>
          <button
            id="filter-safe"
            onClick={() => onFilterChange('safe')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
              filterStatus === 'safe'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-emerald-400 hover:bg-emerald-950/40'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Safe Only ({stations.filter((s) => s.riskAssessment.status === 'safe').length})
          </button>
          <button
            id="filter-moderate"
            onClick={() => onFilterChange('moderate')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
              filterStatus === 'moderate'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-400 hover:bg-amber-950/40'
            }`}
          >
            Moderate ({stations.filter((s) => s.riskAssessment.status === 'moderate').length})
          </button>
          <button
            id="filter-high"
            onClick={() => onFilterChange('high')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
              filterStatus === 'high'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-orange-400 hover:bg-orange-950/40'
            }`}
          >
            High ({stations.filter((s) => s.riskAssessment.status === 'high').length})
          </button>
          <button
            id="filter-critical"
            onClick={() => onFilterChange('critical')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 whitespace-nowrap ${
              filterStatus === 'critical'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical ({stations.filter((s) => s.riskAssessment.status === 'critical').length})
          </button>
        </div>
      </div>

      {/* Floating Right Map Utility Controls */}
      <div className="absolute top-20 right-4 z-[400] flex flex-col gap-2 pointer-events-auto">
        {/* Layer Switcher (Esri Dark, Topo, Satellite, OSM) */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-xl flex flex-col gap-1">
          <button
            id="layer-dark-btn"
            title="Dark Gray GIS Base (Esri)"
            onClick={() => setMapLayer('dark')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
              mapLayer === 'dark' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            id="layer-topo-btn"
            title="Mountain Topographic Relief (Esri)"
            onClick={() => setMapLayer('topo')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
              mapLayer === 'topo' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            id="layer-satellite-btn"
            title="High-Res Satellite Imagery (Esri)"
            onClick={() => setMapLayer('satellite')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
              mapLayer === 'satellite' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
          </button>
          <button
            id="layer-osm-btn"
            title="OpenStreetMap Standard"
            onClick={() => setMapLayer('osm')}
            className={`p-2 rounded-lg text-xs font-medium flex items-center justify-center transition-colors ${
              mapLayer === 'osm' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>

        {/* Heat Map Main Quick Toggle Button */}
        <div className="relative">
          <button
            id="toggle-heatmap-btn"
            title={showHeatMap ? 'Turn Heat Map Layer OFF' : 'Turn Heat Map Layer ON'}
            onClick={() => setShowHeatMap(!showHeatMap)}
            className={`p-2 rounded-xl backdrop-blur-md border shadow-xl flex items-center justify-center transition-all ${
              showHeatMap
                ? 'bg-gradient-to-br from-rose-600 to-amber-600 text-white border-rose-400 shadow-rose-900/40 ring-2 ring-rose-500/40'
                : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-700/80'
            }`}
          >
            <Flame className={`w-4 h-4 ${showHeatMap ? 'animate-pulse' : ''}`} />
          </button>
        </div>

        {/* Heat Map Config Menu Popover Button */}
        <button
          id="heat-config-menu-btn"
          title="Configure Heat Map Metric & Density"
          onClick={() => setIsHeatConfigOpen(!isHeatConfigOpen)}
          className={`p-2 rounded-xl backdrop-blur-md border shadow-xl transition-colors ${
            isHeatConfigOpen ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-700/80'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        {/* Toggle Station Marker Pins */}
        <button
          id="toggle-pins-btn"
          title={showStationPins ? 'Hide Station Pin Markers' : 'Show Station Pin Markers'}
          onClick={() => setShowStationPins(!showStationPins)}
          className={`p-2 rounded-xl backdrop-blur-md border border-slate-700/80 shadow-xl transition-colors ${
            showStationPins ? 'bg-slate-900/90 text-indigo-400' : 'bg-slate-900/90 text-slate-500'
          }`}
        >
          {showStationPins ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Fit All Stations */}
        <button
          id="fit-bounds-btn"
          title="Zoom to Fit All 20 Places"
          onClick={fitAllStations}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 shadow-xl backdrop-blur-md"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Zoom Controls */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-xl flex flex-col gap-1">
          <button
            id="zoom-in-btn"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="zoom-out-btn"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Heat Map Advanced Configuration Modal / Flyout */}
      {isHeatConfigOpen && (
        <div className="absolute top-20 right-16 z-[450] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl w-72 text-white space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Heat Map Layer</h4>
            </div>
            <button
              onClick={() => setIsHeatConfigOpen(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Toggle Heat Map Active */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Thermal Heat Raster</span>
            <button
              id="switch-heatmap-status"
              onClick={() => setShowHeatMap(!showHeatMap)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                showHeatMap ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {showHeatMap ? 'ACTIVE' : 'MUTED'}
            </button>
          </div>

          {/* Metric Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1.5">
              ML Geotechnical Metric
            </label>
            <div className="grid grid-cols-1 gap-1">
              <button
                onClick={() => setHeatMetric('risk')}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  heatMetric === 'risk' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>ML Landslide Risk Score</span>
                <Sparkles className="w-3 h-3 text-amber-300" />
              </button>
              <button
                onClick={() => setHeatMetric('pore_pressure')}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  heatMetric === 'pore_pressure' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Soil Pore Water Pressure</span>
                <Gauge className="w-3 h-3 text-cyan-300" />
              </button>
              <button
                onClick={() => setHeatMetric('moisture')}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  heatMetric === 'moisture' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Soil Moisture Saturation</span>
                <Droplets className="w-3 h-3 text-blue-300" />
              </button>
              <button
                onClick={() => setHeatMetric('erosion')}
                className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                  heatMetric === 'erosion' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>Accelerated Soil Erosion</span>
                <Activity className="w-3 h-3 text-rose-300" />
              </button>
            </div>
          </div>

          {/* Thermal Radius Slider */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-400">Diffusion Radius</span>
              <span className="font-mono text-indigo-300">{heatRadius}px</span>
            </div>
            <input
              type="range"
              min="25"
              max="70"
              value={heatRadius}
              onChange={(e) => setHeatRadius(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Hazard Buffer Circles */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-300">Hazard Ring Buffers</span>
            <button
              onClick={() => setShowHeatCircles(!showHeatCircles)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                showHeatCircles ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {showHeatCircles ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Floating Bar: Heat Map Spectrum & Status Legend */}
      <div className="absolute bottom-4 left-4 right-4 md:right-auto z-[400] bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-xl flex flex-col md:flex-row items-start md:items-center gap-4 text-xs">
        {/* Heat Map Gradient Legend */}
        {showHeatMap && (
          <div className="flex flex-col gap-1 pr-3 md:border-r md:border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold gap-2">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                ML Heat Layer:
              </span>
              <span className="text-indigo-300 font-medium capitalize">
                {heatMetric === 'risk'
                  ? 'Landslide Risk Score'
                  : heatMetric === 'pore_pressure'
                  ? 'Pore Water Pressure'
                  : heatMetric === 'moisture'
                  ? 'Soil Saturation'
                  : 'Erosion Rate'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-emerald-400 font-bold">Safe</span>
              <div className="w-32 h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-400 via-orange-500 to-rose-600 border border-slate-700 shadow-inner"></div>
              <span className="text-[10px] text-rose-400 font-bold">Critical</span>
            </div>
          </div>
        )}

        {/* Standard Geological Advisory Categories */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-300"></div>
            <span>SAFE ZONE (FS &ge; 1.80)</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span>Moderate (25-50%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>High Risk (50-75%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 font-bold">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
            <span>Critical (&gt;75% Evacuate)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
