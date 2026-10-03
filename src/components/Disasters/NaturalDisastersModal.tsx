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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="clay-modal w-full max-w-5xl overflow-hidden my-6 max-h-[90vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl clay-icon bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)]">
              <History className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                Northeast India Geological Disaster & Landslide Historical Archive
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {NORTHEAST_NATURAL_DISASTERS.length} Historical Records
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Official geotechnical survey of past slope failures, GLOFs, earthquakes, and flood catastrophes across the 8 Northeastern states.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="clay-control w-8 h-8 rounded-xl text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="px-6 py-3 border-b border-slate-200/80 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex items-center w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical disasters, triggers..."
              className="clay-input w-full px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400"
            />
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="clay-control px-2.5 py-1 text-xs"
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
            <span className="text-xs text-slate-500 font-bold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="clay-control px-2.5 py-1 text-xs"
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
            <div className="text-center py-12 text-slate-400">
              No historical disaster records match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDisasters.map((item) => (
                <div
                  key={item.id}
                  className="clay-card-raised p-4 flex flex-col justify-between transition-all space-y-3"
                >
                  <div>
                    {/* Badge header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)]">
                          <Calendar className="w-3 h-3" />
                          {item.year}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.severityLevel === 'Catastrophic'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-orange-100 text-orange-700 border border-orange-200'
                        }`}
                      >
                        {item.severityLevel}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">{item.eventTitle}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{item.location} ({item.state})</span>
                    </div>

                    {/* Fatalities banner */}
                    <div className="mt-2.5 p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                      <Skull className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{item.fatalitiesText}</span>
                    </div>

                    {/* Impact description */}
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                      {item.impactDescription}
                    </p>
                  </div>

                  {/* Geotechnical trigger */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.03)]">
                    <span className="text-indigo-600 font-bold block mb-0.5">
                      Geotechnical Trigger &amp; Soil Mechanics:
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
