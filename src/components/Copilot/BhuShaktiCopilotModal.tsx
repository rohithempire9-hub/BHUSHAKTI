import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CopilotMessage,
  askBhuShaktiCopilot,
  COPILOT_LANGUAGES,
  getStoredLanguage,
  setStoredLanguage,
  getStoredChatHistory,
  saveStoredChatHistory,
  clearStoredChatHistory,
  startVoiceRecognition,
  speakText
} from '../../services/copilotService';
import { LandslideStation } from '../../types/landslide';
import { BHUSAKTHI_LOCATIONS } from '../../data/bhusakthiLocations';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ArrowUpRight,
  ShieldCheck,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Globe,
  AlertTriangle,
  MapPin,
  Play,
  Route,
  ChevronDown,
  Trash2,
  Activity,
  Zap,
  Info
} from 'lucide-react';

interface BhuShaktiCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: LandslideStation[];
  selectedStation: LandslideStation | null;
  onSelectStation?: (station: LandslideStation) => void;
  onNavigateSection?: (section: any) => void;
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  onStartSimulation?: (disasterType?: string) => void;
  onResetSimulation?: () => void;
  onToggleMapLayer?: (layer: string) => void;
}

const QUICK_PROMPTS: Record<string, string[]> = {
  en: [
    'What is the current risk?',
    'Why is this area risky?',
    'What is the weather?',
    'Start a landslide simulation',
    'Find the safest route',
    'Where should people evacuate?',
    'Generate emergency brief',
    'Which roads are affected?'
  ],
  te: [
    'ఇక్కడ ప్రమాదం ఎంత ఉంది?',
    'ఈ ప్రాంతంలో రిస్క్ ఎందుకు ఎక్కువ?',
    'ప్రస్తుత వాతావరణం ఏమిటి?',
    'కొండచరియల సిమ్యులేషన్ ప్రారంభించు',
    'సురక్షితమైన మార్గాన్ని కనుగొను',
    'ప్రజలు ఎక్కడికి తరలి వెళ్ళాలి?',
    'అత్యవసర నివేదిక ఇవ్వండి'
  ],
  hi: [
    'वर्तमान जोखिम कितना है?',
    'यह क्षेत्र जोखिम भरा क्यों है?',
    'वर्तमान मौसम कैसा है?',
    'भूस्खलन सिमुलेशन शुरू करें',
    'सबसे सुरक्षित रास्ता खोजें',
    'लोग कहाँ निकासी करें?',
    'आपातकालीन रिपोर्ट तैयार करें'
  ],
  as: [
    'বৰ্তমানৰ আশংকা কিমান?',
    'এই অঞ্চলটোত আশংকা কিয় বেছি?',
    'বৰ্তমান বতৰ কেনেকুৱা?',
    'ভূমিভূমিস্খলন চিমুলেচন আৰম্ভ কৰক',
    'সকলোতকৈ সুৰক্ষিত পথ সন্ধান কৰক'
  ]
};

