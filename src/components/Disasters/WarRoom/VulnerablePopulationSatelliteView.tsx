import React, { useState } from 'react';
import {
  Users,
  Satellite,
  Hospital,
  ShieldAlert,
  Clock,
  ArrowRight,
  Sparkles,
  Send,
  Bus,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import {
  VULNERABLE_POPULATION_ZONES,
  SATELLITE_TASKING_PRIORITY
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const VulnerablePopulationSatelliteView: React.FC = () => {
  const [profiles, setProfiles] = useState(() => VULNERABLE_POPULATION_ZONES);
  const [satellites, setSatellites] = useState(() => SATELLITE_TASKING_PRIORITY);
  const [taskedIds, setTaskedIds] = useState<string[]>([]);

  const handleTaskSatellite = (satId: string) => {
    setTaskedIds((prev) => [...prev, satId]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
              FEATURE 13 • VULNERABLE POPULATION ENGINE
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              FEATURE 14 • SATELLITE RADAR TASKING
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Vulnerable Population Exposure & Satellite Observation Priority
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Answers <em>"Who needs help first?"</em> by scoring elderly, infant, and mobility-impaired demographics against landslide inundation paths, alongside ISRO & ESA radar satellite pass tasking.
          </p>
        </div>

        {/* Evacuation Fleet Stat Badge */}
        <div className="bg-[#05102a] p-3 rounded-xl border border-rose-500/30 text-xs shrink-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Emergency Transport Requirement</div>
          <div className="text-xl font-mono font-black text-rose-400 mt-0.5">
            18 All-Terrain Buses / 12 Ambulances
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Total High Priority Civilians: <span className="text-white font-bold">1,215</span>
          </div>
        </div>
      </div>

      {/* Feature 13: Ranked Population Exposure Cards */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">
              Who Needs Help First? (Ranked Village & Settlement Evacuation Triage)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">
            Prioritized by Inundation Runway Time & Vulnerability Score
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div
              key={p.settlementId}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                p.evacuationPriorityRank === 1
                  ? 'bg-[#12102e] border-rose-500/60 ring-1 ring-rose-500/30'
                  : 'bg-[#050e24] border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-950 border border-rose-500/30">
                    PRIORITY #{p.evacuationPriorityRank}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Runway: <strong className="text-amber-400">{p.estimatedTimeToImpactHours}h</strong>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-0.5">{p.settlementName}</h4>
                <div className="text-[11px] text-slate-400 mb-3">Total Population: {p.totalPopulation}</div>

                {/* Demographics Breakdown */}
                <div className="p-2.5 rounded-lg bg-[#071330] border border-slate-800 text-xs space-y-1.5 mb-3">
                  <div className="flex justify-between text-slate-300">
                    <span>Elderly (65+):</span>
                    <span className="font-mono font-bold text-white">{p.elderlyCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Children (&lt;10):</span>
                    <span className="font-mono font-bold text-white">{p.childrenCount}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Mobility Impaired:</span>
                    <span className="font-mono font-bold text-rose-400">{p.mobilityImpairedCount}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Hospital className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Bed Capacity: <strong>{p.hospitalBedCapacity} beds</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Transport Required: <strong>{p.requiredEvacuationVehicles}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-emerald-300 font-medium">
                🛡️ <strong>Assigned Haven:</strong> {p.nearestDesignatedShelter}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 14: Satellite Radar Tasking Queue */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Satellite Observation Priority Tasking Queue (ISRO / ESA / NASA-ISRO)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300">
            Automated Tasking Protocol • SAR Penetrates Clouds & Monsoons
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {satellites.map((sat) => {
            const isTasked = taskedIds.includes(sat.id);
            return (
              <div
                key={sat.id}
                className="p-3.5 rounded-xl bg-[#050e24] border border-slate-800 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">{sat.satelliteName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        sat.priorityLevel === 'URGENT'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {sat.priorityLevel}
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-cyan-400 mb-2">
                    Sensor: {sat.sensorBand} | Res: {sat.resolutionM}m
                  </div>

                  <div className="space-y-1 text-slate-300 text-[11px] mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Flyover:</span>
                      <span className="font-mono text-amber-400 font-bold">{sat.nextOverpassEta}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pass Angle:</span>
                      <span className="font-mono text-slate-200">{sat.passType}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{sat.targetZone}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleTaskSatellite(sat.id)}
                  disabled={isTasked}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isTasked
                      ? 'bg-emerald-900/60 border border-emerald-500/40 text-emerald-300'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  {isTasked ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Task Transmitted ✓</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Task Urgent Capture</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
