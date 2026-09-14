import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldAlert,
  Send,
  Radio,
  FileText,
  Building2,
  Users,
  Car
} from 'lucide-react';
import { getFirst10MinutesPlan } from '../../../services/bhuShaktiAdvancedIntelligence';
import { First10MinutesPlan, First10MinutesStep } from '../../../types/bhuShaktiIntelligenceExtended';

export const First10MinutesPlannerView: React.FC = () => {
  const [plan, setPlan] = useState<First10MinutesPlan>(() => getFirst10MinutesPlan('Tawang Sela Pass'));
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [activeSeconds, setActiveSeconds] = useState<number>(145); // start at 2m 25s
  const [selectedPhase, setSelectedPhase] = useState<'ALL' | '0-2_MIN' | '2-5_MIN' | '5-10_MIN'>('ALL');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setActiveSeconds((prev) => (prev >= 600 ? 600 : prev + 1));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const toggleStep = (stepId: string) => {
    setPlan((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => {
        if (s.id === stepId) {
          const nextStatus: any =
            s.status === 'COMPLETED' ? 'PENDING' : s.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
          return { ...s, status: nextStatus };
        }
        return s;
      })
    }));
  };

  const handleFastForward = (targetSecs: number) => {
    setActiveSeconds(targetSecs);
  };

  const resetPlanner = () => {
    setActiveSeconds(0);
    setIsTimerRunning(false);
    setPlan(getFirst10MinutesPlan('Tawang Sela Pass'));
  };

  const formatMinSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredSteps =
    selectedPhase === 'ALL' ? plan.steps : plan.steps.filter((s) => s.phase === selectedPhase);

  const completedCount = plan.steps.filter((s) => s.status === 'COMPLETED').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header Banner with Countdown Timer and Controls */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1d48] via-[#091638] to-[#060e22] border border-[#1e3a78] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
              FEATURE 6 • GOLD STANDARD PROTOCOL
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              NDMA / SDMA TIME-CRITICAL SOP
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>First 10 Minutes Response Planner</span>
            <span className="text-xs font-mono font-normal text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
              {plan.zoneName}
            </span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Immediate chronological action sequence initiated from the exact second high-risk failure criteria are detected. Eliminates decision paralysis between telemetry crest and physical ground impact.
          </p>
        </div>

        {/* Live Elapsed Clock & Speed Controls */}
        <div className="flex items-center gap-3 bg-[#050e24] p-3 rounded-xl border border-cyan-500/40 shadow-inner">
          <div className="text-center pr-3 border-r border-slate-700">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Elapsed Time</div>
            <div className="text-2xl font-mono font-black text-cyan-300 tracking-wider">
              {formatMinSec(activeSeconds)}
            </div>
            <div className="text-[9px] text-slate-400">Target: 10:00 max</div>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                isTimerRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>{isTimerRunning ? 'Pause Clock' : 'Start Simulation'}</span>
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleFastForward(120)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                title="Jump to 2 mins"
              >
                +2m
              </button>
              <button
                onClick={() => handleFastForward(300)}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                title="Jump to 5 mins"
              >
                +5m
              </button>
              <button
                onClick={resetPlanner}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300"
                title="Reset"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Timeline Flow Bar */}
      <div className="bg-[#071330] border border-[#152a5c] rounded-xl p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-slate-200">Incident Progression Phases:</span>
          <span className="font-mono text-cyan-300 font-bold">
            {completedCount} of {plan.steps.length} Steps Completed ({Math.round((completedCount / plan.steps.length) * 100)}%)
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedPhase('0-2_MIN')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedPhase === '0-2_MIN'
                ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-400'
                : 'bg-[#0a183c] border-[#183168] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase">Phase 1 (0–2 Min)</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div className="text-xs font-bold text-white mt-0.5">Verification & Triage</div>
            <div className="text-[10px] text-slate-400 mt-1">Multi-sensor check, InSAR & DEOC notify</div>
          </button>

          <button
            onClick={() => setSelectedPhase('2-5_MIN')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedPhase === '2-5_MIN'
                ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400'
                : 'bg-[#0a183c] border-[#183168] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase">Phase 2 (2–5 Min)</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-xs font-bold text-white mt-0.5">Assessment & Ground Order</div>
            <div className="text-[10px] text-slate-400 mt-1">Isolate NH-13 KM 44, triage Village V04</div>
          </button>

          <button
            onClick={() => setSelectedPhase('5-10_MIN')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedPhase === '5-10_MIN'
                ? 'bg-rose-950/60 border-rose-400 ring-1 ring-rose-400'
                : 'bg-[#0a183c] border-[#183168] hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-rose-300 uppercase">Phase 3 (5–10 Min)</span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </div>
            <div className="text-xs font-bold text-white mt-0.5">Alert, Evac & Resources</div>
            <div className="text-[10px] text-slate-400 mt-1">CAP Geo-SMS, Route R-15, Stage JCB & QRT</div>
          </button>
        </div>

        {selectedPhase !== 'ALL' && (
          <div className="mt-2 text-right">
            <button
              onClick={() => setSelectedPhase('ALL')}
              className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
            >
              Show all 9 chronological steps
            </button>
          </div>
        )}
      </div>

      {/* 3. Steps Checklist Cards */}
      <div className="space-y-2.5">
        {filteredSteps.map((step) => {
          const isDone = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';

          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isDone
                  ? 'bg-[#06152e] border-emerald-500/40 shadow-sm'
                  : isInProgress
                  ? 'bg-[#0a1a3f] border-cyan-400 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-[#08122c] border-[#142654] opacity-85'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleStep(step.id)}
                  className={`mt-0.5 p-1 rounded-lg border transition-all cursor-pointer shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : isInProgress
                      ? 'bg-cyan-900 border-cyan-400 text-cyan-300 animate-pulse'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                  title="Click to toggle status"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0f2452] text-cyan-300 border border-cyan-500/30">
                      {step.timeRange}
                    </span>
                    <span className="text-sm font-bold text-white">{step.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : isInProgress
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{step.action}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Building2 className="w-3 h-3 text-cyan-400" />
                      <strong>Target:</strong> {step.targetAgency}
                    </span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <FileText className="w-3 h-3" />
                      <strong>Artifact:</strong> {step.outputArtifact}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  onClick={() => toggleStep(step.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e214d] hover:bg-[#142d68] border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {isDone ? 'Mark Pending' : isInProgress ? 'Complete Step' : 'Initiate Step'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
