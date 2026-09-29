import React, { useState } from 'react';
import {
  ShieldCheck,
  Building,
  Route,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ChevronRight,
  Sliders,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Navigation,
  Compass,
  ArrowRight,
  Radio,
  FileText,
  Activity,
  Ambulance,
  HelpCircle,
  X
} from 'lucide-react';
import {
  SimulationImpactResult,
  CandidateDestination,
  EvacuationRouteSegment,
  TurnByTurnStep,
  ExposedBuilding
} from './disasterSimulationData';

interface DecisionSupportDrawerProps {
  impactResult: SimulationImpactResult;
  selectedBuilding: ExposedBuilding | null;
  onSelectBuilding: (building: ExposedBuilding | null) => void;
  activeInterventions: Record<string, boolean>;
  onToggleIntervention: (id: string) => void;
  isNavigating: boolean;
  onToggleNavigation: () => void;
  onSelectDestination: (dest: CandidateDestination) => void;
  selectedDestinationId: string | null;
  activeTab: 'impact' | 'ai_brain' | 'domino' | 'whatif' | 'evacuation';
  onChangeTab: (tab: 'impact' | 'ai_brain' | 'domino' | 'whatif' | 'evacuation') => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const DecisionSupportDrawer: React.FC<DecisionSupportDrawerProps> = ({
  impactResult,
  selectedBuilding,
  onSelectBuilding,
  activeInterventions,
  onToggleIntervention,
  isNavigating,
  onToggleNavigation,
  onSelectDestination,
  selectedDestinationId,
  activeTab,
  onChangeTab,
  isCollapsed,
  onToggleCollapse
}) => {
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState<boolean>(false);

  // Compute With Action vs Without Action values dynamically
  const withActionExposure = activeInterventions['evacuate_area'] ? 38 : activeInterventions['close_road'] ? 62 : 82;
  const withActionRoadAccess = activeInterventions['divert_traffic'] ? 84 : activeInterventions['close_road'] ? 68 : 35;
  const withActionShelterAccess = activeInterventions['open_shelter'] ? 92 : 54;

  if (isCollapsed) {
    return (
      <div className="absolute top-28 right-3 z-20 pointer-events-auto">
        <button
          onClick={onToggleCollapse}
          className="bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Decision Support Panel</span>
          <Eye className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-28 right-3 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-slate-200/90 shadow-2xl w-96 max-h-[calc(100vh-8.5rem)] overflow-y-auto text-xs text-slate-800 pointer-events-auto flex flex-col gap-3 font-sans">
      {/* Header with Tab Navigation */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <strong className="text-slate-900 text-xs font-black tracking-wider uppercase">
            DECISION SUPPORT
          </strong>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Collapse Panel"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onChangeTab('impact')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'impact' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Impact Report
        </button>
        <button
          onClick={() => onChangeTab('ai_brain')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ai_brain' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          AI Brain
        </button>
        <button
          onClick={() => onChangeTab('domino')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'domino' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Domino Cascade
        </button>
        <button
          onClick={() => onChangeTab('whatif')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'whatif' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          What-If
        </button>
        <button
          onClick={() => onChangeTab('evacuation')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'evacuation' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Safe Route
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: IMPACT REPORT & SCANNER                                       */}
      {/* =================================================================== */}
      {activeTab === 'impact' && (
        <div className="space-y-3">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Impact Area</span>
                <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1 rounded">SIMULATION</span>
              </div>
              <div className="text-base font-black text-rose-600 font-mono mt-0.5">
                {impactResult.impactZoneKm2} <span className="text-xs font-normal text-slate-500">km²</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Exposed OSM 3D</span>
                <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-100 px-1 rounded">ESTIMATE</span>
              </div>
              <div className="text-base font-black text-amber-600 font-mono mt-0.5">
                {impactResult.exposedBuildingsCount} <span className="text-xs font-normal text-slate-500">buildings</span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>At-Risk Population</span>
                <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-100 px-1 rounded">ESTIMATE</span>
              </div>
              <div className="text-base font-black text-slate-900 font-mono mt-0.5">
                {impactResult.exposedPopulation.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Model Confidence</span>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1 rounded">AI METRIC</span>
              </div>
              <div className="text-base font-black text-blue-700 font-mono mt-0.5">
                {impactResult.confidencePercent}%
              </div>
            </div>
          </div>

          {/* Infrastructure Breakdown */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Exposed Critical Assets</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                REAL OSM
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Schools</div>
                <div className="font-bold text-slate-800 text-xs">3</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Hospitals</div>
                <div className="font-bold text-slate-800 text-xs">1</div>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500">Bridges</div>
                <div className="font-bold text-slate-800 text-xs">1</div>
              </div>
            </div>
          </div>

          {/* Building Scanner Interactive Section */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>Building Impact Scanner</span>
              <span className="text-[9px] text-slate-400">Click building to inspect</span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {impactResult.exposedBuildings.map((bldg) => {
                const isSelected = selectedBuilding?.id === bldg.id;
                return (
                  <button
                    key={bldg.id}
                    onClick={() => onSelectBuilding(isSelected ? null : bldg)}
                    className={`w-full text-left p-2 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] truncate">{bldg.name}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        bldg.exposure === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {bldg.exposure} EXPOSURE
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>ID: {bldg.id} • {bldg.distanceM}m</span>
                      <span className="italic">{bldg.status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Building Detail Card */}
          {selectedBuilding && (
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-300 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                <span>INSPECTING: {selectedBuilding.name}</span>
                <span className="text-[9px] font-mono">{selectedBuilding.id}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-700">
                <div>Type: <strong>{selectedBuilding.type}</strong></div>
                <div>Distance: <strong>{selectedBuilding.distanceM} m</strong></div>
                <div>Status: <strong className="text-amber-800">{selectedBuilding.status}</strong></div>
                <div>Est. Evacuation: <strong>{selectedBuilding.evacuationDistanceM} m</strong></div>
              </div>
              <div className="text-[9px] text-blue-700/80 italic mt-1">
                Notice: Requires ground geotechnical verification. Model estimates exposure proximity.
              </div>
            </div>
          )}

          {/* Lifeline Status */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
              <Route className="w-3.5 h-3.5 text-orange-600" />
              <span>Lifeline Corridors</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Arterial Route:</span>
              <span className={`font-bold ${impactResult.blockedRoadsCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {impactResult.blockedRoadName}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500">Alternative Link:</span>
              <span className="text-emerald-700 font-bold truncate max-w-[180px]">
                {impactResult.alternativeRouteName}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: AI SCENARIO BRAIN & EVIDENCE                                  */}
      {/* =================================================================== */}
      {activeTab === 'ai_brain' && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>AI Scenario Assessment</span>
              </span>
              <span className="font-mono text-xs font-black text-rose-600">
                Risk: 82 / 100
              </span>
            </div>

            {/* Parameter Bars */}
            <div className="space-y-1.5 text-[10px]">
              <div>
                <div className="flex justify-between text-slate-600 mb-0.5">
                  <span>Rainfall Driver</span>
                  <span className="font-bold text-slate-800">91%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '91%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-0.5">
                  <span>Soil Saturation (Pore Pressure)</span>
                  <span className="font-bold text-slate-800">84%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-0.5">
                  <span>Slope Inclination Vector</span>
                  <span className="font-bold text-slate-800">72%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-0.5">
                  <span>Infrastructure Exposure</span>
                  <span className="font-bold text-slate-800">81%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '81%' }} />
                </div>
              </div>
            </div>

            {/* Action Buttons: WHY? and AI EVIDENCE */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                onClick={() => setShowWhyModal(true)}
                className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Why This Area?</span>
              </button>

              <button
                onClick={() => setShowEvidenceModal(true)}
                className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Activity className="w-3 h-3" />
                <span>AI Evidence (81%)</span>
              </button>
            </div>
          </div>

          {/* Subsurface Slope Anatomy Snapshot */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>Subsurface Regolith Geomechanics</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>Soil Regolith: <strong>{impactResult.slopeCutaway.soilLayerThicknessM} m</strong></div>
              <div>Water Table: <strong>{impactResult.slopeCutaway.waterTableDepthM} m</strong></div>
              <div>Slip Plane Angle: <strong>{impactResult.slopeCutaway.shearPlaneAngleDeg}°</strong></div>
              <div>Factor of Safety: <strong className="text-rose-600">{impactResult.slopeCutaway.slopeStabilityFactor}</strong></div>
            </div>
            <div className="text-[9px] text-slate-500 italic mt-1">
              Geological Unit: {impactResult.slopeCutaway.geologicalUnit}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: DISASTER DOMINO CASCADE                                      */}
      {/* =================================================================== */}
      {activeTab === 'domino' && (
        <div className="space-y-3">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-1">
              <span>Disaster Domino Cascade</span>
              <span className="text-[9px] font-mono text-purple-700 bg-purple-100 px-1.5 rounded">MULTI-HAZARD</span>
            </div>
            <p className="text-[10px] text-slate-500">
              BHUSAKTHI models the chained progression from meteorology to hydraulic flood wave.
            </p>
          </div>

          {/* Animated Cascade Chain */}
          <div className="space-y-1.5">
            {impactResult.disasterDominoSteps.map((step, idx) => (
              <div
                key={step.id}
                className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                  step.status === 'COMPLETED'
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                    : step.status === 'ACTIVE'
                    ? 'bg-amber-50 border-amber-300 text-slate-900 shadow-xs ring-1 ring-amber-300'
                    : 'bg-slate-50/80 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    step.status === 'COMPLETED'
                      ? 'bg-emerald-600 text-white'
                      : step.status === 'ACTIVE'
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-[11px]">{step.title}</div>
                    <div className="text-[9px] text-slate-500">{step.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono font-bold block">{step.timeLabel}</span>
                  <span className="text-[8px] font-mono text-slate-400">{step.impactTag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: WHAT-IF & INTERVENTIONS                                      */}
      {/* =================================================================== */}
      {activeTab === 'whatif' && (
        <div className="space-y-3">
          {/* Comparison Matrix: Without Action vs With Action */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span>Scenario Intervention Comparison</span>
              <span className="text-[9px] font-mono text-blue-700 bg-blue-100 px-1.5 rounded">MODEL ESTIMATE</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white p-2 rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Without Action</div>
                <div className="text-sm font-black text-rose-600 mt-1">82% Risk</div>
                <div className="text-[9px] text-slate-500">Exposure: High</div>
                <div className="text-[9px] text-slate-500">Road Access: 35%</div>
              </div>

              <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">With Action</div>
                <div className="text-sm font-black text-emerald-700 mt-1">{withActionExposure}% Risk</div>
                <div className="text-[9px] text-emerald-700">Access: {withActionRoadAccess}%</div>
                <div className="text-[9px] text-emerald-700">Shelter: {withActionShelterAccess}%</div>
              </div>
            </div>
          </div>

          {/* Action Checkboxes */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-800 mb-1">
              Select Protective Interventions
            </div>

            {impactResult.interventions.map((action) => (
              <label
                key={action.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!activeInterventions[action.id]}
                    onChange={() => onToggleIntervention(action.id)}
                    className="accent-emerald-600 rounded"
                  />
                  <span className="font-bold text-[11px] text-slate-800">{action.label}</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                  -{action.exposureReductionPct}% Exp
                </span>
              </label>
            ))}
          </div>

          {/* Cost of Delay */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Cost of Delay Simulator</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">SIMULATION</span>
            </div>

            <div className="grid grid-cols-4 gap-1 text-center">
              {impactResult.costOfDelay.map((pt) => (
                <div key={pt.minutes} className="bg-white p-1.5 rounded-lg border border-slate-200">
                  <div className="text-[9px] font-mono text-slate-500">{pt.minutes} min</div>
                  <div className={`font-bold text-[10px] mt-0.5 ${
                    pt.responseDifficulty === 'EXTREME'
                      ? 'text-rose-600'
                      : pt.responseDifficulty === 'HIGH'
                      ? 'text-orange-600'
                      : 'text-slate-800'
                  }`}>
                    {pt.roadAccessPct}% Access
                  </div>
                  <div className="text-[8px] font-mono text-slate-400">{pt.responseDifficulty}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: SAFEST DESTINATION & EVACUATION ROUTE NAVIGATION              */}
      {/* =================================================================== */}
      {activeTab === 'evacuation' && (
        <div className="space-y-3">
          {/* Candidate Safe Destinations */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recommended Lower-Risk Destinations</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100 px-1.5 rounded">SAFE HAVEN</span>
            </div>

            <div className="space-y-1.5">
              {impactResult.candidateDestinations.map((dest) => {
                const isSelected = selectedDestinationId === dest.id || (!selectedDestinationId && dest.isRecommended);
                return (
                  <button
                    key={dest.id}
                    onClick={() => onSelectDestination(dest)}
                    className={`w-full text-left p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px]">{dest.name}</span>
                      <span className="text-[10px] font-bold font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Score: {dest.safetyScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                      <span>{dest.type} • {dest.distanceM}m</span>
                      <span className="text-emerald-700 font-bold">Access: {dest.roadAccessStatus}</span>
                    </div>
                    <p className="text-[9px] text-slate-600 mt-1 leading-snug">
                      {dest.reason}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evacuation Routes Breakdown */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-blue-600" />
                <span>Evacuation Route Geometry</span>
              </span>
              <span className="text-[9px] text-slate-400 font-mono">ON ROAD NETWORK</span>
            </div>

            <div className="space-y-1.5">
              {impactResult.evacuationRoutes.map((rt) => (
                <div
                  key={rt.id}
                  className={`p-2 rounded-lg border text-[10px] flex items-center justify-between ${
                    rt.color === 'blue'
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                      : rt.color === 'green'
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                      : 'bg-rose-50/70 border-rose-300 text-rose-900'
                  }`}
                >
                  <div>
                    <div className="font-bold">{rt.name}</div>
                    <div className="text-[9px] opacity-80">{rt.description}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold">{rt.distanceKm} km</span>
                    <span className="block text-[9px] opacity-80">{rt.estMinutes} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Turn-by-Turn Guidance Navigation Button */}
          <button
            onClick={onToggleNavigation}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer ${
              isNavigating
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>{isNavigating ? 'Stop Navigation' : 'Start Evacuation Navigation'}</span>
          </button>

          {/* Turn-by-turn guidance drawer */}
          {isNavigating && (
            <div className="bg-white p-3 rounded-xl border border-blue-300 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                <span>Turn-by-Turn Evacuation Guidance</span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">ACTIVE</span>
              </div>
              <div className="space-y-2">
                {impactResult.turnByTurnSteps.map((step) => (
                  <div key={step.stepIndex} className="flex items-start gap-2 text-[10px]">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {step.stepIndex}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800">{step.instruction}</div>
                      <div className="text-slate-500">{step.roadName} ({step.distanceM}m)</div>
                      {step.warning && (
                        <div className="text-amber-700 font-bold text-[9px] mt-0.5">
                          ⚠ {step.warning}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rescue Team Digital Twin Status */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
              <Ambulance className="w-3.5 h-3.5 text-rose-600" />
              <span>Rescue Team Digital Twin</span>
            </div>

            <div className="space-y-1">
              {impactResult.rescueAssets.map((asset) => (
                <div key={asset.id} className="flex justify-between items-center text-[10px] bg-white p-1.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800">{asset.name}</span>
                  <span className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    asset.reachable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {asset.reachable ? `ETA: ${asset.etaMinutes}m` : 'BLOCKED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* WHY MODAL */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">Why Was This Area Affected?</h3>
              </div>
              <button onClick={() => setShowWhyModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              {impactResult.whyFactors.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{f}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-100">
              AI scenario explanation synthesizes Copernicus DEM slope vectors, AWS precipitation telemetry, and geological fault mapping.
            </p>
          </div>
        </div>
      )}

      {/* EVIDENCE FUSION MODAL */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-600" />
                <h3 className="font-black text-slate-900 text-sm">Multi-Sensor Evidence Fusion (81% Agreement)</h3>
              </div>
              <button onClick={() => setShowEvidenceModal(false)} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1.5 text-xs">
              {impactResult.evidenceFusion.map((item, idx) => (
                <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-800">{item.sensorName} ({item.type})</div>
                    <div className="text-[10px] text-slate-500">{item.value}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                      {item.badge}
                    </span>
                    <span className="block text-[9px] font-mono text-slate-500">{item.confidencePct}% conf</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                <strong>Uncertainty Disclosure:</strong> Subsurface lithological data is estimated from regional geotechnical borehole logs. Precautionary field verification required before heavy mechanical deployment.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
