import React, { useState } from 'react';
import { NORTHEAST_NATURAL_DISASTERS } from '../../data/northeastDisasters';
import { NaturalDisasterRecord } from '../../types/landslide';
import {
  History,
  X,
  Search,
  Filter,
  AlertTriangle,
  Flame,
  Skull,
  Activity,
  Layers,
  MapPin,
  Calendar,
  ExternalLink
} from 'lucide-react';

interface NaturalDisastersModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStationName?: string;
}

export const NaturalDisastersModal: React.FC<NaturalDisastersModalProps> = ({
  isOpen,
  onClose,
  selectedStationName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const states = ['ALL', 'Assam', 'Sikkim', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Arunachal Pradesh'];
  const categories = [
    'ALL',
    'Major Landslide',
    'GLOF & Debris Surge',
    'Earthquake & Liquefaction',
    'Monsoon Cloudburst',
    'Riverbank Collapse',
  ];

  const filteredDisasters = NORTHEAST_NATURAL_DISASTERS.filter((d) => {
    const matchesSearch =
      d.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.impactDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.geotechnicalTrigger.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === 'ALL' || d.state.includes(selectedState);
    const matchesCategory = selectedCategory === 'ALL' || d.category === selectedCategory;

    return matchesSearch && matchesState && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <History className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Northeast India Geological Disaster & Landslide Historical Archive
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {NORTHEAST_NATURAL_DISASTERS.length} Historical Records
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Official geotechnical survey of past slope failures, GLOFs, earthquakes, and flood catastrophes across the 8 Northeastern states.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical disasters, triggers..."
              className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Disaster Records Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {filteredDisasters.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No historical disaster records match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDisasters.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 p-4 rounded-xl shadow-lg flex flex-col justify-between transition-all space-y-3"
                >
                  <div>
                    {/* Badge header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {item.year}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          item.severityLevel === 'Catastrophic'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        }`}
                      >
                        {item.severityLevel}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white">{item.eventTitle}</h3>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>{item.location} ({item.state})</span>
                    </div>

                    {/* Fatalities banner */}
                    <div className="mt-2.5 p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                      <Skull className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{item.fatalitiesText}</span>
                    </div>

                    {/* Impact description */}
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                      {item.impactDescription}
                    </p>
                  </div>

                  {/* Geotechnical trigger */}
                  <div className="p-2.5 bg-slate-900/90 border border-slate-800 rounded-lg text-[11px] text-slate-400">
                    <span className="text-indigo-400 font-bold block mb-0.5">
                      Geotechnical Trigger & Soil Mechanics:
                    </span>
                    {item.geotechnicalTrigger}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
