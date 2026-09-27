import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { LandslideStation, RiskStatus, DisasterEvidenceReport } from '../../types/landslide';
import { BhuLanguage } from '../../types/bhuShakti';
import { TRANSLATIONS } from '../../utils/translations';
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
  Plus,
  Minus,
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

// Major Northeast river channel coordinates for verified geospatial visualization (bright cyan/blue #06B6D4)
const RIVER_SYSTEMS = [
  {
    name: 'Brahmaputra River Corridor',
    state: 'Assam / Arunachal',
    weight: 3.5,
    coordinates: [
      [27.95, 95.38],
      [27.48, 94.92],
      [26.91, 93.64],
      [26.65, 92.83],
      [26.19, 91.75],
      [26.12, 90.62],
      [25.98, 89.98],
    ] as [number, number][],
    waterLevel: 'High (0.8m below danger level)',
  },
  {
    name: 'Barak River Basin',
    state: 'Assam / Manipur',
    weight: 3.0,
    coordinates: [
      [25.18, 93.18],
      [24.89, 92.89],
      [24.82, 92.79],
      [24.88, 92.52],
      [24.93, 92.35],
    ] as [number, number][],
    waterLevel: 'Moderate Flow (Normal)',
  },
  {
    name: 'Teesta River Basin',
    state: 'Sikkim / West Bengal',
    weight: 2.5,
    coordinates: [
      [27.92, 88.62],
      [27.65, 88.55],
      [27.32, 88.51],
      [27.05, 88.54],
      [26.85, 88.72],
    ] as [number, number][],
    waterLevel: 'Rapid Glacier Runoff',
  },
  {
    name: 'Haora River (Agartala Corridor)',
    state: 'Tripura (Agartala)',
    weight: 2.4,
    coordinates: [
      [23.89, 91.42],
      [23.86, 91.36],
      [23.84, 91.31],
      [23.8315, 91.2868], // Directly bisecting Agartala city
      [23.822, 91.25],
      [23.815, 91.21],
    ] as [number, number][],
    waterLevel: 'Monitored (Station Gauge 1.4m)',
  },
  {
    name: 'Gomati River Basin',
    state: 'Tripura (Udaipur / Sonamura)',
    weight: 2.8,
    coordinates: [
      [23.55, 91.82],
      [23.53, 91.68],
      [23.52, 91.50],
      [23.48, 91.35],
      [23.46, 91.22],
    ] as [number, number][],
    waterLevel: 'Regulated Flow (Dumbur Dam)',
  },
  {
    name: 'Manu River Channel',
    state: 'Tripura (Kailashahar)',
    weight: 2.0,
    coordinates: [
      [24.32, 92.05],
      [24.18, 92.02],
      [23.98, 91.99],
      [23.75, 91.95],
    ] as [number, number][],
    waterLevel: 'Catchment Runoff Stable',
  },
  {
    name: 'Khowai River Channel',
    state: 'Tripura (Khowai)',
    weight: 1.8,
    coordinates: [
      [24.28, 91.65],
      [24.08, 91.62],
      [23.88, 91.58],
      [23.65, 91.55],
    ] as [number, number][],
    waterLevel: 'Active Riverbed Gauged',
  },
  {
    name: 'Tlawng River Channel',
    state: 'Mizoram (Aizawl)',
    weight: 2.0,
    coordinates: [
      [23.95, 92.68],
      [23.78, 92.70],
      [23.55, 92.72],
      [23.32, 92.75],
    ] as [number, number][],
    waterLevel: 'High Slope Valley Runoff',
  },
  {
    name: 'Kopili River Corridor',
    state: 'Assam / Meghalaya',
    weight: 2.2,
    coordinates: [
      [26.15, 92.85],
      [25.85, 92.80],
      [25.53, 92.78],
    ] as [number, number][],
    waterLevel: 'Hydro Surveillance Active',
  },
];

// State & district boundary corridors (Purple / Violet #A855F7, 1-2px, semi-transparent)
const STATE_DISTRICT_BOUNDARIES = [
  {
    name: 'Tripura State Boundary',
    coordinates: [
      [24.53, 92.17],
      [24.52, 92.25],
      [24.31, 92.28],
      [24.16, 92.34],
      [23.95, 92.29],
      [23.75, 92.18],
      [23.51, 91.95],
      [23.32, 91.75],
      [23.00, 91.68],
      [23.05, 91.45],
      [23.23, 91.31],
      [23.58, 91.24],
      [23.83, 91.26], // West of Agartala
      [24.08, 91.35],
      [24.28, 91.62],
      [24.45, 91.89],
      [24.53, 92.17],
    ] as [number, number][],
  },
  {
    name: 'Mizoram State Boundary',
    coordinates: [
      [24.52, 92.98],
      [24.25, 93.15],
      [23.85, 93.28],
      [23.40, 93.38],
      [22.85, 93.12],
      [22.35, 93.00],
      [21.95, 92.85],
      [22.25, 92.65],
      [22.75, 92.48],
      [23.25, 92.35],
      [23.75, 92.20],
      [24.15, 92.35],
      [24.45, 92.65],
      [24.52, 92.98],
    ] as [number, number][],
  },
  {
    name: 'Meghalaya State Boundary',
    coordinates: [
      [26.05, 90.15],
      [25.95, 90.65],
      [25.88, 91.25],
      [25.85, 91.85],
      [25.65, 92.55],
      [25.35, 92.75],
      [25.15, 92.45],
      [25.18, 91.75],
      [25.19, 91.25],
      [25.22, 90.45],
      [25.35, 89.85],
      [25.75, 89.92],
      [26.05, 90.15],
    ] as [number, number][],
  },
  {
    name: 'Barak Valley Boundary (Assam)',
    coordinates: [
      [25.18, 92.45],
      [24.85, 92.40],
      [24.55, 92.35],
      [24.28, 92.75],
      [24.45, 93.15],
      [24.85, 93.25],
      [25.18, 93.15],
      [25.35, 92.75],
    ] as [number, number][],
  },
  {
    name: 'Manipur State Boundary',
    coordinates: [
      [25.68, 94.25],
      [25.45, 94.65],
      [24.95, 94.45],
      [24.25, 94.25],
      [23.85, 93.30],
      [24.35, 93.15],
      [24.95, 93.25],
      [25.45, 93.65],
      [25.68, 94.25],
    ] as [number, number][],
  },
  {
    name: 'Sikkim State Boundary',
    coordinates: [
      [28.12, 88.55],
      [27.85, 88.85],
      [27.35, 88.75],
      [27.08, 88.55],
      [27.15, 88.10],
      [27.65, 88.05],
      [28.05, 88.25],
      [28.12, 88.55],
    ] as [number, number][],
  },
  {
    name: 'India - Bangladesh International Border',
    coordinates: [
      [26.15, 89.85],
      [25.75, 89.92],
      [25.35, 89.85],
      [25.19, 90.45],
      [25.18, 91.25],
      [25.15, 92.45],
      [24.85, 92.40],
      [24.53, 92.17],
      [24.45, 91.89],
      [24.08, 91.35],
      [23.83, 91.26],
      [23.23, 91.31],
      [23.00, 91.68],
      [22.85, 91.85],
    ] as [number, number][],
  },
];

