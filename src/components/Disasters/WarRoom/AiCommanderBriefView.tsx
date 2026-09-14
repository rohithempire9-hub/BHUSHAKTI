import React, { useState } from 'react';
import {
  Brain,
  Volume2,
  VolumeX,
  Copy,
  CheckCircle2,
  Sparkles,
  AlertOctagon,
  ShieldAlert,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  getAiCommanderSynthesis,
  generateSixtySecondBrief
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const AiCommanderBriefView: React.FC = () => {
  const [commander] = useState(() => getAiCommanderSynthesis(null, 88));
  const [brief] = useState(() => generateSixtySecondBrief(getAiCommanderSynthesis(null, 88)));
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Simulated browser speech synthesis for the 60-second brief
  const toggleSpeech = () => {
    if (typeof window === 'undefined') return;

    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      return;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(brief.formattedSpeechText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyBriefText = () => {
    const textToCopy = `=== BHUSAKTHI 60-SECOND DISASTER OPERATIONAL BRIEF ===
Timestamp: ${brief.timestamp} | Incident: ${brief.headline}
Zone: ${commander.zoneName}
Confidence: ${commander.commanderConfidencePct}%

KEY SITUATION POINTS:
${brief.bulletPoints.map((b) => `• ${b}`).join('\n')}

MANDATORY DIRECTIVES:
${brief.immediateDirectives.map((a) => `• ${a}`).join('\n')}

SPOKEN BRIEF SCRIPT:
"${brief.formattedSpeechText}"
`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              FEATURE 30 • AUTONOMOUS AI COMMANDER
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
              FEATURE 31 • 60-SECOND EXECUTIVE BRIEF
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>AI Disaster Commander & 60-Second Audio Brief</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Autonomous multi-modal synthesis that constantly monitors sensor deltas, projects the immediate window, and delivers rapid operational briefs for District Magistrates and Chief Secretaries.
          </p>
        </div>

        {/* Threat Level Badge */}
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-rose-500/30 text-xs shrink-0 text-right">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Operational Threat Level</div>
          <div className="text-2xl font-mono font-black text-rose-400 mt-0.5">
            CRITICAL
          </div>
          <div className="text-[10px] text-cyan-300 font-bold">
            Confidence: {commander.commanderConfidencePct}%
          </div>
        </div>
      </div>

      {/* Feature 31: 60-Second Executive Audio Brief */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">{brief.headline}</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Synthesized: {brief.timestamp} • Formatted for Oral Delivery to Incident Commander
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSpeech}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSpeaking
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Audio Brief' : 'Play Spoken Brief'}</span>
            </button>

            <button
              onClick={copyBriefText}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Text Brief'}</span>
            </button>
          </div>
        </div>

        {/* Spoken Text Box */}
        <div className="p-4 rounded-xl bg-[#050e24] border border-cyan-500/30 text-xs text-slate-200 leading-relaxed font-sans italic">
          "{brief.formattedSpeechText}"
        </div>

        {/* Key Bullets & Directives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#06122d] border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Current Tactical Realities:</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {brief.bulletPoints.map((b, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-cyan-400">•</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-[#06122d] border border-slate-800 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Mandatory Commander Directives:</span>
            </div>
            <ul className="space-y-1.5 text-slate-300">
              {brief.immediateDirectives.map((a, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400">•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Feature 30: Autonomous Proactive Synthesis */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <span>Autonomous AI Commander: Geotechnical Synthesis</span>
          </h3>
          <span className="text-[10px] font-mono text-emerald-300 font-bold">
            Autonomous Sentinel Loop Active
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#050e24] border border-slate-800 text-xs space-y-3">
          <div>
            <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider mb-1">What is Happening:</div>
            <p className="text-slate-200">{commander.whatIsHappening}</p>
          </div>

          <div>
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1">Why is it Happening:</div>
            <p className="text-slate-300">{commander.whyIsItHappening}</p>
          </div>

          <div>
            <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider mb-1">Who is Affected:</div>
            <p className="text-slate-300">{commander.whoIsAffected}</p>
          </div>

          <div>
            <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider mb-1">What Could Happen Next:</div>
            <p className="text-slate-300">{commander.whatCouldHappenNext}</p>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-1">Recommended Response:</div>
            <p className="text-emerald-200 whitespace-pre-line">{commander.whatShouldWeDo}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400">
            <span>Telemetry Gap: <strong>{commander.whatDataIsMissing}</strong></span>
            <span className="font-mono text-cyan-400">Confidence: {commander.commanderConfidencePct}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
