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
      <div className="clay-panel p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-[4px_6px_12px_rgba(245,158,11,0.35)] border-t border-white/40">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700">
                Geological Archive
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                12 MAJOR EVENTS CATALOGED
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 font-sans">
              Historical Disasters &amp; Landslide Archive
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified historical Northeast landslide, GLOF, and flash flood events for training PINN risk weights.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical events..."
              className="clay-input w-full pl-10 pr-3 py-2 text-xs"
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
            className={
              selectedState === st
                ? 'clay-tab-active px-3 py-1.5 text-xs font-bold whitespace-nowrap'
                : 'clay-tab px-3 py-1.5 text-xs font-bold whitespace-nowrap text-slate-600'
            }
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
            className="clay-card p-5 hover:translate-y-[-2px] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-amber-700 uppercase px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                  {item.category}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Year {item.year}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-1">{item.eventTitle}</h3>
              <p className="text-xs text-blue-600 font-semibold flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                <span>{item.location}, {item.state}</span>
              </p>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {item.impactDescription}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate"><strong>Trigger:</strong> {item.geotechnicalTrigger}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate"><strong>Impact:</strong> {item.fatalitiesText}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