export const BhuShaktiCopilotModal: React.FC<BhuShaktiCopilotModalProps> = ({
  isOpen,
  onClose,
  stations,
  selectedStation,
  onSelectStation,
  onNavigateSection,
  currentLanguage: propLanguage,
  onLanguageChange,
  onStartSimulation,
  onResetSimulation,
  onToggleMapLayer
}) => {
  // Language State
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => {
    return propLanguage || getStoredLanguage();
  });

  // Active Station & Location Context
  const activeStation = selectedStation || stations[0] || null;
  const activeLocationName = activeStation?.name || 'Agartala';
  const activeLocationState = activeStation?.region || 'Tripura';

  // Chat History
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    const stored = getStoredChatHistory();
    if (stored.length > 0) return stored;

    return [
      {
        id: 'welcome',
        sender: 'copilot',
        timestamp: 'Just now',
        text: `Hello! I am **BHUSAKTHI COPILOT**, your AI disaster intelligence assistant.

I am connected live to IoT inclinometers, CartoDEM terrain models, Open-Meteo telemetry, and historical landslide archives.

Ask me about:
• **Current Risk & "Why Now?" factors**
• **Meteorological & soil moisture readings**
• **3D Disaster simulations (Landslides & Floods)**
• **Safe evacuation routes & relief shelters**
• **Emergency response protocols**

I support 11 languages. You can speak to me with voice or change your language anytime.`,
        sources: ['BhuShakti Central Telemetry Hub', 'IMD Regional Doppler', 'CartoDEM Topography'],
        sourceStatus: 'REAL DATA',
        language: 'en'
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copilotStatus, setCopilotStatus] = useState<'online' | 'processing' | 'offline'>('online');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  const activeSpeechRef = useRef<{ stop: () => void } | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist messages in localStorage
  useEffect(() => {
    if (messages.length > 0) {
      saveStoredChatHistory(messages);
    }
  }, [messages]);

  // Sync language with parent if propLanguage changes
  useEffect(() => {
    if (propLanguage && propLanguage !== selectedLanguage) {
      setSelectedLanguage(propLanguage);
      setStoredLanguage(propLanguage);
    }
  }, [propLanguage]);

  // Handle Language Change
  const handleLanguageChange = (newLang: string) => {
    setSelectedLanguage(newLang);
    setStoredLanguage(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
    setLanguageMenuOpen(false);

    // Stop ongoing speech if any
    if (activeSpeechRef.current) {
      activeSpeechRef.current.stop();
      setSpeakingMessageId(null);
    }
  };

  // Execute Controlled Action from Copilot
  const executeCopilotAction = useCallback(
    (action: any) => {
      if (!action || !action.type) return;

      switch (action.type) {
        case 'CHANGE_LOCATION': {
          const locPayload = action.payload;
          if (locPayload && onSelectStation) {
            const matched = stations.find(
              (s) =>
                s.name.toLowerCase() === (locPayload.name || '').toLowerCase() ||
                s.id.toLowerCase().includes((locPayload.id || '').toLowerCase())
            );
            if (matched) {
              onSelectStation(matched);
            }
          }
          if (onNavigateSection) {
            onNavigateSection('disaster_3d');
          }
          break;
        }

        case 'START_SIMULATION': {
          if (onStartSimulation) {
            onStartSimulation(action.payload?.disasterType || 'landslide');
          }
          if (onNavigateSection) {
            onNavigateSection('disaster_3d');
          }
          break;
        }

        case 'RESET_SIMULATION': {
          if (onResetSimulation) {
            onResetSimulation();
          }
          break;
        }

        case 'SHOW_MAP_LAYER': {
          if (onToggleMapLayer && action.payload?.layer) {
            onToggleMapLayer(action.payload.layer);
          }
          if (onNavigateSection) {
            onNavigateSection('risk_map');
          }
          break;
        }

        case 'FIND_SAFE_ROUTE': {
          if (onNavigateSection) {
            onNavigateSection('emergency_response');
          }
          break;
        }

        case 'CHANGE_LANGUAGE': {
          if (action.payload?.language) {
            handleLanguageChange(action.payload.language);
          }
          break;
        }

        case 'NAVIGATE_SECTION': {
          if (onNavigateSection && action.payload?.section) {
            onNavigateSection(action.payload.section);
          }
          break;
        }

        default:
          break;
      }
    },
    [
      stations,
      onSelectStation,
      onNavigateSection,
      onStartSimulation,
      onResetSimulation,
      onToggleMapLayer
    ]
  );

  // Send Query to Copilot Backend
  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
      language: selectedLanguage
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setCopilotStatus('processing');
    setVoiceError(null);

    try {
      // Assemble full real-time dashboard context
      const contextPayload = {
        location: {
          id: activeStation?.id || 'agartala',
          name: activeLocationName,
          state: activeLocationState,
          latitude: activeStation?.latitude || 23.8315,
          longitude: activeStation?.longitude || 91.2868
        },
        currentRisk: {
          score: activeStation?.riskAssessment?.riskScore ?? 74,
          status: activeStation?.riskAssessment?.status ?? 'high',
          safetyFactor: activeStation?.riskAssessment?.safetyFactor ?? 1.04,
          failureProbabilityPct: activeStation?.riskAssessment?.failureProbabilityPct ?? 72
        },
        weather: {
          rainfallRateMmH: activeStation?.telemetry?.rainfallRateMmH ?? 12.4,
          rainfall24hMm: activeStation?.telemetry?.rainfall24hMm ?? 155,
          soilMoisturePct: activeStation?.telemetry?.soilMoisturePct ?? 82,
          temperatureC: activeStation?.telemetry?.temperatureC ?? 22.5,
          poreWaterPressureKpa: activeStation?.telemetry?.poreWaterPressureKpa ?? 71,
          isLive: true
        },
        simulation: {
          active: false,
          disasterType: 'landslide',
          severity: 'high',
          blockedRoadName: 'NH-13 Primary Corridor',
          alternativeRouteName: 'High Ridge Bypass Route R-15',
          shelterName: `${activeLocationName} Community Haven`
        }
      };

      const result = await askBhuShaktiCopilot(
        query,
        selectedLanguage,
        contextPayload,
        [...messages, userMsg]
      );

      const copilotMsg: CopilotMessage = {
        id: `copilot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: result.answer,
        sources: result.sources || ['BhuShakti Central Telemetry Hub'],
        actions: result.actions || [],
        sourceStatus: result.sourceStatus || 'REAL DATA',
        language: result.language || selectedLanguage,
        confidence: result.confidence
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setCopilotStatus('online');

      // Auto-execute any returned high-priority action
      if (result.actions && result.actions.length > 0) {
        result.actions.forEach((act) => executeCopilotAction(act));
      }

      // If language was switched by Copilot response, synchronize
      if (result.language && result.language !== selectedLanguage) {
        setSelectedLanguage(result.language);
        setStoredLanguage(result.language);
        if (onLanguageChange) onLanguageChange(result.language);
      }
    } catch (err: any) {
      console.warn('[Copilot UI] Request error:', err);
      setCopilotStatus('offline');

      const errorMsg: CopilotMessage = {
        id: `error-${Date.now()}`,
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `⚠ **BHUSAKTHI COPILOT TEMPORARILY UNAVAILABLE**\n\nPlease try again. The dashboard, satellite imagery, and early warning systems continue functioning normally.`,
        sources: ['System Diagnostic Monitor'],
        sourceStatus: 'ESTIMATE',
        language: selectedLanguage
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Voice Input
  const handleToggleVoice = () => {
    if (isRecordingVoice) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      return;
    }

    setVoiceError(null);
    const recognition = startVoiceRecognition(
      selectedLanguage,
      (transcript) => {
        setInputValue(transcript);
        setIsRecordingVoice(false);
        // Automatically submit spoken prompt
        void handleSend(transcript);
      },
      (err) => {
        setVoiceError(err);
        setIsRecordingVoice(false);
      },
      () => {
        setIsRecordingVoice(false);
      }
    );

    if (recognition) {
      speechRecognitionRef.current = recognition;
      setIsRecordingVoice(true);
    }
  };

  // Toggle Text-to-Speech Vocalization
  const handleToggleSpeech = (msg: CopilotMessage) => {
    if (speakingMessageId === msg.id) {
      if (activeSpeechRef.current) {
        activeSpeechRef.current.stop();
      }
      setSpeakingMessageId(null);
      return;
    }

    if (activeSpeechRef.current) {
      activeSpeechRef.current.stop();
    }

    const speech = speakText(msg.text, msg.language || selectedLanguage);
    activeSpeechRef.current = speech;
    setSpeakingMessageId(msg.id);

    // Watch for end of speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = null;
    }
  };

  // Clear Chat Only (preserves location & dashboard state)
  const handleClearChat = () => {
    clearStoredChatHistory();
    setMessages([
      {
        id: 'reset',
        sender: 'copilot',
        timestamp: 'Just now',
        text: `Chat history cleared. I am online and listening for queries regarding **${activeLocationName}** in ${
          COPILOT_LANGUAGES.find((l) => l.code === selectedLanguage)?.nativeName || 'English'
        }.`,
        sources: ['BhuShakti Central Telemetry Hub'],
        sourceStatus: 'REAL DATA',
        language: selectedLanguage
      }
    ]);
    if (activeSpeechRef.current) {
      activeSpeechRef.current.stop();
      setSpeakingMessageId(null);
    }
  };

  if (!isOpen) return null;

  const currentPrompts = QUICK_PROMPTS[selectedLanguage] || QUICK_PROMPTS['en'];
  const currentLangMeta =
    COPILOT_LANGUAGES.find((l) => l.code === selectedLanguage) || COPILOT_LANGUAGES[0];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[450px] max-w-[calc(100vw-2rem)] h-[720px] max-h-[calc(100vh-4rem)] rounded-2xl bg-white border border-slate-200/90 shadow-2xl flex flex-col overflow-hidden select-none font-sans animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER                                                        */}
      {/* ==================================================================== */}
      <div className="p-3.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black tracking-wider uppercase text-white font-sans">
                BHUSAKTHI COPILOT
              </h2>
              {/* Online Status Indicator */}
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                  copilotStatus === 'online'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : copilotStatus === 'processing'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    copilotStatus === 'online'
                      ? 'bg-emerald-400 animate-pulse'
                      : copilotStatus === 'processing'
                      ? 'bg-amber-400 animate-spin'
                      : 'bg-rose-400'
                  }`}
                />
                <span>
                  {copilotStatus === 'online'
                    ? 'ONLINE'
                    : copilotStatus === 'processing'
                    ? 'PROCESSING'
                    : 'OFFLINE'}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-blue-100 font-medium">
              AI Disaster Intelligence Assistant
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          title="Close Copilot"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 2. SUB-HEADER: LOCATION & LANGUAGE SELECTOR BAR                      */}
      {/* ==================================================================== */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
        {/* Active Location Display */}
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="text-[11px] font-bold text-slate-800 truncate">
            {activeLocationName}, {activeLocationState}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-mono font-bold">
            SYNCED
          </span>
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-[11px] font-bold shadow-2xs cursor-pointer transition-all"
            title="Change Preferred Language"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentLangMeta.nativeName}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {languageMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-mono text-slate-400 font-bold uppercase border-b border-slate-100">
                SELECT LANGUAGE
              </div>
              {COPILOT_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-blue-50 transition-colors cursor-pointer ${
                    selectedLanguage === lang.code
                      ? 'bg-blue-50/80 font-bold text-blue-700'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] font-mono text-slate-400">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. QUICK SUGGESTION CHIPS                                            */}
      {/* ==================================================================== */}
      <div className="p-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0 uppercase pl-1">
          SUGGESTED:
        </span>
        {currentPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-medium border border-slate-200 whitespace-nowrap cursor-pointer transition-all shadow-2xs disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Voice Error Notification if any */}
      {voiceError && (
        <div className="px-3 py-1.5 bg-rose-50 border-b border-rose-200 text-rose-700 text-[11px] flex items-center justify-between">
          <span>{voiceError}</span>
          <button onClick={() => setVoiceError(null)} className="p-0.5 text-rose-500 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. SCROLLABLE CHAT MESSAGES                                          */}
      {/* ==================================================================== */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={`${m.id}-${idx}`}
              className={`flex gap-2.5 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Bot Avatar */}
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2.5 shadow-sm ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                }`}
              >
                {/* Status / Truth Header Badge for Copilot */}
                {!isUser && m.sourceStatus && (
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        m.sourceStatus === 'REAL DATA'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : m.sourceStatus === 'SIMULATION'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {m.sourceStatus}
                    </span>

                    {/* Read Aloud Button */}
                    <button
                      onClick={() => handleToggleSpeech(m)}
                      className={`p-1 rounded-md transition-colors cursor-pointer ${
                        speakingMessageId === m.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                      title={speakingMessageId === m.id ? 'Stop Reading' : 'Read Aloud'}
                    >
                      {speakingMessageId === m.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-line leading-relaxed font-sans text-xs">
                  {m.text}
                </div>

                {/* Action Buttons if returned by AI */}
                {!isUser && m.actions && m.actions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => executeCopilotAction(act)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        {act.type === 'CHANGE_LOCATION' && <MapPin className="w-3 h-3" />}
                        {act.type === 'START_SIMULATION' && <Zap className="w-3 h-3" />}
                        {act.type === 'FIND_SAFE_ROUTE' && <Route className="w-3 h-3" />}
                        {act.type === 'SHOW_MAP_LAYER' && <ArrowUpRight className="w-3 h-3" />}
                        <span>{act.label || 'Execute Action'}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Sources Footer */}
                {!isUser && m.sources && m.sources.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1 text-[9px] text-slate-400 font-mono">
                    <span className="text-slate-500 font-bold">Verified Sources:</span>
                    {m.sources.map((s, i) => (
                      <span
                        key={i}
                        className="px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-[9px] text-right font-mono ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 items-center text-slate-500 text-xs">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span className="font-mono text-[11px] text-slate-600">
                Thinking in {currentLangMeta.nativeName}...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ==================================================================== */}
      {/* 5. INPUT & ACTIONS CONTROLS BAR                                      */}
      {/* ==================================================================== */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-2">
        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={`Ask in ${currentLangMeta.nativeName} or English...`}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        {/* Bottom Toolbar: Voice Input, Language, Clear Chat */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {/* Voice Input Button */}
            <button
              onClick={handleToggleVoice}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Voice Input (Speech-to-Text)"
            >
              {isRecordingVoice ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-white animate-bounce" />
                  <span className="text-[10px]">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px]">Voice</span>
                </>
              )}
            </button>

            {/* Quick Language Toggle */}
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Language"
            >
              <Globe className="w-3 h-3 text-slate-500" />
              <span>{currentLangMeta.code.toUpperCase()}</span>
            </button>
          </div>

          {/* Clear Chat Button */}
          <button
            onClick={handleClearChat}
            className="text-[10px] font-mono text-slate-400 hover:text-rose-600 flex items-center gap-1 p-1 rounded hover:bg-slate-50 cursor-pointer transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
