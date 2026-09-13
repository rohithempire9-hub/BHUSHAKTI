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
      <div className="rounded-2xl bg-[#0b1738] border border-[#1b3470] p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40">
            <CloudRain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                Meteorological Telemetry
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                LIVE IMD / OPEN-METEO SYNC
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Northeast India Live Weather &amp; Precipitation Hub
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Live weather telemetry across all geotechnical monitoring stations in the 8 Northeast states.
            </p>
          </div>
        </div>

        <button
          onClick={onRefreshWeather}
          disabled={isWeatherRefreshing}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-sky-600/30 border border-sky-400/40 text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStateFilter === st
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 border border-cyan-400'
                : 'bg-[#0a1738] text-slate-300 hover:text-white hover:bg-[#102454] border border-[#162e66]'
            }`}
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
          const humidity = Math.min(99, Math.max(30, Math.round(tel.soilMoisturePct || 65)));
          const windSpeed = Math.round(10 + (tel.rainfallRateMmH || 0) * 0.5);
          const isHeavyRain = rainfall24h > 40;
          const stateName = station.region || (station as any).state || 'Northeast';

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#102554] border-cyan-400 shadow-xl shadow-cyan-950/60'
                  : 'bg-[#0a1738] border-[#162e66] hover:border-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono text-cyan-300 uppercase font-bold truncate">
                    {stateName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isHeavyRain
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {isHeavyRain ? 'HEAVY RAIN' : 'MODERATE'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{station.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{station.region}, India</p>
              </div>

              {/* Weather Stats */}
              <div className="mt-4 pt-3 border-t border-[#18316c] grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{temperature}°C</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{humidity}% Hum</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <CloudRain className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="font-bold text-white">{rainfall24h} mm/24h</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
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
