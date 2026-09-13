import React, { useState } from 'react';
import {
  VULNERABLE_POPULATION_ZONES,
  EMERGENCY_RESOURCES,
  RESCUE_MISSION_PLAN_TAWANG,
  SAFE_ROUTES_TAWANG,
  IMPACT_ASSETS_TAWANG,
  EVIDENCE_CONFLICT_RECORDS,
  MULTI_HAZARD_CHAINS
} from '../../services/cascadeRiskEngine';
import {
  ShieldAlert,
  ShieldCheck,
  Truck,
  Users,
  AlertTriangle,
  Compass,
  MapPin,
  CheckSquare,
  Square,
  Clock,
  Navigation,
  ArrowRight,
  GitBranch,
  Building,
  Radio,
  FileText
} from 'lucide-react';

interface EmergencyResponseViewProps {
  onOpenSmsModal?: () => void;
}

export const EmergencyResponseView: React.FC<EmergencyResponseViewProps> = ({
  onOpenSmsModal,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('ZONE-TAW-01');
  const [missionChecklist, setMissionChecklist] = useState(RESCUE_MISSION_PLAN_TAWANG);
  const [resources, setResources] = useState(EMERGENCY_RESOURCES);

  const toggleChecklistStep = (stepNum: number) => {
    setMissionChecklist((prev) =>
      prev.map((s) => {
        if (s.stepNumber === stepNum) {
          return {
            ...s,
            status: s.status === 'Completed' ? 'Pending' : 'Completed',
          };
        }
        return s;
      })
    );
  };

  const dispatchResource = (resId: string) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id === resId) {
          return {
            ...r,
            currentStatus: r.currentStatus === 'Dispatched' ? 'On Site' : 'Dispatched',
          };
        }
        return r;
      })
    );
  };

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-12">
      {/* 1. HEADER */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
              CENTRAL DISASTER DECISION-SUPPORT
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              NDMA / SDMA INCIDENT COMMAND
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            AI Emergency Response Prioritizer &amp; Resource Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-cyan-300/90 mt-1 max-w-3xl">
            Ranks incidents by hazard severity and vulnerable population exposure, computes impact radii, dispatches emergency assets, and validates evacuation routes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenSmsModal && (
            <button
              onClick={onOpenSmsModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Broadcast Multi-Channel SOS</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. DUAL COLUMN: AI RESPONSE PRIORITY (LEFT) + RESCUE MISSION PLANNER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: INCIDENT RESPONSE PRIORITIZATION (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162e66]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                  AI Response Priority Ranking (Where to act first)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">Hazard × Exposure Index</span>
            </div>

            <div className="space-y-3">
              {VULNERABLE_POPULATION_ZONES.map((zone) => {
                const isSelected = selectedIncidentId === zone.zoneId;
                return (
                  <div
                    key={zone.zoneId}
                    onClick={() => setSelectedIncidentId(zone.zoneId)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#10275e] border-cyan-400 ring-1 ring-cyan-400 shadow-lg'
                        : 'bg-[#0b1a3e] border-[#18346e] hover:bg-[#0e214d]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center ${
                            zone.priorityRanking === 1
                              ? 'bg-rose-600 text-white'
                              : zone.priorityRanking === 2
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          P{zone.priorityRanking}
                        </span>
                        <span className="font-bold text-white text-sm">{zone.zoneName}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                        Exposure: {zone.exposureScore}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 font-mono mb-2">
                      <div className="p-1.5 rounded bg-[#071330] border border-[#142957]">
                        <span className="text-[9px] text-slate-400 block">Civilians:</span>
                        <span className="font-bold text-white">{zone.totalPopulation.toLocaleString()}</span>
                      </div>
                      <div className="p-1.5 rounded bg-[#071330] border border-[#142957]">
                        <span className="text-[9px] text-slate-400 block">Kids / Elderly:</span>
                        <span className="font-bold text-amber-300">{zone.childrenCount + zone.elderlyCount}</span>
                      </div>
                      <div className="p-1.5 rounded bg-[#071330] border border-[#142957]">
                        <span className="text-[9px] text-slate-400 block">Road Status:</span>
                        <span className={`font-bold ${zone.roadAccessStatus === 'OPEN' ? 'text-emerald-300' : 'text-rose-400'}`}>
                          {zone.roadAccessStatus}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      {zone.priorityRanking === 1
                        ? 'Prioritized #1: High risk (84), 340 school students sitting in runout chute, sole military trunk road cut.'
                        : zone.priorityRanking === 2
                        ? 'Prioritized #2: Debris dam threatens 3,450 riparian inhabitants with downstream surge.'
                        : 'Prioritized #3: Subsurface shale slaking with rail bed subsidence.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IMPACT RADIUS ASSETS ENGINE */}
          <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#162e66]">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                  Impact Radius Engine (Assets at Risk)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Within 4.0 km Hazard Zone</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {IMPACT_ASSETS_TAWANG.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 rounded-xl bg-[#0b1a3e] border border-[#162e66] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block truncate max-w-[200px]">{asset.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {asset.distanceFromHazardKm} km away • {asset.populationOrCapacity} capacity
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                      asset.status === 'blocked' || asset.status === 'evacuate'
                        ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                        : asset.status === 'threatened'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {asset.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: AI RESCUE MISSION PLANNER (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-2xl space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#162e66]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                  AI Rescue Mission Planner (Action Checklist)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-300">
                {missionChecklist.filter((s) => s.status === 'Completed').length} / {missionChecklist.length} Executed
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[440px] pr-1">
              {missionChecklist.map((step) => (
                <div
                  key={step.stepNumber}
                  onClick={() => toggleChecklistStep(step.stepNumber)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    step.status === 'Completed'
                      ? 'bg-[#081736]/60 border-[#142e66] opacity-75'
                      : 'bg-[#0b1b42] border-[#18346e] hover:bg-[#0e214d]'
                  }`}
                >
                  <button className="mt-0.5 text-cyan-400 shrink-0">
                    {step.status === 'Completed' ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${step.status === 'Completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                        {step.stepNumber}. {step.title}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                          step.priority === 'Immediate'
                            ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                            : step.priority === 'Urgent'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-blue-950 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {step.priority}
                      </span>
                    </div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{step.agency}</div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">{step.instructions}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Evidence Conflict Detection Notice */}
            <div className="mt-auto p-3.5 rounded-xl bg-gradient-to-r from-[#170e28] to-[#0c1b42] border border-amber-500/40 text-xs text-slate-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 uppercase font-mono block text-[11px]">
                  Evidence Conflict Engine: Satellite vs Field Report
                </span>
                <p className="mt-0.5 text-slate-300 leading-snug">
                  {EVIDENCE_CONFLICT_RECORDS[0].satelliteObservation} <strong>vs</strong> {EVIDENCE_CONFLICT_RECORDS[0].fieldReportObservation}
                </p>
                <div className="mt-2 text-cyan-300 font-mono font-bold text-[10px]">
                  Directive: {EVIDENCE_CONFLICT_RECORDS[0].systemActionDirective}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EMERGENCY RESOURCE OPTIMIZER & SAFE ROUTE INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RESOURCE OPTIMIZER (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#162e66]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Emergency Resource Optimizer (Fleet &amp; Team Allocation)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-300">Live Telematics</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-3.5 rounded-xl bg-[#0b1a3e] border border-[#162e66] flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono font-bold text-cyan-400">{res.type}</span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        res.currentStatus === 'On Site'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : res.currentStatus === 'En Route'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                          : 'bg-blue-950 text-blue-300 border-blue-500/40'
                      }`}
                    >
                      {res.currentStatus}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{res.unitName}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Base: {res.stationBase} • ETA: {res.etaMinutes}m
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#142957]">
                  <span className="text-[10px] font-mono text-slate-300 truncate max-w-[170px]">
                    To: {res.assignedZone}
                  </span>
                  <button
                    onClick={() => dispatchResource(res.id)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] cursor-pointer transition-all active:scale-95"
                  >
                    {res.currentStatus === 'Dispatched' ? 'Mark Arrived' : 'Dispatch'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAFE ROUTE & DETOUR FINDER (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#091533] border border-[#162e66] p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#162e66]">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                Safe Zone &amp; Evacuation Route Finder
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">AI Route Clearance</span>
          </div>

          <div className="space-y-3">
            {SAFE_ROUTES_TAWANG.map((r) => (
              <div
                key={r.routeId}
                className={`p-3 rounded-xl border ${
                  r.isRecommended
                    ? 'bg-[#0b2450] border-emerald-500/60 ring-1 ring-emerald-500/50'
                    : 'bg-[#0b1a3e] border-[#162e66]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-xs font-bold text-white">{r.name}</span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                      r.safetyRating === 'Safe Corridor'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        : r.safetyRating === 'Caution Required'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : 'bg-rose-950 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {r.safetyRating}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-mono text-cyan-300 mb-1">
                  <span>{r.distanceKm} km</span>
                  <span>•</span>
                  <span>Est: {r.estTimeMinutes} mins</span>
                  {r.isRecommended && (
                    <span className="text-emerald-400 font-bold ml-auto">★ RECOMMENDED BY AI</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">{r.pathDescription}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
