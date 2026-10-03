import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Radio,
  X,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  PhoneCall,
  TowerControl,
  Sparkles,
  Globe,
  Users,
  Send,
  Loader2
} from 'lucide-react';
import { RegisteredDeviceProfile, BhuLanguage } from '../../types/bhuShakti';
import { TRANSLATIONS } from '../../utils/translations';

interface MassSosSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registeredDevices: RegisteredDeviceProfile[];
  currentLanguage: BhuLanguage;
}

export const MassSosSimulationModal: React.FC<MassSosSimulationModalProps> = ({
  isOpen,
  onClose,
  registeredDevices,
  currentLanguage,
}) => {
  const [broadcastPhase, setBroadcastPhase] = useState<'idle' | 'broadcasting' | 'completed'>('idle');
  const [progressPct, setProgressPct] = useState(0);
  const [dispatchedCount, setDispatchedCount] = useState(0);
  const [isAudioSirenMuted, setIsAudioSirenMuted] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<BhuLanguage>(currentLanguage);

  useEffect(() => {
    setPreviewLanguage(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (!isOpen) {
      setBroadcastPhase('idle');
      setProgressPct(0);
      setDispatchedCount(0);
      return;
    }

    // Auto-initiate broadcast sequence when opened
    setBroadcastPhase('broadcasting');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgressPct(currentProgress);
      setDispatchedCount(Math.min(registeredDevices.length, Math.ceil((currentProgress / 100) * registeredDevices.length)));

      if (currentProgress >= 100) {
        clearInterval(interval);
        setBroadcastPhase('completed');
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen, registeredDevices.length]);

  if (!isOpen) return null;

  const t = TRANSLATIONS[previewLanguage] || TRANSLATIONS.en;

  return (
    <div
      id="mass-sos-simulation-modal-backdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="mass-sos-simulation-modal-content"
        className="relative w-full max-w-2xl rounded-3xl clay-modal p-5 sm:p-6 text-slate-800 overflow-hidden"
      >
        {/* Flashing Hazard Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl clay-icon bg-gradient-to-br from-rose-500 to-red-600 text-white shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)] animate-bounce">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-slate-900 font-sans">
                  EMERGENCY MASS SOS CELL BROADCAST
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                  NATIONAL DISASTER ALERT
                </span>
              </div>
              <p className="text-xs text-rose-700 font-medium mt-0.5">
                Multi-Carrier Priority Override (BSNL • Airtel • Jio • Satellite Mesh)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAudioSirenMuted(!isAudioSirenMuted)}
              className="clay-control p-2 text-slate-600 hover:text-slate-900"
              title={isAudioSirenMuted ? 'Unmute Simulated Siren' : 'Mute Simulated Siren'}
            >
              {isAudioSirenMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />}
            </button>

            <button
              onClick={onClose}
              className="clay-control p-2 text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Cell Broadcast Telemetry */}
        <div className="mb-4 p-4 rounded-2xl clay-card-raised">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="flex items-center gap-1.5 text-rose-700">
              <Radio className="w-3.5 h-3.5 animate-pulse text-rose-600" />
              {broadcastPhase === 'broadcasting' ? 'Pumping Cell Broadcast Packets...' : 'Mass Broadcast Dispatched'}
            </span>
            <span className="font-mono text-emerald-700">
              {dispatchedCount} / {registeredDevices.length} Targets Verified ({progressPct}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.15)]">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-200 text-[11px] font-mono text-slate-600">
            <div>
              <span className="text-slate-400 block text-[10px]">PROTOCOL</span>
              <span className="text-slate-800 font-bold">CAP v1.2 / 3GPP PWS</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">TOWERS TARGETED</span>
              <span className="text-emerald-700 font-bold">18 BSNL/Jio Nodes</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">SAT RELAY LATENCY</span>
              <span className="text-blue-700 font-bold">0.82 Seconds</span>
            </div>
          </div>
        </div>

        {/* Multilingual Preview Box */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Broadcast Payload Preview (Official NER Regional Languages)</span>
            </div>

            {/* Language Selector Pills */}
            <div className="clay-tab-container p-1">
              {(['en', 'as', 'kha', 'lus', 'mni'] as BhuLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setPreviewLanguage(lang)}
                  className={`clay-tab px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    previewLanguage === lang
                      ? 'clay-tab-active'
                      : ''
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
            <div className="text-[10px] font-mono text-rose-700 font-black mb-1">
              [SMS BROADCAST PAYLOAD - CH 4370]
            </div>
            <p className="text-sm font-bold text-rose-950 leading-relaxed font-sans mb-2">
              🚨 {t.criticalAlertTitle}
            </p>
            <p className="text-xs text-rose-900 leading-relaxed font-sans">
              {t.criticalAlertMsg}
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              Issued by: National Disaster Management Authority (NDMA) & BhuShakti NER Control Room.
            </div>
          </div>
        </div>

        {/* Device Dispatch Status List */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 mb-4 text-xs font-mono">
          {registeredDevices.map((dev, idx) => {
            const isDone = idx < dispatchedCount;
            return (
              <div
                key={dev.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isDone
                    ? 'clay-card-raised border-emerald-300 text-emerald-900'
                    : 'clay-card-raised text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600 shrink-0" />
                  )}
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-xs">
                    {dev.deviceName}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">({dev.region})</span>
                </div>

                <div className="text-[10px] text-right shrink-0">
                  <span className="text-slate-600">{dev.mobileNumber}</span>
                  <span className={`ml-2 font-bold ${isDone ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {isDone ? 'DELIVERED' : 'QUEUED'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            Emergency Siren Test: <strong className={isAudioSirenMuted ? 'text-slate-400' : 'text-rose-600'}>{isAudioSirenMuted ? 'Muted' : 'Sound Active (Simulated)'}</strong>
          </div>

          <button
            onClick={onClose}
            className="clay-button-primary px-5 py-2 text-xs font-bold"
          >
            {t.acknowledged}
          </button>
        </div>
      </div>
    </div>
  );
};
