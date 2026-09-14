import React, { useState } from 'react';
import { ShieldCheck, UserCheck, FileText, MapPin } from 'lucide-react';
import { generateFieldVerificationTask, evaluateFieldReportTrust, AI_DECISION_AUDIT_LOGS, calculateDisasterLearningScore } from '../../../services/bhuShaktiAdvancedIntelligence';

export const FieldVerificationTrustAuditView: React.FC = () => {
  const [task] = useState(() => generateFieldVerificationTask('Tawang Sela Pass'));
  const [overriddenIds, setOverriddenIds] = useState<string[]>([]);
  const [officerRank, setOfficerRank] = useState<'SUPERVISING_OFFICER' | 'QRT_LEAD' | 'CIVIL_DEFENSE' | 'ANONYMOUS_REPORT'>('QRT_LEAD');
  const [gpsMatched, setGpsMatched] = useState(true);
  const [hasPhoto, setHasPhoto] = useState(true);
  const [minutesElapsed, setMinutesElapsed] = useState(12);
  const learningScore = calculateDisasterLearningScore();
  const trustResult = evaluateFieldReportTrust({
    id: 'REP-9921',
    reporterName: officerRank === 'SUPERVISING_OFFICER' ? 'SDMA Supervising Officer' : officerRank === 'QRT_LEAD' ? 'QRT Patrol Lead' : 'Civil Defense Volunteer',
    gpsValid: gpsMatched,
    hasPhoto,
    minutesElapsed
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">FEATURE 28 • FIELD TASK DISPATCH</span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">FEATURE 29 • REPORT TRUST SCORER</span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">FEATURE 32 • DECISION AUDIT LOG</span>
          </div>
          <h2 className="text-xl font-bold text-white">Field Verification, Trust Verification & AI Audit Logs</h2>
          <p className="text-xs text-slate-300 max-w-3xl mt-1">Cross-check field evidence, score report trust, and preserve a human-overrideable audit trail.</p>
        </div>
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-purple-500/30 text-right shrink-0"><div className="text-[10px] text-slate-400 uppercase">Model Grade</div><div className="text-2xl font-black text-purple-300">{learningScore.predictionAccuracyGrade}</div><div className="text-[10px] text-emerald-400 font-bold">Lead Time: {learningScore.leadTimeHours}h</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-amber-400" />Ground Field Verification Task</h3>
          <div className="p-4 rounded-xl bg-[#050e24] border border-slate-800 text-xs space-y-3">
            <div className="flex justify-between gap-3"><span>Task ID: <strong className="font-mono text-white">{task.taskId}</strong></span><span>Priority: <strong className="text-rose-300">{task.priority}</strong></span></div>
            <div className="font-bold text-white">{task.title}</div>
            <div className="text-slate-300"><strong>Assigned:</strong> {task.assignedToSector}</div>
            <div className="text-slate-300"><strong>Coordinates:</strong> {task.targetCoordinates[0].toFixed(4)}°N, {task.targetCoordinates[1].toFixed(4)}°E</div>
            <div className="text-slate-300"><strong>Reason:</strong> {task.reason}</div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300"><strong>Status:</strong> {task.status} • Photo upload: {task.hasPhotoUpload ? 'YES' : 'NO'} • Video: {task.hasVideoUpload ? 'YES' : 'NO'}</div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><UserCheck className="w-4 h-4 text-emerald-400" />Field Intelligence Trust Scorer</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800"><div className="text-[10px] text-slate-400 mb-1">Reporter</div><select value={officerRank} onChange={(e) => setOfficerRank(e.target.value as typeof officerRank)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200"><option value="SUPERVISING_OFFICER">SDMA Officer</option><option value="QRT_LEAD">QRT Patrol Lead</option><option value="CIVIL_DEFENSE">Civil Defense Volunteer</option><option value="ANONYMOUS_REPORT">Anonymous Citizen</option></select></div>
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800"><div className="text-[10px] text-slate-400 mb-1">GPS EXIF</div><button onClick={() => setGpsMatched(v => !v)} className={`w-full py-1 rounded text-xs font-bold cursor-pointer ${gpsMatched ? 'bg-emerald-700 text-white' : 'bg-rose-800 text-white'}`}>{gpsMatched ? 'Matched ✓' : 'Mismatch'}</button></div>
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800"><div className="text-[10px] text-slate-400 mb-1">Photo Evidence</div><button onClick={() => setHasPhoto(v => !v)} className={`w-full py-1 rounded text-xs font-bold cursor-pointer ${hasPhoto ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-300'}`}>{hasPhoto ? 'Verified ✓' : 'Missing'}</button></div>
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800"><div className="text-[10px] text-slate-400 mb-1">Freshness: {minutesElapsed}m</div><input type="range" min={2} max={120} value={minutesElapsed} onChange={(e) => setMinutesElapsed(Number(e.target.value))} className="w-full accent-cyan-400 cursor-pointer" /></div>
          </div>
          <div className="p-3 rounded-xl bg-[#071330] border border-slate-800 text-xs text-cyan-200"><strong>Trust:</strong> {trustResult.status} ({trustResult.overallTrustScorePct}/100)<br /><span className="text-slate-300">{trustResult.aiImageAnalysisSummary}</span></div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-cyan-400" />AI Decision Audit Trail & Human Override</h3>
        {AI_DECISION_AUDIT_LOGS.map((log) => {
          const active = overriddenIds.includes(log.decisionId);
          return <div key={log.decisionId} className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${active ? 'bg-[#1b1228] border-amber-500/50' : 'bg-[#050e24] border-slate-800'}`}>
            <div><div className="font-mono text-cyan-300">{log.timestamp} • {log.systemRecommendation} • {log.confidencePct}%</div><div className="text-slate-300 mt-1">{log.actionTakenByAuthority}</div><div className="text-[10px] text-slate-400">Zone: {log.incidentZone} • Inputs: {log.inputsEvaluated.join(', ')}</div></div>
            <button onClick={() => setOverriddenIds(prev => active ? prev.filter(id => id !== log.decisionId) : [...prev, log.decisionId])} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${active ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>{active ? 'Human Override Active' : 'Engage Override'}</button>
          </div>;
        })}
      </div>
    </div>
  );
};
