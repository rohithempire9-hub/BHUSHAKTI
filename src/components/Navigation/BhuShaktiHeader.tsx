import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Globe,
  Sun,
  Moon,
  ShieldAlert,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { BhuLanguage } from '../../types/bhuShakti';
import { TRANSLATIONS } from '../../utils/translations';

interface BhuShaktiHeaderProps {
  currentLanguage: BhuLanguage;
  onLanguageChange: (lang: BhuLanguage) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onTriggerMassSos: () => void;
  activeAlertsCount: number;
}

const LANGUAGE_OPTIONS: { code: BhuLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'kha', label: 'Khasi', native: 'Ka Ktien Khasi' },
  { code: 'lus', label: 'Mizo', native: 'Mizo ṭawng' },
  { code: 'mni', label: 'Manipuri', native: 'মৈতৈলোন্' },
];

export const BhuShaktiHeader: React.FC<BhuShaktiHeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  isDarkMode,
  onToggleTheme,
  onTriggerMassSos,
  activeAlertsCount,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  return (
    <header
      id="bhushakti-main-header"
      className="sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-200 bg-[#0f172a]/95 border-slate-800 text-slate-100 shadow-xl"
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left side: Clean minimalistic typography with platform name "BhuShakti" and a slow, pulsing status dot */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Slow pulsing status dot */}
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute opacity-70 duration-1000" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white font-sans">
                BhuShakti
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                GIS & IoT Command
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-medium truncate max-w-lg">
              AI-Based Early Warning and Landslide Risk Monitoring System for the North Eastern Region (NER)
            </p>
          </div>
        </div>

        {/* Right side: Network Status: Offline-Sync Active badge and Global Language Selector dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Distinct badge: Network Status: Offline-Sync Active */}
          <div
            id="network-status-badge"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs shadow-inner"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400 font-medium hidden sm:inline">Network Status:</span>
            <span className="font-bold text-emerald-400">Offline-Sync Active</span>
          </div>

          {/* Global Language Selector dropdown (English, Assamese, Khasi, Mizo, Manipuri) */}
          <div className="relative">
            <button
              id="lang-selector-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
              title={t.selectLanguage}
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{currentLangObj.native}</span>
              <span className="sm:hidden uppercase">{currentLangObj.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div
                id="lang-dropdown-menu"
                className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
                  {t.selectLanguage} (NER Regional)
                </div>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                      currentLanguage === lang.code
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({lang.label})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-400 transition-colors shadow-sm cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Slate Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* Simulate Mass SOS Alert Header Button */}
          <button
            id="header-mass-sos-btn"
            onClick={onTriggerMassSos}
            className="relative flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-950/60 border border-rose-400/40 transition-all transform active:scale-95 cursor-pointer"
            title="Simulate Mass SOS Alert"
          >
            <ShieldAlert className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline whitespace-nowrap">{t.simulateMassSos}</span>
            <span className="sm:hidden">SOS</span>
            {activeAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono text-amber-300 border border-amber-300/30">
                {activeAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
