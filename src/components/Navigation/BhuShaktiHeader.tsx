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
      className="sticky top-0 z-40 w-full bg-white/95 border-b border-slate-200 backdrop-blur-md transition-colors shadow-sm"
    >
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2.5 sm:gap-6">
        {/* Left: Hamburger (mobile only) + Brand + Status Pills */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile hamburger menu toggle */}
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 cursor-pointer active:scale-95"
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
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 font-sans">
                  BhuShakti
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  GIS v3.2
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-500 truncate hidden xs:block">
                Landslide Early Warning &amp; Risk Monitoring
              </div>
            </div>
          </div>

          {/* Status Pills */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-slate-200">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-700 border border-sky-200">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              WEATHER LIVE
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              GIS UPDATED
            </span>
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
              placeholder="Search station or region (e.g. Tawang, Gangtok, Dima Hasao)..."
              className="w-full pl-9.5 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 shadow-inner transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
              title="Open SMS Alert Center"
            >
              <Radio className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span className="hidden sm:inline">SMS Alert</span>
            </button>
          )}

          {/* Test Scenarios Dropdown */}
          {onSelectScenario && (
            <div className="relative">
              <button
                id="header-scenarios-btn"
                onClick={() => setScenarioDropdownOpen(!scenarioDropdownOpen)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                  activeScenario !== 'none'
                    ? 'bg-purple-50 border-purple-300 text-purple-700'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900'
                }`}
                title="Simulate SIH Disaster Scenarios"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">Simulations</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {scenarioDropdownOpen && (
                <div
                  id="header-scenarios-menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span>Disaster Scenarios</span>
                    {activeScenario !== 'none' && (
                      <button
                        onClick={() => {
                          onSelectScenario('none');
                          setScenarioDropdownOpen(false);
                        }}
                        className="text-[10px] text-blue-600 hover:underline"
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
                            ? 'bg-purple-50 text-purple-800 font-bold border border-purple-200'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0 text-purple-600" />
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
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">{currentLangObj.label}</span>
              <span className="sm:hidden uppercase text-[10px] font-mono">{currentLangObj.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div
                id="header-lang-menu"
                className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1">
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
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{lang.native}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Admin Button */}
          <button
            id="header-admin-btn"
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
            title="System Administration & Settings"
          >
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};

