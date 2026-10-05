import React, { useState } from 'react';
import { LandslideStation } from '../../types/landslide';
import {
  CloudRain,
  RefreshCw,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Sun,
  CloudLightning,
  AlertTriangle,
  CheckCircle2,
  Compass
} from 'lucide-react';

interface WeatherPageViewProps {
  stations: LandslideStation[];
  onRefreshWeather: () => void;
  isWeatherRefreshing: boolean;
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
}

export const WeatherPageView: React.FC<WeatherPageViewProps> = ({
  stations,
  onRefreshWeather,
  isWeatherRefreshing,
  selectedStation,
  onSelectStation,
}) => {
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  const states = ['ALL', 'Arunachal Pradesh', 'Assam', 'Sikkim', 'Meghalaya', 'Mizoram', 'Nagaland', 'Manipur', 'Tripura'];

  const filteredStations = stations.filter((s) =>
    selectedStateFilter === 'ALL'
      ? true
      : s.region === selectedStateFilter || (s as any).state === selectedStateFilter
  );

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto">
      {/* Top Header */}
      <div className="clay-panel p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[4px_6px_12px_rgba(37,99,235,0.3)] border-t border-white/40">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                Meteorological Telemetry
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                LIVE IMD / OPEN-METEO SYNC
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 font-sans">
              Northeast India Live Weather &amp; Precipitation Hub
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live weather telemetry across all geotechnical monitoring stations in the 8 Northeast states.
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshWeather}
          disabled={isWeatherRefreshing}
          className="clay-button-primary px-4 py-2.5 text-xs font-bold gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isWeatherRefreshing ? 'animate-spin' : ''}`} />
          <span>{isWeatherRefreshing ? 'Syncing Radar...' : 'Sync Live Weather'}</span>
        </button>
      </div>

      {/* State Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {states.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStateFilter(st)}
            className={
              selectedStateFilter === st
                ? 'clay-tab-active px-3 py-1.5 text-xs font-bold whitespace-nowrap'
                : 'clay-tab px-3 py-1.5 text-xs font-bold whitespace-nowrap text-slate-600'
            }
          >
            {st}
          </button>
        ))}
      </div>

      {/* Station Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStations.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const tel = station.telemetry || {
            temperatureC: 22,
            soilMoisturePct: 60,
            rainfall24hMm: 24,
            rainfallRateMmH: 5,
          };
          const temperature = tel.temperatureC ?? 22;
          const rainfall24h = tel.rainfall24hMm ?? 0;
          const humidity = Math.round(tel.relativeHumidityPct ?? 0);
          const windSpeed = Number((tel.windSpeedKmh ?? 0).toFixed(1));
          const isHeavyRain = rainfall24h > 40;
          const stateName = station.region || (station as any).state || 'Northeast';

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`p-4 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'clay-card-active ring-2 ring-blue-500/80'
                  : 'clay-card hover:translate-y-[-2px]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-blue-600 uppercase font-bold truncate">
                    {stateName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHeavyRain
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {isHeavyRain ? 'HEAVY RAIN' : 'MODERATE'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-800 leading-snug">{station.name}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{station.region}, India</p>
              </div>

              {/* Weather Stats */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Thermometer className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{temperature}°C</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Droplets className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                  <span>{humidity}% Hum</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-800">{rainfall24h} mm/24h</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-600">
                  <Wind className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>{windSpeed} km/h</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
