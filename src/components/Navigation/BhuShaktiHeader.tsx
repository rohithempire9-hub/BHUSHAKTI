import React, { useState } from 'react';
import {
  Search,
  CloudRain,
  Bell,
  Globe,
  User,
  ChevronDown,
  X
} from 'lucide-react';
import { BhuLanguage } from '../../types/bhuShakti';
import { BhuNavSection } from './BhuShaktiSidebar';
import { BhuShaktiLogo } from './BhuShaktiLogo';

interface BhuShaktiHeaderProps {
  currentLanguage: BhuLanguage;
  onLanguageChange: (lang: BhuLanguage) => void;
  onNavigate: (section: BhuNavSection) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
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
  onNavigate,
  searchQuery,
  onSearchChange,
  activeAlertsCount,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  return (
    <header
      id="bhushakti-main-header"
      className="sticky top-0 z-40 w-full bg-[#060e22]/95 border-b border-[#142654] backdrop-blur-xl transition-colors shadow-xl"
    >
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand + System Operational Status - Authoritative Outer Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
            title="Return to Primary Dashboard"
          >
            <BhuShaktiLogo size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-wide text-white font-sans">
                  BhuShakti AI
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  v3.2 NER
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase font-mono truncate">
                  16 NER SENSOR STATIONS ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Search location... search bar as seen in screenshot */}
        <div className="flex-1 max-w-xl mx-2 sm:mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="header-location-search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search location (e.g. Tawang, Gangtok, Dima Hasao)..."
              className="w-full pl-9.5 pr-8 py-2 rounded-xl bg-[#0b183b] border border-[#1b3470] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-inner transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right side pill buttons: Weather, Alerts, English, Admin */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Weather Button */}
          <button
            id="header-weather-btn"
            onClick={() => onNavigate('weather')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1a3e] hover:bg-[#112456] border border-[#1c3672] text-slate-200 hover:text-cyan-300 text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
            title="Open Live Weather Hub"
          >
            <CloudRain className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Weather</span>
          </button>

          {/* Alerts Button */}
          <button
            id="header-alerts-btn"
            onClick={() => onNavigate('alerts')}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1a3e] hover:bg-[#112456] border border-[#1c3672] text-slate-200 hover:text-rose-300 text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
            title="View Active Alerts & SOS"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-[10px] font-mono font-bold text-white shadow-sm">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="header-language-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1a3e] hover:bg-[#112456] border border-[#1c3672] text-slate-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{currentLangObj.label}</span>
              <span className="sm:hidden uppercase">{currentLangObj.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div
                id="header-lang-menu"
                className="absolute right-0 mt-2 w-48 rounded-xl bg-[#091533] border border-[#1d3876] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-[#182d5e] mb-1">
                  Language Selector
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
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-[#112454] hover:text-white'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Button */}
          <button
            id="header-admin-btn"
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0c1a3e] hover:bg-[#112456] border border-[#1c3672] text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
            title="System Administration & Settings"
          >
            <User className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
