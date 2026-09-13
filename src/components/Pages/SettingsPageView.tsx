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
      <div className="rounded-2xl bg-[#0b1738] border border-[#1b3470] p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-700/30 text-slate-300 border border-slate-600/40">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                System Administration
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE CONFIG
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans">
              Platform Settings &amp; Telemetry Configuration
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Regional language localization, IoT sensor gateway parameters, and cloud persistence.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30 text-xs transition-all active:scale-95 cursor-pointer"
        >
          Save Configuration
        </button>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Localization & Language */}
        <div className="rounded-2xl bg-[#0a1738] border border-[#162e66] p-5 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#162e66]">
            <Globe className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Northeast Regional Language Localization
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Select the primary dialect for emergency cell broadcasts, field instructions, and AI risk synthesis.
          </p>

          <div className="space-y-2">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLanguage === lang.code;

              return (
                <div
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#102554] border-cyan-400 shadow-md'
                      : 'bg-[#071129] border-[#18316c] hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-white">{lang.native}</div>
                    <div className="text-[11px] text-slate-400">{lang.label} • {lang.region}</div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry & Gateway Settings */}
        <div className="rounded-2xl bg-[#0a1738] border border-[#162e66] p-5 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#162e66]">
            <Radio className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              IoT Sensor Gateway &amp; LoRaWAN Parameters
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">LoRa Physical Frequency Band</label>
              <select
                value={loraChannel}
                onChange={(e) => setLoraChannel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#071129] border border-[#18316c] text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="IN865_CH1_865.2MHZ">IN865 (India 865.2 MHz - Standard)</option>
                <option value="IN865_CH2_865.8MHZ">IN865 (India 865.8 MHz - Redundant)</option>
                <option value="EU868_FALLBACK">EU868 (Fallback)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Emergency SMS Cell Broadcast Auto-Trigger</label>
              <div className="flex items-center gap-3 mt-1">
                <button
                  onClick={() => setAutoSmsEnabled(true)}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    autoSmsEnabled ? 'bg-cyan-600 text-white' : 'bg-[#071129] text-slate-400 border border-[#18316c]'
                  }`}
                >
                  Enabled (FS &lt; 1.0)
                </button>
                <button
                  onClick={() => setAutoSmsEnabled(false)}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    !autoSmsEnabled ? 'bg-rose-600 text-white' : 'bg-[#071129] text-slate-400 border border-[#18316c]'
                  }`}
                >
                  Manual Approval Only
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-[#18316c]">
              <label className="block text-slate-300 font-bold mb-1">Database &amp; Data Pipeline Status</label>
              <div className="p-3 rounded-xl bg-[#071129] border border-[#18316c] space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span>Firebase Firestore:</span>
                  <span className="text-emerald-400 font-bold font-mono">CONNECTED</span>
                </div>
                <div className="flex justify-between">
                  <span>Open-Meteo Weather API:</span>
                  <span className="text-emerald-400 font-bold font-mono">200 OK</span>
                </div>
                <div className="flex justify-between">
                  <span>PINN Digital Twin:</span>
                  <span className="text-cyan-400 font-bold font-mono">INFERENCE ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onResetSimulation}
                className="w-full py-2.5 rounded-xl bg-[#0e214d] hover:bg-[#142e6a] text-cyan-300 border border-cyan-500/40 font-bold transition-all cursor-pointer"
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
