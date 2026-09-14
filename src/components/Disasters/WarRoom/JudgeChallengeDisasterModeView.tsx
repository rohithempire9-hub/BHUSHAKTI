import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  Sliders,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Radio,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import {
  calculateJudgeChallengeScenario,
  getDisasterModeState
} from '../../../services/bhuShaktiAdvancedIntelligence';

interface JudgeChallengeProps {
  onActivateDisasterMode?: (active: boolean) => void;
  isDisasterModeActive?: boolean;
}

export const JudgeChallengeDisasterModeView: React.FC<JudgeChallengeProps> = ({
  onActivateDisasterMode,
  isDisasterModeActive = false
}) => {
  const [rainfallIncreasePct, setRainfallIncreasePct] = useState<number>(20);
  const [localDisasterActive, setLocalDisasterActive] = useState<boolean>(isDisasterModeActive);

  const scenario = calculateJudgeChallengeScenario(rainfallIncreasePct);
  const disasterMode = getDisasterModeState(localDisasterActive || isDisasterModeActive);

  const handleToggleDisasterMode = () => {
    const next = !(localDisasterActive || isDisasterModeActive);
    setLocalDisasterActive(next);
    if (onActivateDisasterMode) {
      onActivateDisasterMode(next);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
              FEATURE 35 • INTERACTIVE JUDGE CHALLENGE
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
              FEATURE 36 • ONE-CLICK DISASTER MODE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Stress Test & Live Disaster Simulator Engine
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Built specifically for SIH evaluators. Test extreme cloudburst scenarios (+10% to +50% rain) and activate simulated multi-hazard catastrophic state with automated cellular alerts.
          </p>
        </div>

        {/* Disaster Mode Master Trigger Button */}
        <div className="shrink-0">
          <button
            onClick={handleToggleDisasterMode}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xl flex items-center gap-2 cursor-pointer ${
              localDisasterActive || isDisasterModeActive
                ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400 animate-pulse'
                : 'bg-gradient-to-r from-rose-700 to-amber-600 hover:from-rose-600 hover:to-amber-500 text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>
              {localDisasterActive || isDisasterModeActive
                ? 'DISASTER MODE ACTIVE (CLICK TO DEACTIVATE)'
                : 'ONE-CLICK DISASTER MODE (SIMULATE EMERGENCY)'}
            </span>
          </button>
        </div>
      </div>

      {/* Feature 36: One-Click Disaster Mode Active Status Panel */}
      {(localDisasterActive || isDisasterModeActive) && (
        <div className="p-5 rounded-2xl bg-rose-950/40 border-2 border-rose-500/80 shadow-2xl space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm uppercase tracking-wider font-mono">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-spin" />
              <span>LIVE DISASTER MODE ACTIVE: {disasterMode.simulatedHazardZone}</span>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-900 text-white border border-rose-400 animate-pulse">
              LEVEL-3 EMERGENCY
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/30">
              <div className="text-[10px] text-slate-400">Simulated Rain Rate</div>
              <div className="text-lg font-mono font-bold text-rose-300">
                {disasterMode.simulatedRainfallRateMmH} mm/h (Cloudburst)
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/30">
              <div className="text-[10px] text-slate-400">Factor of Safety</div>
              <div className="text-lg font-mono font-bold text-rose-400">
                {disasterMode.simulatedFactorOfSafety.toFixed(2)} (FAILURE)
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/30">
              <div className="text-[10px] text-slate-400">Cell Broadcast SMS</div>
              <div className="text-lg font-mono font-bold text-emerald-400">
                {disasterMode.capAlertsDispatched ? 'DISPATCHED (3,200)' : 'STANDBY'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-black/40 border border-rose-500/30">
              <div className="text-[10px] text-slate-400">NDRF Staging</div>
              <div className="text-lg font-mono font-bold text-amber-300">
                {disasterMode.rescueTeamsMobilized} TEAMS DEPLOYED
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature 35: Interactive Judge Challenge Slider & Scenarios */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">
                SIH Evaluator Challenge: "What if rainfall increases?"
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Select preset or drag slider to test model resilience:
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5">
            {[10, 20, 30, 50].map((pct) => (
              <button
                key={pct}
                onClick={() => setRainfallIncreasePct(pct)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  rainfallIncreasePct === pct
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                +{pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <div className="p-4 rounded-xl bg-[#050e24] border border-slate-800 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-200">
            <span>Precipitation Delta:</span>
            <span className="font-mono text-amber-400 text-sm">+{rainfallIncreasePct}% Over Forecast</span>
          </div>
          <input
            type="range"
            min={5}
            max={75}
            value={rainfallIncreasePct}
            onChange={(e) => setRainfallIncreasePct(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* Live Re-calculation Result */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#06122d] border border-slate-800">
            <div className="text-[10px] text-slate-400">Projected Rainfall</div>
            <div className="text-base font-mono font-bold text-cyan-300">
              {scenario.projectedRainfallMmH.toFixed(1)} mm/h
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#06122d] border border-slate-800">
            <div className="text-[10px] text-slate-400">Factor of Safety</div>
            <div
              className={`text-base font-mono font-bold ${
                scenario.resultingFactorOfSafety < 1.0 ? 'text-rose-400' : 'text-amber-400'
              }`}
            >
              {scenario.resultingFactorOfSafety.toFixed(2)} ({scenario.resultingFactorOfSafety < 1.0 ? 'FAILURE' : 'CRITICAL'})
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#06122d] border border-slate-800">
            <div className="text-[10px] text-slate-400">Time to Slip Surface</div>
            <div className="text-base font-mono font-bold text-amber-400">
              {scenario.estimatedHoursToSlopeFailure} hours
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#06122d] border border-slate-800">
            <div className="text-[10px] text-slate-400">Evacuation Population</div>
            <div className="text-base font-mono font-bold text-rose-300">
              {scenario.evacuationPopulationNeeded.toLocaleString()} citizens
            </div>
          </div>
        </div>

        {/* AI Judge Feedback Summary */}
        <div className="p-4 rounded-xl bg-[#091b3e] border border-cyan-500/30 text-xs text-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-cyan-300">
            <Sparkles className="w-4 h-4" />
            <span>AI Automated Operational Adjustment:</span>
          </div>
          <p className="leading-relaxed">{scenario.recommendedSystemResponse}</p>
        </div>
      </div>
    </div>
  );
};
