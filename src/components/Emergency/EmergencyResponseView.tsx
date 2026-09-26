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

export type EmergencySubTab = 'incident_command' | 'multi_cascade' | 'evidence_conflict';

interface EmergencyResponseViewProps {
  onOpenSmsModal?: () => void;
  activeScenario?: string;
  initialSubTab?: EmergencySubTab;
  onNavigateToWarRoom?: (tab: 'chainbreaker' | 'contradiction' | string) => void;
}

export const EmergencyResponseView: React.FC<EmergencyResponseViewProps> = ({
  onOpenSmsModal,
  activeScenario,
  initialSubTab,
  onNavigateToWarRoom
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('ZONE-TAW-01');
  const [missionChecklist, setMissionChecklist] = useState(RESCUE_MISSION_PLAN_TAWANG);
  const [resources, setResources] = useState(EMERGENCY_RESOURCES);

  // Sub-tab selection state
  const [activeSubTab, setActiveSubTab] = useState<EmergencySubTab>(() => {
    if (initialSubTab) return initialSubTab;
    if (activeScenario === 'multi_cascade') return 'multi_cascade';
    if (activeScenario === 'evidence_conflict') return 'evidence_conflict';
    return 'incident_command';
  });

  // Cascade interactive scenario state
  const [selectedChainId, setSelectedChainId] = useState<string>(MULTI_HAZARD_CHAINS[0]?.id || 'cascade-chain-tawang-01');
  const [activeInterventions, setActiveInterventions] = useState<Record<string, boolean>>({
    'interv-0': true,
    'interv-1': false,
    'interv-2': false,
  });

  // Evidence conflict interactive state
  const [selectedConflictId, setSelectedConflictId] = useState<string>(EVIDENCE_CONFLICT_RECORDS[0]?.id || 'conflict-01');
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, { status: string; override: boolean; notes: string }>>({
    'conflict-01': { status: 'ARBITRATED', override: true, notes: 'Field Patrol ground observation accepted over stale satellite pass' },
    'conflict-02': { status: 'PENDING', override: false, notes: 'Awaiting high-res UAV lidar pass' },
  });

  // Sync subtab when activeScenario changes
  React.useEffect(() => {
    if (activeScenario === 'multi_cascade') {
      setActiveSubTab('multi_cascade');
    } else if (activeScenario === 'evidence_conflict') {
      setActiveSubTab('evidence_conflict');
    }
  }, [activeScenario]);

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

  const selectedChain = MULTI_HAZARD_CHAINS.find((c) => c.id === selectedChainId) || MULTI_HAZARD_CHAINS[0];
  const selectedConflict = EVIDENCE_CONFLICT_RECORDS.find((c) => c.id === selectedConflictId) || EVIDENCE_CONFLICT_RECORDS[0];

  const toggleIntervention = (key: string) => {
    setActiveInterventions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const currentInterventionsCount = Object.values(activeInterventions).filter(Boolean).length;
  const simulatedRoiValue = (currentInterventionsCount * 4.2).toFixed(1);
  const simulatedRiskReduction = Math.min(88, 35 + currentInterventionsCount * 18);

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-12 text-slate-900">
      {/* 1. HEADER */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
              CENTRAL DISASTER DECISION-SUPPORT
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
              NDMA / SDMA INCIDENT COMMAND
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
            AI Emergency Response Prioritizer &amp; Resource Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Ranks incidents by hazard severity and vulnerable population exposure, computes impact radii, dispatches emergency assets, and validates evacuation routes.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenSmsModal && (
            <button
              onClick={onOpenSmsModal}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Radio className="w-4 h-4 text-white" />
              <span>Broadcast Multi-Channel SOS</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. WORKFLOW & SCENARIO SUB-TAB BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('incident_command')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'incident_command'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>1. Incident Command &amp; Fleet Allocation</span>
          </button>

          <button
            onClick={() => setActiveSubTab('multi_cascade')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'multi_cascade'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>2. Multi-Hazard Cascade Chains</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800">
              Scenario 3
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('evidence_conflict')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeSubTab === 'evidence_conflict'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3. Evidence Conflict Resolution</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-100 text-purple-800">
              Scenario 5
            </span>
          </button>
        </div>

        {onNavigateToWarRoom && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 text-[11px] hidden sm:inline">Advanced Decision Analytics:</span>
            <button
              onClick={() => onNavigateToWarRoom(activeSubTab === 'evidence_conflict' ? 'contradiction' : 'chainbreaker')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <span>Open Dedicated War Room Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 1: INCIDENT COMMAND & RESOURCE OPTIMIZER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'incident_command' && (
        <div className="space-y-6">
          {/* 2. DUAL COLUMN: AI RESPONSE PRIORITY (LEFT) + RESCUE MISSION PLANNER (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT: INCIDENT RESPONSE PRIORITIZATION (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                      AI Response Priority Ranking (Where to act first)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 font-bold">Hazard × Exposure Index</span>
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
                            ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-300 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                                zone.priorityRanking === 1
                                  ? 'bg-red-600 text-white'
                                  : zone.priorityRanking === 2
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              P{zone.priorityRanking}
                            </span>
                            <span className="font-bold text-slate-900 text-sm">{zone.zoneName}</span>
                          </div>
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200">
                            Exposure: {zone.exposureScore}/100
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-2">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                            <span className="text-[9px] text-slate-500 block">Civilians:</span>
                            <span className="font-bold text-slate-900">{zone.totalPopulation.toLocaleString()}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                            <span className="text-[9px] text-slate-500 block">Kids / Elderly:</span>
                            <span className="font-bold text-amber-700">{zone.childrenCount + zone.elderlyCount}</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                            <span className="text-[9px] text-slate-500 block">Road Status:</span>
                            <span className={`font-bold ${zone.roadAccessStatus === 'OPEN' ? 'text-emerald-700' : 'text-red-700'}`}>
                              {zone.roadAccessStatus}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug">
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
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                      Impact Radius Engine (Assets at Risk)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Within 4.0 km Hazard Zone</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {IMPACT_ASSETS_TAWANG.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block truncate max-w-[200px]">{asset.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {asset.distanceFromHazardKm} km away • {asset.populationOrCapacity} capacity
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border uppercase shrink-0 ${
                          asset.status === 'blocked' || asset.status === 'evacuate'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : asset.status === 'threatened'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
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
              <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                      AI Rescue Mission Planner (Action Checklist)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
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
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <button className="mt-0.5 text-blue-600 shrink-0">
                        {step.status === 'Completed' ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs font-bold ${step.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {step.stepNumber}. {step.title}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                              step.priority === 'Immediate'
                                ? 'bg-red-50 text-red-800 border-red-200'
                                : step.priority === 'Urgent'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}
                          >
                            {step.priority}
                          </span>
                        </div>
                        <div className="text-[10px] text-blue-600 font-mono mt-0.5 font-bold">{step.agency}</div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">{step.instructions}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Evidence Conflict Detection Notice */}
                <div className="mt-auto p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900 uppercase font-mono block text-[11px]">
                      Evidence Conflict Engine: Satellite vs Field Report
                    </span>
                    <p className="mt-0.5 text-slate-700 leading-snug">
                      {EVIDENCE_CONFLICT_RECORDS[0].satelliteObservation} <strong>vs</strong> {EVIDENCE_CONFLICT_RECORDS[0].fieldReportObservation}
                    </p>
                    <div className="mt-2 text-blue-700 font-mono font-bold text-[10px]">
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
            <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                    Emergency Resource Optimizer (Fleet &amp; Team Allocation)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-blue-700 font-bold">Live Telematics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resources.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-bold text-blue-700">{res.type}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                            res.currentStatus === 'On Site'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : res.currentStatus === 'En Route'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {res.currentStatus}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900">{res.unitName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Base: {res.stationBase} • ETA: {res.etaMinutes}m
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-mono text-slate-600 truncate max-w-[170px]">
                        To: {res.assignedZone}
                      </span>
                      <button
                        onClick={() => dispatchResource(res.id)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] cursor-pointer transition-all active:scale-95 shadow-xs"
                      >
                        {res.currentStatus === 'Dispatched' ? 'Mark Arrived' : 'Dispatch'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SAFE ROUTE & DETOUR FINDER (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                    Safe Zone &amp; Evacuation Route Finder
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">AI Route Clearance</span>
              </div>

              <div className="space-y-3">
                {SAFE_ROUTES_TAWANG.map((r) => (
                  <div
                    key={r.routeId}
                    className={`p-3 rounded-xl border ${
                      r.isRecommended
                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-900">{r.name}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase ${
                          r.safetyRating === 'Safe Corridor'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : r.safetyRating === 'Caution Required'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {r.safetyRating}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-700 mb-1">
                      <span>{r.distanceKm} km</span>
                      <span>•</span>
                      <span>Est: {r.estTimeMinutes} mins</span>
                      {r.isRecommended && (
                        <span className="text-emerald-700 font-bold ml-auto">★ RECOMMENDED BY AI</span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">{r.pathDescription}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 2: MULTI-HAZARD CASCADE CHAINS (SCENARIO 3) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'multi_cascade' && (
        <div className="space-y-6">
          {/* SCENARIO HEADER & CORRIDOR SELECTOR */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    EVALUATION SCENARIO 3: MULTI-HAZARD CASCADE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    CHAIN BREAKER &amp; INTERVENTION ENGINE
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedChain.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                  {selectedChain.actionDirective}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  {MULTI_HAZARD_CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setSelectedChainId(chain.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedChainId === chain.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {chain.id.includes('tupul') ? 'Noney Tupul River' : 'Tawang Sela Lifeline'}
                    </button>
                  ))}
                </div>

                {onNavigateToWarRoom && (
                  <button
                    onClick={() => onNavigateToWarRoom('chainbreaker')}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Launch War Room Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* IMPACT KPI METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block">Critical Lifeline:</span>
                <span className="text-sm font-bold text-slate-900 font-mono">NH-13 Sela Strategic Pass</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Primary Military Logistics Arterial</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block">Isolation Risk:</span>
                <span className="text-sm font-bold text-red-600 font-mono">{selectedChain.isolationRiskPct}% Risk</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">50,000+ Civilians &amp; Border Garrison</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block">Sequential Stages:</span>
                <span className="text-sm font-bold text-blue-700 font-mono">
                  {selectedChain.nodes.length} Progressive Cascade Nodes
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  {(selectedChain.nodes.reduce((acc, n) => acc + n.probabilityPct, 0) / selectedChain.nodes.length).toFixed(0)}% Avg Node Probability
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block">Intervention Savings:</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">₹{simulatedRoiValue} Cr Net Protected</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">-{simulatedRiskReduction}% Casualty Probability</span>
              </div>
            </div>
          </div>

          {/* 5-STAGE SEQUENTIAL CASCADE TIMELINE */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Domino Sequence Trajectory (Trigger &rarr; River Dam &rarr; Flash Surge &rarr; Lifeline Severance)
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-700 font-bold">Initial Trigger: {selectedChain.triggerEvent}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {selectedChain.nodes.map((node, index) => (
                <div
                  key={node.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Stage 0{index + 1}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-red-600">
                      {node.probabilityPct}% Prob
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{node.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{node.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-blue-700">
                    Locations: {node.affectedLocations.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INTERACTION MATRIX: CHAIN BREAKER INTERVENTIONS */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
                  Tactical Chain-Breaker Interventions (Put Scenario into Your Hands)
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-700 font-bold">
                {currentInterventionsCount} of 3 Interventions Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  id: 'interv-0',
                  title: 'Pre-position Heavy Earthmovers at Sela North Portal',
                  agency: 'BRO Project Vartak (Tawang)',
                  impact: 'Halts 60% road block duration, cuts reopening from 72h to 6h',
                  cost: '₹14 Lakhs',
                  roi: '₹18.4 Cr Infrastructure & Convoy Saved',
                },
                {
                  id: 'interv-1',
                  title: 'Controlled Siphon Sluice at Debris Embankment',
                  agency: 'SDRF Riverine Unit & CWPRS',
                  impact: 'Prevents catastrophic lake outburst flash flood downstream',
                  cost: '₹22 Lakhs',
                  roi: '₹45 Cr Downstream Settlements Preserved',
                },
                {
                  id: 'interv-2',
                  title: 'Radio & Cell Broadcast Pre-Emptive Convoy Rerouting',
                  agency: 'District Disaster Management Authority (DDMA)',
                  impact: 'Diverts 140 military & civil transports to Dirang bypass route',
                  cost: '₹2 Lakhs',
                  roi: 'Zero Civilian Stranding & Casualty Prevention',
                },
              ].map((interv) => {
                const isActive = !!activeInterventions[interv.id];
                return (
                  <div
                    key={interv.id}
                    onClick={() => toggleIntervention(interv.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                      isActive
                        ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono text-blue-700 font-bold">{interv.agency}</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-300'
                          }`}
                        >
                          {isActive ? 'INTERVENTION ACTIVE' : 'CLICK TO ENGAGE'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{interv.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{interv.impact}</p>
                    </div>

                    <div className="pt-2.5 border-t border-slate-200 text-[10px] font-mono flex items-center justify-between">
                      <span className="text-slate-500">Budget: {interv.cost}</span>
                      <span className="text-emerald-700 font-bold">{interv.roi}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 3: EVIDENCE CONFLICT RESOLUTION (SCENARIO 5) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'evidence_conflict' && (
        <div className="space-y-6">
          {/* SCENARIO HEADER & SELECTOR */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    EVALUATION SCENARIO 5: EVIDENCE CONFLICT
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    MULTI-SOURCE ARBITRATION &amp; CROSS-FUSION
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {selectedConflict.location} Evidence Contradiction
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                  {selectedConflict.conflictStatus}: {selectedConflict.satelliteObservation} vs {selectedConflict.fieldReportObservation}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  {EVIDENCE_CONFLICT_RECORDS.map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedConflictId(rec.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedConflictId === rec.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {rec.location.split(' ')[0]} {rec.location.split(' ')[1]}
                    </button>
                  ))}
                </div>

                {onNavigateToWarRoom && (
                  <button
                    onClick={() => onNavigateToWarRoom('contradiction')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Launch War Room Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* ADJUDICATION SUMMARY BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-200">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block">Dispute Status:</span>
                <span className="text-sm font-bold text-amber-700 font-mono">
                  {conflictResolutions[selectedConflict.id]?.status || 'PENDING'}
                </span>
                <span className="text-[10px] text-blue-700 block mt-0.5 font-bold">Bayesian Arbitration Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block">AI Resolved Action:</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  {selectedConflict.systemActionDirective}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Fail-Safe Protocol</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block">Escalation Priority:</span>
                <span className="text-sm font-bold text-red-600 font-mono">
                  {selectedConflict.escalatedPriority ? 'LEVEL 4 IMMEDIATE' : 'LEVEL 2 ADVISORY'}
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5 font-semibold">Immediate Tactical Lockdown</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-mono text-slate-500 block">Patrol Ground Credibility:</span>
                <span className="text-sm font-bold text-blue-700 font-mono">96% High-Confidence</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Physical Tension Crack Photo</span>
              </div>
            </div>
          </div>

          {/* SIDE-BY-SIDE CONTRADICTION COMPARISON */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SOURCE A: SATELLITE / REMOTE SENSING */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Remote Sensing Stream: Satellite InSAR &amp; Optical
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    ORBITAL DATA
                  </span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">Telemetry Finding</span>
                  <p className="text-xs text-slate-800 leading-relaxed font-mono">
                    {selectedConflict.satelliteObservation}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-700 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Sensor Constellation:</span>
                    <span className="text-slate-900 font-bold">Sentinel-1 InSAR + Landsat-9</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Acquisition Timestamp:</span>
                    <span className="text-amber-700 font-semibold">48h Stale (Cloud Cover Obscuration)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Reported Slope Status:</span>
                    <span className="text-emerald-700 font-bold">Apparent Stability (&lt; 2mm/yr creep)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Limitation: Sub-surface rock shear and fissures masked by thick forest canopy and radar geometric distortion.</span>
              </div>
            </div>

            {/* SOURCE B: FIELD PATROL / GROUND TRUTH */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Ground Truth Stream: Field Patrol Reconnaissance
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                    PHYSICAL RECON
                  </span>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-purple-50/50 border border-purple-200 space-y-2">
                  <span className="text-[10px] font-mono text-purple-900 block uppercase font-bold">Field Observer Finding</span>
                  <p className="text-xs text-slate-900 leading-relaxed font-mono">
                    {selectedConflict.fieldReportObservation}
                  </p>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-700 font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Observer Unit:</span>
                    <span className="text-slate-900 font-bold">BRO Project Vartak Reconnaissance Team</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Timestamp:</span>
                    <span className="text-emerald-700 font-bold">Live (25 minutes ago)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Observed Tension Crack:</span>
                    <span className="text-red-700 font-bold">45m length × 12cm aperture opening</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Validation: GPS coordinates &amp; geo-tagged photograph verified against GSI geological fault map.</span>
              </div>
            </div>
          </div>

          {/* ARBITRATION DECISION & CONTROL BAR */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider block">
                System Action Directive &amp; Arbitration Decision
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                {selectedConflict.systemActionDirective}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                The AI arbitration engine overrides satellite latency in favor of physical tension crack evidence to preserve lives.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setConflictResolutions((prev) => ({
                    ...prev,
                    [selectedConflict.id]: {
                      status: 'ARBITRATED',
                      override: true,
                      notes: 'Ground truth confirmed; Level-4 road lockdown directive enforced.',
                    },
                  }));
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Adopt Ground Truth &amp; Issue Level-4 Lockdown</span>
              </button>

              <button
                onClick={() => {
                  setConflictResolutions((prev) => ({
                    ...prev,
                    [selectedConflict.id]: {
                      status: 'DRONE_TASKED',
                      override: true,
                      notes: 'Thermal drone reconnaissance dispatched for 3D photogrammetry.',
                    },
                  }));
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-mono font-bold cursor-pointer transition-all active:scale-95 flex items-center gap-2"
              >
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>Task Thermal Drone Verification</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
