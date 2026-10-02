import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

export type AuthLanguage = 'en' | 'te' | 'hi' | 'as';

interface LanguageOption {
  code: AuthLanguage;
  label: string;
  native: string;
}

export const AUTH_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' }
];

interface LanguageSelectorProps {
  currentLang: AuthLanguage;
  onLanguageChange: (lang: AuthLanguage) => void;
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onLanguageChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedObj = AUTH_LANGUAGES.find((l) => l.code === currentLang) || AUTH_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Translucent Blue Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#04192f]/85 hover:bg-[#072442]/90 border border-cyan-400/50 hover:border-cyan-300 text-cyan-100 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-xl shadow-lg shadow-cyan-950/40 transition-all cursor-pointer group active:scale-95"
        aria-label="Select platform language"
      >
        <Globe className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
        <span>{selectedObj.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-cyan-300/80 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#04192f]/95 border border-cyan-400/40 backdrop-blur-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400/70 border-b border-cyan-900/50 mb-1">
            Choose Language
          </div>
          {AUTH_LANGUAGES.map((item) => {
            const isSelected = item.code === currentLang;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  onLanguageChange(item.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40'
                    : 'text-slate-200 hover:bg-cyan-950/50 hover:text-white'
                }`}
              >
                <div className="flex flex-col text-left">
                  <span>{item.label}</span>
                  <span className="text-[10px] text-cyan-400/70 font-mono">{item.native}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
