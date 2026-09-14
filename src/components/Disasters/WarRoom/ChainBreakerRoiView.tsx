import React, { useState } from 'react';
import {
  GitBranch,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Flame,
  Waves,
  Truck,
  RotateCcw,
  Layers,
  Activity,
  CheckSquare
} from 'lucide-react';
import {
  getDisasterChainBreakerModel,
  PREVENTION_ROI_MEASURES
} from '../../../services/bhuShaktiAdvancedIntelligence';
import { MULTI_HAZARD_CHAINS } from '../../../services/cascadeRiskEngine';

export const ChainBreakerRoiView: React.FC = () => {
  const [selectedChainId, setSelectedChainId] = useState<string>('cascade-chain-tawang-01');
  const [activeInterventions, setActiveInterventions] = useState<string[]>([
    'int-drainage',
    'int-road-closure'
  ]);
  const [isCloudburstSurgeActive, setIsCloudburstSurgeActive] = useState<boolean>(true);

  const selectedChain = MULTI_HAZARD_CHAINS.find((c) => c.id === selectedChainId) || MULTI_HAZARD_CHAINS[0];
  const chainModel = getDisasterChainBreakerModel(activeInterventions);

  const toggleIntervention = (interventionId: string) => {
    setActiveInterventions((prev) =>
      prev.includes(interventionId)
        ? prev.filter((id) => id !== interventionId)
        : [...prev, interventionId]
    );
  };

  const handleApplyAllInterventions = () => {
    setActiveInterventions(['int-drainage', 'int-field-inspect', 'int-road-closure', 'int-evac']);
    setIsCloudburstSurgeActive(false);
  };

  const handleSimulateCloudburst = () => {
    setActiveInterventions([]);
    setIsCloudburstSurgeActive(true);
  };

  const handleResetScenario = () => {
    setActiveInterventions(['int-drainage', 'int-road-closure']);
    setIsCloudburstSurgeActive(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 0. INTERACTIVE SCENARIO COMMANDER BAR - THE WHOLE SCENARIO IN YOUR HANDS */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#120a2e] to-[#0a183d] border-2 border-purple-500/50 p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-purple-500/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-purple-600 text-white uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-amber-300" />
                SCENARIO 3 ACTIVE: MULTI-HAZARD CASCADE SIMULATION
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                LIVE INTERACTIVE TESTBENCH
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{selectedChain.title}</span>
            </h1>
            <p className="text-xs text-purple-200/90 mt-1 max-w-3xl">
              <strong>Trigger Event:</strong> {selectedChain.triggerEvent}. Watch how primary rainfall cascades through geotechnical slip into lifeline severance, river damming, and regional isolation.
            </p>
          </div>

          {/* Scenario Selector & Quick Control Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedChainId('cascade-chain-tawang-01')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedChainId === 'cascade-chain-tawang-01'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 border border-purple-400'
                  : 'bg-[#0b1739] text-purple-300 border border-purple-500/30 hover:bg-[#122352]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Tawang Sela Corridor</span>
            </button>

            <button
              onClick={() => setSelectedChainId('cascade-chain-tupul-02')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedChainId === 'cascade-chain-tupul-02'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 border border-purple-400'
                  : 'bg-[#0b1739] text-purple-300 border border-purple-500/30 hover:bg-[#122352]'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-cyan-300" />
              <span>2. Ijei River Debris Dam</span>
            </button>
          </div>
        </div>

        {/* Interactive Scenario Control Bar */}
        <div className="mt-4 pt-3 border-t border-purple-500/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-[11px] font-mono text-slate-300 font-bold uppercase">Actions in Your Hands:</span>
            <button
              onClick={handleSimulateCloudburst}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInterventions.length === 0
                  ? 'bg-rose-600 text-white shadow-sm ring-1 ring-rose-400'
                  : 'bg-[#0a1638] text-rose-300 border border-rose-500/30 hover:bg-rose-950/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulate Cloudburst (Unmitigated Failure)</span>
            </button>

            <button
              onClick={handleApplyAllInterventions}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeInterventions.length >= 4
                  ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400'
                  : 'bg-[#0a1638] text-emerald-300 border border-emerald-500/30 hover:bg-emerald-950/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Auto-Deploy All Chain Breakers (-72% Risk)</span>
            </button>

            <button
              onClick={handleResetScenario}
              className="px-2 py-1 rounded-lg bg-[#0e1d44] text-slate-300 hover:text-white border border-slate-700 text-xs font-mono cursor-pointer transition-all flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Baseline</span>
            </button>
          </div>

          {/* Scenario Telemetry Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#091533] border border-cyan-500/30 text-cyan-300">
              River Blockage: {selectedChain.riverBlockageRiskPct}%
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#091533] border border-amber-500/30 text-amber-300">
              Downstream Flood: {selectedChain.downstreamFloodRiskPct}%
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#091533] border border-rose-500/30 text-rose-300">
              Isolation Risk: {selectedChain.isolationRiskPct}%
            </span>
          </div>
        </div>
      </div>

      {/* 1. CASCADE DOMINO PROGRESSION GRAPH (5-STAGE NODE PIPELINE) */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#142854]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Northeast India Cascade Consequence Chain: 5 Progressive Stages
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 font-bold">
            Directive: {selectedChain.actionDirective}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {selectedChain.nodes.map((node, index) => {
            const isCritical = node.severity === 'critical';
            return (
              <div
                key={node.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between relative transition-all ${
                  isCritical
                    ? 'bg-[#0e1738] border-rose-500/50 shadow-md shadow-rose-950/30'
                    : 'bg-[#08132e] border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#060e22] text-purple-300 border border-purple-500/30">
                      STEP {index + 1}: {node.category}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border ${
                        isCritical
                          ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                          : 'bg-amber-950 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {node.probabilityPct}% Prob
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1.5 leading-snug">{node.title}</h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed mb-2">{node.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[9px] font-mono text-cyan-400 truncate">
                    Zones: {node.affectedLocations.join(', ')}
                  </div>
                </div>

                {index < selectedChain.nodes.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-[#112350] border border-cyan-400 text-cyan-300 items-center justify-center text-[10px]">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. TACTICAL INTERVENTION POINTS (CLICK TO APPLY / SEVER CASCADE) */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#142854]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Tactical Intervention Gates (Click to Sever Cascade in Real Time)
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Preventive actions deployed at critical nodes before downstream civil and economic collapse occurs.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#06112c] p-2.5 rounded-xl border border-purple-500/30 shrink-0">
            <div className="text-center pr-3 border-r border-slate-700">
              <div className="text-[9px] font-mono text-slate-400 uppercase">Baseline Risk</div>
              <div className="text-base font-mono font-bold text-rose-400">{chainModel.baselineRiskScore}/100</div>
            </div>
            <div className="text-center pr-3 border-r border-slate-700">
              <div className="text-[9px] font-mono text-slate-400 uppercase">Intervened Risk</div>
              <div className="text-xl font-mono font-black text-emerald-400">{chainModel.currentRiskScore}/100</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-mono text-slate-400 uppercase">Risk Averted</div>
              <div className="text-xs font-mono font-bold text-cyan-300">
                -{chainModel.totalRiskReductionPct}% Risk
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {chainModel.chainLinks.map((link) => {
            const int = link.availableIntervention;
            if (!int) return null;
            const isApplied = activeInterventions.includes(int.id);

            return (
              <div
                key={link.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isApplied
                    ? 'bg-[#0a203f] border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-md'
                    : 'bg-[#050e24] border-slate-800 opacity-90 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
                      GATE #{link.order}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isApplied
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isApplied ? 'CASCADE SEVERED ✓' : 'UNMITIGATED PATHWAY'}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">{link.stageName}</h4>
                  <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">{link.description}</p>

                  {/* Available Intervention Detail */}
                  <div className="p-2.5 rounded-lg bg-[#06112c] border border-slate-800 text-xs mb-3">
                    <div className="flex items-center justify-between text-cyan-300 font-bold mb-1">
                      <span>{int.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Cost: ₹{int.costLakhs}L</span>
                      <span>Time: {int.timeRequiredHours}h</span>
                      <span className="text-emerald-400 font-bold">-{int.estimatedRiskReductionPct}% Risk</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleIntervention(int.id)}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isApplied
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isApplied ? 'Intervention Active (Click to Revert)' : 'Apply Tactical Intervention'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PREVENTION ROI SIMULATOR (FEATURE 19) */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Prevention ROI Simulator: ₹ Cost in Lakhs vs Avoided Reconstruction Cr
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 font-bold">
            NDMA Preparedness Budget Efficiency
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PREVENTION_ROI_MEASURES.map((measure) => (
            <div
              key={measure.id}
              className="p-3.5 rounded-xl bg-[#050e24] border border-slate-800 text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                      measure.recommendationRating === 'HIGHEST_EFFICIENCY'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : measure.recommendationRating === 'BALANCED'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                    }`}
                  >
                    {measure.recommendationRating.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">{measure.implementationTimeDays}d Setup</span>
                </div>

                <div className="font-bold text-white text-xs mb-1.5">{measure.measureName}</div>
                <p className="text-[10px] text-slate-300 leading-relaxed mb-3">{measure.notes}</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Estimated Cost:</span>
                  <span className="font-mono font-bold text-white">₹{measure.estimatedCostLakhsInr} Lakhs</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">Risk Reduction:</span>
                  <span className="font-mono font-bold text-emerald-400">-{measure.modeledRiskReductionPct}%</span>
                </div>
                <div className="flex items-center justify-between font-bold text-cyan-300 text-[11px] pt-1 border-t border-slate-800/80">
                  <span>Efficiency Ratio:</span>
                  <span className="font-mono">{measure.efficiencyRatio.toFixed(1)}% / ₹Lakh</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
