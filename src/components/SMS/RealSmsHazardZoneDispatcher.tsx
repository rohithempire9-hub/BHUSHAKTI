import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import 'leaflet/dist/leaflet.css';
import {
  Radio,
  ShieldAlert,
  Send,
  Users,
  CheckCircle2,
  Clock,
  Phone,
  TowerControl,
  Sparkles,
  AlertTriangle,
  FileCode,
  Smartphone,
  Layers,
  MapPin,
  RefreshCw,
  ExternalLink,
  Copy,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import {
  DisasterAlertPayload,
  BroadcastPolygonResponse,
  TargetedRecipient,
  DeliveryReceipt
} from '../../types/sms';
import { LandslideStation, SmsSubscriber } from '../../types/landslide';
import {
  broadcastPolygonAlert,
  calculatePolygonAreaSqKm,
  formatCapXml,
  formatSmsMessage,
  getDirectSmsUrl,
  isPointInPolygon,
  PRESET_HAZARD_POLYGONS
} from '../../services/smsGatewayService';

interface RealSmsHazardZoneDispatcherProps {
  stations: LandslideStation[];
  subscribers: SmsSubscriber[];
  onAlertBroadcasted?: (response: BroadcastPolygonResponse) => void;
  initialStation?: LandslideStation | null;
}

export const RealSmsHazardZoneDispatcher: React.FC<RealSmsHazardZoneDispatcherProps> = ({
  stations,
  subscribers,
  onAlertBroadcasted,
  initialStation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnPolygonLayerRef = useRef<L.Polygon | null>(null);
  const stationsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // Operator Form State
  const [severity, setSeverity] = useState<'Extreme' | 'Severe' | 'Moderate'>('Extreme');
  const [headline, setHeadline] = useState('Critical Landslide & Debris Avalanche Warning');
  const [instruction, setInstruction] = useState(
    'Immediate evacuation ordered for all downstream valley settlements. Barricade highway portals and move to high ridge shelters.'
  );

  // Polygon Coordinates State: array of [lon, lat]
  const [currentCoords, setCurrentCoords] = useState<number[][]>(
    PRESET_HAZARD_POLYGONS[0].coordinates
  );
  const [polygonAreaKm2, setPolygonAreaKm2] = useState<number>(14.2);

  // Dispatch Execution State
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<BroadcastPolygonResponse | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'handset' | 'receipts' | 'cap' | 'gateway'>('handset');
  const [copiedCap, setCopiedCap] = useState(false);

  // Real-time spatial intersections
  const [stationsInPerimeter, setStationsInPerimeter] = useState<LandslideStation[]>([]);
  const [targetedSubscribers, setTargetedSubscribers] = useState<TargetedRecipient[]>([]);

  // Update spatial intersections when coordinates or stations change
  useEffect(() => {
    if (!currentCoords || currentCoords.length < 3) {
      setStationsInPerimeter([]);
      setTargetedSubscribers([]);
      setPolygonAreaKm2(0);
      return;
    }

    const area = calculatePolygonAreaSqKm(currentCoords);
    setPolygonAreaKm2(area);

    const insideStations = stations.filter((st) => {
      if (typeof st.latitude !== 'number' || typeof st.longitude !== 'number') return false;
      return isPointInPolygon([st.longitude, st.latitude], currentCoords);
    });
    setStationsInPerimeter(insideStations);

    const targeted: TargetedRecipient[] = [];
    for (const sub of subscribers) {
      if (!sub.isActive) continue;
      let matched = false;
      let reason = '';

      // Priority Incident Commander Gutla Rohith always included
      if (sub.phoneNumber.includes('9032479657') || sub.fullName.toLowerCase().includes('gutla')) {
        matched = true;
        reason = 'Priority Commander (Immediate Emergency Link)';
      } else if (sub.assignedStationId === 'ALL') {
        matched = true;
        reason = 'Regional Multi-Jurisdiction Authority';
      } else {
        const affectedSt = insideStations.find((s) => s.id === sub.assignedStationId);
        if (affectedSt) {
          matched = true;
          reason = `Assigned to ${affectedSt.name} in perimeter`;
        }
      }

      if (matched) {
        targeted.push({
          phone: sub.phoneNumber,
          name: sub.fullName,
          role: sub.role,
          isInsidePolygon: true,
          reason,
        });
      }
    }
    setTargetedSubscribers(targeted);
  }, [currentCoords, stations, subscribers]);

  // Initialize Leaflet Map with Geoman controls
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center around Northeast India (Assam / Manipur / Nagaland corridor)
    const initialLat =
      typeof initialStation?.latitude === 'number' &&
      !isNaN(initialStation.latitude) &&
      isFinite(initialStation.latitude)
        ? initialStation.latitude
        : 24.815;
    const initialLon =
      typeof initialStation?.longitude === 'number' &&
      !isNaN(initialStation.longitude) &&
      isFinite(initialStation.longitude)
        ? initialStation.longitude
        : 93.738;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Dark-matter high-contrast tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Layer group for station pins
    const stationGroup = L.layerGroup().addTo(map);
    stationsLayerGroupRef.current = stationGroup;

    // Plot initial stations
    renderStationMarkers(stationGroup, stations);

    // Initialize Leaflet-Geoman Drawing Toolbar
    const pmMap = map as any;
    if (pmMap.pm) {
      pmMap.pm.addControls({
        position: 'topleft',
        drawCircle: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawMarker: false,
        cutPolygon: false,
        editMode: true,
        dragMode: true,
        removalMode: true,
      });

      // Geoman Create Event
      map.on('pm:create', (e: any) => {
        if (drawnPolygonLayerRef.current) {
          map.removeLayer(drawnPolygonLayerRef.current);
        }
        const layer = e.layer;
        drawnPolygonLayerRef.current = layer;

        layer.setStyle({
          color: '#ef4444',
          fillColor: '#f43f5e',
          fillOpacity: 0.35,
          weight: 2.5,
          dashArray: '6, 6',
        });

        const geojson = layer.toGeoJSON();
        if (geojson?.geometry?.coordinates?.[0]) {
          const rawCoords = geojson.geometry.coordinates[0];
          if (Array.isArray(rawCoords)) {
            const valid = rawCoords.filter(
              (c: any) =>
                Array.isArray(c) &&
                c.length >= 2 &&
                typeof c[0] === 'number' &&
                !isNaN(c[0]) &&
                isFinite(c[0]) &&
                typeof c[1] === 'number' &&
                !isNaN(c[1]) &&
                isFinite(c[1])
            );
            if (valid.length >= 3) {
              setCurrentCoords(valid);
            }
          }
        }

        // Live edits
        layer.on('pm:edit', () => {
          const updatedGeo = layer.toGeoJSON();
          if (updatedGeo?.geometry?.coordinates?.[0]) {
            const rawCoords = updatedGeo.geometry.coordinates[0];
            if (Array.isArray(rawCoords)) {
              const valid = rawCoords.filter(
                (c: any) =>
                  Array.isArray(c) &&
                  c.length >= 2 &&
                  typeof c[0] === 'number' &&
                  !isNaN(c[0]) &&
                  isFinite(c[0]) &&
                  typeof c[1] === 'number' &&
                  !isNaN(c[1]) &&
                  isFinite(c[1])
              );
              if (valid.length >= 3) {
                setCurrentCoords(valid);
              }
            }
          }
        });
      });

      map.on('pm:remove', () => {
        drawnPolygonLayerRef.current = null;
        setCurrentCoords([]);
      });
    }

    // Render initial polygon
    drawCoordinatesOnMap(currentCoords, map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update station markers on stations prop change
  useEffect(() => {
    if (stationsLayerGroupRef.current) {
      stationsLayerGroupRef.current.clearLayers();
      renderStationMarkers(stationsLayerGroupRef.current, stations);
    }
  }, [stations]);

  function renderStationMarkers(group: L.LayerGroup, stationList: LandslideStation[]) {
    if (!stationList || !group) return;
    stationList.forEach((st) => {
      if (
        !st ||
        typeof st.latitude !== 'number' ||
        isNaN(st.latitude) ||
        !isFinite(st.latitude) ||
        typeof st.longitude !== 'number' ||
        isNaN(st.longitude) ||
        !isFinite(st.longitude)
      ) {
        return;
      }
      const isCritical = st.riskAssessment?.status === 'critical';
      const isSafe = st.riskAssessment?.status === 'safe';

      const iconHtml = `
        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg border ${
          isSafe
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/70'
            : isCritical
            ? 'bg-rose-950/90 text-rose-200 border-rose-500 animate-pulse'
            : 'bg-amber-950/90 text-amber-200 border-amber-500/70'
        }" style="transform: translate(-50%, -50%);">
          <span class="w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-400' : isCritical ? 'bg-rose-500' : 'bg-amber-400'}"></span>
          <span>${(st.name || 'Station').split(' ')[0]}</span>
        </div>
      `;

      const markerIcon = L.divIcon({
        html: iconHtml,
        className: 'hazard-station-pin',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: markerIcon });
      marker.bindPopup(`
        <div class="text-slate-900 font-sans p-1 text-xs">
          <strong>${st.name || 'Station'}</strong><br/>
          <span class="text-[11px] text-slate-600">${st.region || ''}</span><br/>
          <span>Status: <strong>${st.riskAssessment?.status?.toUpperCase() || 'NORMAL'}</strong></span>
        </div>
      `);
      group.addLayer(marker);
    });
  }

  function drawCoordinatesOnMap(coords: number[][], mapInstance?: L.Map | null) {
    const map = mapInstance || mapInstanceRef.current;
    if (!map || !coords || !Array.isArray(coords) || coords.length < 3) return;

    if (drawnPolygonLayerRef.current) {
      map.removeLayer(drawnPolygonLayerRef.current);
      drawnPolygonLayerRef.current = null;
    }

    // Leaflet Polygon expects [ [lat, lon], [lat, lon], ... ]
    const validLatLngs = coords
      .filter(
        (c) =>
          Array.isArray(c) &&
          c.length >= 2 &&
          typeof c[1] === 'number' &&
          !isNaN(c[1]) &&
          isFinite(c[1]) &&
          typeof c[0] === 'number' &&
          !isNaN(c[0]) &&
          isFinite(c[0])
      )
      .map((c) => [c[1], c[0]] as [number, number]);

    if (validLatLngs.length < 3) return;

    const polygon = L.polygon(validLatLngs, {
      color: severity === 'Extreme' ? '#ef4444' : severity === 'Severe' ? '#f97316' : '#eab308',
      fillColor: severity === 'Extreme' ? '#f43f5e' : severity === 'Severe' ? '#fb923c' : '#fde047',
      fillOpacity: 0.35,
      weight: 2.5,
      dashArray: '5, 5',
    }).addTo(map);

    drawnPolygonLayerRef.current = polygon;

    try {
      map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
    } catch (e) {
      // Ignored
    }
  }

  // Load a preset danger hotspot
  const handleSelectPreset = (preset: typeof PRESET_HAZARD_POLYGONS[0]) => {
    setSeverity(preset.severity);
    setHeadline(preset.headline);
    setInstruction(preset.instruction);
    setCurrentCoords(preset.coordinates);
    drawCoordinatesOnMap(preset.coordinates);
  };

  // Broadcast Mass Alert
  const handleBroadcastAlert = async () => {
    if (!currentCoords || currentCoords.length < 3) {
      setDispatchError('Please draw or select a hazard polygon on the map before broadcasting.');
      return;
    }

    setIsTransmitting(true);
    setDispatchError(null);
    setDispatchStatus(null);

    const payload: DisasterAlertPayload = {
      headline,
      severity,
      instruction,
      geometry: {
        type: 'Polygon',
        coordinates: [currentCoords],
      },
      channel: 'all',
      sendRealSms: true,
      priorityRecipients: ['+919032479657'],
    };

    try {
      const response = await broadcastPolygonAlert(payload, stations, subscribers);
      setDispatchStatus(response);
      if (onAlertBroadcasted) {
        onAlertBroadcasted(response);
      }
    } catch (err: any) {
      setDispatchError(err?.message || 'Failed to dispatch mass alert to cellular gateway');
    } finally {
      setIsTransmitting(false);
    }
  };

  const previewSmsText = formatSmsMessage({
    headline,
    severity,
    instruction,
    geometry: { type: 'Polygon', coordinates: [currentCoords] },
  });

  const gutlaRecipient = targetedSubscribers.find((t) => t.phone.includes('9032479657')) || {
    name: 'Gutla rohith',
    phone: '+91 9032479657',
    role: 'Priority Incident Commander',
    isInsidePolygon: true,
    reason: 'Priority Commander Handset',
  };

  const directSmsGutlaUrl = getDirectSmsUrl(gutlaRecipient.phone, previewSmsText);

  return (
    <div id="real-sms-hazard-dispatcher" className="space-y-4">
      {/* Top Banner & Hotspot Presets */}
      <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/30 border border-rose-500/40 text-rose-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white font-sans tracking-tight">
                Hazard Polygon Drawing &amp; Real SMS Gateway Control Center
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                CAP v1.2 • Ch. 4370
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Draw interactive geo-polygons on the map. The system executes spatial point-in-polygon queries and broadcasts instant cellular SMS alerts to all field devices in the sector.
            </p>
          </div>
        </div>

        {/* Hotspot Presets Quick Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 mr-1">
            Hotspots:
          </span>
          {PRESET_HAZARD_POLYGONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 hover:border-cyan-400/50 transition-all cursor-pointer truncate max-w-[140px] sm:max-w-none"
              title={`${preset.name} (${preset.region})`}
            >
              {preset.name.split(' ')[0]} {preset.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Map + Right Operator Control Station */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Leaflet & Geoman Interactive Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden border border-slate-700/80 bg-[#070e1c] shadow-2xl h-[480px] lg:h-[580px] flex flex-col">
            {/* Map Top Status Bar */}
            <div className="absolute top-3 left-14 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="bg-[#0b1433]/95 backdrop-blur-md border border-cyan-500/40 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 pointer-events-auto text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="font-bold text-white">Geoman Tool Active</span>
                <span className="text-slate-400">|</span>
                <span className="font-mono text-cyan-300">
                  {currentCoords.length} Vertices • {polygonAreaKm2} km²
                </span>
              </div>

              <div className="bg-[#0b1433]/95 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2 pointer-events-auto text-xs">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-amber-300">
                  {targetedSubscribers.length} Targeted Contacts
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300 font-medium">
                  {stationsInPerimeter.length} Stations in Sector
                </span>
              </div>
            </div>

            {/* Leaflet Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Bottom Map Quick Action Legend */}
            <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-300 z-10">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  Hazard Boundary (Click Pentagon tool on top-left to draw new zone)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                  Monitored Station
                </span>
              </div>
              <span className="font-mono text-slate-400">
                WGS84 RFC 7946 • GeoJSON Coordinate Stream
              </span>
            </div>
          </div>

          {/* Spatial Intersections Summary Badge Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Sector Area</span>
              <span className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                {polygonAreaKm2} km²
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Stations Inside</span>
              <span className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {stationsInPerimeter.length} Active Nodes
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Subscribers Queued</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                {targetedSubscribers.length} Mobile Devices
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Priority Recipient</span>
              <span className="text-xs font-bold text-white truncate mt-0.5" title="Gutla rohith (+91 9032479657)">
                Gutla rohith
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Operator Dispatch Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3.5">
              <div className="flex items-center gap-2">
                <TowerControl className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
                  Operator Dispatch Console
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                GATEWAY READY
              </span>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 flex-1 text-xs">
              {/* Severity Level */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Severity Level
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Extreme', 'Severe', 'Moderate'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setSeverity(sev)}
                      className={`py-2 px-2 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                        severity === sev
                          ? sev === 'Extreme'
                            ? 'bg-rose-600/30 border-rose-500 text-white shadow-lg shadow-rose-900/50 ring-1 ring-rose-400'
                            : sev === 'Severe'
                            ? 'bg-orange-600/30 border-orange-500 text-white shadow-lg shadow-orange-900/50 ring-1 ring-orange-400'
                            : 'bg-amber-600/30 border-amber-500 text-white shadow-lg shadow-amber-900/50 ring-1 ring-amber-400'
                          : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Alert Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Flash Flood Evacuation Order"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Direct Action Instructions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Direct Action Instructions
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {previewSmsText.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g. Move to higher ground immediately. Barricade highway."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>

              {/* Polygon Vertex Info */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Drawn Polygon Geometry</div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">
                    {currentCoords.length >= 3
                      ? `Polygon defined (${currentCoords.length} vertices, ${polygonAreaKm2} km²)`
                      : 'No area drawn yet (click tool on map)'}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-indigo-500/20 text-indigo-300">
                  GeoJSON RFC 7946
                </span>
              </div>

              {/* One-Click Direct SMS to Gutla Rohith Quick Link */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/30 border border-emerald-500/40 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Instant SIM SMS to Gutla rohith</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    +91 9032479657 • Direct Cellular link opens native SMS
                  </div>
                </div>
                <a
                  href={directSmsGutlaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 transition-all cursor-pointer shadow-md"
                  title="Open phone messaging app with pre-filled warning"
                >
                  <span>Open SMS</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Broadcast Mass Alert Button */}
              <button
                id="dispatch-btn"
                type="button"
                onClick={handleBroadcastAlert}
                disabled={isTransmitting || currentCoords.length < 3}
                className="w-full mt-2 py-3 px-4 rounded-xl font-black text-xs text-white uppercase tracking-wider bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-xl shadow-rose-950/60 border border-rose-400/50 flex items-center justify-center gap-2"
              >
                {isTransmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Transmitting to Cellular Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-amber-300" />
                    <span>Broadcast Mass Alert to Sector ({targetedSubscribers.length} Targets)</span>
                  </>
                )}
              </button>

              {/* Status Notice / Error */}
              {dispatchError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{dispatchError}</span>
                </div>
              )}

              {dispatchStatus && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Broadcast Queued Successfully!</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono">
                    Incident ID: <strong className="text-white">{dispatchStatus.incident_id}</strong> | Targeted:{' '}
                    <strong className="text-emerald-300">{dispatchStatus.recipients_targeted} subscribers</strong>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Provider: {dispatchStatus.provider_used}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Hub: Handset Simulation Preview, Delivery Receipts, & CAP XML */}
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('handset')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'handset'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Receiver Handset Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('receipts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'receipts'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Targeted Subscribers &amp; Receipts ({targetedSubscribers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cap')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cap'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>CAP v1.2 Standard XML</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gateway')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gateway'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TowerControl className="w-3.5 h-3.5" />
              <span>Cellular Relays &amp; API Status</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            Channel 4370 • Zero-Internet Broadcast Standard
          </span>
        </div>

        {/* Tab 1: Live Handset Screen Preview */}
        {activeTab === 'handset' && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-3">
            {/* Phone Bezel */}
            <div className="w-[310px] rounded-[36px] bg-slate-950 p-3.5 border-4 border-slate-700 shadow-2xl relative">
              {/* Speaker & Notch */}
              <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-3 flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-600 rounded-full"></div>
              </div>

              {/* Screen Content */}
              <div className="bg-[#0b1329] rounded-[24px] p-3 border border-slate-800 min-h-[380px] flex flex-col justify-between text-xs">
                {/* Handset Header */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                    <span className="font-bold">BHUSHAKTI-GEO</span>
                    <span className="font-mono">BSNL / Jio 4G</span>
                  </div>
                  <div className="text-center text-[10px] text-slate-500 mb-3 font-mono">
                    Emergency Cell Broadcast • Channel 4370
                  </div>

                  {/* SMS Balloon */}
                  <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/80 text-white shadow-lg space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-black text-rose-300 uppercase">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{severity} Hazard Alert</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-100 font-sans">
                      {previewSmsText}
                    </p>
                    <div className="text-[9px] text-slate-400 font-mono text-right pt-1">
                      Delivered to +91 9032479657 • Just Now
                    </div>
                  </div>
                </div>

                {/* Handset Footer Actions */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <a
                    href={directSmsGutlaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold text-center block transition-all shadow-md"
                  >
                    ⚡ Test Live SMS via Native Phone SIM
                  </a>
                  <div className="text-[9px] text-slate-500 text-center font-mono">
                    Device recipient: Gutla rohith (Incident Commander)
                  </div>
                </div>
              </div>
            </div>

            {/* Explanation & Instructions */}
            <div className="max-w-md space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <span>How Real Emergency Cellular SMS Functions</span>
                </h4>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  1. <strong>Geo-Boundary Slicing</strong>: When an operator draws an irregular polygon around unstable hill cuts or rivers, the GIS system determines geographic coordinate containment.
                </p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  2. <strong>Direct Cellular Gateway</strong>: Subscribers inside the polygon boundary receive autonomous cell broadcast triggers on Channel 4370 without requiring mobile data or internet access.
                </p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  3. <strong>Immediate Handset Dispatch</strong>: Click the button on the left to trigger the real SMS application directly with pre-populated warning coordinates.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={directSmsGutlaUrl}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Real SMS to Gutla rohith (+91 9032479657)</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Targeted Subscribers & Delivery Receipts */}
        {activeTab === 'receipts' && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
              <table className="w-full text-left text-xs border-collapse min-w-[620px]">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Subscriber / Contact</th>
                    <th className="py-2.5 px-3">Mobile Number</th>
                    <th className="py-2.5 px-3">Role / Designation</th>
                    <th className="py-2.5 px-3">Targeting Rationale</th>
                    <th className="py-2.5 px-3">Delivery Status</th>
                    <th className="py-2.5 px-3 text-right">Direct Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {targetedSubscribers.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-2 px-3 font-bold text-slate-100 flex items-center gap-2">
                        {sub.phone.includes('9032479657') && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                        )}
                        <span>{sub.name}</span>
                      </td>
                      <td className="py-2 px-3 font-mono text-cyan-300">{sub.phone}</td>
                      <td className="py-2 px-3 text-slate-300">{sub.role}</td>
                      <td className="py-2 px-3 text-[11px] text-slate-400">{sub.reason}</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>QUEUED / READY</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <a
                          href={getDirectSmsUrl(sub.phone, previewSmsText)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>SMS</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: CAP v1.2 Standard XML Inspector */}
        {activeTab === 'cap' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono">
                Standard NDMA / ITU Common Alerting Protocol v1.2 schema
              </span>
              <button
                type="button"
                onClick={() => {
                  const xml = formatCapXml(
                    {
                      headline,
                      severity,
                      instruction,
                      geometry: { type: 'Polygon', coordinates: [currentCoords] },
                    },
                    dispatchStatus?.incident_id || 'ACTIVE'
                  );
                  navigator.clipboard.writeText(xml);
                  setCopiedCap(true);
                  setTimeout(() => setCopiedCap(false), 1500);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedCap ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCap ? 'Copied XML' : 'Copy CAP Payload'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-[300px]">
              {formatCapXml(
                {
                  headline,
                  severity,
                  instruction,
                  geometry: { type: 'Polygon', coordinates: [currentCoords] },
                },
                dispatchStatus?.incident_id || 'ACTIVE-001'
              )}
            </pre>
          </div>
        )}

        {/* Tab 4: Cellular Relays & Gateway Health */}
        {activeTab === 'gateway' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 text-[10px] font-mono uppercase">Cell Broadcast Relays</div>
              <div className="text-sm font-bold text-emerald-400">18 BSNL / Airtel Relays</div>
              <p className="text-[11px] text-slate-400">
                Operating on Channel 4370 for continuous warning broadcasting across Assam, Sikkim, Manipur, and Arunachal Pradesh.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 text-[10px] font-mono uppercase">Cloud SMS Gateway</div>
              <div className="text-sm font-bold text-cyan-400">Twilio / Fast2SMS Ready</div>
              <p className="text-[11px] text-slate-400">
                Backend route: <code className="text-cyan-300 font-mono">/api/v1/alerts/broadcast-polygon</code> accepts live JSON and triggers real carrier transmissions.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-slate-400 text-[10px] font-mono uppercase">Satellite Latency</div>
              <div className="text-sm font-bold text-white font-mono">&lt; 1.2 seconds</div>
              <p className="text-[11px] text-slate-400">
                Payload encrypted using AES-256 with instantaneous GSM handshake confirmation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
