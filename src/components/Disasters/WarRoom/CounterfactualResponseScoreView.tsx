import React, { useState } from 'react';
import {
  GitCompare,
  Award,
  ShieldCheck,
  TrendingUp,
  Clock,
  Users,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import {
  getCounterfactualComparison,
  calculateAiResponseScore
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const CounterfactualResponseScoreView: React.FC = () => {
  const [activeZone, setActiveZone] = useState<string>('Tawang Sela Pass');

  const counterfactual = getCounterfactualComparison();
  const score = calculateAiResponseScore();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40">
              FEATURE 21 • COUNTERFACTUAL DISASTER AI
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              FEATURE 22 • POST-INCIDENT AUDIT SCORE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Counterfactual Impact Analysis & Response Performance
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Compares exact real-world outcomes achieved through automated AI early intervention against a modeled counterfactual baseline of conventional uncoordinated disaster response.
          </p>
        </div>

        {/* Response Score Badge */}
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-emerald-500/30 text-xs shrink-0 flex items-center gap-3">
          <Award className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Audit Score</div>
            <div className="text-2xl font-mono font-black text-emerald-400">{score.overallScore}/100</div>
            <div className="text-[10px] text-slate-300 font-bold">{score.grade} Grade</div>
          </div>
        </div>
      </div>

      {/* Feature 21: Side-by-Side Counterfactual Comparison */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-cyan-400" />
            <span>Actual Execution (WITH AI) vs Counterfactual Reality (WITHOUT AI)</span>
          </h3>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">
            Simulated Counterfactual Differential
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Column A: Without AI (Counterfactual Baseline) */}
          <div className="p-4 rounded-xl bg-[#1f0b14] border border-rose-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-rose-500/30 pb-2">
              <span className="font-bold text-rose-300 text-xs uppercase font-mono">
                Conventional Response (Without AI)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300">
                LATE ACTION
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Alert Warning Lead Time:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {counterfactual.withoutAiScenario.alertLeadTimeMinutes} minutes (Panic)
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Casualties / Injuries:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {counterfactual.withoutAiScenario.casualtiesCount} casualties / {counterfactual.withoutAiScenario.injuriesCount} injuries
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Road Blockage Duration:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {counterfactual.withoutAiScenario.roadBlockageDurationHours} hours
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Economic Loss:</span>
                <span className="font-mono text-rose-400 font-bold">
                  ₹{counterfactual.withoutAiScenario.economicLossCrInr} Crores
                </span>
              </div>
            </div>

            <div className="text-[11px] text-rose-300/80 pt-2 border-t border-rose-500/20">
              Citizens received notification only when physical mud blocked the road, trapping 14 passenger vehicles and cutting off hospital supply chains.
            </div>
          </div>

          {/* Column B: With AI (BhuShakti Automated) */}
          <div className="p-4 rounded-xl bg-[#091f24] border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2">
              <span className="font-bold text-emerald-300 text-xs uppercase font-mono">
                BhuShakti Proactive Execution (With AI)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300">
                PREVENTIVE
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Alert Warning Lead Time:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {counterfactual.withAiScenario.alertLeadTimeMinutes} minutes lead time
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Casualties / Injuries:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {counterfactual.withAiScenario.casualtiesCount} casualties / {counterfactual.withAiScenario.injuriesCount} minor
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Road Blockage Duration:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {counterfactual.withAiScenario.roadBlockageDurationHours} hours (Pre-staged JCBs)
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total Economic Loss:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ₹{counterfactual.withAiScenario.economicLossCrInr} Crores
                </span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-300/80 pt-2 border-t border-emerald-500/20">
              Early highway cordon averted 14 passenger vehicle entombments; pre-evacuation of Lumla corridor protected 450 vulnerable citizens.
            </div>
          </div>
        </div>

        {/* Delta Summary */}
        <div className="p-3 rounded-xl bg-[#050e24] border border-slate-800 flex flex-wrap items-center justify-around gap-3 text-xs">
          <div className="text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Lives Saved</div>
            <div className="text-lg font-mono font-black text-emerald-400">
              +{counterfactual.netLivesSaved} Lives
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Injuries Prevented</div>
            <div className="text-lg font-mono font-black text-cyan-300">
              +{counterfactual.netInjuriesPrevented} Prevented
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Loss Reduction</div>
            <div className="text-lg font-mono font-black text-emerald-400">
              ₹{counterfactual.netEconomicSavingsCrInr} Cr Saved
            </div>
          </div>
        </div>
      </div>

      {/* Feature 22: Post-Incident Response Scorecard */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Response Category Evaluation & Lessons Learned</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Automated NDMA Audit Metrics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { category: 'Speed & Triage', score: score.breakdown.speedScore, maxScore: 25, remarks: 'Immediate siren within 120s' },
            { category: 'Risk Reduction', score: score.breakdown.riskReductionScore, maxScore: 25, remarks: 'Cordon averted highway runout exposure' },
            { category: 'Population Protection', score: score.breakdown.populationProtectionScore, maxScore: 20, remarks: '420 citizens pre-evacuated' },
            { category: 'Route Efficiency', score: score.breakdown.routeEfficiencyScore, maxScore: 15, remarks: 'Bypass R-15 cleared without jams' },
            { category: 'Resource Efficiency', score: score.breakdown.resourceEfficiencyScore, maxScore: 15, remarks: 'Standby earthmovers staged in position' }
          ].map((cat, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-[#050e24] border border-slate-800 text-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white text-xs">{cat.category}</span>
                <span className="font-mono font-bold text-emerald-400">
                  {cat.score}/{cat.maxScore}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">{cat.remarks}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
