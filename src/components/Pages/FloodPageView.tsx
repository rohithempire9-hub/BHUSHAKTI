import React, { useState } from 'react';
import { LandslideStation } from '../../types/landslide';
import { LandslideMap } from '../Map/LandslideMap';
import {
  Waves,
  Droplets,
  AlertTriangle,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';

interface FloodPageViewProps {
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation: (station: LandslideStation) => void;
  onTriggerMassSos: () => void;
}

const RIVER_BASINS = [
  {
    name: 'Brahmaputra Main Stem (Guwahati - Dibrugarh)',
    state: 'Assam',
    currentLevelM: 50.45,
    dangerLevelM: 49.68,
    status: 'above_danger',
    dischargeCusecs: '2,420,000',
    trend: '+12 cm in 6h',
    vulnerableVillages: 68,
  },
  {
    name: 'Barak River Corridor (Silchar - Karimganj)',
    state: 'Assam',
    currentLevelM: 20.12,
    dangerLevelM: 19.83,
    status: 'above_danger',
    dischargeCusecs: '480,000',
    trend: '+8 cm in 6h',
    vulnerableVillages: 42,
  },
  {
    name: 'Teesta River (Singtam - Melli - Sevoke)',
    state: 'Sikkim / West Bengal',
    currentLevelM: 114.2,
    dangerLevelM: 115.0,
    status: 'warning',
    dischargeCusecs: '310,000',
    trend: '+24 cm in 6h (GLOF watch)',
    vulnerableVillages: 29,
  },
  {
    name: 'Gumti River Valley',
    state: 'Tripura',
    currentLevelM: 22.05,
    dangerLevelM: 21.5,
    status: 'above_danger',
    dischargeCusecs: '195,000',
    trend: '+5 cm in 6h',
    vulnerableVillages: 35,
  },
];

export const FloodPageView: React.FC<FloodPageViewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onTriggerMassSos,
}) => {
  const [selectedBasin, setSelectedBasin] = useState(RIVER_BASINS[0]);

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-[#0b1738] border border-[#1b3470] p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                Hydrological Intelligence
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                3 RIVERS ABOVE DANGER MARK
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Northeast River Basin &amp; Flash Flood Inundation Engine
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Live river telemetry along Brahmaputra, Barak, Teesta, and Subansiri river valleys with GLOF surge modelling.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerMassSos}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 border border-cyan-400/40 text-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Dispatch Inundation Siren</span>
        </button>
      </div>

      {/* River Basin KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {RIVER_BASINS.map((basin) => {
          const isSelected = selectedBasin.name === basin.name;
          const isDanger = basin.status === 'above_danger';

          return (
            <div
              key={basin.name}
              onClick={() => setSelectedBasin(basin)}
              className={`rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#102554] border-cyan-400 shadow-xl shadow-cyan-950/60'
                  : 'bg-[#0a1738] border-[#162e66] hover:border-slate-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono text-cyan-300 uppercase font-bold">{basin.state}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDanger
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {isDanger ? 'ABOVE DANGER' : 'WARNING'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{basin.name}</h3>
              </div>

              <div className="mt-4 pt-3 border-t border-[#18316c] space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Current Water Level:</span>
                  <span className="font-mono font-bold text-white">{basin.currentLevelM} m</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Danger Level Mark:</span>
                  <span className="font-mono text-slate-300">{basin.dangerLevelM} m</span>
                </div>
                <div className="flex justify-between text-cyan-300 font-bold">
                  <span>Trend:</span>
                  <span>{basin.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map with Inundation Focus */}
      <div className="rounded-2xl bg-[#0a1738] border border-[#162e66] p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#162e66]">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              GIS Flood Inundation &amp; Drainage Corridors
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {selectedBasin.name} Focus
          </span>
        </div>

        <div className="h-[620px] rounded-xl overflow-hidden border border-[#18316c]">
          <LandslideMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={onSelectStation}
            filterStatus="ALL"
            onFilterChange={() => {}}
            searchQuery=""
            onSearchChange={() => {}}
            onOpenEvidenceModal={() => {}}
            evidenceList={[]}
            simulatedRiskLevel="high"
          />
        </div>
      </div>
    </div>
  );
};
