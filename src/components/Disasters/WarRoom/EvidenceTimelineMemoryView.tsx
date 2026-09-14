import React, { useState } from 'react';
import {
  Clock,
  Database,
  History,
  GitCompare,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ArrowRight,
  Search,
  ExternalLink
} from 'lucide-react';
import {
  EVIDENCE_TIMELINE_EVENTS,
  DISASTER_DIGITAL_MEMORY_PROFILE,
  compareIncidents
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const EvidenceTimelineMemoryView: React.FC = () => {
  const [timeline] = useState(() => EVIDENCE_TIMELINE_EVENTS);
  const [memoryProfile] = useState(() => DISASTER_DIGITAL_MEMORY_PROFILE);
  const [comparison] = useState(() => compareIncidents());
  const [selectedEvent, setSelectedEvent] = useState(memoryProfile.historicalEvents[0]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              FEATURE 24 • EVENT EVIDENCE TIMELINE
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
              FEATURE 25 • DISASTER DIGITAL MEMORY
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
              FEATURE 26 • HISTORICAL ANALOG COMPARISON
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Chronological Evidence Chain & National Disaster Memory
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Reconstructs the second-by-second progression of sensor events while matching current geotechnical signatures against India's most devastating historical landslide disasters.
          </p>
        </div>

        {/* Analogy Match Badge */}
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-amber-500/30 text-xs shrink-0 text-right">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Closest Historical Analogue</div>
          <div className="text-lg font-mono font-black text-amber-400 mt-0.5">
            {comparison.eventA.name}
          </div>
          <div className="text-[10px] text-cyan-300 font-bold">
            {comparison.similarityScorePct}% Geological Fingerprint Match
          </div>
        </div>
      </div>

      {/* Feature 24: Event Evidence Timeline (08:00 to 13:25) */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Event Evidence Chain (Chronological Black Box)</span>
          </h3>
          <span className="text-[10px] font-mono text-cyan-300">
            {timeline.length} Verifiable Telemetry Milestones Logged
          </span>
        </div>

        <div className="relative pl-6 border-l-2 border-cyan-500/30 space-y-4 text-xs">
          {timeline.map((entry) => (
            <div key={entry.id} className="relative group">
              {/* Timeline Pin */}
              <div
                className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 ${
                  entry.severity === 'emergency'
                    ? 'bg-rose-500 border-rose-300'
                    : 'bg-cyan-500 border-cyan-300'
                }`}
              />

              <div className="p-3 rounded-xl bg-[#050e24] border border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300 text-xs">{entry.timestamp}</span>
                    <span className="text-white font-bold">{entry.headline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400">Category: {entry.category}</span>
                    <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {entry.sourceConfidencePct}% Conf
                    </span>
                  </div>
                </div>

                <div className="text-slate-300 text-[11px] mb-2 leading-relaxed">{entry.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 25 & 26: Disaster Digital Memory & Analog Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Disaster Memory Archive (Feature 25) */}
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>National Disaster Digital Memory Archive</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Indexed Historical Events</span>
          </div>

          <div className="space-y-2">
            {memoryProfile.historicalEvents.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedEvent(item)}
                className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedEvent.year === item.year
                    ? 'bg-[#0f214a] border-purple-400 ring-1 ring-purple-400'
                    : 'bg-[#050e24] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{item.eventName}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{item.year}</span>
                </div>
                <div className="text-[11px] text-slate-300 line-clamp-1">{item.impactDescription}</div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                  <span>Rainfall: <strong className="text-cyan-300">{item.rainfallMm} mm</strong></span>
                  <span className="text-rose-400 font-bold">{item.fatalities} Fatalities ({item.roadCutDays}d Blockage)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Analog Comparison (Feature 26) */}
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitCompare className="w-4 h-4 text-amber-400" />
              <span>Historical Similarity Breakdown: {comparison.eventA.name}</span>
            </h3>
            <span className="text-xs font-mono font-bold text-amber-400">{comparison.similarityScorePct}% Match</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {comparison.lessonsLearned}
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-200">Rainfall Precipitation</span>
                <span className="font-mono text-cyan-300 font-bold">89% Match</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Current Event: <strong className="text-white">{comparison.eventB.rainfallMm} mm</strong></span>
                <span>Historical: <strong className="text-amber-300">{comparison.eventA.rainfallMm} mm</strong></span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-200">Soil Moisture Saturation</span>
                <span className="font-mono text-cyan-300 font-bold">94% Match</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Current Event: <strong className="text-white">{comparison.eventB.soilMoisturePct}%</strong></span>
                <span>Historical: <strong className="text-amber-300">{comparison.eventA.soilMoisturePct}%</strong></span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a183d] border border-amber-500/30 text-[11px] text-amber-200">
            <strong>Command Takeaway:</strong> Avoid staging evacuation centers in tributary runout paths. Evacuate civilians perpendicular to the slope line onto designated granite ridges.
          </div>
        </div>
      </div>
    </div>
  );
};
