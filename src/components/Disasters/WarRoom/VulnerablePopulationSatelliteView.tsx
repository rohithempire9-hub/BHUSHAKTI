import React, { useState } from 'react';
import { Users, Satellite, CheckCircle2, Send, MapPin, AlertTriangle } from 'lucide-react';
import { VULNERABLE_POPULATION_ZONES, SATELLITE_TASKING_PRIORITY } from '../../../services/bhuShaktiAdvancedIntelligence';

export const VulnerablePopulationSatelliteView: React.FC = () => {
  const [taskedIds, setTaskedIds] = useState<string[]>([]);

  const handleTaskSatellite = (satId: string) => {
    setTaskedIds((prev) => prev.includes(satId) ? prev : [...prev, satId]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">FEATURE 13 • VULNERABLE POPULATION ENGINE</span>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">FEATURE 14 • SATELLITE RADAR TASKING</span>
        </div>
        <h2 className="text-xl font-bold text-white">Vulnerable Population Exposure & Satellite Observation Priority</h2>
        <p className="text-xs text-slate-300 max-w-3xl mt-1">Ranks vulnerable settlements for evacuation support and prioritizes satellite observations using the same data model as the intelligence engine.</p>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-rose-400" /><h3 className="text-sm font-bold text-white">Who Needs Help First?</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {VULNERABLE_POPULATION_ZONES.map((p) => (
            <div key={p.zoneId} className={`p-4 rounded-xl border ${p.evacuationPriorityRank === 1 ? 'bg-[#12102e] border-rose-500/60 ring-1 ring-rose-500/30' : 'bg-[#050e24] border-slate-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-950 border border-rose-500/30">PRIORITY #{p.evacuationPriorityRank}</span>
                <span className="text-[10px] font-mono text-slate-400">{p.evacuationPriority}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{p.villageName}</h4>
              <p className="text-[11px] text-slate-400">{p.district} • {p.totalPopulation} residents</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                <div className="p-2 rounded-lg bg-[#071330] border border-slate-800"><span className="text-slate-400 block">Children</span><strong className="text-white">{p.childrenCount}</strong></div>
                <div className="p-2 rounded-lg bg-[#071330] border border-slate-800"><span className="text-slate-400 block">Elderly</span><strong className="text-white">{p.elderlyCount}</strong></div>
                <div className="p-2 rounded-lg bg-[#071330] border border-slate-800"><span className="text-slate-400 block">Exposure</span><strong className="text-rose-300">{p.exposureScore}/100</strong></div>
                <div className="p-2 rounded-lg bg-[#071330] border border-slate-800"><span className="text-slate-400 block">Access</span><strong className="text-amber-300">{p.accessRoadStatus}</strong></div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-300">Shelter: <strong>{p.recommendedEvacShelter}</strong></div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2"><Satellite className="w-4 h-4 text-cyan-400" /><h3 className="text-sm font-bold text-white">Satellite Observation Priority Tasking Queue</h3></div>
          <span className="text-[10px] font-mono text-cyan-300">SAR / optical observation prioritization</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SATELLITE_TASKING_PRIORITY.map((sat) => {
            const tasked = taskedIds.includes(sat.zoneId);
            return (
              <div key={sat.zoneId} className="p-3.5 rounded-xl bg-[#050e24] border border-slate-800 text-xs">
                <div className="flex justify-between gap-2 mb-2"><span className="font-bold text-white">{sat.zoneName}</span><span className="text-[9px] font-mono text-amber-300">{sat.priorityRank}</span></div>
                <div className="text-[10px] text-cyan-400 mb-2">{sat.recommendedSensorPayload}</div>
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <span className="text-slate-400">Risk <strong className="text-rose-300">{sat.riskScore}</strong></span>
                  <span className="text-slate-400">Confidence <strong className="text-cyan-300">{sat.confidencePct}%</strong></span>
                  <span className="text-slate-400">24h Rain <strong className="text-white">{sat.recentRainfall24hMm} mm</strong></span>
                  <span className="text-slate-400">Velocity <strong className="text-amber-300">{sat.escalationVelocity}</strong></span>
                </div>
                <div className="text-[10px] text-slate-400 mb-3">Last SAR: {sat.lastSarPassDate} • Last optical: {sat.lastOpticalPassDate}</div>
                <p className="text-[11px] text-slate-300 mb-3">{sat.recommendationDirective}</p>
                <button onClick={() => handleTaskSatellite(sat.zoneId)} disabled={tasked} className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${tasked ? 'bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 cursor-default' : 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer'}`}>
                  {tasked ? <><CheckCircle2 className="w-3.5 h-3.5" />Task Transmitted</> : <><Send className="w-3.5 h-3.5" />Task Urgent Capture</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