// Broad territory labels (rendered only at overview zoom with purple boundary layer)
const REGIONAL_MAP_LABELS = [
  { name: 'TRIPURA', lat: 23.75, lng: 91.65, type: 'state' },
  { name: 'MIZORAM', lat: 23.10, lng: 92.95, type: 'state' },
  { name: 'MEGHALAYA', lat: 25.45, lng: 91.35, type: 'state' },
  { name: 'ASSAM', lat: 26.30, lng: 92.90, type: 'state' },
  { name: 'NAGALAND', lat: 26.15, lng: 94.45, type: 'state' },
  { name: 'MANIPUR', lat: 24.60, lng: 93.90, type: 'state' },
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
  currentLanguage?: BhuLanguage;
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
  currentLanguage = 'en',
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
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
  const riskBuffersGroupRef = useRef<L.LayerGroup | null>(null);
  const safeZonesGroupRef = useRef<L.LayerGroup | null>(null);
  const boundariesGroupRef = useRef<L.LayerGroup | null>(null);
  const regionalLabelsGroupRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);

  // BASE MAP STATE - Default to Dark Terrain (High-contrast GIS basemap per prompt)
  const [baseMap, setBaseMap] = useState<BaseMapType>('dark');
  const [currentZoom, setCurrentZoom] = useState<number>(7);

  // HAZARD / ENVIRONMENTAL LAYERS STATE
  const [layerStationPins, setLayerStationPins] = useState<boolean>(true);
  const [layerHeatmap, setLayerHeatmap] = useState<boolean>(true);
  const [heatmapMetric, setHeatmapMetric] = useState<'risk' | 'soil_moisture' | 'pore_pressure' | 'erosion'>('risk');
  const [layerRiskBuffers, setLayerRiskBuffers] = useState<boolean>(true);
  const [layerSafeZones, setLayerSafeZones] = useState<boolean>(true);
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
  const [layerVillages, setLayerVillages] = useState<boolean>(false);
  const [layerRivers, setLayerRivers] = useState<boolean>(true);
  const [layerBoundaries, setLayerBoundaries] = useState<boolean>(true);
  const [layerBuildings, setLayerBuildings] = useState<boolean>(false);
  const [layerShelters, setLayerShelters] = useState<boolean>(false);
  const [layerHospitals, setLayerHospitals] = useState<boolean>(false);
  const [layerCriticalInfra, setLayerCriticalInfra] = useState<boolean>(false);
  const [showEvidencePins, setShowEvidencePins] = useState<boolean>(false);

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
      setCurrentZoom(map.getZoom());

      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });

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
      riskBuffersGroupRef.current = L.layerGroup().addTo(map);
      safeZonesGroupRef.current = L.layerGroup().addTo(map);
      boundariesGroupRef.current = L.layerGroup().addTo(map);
      regionalLabelsGroupRef.current = L.layerGroup().addTo(map);

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

  // Update Base Tile Layer - Dark Satellite Terrain with Visible Vegetation, Mountains, Water Bodies & Roads
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
    let tileClassName = '';
    let hasRefLayers = false;

    if (baseMap === 'dark') {
      // Dark Satellite Terrain (Default per prompt specification)
      // High-resolution real satellite imagery calibrated to ~80% brightness, ~118% contrast, ~115% saturation
      // Preserves deep green forests (#164E36), lush vegetation (#3F7D3A), dark mountains (#344B35), and blue water bodies
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, Maxar, Earthstar Geographics';
      maxNativeZoom = 18;
      tileClassName = 'leaflet-tile-dark-satellite';
      hasRefLayers = true;
    } else if (baseMap === 'satellite') {
      // Standard Daytime Satellite Imagery
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, Earthstar Geographics';
      maxNativeZoom = 18;
      hasRefLayers = true;
    } else if (baseMap === 'topo') {
      // Topographic Relief with contours and elevation
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      attribution = '&copy; Esri, USGS, NOAA';
      maxNativeZoom = 18;
    } else {
      // Standard Street / OSM
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
      maxNativeZoom = 19;
    }

    L.tileLayer(tileUrl, {
      attribution,
      maxNativeZoom,
      maxZoom: 19,
      subdomains: 'abc',
      className: tileClassName,
    }).addTo(map);

    if (hasRefLayers) {
      // 1. High-contrast cartographic labels & state boundaries overlay (white text with dark halo)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 18,
        maxZoom: 19,
        className: 'leaflet-tile-places-ref',
        zIndex: 400,
      }).addTo(map);

      // 2. High-visibility road network & highway shields overlay
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 18,
        maxZoom: 19,
        className: 'leaflet-tile-places-ref',
        zIndex: 401,
      }).addTo(map);
    }
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

    // 1. RENDER STATION PINS (Circular pins with white border, colored center, subtle glow, readable white labels with dark shadow)
    if (layerStationPins && layerLandslide) {
      filteredStations.forEach((station) => {
        const { status } = station.riskAssessment || { status: 'moderate' };
        const isSelected = selectedStation?.id === station.id;

        const isExtreme = status === 'critical' && (station.riskAssessment?.riskScore ?? 0) >= 80;
        const isCritical = status === 'critical' && !isExtreme;
        const isHigh = status === 'high';
        const isModerate = status === 'moderate';
        const isSafe = status === 'safe';

        let badgeLabel = 'SAFE';
        if (isExtreme) {
          badgeLabel = 'EXTREME';
        } else if (isCritical) {
          badgeLabel = 'CRITICAL';
        } else if (isHigh) {
          badgeLabel = 'HIGH';
        } else if (isModerate) {
          badgeLabel = 'MODERATE';
        }

        // Semantic Colors matching prompt palette
        const centerColor = isExtreme
          ? '#EC4899' // extreme / magenta
          : isCritical
          ? '#EF4444' // critical red
          : isHigh
          ? '#F97316' // high orange
          : isModerate
          ? '#FACC15' // moderate yellow
          : '#10B981'; // safe green

        const glowColor = isExtreme
          ? 'rgba(236, 72, 153, 0.75)'
          : isCritical
          ? 'rgba(239, 68, 68, 0.7)'
          : isHigh
          ? 'rgba(249, 115, 22, 0.65)'
          : isModerate
          ? 'rgba(250, 204, 21, 0.6)'
          : 'rgba(16, 185, 129, 0.6)';

        const placeName = getCleanPlaceName(station);

        // PREVENT LABEL OVERLAPPING:
        // Show permanent compact badge only if selected, emergency node (critical/extreme), or zoomed in (currentZoom >= 9).
        // Otherwise, hide by default to prevent overlapping clutter, but display smoothly on hover (group-hover:opacity-100)!
        const shouldShowLabel = isSelected || isExtreme || isCritical || currentZoom >= 9;

        const iconHtml = `
          <div class="custom-station-pin cursor-pointer group flex flex-col items-center" style="transform: translate(-50%, -50%);">
            <!-- Sleek circular marker: white outer border, colored center, subtle glow, small shadow -->
            <div class="relative flex items-center justify-center">
              <div class="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center transition-transform group-hover:scale-125 ${
                isSelected ? 'ring-2 ring-blue-400 scale-125' : ''
              }"
                   style="background-color: ${centerColor}; box-shadow: 0 0 8px ${glowColor}, 0 2px 5px rgba(0,0,0,0.65);">
                <div class="w-1.5 h-1.5 rounded-full bg-white/95"></div>
              </div>
              ${
                isSelected || isCritical || isExtreme
                  ? `<span class="absolute -inset-1 rounded-full animate-ping opacity-60 pointer-events-none" style="background-color: ${centerColor}"></span>`
                  : ''
              }
            </div>

            <!-- Place Name Label: Non-overlapping, compact, visible on hover or when primary/zoomed in -->
            <div class="mt-1 pointer-events-none whitespace-nowrap transition-opacity duration-150 ${
              shouldShowLabel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }">
              <span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold font-sans text-white bg-black/75 backdrop-blur-xs border border-white/20 shadow-[0_1.5px_3px_rgba(0,0,0,0.85)] tracking-wide">
                ${placeName}
              </span>
            </div>
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
            zIndexOffset: isSelected ? 1000 : isExtreme ? 80 : isCritical ? 50 : 20,
          });

          // Native tooltip as backup hover
          if (!shouldShowLabel) {
            marker.bindTooltip(placeName, { direction: 'top', offset: [0, -10], opacity: 0.95 });
          }

          const popupHtml = `
            <div class="text-slate-900 font-sans p-2 min-w-[210px]">
              <div class="flex items-center justify-between gap-1.5 pb-1.5 mb-1.5 border-b border-slate-200">
                <span class="font-bold text-xs truncate text-slate-900">${station.name}</span>
                <span class="text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isSafe
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : isExtreme
                    ? 'bg-pink-50 text-pink-800 border border-pink-200'
                    : isCritical
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : isHigh
                    ? 'bg-orange-50 text-orange-800 border border-orange-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }">${badgeLabel}</span>
              </div>
              <div class="text-[11px] text-slate-600 mb-2">${station.region}</div>
              <div class="grid grid-cols-2 gap-1.5 text-[11px] mb-2 bg-slate-50 border border-slate-200 p-2 rounded-lg">
                <div><span class="text-slate-500">Risk Score:</span> <strong>${station.riskAssessment?.riskScore ?? 50}%</strong></div>
                <div><span class="text-slate-500">Safety (FS):</span> <strong>${station.riskAssessment?.safetyFactor ?? 1.5}</strong></div>
                <div><span class="text-slate-500">Rain 24h:</span> <strong>${station.telemetry?.rainfall24hMm ?? 0} mm</strong></div>
                <div><span class="text-slate-500">Moisture:</span> <strong>${station.telemetry?.soilMoisturePct ?? 50}%</strong></div>
                <div><span class="text-slate-500">Slope:</span> <strong>${station.slopeAngleDeg ?? 35}°</strong></div>
                <div><span class="text-slate-500">Pore Press:</span> <strong>${station.telemetry?.poreWaterPressureKpa ?? 15} kPa</strong></div>
              </div>
              <button id="inspect-btn-${station.id}" class="w-full text-center py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors shadow-xs">
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
    }

    // 2. RENDER PROFESSIONAL GIS RISK HEATMAP (Smooth gradients, subtle blending, Agartala bullseye)
    if (layerHeatmap) {
      const heatPoints: [number, number, number][] = [];

      filteredStations.forEach((st) => {
        const isAgartala =
          (st.name || '').toLowerCase().includes('agartala') ||
          (st.id || '').includes('agartala') ||
          (Math.abs(st.latitude - 23.8315) < 0.05 && Math.abs(st.longitude - 91.2868) < 0.05);

        if (isAgartala) {
          // Specific Agartala Risk Zone:
          // Center: RED / ORANGE (weight: 0.95)
          heatPoints.push([st.latitude, st.longitude, 0.95]);

          // Middle concentric ring: ORANGE / YELLOW (weight: 0.62)
          const midDist = 0.022; // ~2.4km
          const midCount = 5;
          for (let i = 0; i < midCount; i++) {
            const angle = (i / midCount) * Math.PI * 2;
            heatPoints.push([
              st.latitude + Math.sin(angle) * midDist,
              st.longitude + Math.cos(angle) * midDist,
              0.62,
            ]);
          }

          // Outer concentric ring: GREEN / transparent (weight: 0.28)
          const outerDist = 0.052; // ~5.5km
          const outerCount = 7;
          for (let i = 0; i < outerCount; i++) {
            const angle = (i / outerCount) * Math.PI * 2;
            heatPoints.push([
              st.latitude + Math.sin(angle) * outerDist,
              st.longitude + Math.cos(angle) * outerDist,
              0.28,
            ]);
          }
          return;
        }

        // Standard station smooth GIS gradient
        let weight = 0.45;
        if (heatmapMetric === 'soil_moisture') {
          weight = Math.min(1.0, Math.max(0.18, (st.telemetry?.soilMoisturePct ?? 50) / 95));
        } else if (heatmapMetric === 'pore_pressure') {
          weight = Math.min(1.0, Math.max(0.18, (st.telemetry?.poreWaterPressureKpa ?? 18) / 45));
        } else if (heatmapMetric === 'erosion') {
          weight = Math.min(1.0, Math.max(0.18, (st.slopeAngleDeg ?? 35) / 58));
        } else {
          weight =
            st.riskAssessment?.status === 'critical'
              ? 0.92
              : st.riskAssessment?.status === 'high'
              ? 0.70
              : st.riskAssessment?.status === 'moderate'
              ? 0.45
              : 0.20;
        }

        heatPoints.push([st.latitude, st.longitude, weight]);

        // Localized surrounding slope dispersion (tight and subtle to keep terrain visible)
        const subCount = weight > 0.7 ? 3 : 2;
        for (let i = 0; i < subCount; i++) {
          const angle = (i / subCount) * Math.PI * 2;
          const dist = 0.025;
          heatPoints.push([
            st.latitude + Math.sin(angle) * dist,
            st.longitude + Math.cos(angle) * dist,
            weight * 0.65,
          ]);
        }
      });

      if (isHeatPluginReady && typeof (L as any).heatLayer === 'function') {
        try {
          const heat = (L as any).heatLayer(heatPoints, {
            radius: 28,
            blur: 20,
            maxZoom: 16,
            max: 1.0,
            minOpacity: 0.28,
            gradient: {
              0.15: '#10B981', // SAFE: transparent -> green
              0.42: '#FACC15', // MODERATE: yellow
              0.66: '#F97316', // HIGH: orange
              0.86: '#EF4444', // CRITICAL: red
              1.0: '#EC4899',  // EXTREME: magenta
            },
          });
          heat.addTo(map);
          heatLayerRef.current = heat;
        } catch (e) {
          console.warn('[Leaflet] heatLayer failed:', e);
        }
      }
    }
  }, [filteredStations, layerStationPins, layerLandslide, layerHeatmap, heatmapMetric, selectedStation?.id, isHeatPluginReady, currentZoom]);

  // RENDER RISK BUFFER ZONES AROUND STATIONS
  useEffect(() => {
    const map = mapInstanceRef.current;
    const buffersGroup = riskBuffersGroupRef.current;
    if (!map || !buffersGroup) return;

    buffersGroup.clearLayers();
    if (!layerRiskBuffers) return;

    filteredStations.forEach((st) => {
      const status = st.riskAssessment?.status || 'moderate';
      const isCritical = status === 'critical';
      const isHigh = status === 'high';
      const isMod = status === 'moderate';

      const radius = isCritical ? 3500 : isHigh ? 2200 : isMod ? 1400 : 800;
      const strokeColor = isCritical ? '#ef4444' : isHigh ? '#f97316' : isMod ? '#eab308' : '#10b981';
      const fillColor = isCritical ? '#fecaca' : isHigh ? '#fed7aa' : isMod ? '#fef08a' : '#dcfce7';

      const circle = L.circle([st.latitude, st.longitude], {
        radius,
        color: strokeColor,
        weight: isCritical ? 2 : 1.5,
        dashArray: '5, 5',
        fillColor,
        fillOpacity: 0.28,
      });

      circle.bindTooltip(`
        <div class="font-sans font-bold text-xs p-1">
          <span style="color: ${strokeColor}">● ${status.toUpperCase()} BUFFER:</span> ${(radius / 1000).toFixed(1)}km
          <div class="text-[10px] text-slate-600 font-normal">${st.name}</div>
        </div>
      `, { sticky: true });

      buffersGroup.addLayer(circle);
    });
  }, [layerRiskBuffers, filteredStations, isMapReady]);

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

  // 3. RENDER RIVERS LAYER (Bright Cyan/Blue #06B6D4, Major 2.5-3.5px, Minor 1.8-2.0px)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const riversGroup = riversGroupRef.current;
    if (!map || !riversGroup) return;

    riversGroup.clearLayers();
    if (!layerRivers) return;

    RIVER_SYSTEMS.forEach((river) => {
      const polyline = L.polyline(river.coordinates, {
        color: '#06B6D4',
        weight: river.weight || 2.5,
        opacity: 0.9,
        className: 'glow-river',
      });

      polyline.bindPopup(`
        <div class="text-slate-900 font-sans p-1.5 min-w-[200px]">
          <div class="font-bold text-xs text-cyan-800 flex items-center gap-1.5 mb-1">
            <span>💧</span>
            <span>${river.name}</span>
          </div>
          <div class="text-[11px] text-slate-600">${river.state}</div>
          <div class="text-[10px] text-cyan-900 mt-1 font-semibold">Water Telemetry: <strong>${river.waterLevel}</strong></div>
        </div>
      `);

      riversGroup.addLayer(polyline);
    });
  }, [layerRivers]);

  // 4. RENDER ROADS / HIGHWAY RISK SEGMENTS (#F59E0B for major highways)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const highwayGroup = highwayGroupRef.current;
    if (!map || !highwayGroup) return;

    highwayGroup.clearLayers();
    if (!layerRoads) return;

    HIGHWAY_RISK_SEGMENTS.forEach((segment) => {
      const isCritical = segment.overallRisk === 'emergency' || segment.riskScorePct > 70;
      const isModerate = segment.overallRisk === 'warning' || segment.riskScorePct > 40;
      const lineColor = isCritical ? '#EF4444' : isModerate ? '#F59E0B' : '#F59E0B';

      const polyline = L.polyline(segment.coordinates, {
        color: lineColor,
        weight: isCritical ? 4.5 : 3.5,
        opacity: 0.88,
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

  // 4B. RENDER STATE & DISTRICT BOUNDARIES LAYER (Purple/Violet #A855F7, 1-2px, semi-transparent)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const boundariesGroup = boundariesGroupRef.current;
    if (!map || !boundariesGroup) return;

    boundariesGroup.clearLayers();
    if (!layerBoundaries) return;

    STATE_DISTRICT_BOUNDARIES.forEach((boundary) => {
      const polyline = L.polyline(boundary.coordinates, {
        color: '#A855F7',
        weight: 1.5,
        opacity: 0.72,
        dashArray: '5, 4',
        className: 'glow-boundary',
      });

      polyline.bindTooltip(`
        <div class="font-sans text-[11px] font-bold p-1 text-purple-900">
          🏛️ ${boundary.name}
        </div>
      `, { sticky: true });

      boundariesGroup.addLayer(polyline);
    });
  }, [layerBoundaries]);

  // 4C. RENDER REGIONAL TERRITORY WATERMARKS (Purple state watermarks, only at overview zoom with boundary layer)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const regionalLabelsGroup = regionalLabelsGroupRef.current;
    if (!map || !regionalLabelsGroup) return;

    regionalLabelsGroup.clearLayers();
    if (!layerBoundaries || currentZoom >= 9) return;

    REGIONAL_MAP_LABELS.forEach((item) => {
      const customIcon = L.divIcon({
        html: `
          <div class="custom-regional-label pointer-events-none select-none whitespace-nowrap" style="transform: translate(-50%, -50%);">
            <span class="px-2 py-0.5 rounded font-mono font-bold text-[10px] tracking-widest text-purple-200 bg-black/50 border border-purple-400/30 shadow-[0_1.5px_3.5px_rgba(0,0,0,0.85)]">
              ${item.name}
            </span>
          </div>
        `,
        className: 'custom-regional-label',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([item.lat, item.lng], { icon: customIcon, interactive: false, zIndexOffset: -10 });
      regionalLabelsGroup.addLayer(marker);
    });
  }, [layerBoundaries, currentZoom]);

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
    if (!layerVillages) return;

    REMOTE_VILLAGE_PINS.forEach((vil) => {
      const iconHtml = `
        <div class="cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-slate-800 border-2 border-emerald-500 shadow-md whitespace-nowrap hover:scale-105 transition-transform">
            <span>🏡</span>
            <span>${vil.villageName}</span>
          </div>
          <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-emerald-500 mx-auto -mt-[0.5px]"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-village-icon',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([vil.latitude, vil.longitude], { icon: customIcon, zIndexOffset: 260 });
      marker.bindPopup(`
        <div class="text-slate-900 font-sans p-2.5 min-w-[220px]">
          <div class="font-bold text-xs text-slate-900 mb-1 flex items-center gap-1.5">
            <span>🏡</span>
            <span>${vil.villageName}</span>
          </div>
          <div class="text-[11px] text-slate-600 mb-1.5">${vil.district}, ${vil.state} • Elev: ${vil.elevationM}m</div>
          <div class="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 mb-2">
            <strong>Safe Shelter Haven:</strong> ${vil.safeShelterHaven}
          </div>
          <div class="text-[10px] text-slate-600">Population at Risk: <strong class="text-slate-900">${vil.populationAtRisk.toLocaleString()}</strong></div>
        </div>
      `);

      villageGroup.addLayer(marker);
    });
  }, [layerVillages]);

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

      // Color palette matching prompt specifications: extreme -> #EC4899, red -> #EF4444, orange -> #F97316, yellow -> #FACC15
      const color = isExtreme
        ? '#EC4899' // extreme magenta: #EC4899
        : isHigh
        ? '#EF4444' // red: #EF4444
        : isModerate
        ? '#F97316' // orange: #F97316
        : '#FACC15'; // yellow: #FACC15

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

      // CENTER BEACON BADGE MARKER (Shown at zoom >= 9 or for extreme hazard zones)
      if (currentZoom >= 9 || isExtreme) {
        const lats = zone.coordinates.map((c) => c[0]);
        const lngs = zone.coordinates.map((c) => c[1]);
        const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
        const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

        const zoneIcon = L.divIcon({
          html: `
            <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
              <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black ${
                isExtreme
                  ? 'bg-rose-950/95 text-rose-200 border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                  : isHigh
                  ? 'bg-orange-950/95 text-orange-200 border border-orange-500 shadow-xs'
                  : isModerate
                  ? 'bg-amber-950/95 text-amber-200 border border-amber-500 shadow-xs'
                  : 'bg-emerald-950/95 text-emerald-200 border border-emerald-500 shadow-xs'
              } shadow-lg hover:scale-105 transition-transform whitespace-nowrap">
                <span class="w-1.5 h-1.5 rounded-full ${isExtreme ? 'bg-rose-500 animate-ping' : isHigh ? 'bg-orange-400' : isModerate ? 'bg-amber-400' : 'bg-emerald-400'} shrink-0"></span>
                <span>${isExtreme ? '🚨 EXTREME' : isHigh ? '⚠️ HIGH' : isModerate ? '⚡ MOD' : '🟢 LOW'}: ${zone.name.split(' ')[0]}</span>
                <span class="text-[8.5px] font-mono px-1 rounded bg-black/60">FS ${zone.safetyFactor}</span>
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
      }
    });
  }, [layerRiskZones, riskZoneFilter, isMapReady, currentZoom]);

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
        <div class="text-slate-900 font-sans p-2.5 min-w-[250px] max-w-[290px] overflow-hidden">
          <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 min-w-0">
            <div class="flex items-center gap-1.5 min-w-0 truncate">
              <span class="text-emerald-600 font-black">🛡️</span>
              <span class="font-bold text-xs text-slate-900 truncate">${route.name}</span>
            </div>
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              ${route.safetyStatus}
            </span>
          </div>

          <div class="text-[11px] text-slate-600 mb-2 truncate">${route.state} • ${route.corridorCode}</div>

          <div class="grid grid-cols-2 gap-1.5 text-[10px] mb-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <div><span class="text-slate-500">Distance:</span> <strong class="text-emerald-700 font-mono">${route.distanceKm} km</strong></div>
            <div><span class="text-slate-500">Transit:</span> <strong class="text-emerald-700 font-mono">~${route.estEvacTimeMinutes} mins</strong></div>
            <div><span class="text-slate-500">Capacity:</span> <strong class="text-slate-800">${route.capacityVehiclesPerHour} veh/h</strong></div>
            <div><span class="text-slate-500">Profile:</span> <strong class="text-blue-700">Crest Ridge</strong></div>
          </div>

          <div class="text-[11px] text-slate-700 mb-1.5">
            <span class="font-bold text-slate-900">Engineering:</span> ${route.surfaceType}
          </div>

          <div class="p-2 rounded-lg bg-emerald-50/70 text-[11px] text-emerald-900 leading-snug mb-2 italic border border-emerald-200">
            "${route.description}"
          </div>

          ${
            onOpenEscapeModal
              ? `<button id="btn-full-evac-plan" class="w-full text-center py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-xs">
                  Open Evacuation Command Dispatch
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

      // Render checkpoint badge markers when zoomed in (currentZoom >= 9) to keep overview clean
      if (currentZoom >= 9) {
        // Starting Checkpoint Marker
        const startCoord = route.coordinates[0];
        if (startCoord) {
          const checkIcon = L.divIcon({
            html: `
              <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8.5px] font-black bg-white text-emerald-800 border border-emerald-500 shadow-xs whitespace-nowrap hover:scale-105 transition-transform">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
                  <div class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black bg-white text-teal-800 border border-teal-400 shadow-xs whitespace-nowrap hover:scale-105 transition-transform">
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

        // Safe Destination Marker at End of Route
        const endCoord = route.coordinates[route.coordinates.length - 1];
        if (endCoord) {
          const destIcon = L.divIcon({
            html: `
              <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8.5px] font-black bg-white text-emerald-800 border border-emerald-500 shadow-xs whitespace-nowrap hover:scale-105 transition-transform">
                  <span>🏁</span>
                  <span>SAFE DESTINATION: ${route.connectedHub.split(' ')[0]}</span>
                </div>
              </div>
            `,
            className: 'custom-safe-dest-marker',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });
          const destMarker = L.marker(endCoord, { icon: destIcon, zIndexOffset: 350 });
          destMarker.bindPopup(popupHtml);
          safeRoutesGroup.addLayer(destMarker);
        }
      }
    });
  }, [layerSafeRoutes, onOpenEscapeModal, isMapReady, currentZoom]);

  // RENDER DEDICATED SAFE ZONES (Clear Translucent Green Polygons, Borders & SAFE ZONE Labels)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const safeZonesGroup = safeZonesGroupRef.current;
    if (!map || !safeZonesGroup) return;

    safeZonesGroup.clearLayers();
    if (!layerSafeZones) return;

    COMMUNITY_HUBS.forEach((hub) => {
      // 1. Translucent green muster polygon
      if (hub.safeAreaCoords && hub.safeAreaCoords.length > 2) {
        const safePolygon = L.polygon(hub.safeAreaCoords, {
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.32,
          weight: 2.5,
          dashArray: '5, 4',
        });
        safePolygon.bindTooltip(`
          <div class="font-sans font-bold text-xs p-1 text-emerald-900">
            <span class="text-emerald-700">🛡️ SAFE ZONE:</span> ${hub.name}
            <div class="text-[10px] text-slate-600 font-normal">Designated Evacuation Haven • Cap ${hub.safeCapacityPeople.toLocaleString()}</div>
          </div>
        `, { sticky: true });
        safeZonesGroup.addLayer(safePolygon);
      }

      // 2. Safe zone buffer circle
      const safeCircle = L.circle(hub.coordinates, {
        radius: hub.safeAreaRadiusMeters || 1200,
        color: '#10b981',
        fillColor: '#dcfce7',
        fillOpacity: 0.24,
        weight: 2,
        dashArray: '4, 4',
      });
      safeZonesGroup.addLayer(safeCircle);

      // 3. Clear "SAFE ZONE" Label Marker (Displayed at zoom >= 9 to keep overview clear)
      if (currentZoom >= 9) {
        const labelIcon = L.divIcon({
          html: `
            <div class="cursor-pointer" style="transform: translate(-50%, -50%);">
              <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-white text-emerald-800 border border-emerald-500 shadow-xs whitespace-nowrap hover:scale-105 transition-transform">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>🛡️ SAFE ZONE: ${hub.name.split(' ')[0]}</span>
                <span class="text-[8.5px] px-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-300">Cap ${hub.safeCapacityPeople.toLocaleString()}</span>
              </div>
            </div>
          `,
          className: 'custom-safe-zone-icon',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker(hub.coordinates, { icon: labelIcon, zIndexOffset: 340 });

        const popupHtml = `
          <div class="text-slate-900 font-sans p-2.5 min-w-[240px]">
            <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
              <div class="flex items-center gap-1.5 truncate">
                <span class="text-emerald-600 font-black text-sm">🛡️</span>
                <span class="font-bold text-xs text-slate-900 truncate">SAFE ZONE: ${hub.name}</span>
              </div>
              <span class="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                SAFE HAVEN
              </span>
            </div>
            <div class="text-[11px] text-slate-600 mb-2">${hub.district}, ${hub.state} • Elev: ${hub.elevationM}m</div>
            <div class="grid grid-cols-2 gap-1.5 text-[11px] mb-2 bg-emerald-50/70 border border-emerald-200 p-2 rounded-lg">
              <div><span class="text-slate-500">Designated Cap:</span> <strong>${hub.safeCapacityPeople.toLocaleString()}</strong></div>
              <div><span class="text-slate-500">Ration Days:</span> <strong>${hub.supplies.foodRationDays} Days</strong></div>
              <div><span class="text-slate-500">Water Supply:</span> <strong>${hub.supplies.waterSource}</strong></div>
              <div><span class="text-slate-500">Medical Post:</span> <strong>${hub.supplies.medicalAid}</strong></div>
            </div>
            <button id="zoom-safe-zone-${hub.id}" class="w-full text-center py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-xs">
              Zoom to Safe Zone Perimeter
            </button>
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`zoom-safe-zone-${hub.id}`);
          if (btn) {
            btn.onclick = () => {
              marker.closePopup();
              map.flyTo(hub.coordinates, 13, { duration: 1.2 });
            };
          }
        });

        safeZonesGroup.addLayer(marker);
      }
    });
  }, [layerSafeZones, isMapReady, currentZoom]);

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
          className: 'text-xs font-mono font-bold bg-white text-emerald-800 border border-emerald-300 p-1 rounded shadow-xs',
        });
        hubsGroup.addLayer(safePolygon);
      }

      // 2. Hub Beacon Marker
      const iconHtml = `
        <div class="cursor-pointer" style="transform: translate(-50%, -100%);">
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-800 border-2 border-emerald-500 shadow-md hover:scale-105 transition-transform whitespace-nowrap">
            <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>🏛️</span>
            <span>${hub.name.split(' ')[0]} Haven</span>
            <span class="text-[9px] font-mono px-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">Cap ${hub.safeCapacityPeople.toLocaleString()}</span>
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-emerald-600 mx-auto -mt-[0.5px]"></div>
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
        <div class="text-slate-900 font-sans p-3 min-w-[260px] max-w-[300px] overflow-hidden">
          <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200 min-w-0">
            <div class="flex items-center gap-1.5 truncate">
              <span class="text-emerald-600 font-black text-sm">🏛️</span>
              <span class="font-bold text-xs text-slate-900 truncate">${hub.name}</span>
            </div>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
              ${hub.status}
            </span>
          </div>

          <div class="text-[11px] text-slate-500 mb-2 truncate">${hub.district}, ${hub.state} • Elev: ${hub.elevationM}m</div>

          <div class="grid grid-cols-2 gap-1.5 text-[10px] mb-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div><span class="text-slate-500">Designated Cap:</span> <strong class="text-emerald-700 font-bold">${hub.safeCapacityPeople.toLocaleString()}</strong></div>
            <div><span class="text-slate-500">Occupancy:</span> <strong class="text-slate-800 font-bold">${hub.currentOccupancy}</strong></div>
            <div><span class="text-slate-500">Ration Stock:</span> <strong class="text-blue-700 font-bold">${hub.supplies.foodRationDays} Days</strong></div>
            <div><span class="text-slate-500">Safe Radius:</span> <strong class="text-slate-800 font-bold">${hub.safeAreaRadiusMeters}m</strong></div>
          </div>

          <div class="space-y-1 text-[10px] text-slate-600 mb-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div class="truncate">💧 <strong class="text-slate-800">Water:</strong> ${hub.supplies.waterSource}</div>
            <div class="truncate">🏥 <strong class="text-slate-800">Medical:</strong> ${hub.supplies.medicalAid}</div>
            <div class="truncate">⚡ <strong class="text-slate-800">Power:</strong> ${hub.supplies.powerBackup}</div>
            <div class="truncate">📡 <strong class="text-slate-800">Comms:</strong> ${hub.supplies.comms}</div>
          </div>

          <button id="hub-zoom-btn-${hub.id}" class="w-full text-center py-2 text-[11px] font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors shadow-xs">
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
      className="relative isolate z-0 w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-[#121c17]"
    >
      {/* Map Canvas Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* TOP-LEFT MAIN CONTROLS: Search, Station Selector, Current Location / GPS */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2.5 flex-wrap max-w-[calc(100%-180px)]">
        {/* 1. Search Station / Area */}
        <div className="flex items-center h-11 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-[14px] px-3.5 shadow-sm hover:border-slate-300 transition-all w-48 sm:w-60 md:w-72">
          <Search className="w-4 h-4 text-blue-600 mr-2 shrink-0" />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.mapSearchPlaceholder}
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full min-w-0 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-xs text-slate-400 hover:text-slate-700 ml-1 px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* 2. Station Selector: "STATION: Agartala (Tripura) ▼" */}
        <div className="relative flex items-center h-11 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-[14px] px-3.5 shadow-sm hover:border-slate-300 transition-all max-w-[220px] sm:max-w-[270px]">
          <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider mr-1.5 shrink-0">
            {t.stationLabel || 'STATION:'}
          </span>
          <span className="text-xs text-slate-800 font-bold truncate pr-5">
            {selectedStation
              ? `${getCleanPlaceName(selectedStation)} (${selectedStation.region ? selectedStation.region.split(',')[0].replace(/District/i, '').trim() : 'Tripura'})`
              : 'Agartala (Tripura)'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 pointer-events-none shrink-0" />
          <select
            value={selectedStation?.id || ''}
            onChange={(e) => {
              const found = stations.find((s) => s.id === e.target.value);
              if (found) onSelectStation(found);
            }}
            aria-label="Station Selector"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          >
            {stations.map((st) => {
              const clean = getCleanPlaceName(st);
              const region = st.region ? st.region.split(',')[0].replace(/District/i, '').trim() : '';
              return (
                <option key={st.id} value={st.id} className="bg-white text-slate-900 font-sans">
                  {clean} {region ? `(${region})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* 3. Current Location / GPS button with circular blue location icon */}
        <button
          type="button"
          onClick={() => {
            const map = mapInstanceRef.current;
            if (!map) return;
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  map.flyTo([pos.coords.latitude, pos.coords.longitude], 12, { duration: 1.2 });
                },
                () => {
                  fitAllStations();
                },
                { timeout: 4000 }
              );
            } else {
              fitAllStations();
            }
          }}
          className="flex items-center justify-center h-11 w-11 bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/50 text-blue-600 rounded-[14px] shadow-sm transition-all cursor-pointer shrink-0 active:scale-95 group"
          title="Current Location / GPS"
          aria-label="Current Location / GPS"
        >
          <div className="w-6 h-6 rounded-full bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
            <LocateFixed className="w-4 h-4 text-blue-600" />
          </div>
        </button>
      </div>

      {/* TOP-RIGHT CONTROLS: Map Layers Button & Floating Dropdown */}
      <div className="absolute top-4 right-4 z-[1100] flex flex-col items-end gap-2">
        {/* 4. Main "Map Layers" Floating Button */}
        <button
          ref={layerBtnRef}
          id="map-layers-trigger-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLayerPanelOpen(!isLayerPanelOpen);
          }}
          className="flex items-center gap-2 h-11 px-4 rounded-[14px] bg-white/95 backdrop-blur-md border border-slate-200/90 hover:border-blue-500 hover:bg-white text-xs font-bold text-slate-800 shadow-sm cursor-pointer transition-all active:scale-95"
          title="Open GIS & Hazard Map Layers Selector"
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span className="font-sans">{t.mapLayers}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
              isLayerPanelOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* FLOATING LAYER-SELECTION PANEL */}
        {isLayerPanelOpen && (
          <div
            ref={layerDropdownRef}
            id="floating-map-layer-panel"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-80 sm:w-88 max-h-[calc(100vh-160px)] sm:max-h-[580px] overflow-y-auto bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-4 shadow-xl text-slate-800 animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-sans">
                  Map Layers &amp; Overlays
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsLayerPanelOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CATEGORY 1: BASE MAPS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                BASE MAPS
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'satellite', label: t.baseSatellite || 'Satellite', icon: Globe },
                    { id: 'topo', label: t.baseTerrain || 'Terrain', icon: Layers },
                    { id: 'osm', label: t.baseStreet || 'Street', icon: Globe },
                    { id: 'dark', label: 'Dark Terrain', icon: Globe },
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
                          ? 'bg-blue-50 text-blue-800 border-blue-400 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <Icon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{base.label}</span>
                      </div>
                      {isActive && <Check className="w-3 h-3 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CATEGORY 2: PRIMARY DISASTER & HAZARD LAYERS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                HAZARD &amp; EVACUATION OVERLAYS
              </span>
              <div className="space-y-1.5">
                {/* Safe Zones */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 border border-emerald-200 hover:border-emerald-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">{t.layerSafeZones || 'Safe Zones'}</span>
                      <span className="text-[10px] text-slate-500">Muster perimeters &amp; havens</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerSafeZones}
                    onChange={(e) => setLayerSafeZones(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Landslide Risk Heatmap & Metric Selection */}
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-bold text-slate-900 block">{t.landslideRisk || 'Landslide Risk'}</span>
                        <span className="text-[10px] text-slate-500">Scientific GIS hazard density</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={layerHeatmap}
                      onChange={(e) => setLayerHeatmap(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </label>
                  {layerHeatmap && (
                    <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-slate-600 uppercase font-mono">Heatmap Metric:</span>
                      <select
                        value={heatmapMetric}
                        onChange={(e) => setHeatmapMetric(e.target.value as any)}
                        className="bg-white border border-slate-300 text-slate-800 text-[11px] font-semibold px-2 py-1 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="risk">Risk</option>
                        <option value="soil_moisture">Soil Moisture</option>
                        <option value="pore_pressure">Pore Pressure</option>
                        <option value="erosion">Erosion</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Safe Routes */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">{t.layerSafeRoutes || 'Safe Routes'}</span>
                      <span className="text-[10px] text-slate-500">Ridge bypasses &amp; all-clear corridors</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerSafeRoutes}
                    onChange={(e) => setLayerSafeRoutes(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Risk Buffers */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-900 block">Risk Buffers</span>
                      <span className="text-[10px] text-slate-500">Concentric hazard impact radii</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRiskBuffers}
                    onChange={(e) => setLayerRiskBuffers(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Station Pins */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Station Pins</span>
                      <span className="text-[10px] text-slate-500">Live IoT telemetry nodes &amp; status</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerStationPins}
                    onChange={(e) => setLayerStationPins(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Flood Risk Layer */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-cyan-50/50 border border-cyan-200 hover:border-cyan-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Waves className="w-4 h-4 text-cyan-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Flood Risk</span>
                      <span className="text-[10px] text-slate-500">Hydraulic inundation perimeters</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerFlood}
                    onChange={(e) => setLayerFlood(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* River Corridors Layer */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-cyan-50/40 border border-cyan-200 hover:border-cyan-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-1 rounded-full bg-[#06B6D4] shadow-xs" />
                    <div>
                      <span className="font-bold text-slate-900 block">River Corridors</span>
                      <span className="text-[10px] text-slate-500">Cyan waterways: Haora, Brahmaputra, Gomati</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRivers}
                    onChange={(e) => setLayerRivers(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* State & District Boundaries Layer */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-purple-50/40 border border-purple-200 hover:border-purple-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-0.5 rounded-full bg-[#A855F7] border-t border-dashed border-[#A855F7] shadow-xs" />
                    <div>
                      <span className="font-bold text-slate-900 block">State Boundaries</span>
                      <span className="text-[10px] text-slate-500">Purple perimeter lines: Tripura, Mizoram, Assam</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerBoundaries}
                    onChange={(e) => setLayerBoundaries(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* NH Corridors */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">NH Corridors</span>
                      <span className="text-[10px] text-slate-500">Highways NH-8, NH-10, NH-29</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRoads}
                    onChange={(e) => setLayerRoads(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Villages */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Villages</span>
                      <span className="text-[10px] text-slate-500">Remote settlement safe pins</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerVillages}
                    onChange={(e) => setLayerVillages(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Evidence */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-rose-50/40 border border-rose-200 hover:border-rose-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-rose-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Evidence</span>
                      <span className="text-[10px] text-slate-500">Disaster photos &amp; ground reports</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEvidencePins}
                    onChange={(e) => setShowEvidencePins(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* CATEGORY 3: ADVANCED METEOROLOGY & SENSING */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                ADVANCED SENSING &amp; INFRASTRUCTURE
              </span>
              <div className="space-y-1">
                {/* Rainfall Doppler */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="font-bold text-slate-900 block">Rainfall Doppler Radar</span>
                      <span className="text-[10px] text-slate-500">Live IMD Polarimetric Feed</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerRainfall}
                    onChange={(e) => setLayerRainfall(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Surface Temperature */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <div>
                      <span className="font-bold text-slate-900 block">Surface Temperature</span>
                      <span className="text-[10px] text-slate-500">Thermal Infrared Isotherms</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerTemperature}
                    onChange={(e) => setLayerTemperature(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Wind */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-teal-600" />
                    <div>
                      <span className="font-bold text-slate-900 block">Wind Velocity</span>
                      <span className="text-[10px] text-slate-500">Pass Streamlines &amp; Vectors</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerWind}
                    onChange={(e) => setLayerWind(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Hospitals */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-rose-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Hospital className="w-4 h-4 text-rose-600" />
                    <span className="font-bold text-slate-900">District Hospitals</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerHospitals}
                    onChange={(e) => setLayerHospitals(e.target.checked)}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {/* Critical Infrastructure */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900">Critical Infrastructure</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={layerCriticalInfra}
                    onChange={(e) => setLayerCriticalInfra(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. RIGHT SIDE: Zoom Controls [ + ] [ − ] */}
      <div className="absolute top-20 right-4 z-[1000] flex flex-col items-center bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-[14px] overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
        </button>
        <div className="w-6 h-[1px] bg-slate-200/80" />
        <button
          type="button"
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* FLOATING RISK LEGEND ON MAP (BOTTOM-RIGHT) */}
      <div
        id="map-floating-risk-legend"
        className="absolute bottom-3 right-3 z-[1000] bg-white/95 border border-slate-200 rounded-2xl p-3 shadow-md text-xs max-w-[280px] sm:max-w-xs pointer-events-auto overflow-hidden text-slate-800"
      >
        <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-slate-200">
          <span className="font-bold text-slate-900 text-[11px] uppercase tracking-wider font-mono truncate">
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
          <span className="text-[9px] font-mono font-bold text-blue-600 shrink-0">ACTIVE</span>
        </div>

        {/* Landslide & Geospatial Risk Zones Legend */}
        {activeLegendHazard === 'landslide' && (
          <div className="space-y-2 text-[11px]">
            {/* Colored circles: SAFE, MODERATE, HIGH, CRITICAL, EXTREME */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] border border-white shadow-2xs shrink-0" />
                  <span className="truncate">{t.metricSafe || 'SAFE'}</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px] shrink-0">FS &gt; 1.5</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15] border border-white shadow-2xs shrink-0" />
                  <span className="truncate">{t.metricModerate || 'MODERATE'}</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px] shrink-0">FS 1.2 – 1.5</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] border border-white shadow-2xs shrink-0" />
                  <span className="truncate">{t.metricHigh || 'HIGH'}</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px] shrink-0">FS 1.0 – 1.2</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] border border-white shadow-2xs shrink-0" />
                  <span className="truncate">{t.metricCritical || 'CRITICAL'}</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px] shrink-0">FS 0.85 – 1.0</span>
              </div>
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="flex items-center gap-1.5 text-slate-800 font-bold truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899] border border-white shadow-2xs animate-pulse shrink-0" />
                  <span className="truncate">{t.metricExtreme || 'EXTREME'}</span>
                </span>
                <span className="text-slate-500 font-mono text-[10px] shrink-0">FS &lt; 0.85</span>
              </div>
            </div>

            {/* Line features: Green line = Safe Route, Purple line = Boundary, Blue line = River, Orange line = Road */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between gap-2 text-slate-700 font-semibold min-w-0">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-1 rounded-full bg-[#10B981] shadow-2xs shrink-0" />
                  <span className="truncate">Green line = Safe Route</span>
                </span>
                <span className="font-mono text-[9px] text-emerald-700 shrink-0">Evacuation</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-slate-700 font-semibold min-w-0">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-0.5 rounded-full bg-[#A855F7] border-t border-dashed border-[#A855F7] shadow-2xs shrink-0" />
                  <span className="truncate">Purple line = Boundary</span>
                </span>
                <span className="font-mono text-[9px] text-purple-700 shrink-0">State / Dist</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-slate-700 font-semibold min-w-0">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-1 rounded-full bg-[#06B6D4] shadow-2xs shrink-0" />
                  <span className="truncate">Blue line = River</span>
                </span>
                <span className="font-mono text-[9px] text-cyan-700 shrink-0">Waterway</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-slate-700 font-semibold min-w-0">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-1 rounded-full bg-[#F59E0B] shadow-2xs shrink-0" />
                  <span className="truncate">Orange line = Road</span>
                </span>
                <span className="font-mono text-[9px] text-amber-700 shrink-0">Highway</span>
              </div>
            </div>
          </div>
        )}

        {/* Flood Legend */}
        {activeLegendHazard === 'flood' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-sky-700 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                <span className="truncate">Low Inundation</span>
              </span>
              <span className="text-slate-500 font-mono text-[10px] shrink-0">&lt; 0.5m</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-cyan-700 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                <span className="truncate">Moderate</span>
              </span>
              <span className="text-slate-500 font-mono text-[10px] shrink-0">0.5 – 1.5m</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-orange-700 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                <span className="truncate">High</span>
              </span>
              <span className="text-slate-500 font-mono text-[10px] shrink-0">1.5 – 3.0m</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="flex items-center gap-1.5 text-rose-700 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span className="truncate">Catastrophic</span>
              </span>
              <span className="text-slate-500 font-mono text-[10px] shrink-0">&gt; 3.0m</span>
            </div>
          </div>
        )}

        {/* Rainfall Legend */}
        {activeLegendHazard === 'rainfall' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Light Rain</span>
              <span className="font-mono text-[10px] text-cyan-700 shrink-0">&lt; 2.5 mm/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Moderate</span>
              <span className="font-mono text-[10px] text-cyan-700 shrink-0">2.5 – 10 mm/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Heavy</span>
              <span className="font-mono text-[10px] text-amber-700 shrink-0">10 – 50 mm/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Torrential Core</span>
              <span className="font-mono text-[10px] text-rose-700 shrink-0">&gt; 50 mm/h</span>
            </div>
          </div>
        )}

        {/* Temperature Legend */}
        {activeLegendHazard === 'temperature' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Alpine Permafrost</span>
              <span className="font-mono text-[10px] text-sky-700 shrink-0">&lt; 10°C</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Himalayan Ridge</span>
              <span className="font-mono text-[10px] text-teal-700 shrink-0">11°C – 18°C</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Valley Baseline</span>
              <span className="font-mono text-[10px] text-amber-700 shrink-0">&gt; 24°C</span>
            </div>
          </div>
        )}

        {/* Wind Legend */}
        {activeLegendHazard === 'wind' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Valley Breezes</span>
              <span className="font-mono text-[10px] text-emerald-700 shrink-0">&lt; 20 km/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Pass Moderate</span>
              <span className="font-mono text-[10px] text-teal-700 shrink-0">20 – 35 km/h</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">High-Ridge Jet</span>
              <span className="font-mono text-[10px] text-cyan-700 shrink-0">&gt; 35 km/h</span>
            </div>
          </div>
        )}

        {/* Soil Moisture Legend */}
        {activeLegendHazard === 'soil_moisture' && (
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Dry Slope</span>
              <span className="font-mono text-[10px] text-emerald-700 shrink-0">&lt; 30%</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Moist</span>
              <span className="font-mono text-[10px] text-amber-700 shrink-0">30% – 65%</span>
            </div>
            <div className="flex items-center justify-between gap-2 min-w-0 text-slate-700">
              <span className="truncate">Fully Saturated</span>
              <span className="font-mono text-[10px] text-rose-700 shrink-0">&gt; 75%</span>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING BOTTOM-LEFT TAG */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none flex items-center gap-2 text-[10px] sm:text-[11px] bg-white/95 px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 shadow-sm">
        <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span className="truncate font-medium">GIS Disaster Monitoring • {stations.length} Monitored Stations</span>
      </div>
    </div>
  );
};
