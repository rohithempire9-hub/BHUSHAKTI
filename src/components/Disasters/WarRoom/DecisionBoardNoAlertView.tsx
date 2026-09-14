import React, { useState } from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, Send } from 'lucide-react';
import { evaluateAiNoAlertDecision, EMERGENCY_DECISION_BOARD_ITEMS } from '../../../services/bhuShaktiAdvancedIntelligence';

export const DecisionBoardNoAlertView: React.FC = () => {
  // The service/type contract uses evaluateAiNoAlertDecision() with no object argument.
  const [noAlertData] = useState(() => evaluateAiNoAlertDecision());
  const [authorizedIds, setAuthorizedIds] = useState<string[]>(['EDB-01']);

  const handleAuthorize = (itemId: string) => {
    setAuthorizedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">FEATURE 20 • AI NO-ALERT DECISION LOG</span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">FEATURE 23 • EMERGENCY DECISION BOARD</span>
          </div>
          <h2 className="text-xl font-bold text-white">Commander Decision Board & False Alarm Elimination</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">Shows why BHUSAKTHI suppresses a false emergency and presents the current executive authorization grid.</p>
        </div>
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-emerald-500/30 text-xs shrink-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase">AI Decision</div>
          <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">{noAlertData.alertDecision === 'DO_NOT_SEND_ALERT_YET' ? 'NO ALERT' : 'ALERT REQUIRED'}</div>
          <div className="text-[10px] text-slate-400 mt-1">Confidence: <span className="text-white font-bold">{noAlertData.confidencePct}%</span></div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400" /><h3 className="text-sm font-bold text-white">Why BHUSAKTHI Decided NOT to Broadcast a False Emergency</h3></div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">CONFIDENCE: {noAlertData.confidencePct}%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#050e24] border border-slate-800 text-xs space-y-2.5">
          <div className="flex items-center justify-between text-slate-300"><span>Evaluated Location: <strong>{noAlertData.locationName}</strong></span><span className="font-mono text-slate-400">Risk: {noAlertData.finalRiskScore}/100</span></div>
          <p className="text-slate-300 leading-relaxed">{noAlertData.primaryReason}</p>
          <div className="text-emerald-300 text-[11px]">Benefit: {noAlertData.preventedFalseAlarmBenefit}</div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><AlertOctagon className="w-4 h-4 text-cyan-400" /><h3 className="text-sm font-bold text-white">Emergency Decision Board</h3></div><span className="text-[10px] font-mono text-cyan-300">Authorized: {authorizedIds.length} / {EMERGENCY_DECISION_BOARD_ITEMS.length}</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {EMERGENCY_DECISION_BOARD_ITEMS.map((item) => {
            const isAuth = authorizedIds.includes(item.id);
            return (
              <div key={item.id} className={`p-4 rounded-xl border transition-all ${isAuth ? 'bg-[#0a203f] border-emerald-500/60 ring-1 ring-emerald-500/30' : 'bg-[#050e24] border-slate-800'}`}>
                <div className="flex items-center justify-between mb-2"><span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">{item.exposureLevel} EXPOSURE</span><span className="text-xs font-mono text-slate-400">Risk {item.riskScore}</span></div>
                <h4 className="text-sm font-bold text-white mb-1">{item.eventName}</h4>
                <p className="text-xs text-slate-300 mb-3">{item.recommendedAction}</p>
                <div className="p-2.5 rounded-lg bg-[#071330] border border-slate-800 text-xs space-y-1 mb-3">
                  <div className="text-slate-300"><strong>Roads:</strong> {item.affectedRoads.join(', ')}</div>
                  <div className="text-slate-300"><strong>Villages:</strong> {item.affectedVillages.join(', ')}</div>
                  <div className="text-cyan-300"><strong>Weather:</strong> {item.weatherStatus}</div>
                  <div className="text-slate-400"><strong>Satellite:</strong> {item.satelliteObservationSummary}</div>
                  <div className="text-amber-300"><strong>SMS:</strong> {item.smsStatus} • <strong>Field:</strong> {item.fieldTeamStatus}</div>
                </div>
                <button onClick={() => handleAuthorize(item.id)} className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${isAuth ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}>
                  {isAuth ? <><CheckCircle2 className="w-3.5 h-3.5" /><span>Authorized by Commander ✓</span></> : <><Send className="w-3.5 h-3.5" /><span>Authorize Order Now</span></>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};