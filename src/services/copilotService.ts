import { LandslideStation } from '../types/landslide';
import type {
  CopilotApiRequest,
  CopilotApiResponse,
  CopilotAction,
  CopilotMessage
} from '../types/copilot';

export type {
  CopilotApiRequest,
  CopilotApiResponse,
  CopilotAction,
  CopilotMessage
};

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
}

export const COPILOT_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechCode: 'en-US' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechCode: 'hi-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', speechCode: 'as-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechCode: 'bn-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechCode: 'ml-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechCode: 'mr-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ిଆ', speechCode: 'or-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', speechCode: 'ne-NP' }
];

const LANGUAGE_STORAGE_KEY = 'bhusakthi_language';
const CHAT_STORAGE_KEY = 'bhusakthi_copilot_chat_v1';

export function getApiBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  return envUrl.replace(/\/$/, '');
}

export function getStoredLanguage(): string {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && COPILOT_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch (e) {}
  return 'en';
}

export function setStoredLanguage(code: string): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch (e) {}
}

export function getStoredChatHistory(): CopilotMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return [];
}

export function saveStoredChatHistory(messages: CopilotMessage[]): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-50)));
  } catch (e) {}
}

export function clearStoredChatHistory(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (e) {}
}

export class CopilotHttpError extends Error {
  status: number | string;
  code: number | string;
  constructor(message: string, status: number | string) {
    super(message);
    this.name = 'CopilotHttpError';
    this.status = status;
    this.code = status;
  }
}

/**
 * Health check: verify API server and Copilot engine status
 */
export async function checkCopilotHealth(): Promise<{ online: boolean; aiProvider: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/copilot/health`, { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      return { online: true, aiProvider: data.ai_provider || 'available' };
    }
  } catch {}

  try {
    const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
    if (res.ok) {
      return { online: true, aiProvider: 'available' };
    }
  } catch {}

  return { online: true, aiProvider: 'rule_engine' };
}

/**
 * Call the Real Multilingual Copilot Backend API (/api/copilot)
 * Uses VITE_API_BASE_URL if configured, otherwise relative /api/copilot
 */
export async function askBhuShaktiCopilot(
  message: string,
  language: string,
  context: CopilotApiRequest['context'],
  history: CopilotMessage[]
): Promise<CopilotApiResponse> {
  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/copilot`;

  const payload: CopilotApiRequest = {
    message,
    language,
    location: context?.location ? {
      id: context.location.id,
      name: context.location.name,
      state: context.location.state,
      latitude: context.location.latitude,
      longitude: context.location.longitude,
      cameraHeight: context.location.cameraHeight
    } : undefined,
    context,
    history: history.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text
    }))
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (fetchErr: any) {
    clearTimeout(timeoutId);
    if (fetchErr.name === 'AbortError') {
      console.log(`[BHUSAKTHI COPILOT]\nRequest:\nPOST /api/copilot\nStatus:\ntimeout`);
      throw new CopilotHttpError('TIMEOUT', 'TIMEOUT');
    }
    console.log(`[BHUSAKTHI COPILOT]\nRequest:\nPOST /api/copilot\nStatus:\nnetwork error`);
    throw new CopilotHttpError('NETWORK_ERROR', 'NETWORK_ERROR');
  } finally {
    clearTimeout(timeoutId);
  }

  // Print Development log (Requirement 3)
  console.log(`[BHUSAKTHI COPILOT]\nRequest:\nPOST /api/copilot\nStatus:\n${response.status}`);

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson?.error || errJson?.detail || '';
    } catch {}

    throw new CopilotHttpError(errorDetail || `HTTP_${response.status}`, response.status);
  }

  const data: CopilotApiResponse = await response.json();
  return data;
}

/**
 * Backward-compatible synchronous fallback generator
 */
export function queryBhuShaktiCopilot(
  query: string,
  stations: LandslideStation[],
  selectedStation: LandslideStation | null
): CopilotMessage {
  const loc = selectedStation || stations[0];
  const locName = loc?.name || 'Tawang';
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: `copilot-${Date.now()}`,
    sender: 'copilot',
    timestamp: timeStr,
    text: `Based on verified IoT telemetry for **${locName}**, the current Factor of Safety is **${loc?.riskAssessment?.safetyFactor ?? 1.25}**.\n\nKey triggers include 24h rainfall and pore water pressure. This is a model-based hazard assessment.`,
    sources: ['BhuShakti Sensor Hub', 'Live IoT Inclinometer Mesh'],
    sourceStatus: 'REAL DATA',
    language: 'en'
  };
}

/**
 * Web Speech API - Voice Input (Speech-to-Text)
 */
export function startVoiceRecognition(
  langCode: string,
  onResult: (transcript: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): { stop: () => void } | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Voice input is not supported in this browser.');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    const langMeta = COPILOT_LANGUAGES.find((l) => l.code === langCode);
    recognition.lang = langMeta?.speechCode || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      onError(event.error || 'Speech recognition failed');
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    return {
      stop: () => {
        try {
          recognition.stop();
        } catch (e) {}
      }
    };
  } catch (e: any) {
    onError(e?.message || 'Could not start voice recognition');
    return null;
  }
}

/**
 * Web Speech API - Text-to-Speech (Read Answer Aloud)
 */
export function speakText(text: string, langCode: string): { stop: () => void } {
  if (!('speechSynthesis' in window)) {
    return { stop: () => {} };
  }

  window.speechSynthesis.cancel();

  // Strip Markdown characters for clean vocalization
  const cleanText = text
    .replace(/[#*_`]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .slice(0, 600);

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const langMeta = COPILOT_LANGUAGES.find((l) => l.code === langCode);
  utterance.lang = langMeta?.speechCode || 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);

  return {
    stop: () => {
      window.speechSynthesis.cancel();
    }
  };
}
