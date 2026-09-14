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
  Zap
} from 'lucide-react';
import {
  getDisasterChainBreakerModel,
  PREVENTION_ROI_MEASURES
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const ChainBreakerRoiView: React.FC = () => {
  const [activeInterventions, setActiveInterventions] = useState<string[]>([
    'int-drainage',
    'int-road-closure'
  ]);

  const chainModel = getDisasterChainBreakerModel(activeInterventions);

  const toggleIntervention = (interventionId: string) => {
    setActiveInterventions((prev) =>
      prev.includes(interventionId)
        ? prev.filter((id) => id !== interventionId)
        : [...prev, interventionId]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
              FEATURE 11 • DISASTER CHAIN BREAKER
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              FEATURE 19 • PREVENTION ROI SIMULATOR
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Cascade Chain Interventions & Cost-Benefit Modeling
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Identifies precise tactical intervention gates along the cascading domino failure path. Switch interventions on or off to simulate direct risk reduction and maximize disaster prevention ROI.
          </p>
        </div>

        {/* Live Risk Reduction Badge */}
        <div className="flex items-center gap-3 bg-[#06112c] p-3 rounded-xl border border-purple-500/30 shrink-0">
          <div className="text-center pr-3 border-r border-slate-700">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Baseline Risk</div>
            <div className="text-lg font-mono font-bold text-rose-400">{chainModel.baselineRiskScore}/100</div>
          </div>
          <div className="text-center pr-3 border-r border-slate-700">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Current Risk</div>
            <div className="text-2xl font-mono font-black text-emerald-400">{chainModel.currentRiskScore}/100</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Modeled Reduction</div>
            <div className="text-sm font-mono font-bold text-cyan-300">
              -{chainModel.totalRiskReductionPct}% Risk / -{chainModel.totalExposureReductionPct}% Exp
            </div>
          </div>
        </div>
      </div>

      {/* Chain Breaker Visual Node Graph */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Tactical Intervention Points (Click to Apply / Sever Cascade)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-300">
            {activeInterventions.length} of {chainModel.chainLinks.length} Gates Applied
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {chainModel.chainLinks.map((link) => {
            const int = link.availableIntervention;
            if (!int) return null;
            const isApplied = int.isApplied;

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
                      {isApplied ? 'CASCADE BROKEN' : 'UNMITIGATED'}
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
                  <span>{isApplied ? 'Intervention Applied ✓' : 'Apply Intervention'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prevention ROI Simulator (Feature 19) */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Prevention ROI Simulator (Cost in Lakhs vs Modeled Risk Reduction %)
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
