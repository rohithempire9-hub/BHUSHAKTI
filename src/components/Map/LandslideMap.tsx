import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { LandslideStation, RiskStatus, DisasterEvidenceReport } from '../../types/landslide';
import { HIGHWAY_RISK_SEGMENTS, REMOTE_VILLAGE_PINS } from '../../data/bhuShaktiData';
import {
  SAFE_EVACUATION_ROUTES,
  COMMUNITY_HUBS,
  GEOSPATIAL_RISK_ZONES,
  RiskLevelTier,
  SafeEvacuationRoute,
  CommunityHub,
  GeospatialRiskZone,
} from '../../data/geospatialRiskZones';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Search,
  Droplets,
  MapPin,
  Navigation,
  LocateFixed,
  Globe,
  Waves,
  CheckCircle2,
  Camera,
  CloudRain,
  Thermometer,
  Wind,
  Building2,
  Cross,
  Hospital,
  ShieldAlert,
  X,
  ChevronDown,
  Check,
  Activity,
  Milestone,
  Route,
  Home,
  Shield,
  Compass,
  AlertOctagon
} from 'lucide-react';

/**
 * Returns a concise, recognizable place name for map pins and UI selectors.
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

// Major Northeast river channel coordinates for verified geospatial visualization
const RIVER_SYSTEMS = [
  {
    name: 'Brahmaputra River Corridor',
    state: 'Assam / Arunachal',
    coordinates: [
      [27.95, 95.38],
      [27.48, 94.92],
      [26.91, 93.64],
      [26.65, 92.83],
      [26.19, 91.75],
      [26.12, 90.62],
      [25.98, 89.98]
    ] as [number, number][],
    waterLevel: 'High (0.8m below danger level)',
  },
  {
    name: 'Barak River Basin',
    state: 'Assam / Manipur',
    coordinates: [
      [25.18, 93.18],
      [24.89, 92.89],
      [24.82, 92.79],
      [24.88, 92.52],
      [24.93, 92.35]
    ] as [number, number][],
    waterLevel: 'Moderate Flow (Normal)',
  },
  {
    name: 'Teesta River Basin',
    state: 'Sikkim / West Bengal',
    coordinates: [
      [27.92, 88.62],
      [27.65, 88.55],
      [27.32, 88.51],
      [27.05, 88.54],
      [26.85, 88.72]
    ] as [number, number][],
    waterLevel: 'Rapid Glacier Runoff',
  }
];

// District civil hospitals & medical relief centers
const DISTRICT_HOSPITALS = [
  { id: 'hosp-tawang', name: 'District Civil Hospital Tawang', lat: 27.586, lng: 91.865, beds: 120, state: 'Arunachal' },
  { id: 'hosp-gangtok', name: 'STNM Multispecialty Hospital Gangtok', lat: 27.325, lng: 88.608, beds: 350, state: 'Sikkim' },
  { id: 'hosp-haflong', name: 'Haflong Civil Hospital Dima Hasao', lat: 25.174, lng: 93.023, beds: 150, state: 'Assam' },
  { id: 'hosp-aizawl', name: 'Aizawl Civil Hospital', lat: 23.731, lng: 92.718, beds: 200, state: 'Mizoram' },
  { id: 'hosp-kohima', name: 'Naga Civil Hospital Kohima', lat: 25.669, lng: 94.108, beds: 180, state: 'Nagaland' },
  { id: 'hosp-shillong', name: 'NEIGRIHMS Emergency Trauma Center', lat: 25.592, lng: 91.938, beds: 400, state: 'Meghalaya' },
];

// Critical infrastructure installations
const CRITICAL_INFRASTRUCTURE = [
  { id: 'infra-sela', name: 'Sela Tunnel Portal (NH-13)', type: 'Transport Tunnel', lat: 27.505, lng: 92.103, status: 'Operational' },
  { id: 'infra-bogibeel', name: 'Bogibeel Rail-Road Strategic Bridge', type: 'Rail/Road Bridge', lat: 27.401, lng: 94.921, status: 'Active' },
  { id: 'infra-kopili', name: 'Kopili Hydroelectric Reservoir Dam', type: 'Hydro Power Dam', lat: 25.531, lng: 92.781, status: 'Surveillance Alert' },
  { id: 'infra-tupul', name: 'Jiribam-Imphal Rail Tunnel 12 Portal', type: 'Railway Tunnel', lat: 24.783, lng: 93.672, status: 'Stabilized Catchment' },
  { id: 'infra-chungthang', name: 'Chungthang Stage III Surge Shaft', type: 'Hydroelectric Shaft', lat: 27.604, lng: 88.647, status: 'Reconstruction Sector' },
];

// Flood inundation polygons for major river plains
const FLOOD_INUNDATION_POLYGONS = [
  {
    name: 'Dima Hasao Valley Overflow Zone',
    risk: 'High',
    coords: [
      [25.22, 93.00],
      [25.26, 93.12],
      [25.18, 93.19],
      [25.12, 93.08]
    ] as [number, number][],
    waterLevel: '1.8m inundation'
  },
  {
    name: 'Majuli Island Riverine Flood Plain',
    risk: 'Moderate',
    coords: [
      [27.02, 94.15],
      [27.12, 94.35],
      [26.95, 94.42],
      [26.88, 94.22]
    ] as [number, number][],
    waterLevel: '0.9m inundation'
  },
  {
    name: 'Teesta Lowland Buffer Plain',
    risk: 'High',
    coords: [
      [26.92, 88.58],
      [27.04, 88.66],
      [26.96, 88.75],
      [26.84, 88.67]
    ] as [number, number][],
    waterLevel: '1.4m surge wave'
  }
];

export type BaseMapType = 'osm' | 'satellite' | 'topo' | 'dark';

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
  const layerDropdownRef = useRef<HTMLDivElement | null>(null);
  const layerBtnRef = useRef<HTMLButtonElement | null>(null);

  // Layer groups
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const circlesGroupRef = useRef<L.LayerGroup | null>(null);
  const escapeGroupRef = useRef<L.LayerGroup | null>(null);
  const evidenceGroupRef = useRef<L.LayerGroup | null>(null);
  const highwayGroupRef = useRef<L.LayerGroup | null>(null);
  const villageGroupRef = useRef<L.LayerGroup | null>(null);
  const riversGroupRef = useRef<L.LayerGroup | null>(null);
  const hospitalsGroupRef = useRef<L.LayerGroup | null>(null);
  const infraGroupRef = useRef<L.LayerGroup | null>(null);
  const floodGroupRef = useRef<L.LayerGroup | null>(null);
  const safeRoutesGroupRef = useRef<L.LayerGroup | null>(null);
  const communityHubsGroupRef = useRef<L.LayerGroup | null>(null);
  const riskZonesGroupRef = useRef<L.LayerGroup | null>(null);
  const rainfallRadarGroupRef = useRef<L.LayerGroup | null>(null);
  const tempContourGroupRef = useRef<L.LayerGroup | null>(null);
  const windStreamlinesGroupRef = useRef<L.LayerGroup | null>(null);
  const drainageFlowGroupRef = useRef<L.LayerGroup | null>(null);
  const buildingsGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);

  // BASE MAP STATE
  const [baseMap, setBaseMap] = useState<BaseMapType>('satellite');

  // HAZARD / ENVIRONMENTAL LAYERS STATE
  const [layerLandslide, setLayerLandslide] = useState<boolean>(true);
  const [layerRiskZones, setLayerRiskZones] = useState<boolean>(true);
  const [riskZoneFilter, setRiskZoneFilter] = useState<'all' | 'extreme' | 'high' | 'moderate' | 'low'>('all');
  const [layerFlood, setLayerFlood] = useState<boolean>(false);
  const [layerRainfall, setLayerRainfall] = useState<boolean>(false);
  const [layerTemperature, setLayerTemperature] = useState<boolean>(false);
  const [layerWind, setLayerWind] = useState<boolean>(false);
  const [layerSoilMoisture, setLayerSoilMoisture] = useState<boolean>(false);
  const [layerDrainage, setLayerDrainage] = useState<boolean>(false);

  // INFRASTRUCTURE / GEOSPATIAL LAYERS STATE
  const [layerSafeRoutes, setLayerSafeRoutes] = useState<boolean>(true);
  const [layerCommunityHubs, setLayerCommunityHubs] = useState<boolean>(true);
  const [layerRoads, setLayerRoads] = useState<boolean>(true);
  const [layerRivers, setLayerRivers] = useState<boolean>(true);
  const [layerBuildings, setLayerBuildings] = useState<boolean>(false);
  const [layerShelters, setLayerShelters] = useState<boolean>(true);
  const [layerHospitals, setLayerHospitals] = useState<boolean>(true);
  const [layerCriticalInfra, setLayerCriticalInfra] = useState<boolean>(true);
  const [showEvidencePins, setShowEvidencePins] = useState<boolean>(true);

  // UI Dropdown & Legend State
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState<boolean>(false);
  const [activeLegendHazard, setActiveLegendHazard] = useState<
    'landslide' | 'flood' | 'rainfall' | 'temperature' | 'wind' | 'soil_moisture'
  >('landslide');
  const [isHeatPluginReady, setIsHeatPluginReady] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);

  // Dynamically load leaflet.heat
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).L = L;
      import('leaflet.heat')
        .then(() => {
          setIsHeatPluginReady(true);
        })
        .catch((err) => {
          console.warn('[Leaflet] heat plugin load warning:', err);
        });
    }
  }, []);

  // Close Layer Panel when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLayerPanelOpen &&
        layerDropdownRef.current &&
        !layerDropdownRef.current.contains(event.target as Node) &&
        layerBtnRef.current &&
        !layerBtnRef.current.contains(event.target as Node)
      ) {
        setIsLayerPanelOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isLayerPanelOpen) {
        setIsLayerPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLayerPanelOpen]);

  // Sync active legend to last toggled hazard layer
  useEffect(() => {
    if (layerFlood) {
      setActiveLegendHazard('flood');
    } else if (layerRainfall) {
      setActiveLegendHazard('rainfall');
    } else if (layerTemperature) {
      setActiveLegendHazard('temperature');
    } else if (layerWind) {
      setActiveLegendHazard('wind');
    } else if (layerSoilMoisture) {
      setActiveLegendHazard('soil_moisture');
    } else {
      setActiveLegendHazard('landslide');
    }
  }, [layerFlood, layerRainfall, layerTemperature, layerWind, layerSoilMoisture, layerLandslide]);

  // Initialize Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

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
      const map = L.map(mapContainerRef.current, {
        center: [26.0, 92.6],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
      markersGroupRef.current = L.layerGroup().addTo(map);
      circlesGroupRef.current = L.layerGroup().addTo(map);
      escapeGroupRef.current = L.layerGroup().addTo(map);
      evidenceGroupRef.current = L.layerGroup().addTo(map);
      highwayGroupRef.current = L.layerGroup().addTo(map);
      villageGroupRef.current = L.layerGroup().addTo(map);
      riversGroupRef.current = L.layerGroup().addTo(map);
      hospitalsGroupRef.current = L.layerGroup().addTo(map);
      infraGroupRef.current = L.layerGroup().addTo(map);
      floodGroupRef.current = L.layerGroup().addTo(map);
      riskZonesGroupRef.current = L.layerGroup().addTo(map);
      safeRoutesGroupRef.current = L.layerGroup().addTo(map);
      communityHubsGroupRef.current = L.layerGroup().addTo(map);
      rainfallRadarGroupRef.current = L.layerGroup().addTo(map);
      tempContourGroupRef.current = L.layerGroup().addTo(map);
      windStreamlinesGroupRef.current = L.layerGroup().addTo(map);
      drainageFlowGroupRef.current = L.layerGroup().addTo(map);
      buildingsGroupRef.current = L.layerGroup().addTo(map);

      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);
    } catch (err) {
      console.warn('[Leaflet] Map init catch:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      setIsMapReady(false);
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = '';
    let attribution = '';
    let maxNativeZoom = 18;

    if (baseMap === 'dark') {
      tileUrl = 'https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, HERE &copy; OpenStreetMap';
      maxNativeZoom = 16;
    } else if (baseMap === 'topo') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, USGS, NOAA';
      maxNativeZoom = 18;
    } else if (baseMap === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, Earthstar Geographics';
      maxNativeZoom = 18;
    } else {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
      maxNativeZoom = 19;
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxNativeZoom,
      maxZoom: 19,
      subdomains: 'abc',
    }).addTo(map);
  }, [baseMap]);

  // Filter stations based on search and status
  const normalizedFilter = (filterStatus || 'all').toString().trim().toLowerCase();
  const filteredStations = useMemo(() => {
    return stations.filter((st) => {
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
      } else if (normalizedFilter === 'safe') {
        matchesStatus = stStatus === 'safe';
      } else if (normalizedFilter === 'critical') {
        matchesStatus = stStatus === 'critical';
      } else if (normalizedFilter === 'high') {
        matchesStatus = stStatus === 'high';
      } else if (normalizedFilter === 'moderate') {
        matchesStatus = stStatus === 'moderate';
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
        (st.id || '').toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [stations, normalizedFilter, searchQuery]);

  // 1. RENDER LANDSLIDE RISK MARKERS & HEATMAP
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    if (heatLayerRef.current) {
      try {
        map.removeLayer(heatLayerRef.current);
      } catch {}
      heatLayerRef.current = null;
    }

    if (!layerLandslide) return;

    // Render Station Pins
    filteredStations.forEach((station) => {
      const { status } = station.riskAssessment || { status: 'moderate' };
      const isSelected = selectedStation?.id === station.id;

      let color = '#10b981';
      let badgeLabel = 'SAFE';

      if (status === 'critical') {
        color = '#ef4444';
        badgeLabel = 'CRITICAL';
      } else if (status === 'high') {
        color = '#f97316';
        badgeLabel = 'HIGH';
      } else if (status === 'moderate') {
        color = '#eab308';
        badgeLabel = 'MODERATE';
      }

      const isSafe = status === 'safe';
      const placeName = getCleanPlaceName(station);

      const iconHtml = `
        <div class="custom-place-tag cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-xl transition-all duration-200 ${
            isSelected
              ? 'bg-[#081b36] text-white border-2 border-cyan-400 ring-2 ring-cyan-400/50 scale-105 z-50'
              : isSafe
              ? 'bg-[#06151c]/95 text-slate-100 border border-emerald-500/60 hover:scale-105'
              : status === 'critical'
              ? 'bg-[#20080d]/95 text-white border border-rose-500/80 hover:scale-105'
              : status === 'high'
              ? 'bg-[#1f1005]/95 text-slate-100 border border-orange-500/70 hover:scale-105'
              : 'bg-[#1b1505]/95 text-slate-100 border border-amber-500/60 hover:scale-105'
          }">
            <span class="w-2 h-2 rounded-full shrink-0 ${
              isSafe
                ? 'bg-emerald-400'
                : status === 'critical'
                ? 'bg-rose-500 animate-pulse'
                : status === 'high'
                ? 'bg-orange-500'
                : 'bg-amber-400'
            }"></span>
            <span class="font-bold tracking-tight text-[11px] ${isSelected ? 'text-cyan-300' : 'text-slate-100'}">
              ${placeName}
            </span>
          </div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] ${
            isSelected ? 'border-t-cyan-400' : isSafe ? 'border-t-emerald-500' : status === 'critical' ? 'border-t-rose-500' : status === 'high' ? 'border-t-orange-500' : 'border-t-amber-500'
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
          zIndexOffset: isSelected ? 1000 : status === 'critical' ? 50 : 20,
        });

        const popupHtml = `
          <div class="text-slate-900 font-sans p-2 min-w-[210px]">
            <div class="flex items-center justify-between gap-1.5 pb-1.5 mb-1.5 border-b border-slate-200">
              <span class="font-bold text-xs truncate text-slate-900">${station.name}</span>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full ${
                isSafe ? 'bg-emerald-100 text-emerald-800' : status === 'critical' ? 'bg-rose-100 text-rose-800' : status === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
              }">${badgeLabel}</span>
            </div>
            <div class="text-[11px] text-slate-600 mb-2">${station.region}</div>
            <div class="grid grid-cols-2 gap-1.5 text-[11px] mb-2 bg-slate-100 p-2 rounded-lg">
              <div><span class="text-slate-500">Risk Score:</span> <strong>${station.riskAssessment?.riskScore ?? 50}%</strong></div>
              <div><span class="text-slate-500">Safety (FS):</span> <strong>${station.riskAssessment?.safetyFactor ?? 1.5}</strong></div>
              <div><span class="text-slate-500">Rain 24h:</span> <strong>${station.telemetry?.rainfall24hMm ?? 0} mm</strong></div>
              <div><span class="text-slate-500">Moisture:</span> <strong>${station.telemetry?.soilMoisturePct ?? 50}%</strong></div>
              <div><span class="text-slate-500">Slope:</span> <strong>${station.slopeAngleDeg ?? 35}°</strong></div>
              <div><span class="text-slate-500">Pore Press:</span> <strong>${station.telemetry?.poreWaterPressureKpa ?? 15} kPa</strong></div>
            </div>
            <button id="inspect-btn-${station.id}" class="w-full text-center py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition-colors shadow-sm">
              Focus Sensor Node
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
            btn.onclick = () => {
              onSelectStation(station);
              marker.closePopup();
            };
          }
        });

        markersGroup.addLayer(marker);
      } catch (err) {
        console.warn('[Leaflet] Marker add error:', err);
      }
    });

    // Render Heatmap if plugin is available
    if (isHeatPluginReady && typeof (L as any).heatLayer === 'function') {
      const heatPoints: [number, number, number][] = [];

      filteredStations.forEach((st) => {
        const scoreNorm = (st.riskAssessment?.riskScore ?? 50) / 100;
        const weight = st.riskAssessment?.status === 'critical' ? 1.0 : st.riskAssessment?.status === 'high' ? 0.75 : 0.4;
        heatPoints.push([st.latitude, st.longitude, weight]);

        // Disperse heat points
        const count = st.riskAssessment?.status === 'critical' ? 6 : 3;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const dist = 0.05;
          heatPoints.push([st.latitude + Math.sin(angle) * dist, st.longitude + Math.cos(angle) * dist, weight * 0.65]);
        }
      });

      try {
        const heat = (L as any).heatLayer(heatPoints, {
          radius: 40,
          blur: 24,
          maxZoom: 16,
          max: 1.0,
          minOpacity: 0.35,
          gradient: {
            0.0: '#10b981',
            0.35: '#06b6d4',
            0.6: '#eab308',
            0.8: '#f97316',
            1.0: '#ef4444',
          },
        });
        heat.addTo(map);
        heatLayerRef.current = heat;
      } catch (e) {
        console.warn('[Leaflet] heatLayer failed:', e);
      }
    }
  }, [filteredStations, layerLandslide, selectedStation?.id, isHeatPluginReady]);

  // 2. RENDER FLOOD RISK LAYER
  useEffect(() => {
    const map = mapInstanceRef.current;
    const floodGroup = floodGroupRef.current;
    if (!map || !floodGroup) return;

    floodGroup.clearLayers();
    if (!layerFlood) return;

    FLOOD_INUNDATION_POLYGONS.forEach((poly) => {
      const polygon = L.polygon(poly.coords, {
        color: '#06b6d4',
        fillColor: '#38bdf8',
        fillOpacity: 0.45,
        weight: 2,
        dashArray: '4, 4',
      });

      polygon.bindPopup(`
        <div class="text-slate-900 font-sans p-1.5 min-w-[190px]">
          <div class="font-bold text-xs text-cyan-800 flex items-center gap-1.5 mb-1">
            <span>🌊</span>
            <span>${poly.name}</span>
          </div>
          <div class="text-[11px] text-slate-600 mb-1">Risk Severity: <strong>${poly.risk}</strong></div>
          <div class="p-1 rounded bg-cyan-50 text-[10px] text-cyan-900 font-mono">
            Measured Depth: ${poly.waterLevel}
          </div>
        </div>
      `);

      floodGroup.addLayer(polygon);
    });
  }, [layerFlood]);

  // 3. RENDER RIVERS LAYER
  useEffect(() => {
    const map = mapInstanceRef.current;
    const riversGroup = riversGroupRef.current;
    if (!map || !riversGroup) return;

    riversGroup.clearLayers();
    if (!layerRivers) return;

    RIVER_SYSTEMS.forEach((river) => {
      const polyline = L.polyline(river.coordinates, {
        color: '#0284c7',
        weight: 3.5,
        opacity: 0.85,
      });

      polyline.bindPopup(`
        <div class="text-slate-900 font-sans p-1.5 min-w-[200px]">
          <div class="font-bold text-xs text-sky-800 flex items-center gap-1.5 mb-1">
            <span>💧</span>
            <span>${river.name}</span>
          </div>
          <div class="text-[11px] text-slate-600">${river.state}</div>
          <div class="text-[10px] text-slate-700 mt-1">Water Telemetry: <strong>${river.waterLevel}</strong></div>
        </div>
      `);

      riversGroup.addLayer(polyline);
    });
  }, [layerRivers]);

  // 4. RENDER ROADS / HIGHWAY RISK SEGMENTS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const highwayGroup = highwayGroupRef.current;
    if (!map || !highwayGroup) return;

    highwayGroup.clearLayers();
    if (!layerRoads) return;

    HIGHWAY_RISK_SEGMENTS.forEach((segment) => {
      const isCritical = segment.overallRisk === 'emergency' || segment.riskScorePct > 70;
      const isModerate = segment.overallRisk === 'warning' || segment.riskScorePct > 40;
      const lineColor = isCritical ? '#ef4444' : isModerate ? '#f59e0b' : '#10b981';

      const polyline = L.polyline(segment.coordinates, {
        color: lineColor,
        weight: isCritical ? 4.5 : 3.5,
        opacity: 0.85,
        dashArray: isCritical ? '6, 6' : undefined,
      });

      polyline.bindPopup(`
        <div class="text-slate-900 font-sans p-2 min-w-[220px]">
          <div class="flex items-center justify-between pb-1 mb-1 border-b border-slate-200">
            <span class="font-bold text-xs text-slate-900">🛣️ ${segment.highwayCode}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isCritical ? 'bg-rose-100 text-rose-800' : isModerate ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }">${isCritical ? 'CRITICAL RISK' : segment.overallRisk.toUpperCase()}</span>
          </div>
          <div class="text-[11px] text-slate-600 mb-1">${segment.segmentName} (${segment.state})</div>
          <div class="text-[10px] text-slate-500 mb-1">Blockage Risk: <strong>${segment.riskScorePct}%</strong></div>
          <div class="p-1 rounded bg-slate-100 text-[10px] text-slate-700 font-mono">
            Active Blockades: ${segment.activeBlockades} • Vulnerable Points: ${segment.criticalPoints.length}
          </div>
        </div>
      `);

      highwayGroup.addLayer(polyline);
    });
  }, [layerRoads]);

  // 5. RENDER HOSPITALS LAYER
  useEffect(() => {
    const map = mapInstanceRef.current;
    const hospitalsGroup = hospitalsGroupRef.current;
    if (!map || !hospitalsGroup) return;

    hospitalsGroup.clearLayers();
    if (!layerHospitals) return;

    DISTRICT_HOSPITALS.forEach((hosp) => {
      const iconHtml = `
        <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="w-6 h-6 rounded-full bg-rose-600 border border-white text-white flex items-center justify-center shadow-lg font-bold text-xs">
            +
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-hospital-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: customIcon });
      marker.bindPopup(`
        <div class="text-slate-900 font-sans p-1.5 min-w-[190px]">
          <div class="font-bold text-xs text-rose-700 flex items-center gap-1.5 mb-1">
            <span>🏥</span>
            <span>${hosp.name}</span>
          </div>
          <div class="text-[11px] text-slate-600">${hosp.state} • Trauma & Emergency Care</div>
          <div class="text-[10px] text-slate-500 mt-1">Designated Emergency Beds: <strong>${hosp.beds}</strong></div>
        </div>
      `);

      hospitalsGroup.addLayer(marker);
    });
  }, [layerHospitals]);

  // 6. RENDER CRITICAL INFRASTRUCTURE LAYER
  useEffect(() => {
    const map = mapInstanceRef.current;
    const infraGroup = infraGroupRef.current;
    if (!map || !infraGroup) return;

    infraGroup.clearLayers();
    if (!layerCriticalInfra) return;

    CRITICAL_INFRASTRUCTURE.forEach((infra) => {
      const iconHtml = `
        <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="w-6 h-6 rounded-full bg-indigo-600 border border-white text-white flex items-center justify-center shadow-lg font-bold text-xs">
            ⚡
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-infra-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([infra.lat, infra.lng], { icon: customIcon });
      marker.bindPopup(`
        <div class="text-slate-900 font-sans p-1.5 min-w-[200px]">
          <div class="font-bold text-xs text-indigo-800 flex items-center gap-1.5 mb-1">
            <span>🏗️</span>
            <span>${infra.name}</span>
          </div>
          <div class="text-[11px] text-slate-600">Type: <strong>${infra.type}</strong></div>
          <div class="text-[10px] text-emerald-700 font-bold mt-1">Status: ${infra.status}</div>
        </div>
      `);

      infraGroup.addLayer(marker);
    });
  }, [layerCriticalInfra]);

  // 7. RENDER EMERGENCY SHELTERS & REMOTE VILLAGES
  useEffect(() => {
    const map = mapInstanceRef.current;
    const villageGroup = villageGroupRef.current;
    if (!map || !villageGroup) return;

    villageGroup.clearLayers();
    if (!layerShelters) return;

    REMOTE_VILLAGE_PINS.forEach((vil) => {
      const iconHtml = `
        <div class="cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#04201e]/95 text-teal-200 border border-teal-400 shadow-md">
            <span>🛡️</span>
            <span>${vil.villageName}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-shelter-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([vil.latitude, vil.longitude], { icon: customIcon });
      marker.bindPopup(`
        <div class="text-slate-900 font-sans p-2 min-w-[210px]">
          <div class="font-bold text-xs text-teal-900 mb-1">🏡 ${vil.villageName}</div>
          <div class="text-[11px] text-slate-600 mb-1">${vil.district}, ${vil.state} • Elev: ${vil.elevationM}m</div>
          <div class="p-1.5 rounded bg-emerald-50 text-[11px] text-emerald-900 mb-1">
            <strong>Safe Shelter Haven:</strong> ${vil.safeShelterHaven}
          </div>
          <div class="text-[10px] text-slate-500">Population at Risk: <strong>${vil.populationAtRisk}</strong></div>
        </div>
      `);

      villageGroup.addLayer(marker);
    });
  }, [layerShelters]);

  // 8. RENDER PHOTO EVIDENCE PINS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const evidenceGroup = evidenceGroupRef.current;
    if (!map || !evidenceGroup) return;

    evidenceGroup.clearLayers();
    if (!showEvidencePins || !evidenceList || evidenceList.length === 0) return;

    evidenceList.forEach((ev) => {
      if (typeof ev.latitude !== 'number' || typeof ev.longitude !== 'number') return;

      const iconHtml = `
        <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
          <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 border border-white text-white flex items-center justify-center shadow-lg text-[10px] font-bold">
            📷
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-evidence-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([ev.latitude, ev.longitude], { icon: customIcon });
      marker.bindPopup(`
        <div class="text-slate-900 font-sans p-2 min-w-[220px]">
          <div class="font-bold text-xs text-rose-800 mb-1">📷 Disaster Evidence #${ev.id}</div>
          <div class="text-[11px] text-slate-600 mb-1">${ev.stationName || 'Field Observation'}</div>
          <div class="text-[11px] text-slate-700 italic mb-2">"${ev.description || 'Observed ground rupture'}"</div>
          ${
            ev.photoUrl
              ? `<img src="${ev.photoUrl}" class="w-full h-24 object-cover rounded-lg border border-slate-200 mb-1" />`
              : ''
          }
        </div>
      `);

      evidenceGroup.addLayer(marker);
    });
  }, [showEvidencePins, evidenceList]);

  // 9. RENDER MULTI-TIER GEOSPATIAL RISK ZONES (EXTREME, HIGH, MODERATE, LOW)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const riskZonesGroup = riskZonesGroupRef.current;
    if (!map || !riskZonesGroup) return;

    riskZonesGroup.clearLayers();
    if (!layerRiskZones) return;

    const filteredZones = GEOSPATIAL_RISK_ZONES.filter((zone) => {
      if (riskZoneFilter === 'all') return true;
      return zone.category === riskZoneFilter;
    });

    filteredZones.forEach((zone) => {
      const isExtreme = zone.category === 'extreme';
      const isHigh = zone.category === 'high';
      const isModerate = zone.category === 'moderate';

      const color = isExtreme
        ? '#ef4444' // vivid red
        : isHigh
        ? '#f97316' // vivid orange
        : isModerate
        ? '#eab308' // golden amber
        : '#10b981'; // emerald green

      const polygon = L.polygon(zone.coordinates, {
        color,
        fillColor: color,
        fillOpacity: isExtreme ? 0.42 : isHigh ? 0.35 : isModerate ? 0.28 : 0.22,
        weight: isExtreme ? 3.5 : 2.5,
        dashArray: isExtreme ? '6, 4' : undefined,
      });

      const badgeClass = isExtreme
        ? 'bg-rose-950 text-rose-300 border-rose-500/50'
        : isHigh
        ? 'bg-orange-950 text-orange-300 border-orange-500/50'
        : isModerate
        ? 'bg-amber-950 text-amber-300 border-amber-500/50'
        : 'bg-emerald-950 text-emerald-300 border-emerald-500/50';

      const popupHtml = `
        <div class="text-white font-sans p-3 min-w-[250px] max-w-[290px] overflow-hidden">
          <div class="flex items-center justify-between gap-1 pb-1.5 mb-2 border-b border-white/10 min-w-0">
            <span class="font-black text-xs text-white truncate">${zone.name}</span>
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded border ${badgeClass} shrink-0 uppercase">
              ${zone.category}
            </span>
          </div>
          <div class="text-[11px] text-slate-300 mb-2 truncate">${zone.district}, ${zone.state}</div>

          <div class="grid grid-cols-2 gap-1.5 text-[10px] mb-2.5 bg-white/5 p-2 rounded-xl border border-white/10">
            <div><span class="text-slate-400">Safety Factor:</span> <strong class="${isExtreme ? 'text-rose-400 font-mono' : 'text-emerald-300 font-mono'}">FS ${zone.safetyFactor}</strong></div>
            <div><span class="text-slate-400">Instability:</span> <strong class="${isExtreme ? 'text-rose-400' : 'text-amber-300'}">${zone.instabilityScorePct}%</strong></div>
            <div><span class="text-slate-400">Slope Incline:</span> <strong class="text-white">${zone.slopeAngleDeg}°</strong></div>
            <div><span class="text-slate-400">At-Risk Pop:</span> <strong class="text-white">${zone.populationAtRisk.toLocaleString()}</strong></div>
          </div>

          <div class="text-[10px] text-slate-200 mb-2 leading-relaxed">
            <strong class="text-white">Primary Hazard:</strong> ${zone.primaryHazard}
          </div>

          <div class="p-2 rounded-xl text-[10px] leading-snug mb-2.5 border ${
            isExtreme
              ? 'bg-rose-950/70 text-rose-200 border-rose-500/50 font-medium'
              : isHigh
              ? 'bg-orange-950/70 text-orange-200 border-orange-500/50'
              : isModerate
              ? 'bg-amber-950/70 text-amber-200 border-amber-500/50'
              : 'bg-emerald-950/70 text-emerald-200 border-emerald-500/50'
          }">
            ⚠️ ${zone.activeAdvisory}
          </div>

          <button id="focus-zone-route-${zone.id}" class="w-full text-center py-1.5 text-[11px] font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer transition-colors shadow-md">
            🛡️ Focus Evacuation Route
          </button>
        </div>
      `;

      polygon.bindPopup(popupHtml);
      polygon.on('popupopen', () => {
        const btn = document.getElementById(`focus-zone-route-${zone.id}`);
        if (btn) {
          btn.onclick = () => {
            setLayerSafeRoutes(true);
            polygon.closePopup();
            const route = SAFE_EVACUATION_ROUTES.find((r) => r.id === zone.recommendedSafeRouteId);
            if (route && route.coordinates[0]) {
              map.flyTo(route.coordinates[0], 11, { duration: 1.2 });
            }
          };
        }
      });
      riskZonesGroup.addLayer(polygon);

      // CENTER BEACON BADGE MARKER (Visible at all zoom levels!)
      const lats = zone.coordinates.map((c) => c[0]);
      const lngs = zone.coordinates.map((c) => c[1]);
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      const zoneIcon = L.divIcon({
        html: `
          <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
              isExtreme
                ? 'bg-rose-950/95 text-rose-200 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                : isHigh
                ? 'bg-orange-950/95 text-orange-200 border-2 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]'
                : isModerate
                ? 'bg-amber-950/95 text-amber-200 border-2 border-amber-500 shadow-md'
                : 'bg-emerald-950/95 text-emerald-200 border-2 border-emerald-500 shadow-md'
            } shadow-2xl hover:scale-110 transition-transform whitespace-nowrap">
              <span class="w-2 h-2 rounded-full ${isExtreme ? 'bg-rose-500 animate-ping' : isHigh ? 'bg-orange-400 animate-pulse' : isModerate ? 'bg-amber-400' : 'bg-emerald-400'} shrink-0"></span>
              <span>${isExtreme ? '🚨 EXTREME' : isHigh ? '⚠️ HIGH' : isModerate ? '⚡ MOD' : '🟢 LOW'}: ${zone.name.split(' ')[0]}</span>
              <span class="text-[9px] font-mono px-1 rounded bg-black/50">FS ${zone.safetyFactor}</span>
            </div>
          </div>
        `,
        className: 'custom-risk-zone-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const centerMarker = L.marker([centerLat, centerLng], { icon: zoneIcon, zIndexOffset: isExtreme ? 400 : 250 });
      centerMarker.bindPopup(popupHtml);
      centerMarker.on('popupopen', () => {
        const btn = document.getElementById(`focus-zone-route-${zone.id}`);
        if (btn) {
          btn.onclick = () => {
            setLayerSafeRoutes(true);
            centerMarker.closePopup();
            const route = SAFE_EVACUATION_ROUTES.find((r) => r.id === zone.recommendedSafeRouteId);
            if (route && route.coordinates[0]) {
              map.flyTo(route.coordinates[0], 11, { duration: 1.2 });
            }
          };
        }
      });
      riskZonesGroup.addLayer(centerMarker);
    });
  }, [layerRiskZones, riskZoneFilter, isMapReady]);

  // 10. RENDER SAFE EVACUATION ROUTES & HIGH-RIDGE BYPASSES
  useEffect(() => {
    const map = mapInstanceRef.current;
    const safeRoutesGroup = safeRoutesGroupRef.current;
    if (!map || !safeRoutesGroup) return;

    safeRoutesGroup.clearLayers();
    if (!layerSafeRoutes) return;

    SAFE_EVACUATION_ROUTES.forEach((route) => {
      // 1. Outer dark emerald shadow border
      const outerLine = L.polyline(route.coordinates, {
        color: '#022c22',
        weight: 8,
        opacity: 0.7,
      });
      safeRoutesGroup.addLayer(outerLine);

      // 2. Main green glowing dashed line
      const mainLine = L.polyline(route.coordinates, {
        color: '#10b981',
        weight: 4.5,
        opacity: 0.95,
        dashArray: '8, 6',
      });

      const popupHtml = `
        <div class="text-white font-sans p-3 min-w-[250px] max-w-[290px] overflow-hidden">
          <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 min-w-0">
            <div class="flex items-center gap-1.5 min-w-0 truncate">
              <span class="text-emerald-400 font-black">🛡️</span>
              <span class="font-extrabold text-xs text-white truncate">${route.name}</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 shrink-0">
              ${route.safetyStatus}
            </span>
          </div>

          <div class="text-[11px] text-slate-300 mb-2 truncate">${route.state} • ${route.corridorCode}</div>

          <div class="grid grid-cols-2 gap-1.5 text-[10px] mb-2.5 bg-white/5 p-2 rounded-xl border border-white/10">
            <div><span class="text-slate-400">Distance:</span> <strong class="text-emerald-300 font-mono">${route.distanceKm} km</strong></div>
            <div><span class="text-slate-400">Transit:</span> <strong class="text-emerald-300 font-mono">~${route.estEvacTimeMinutes} mins</strong></div>
            <div><span class="text-slate-400">Capacity:</span> <strong class="text-white">${route.capacityVehiclesPerHour} veh/h</strong></div>
            <div><span class="text-slate-400">Profile:</span> <strong class="text-teal-300">Crest Ridge</strong></div>
          </div>

          <div class="text-[10px] text-slate-300 mb-1.5">
            <span class="font-bold text-white">Engineering:</span> ${route.surfaceType}
          </div>

          <div class="p-2 rounded-xl bg-white/5 text-[10px] text-slate-300 leading-snug mb-2.5 italic border border-white/10">
            "${route.description}"
          </div>

          ${
            onOpenEscapeModal
              ? `<button id="btn-full-evac-plan" class="w-full text-center py-1.5 text-[11px] font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer transition-colors shadow-md">
                  Open Command Evacuation Dispatch
                </button>`
              : ''
          }
        </div>
      `;

      mainLine.bindPopup(popupHtml);
      mainLine.on('popupopen', () => {
        const btn = document.getElementById('btn-full-evac-plan');
        if (btn && onOpenEscapeModal) {
          btn.onclick = () => {
            mainLine.closePopup();
            onOpenEscapeModal();
          };
        }
      });
      safeRoutesGroup.addLayer(mainLine);

      // Starting Checkpoint Marker
      const startCoord = route.coordinates[0];
      if (startCoord) {
        const checkIcon = L.divIcon({
          html: `
            <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
              <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-950/95 text-emerald-300 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] whitespace-nowrap hover:scale-105 transition-transform">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>🛡️ ${route.corridorCode} START</span>
              </div>
            </div>
          `,
          className: 'custom-safe-route-marker',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        const startMarker = L.marker(startCoord, { icon: checkIcon, zIndexOffset: 350 });
        startMarker.bindPopup(popupHtml);
        safeRoutesGroup.addLayer(startMarker);
      }

      // Midpoint Corridor Pill Marker
      if (route.coordinates.length > 2) {
        const midIdx = Math.floor(route.coordinates.length / 2);
        const midCoord = route.coordinates[midIdx];
        if (midCoord) {
          const midIcon = L.divIcon({
            html: `
              <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
                <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-slate-950/90 text-teal-300 border border-teal-400 shadow-md whitespace-nowrap hover:scale-105 transition-transform">
                  <span>🛣️ ${route.name.split('–')[0].trim()} • ${route.distanceKm}km</span>
                </div>
              </div>
            `,
            className: 'custom-safe-route-marker',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          const midMarker = L.marker(midCoord, { icon: midIcon, zIndexOffset: 320 });
          midMarker.bindPopup(popupHtml);
          safeRoutesGroup.addLayer(midMarker);
        }
      }
    });
  }, [layerSafeRoutes, onOpenEscapeModal, isMapReady]);

  // 11. RENDER COMMUNITY HUBS & SAFE ASSEMBLY PERIMETERS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const hubsGroup = communityHubsGroupRef.current;
    if (!map || !hubsGroup) return;

    hubsGroup.clearLayers();
    if (!layerCommunityHubs) return;

    COMMUNITY_HUBS.forEach((hub) => {
      // 1. Safe Perimeter Assembly Polygon
      if (hub.safeAreaCoords && hub.safeAreaCoords.length > 2) {
        const safePolygon = L.polygon(hub.safeAreaCoords, {
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.28,
          weight: 2.5,
          dashArray: '5, 4',
        });
        safePolygon.bindTooltip(`Safe Muster Perimeter • ${hub.name}`, {
          sticky: true,
          className: 'text-xs font-mono font-bold bg-slate-900 text-emerald-300 border border-emerald-500 p-1 rounded',
        });
        hubsGroup.addLayer(safePolygon);
      }

      // 2. Hub Beacon Marker
      const iconHtml = `
        <div class="cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-slate-950/95 text-teal-200 border-2 border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.6)] hover:scale-110 transition-transform whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0"></span>
            <span>🏛️</span>
            <span>${hub.name.split(' ')[0]} Haven</span>
            <span class="text-[9px] font-mono px-1 rounded bg-teal-950 text-teal-300 border border-teal-500/40">Cap ${hub.safeCapacityPeople.toLocaleString()}</span>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-teal-400 mx-auto -mt-[0.5px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-community-hub-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker(hub.coordinates, {
        icon: customIcon,
        zIndexOffset: 360,
      });

      const popupHtml = `
        <div class="text-white font-sans p-3 min-w-[260px] max-w-[300px] overflow-hidden">
          <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-white/10 min-w-0">
            <div class="flex items-center gap-1.5 truncate">
              <span class="text-teal-400 font-black text-sm">🏛️</span>
              <span class="font-extrabold text-xs text-white truncate">${hub.name}</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/50 shrink-0">
              ${hub.status}
            </span>
          </div>

          <div class="text-[11px] text-slate-300 mb-2 truncate">${hub.district}, ${hub.state} • Elev: ${hub.elevationM}m</div>

          <div class="grid grid-cols-2 gap-1.5 text-[10px] mb-2.5 bg-white/5 p-2 rounded-xl border border-white/10">
            <div><span class="text-slate-400">Designated Cap:</span> <strong class="text-emerald-300">${hub.safeCapacityPeople.toLocaleString()}</strong></div>
            <div><span class="text-slate-400">Occupancy:</span> <strong class="text-white">${hub.currentOccupancy}</strong></div>
            <div><span class="text-slate-400">Ration Stock:</span> <strong class="text-teal-300">${hub.supplies.foodRationDays} Days</strong></div>
            <div><span class="text-slate-400">Safe Radius:</span> <strong class="text-white">${hub.safeAreaRadiusMeters}m</strong></div>
          </div>

          <div class="space-y-1 text-[10px] text-slate-300 mb-2.5 bg-slate-950/60 p-2 rounded-xl border border-white/10">
            <div class="truncate">💧 <strong class="text-white">Water:</strong> ${hub.supplies.waterSource}</div>
            <div class="truncate">🏥 <strong class="text-white">Medical:</strong> ${hub.supplies.medicalAid}</div>
            <div class="truncate">⚡ <strong class="text-white">Power:</strong> ${hub.supplies.powerBackup}</div>
            <div class="truncate">📡 <strong class="text-white">Comms:</strong> ${hub.supplies.comms}</div>
          </div>

          <button id="hub-zoom-btn-${hub.id}" class="w-full text-center py-1.5 text-[11px] font-bold rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white cursor-pointer transition-colors shadow-md">
            Zoom to Safe Muster Perimeter
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`hub-zoom-btn-${hub.id}`);
        if (btn) {
          btn.onclick = () => {
            marker.closePopup();
            map.flyTo(hub.coordinates, 13, { duration: 1.2 });
          };
        }
      });

      hubsGroup.addLayer(marker);
    });
  }, [layerCommunityHubs, isMapReady]);

  // 11. RENDER RAINFALL DOPPLER RADAR CELLS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = rainfallRadarGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!layerRainfall) return;

    const radarCells = [
      { lat: 27.586, lon: 91.865, radius: 22000, dbz: 54, name: 'Tawang-Sela Doppler Cell', intensity: 'Heavy (35 mm/h)' },
      { lat: 27.338, lon: 88.606, radius: 18000, dbz: 48, name: 'Gangtok Teesta Core', intensity: 'Moderate-Heavy (24 mm/h)' },
      { lat: 25.183, lon: 93.018, radius: 25000, dbz: 56, name: 'Barail-Jatinga Monsoon Chute', intensity: 'Cloudburst Alert (48 mm/h)' },
      { lat: 25.675, lon: 94.108, radius: 20000, dbz: 44, name: 'Kohima-Dzüdza Front', intensity: 'Moderate (18 mm/h)' },
      { lat: 25.297, lon: 91.732, radius: 30000, dbz: 62, name: 'Cherrapunji Orographic Core', intensity: 'Extreme Torrential (70 mm/h)' },
    ];

    radarCells.forEach((cell) => {
      const outerRing = L.circle([cell.lat, cell.lon], {
        radius: cell.radius,
        color: '#06b6d4',
        fillColor: '#06b6d4',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '4, 4',
      });
      const innerCore = L.circle([cell.lat, cell.lon], {
        radius: cell.radius * 0.45,
        color: '#f43f5e',
        fillColor: '#ef4444',
        fillOpacity: 0.4,
        weight: 2,
      });

      const popupHtml = `
        <div class="text-white font-sans p-2.5 min-w-[210px] max-w-[270px]">
          <div class="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
            <span class="font-bold text-xs text-cyan-300">📡 ${cell.name}</span>
            <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">${cell.dbz} dBZ</span>
          </div>
          <div class="text-[11px] text-slate-300">Instant Rate: <strong class="text-white">${cell.intensity}</strong></div>
          <div class="text-[10px] text-slate-400 mt-1">Source: IMD Agartala & Mohanbari Doppler Polarimetric Radar</div>
        </div>
      `;
      outerRing.bindPopup(popupHtml);
      innerCore.bindPopup(popupHtml);

      group.addLayer(outerRing);
      group.addLayer(innerCore);
    });
  }, [layerRainfall]);

  // 12. RENDER SURFACE TEMPERATURE THERMAL CONTOURS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = tempContourGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!layerTemperature) return;

    const thermalZones = [
      { coords: [[27.3, 91.5], [27.9, 91.5], [27.9, 92.4], [27.3, 92.4]] as [number, number][], temp: '4°C – 9°C (Alpine Permafrost)', color: '#38bdf8' },
      { coords: [[26.8, 88.2], [27.6, 88.2], [27.6, 89.0], [26.8, 89.0]] as [number, number][], temp: '11°C – 15°C (Himalayan Ridge)', color: '#2dd4bf' },
      { coords: [[25.8, 91.0], [26.5, 91.0], [26.5, 93.5], [25.8, 93.5]] as [number, number][], temp: '26°C – 31°C (Assam Valley)', color: '#f59e0b' },
      { coords: [[24.5, 92.5], [25.5, 92.5], [25.5, 94.5], [24.5, 94.5]] as [number, number][], temp: '22°C – 25°C (Barail Foothills)', color: '#fb923c' },
    ];

    thermalZones.forEach((zone) => {
      const polygon = L.polygon(zone.coords, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.22,
        weight: 1.5,
        dashArray: '3, 3',
      });
      polygon.bindPopup(`
        <div class="text-white font-sans p-2 min-w-[200px] max-w-[260px]">
          <div class="font-bold text-xs text-amber-300 pb-1 mb-1 border-b border-white/10">🌡️ Thermal Surface Temperature</div>
          <div class="text-[11px] text-slate-200">${zone.temp}</div>
          <div class="text-[10px] text-slate-400 mt-1">Satellite MODIS / INSAT-3DR LST</div>
        </div>
      `);
      group.addLayer(polygon);
    });
  }, [layerTemperature]);

  // 13. RENDER WIND STREAMLINES & VECTORS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = windStreamlinesGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!layerWind) return;

    const windCorridors = [
      { path: [[27.8, 91.6], [27.4, 92.2], [27.0, 92.8]] as [number, number][], speed: '38 km/h NNW', name: 'Sela Pass Chute' },
      { path: [[27.5, 88.4], [27.2, 88.8], [26.9, 89.2]] as [number, number][], speed: '28 km/h NW', name: 'Nathu La Wind Vector' },
      { path: [[25.6, 92.6], [25.3, 93.2], [25.0, 93.8]] as [number, number][], speed: '24 km/h SW', name: 'Jatinga Gap Jet' },
    ];

    windCorridors.forEach((w) => {
      const line = L.polyline(w.path, {
        color: '#2dd4bf',
        weight: 3,
        dashArray: '6, 6',
        opacity: 0.85,
      });
      line.bindPopup(`
        <div class="text-white font-sans p-2 min-w-[190px] max-w-[250px]">
          <div class="font-bold text-xs text-teal-300 pb-1 mb-1 border-b border-white/10">💨 ${w.name}</div>
          <div class="text-[11px] text-slate-200">Wind Velocity: <strong class="text-teal-300">${w.speed}</strong></div>
          <div class="text-[10px] text-slate-400 mt-1">High-Altitude Ridge Anemometer</div>
        </div>
      `);
      group.addLayer(line);
    });
  }, [layerWind]);

  // 14. RENDER DRAINAGE & HYDRAULIC RUNOFF
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = drainageFlowGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!layerDrainage) return;

    const drainagePaths = [
      { path: [[27.6, 92.0], [27.3, 92.1], [27.0, 92.3]] as [number, number][], name: 'Tawang Chu Runoff Axis', discharge: '140 m³/s' },
      { path: [[27.4, 88.5], [27.2, 88.55], [26.9, 88.58]] as [number, number][], name: 'Teesta Gorge Drainage Channel', discharge: '380 m³/s' },
      { path: [[25.3, 93.0], [25.1, 92.95], [24.9, 92.8]] as [number, number][], name: 'Jatinga Sub-Basin Hydraulic Route', discharge: '220 m³/s' },
    ];

    drainagePaths.forEach((d) => {
      const line = L.polyline(d.path, {
        color: '#06b6d4',
        weight: 3.5,
        opacity: 0.9,
      });
      line.bindPopup(`
        <div class="text-white font-sans p-2 min-w-[200px] max-w-[260px]">
          <div class="font-bold text-xs text-cyan-300 pb-1 mb-1 border-b border-white/10">🌊 ${d.name}</div>
          <div class="text-[11px] text-slate-200">Est. Peak Runoff: <strong class="text-white">${d.discharge}</strong></div>
          <div class="text-[10px] text-slate-400 mt-1">Terrain Flow Direction Model</div>
        </div>
      `);
      group.addLayer(line);
    });
  }, [layerDrainage]);

  // 15. RENDER BUILDING FOOTPRINT GIS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = buildingsGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    if (!layerBuildings) return;

    const buildings = [
      { lat: 27.586, lon: 91.865, count: 180, status: 'Vulnerable Toe Slope (Tawang Valley)', color: '#ef4444' },
      { lat: 27.331, lon: 88.614, count: 240, status: 'Sinking Zone Periphery (Gangtok East)', color: '#f97316' },
      { lat: 25.182, lon: 93.024, count: 95, status: 'Debris Flow Runout Strip (Haflong)', color: '#ef4444' },
      { lat: 25.671, lon: 94.108, count: 160, status: 'Steep Escarpment Settlements (Kohima)', color: '#f59e0b' },
    ];

    buildings.forEach((b) => {
      const marker = L.circleMarker([b.lat, b.lon], {
        radius: 8,
        color: b.color,
        fillColor: b.color,
        fillOpacity: 0.75,
        weight: 2,
      });
      marker.bindPopup(`
        <div class="text-white font-sans p-2 min-w-[210px] max-w-[270px]">
          <div class="font-bold text-xs text-slate-100 pb-1 mb-1 border-b border-white/10">🏘️ Settlement GIS Footprint</div>
          <div class="text-[11px] text-slate-300">Habitations: <strong class="text-white">${b.count} dwellings</strong></div>
          <div class="text-[10px] text-amber-300 mt-1">${b.status}</div>
        </div>
      `);
      group.addLayer(marker);
    });
  }, [layerBuildings]);

  // Fly to selected station
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
        mapInstanceRef.current.invalidateSize();
        mapInstanceRef.current.flyTo([selectedStation.latitude, selectedStation.longitude], 10, {
          duration: 1.2,
        });
      } catch (err) {
        console.warn('[Leaflet] flyTo error:', err);
      }
    }
  }, [selectedStation]);

  const fitAllStations = () => {
    const map = mapInstanceRef.current;
    if (!map || stations.length === 0) return;

    const validCoords = stations
      .filter((s) => typeof s.latitude === 'number' && isFinite(s.latitude) && typeof s.longitude === 'number' && isFinite(s.longitude))
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

  return (
    <div
      id="landslide-map-wrapper"
      className="relative isolate z-0 w-full h-full min-h-[380px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-[#080c16]"
    >
      {/* Map Canvas Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP-LEFT CONTROLS: Search Bar & Focus Place & Quick Toggles */}
      <div className="absolute top-3 left-3 z-[1000] pointer-events-none flex flex-col gap-2 max-w-[calc(100%-140px)] sm:max-w-xl">
        {/* Row 1: Search & Place Selector & Fit Bounds */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Search Input */}
          <div className="flex items-center backdrop-blur-xl bg-slate-950/80 border border-white/15 rounded-xl px-2.5 py-1.5 shadow-2xl w-32 sm:w-44 pointer-events-auto">
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

          {/* Compact Select Place */}
          <div className="backdrop-blur-xl bg-slate-950/80 border border-cyan-500/30 rounded-xl px-2.5 py-1 shadow-2xl flex items-center gap-1.5 pointer-events-auto max-w-[140px] sm:max-w-[200px]">
            <span className="text-[9px] font-mono font-black text-cyan-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              PLACE:
            </span>
            <select
              value={selectedStation?.id || ''}
              onChange={(e) => {
                const found = stations.find((s) => s.id === e.target.value);
                if (found) onSelectStation(found);
              }}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer w-full min-w-0 truncate"
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

          {/* Fit / Recenter Button */}
          <button
            type="button"
            onClick={fitAllStations}
            className="p-1.5 backdrop-blur-xl bg-slate-950/80 border border-white/15 hover:border-cyan-400/50 text-slate-300 hover:text-white rounded-xl shadow-2xl pointer-events-auto transition-colors cursor-pointer shrink-0"
            title="Fit All Monitored Northeast Stations"
          >
            <LocateFixed className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>

        {/* Row 2: Prominent Quick Toggle Badges for Safe Routes, Community Hubs & Risk Zones */}
        <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
          {/* Safe Routes Toggle */}
          <button
            type="button"
            onClick={() => setLayerSafeRoutes((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold backdrop-blur-xl transition-all shadow-lg cursor-pointer ${
              layerSafeRoutes
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-400/80 shadow-emerald-950/40'
                : 'bg-slate-950/80 text-slate-400 border border-white/10 hover:text-slate-200'
            }`}
            title="Click to toggle Safe Evacuation Corridors on Map"
          >
            <Route className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Safe Routes ({SAFE_EVACUATION_ROUTES.length})</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${layerSafeRoutes ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          </button>

          {/* Community Hubs Toggle */}
          <button
            type="button"
            onClick={() => setLayerCommunityHubs((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold backdrop-blur-xl transition-all shadow-lg cursor-pointer ${
              layerCommunityHubs
                ? 'bg-teal-950/80 text-teal-300 border border-teal-400/80 shadow-teal-950/40'
                : 'bg-slate-950/80 text-slate-400 border border-white/10 hover:text-slate-200'
            }`}
            title="Click to toggle Community Relief Hubs & Safe Havens on Map"
          >
            <Home className="w-3 h-3 text-teal-400 shrink-0" />
            <span className="whitespace-nowrap">Community Hubs ({COMMUNITY_HUBS.length})</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${layerCommunityHubs ? 'bg-teal-400 animate-pulse' : 'bg-slate-500'}`} />
          </button>

          {/* Risk Zones Toggle & Severity Filter */}
          <div className="flex items-center backdrop-blur-xl bg-slate-950/80 border border-white/15 rounded-xl overflow-hidden shadow-lg">
            <button
              type="button"
              onClick={() => setLayerRiskZones((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-extrabold transition-all cursor-pointer ${
                layerRiskZones ? 'text-amber-300 bg-amber-950/80' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Click to toggle Multi-Tier Risk Zones on Map"
            >
              <AlertOctagon className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">Risk Zones ({GEOSPATIAL_RISK_ZONES.length})</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${layerRiskZones ? 'bg-amber-400' : 'bg-slate-500'}`} />
            </button>
            {layerRiskZones && (
              <select
                value={riskZoneFilter}
                onChange={(e) => setRiskZoneFilter(e.target.value as any)}
                className="bg-slate-950/90 text-[10px] font-black text-slate-200 px-1.5 py-1 border-l border-white/15 focus:outline-none cursor-pointer"
                title="Filter Geospatial Risk Zones by severity"
              >
                <option value="all">All (17)</option>
                <option value="extreme">🔴 Extreme (5)</option>
                <option value="high">🟠 High (4)</option>
                <option value="moderate">🟡 Mod (4)</option>
                <option value="low">🟢 Low (4)</option>
              </select>
            )}
          </div>
        </div>

        {/* Row 3: Direct Quick Jump to Any Geospatial Risk Zone, Safe Route, or Safe Haven */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="backdrop-blur-xl bg-slate-950/85 border border-white/15 hover:border-cyan-400/50 rounded-xl px-2.5 py-1 shadow-2xl flex items-center gap-1.5 w-full max-w-[280px] sm:max-w-xs transition-all">
            <span className="text-[10px] font-mono font-black text-cyan-400 shrink-0">
              🎯 FOCUS:
            </span>
            <select
              defaultValue=""
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const map = mapInstanceRef.current;
                if (!map) return;

                if (val.startsWith('zone:')) {
                  const zoneId = val.replace('zone:', '');
                  const zone = GEOSPATIAL_RISK_ZONES.find((z) => z.id === zoneId);
                  if (zone && zone.coordinates[0]) {
                    setLayerRiskZones(true);
                    const lats = zone.coordinates.map((c) => c[0]);
                    const lngs = zone.coordinates.map((c) => c[1]);
                    const cLat = lats.reduce((a, b) => a + b, 0) / lats.length;
                    const cLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
                    map.flyTo([cLat, cLng], 12, { duration: 1.2 });
                  }
                } else if (val.startsWith('route:')) {
                  const routeId = val.replace('route:', '');
                  const route = SAFE_EVACUATION_ROUTES.find((r) => r.id === routeId);
                  if (route && route.coordinates[0]) {
                    setLayerSafeRoutes(true);
                    map.flyTo(route.coordinates[0], 11, { duration: 1.2 });
                  }
                } else if (val.startsWith('hub:')) {
                  const hubId = val.replace('hub:', '');
                  const hub = COMMUNITY_HUBS.find((h) => h.id === hubId);
                  if (hub) {
                    setLayerCommunityHubs(true);
                    map.flyTo(hub.coordinates, 13, { duration: 1.2 });
                  }
                }
              }}
              className="bg-transparent text-xs text-slate-200 font-bold focus:outline-none cursor-pointer w-full min-w-0 truncate"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                Jump to Risk Zone / Safe Route / Haven...
              </option>
              <optgroup label="🚨 Extreme Risk Zones" className="bg-slate-900 text-rose-300">
                {GEOSPATIAL_RISK_ZONES.filter((z) => z.category === 'extreme').map((z) => (
                  <option key={z.id} value={`zone:${z.id}`} className="bg-slate-900 text-rose-300">
                    🔴 {z.name} ({z.state})
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚠️ High Risk Zones" className="bg-slate-900 text-orange-300">
                {GEOSPATIAL_RISK_ZONES.filter((z) => z.category === 'high').map((z) => (
                  <option key={z.id} value={`zone:${z.id}`} className="bg-slate-900 text-orange-300">
                    🟠 {z.name} ({z.state})
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚡ Moderate & Low Risk Zones" className="bg-slate-900 text-amber-300">
                {GEOSPATIAL_RISK_ZONES.filter((z) => z.category === 'moderate' || z.category === 'low').map((z) => (
                  <option key={z.id} value={`zone:${z.id}`} className="bg-slate-900 text-amber-300">
                    {z.category === 'moderate' ? '🟡' : '🟢'} {z.name} ({z.state})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🛡️ Safe Evacuation Routes" className="bg-slate-900 text-emerald-300">
                {SAFE_EVACUATION_ROUTES.map((r) => (
                  <option key={r.id} value={`route:${r.id}`} className="bg-slate-900 text-emerald-300">
                    🛡️ {r.name} ({r.distanceKm} km)
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏛️ Community Safe Havens" className="bg-slate-900 text-teal-300">
                {COMMUNITY_HUBS.map((h) => (
                  <option key={h.id} value={`hub:${h.id}`} className="bg-slate-900 text-teal-300">
                    🏛️ {h.name} (Cap {h.safeCapacityPeople.toLocaleString()})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT CONTROLS: Map Layers Button & Floating Dropdown */}
      <div className="absolute top-3 right-3 z-[1100] flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          {/* Main "Map Layers" Floating Button */}
          <button
            ref={layerBtnRef}
            id="map-layers-trigger-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLayerPanelOpen(!isLayerPanelOpen);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-xl bg-slate-950/80 border border-white/15 hover:border-cyan-400/60 text-xs font-black text-white shadow-2xl cursor-pointer transition-all active:scale-95"
            title="Open GIS & Hazard Map Layers Selector"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline tracking-wide font-sans">Map Layers</span>
            <span className="sm:hidden font-sans">Layers</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-cyan-300 transition-transform duration-200 ${
                isLayerPanelOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Zoom Buttons Group */}
          <div className="flex items-center backdrop-blur-xl bg-slate-950/80 border border-white/15 rounded-xl overflow-hidden shadow-2xl">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-4 bg-white/15" />
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* FLOATING LAYER-SELECTION PANEL */}
        {isLayerPanelOpen && (
          <div
            ref={layerDropdownRef}
            id="floating-map-layer-panel"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-72 sm:w-80 max-h-[calc(100vh-160px)] sm:max-h-[540px] overflow-y-auto glass-dropdown rounded-2xl p-3 sm:p-4 text-xs space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="font-extrabold text-white uppercase tracking-wider text-[11px] font-sans">
                  Map Layer Selection
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLayerPanelOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CATEGORY 1: BASE MAPS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 font-mono block">
                BASE MAPS
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'satellite', label: 'Satellite', icon: Globe },
                    { id: 'dark', label: 'Dark Canvas', icon: Globe },
                    { id: 'topo', label: 'Terrain Topo', icon: Layers },
                    { id: 'osm', label: 'Standard OSM', icon: Globe },
                  ] as const
                ).map((base) => {
                  const Icon = base.icon;
                  const isActive = baseMap === base.id;
                  return (
                    <button
                      key={base.id}
                      type="button"
                      onClick={() => setBaseMap(base.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md'
                          : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{base.label}</span>
                      </div>
                      {isActive && <Check className="w-3 h-3 text-cyan-300 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY 2: HAZARD / ENVIRONMENTAL LAYERS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 font-mono block">
                HAZARD / ENVIRONMENTAL LAYERS
              </span>
              <div className="space-y-1">
                {/* Landslide Risk */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="font-bold text-white block">Landslide Risk Sensors</span>
                      <span className="text-[9px] text-slate-400">Telemetry &amp; Heatmap</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerLandslide}
                    onChange={(e) => setLayerLandslide(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Geospatial Risk Zones */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-rose-500/40 hover:border-rose-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">Risk Zones</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-500/50">
                          17 ZONES
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-300">Extreme • High • Mod • Low</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRiskZones}
                    onChange={(e) => setLayerRiskZones(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Flood Risk */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-cyan-300" />
                    <span className="font-bold text-white">Flood Risk</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerFlood}
                    onChange={(e) => setLayerFlood(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Rainfall Doppler */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-sky-400" />
                    <div>
                      <span className="font-bold text-white block">Rainfall Doppler Radar</span>
                      <span className="text-[9px] text-slate-400">Live IMD Polarimetric Feed</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRainfall}
                    onChange={(e) => setLayerRainfall(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Temperature */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <div>
                      <span className="font-bold text-white block">Surface Temperature</span>
                      <span className="text-[9px] text-slate-400">Thermal Infrared Isotherms</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerTemperature}
                    onChange={(e) => setLayerTemperature(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Wind */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-teal-300" />
                    <div>
                      <span className="font-bold text-white block">Wind Velocity</span>
                      <span className="text-[9px] text-slate-400">Pass Streamlines &amp; Vectors</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerWind}
                    onChange={(e) => setLayerWind(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Soil Moisture */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white">Soil Moisture (VWC)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerSoilMoisture}
                    onChange={(e) => setLayerSoilMoisture(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Drainage / Water Flow */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-bold text-white block">Drainage Flow</span>
                      <span className="text-[9px] text-slate-400">Valley Hydraulic Runoff</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerDrainage}
                    onChange={(e) => setLayerDrainage(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* CATEGORY 3: INFRASTRUCTURE / GEOSPATIAL */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 font-mono block">
                INFRASTRUCTURE / GEOSPATIAL
              </span>
              <div className="space-y-1">
                {/* Safe Routes & Evacuation Corridors */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-emerald-500/40 hover:border-emerald-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">Safe Evacuation Routes</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                          6 CORRIDORS
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-300">Ridge Bypasses • All-Clear</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerSafeRoutes}
                    onChange={(e) => setLayerSafeRoutes(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Community Hubs & Safe Areas */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-teal-500/40 hover:border-teal-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-teal-300 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">Community Hubs &amp; Havens</span>
                        <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-500/50">
                          8 HAVENS
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-300">Safe Muster Perimeters &amp; Stock</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerCommunityHubs}
                    onChange={(e) => setLayerCommunityHubs(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Roads */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-white">Roads (NH Corridors)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRoads}
                    onChange={(e) => setLayerRoads(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Rivers */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-sky-400" />
                    <span className="font-bold text-white">Rivers (Brahmaputra, Barak)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRivers}
                    onChange={(e) => setLayerRivers(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Buildings */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-300" />
                    <div>
                      <span className="font-bold text-white block">Buildings</span>
                      <span className="text-[9px] text-slate-400">GIS Structural Footprints</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerBuildings}
                    onChange={(e) => setLayerBuildings(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Emergency Shelters */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Emergency Shelters</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerShelters}
                    onChange={(e) => setLayerShelters(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Hospitals */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-rose-400" />
                    <span className="font-bold text-white">Hospitals</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerHospitals}
                    onChange={(e) => setLayerHospitals(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Critical Infrastructure */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-cyan-400/40 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-white">Critical Infrastructure</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerCriticalInfra}
                    onChange={(e) => setLayerCriticalInfra(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING RISK LEGEND ON MAP (BOTTOM-RIGHT) */}
      <div
        id="map-floating-risk-legend"
        className="absolute bottom-3 right-3 z-[1000] backdrop-blur-xl bg-slate-950/85 border border-white/15 rounded-2xl p-3 shadow-2xl text-xs max-w-[280px] sm:max-w-xs pointer-events-auto overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-white/10">
          <span className="font-black text-white text-[11px] uppercase tracking-wider font-mono truncate">
            {activeLegendHazard === 'flood'
              ? 'FLOOD INUNDATION RISK'
              : activeLegendHazard === 'rainfall'
              ? 'RAINFALL DOPPLER SCALE'
              : activeLegendHazard === 'temperature'
              ? 'THERMAL INFRARED SCALE'
              : activeLegendHazard === 'wind'
              ? 'WIND VELOCITY'
              : activeLegendHazard === 'soil_moisture'
              ? 'SOIL MOISTURE (VWC)'
              : 'LANDSLIDE RISK'}
          </span>
          <span className="text-[9px] font-mono text-cyan-400 shrink-0">ACTIVE</span>
        </div>

        {/* Landslide & Geospatial Risk Zones Legend */}
        {activeLegendHazard === 'landslide' && (
          <div className="space-y-1.5 text-[11px]">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-rose-400 font-bold truncate">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <span className="truncate">EXTREME RISK</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">FS &lt; 1.0</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-orange-400 font-bold truncate">
                  <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  <span className="truncate">HIGH RISK</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">FS 1.0 – 1.2</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">MODERATE</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">FS 1.2 – 1.5</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">LOW / SAFE SHIELD</span>
                </span>
                <span className="text-slate-400 font-mono text-[10px] shrink-0">FS &gt; 1.5</span>
              </div>
            </div>

            {/* Geospatial Lifelines */}
            <div className="pt-1.5 border-t border-white/10 space-y-1 text-[10px]">
              <div className="flex items-center justify-between gap-2 text-emerald-300 font-semibold min-w-0">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-3.5 h-0.5 bg-emerald-400 border-t border-dashed border-emerald-200 shrink-0" />
                  <span className="truncate">Safe Evacuation Route</span>
                </span>
                <span className="font-mono text-[9px] text-emerald-400 shrink-0">Ridge Bypass</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-teal-300 font-semibold min-w-0">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-[10px] shrink-0">🏛️</span>
                  <span className="truncate">Community Safe Haven</span>
                </span>
                <span className="font-mono text-[9px] text-teal-400 shrink-0">Muster Hub</span>
              </div>
            </div>
          </div>
        )}

        {/* Flood Legend */}
        {activeLegendHazard === 'flood' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-sky-400 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                <span className="truncate">Low Inundation</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px] shrink-0">&lt; 0.5m</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-cyan-300 shrink-0" />
                <span className="truncate">Moderate</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px] shrink-0">0.5 – 1.5m</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-orange-400 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                <span className="truncate">High</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px] shrink-0">1.5 – 3.0m</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-rose-400 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span className="truncate">Catastrophic</span>
              </span>
              <span className="text-slate-400 font-mono text-[10px] shrink-0">&gt; 3.0m</span>
            </div>
          </div>
        )}

        {/* Rainfall Legend */}
        {activeLegendHazard === 'rainfall' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Light Rain</span>
              <span className="font-mono text-[10px] text-cyan-300 shrink-0">&lt; 2.5 mm/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Moderate</span>
              <span className="font-mono text-[10px] text-cyan-300 shrink-0">2.5 – 10 mm/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Heavy</span>
              <span className="font-mono text-[10px] text-amber-300 shrink-0">10 – 50 mm/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Torrential Core</span>
              <span className="font-mono text-[10px] text-rose-400 shrink-0">&gt; 50 mm/h</span>
            </div>
            <div className="text-[9px] text-cyan-300/90 pt-1 border-t border-white/10 truncate">
              Polarimetric Doppler Radar Active
            </div>
          </div>
        )}

        {/* Temperature Legend */}
        {activeLegendHazard === 'temperature' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Alpine Permafrost</span>
              <span className="font-mono text-[10px] text-sky-400 shrink-0">&lt; 10°C</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Himalayan Ridge</span>
              <span className="font-mono text-[10px] text-teal-300 shrink-0">11°C – 18°C</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Valley Baseline</span>
              <span className="font-mono text-[10px] text-amber-300 shrink-0">&gt; 24°C</span>
            </div>
            <div className="text-[9px] text-amber-300/90 pt-1 border-t border-white/10 truncate">
              Satellite Thermal Infrared Isotherms Active
            </div>
          </div>
        )}

        {/* Wind Legend */}
        {activeLegendHazard === 'wind' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Valley Breezes</span>
              <span className="font-mono text-[10px] text-emerald-400 shrink-0">&lt; 20 km/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Pass Moderate</span>
              <span className="font-mono text-[10px] text-teal-300 shrink-0">20 – 35 km/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">High-Ridge Jet</span>
              <span className="font-mono text-[10px] text-cyan-300 shrink-0">&gt; 35 km/h</span>
            </div>
            <div className="text-[9px] text-teal-300/90 pt-1 border-t border-white/10 truncate">
              Anemometer Vector Streamlines Active
            </div>
          </div>
        )}

        {/* Soil Moisture Legend */}
        {activeLegendHazard === 'soil_moisture' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Dry Slope</span>
              <span className="font-mono text-[10px] text-emerald-400 shrink-0">&lt; 30%</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Moist</span>
              <span className="font-mono text-[10px] text-amber-400 shrink-0">30% – 65%</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-300">
              <span className="truncate">Fully Saturated</span>
              <span className="font-mono text-[10px] text-rose-400 shrink-0">&gt; 75%</span>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING BOTTOM-LEFT TAG */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none flex items-center gap-2 text-[10px] sm:text-[11px] backdrop-blur-xl bg-slate-950/80 px-3 py-1.5 rounded-full border border-white/10 text-slate-300 shadow-xl">
        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="truncate">Esri GIS Imagery • 20 Monitored Stations</span>
      </div>
    </div>
  );
};
