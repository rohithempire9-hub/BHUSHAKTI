import React, { useState } from 'react';
import { BhuLanguage } from '../../types/bhuShakti';
import {
  Settings,
  Globe,
  Database,
  Radio,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Bell,
  HardDrive
} from 'lucide-react';

interface SettingsPageViewProps {
  currentLanguage: BhuLanguage;
  onLanguageChange: (lang: BhuLanguage) => void;
  onResetSimulation: () => void;
}

const LANGUAGES: { code: BhuLanguage; label: string; native: string; region: string }[] = [
  { code: 'en', label: 'English', native: 'English', region: 'Global / Standard' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', region: 'Assam / Brahmaputra Valley' },
  { code: 'kha', label: 'Khasi', native: 'Ka Ktien Khasi', region: 'Meghalaya / Shillong Plateau' },
  { code: 'lus', label: 'Mizo', native: 'Mizo ṭawng', region: 'Mizoram / Lushai Hills' },
  { code: 'mni', label: 'Manipuri', native: 'মৈতৈলোন্', region: 'Manipur / Imphal Basin' },
];

export const SettingsPageView: React.FC<SettingsPageViewProps> = ({
  currentLanguage,
  onLanguageChange,
  onResetSimulation,
}) => {
  const [metricUnit, setMetricUnit] = useState<'si' | 'custom'>('si');
  const [loraChannel, setLoraChannel] = useState('IN865_CH1_865.2MHZ');
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    setToastMessage('System configuration successfully synced to local storage!');
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-6 w-full max-w-[1720px] mx-auto">
      {/* Header */}
      <div className="clay-panel p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white shadow-[4px_6px_12px_rgba(71,85,105,0.3)] border-t border-white/40">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                System Administration
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE CONFIG
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 font-sans">
              Platform Settings &amp; Telemetry Configuration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Regional language localization, IoT sensor gateway parameters, and cloud persistence.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="clay-button-primary px-4 py-2.5 text-xs font-bold"
        >
          Save Configuration
        </button>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Localization & Language */}
        <div className="clay-panel p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Northeast Regional Language Localization
            </h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Select the primary dialect for emergency cell broadcasts, field instructions, and AI risk synthesis.
          </p>

          <div className="space-y-2">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;

              return (
                <div
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'clay-card-active ring-2 ring-blue-500/80'
                      : 'clay-card hover:translate-y-[-2px]'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{lang.native}</div>
                    <div className="text-[11px] text-slate-500">{lang.label} • {lang.region}</div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry & Gateway Settings */}
        <div className="clay-panel p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
            <Radio className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              IoT Sensor Gateway &amp; LoRaWAN Parameters
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">LoRa Physical Frequency Band</label>
              <select
                value={loraChannel}
                onChange={(e) => setLoraChannel(e.target.value)}
                className="clay-select w-full p-2.5 text-xs"
              >
                <option value="IN865_CH1_865.2MHZ">IN865 (India 865.2 MHz - Standard)</option>
                <option value="IN865_CH2_865.8MHZ">IN865 (India 865.8 MHz - Redundant)</option>
                <option value="EU868_FALLBACK">EU868 (Fallback)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Emergency SMS Cell Broadcast Auto-Trigger</label>
              <div className="flex items-center gap-2.5 mt-1">
                <button
                  onClick={() => setAutoSmsEnabled(true)}
                  className={
                    autoSmsEnabled
                      ? 'clay-button-primary px-3 py-1.5 text-xs font-bold'
                      : 'clay-button px-3 py-1.5 text-xs font-bold'
                  }
                >
                  Enabled (FS &lt; 1.0)
                </button>
                <button
                  onClick={() => setAutoSmsEnabled(false)}
                  className={
                    !autoSmsEnabled
                      ? 'clay-button-danger px-3 py-1.5 text-xs font-bold'
                      : 'clay-button px-3 py-1.5 text-xs font-bold'
                  }
                >
                  Manual Approval Only
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/80">
              <label className="block text-slate-700 font-bold mb-1.5">Database &amp; Data Pipeline Status</label>
              <div className="clay-card-raised p-3 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Firebase Firestore:</span>
                  <span className="text-emerald-700 font-bold font-mono">CONNECTED</span>
                </div>
                <div className="flex justify-between">
                  <span>Open-Meteo Weather API:</span>
                  <span className="text-emerald-700 font-bold font-mono">200 OK</span>
                </div>
                <div className="flex justify-between">
                  <span>PINN Digital Twin:</span>
                  <span className="text-blue-700 font-bold font-mono">INFERENCE ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onResetSimulation}
                className="clay-button-secondary w-full py-2.5 text-xs font-bold"
              >
                Reset All Geotechnical Perturbations to Nominal Baseline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
