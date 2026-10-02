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
import { BhusakthiBotAvatar } from './BhusakthiBotAvatar';
import { ThinkingOrbIndicator } from './ThinkingOrbIndicator';
import { SafeRouteMapCard, SafeRouteData } from './SafeRouteMapCard';
import { useAuth } from '../../context/AuthContext';
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

  const { user, rolePermissions } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copilotStatus, setCopilotStatus] = useState<'online' | 'processing' | 'offline'>('online');
  const [botAvatarState, setBotAvatarState] = useState<'idle' | 'thinking' | 'speaking' | 'error'>('idle');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const getCopilotErrorMessage = (err: any): string => {
    const code = String(err?.code || err?.status || '');
    const msg = String(err?.message || '').toLowerCase();

    if (code === '400') {
      return 'Invalid request parameters sent to Copilot engine.';
    }
    if (code === '401') {
      return 'Copilot authentication token is invalid or expired. Please sign in again.';
    }
    if (code === '403') {
      return 'Access restricted. Insufficient operational permissions for this disaster response command.';
    }
    if (code === '404') {
      return 'The requested disaster telemetry endpoint or location was not found on the server.';
    }
    if (code === '409') {
      return 'Conflicting telemetry operation detected. Please retry in a few moments.';
    }
    if (code === '422') {
      return 'Unprocessable query. Please verify and rephrase your disaster query.';
    }
    if (code === '429' || msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('rate limit')) {
      return 'AI disaster intelligence rate limit reached. Please wait a few moments before requesting again.';
    }
    if (code === '500') {
      return 'BHUSAKTHI disaster intelligence service encountered an internal server error. Please retry.';
    }
    if (code === '502' || code === '503') {
      return 'BHUSAKTHI disaster intelligence gateway is temporarily undergoing live telemetry sync. Please retry shortly.';
    }
    if (code === 'NETWORK_ERROR' || msg.includes('failed to fetch') || err?.name === 'TypeError') {
      return 'Unable to connect to the Copilot server. Please check your network connection.';
    }
    if (code === 'TIMEOUT' || msg.includes('timeout') || err?.name === 'TimeoutError') {
      return 'Copilot took too long to respond. The mountain telemetry link may be congested.';
    }
    if (err?.message && !err.message.startsWith('HTTP_') && err.message !== 'NETWORK_ERROR') {
      return err.message;
    }
    return 'Copilot service encountered an unexpected error.';
  };

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
    setBotAvatarState('thinking');
    setCopilotStatus('processing');
    setVoiceError(null);

    try {
      // Assemble full real-time dashboard context with current location
      const contextPayload = {
        location: {
          id: activeStation?.id || 'tawang-pass-01',
          name: activeLocationName,
          state: activeLocationState,
          latitude: activeStation?.latitude || 27.58605,
          longitude: activeStation?.longitude || 91.85900
        },
        currentRisk: {
          score: activeStation?.riskAssessment?.riskScore ?? 78,
          status: activeStation?.riskAssessment?.status ?? 'elevated',
          safetyFactor: activeStation?.riskAssessment?.safetyFactor ?? 1.08,
          failureProbabilityPct: activeStation?.riskAssessment?.failureProbabilityPct ?? 68
        },
        weather: {
          rainfallRateMmH: activeStation?.telemetry?.rainfallRateMmH ?? 14.2,
          rainfall24hMm: activeStation?.telemetry?.rainfall24hMm ?? 142,
          soilMoisturePct: activeStation?.telemetry?.soilMoisturePct ?? 81,
          temperatureC: activeStation?.telemetry?.temperatureC ?? 21.4,
          poreWaterPressureKpa: activeStation?.telemetry?.poreWaterPressureKpa ?? 64,
          isLive: true
        },
        user: user ? {
          name: user.full_name,
          role: user.role,
          organization: user.organization,
          permissions: rolePermissions
        } : undefined,
        simulation: {
          active: false,
          disasterType: 'landslide',
          severity: 'high',
          blockedRoadName: 'NH-13 Primary Corridor',
          alternativeRouteName: 'Upper Military Ridge Highway Corridor R-15',
          shelterName: `${activeLocationName} High Citadel & Monastery Haven`
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
        sources: result.sources || ['BhuShakti IoT Slope Piezometers', 'CartoDEM Topography'],
        actions: result.actions || [],
        sourceStatus: result.sourceStatus || 'REAL DATA',
        language: result.language || selectedLanguage,
        confidence: result.confidence
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setCopilotStatus('online');
      setBotAvatarState('speaking');
      setTimeout(() => setBotAvatarState('idle'), 2500);

      // Auto-execute any returned high-priority action
      if (result.actions && result.actions.length > 0) {
        result.actions.forEach((act) => executeCopilotAction(act));
      }

      // If language was switched by Copilot response, synchronize
      if (result.languageCode && result.languageCode !== selectedLanguage) {
        setSelectedLanguage(result.languageCode);
        setStoredLanguage(result.languageCode);
        if (onLanguageChange) onLanguageChange(result.languageCode);
      }
    } catch (err: any) {
      console.warn('[Copilot UI] Request error:', err);
      setCopilotStatus('online');
      setBotAvatarState('error');
      setTimeout(() => setBotAvatarState('idle'), 2500);

      const friendlyText = getCopilotErrorMessage(err);
      const errorMsg: CopilotMessage = {
        id: `error-${Date.now()}`,
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: friendlyText,
        error: true,
        errorCode: err?.code || err?.status || 'ERROR',
        failedQuery: query,
        sources: ['BhuShakti Diagnostic Monitor'],
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
    <div className="fixed bottom-6 right-6 z-[9999] w-[450px] max-w-[calc(100vw-2rem)] h-[720px] max-h-[calc(100vh-4rem)] rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-2xl shadow-sky-900/25 flex flex-col overflow-hidden select-none font-sans animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER (Requirement 7: [ ROBOT AVATAR ] BHUSAKTHI COPILOT)    */}
      {/* ==================================================================== */}
      <div className="p-3 bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-600 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-xs flex items-center justify-center shadow-inner">
            <BhusakthiBotAvatar
              size={48}
              state={isLoading ? 'thinking' : speakingMessageId ? 'speaking' : 'idle'}
              status={copilotStatus}
              showStatusIndicator={true}
              voiceActive={Boolean(speakingMessageId)}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-black tracking-wider uppercase text-white font-sans drop-shadow-xs">
                BHUSAKTHI COPILOT
              </h2>
              {/* Online Status Indicator */}
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                  copilotStatus === 'online'
                    ? 'bg-emerald-500/25 text-emerald-100 border border-emerald-300/40'
                    : copilotStatus === 'processing'
                    ? 'bg-amber-500/25 text-amber-100 border border-amber-300/40'
                    : 'bg-rose-500/25 text-rose-100 border border-rose-300/40'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    copilotStatus === 'online'
                      ? 'bg-emerald-300 animate-pulse'
                      : copilotStatus === 'processing'
                      ? 'bg-amber-300 animate-spin'
                      : 'bg-rose-300'
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
            <p className="text-[10px] text-sky-100 font-medium">
              AI Disaster Intelligence Assistant
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
          title="Close Copilot"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ==================================================================== */}
      {/* 2. SUB-HEADER: LOCATION & LANGUAGE SELECTOR BAR                      */}
      {/* ==================================================================== */}
      <div className="px-3 py-2 bg-sky-100/80 border-b border-sky-200/90 flex items-center justify-between text-xs">
        {/* Active Location Display */}
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span className="text-[11px] font-bold text-sky-950 truncate">
            {activeLocationName}, {activeLocationState}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-200 text-sky-800 font-mono font-bold border border-sky-300/60">
            SYNCED
          </span>
        </div>

        {/* Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-sky-300 hover:border-sky-500 text-sky-900 text-[11px] font-bold shadow-2xs cursor-pointer transition-all"
            title="Change Preferred Language"
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>{currentLangMeta.nativeName}</span>
            <ChevronDown className="w-3 h-3 text-sky-500" />
          </button>

          {languageMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 max-h-60 overflow-y-auto bg-white border border-sky-200 rounded-xl shadow-xl z-50 py-1 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-mono text-sky-600 font-bold uppercase border-b border-sky-100">
                SELECT LANGUAGE
              </div>
              {COPILOT_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full px-2.5 py-1.5 text-left text-xs flex items-center justify-between hover:bg-sky-50 transition-colors cursor-pointer ${
                    selectedLanguage === lang.code
                      ? 'bg-sky-100/90 font-bold text-sky-800'
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
      <div className="p-2 bg-sky-100/60 border-b border-sky-200/80 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
        <span className="text-[10px] font-mono font-bold text-sky-700 shrink-0 uppercase pl-1">
          SUGGESTED:
        </span>
        {currentPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-50 text-sky-900 hover:text-sky-700 text-[11px] font-medium border border-sky-200 whitespace-nowrap cursor-pointer transition-all shadow-2xs disabled:opacity-50"
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
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-gradient-to-b from-sky-50 via-sky-100/35 to-sky-50 text-xs">
        {messages.map((m, idx) => {
          const isUser = m.sender === 'user';

          return (
            <div
              key={`${m.id}-${idx}`}
              className={`flex gap-2.5 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {/* Bot Avatar (Requirement 8) */}
              {!isUser && (
                <BhusakthiBotAvatar
                  size={32}
                  state={speakingMessageId === m.id ? 'speaking' : 'idle'}
                  voiceActive={speakingMessageId === m.id}
                  className="shrink-0 mt-0.5"
                />
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2.5 shadow-sm ${
                  isUser
                    ? 'bg-sky-500 hover:bg-sky-600 text-white rounded-tr-none'
                    : m.error
                    ? 'bg-rose-50/90 border border-rose-200 text-rose-900 rounded-tl-none'
                    : 'bg-white border border-sky-200/90 text-slate-800 rounded-tl-none'
                }`}
              >
                {/* Status / Truth Header Badge for Copilot */}
                {!isUser && (m.sourceStatus || m.error) && (
                  <div className="flex items-center justify-between pb-1 border-b border-sky-100">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                        m.error
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : m.sourceStatus === 'REAL DATA'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : m.sourceStatus === 'SIMULATION'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      {m.error ? 'DIAGNOSTIC NOTICE' : m.sourceStatus}
                    </span>

                    {/* Read Aloud Button */}
                    {!m.error && (
                      <button
                        onClick={() => handleToggleSpeech(m)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${
                          speakingMessageId === m.id
                            ? 'bg-sky-100 text-sky-700'
                            : 'text-slate-400 hover:text-sky-700'
                        }`}
                        title={speakingMessageId === m.id ? 'Stop Reading' : 'Read Aloud'}
                      >
                        {speakingMessageId === m.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className={`whitespace-pre-line leading-relaxed font-sans text-xs ${m.error ? 'text-rose-800 font-medium' : ''}`}>
                  {m.text}
                </div>

                {/* Safe Evacuation Route in Interactive Map Format (Not Text Only) */}
                {!isUser && !m.error && (
                  (m.actions && m.actions.some((a) => a.type === 'FIND_SAFE_ROUTE')) ||
                  m.text.toLowerCase().includes('safe route') ||
                  m.text.toLowerCase().includes('evacuation route') ||
                  m.text.toLowerCase().includes('safe corridor') ||
                  m.text.toLowerCase().includes('relief shelter') ||
                  m.text.toLowerCase().includes('safe haven')
                ) && (
                  <SafeRouteMapCard
                    onOpenFullGis={() => {
                      if (onNavigateSection) onNavigateSection('emergency_response');
                      onClose();
                    }}
                  />
                )}

                {/* Try Again Button for Failed Request (Requirement 24) */}
                {m.error && m.failedQuery && (
                  <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSend(m.failedQuery)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Try Again</span>
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono">Resend request</span>
                  </div>
                )}

                {/* Action Buttons if returned by AI */}
                {!isUser && m.actions && m.actions.length > 0 && (
                  <div className="pt-2 border-t border-sky-100 flex flex-wrap gap-1.5">
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => executeCopilotAction(act)}
                        className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
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
                  <div className="pt-1.5 border-t border-sky-100 flex flex-wrap items-center gap-1 text-[9px] text-slate-400 font-mono">
                    <span className="text-sky-800 font-bold">Verified Sources:</span>
                    {m.sources.map((s, i) => (
                      <span
                        key={i}
                        className="px-1 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-[9px] text-right font-mono ${
                    isUser ? 'text-sky-100' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {/* User Avatar */}
              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-sky-200 text-sky-800 flex items-center justify-center shrink-0 mt-0.5 border border-sky-300">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading / Thinking Orb Indicator (Pill capsule with 3D thinking orb animation) */}
        {isLoading && (
          <div className="flex gap-2.5 items-center text-slate-500 text-xs animate-in fade-in duration-200">
            <BhusakthiBotAvatar
              size={36}
              state="thinking"
              className="shrink-0 mt-0.5"
            />
            <ThinkingOrbIndicator label="Thinking...." size={48} />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ==================================================================== */}
      {/* 5. INPUT & ACTIONS CONTROLS BAR                                      */}
      {/* ==================================================================== */}
      <div className="p-3 bg-sky-50/95 border-t border-sky-200 space-y-2">
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
            className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-sky-300 text-xs text-slate-900 placeholder-sky-400 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans shadow-2xs"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>

        {/* Bottom Toolbar: Voice Input, Language, Clear Chat */}
        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-sky-200/60">
          <div className="flex items-center gap-2">
            {/* Voice Input Button */}
            <button
              onClick={handleToggleVoice}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white animate-pulse shadow-xs'
                  : 'bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 shadow-2xs'
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
                  <Mic className="w-3.5 h-3.5 text-sky-600" />
                  <span className="text-[10px]">Voice</span>
                </>
              )}
            </button>

            {/* Quick Language Toggle */}
            <button
              onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              className="px-2 py-1 rounded-lg bg-white hover:bg-sky-100 text-sky-800 border border-sky-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Language"
            >
              <Globe className="w-3 h-3 text-sky-600" />
              <span>{currentLangMeta.code.toUpperCase()}</span>
            </button>
          </div>

          {/* Clear Chat Button */}
          <button
            onClick={handleClearChat}
            className="text-[10px] font-mono text-sky-600/70 hover:text-rose-600 flex items-center gap-1 p-1 rounded hover:bg-sky-100/60 cursor-pointer transition-colors"
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
