import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import L from 'leaflet';
import App from './App.tsx';
import './index.css';
import './leaflet-fixes.css';

// Ensure L is globally available for Leaflet plugins and expose the active map
// so small production compatibility actions can work without coupling App.tsx
// to Leaflet internals.
if (typeof window !== 'undefined') {
  (window as any).L = L;

  const originalMapFactory = (L as any).__bhushaktiOriginalMapFactory || L.map;
  if (!(L as any).__bhushaktiMapFactoryPatched) {
    (L as any).__bhushaktiOriginalMapFactory = originalMapFactory;
    (L as any).map = function (...args: any[]) {
      const map = originalMapFactory.apply(this, args);
      (window as any).__bhushaktiMap = map;
      return map;
    };
    (L as any).__bhushaktiMapFactoryPatched = true;
  }

  // Universal Leaflet LatLng resilience: Prevent any "Invalid LatLng object: (NaN, NaN)" crash
  if (!(L as any).__bhushaktiLatLngPatched && L.LatLng) {
    const OriginalLatLng = L.LatLng;
    (L as any).__bhushaktiOriginalLatLng = OriginalLatLng;

    const SafeLatLng: any = function (this: any, lat: any, lng: any, alt?: any) {
      let safeLat = typeof lat === 'number' ? lat : Number(lat);
      let safeLng = typeof lng === 'number' ? lng : Number(lng);

      if (isNaN(safeLat) || !isFinite(safeLat) || isNaN(safeLng) || !isFinite(safeLng)) {
        // Fall back to central Northeast India regional coordinate
        safeLat = 26.1584;
        safeLng = 92.9376;
      }

      const instance = Object.create(OriginalLatLng.prototype);
      OriginalLatLng.call(instance, safeLat, safeLng, alt);
      return instance;
    };
    SafeLatLng.prototype = OriginalLatLng.prototype;
    (L as any).LatLng = SafeLatLng;

    const originalToLatLng = (L as any).latLng;
    (L as any).latLng = function (a: any, b?: any, c?: any) {
      try {
        if (Array.isArray(a)) {
          const lat = Number(a[0]);
          const lng = Number(a[1]);
          if (isNaN(lat) || !isFinite(lat) || isNaN(lng) || !isFinite(lng)) {
            return new SafeLatLng(26.1584, 92.9376);
          }
        } else if (a && typeof a === 'object' && ('lat' in a || 'latitude' in a)) {
          const lat = Number(a.lat ?? a.latitude);
          const lng = Number(a.lng ?? a.lon ?? a.longitude);
          if (isNaN(lat) || !isFinite(lat) || isNaN(lng) || !isFinite(lng)) {
            return new SafeLatLng(26.1584, 92.9376);
          }
        }
        return originalToLatLng.apply(this, arguments as any);
      } catch {
        return new SafeLatLng(26.1584, 92.9376);
      }
    };

    (L as any).__bhushaktiLatLngPatched = true;
  }

  // Protect against zero-dimension canvas getImageData crashes (e.g. in leaflet.heat or dynamic layouts)
  if (typeof CanvasRenderingContext2D !== 'undefined') {
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (sx: number, sy: number, sw: number, sh: number, ...rest: any[]) {
      if (sw <= 0 || sh <= 0) {
        const safeWidth = Math.max(1, Math.abs(sw || 1));
        const safeHeight = Math.max(1, Math.abs(sh || 1));
        try {
          return this.createImageData(safeWidth, safeHeight);
        } catch {
          return originalGetImageData.call(this, 0, 0, safeWidth, safeHeight, ...rest);
        }
      }
      return originalGetImageData.call(this, sx, sy, sw, sh, ...rest);
    };
  }

  // -------------------------------------------------------------------------
  // Production map compatibility bridge
  // -------------------------------------------------------------------------
  // The existing map component already owns its normal React controls. These
  // listeners only provide two missing browser-side actions without changing
  // the existing dashboard design:
  //   1) Current Location -> browser geolocation
  //   2) Flood -> a clearly visualized scenario overlay
  // The flood overlay is a DEMO visualization, not a live flood forecast.
  let floodLayer: L.LayerGroup | null = null;
  let locationLayer: L.LayerGroup | null = null;

  const getMap = () => (window as any).__bhushaktiMap as L.Map | undefined;

  const ensureFloodLayer = (map: L.Map) => {
    if (!floodLayer) {
      floodLayer = L.layerGroup();

      // Indicative river/flood-prone corridor polygons for Northeast India.
      // These are intentionally labeled as DEMO scenario areas in the popup.
      const zones: Array<{ name: string; coords: L.LatLngExpression[] }> = [
        {
          name: 'Brahmaputra Flood Scenario',
          coords: [[27.2, 89.7], [27.7, 92.2], [27.2, 95.2], [26.4, 95.0], [26.5, 91.8], [26.7, 89.9]],
        },
        {
          name: 'Barak Valley Flood Scenario',
          coords: [[24.5, 92.0], [24.9, 92.8], [24.7, 93.5], [24.0, 93.3], [23.9, 92.5]],
        },
        {
          name: 'Tripura Lowland Flood Scenario',
          coords: [[23.7, 91.1], [24.2, 91.5], [24.0, 92.1], [23.2, 92.2], [22.9, 91.5]],
        },
      ];

      zones.forEach((zone) => {
        const polygon = L.polygon(zone.coords, {
          color: '#22d3ee',
          weight: 2,
          fillColor: '#06b6d4',
          fillOpacity: 0.18,
          dashArray: '7, 5',
        });
        polygon.bindPopup(`
          <div style="font-family:system-ui;color:#0f172a;font-size:12px;min-width:180px">
            <strong>${zone.name}</strong>
            <div style="margin-top:4px;color:#475569">BhuShakti flood-risk scenario visualization.</div>
            <div style="margin-top:4px;color:#0891b2;font-weight:700">DEMO • not a live flood forecast</div>
          </div>
        `);
        floodLayer!.addLayer(polygon);
      });
    }

    floodLayer.addTo(map);
  };

  const removeFloodLayer = (map: L.Map) => {
    if (floodLayer && map.hasLayer(floodLayer)) {
      map.removeLayer(floodLayer);
    }
  };

  const showBrowserLocation = () => {
    const map = getMap();
    if (!map || !navigator.geolocation) {
      window.alert('Browser location is not available on this device.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude);
        const lng = Number(position.coords.longitude);
        if (isNaN(lat) || !isFinite(lat) || isNaN(lng) || !isFinite(lng)) {
          console.warn('[BhuShakti] Browser geolocation returned invalid coordinates:', position);
          return;
        }
        const accuracy = Math.max(position.coords.accuracy || 50, 25);

        if (!locationLayer) locationLayer = L.layerGroup().addTo(map);
        locationLayer.clearLayers();

        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          color: '#22d3ee',
          weight: 3,
          fillColor: '#06b6d4',
          fillOpacity: 0.9,
        });
        marker.bindPopup('<strong>Your current browser location</strong>').openPopup();

        const accuracyCircle = L.circle([lat, lng], {
          radius: accuracy,
          color: '#22d3ee',
          weight: 1,
          fillColor: '#06b6d4',
          fillOpacity: 0.08,
        });

        locationLayer.addLayer(accuracyCircle);
        locationLayer.addLayer(marker);
        map.flyTo([lat, lng], 12, { duration: 1.2 });
      },
      (error) => {
        console.warn('[BhuShakti] Browser geolocation failed:', error);
        window.alert('Location permission was denied or the browser could not determine your location.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  };

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest('button');
    if (!button) return;

    const label = button.textContent?.replace(/\s+/g, ' ').trim() || '';
    const map = getMap();
    if (!map) return;

    if (label.includes('Current Location')) {
      window.setTimeout(showBrowserLocation, 0);
    }

    if (label === 'Flood') {
      // Let React update its visual button state first, then mirror it here.
      window.setTimeout(() => {
        const active = button.className.includes('bg-cyan-600');
        if (active) ensureFloodLayer(map);
        else removeFloodLayer(map);
      }, 0);
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
