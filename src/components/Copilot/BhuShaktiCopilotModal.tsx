import React, { useState, useRef, useEffect } from 'react';
import {
  CopilotMessage,
  queryBhuShaktiCopilot
} from '../../services/copilotService';
import { LandslideStation } from '../../types/landslide';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ArrowUpRight,
  ShieldCheck,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface BhuShaktiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onNavigateSection?: (section: any) => void;
}

const PRESET_QUESTIONS = [
  'Which areas are at highest risk?',
  'Why is Tawang risk increasing?',
  'Which roads are unsafe?',
  'What happens if rainfall increases by 40%?',
  'Which village has the highest population exposure?',
  'Which incident should we respond to first?',
  'What should the response team do?',
  'Show flood impact.',
];

export const BhuShaktiCopilotModal: React.FC<BhuShaktiCopilotModalProps> = ({
  isOpen,
  onClose,
  stations,
  selectedStation,
  onNavigateSection,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      timestamp: 'Just now',
      text: `Hello! I am **BHUSAKTHI COPILOT**, your AI disaster intelligence assistant. I am connected live to 16 geotechnical stations, CartoDEM terrain models, and historical failure archives.
      
Ask me about live hazard priorities, "Why Now?" risk drivers, What-If simulation results, or emergency evacuation routes.`,
      sources: ['BhuShakti Central Sensor Hub', 'Live IoT Inclinometer Mesh'],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };

    const reply = queryBhuShaktiCopilot(query, stations, selectedStation);

    setMessages((prev) => [...prev, userMsg, reply]);
    setInputValue('');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl h-[85vh] rounded-2xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                  BHUSHAKTI COPILOT
                </h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  GROUNDED AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Decision Support Assistant • Zero Hallucination • Live Telemetry Grounded
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRESET CHIPS */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
          <span className="text-[10px] font-mono font-bold text-slate-500 shrink-0 uppercase">
            Suggested:
          </span>
          {PRESET_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-medium border border-slate-200 whitespace-nowrap cursor-pointer transition-all shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* MESSAGES LIST */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={`${m.id}-${idx}`}
              className={`flex gap-3 text-xs leading-relaxed ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'copilot' && (
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.sources && m.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                    <span className="text-blue-600 font-bold">Sources:</span>
                    {m.sources.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {m.actionLink && onNavigateSection && (
                  <button
                    onClick={() => {
                      onNavigateSection(m.actionLink!.section);
                      onClose();
                    }}
                    className="mt-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <span>{m.actionLink.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className={`text-[9px] text-right font-mono ${m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask BhuShakti Copilot about hazard priorities, roads, or 'Why Now?'..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
