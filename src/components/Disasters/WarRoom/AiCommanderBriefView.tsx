import React, { useState } from 'react';
import { Brain, Volume2, VolumeX, Copy, CheckCircle2, Sparkles } from 'lucide-react';
import { getAiCommanderSynthesis, generateSixtySecondBrief } from '../../../services/bhuShaktiAdvancedIntelligence';

export const AiCommanderBriefView: React.FC = () => {
  const [commander] = useState(() => getAiCommanderSynthesis(null, 88));
  const [brief] = useState(() => generateSixtySecondBrief(commander));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(brief.formattedSpeechText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const copyBriefText = async () => {
    const directives = brief.recommendedActionDirectives ?? [];
    const text = `=== BHUSHAKTI 60-SECOND DISASTER OPERATIONAL BRIEF ===\nTimestamp: ${brief.timestamp}\nIncident: ${brief.headline}\nZone: ${commander.zoneName}\nConfidence: ${commander.commanderConfidencePct}%\n\nKEY SITUATION POINTS:\n${brief.bulletPoints.map((b) => `• ${b}`).join('\n')}\n\nMANDATORY DIRECTIVES:\n${directives.map((a) => `• ${a}`).join('\n')}\n\nSPOKEN BRIEF SCRIPT:\n"${brief.formattedSpeechText}"`;
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">FEATURE 30 • AUTONOMOUS AI COMMANDER</span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">FEATURE 31 • 60-SECOND EXECUTIVE BRIEF</span>
          </div>
          <h2 className="text-xl font-bold text-white">AI Disaster Commander & 60-Second Audio Brief</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">Operational synthesis and a concise commander-ready briefing from the current disaster intelligence model.</p>
        </div>
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-rose-500/30 text-right shrink-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Operational Threat Level</div>
          <div className="text-2xl font-mono font-black text-rose-400">CRITICAL</div>
          <div className="text-[10px] text-cyan-300 font-bold">Confidence: {commander.commanderConfidencePct}%</div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" /><h3 className="text-sm font-bold text-white">{brief.headline}</h3></div>
            <span className="text-[11px] font-mono text-slate-400">Synthesized: {brief.timestamp}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleSpeech} className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isSpeaking ? 'Stop Audio Brief' : 'Play Spoken Brief'}
            </button>
            <button onClick={copyBriefText} className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Text Brief'}
            </button>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-[#050e24] border border-cyan-500/30 text-xs text-slate-200 leading-relaxed italic">"{brief.formattedSpeechText}"</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#06122d] border border-slate-800">
            <div className="font-bold text-white mb-2">Current Tactical Realities</div>
            <ul className="space-y-1.5 text-slate-300">{brief.bulletPoints.map((b, i) => <li key={i}><span className="text-cyan-400">• </span>{b}</li>)}</ul>
          </div>
          <div className="p-3.5 rounded-xl bg-[#06122d] border border-slate-800">
            <div className="font-bold text-white mb-2">Mandatory Commander Directives</div>
            <ul className="space-y-1.5 text-slate-300">{(brief.recommendedActionDirectives ?? []).map((a, i) => <li key={i}><span className="text-amber-400">• </span>{a}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Brain className="w-4 h-4 text-cyan-400" />Autonomous AI Commander: Geotechnical Synthesis</h3>
        <div className="p-4 rounded-xl bg-[#050e24] border border-slate-800 text-xs space-y-3">
          <div><div className="text-[11px] font-bold text-cyan-300 uppercase mb-1">What is Happening</div><p className="text-slate-200">{commander.whatIsHappening}</p></div>
          <div><div className="text-[11px] font-bold text-amber-300 uppercase mb-1">Why is it Happening</div><p className="text-slate-300">{commander.whyIsItHappening}</p></div>
          <div><div className="text-[11px] font-bold text-rose-300 uppercase mb-1">Who is Affected</div><p className="text-slate-300">{commander.whoIsAffected}</p></div>
          <div><div className="text-[11px] font-bold text-purple-300 uppercase mb-1">What Could Happen Next</div><p className="text-slate-300">{commander.whatCouldHappenNext}</p></div>
          <div className="pt-2 border-t border-slate-800"><div className="text-[11px] font-bold text-emerald-300 uppercase mb-1">Recommended Response</div><p className="text-emerald-200 whitespace-pre-line">{commander.whatShouldWeDo}</p></div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px] text-slate-400"><span>Telemetry Gap: <strong>{commander.whatDataIsMissing}</strong></span><span className="font-mono text-cyan-400">Confidence: {commander.commanderConfidencePct}%</span></div>
        </div>
      </div>
    </div>
  );
};
