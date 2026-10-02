import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck, AlertTriangle, Navigation, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export interface SafeRouteData {
  routeId: string;
  sourceName: string;
  sourceCoords: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  waypoints: [number, number][];
  hazardZoneCoords?: [number, number][];
  distanceKm: number;
  estTimeMinutes: number;
  elevationGainM: number;
  safetyScore: number;
  hazardAvoided: string;
  recommendedTransport: string;
}

interface SafeRouteMapCardProps {
  route?: SafeRouteData;
  onOpenFullGis?: (route: SafeRouteData) => void;
}

const DEFAULT_ROUTE: SafeRouteData = {
  routeId: 'route_tawang_shelter_01',
  sourceName: 'Tawang Sela Sector (Active Creep 4.2mm)',
  sourceCoords: [27.5861, 91.8594],
  destinationName: 'Army Helipad Secondary Relief Shelter',
  destinationCoords: [27.602, 91.884],
  waypoints: [
    [27.5861, 91.8594],
    [27.5905, 91.865],
    [27.595, 91.872],
    [27.5985, 91.8775],
    [27.602, 91.884]
  ],
  hazardZoneCoords: [
    [27.584, 91.855],
    [27.589, 91.858],
    [27.592, 91.864],
    [27.587, 91.867],
    [27.582, 91.86]
  ],
  distanceKm: 4.2,
  estTimeMinutes: 28,
  elevationGainM: 95,
  safetyScore: 98,
  hazardAvoided: 'Active Sela Pass Scarp Failure (42° slope)',
  recommendedTransport: 'Light 4x4 / Mountain Walking Path'
};

export const SafeRouteMapCard: React.FC<SafeRouteMapCardProps> = ({
  route = DEFAULT_ROUTE,
  onOpenFullGis
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: true
    });

    // Dark high-contrast GIS satellite tile layer
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18 }
    ).addTo(map);

    // Hazard Exclusion Polygon (Red)
    if (route.hazardZoneCoords && route.hazardZoneCoords.length >= 3) {
      const hazardPoly = L.polygon(route.hazardZoneCoords, {
        color: '#ef4444',
        weight: 2,
        fillColor: '#dc2626',
        fillOpacity: 0.35,
        dashArray: '4, 6'
      }).addTo(map);
      hazardPoly.bindPopup('<b>BLOCKED HAZARD ZONE</b><br/>High Landslide Vulnerability - Avoid!');
    }

    // Safe Route Polyline (Glowing Neon Green/Cyan)
    const routeLineGlow = L.polyline(route.waypoints, {
      color: '#10b981',
      weight: 8,
      opacity: 0.4
    }).addTo(map);

    const routeLine = L.polyline(route.waypoints, {
      color: '#34d399',
      weight: 4,
      opacity: 0.95
    }).addTo(map);

    // Source Marker (Red Dot)
    const sourceIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `<div class="relative flex items-center justify-center">
        <span class="absolute w-6 h-6 rounded-full bg-red-500/40 animate-ping"></span>
        <span class="w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-white shadow-md"></span>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
    L.marker(route.sourceCoords, { icon: sourceIcon })
      .addTo(map)
      .bindPopup(`<b>START:</b> ${route.sourceName}`);

    // Destination Marker (Green Beacon)
    const destIcon = L.divIcon({
      className: 'custom-route-icon',
      html: `<div class="relative flex items-center justify-center">
        <span class="absolute w-7 h-7 rounded-full bg-emerald-500/40 animate-pulse"></span>
        <span class="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-[8px] text-white font-bold">✓</span>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    L.marker(route.destinationCoords, { icon: destIcon })
      .addTo(map)
      .bindPopup(`<b>SAFE DESTINATION:</b> ${route.destinationName}`);

    // Fit map bounds
    const bounds = L.latLngBounds([route.sourceCoords, route.destinationCoords, ...route.waypoints]);
    map.fitBounds(bounds, { padding: [25, 25] });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [route]);

  return (
    <div className="my-3 rounded-2xl bg-slate-900 border border-emerald-500/30 overflow-hidden shadow-2xl text-white">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span>AI Verified Safe Corridor</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                {route.safetyScore}% Safety Index
              </span>
            </div>
            <div className="text-[11px] text-slate-300 truncate max-w-xs">
              {route.sourceName} → {route.destinationName}
            </div>
          </div>
        </div>

        {onOpenFullGis && (
          <button
            type="button"
            onClick={() => onOpenFullGis(route)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer"
          >
            <span>Full Map</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative w-full h-56 bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Legend Overlay */}
        <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded-md bg-slate-900/90 border border-white/10 backdrop-blur-md text-[10px] space-y-0.5 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-emerald-400"></span>
            <span>Recommended Safe Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-red-500"></span>
            <span>Active Hazard / Blocked Slope</span>
          </div>
        </div>

        {/* Distance & Time Badge */}
        <div className="absolute top-2 right-2 z-10 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/40 backdrop-blur-md text-right">
          <div className="text-[12px] font-bold text-emerald-400 font-mono">
            {route.distanceKm} km · ~{route.estTimeMinutes} min
          </div>
          <div className="text-[10px] text-slate-400">
            +{route.elevationGainM}m elevation
          </div>
        </div>
      </div>

      {/* Bottom details card */}
      <div className="p-3 bg-slate-900/95 border-t border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span className="text-slate-400">Avoids:</span>
          <span className="text-red-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 inline" />
            {route.hazardAvoided}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span className="text-slate-400">Recommended Transit:</span>
          <span className="text-cyan-300 font-medium">{route.recommendedTransport}</span>
        </div>
      </div>
    </div>
  );
};
