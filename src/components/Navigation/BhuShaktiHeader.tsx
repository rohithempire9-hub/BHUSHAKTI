import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Globe,
  User,
  ChevronDown,
  X,
  Menu,
  Radio,
  Sparkles,
  Flame,
  Waves,
  GitBranch,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { BhuLanguage } from '../../types/bhuShakti';
import { BhuNavSection } from './BhuShaktiSidebar';
import { BhuShaktiLogo } from './BhuShaktiLogo';
import { DemoScenarioId } from '../Demo/SihDemoBar';

interface BhuShaktiHeaderProps {
  currentLanguage: BhuLanguage;
  onLanguageChange: (lang: BhuLanguage) => void;
  onNavigate: (section: BhuNavSection) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeAlertsCount: number;
  onOpenSmsModal?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  activeScenario?: DemoScenarioId;
  onSelectScenario?: (scenario: DemoScenarioId) => void;
}

const LANGUAGE_OPTIONS: { code: BhuLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'kha', label: 'Khasi', native: 'Ka Ktien Khasi' },
  { code: 'lus', label: 'Mizo', native: 'Mizo ṭawng' },
  { code: 'mni', label: 'Manipuri', native: 'মৈতৈলোন্' },
];

const SCENARIOS: { id: DemoScenarioId; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'tawang_escalation', label: 'Tawang Escalation', icon: Flame, color: 'text-rose-400' },
  { id: 'assam_flood', label: 'Assam River Flood', icon: Waves, color: 'text-cyan-400' },
  { id: 'multi_cascade', label: 'Multi-Hazard Cascade', icon: GitBranch, color: 'text-purple-400' },
  { id: 'offline_outage', label: 'Offline Outage', icon: WifiOff, color: 'text-amber-400' },
  { id: 'evidence_conflict', label: 'Evidence Conflict', icon: AlertTriangle, color: 'text-yellow-400' },
];

export const BhuShaktiHeader: React.FC<BhuShaktiHeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onNavigate,
  searchQuery,
  onSearchChange,
  onOpenSmsModal,
  isMobileMenuOpen,
  onToggleMobileMenu,
  activeScenario = 'none',
  onSelectScenario,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [scenarioDropdownOpen, setScenarioDropdownOpen] = useState(false);
  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
        setScenarioDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header
      ref={headerRef}
      id="bhushakti-main-header"
      className="sticky top-0 z-40 w-full bg-slate-950/75 border-b border-white/10 backdrop-blur-2xl transition-colors shadow-2xl"
    >
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2.5 sm:gap-6">
        {/* Left: Hamburger (mobile only) + Brand + System Operational Status */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Mobile hamburger menu toggle */}
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white cursor-pointer active:scale-95"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onNavigate('dashboard')}
            title="Return to Primary Dashboard"
          >
            <BhuShaktiLogo size="md" className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-base sm:text-lg font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-300 font-sans">
                  BhuShakti AI
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  v3.2 NER
                </span>
              </div>
              <div className="hidden xs:flex items-center gap-2 mt-0.5">
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

        {/* Center: Search location */}
        <div className="flex-1 max-w-xl mx-1 sm:mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="header-location-search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search location (e.g. Tawang, Gangtok, Dima Hasao)..."
              className="w-full pl-9.5 pr-8 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-inner transition-all"
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

        {/* Right side buttons: SMS Alert, Scenarios, Language, Admin */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Direct SMS Alert Header Button */}
          {onOpenSmsModal && (
            <button
              id="header-sms-alert-btn"
              onClick={onOpenSmsModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600/30 to-amber-600/30 hover:from-rose-600/50 hover:to-amber-600/50 border border-rose-500/40 text-rose-200 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
              title="Open SMS Alert Center"
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="hidden sm:inline">SMS Alert</span>
            </button>
          )}

          {/* Test Scenarios Dropdown (Compact, Non-Intrusive) */}
          {onSelectScenario && (
            <div className="relative">
              <button
                id="header-scenarios-btn"
                onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                  activeScenario !== 'none'
                    ? 'bg-violet-600/30 border-violet-400/60 text-violet-200'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-200 hover:text-white'
                }`}
                title="Simulate SIH Disaster Scenarios"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden md:inline">Simulations</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {scenarioDropdownOpen && (
                <div
                  id="header-scenarios-menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f172a] border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <span>Disaster Scenarios</span>
                    {activeScenario !== 'none' && (
                      <button
                        onClick={() => {
                          onSelectScenario('none');
                          setScenarioDropdownOpen(false);
                        }}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {SCENARIOS.map((sc) => {
                    const Icon = sc.icon;
                    const isActive = activeScenario === sc.id;
                    return (
                      <button
                        key={sc.id}
                        onClick={() => {
                          onSelectScenario(sc.id);
                          setScenarioDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-violet-600/25 text-violet-200 font-bold border border-violet-500/30'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${sc.color}`} />
                        <span>{sc.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="header-language-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{currentLangObj.label}</span>
              <span className="sm:hidden uppercase text-[10px] font-mono">{currentLangObj.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div
                id="header-lang-menu"
                className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0f172a] border border-slate-700 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1">
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
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
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

