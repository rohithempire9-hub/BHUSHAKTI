import React, { useState } from 'react';
import { NORTHEAST_NATURAL_DISASTERS } from '../../data/northeastDisasters';
import {
  Clock,
  Search,
  Filter,
  MapPin,
  Calendar,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export const HistoricalPageView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');

  const states = ['ALL', 'Assam', 'Sikkim', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Arunachal Pradesh'];

  const filtered = NORTHEAST_NATURAL_DISASTERS.filter((d) => {
    const matchesSearch =
      d.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.impactDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.geotechnicalTrigger.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'ALL' || d.state.includes(selectedState);
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-[#0b1738] border border-[#1b3470] p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Geological Archive
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                12 MAJOR EVENTS CATALOGED
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Historical Disasters &amp; Landslide Archive
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Verified historical Northeast landslide, GLOF, and flash flood events for training PINN risk weights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical events..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#071129] border border-[#18316c] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      </div>

      {/* State Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {states.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedState(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedState === st
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400'
                : 'bg-[#0a1738] text-slate-300 hover:text-white hover:bg-[#102454] border border-[#162e66]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Disasters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl bg-[#0a1738] border border-[#162e66] hover:border-amber-500/50 p-5 shadow-2xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-amber-300 uppercase px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Year {item.year}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-1">{item.eventTitle}</h3>
              <p className="text-xs text-cyan-300 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                <span>{item.location}, {item.state}</span>
              </p>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {item.impactDescription}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#18316c] space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate"><strong>Trigger:</strong> {item.geotechnicalTrigger}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate"><strong>Impact:</strong> {item.fatalitiesText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
