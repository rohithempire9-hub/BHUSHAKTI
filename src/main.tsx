import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import L from 'leaflet';
import App from './App.tsx';
import './index.css';

// Ensure L is globally available for Leaflet plugins
if (typeof window !== 'undefined') {
  (window as any).L = L;

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
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
