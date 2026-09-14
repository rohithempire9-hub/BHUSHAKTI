import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Send,
  Sparkles,
  Users
} from 'lucide-react';
import {
  evaluateAiNoAlertDecision,
  EMERGENCY_DECISION_BOARD_ITEMS
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const DecisionBoardNoAlertView: React.FC = () => {
  const [noAlertData] = useState(() => evaluateAiNoAlertDecision(null));
  const [boardItems, setBoardItems] = useState(() => EMERGENCY_DECISION_BOARD_ITEMS);
  const [authorizedIds, setAuthorizedIds] = useState<string[]>(['dec-close-nh13']);

  const handleAuthorize = (itemId: string) => {
    setAuthorizedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              FEATURE 20 • AI NO-ALERT DECISION LOG
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              FEATURE 23 • EMERGENCY DECISION BOARD
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Commander Decision Board & False Alarm Elimination
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Proves why AI <em>chose not to alert</em> during localized sensor spikes (saving millions in unnecessary panic and transit stoppage) alongside pending executive action authorizations.
          </p>
        </div>

        {/* Savings Badge */}
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-emerald-500/30 text-xs shrink-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Avoided False Alarm Loss</div>
          <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">
            ₹{noAlertData.falseAlarmAvoidanceSavingsLakhs} Lakhs Saved
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Civilian Panic Avoided: <span className="text-white font-bold">14,500 residents</span>
          </div>
        </div>
      </div>

      {/* Feature 20: AI No-Alert Decision Explanation Card */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              Why BHUSAKTHI Decided NOT to Broadcast False Emergency
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
            CONFIDENCE: {noAlertData.confidencePct}%
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#050e24] border border-slate-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-300">
            <span>Evaluated Location: <strong>{noAlertData.evaluatedZone}</strong></span>
            <span className="font-mono text-slate-400">Timestamp: {noAlertData.timestamp}</span>
          </div>

          <p className="text-slate-300 leading-relaxed">
            {noAlertData.reasonNotToAlert}
          </p>
        </div>

        {/* 3 Validation Gates Passed */}
        <div>
          <div className="text-xs font-bold text-slate-200 mb-2">3 Multi-Sensor Validation Gates:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {noAlertData.validationGatesPassed.map((gate, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#06112c] border border-slate-800 text-xs flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">{gate.gateName}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">{gate.evidence}</div>
                  <span className="inline-block mt-1.5 px-2 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    PASSED SAFETY GATE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature 23: Emergency Decision Board */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Emergency Decision Board (Authorized Actions: {authorizedIds.length} of {boardItems.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300">
            District Magistrate & Incident Commander Authorization Grid
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boardItems.map((item) => {
            const isAuth = authorizedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isAuth
                    ? 'bg-[#0a203f] border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-md'
                    : 'bg-[#050e24] border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        item.urgency === 'IMMEDIATE'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : item.urgency === 'WITHIN_1_HOUR'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {item.urgency.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">Auth: {item.authorizedRole}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">{item.description}</p>

                  <div className="p-2.5 rounded-lg bg-[#071330] border border-slate-800 text-xs space-y-1 mb-3">
                    <div className="text-emerald-400">
                      <strong>AI Recommendation:</strong> {item.aiRecommendation}
                    </div>
                    <div className="text-rose-300">
                      <strong>Risk if Deferred:</strong> {item.consequenceOfDelay}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAuthorize(item.id)}
                  className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isAuth
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg'
                  }`}
                >
                  {isAuth ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authorized by Commander ✓</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Authorize Order Now</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
