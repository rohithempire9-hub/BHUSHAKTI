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
  onOpenWarRoom?: () => void;
}

export const SihDemoBar: React.FC<SihDemoBarProps> = ({
  activeScenario,
  onSelectScenario,
  onOpenCopilot,
  onOpenWarRoom,
}) => {
  return (
    <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs shadow-2xs">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-mono font-bold text-[10px] tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>SIH CENTRAL EVALUATION DEMO BAR</span>
        </div>

        <span className="hidden md:inline-block text-slate-500 text-[11px] font-medium">
          Simulate official test cases:
        </span>

        {/* 5 Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectScenario('tawang_escalation')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'tawang_escalation'
                ? 'bg-red-600 text-white border-red-700 shadow-2xs'
                : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
            }`}
          >
            <Flame className="w-3 h-3 text-red-500" />
            <span>1. Tawang Escalation</span>
          </button>

          <button
            onClick={() => onSelectScenario('assam_flood')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'assam_flood'
                ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
            }`}
          >
            <Waves className="w-3 h-3 text-blue-500" />
            <span>2. Assam River Flood</span>
          </button>

          <button
            onClick={() => onSelectScenario('multi_cascade')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'multi_cascade'
                ? 'bg-purple-600 text-white border-purple-700 shadow-2xs'
                : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'
            }`}
          >
            <GitBranch className="w-3 h-3 text-purple-500" />
            <span>3. Multi-Hazard Cascade</span>
          </button>

          <button
            onClick={() => onSelectScenario('offline_outage')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'offline_outage'
                ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                : 'bg-white text-amber-800 border-amber-300 hover:bg-amber-50'
            }`}
          >
            <WifiOff className="w-3 h-3 text-amber-600" />
            <span>4. Offline Outage</span>
          </button>

          <button
            onClick={() => onSelectScenario('evidence_conflict')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeScenario === 'evidence_conflict'
                ? 'bg-purple-700 text-white border-purple-800 shadow-2xs'
                : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-purple-600" />
            <span>5. Evidence Conflict</span>
          </button>

          {activeScenario !== 'none' && (
            <button
              onClick={() => onSelectScenario('none')}
              className="px-2 py-1 rounded-lg bg-white text-slate-600 hover:text-slate-900 border border-slate-300 text-[10px] font-mono cursor-pointer transition-all flex items-center gap-1"
              title="Clear Scenario"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
          DEMO / SIMULATED DATA
        </span>

        {onOpenWarRoom && (
          <button
            onClick={onOpenWarRoom}
            className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-2xs cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Disaster War Room</span>
          </button>
        )}

        <button
          onClick={onOpenCopilot}
          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs cursor-pointer transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Ask Copilot</span>
        </button>
      </div>
    </div>
  );
};
