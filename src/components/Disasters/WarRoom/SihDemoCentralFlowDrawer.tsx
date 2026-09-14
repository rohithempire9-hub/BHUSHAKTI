import React, { useState } from 'react';
import {
  ListOrdered,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  Radio,
  Search
} from 'lucide-react';
import {
  SIH_38_STEP_DEMO_FLOW,
  SIH_EVALUATOR_SCENARIOS
} from '../../../services/bhuShaktiAdvancedIntelligence';

interface SihFlowProps {
  onSelectStepTab?: (tabKey: string) => void;
  onTriggerScenario?: (scenarioId: string) => void;
}

export const SihDemoCentralFlowDrawer: React.FC<SihFlowProps> = ({
  onSelectStepTab,
  onTriggerScenario
}) => {
  const [activeStage, setActiveStage] = useState<number | 'ALL'>('ALL');
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen-tawang-cloudburst');

  const toggleStep = (stepNum: number) => {
    setCompletedSteps((prev) =>
      prev.includes(stepNum) ? prev.filter((n) => n !== stepNum) : [...prev, stepNum]
    );
  };

  const markAllComplete = () => {
    setCompletedSteps(SIH_38_STEP_DEMO_FLOW.map((s) => s.stepNumber));
  };

  const resetAll = () => {
    setCompletedSteps([]);
  };

  const filteredSteps =
    activeStage === 'ALL'
      ? SIH_38_STEP_DEMO_FLOW
      : SIH_38_STEP_DEMO_FLOW.filter((s) => s.stageNumber === activeStage);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
              SMART INDIA HACKATHON (SIH) MASTER GUIDE
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              38-STEP END-TO-END DEMO FLOW
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
              8 EVALUATOR SCENARIOS
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Grand Finale Evaluation Checklist & Demonstration Walkthrough
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Guides evaluators and jury members through the complete, uninterrupted technological flow of BHUSAKTHI—from ground telemetry and multi-satellite InSAR fusion to automated CAP cellular broadcasting.
          </p>
        </div>

        {/* Completion Progress Badge */}
        <div className="flex items-center gap-3 bg-[#05102a] p-3 rounded-xl border border-cyan-500/30 shrink-0">
          <div className="text-center pr-3 border-r border-slate-700">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Demo Progress</div>
            <div className="text-2xl font-mono font-black text-cyan-300">
              {completedSteps.length}/{SIH_38_STEP_DEMO_FLOW.length}
            </div>
            <div className="text-[9px] text-slate-400">
              {Math.round((completedSteps.length / SIH_38_STEP_DEMO_FLOW.length) * 100)}% Verified
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={markAllComplete}
              className="px-2 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-[10px] font-bold text-white cursor-pointer"
            >
              Verify All
            </button>
            <button
              onClick={resetAll}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 8 SIH Evaluator Scenarios */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>8 Tested Evaluator Scenarios (Click to Load Demo Preset)</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Jury Ready</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {SIH_EVALUATOR_SCENARIOS.map((scen) => {
            const isSelected = selectedScenarioId === scen.id;
            return (
              <div
                key={scen.id}
                onClick={() => {
                  setSelectedScenarioId(scen.id);
                  if (onTriggerScenario) onTriggerScenario(scen.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#102047] border-amber-400 ring-1 ring-amber-400 shadow-md'
                    : 'bg-[#050e24] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono font-bold text-amber-300 px-1.5 py-0.2 rounded bg-amber-950 border border-amber-500/30">
                      SCENARIO
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[100px]">
                      {scen.location}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1 leading-snug">{scen.name}</h4>
                  <p className="text-[10px] text-slate-300 leading-relaxed mb-2">{scen.objective}</p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[10px] text-cyan-300 font-medium truncate">
                  ⚡ <strong>Key Tech:</strong> {scen.keyFeatureDemonstrated}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 Stages Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveStage('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeStage === 'ALL'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'bg-[#071330] text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All 38 Steps
        </button>
        {[1, 2, 3, 4, 5].map((stg) => {
          const names = [
            '1. Telemetry Acquisition',
            '2. Multi-Source Fusion',
            '3. Predictive Geotech',
            '4. Action & Evacuation',
            '5. Governance & Audit'
          ];
          return (
            <button
              key={stg}
              onClick={() => setActiveStage(stg)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeStage === stg
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[#071330] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {names[stg - 1]}
            </button>
          );
        })}
      </div>

      {/* 38-Step Chronological Step List */}
      <div className="space-y-2.5">
        {filteredSteps.map((step) => {
          const isDone = completedSteps.includes(step.stepNumber);
          return (
            <div
              key={step.stepNumber}
              className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDone
                  ? 'bg-[#06152e] border-emerald-500/40 shadow-sm'
                  : 'bg-[#050e24] border-slate-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleStep(step.stepNumber)}
                  className={`mt-0.5 p-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-[#0d214c] text-cyan-300 border border-cyan-500/30">
                      STEP {step.stepNumber}
                    </span>
                    <span className="text-xs font-bold text-white">{step.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">({step.stageName})</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-mono">
                    <span>Artifact: <strong className="text-amber-300">{step.expectedArtifact}</strong></span>
                    <span>Component: <strong className="text-cyan-300">{step.targetComponent}</strong></span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end">
                <button
                  onClick={() => toggleStep(step.stepNumber)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    isDone
                      ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30'
                      : 'bg-cyan-700 hover:bg-cyan-600 text-white'
                  }`}
                >
                  {isDone ? 'Verified ✓' : 'Verify Step'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
