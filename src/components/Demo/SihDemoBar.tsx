import React from 'react';
import {
  Sparkles,
  Flame,
  Waves,
  GitBranch,
  WifiOff,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';

export type DemoScenarioId =
  | 'none'
  | 'tawang_escalation'
  | 'assam_flood'
  | 'multi_cascade'
  | 'offline_outage'
  | 'evidence_conflict';

interface SihDemoBarProps {
  activeScenario: DemoScenarioId;
  onSelectScenario: (scenario: DemoScenarioId) => void;
  onOpenCopilot: () => void;
}

export const SihDemoBar: React.FC<SihDemoBarProps> = ({
  activeScenario,
  onSelectScenario,
  onOpenCopilot,
}) => {
  return (
    <div className="bg-[#060e22] border-b border-[#142857] px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[10px] tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>SIH CENTRAL EVALUATION DEMO BAR</span>
        </div>

        <span className="hidden md:inline-block text-slate-400 text-[11px]">
          Simulate official test cases:
        </span>

        {/* 5 Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectScenario('tawang_escalation')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'tawang_escalation'
                ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-900/40'
                : 'bg-[#0a183d] text-rose-300 border-rose-500/30 hover:bg-[#0e2150]'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>1. Tawang Escalation</span>
          </button>

          <button
            onClick={() => onSelectScenario('assam_flood')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'assam_flood'
                ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-900/40'
                : 'bg-[#0a183d] text-cyan-300 border-cyan-500/30 hover:bg-[#0e2150]'
            }`}
          >
            <Waves className="w-3 h-3" />
            <span>2. Assam River Flood</span>
          </button>

          <button
            onClick={() => onSelectScenario('multi_cascade')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'multi_cascade'
                ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900/40'
                : 'bg-[#0a183d] text-purple-300 border-purple-500/30 hover:bg-[#0e2150]'
            }`}
          >
            <GitBranch className="w-3 h-3" />
            <span>3. Multi-Hazard Cascade</span>
          </button>

          <button
            onClick={() => onSelectScenario('offline_outage')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'offline_outage'
                ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-900/40'
                : 'bg-[#0a183d] text-amber-300 border-amber-500/30 hover:bg-[#0e2150]'
            }`}
          >
            <WifiOff className="w-3 h-3" />
            <span>4. Offline Outage</span>
          </button>

          <button
            onClick={() => onSelectScenario('evidence_conflict')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'evidence_conflict'
                ? 'bg-fuchsia-600 text-white border-fuchsia-400 shadow-md shadow-fuchsia-900/40'
                : 'bg-[#0a183d] text-fuchsia-300 border-fuchsia-500/30 hover:bg-[#0e2150]'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>5. Evidence Conflict</span>
          </button>

          {activeScenario !== 'none' && (
            <button
              onClick={() => onSelectScenario('none')}
              className="px-2 py-1 rounded-lg bg-[#0e204c] text-slate-400 hover:text-white border border-slate-700 text-[10px] font-mono cursor-pointer transition-all flex items-center gap-1"
              title="Clear Scenario"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
          DEMO / SIMULATED DATA
        </span>
        <button
          onClick={onOpenCopilot}
          className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Ask Copilot</span>
        </button>
      </div>
    </div>
  );
};
