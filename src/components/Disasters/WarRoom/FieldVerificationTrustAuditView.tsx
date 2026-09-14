import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  FileText,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Sliders,
  History
} from 'lucide-react';
import {
  generateFieldVerificationTask,
  evaluateFieldReportTrust,
  AI_DECISION_AUDIT_LOGS,
  calculateDisasterLearningScore
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const FieldVerificationTrustAuditView: React.FC = () => {
  const [task] = useState(() => generateFieldVerificationTask('Tawang Sela Pass'));
  const [auditLogs] = useState(() => AI_DECISION_AUDIT_LOGS);
  const [learningScore] = useState(() => calculateDisasterLearningScore());
  const [overriddenIds, setOverriddenIds] = useState<string[]>([]);

  // Interactive trust score inputs
  const [officerRank, setOfficerRank] = useState<'SUPERVISING_OFFICER' | 'QRT_LEAD' | 'CIVIL_DEFENSE' | 'ANONYMOUS_REPORT'>('QRT_LEAD');
  const [gpsMatched, setGpsMatched] = useState<boolean>(true);
  const [hasPhoto, setHasPhoto] = useState<boolean>(true);
  const [minutesElapsed, setMinutesElapsed] = useState<number>(12);

  const trustResult = evaluateFieldReportTrust({
    id: 'REP-9921',
    reporterName: officerRank === 'SUPERVISING_OFFICER' ? 'SDMA Supervising Officer' : officerRank === 'QRT_LEAD' ? 'QRT Patrol Lead' : 'Civil Defense Volunteer',
    gpsValid: gpsMatched,
    hasPhoto,
    minutesElapsed
  });

  const handleToggleOverride = (decisionId: string) => {
    setOverriddenIds((prev) =>
      prev.includes(decisionId) ? prev.filter((id) => id !== decisionId) : [...prev, decisionId]
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
              FEATURE 28 • FIELD TASK DISPATCH
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              FEATURE 29 • REPORT TRUST SCORER
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              FEATURE 32 • DECISION AUDIT LOG
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-500/40">
              FEATURE 33 • LEARNING SCORE
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Field Verification, Trust Verification & AI Audit Logs
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Validates field intelligence with rigorous cryptographic and geospatial trust scoring while maintaining a complete, human-overrideable black-box audit trail for every AI operational order.
          </p>
        </div>

        {/* Learning Score Badge */}
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-purple-500/30 text-xs shrink-0 text-right">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Model Grade</div>
          <div className="text-2xl font-mono font-black text-purple-300 mt-0.5">
            {learningScore.predictionAccuracyGrade}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold">
            Lead Time: {learningScore.leadTimeHours} Hours Advance Warning
          </div>
        </div>
      </div>

      {/* Feature 28 & 29: Field Task & Trust Scoring Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Field Task Dispatch (Feature 28) */}
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Ground Field Verification Task Assignment</span>
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
              {task.priorityLevel} PRIORITY
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#050e24] border border-slate-800 text-xs space-y-3">
            <div className="flex justify-between items-center text-slate-300">
              <span>Task ID: <strong className="font-mono text-white">{task.taskId}</strong></span>
              <span>Assigned Unit: <strong className="text-cyan-300">{task.assignedUnit}</strong></span>
            </div>

            <div className="font-bold text-white text-sm">{task.targetLocationName}</div>

            <div className="space-y-1 text-slate-300">
              <div><strong>Target Coordinates:</strong> {task.coordinates.lat.toFixed(4)}°N, {task.coordinates.lng.toFixed(4)}°E</div>
              <div><strong>Verification Check:</strong> {task.verificationInstructions}</div>
              <div><strong>Safety Advisory:</strong> {task.safetyAdvisory}</div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800 text-amber-300">
              <span>Photo Verification Required: <strong>YES (EXIF Tagged)</strong></span>
              <span className="font-mono text-cyan-300">Target ETA: {task.targetDispatchTimeMinutes} mins</span>
            </div>
          </div>
        </div>

        {/* Field Report Trust Score Engine (Feature 29) */}
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Field Intelligence Trust Scorer</span>
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                trustResult.overallTrustScorePct > 80
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-950 text-amber-300 border border-amber-500/30'
              }`}
            >
              {trustResult.status} ({trustResult.overallTrustScorePct}/100)
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Dynamically computes field report reliability before triggering automated sirens or public evacuation orders:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <div className="text-[10px] text-slate-400 mb-1">Reporter Credibility</div>
              <select
                value={officerRank}
                onChange={(e: any) => setOfficerRank(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-slate-200 text-xs"
              >
                <option value="SUPERVISING_OFFICER">SDMA Officer (100%)</option>
                <option value="QRT_LEAD">QRT Patrol Lead (90%)</option>
                <option value="CIVIL_DEFENSE">Civil Defense Vol (75%)</option>
                <option value="ANONYMOUS_REPORT">Anonymous Citizen (40%)</option>
              </select>
            </div>

            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800 flex flex-col justify-between">
              <div className="text-[10px] text-slate-400">GPS EXIF Proximity Match</div>
              <button
                onClick={() => setGpsMatched(!gpsMatched)}
                className={`py-1 px-2 rounded text-xs font-bold cursor-pointer ${
                  gpsMatched ? 'bg-emerald-700 text-white' : 'bg-rose-800 text-white'
                }`}
              >
                {gpsMatched ? 'Matched Within 50m ✓' : 'Mismatch / Spoofed'}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800 flex flex-col justify-between">
              <div className="text-[10px] text-slate-400">Geotagged Photo Hash</div>
              <button
                onClick={() => setHasPhoto(!hasPhoto)}
                className={`py-1 px-2 rounded text-xs font-bold cursor-pointer ${
                  hasPhoto ? 'bg-emerald-700 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {hasPhoto ? 'EXIF Photo Verified ✓' : 'No Photo Attached'}
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800 flex flex-col justify-between">
              <div className="text-[10px] text-slate-400">Freshness (Elapsed: {minutesElapsed}m)</div>
              <input
                type="range"
                min={2}
                max={120}
                value={minutesElapsed}
                onChange={(e) => setMinutesElapsed(Number(e.target.value))}
                className="accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#071330] border border-slate-800 text-[11px] text-cyan-200">
            <strong>System Verdict:</strong> {trustResult.aiImageAnalysisSummary}
          </div>
        </div>
      </div>

      {/* Feature 32: AI Decision Audit Log & Human-in-the-loop Override */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>AI Decision Audit Trail & Human Override Registry</span>
          </h3>
          <span className="text-[10px] font-mono text-cyan-300">
            Statutory Legal Compliance • NDMA Section 38
          </span>
        </div>

        <div className="space-y-2">
          {auditLogs.map((log) => {
            const isOverridden = overriddenIds.includes(log.decisionId);
            return (
              <div
                key={log.decisionId}
                className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isOverridden
                    ? 'bg-[#1b1228] border-amber-500/50'
                    : 'bg-[#050e24] border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-300 text-[11px]">{log.timestamp}</span>
                    <span className="font-bold text-white">{log.systemRecommendation}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {log.confidencePct}% Confidence
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">{log.actionTakenByAuthority}</div>
                  <div className="text-[10px] text-slate-400">
                    Zone: <strong>{log.incidentZone}</strong> • Inputs: <em>{log.inputsEvaluated.join(', ')}</em>
                  </div>
                  {isOverridden && (
                    <div className="text-[10px] font-bold text-amber-300 mt-1">
                      ⚠️ OVERRIDDEN BY COMMANDER: Human Commander deferred automatic siren awaiting QRT visual confirmation.
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleToggleOverride(log.decisionId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isOverridden
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isOverridden ? 'Human Override Active' : 'Engage Override'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
