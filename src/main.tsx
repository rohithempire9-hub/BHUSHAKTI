import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import L from 'leaflet';
import App from './App.tsx';
import './index.css';

// Ensure L is globally available for Leaflet plugins
if (typeof window !== 'undefined') {
  (window as any).L = L;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
