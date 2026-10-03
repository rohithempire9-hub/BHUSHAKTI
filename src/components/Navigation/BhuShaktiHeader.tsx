import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Globe,
  User,
  ChevronDown,
  X,
  Menu,
  ShieldCheck,
  CloudSun,
  Database,
  LogOut,
  ShieldAlert,
  Check,
  Settings,
  Sparkles,
  Building
} from 'lucide-react';
import { BhuLanguage } from '../../types/bhuShakti';
import { TRANSLATIONS } from '../../utils/translations';
import { BhuNavSection } from './BhuShaktiSidebar';
import { BhuShaktiLogo } from './BhuShaktiLogo';
import { DemoScenarioId } from '../Demo/SihDemoBar';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

interface BhuShaktiHeaderProps {
  currentLanguage: BhuLanguage;
  onLanguageChange: (lang: BhuLanguage) => void;
  onNavigate: (section: BhuNavSection) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeAlertsCount?: number;
  onOpenSmsModal?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
  activeScenario?: DemoScenarioId;
  onSelectScenario?: (scenario: DemoScenarioId) => void;
  onOpenAuth?: () => void;
}

const LANGUAGE_OPTIONS: { code: BhuLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली' },
  { code: 'mni', label: 'Meitei', native: 'মণিপুরী' },
  { code: 'kha', label: 'Khasi', native: 'खासी' },
  { code: 'lus', label: 'Mizo', native: 'मिज़ो' },
  { code: 'brx', label: 'Bodo', native: 'बोडो' },
];

const AVAILABLE_ROLES: UserRole[] = [
  'Disaster Management Officer',
  'Administrator',
  'Emergency Responder',
  'Field Officer',
  'Researcher',
  'Viewer'
];

export const BhuShaktiHeader: React.FC<BhuShaktiHeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onNavigate,
  searchQuery,
  onSearchChange,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onOpenAuth
}) => {
  const { user, isAuthenticated, logout, updateUserRole } = useAuth();
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const currentLangObj = LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'DM';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      ref={headerRef}
      id="bhushakti-main-header"
      className="sticky top-0 z-40 w-full bg-white/95 border-b border-slate-200/90 backdrop-blur-md transition-colors shadow-xs"
    >
      <div className="max-w-[1720px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
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
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  GIS v3.2
                </span>
              </div>
              <div className="text-[10px] font-medium text-slate-500 truncate hidden xs:block">
                {t.platformSubtitle.split('&')[0].trim()}
              </div>
            </div>
          </div>

          {/* Status Pills */}
          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200/80">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white text-emerald-700 border border-emerald-200/80 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),2px_3px_6px_rgba(148,163,184,0.18)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>SYSTEM ONLINE</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white text-cyan-700 border border-cyan-200/80 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),2px_3px_6px_rgba(148,163,184,0.18)]">
              <CloudSun className="w-3 h-3 text-cyan-600" />
              <span>WEATHER LIVE</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white text-purple-700 border border-purple-200/80 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9),2px_3px_6px_rgba(148,163,184,0.18)]">
              <Database className="w-3 h-3 text-purple-600" />
              <span>GIS UPDATED</span>
            </span>
          </div>
        </div>

        {/* Center: Search location */}
        <div className="flex-1 max-w-2xl mx-1 sm:mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="header-location-search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9.5 pr-8 py-2 rounded-xl clay-input text-xs text-slate-900 placeholder-slate-400 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right side controls: Language Selector & Admin Button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="header-language-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="clay-control flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold"
              title="Select Interface Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="font-semibold text-slate-800">{currentLangObj.native}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {langDropdownOpen && (
              <div
                id="header-lang-menu"
                className="absolute right-0 mt-2 w-48 clay-dropdown p-2 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] overflow-y-auto"
              >
                {LANGUAGE_OPTIONS.map((lang) => {
                  const isSelected = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-100/70 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-4 text-center font-bold text-blue-600 shrink-0">
                        {isSelected ? '✓' : ''}
                      </span>
                      <span className="text-xs font-semibold">{lang.native}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Profile / Authentication Menu */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                id="header-user-btn"
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="clay-control flex items-center gap-2 pl-2 pr-3 py-1.5"
                title="User Profile & Access Control"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-[11px] font-black shadow-[inset_1px_1px_1px_rgba(255,255,255,0.6)]">
                  {getInitials(user.full_name)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                    {user.full_name}
                  </div>
                  <div className="text-[10px] font-semibold text-blue-600 truncate max-w-[130px]">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {userMenuOpen && (
                <div
                  id="header-user-menu"
                  className="absolute right-0 mt-2 w-72 clay-dropdown p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* User Profile Card */}
                  <div className="p-3 rounded-2xl clay-card-raised mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center font-black text-sm shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)] shrink-0">
                        {getInitials(user.full_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-slate-900 truncate">
                          {user.full_name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate font-mono">
                          {user.email}
                        </div>
                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {user.role}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{user.organization}</span>
                      </div>
                    </div>
                  </div>

                  {/* Switch Role Simulator */}
                  <div className="mb-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1 font-mono">
                      Simulate Role Permissions
                    </div>
                    <div className="space-y-0.5">
                      {AVAILABLE_ROLES.map((roleOption) => (
                        <button
                          key={roleOption}
                          type="button"
                          onClick={() => {
                            updateUserRole(roleOption);
                            setUserMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
                            user.role === roleOption
                              ? 'bg-blue-50 text-blue-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-100/60'
                          }`}
                        >
                          <span className="truncate">{roleOption}</span>
                          {user.role === roleOption && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onNavigate('settings');
                        setUserMenuOpen(false);
                      }}
                      className="clay-button flex-1 py-2 px-2.5 text-xs"
                    >
                      <Settings className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      <span>Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="clay-button-danger flex-1 py-2 px-2.5 text-xs"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="header-signin-btn"
              type="button"
              onClick={onOpenAuth}
              className="clay-button-primary px-4 py-2 text-xs font-bold"
            >
              <User className="w-3.5 h-3.5 mr-1.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

