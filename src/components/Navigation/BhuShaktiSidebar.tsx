import React from 'react';
import {
  MapPin,
  Cpu,
  Camera,
  Radio,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { BhuLanguage } from '../../types/bhuShakti';
import { TRANSLATIONS } from '../../utils/translations';

export type BhuNavSection =
  | 'live_map'
  | 'sensing_grid'
  | 'citizen_reports'
  | 'sms_hub'
  | 'risk_forecasts'
  | 'simulation_bench'
  // Legacy values retained so the existing top-level views continue to work.
  | 'risk_matrix'
  | 'historical_logs'
  | 'overview';

interface BhuShaktiSidebarProps {
  currentSection: BhuNavSection;
  onSelectSection: (section: BhuNavSection) => void;
  currentLanguage: BhuLanguage;
  pendingReportsCount: number;
  activeCriticalNodesCount: number;
  registeredDevicesCount: number;
}

export const BhuShaktiSidebar: React.FC<BhuShaktiSidebarProps> = ({
  currentSection,
  onSelectSection,
  currentLanguage,
  pendingReportsCount,
  activeCriticalNodesCount,
  registeredDevicesCount,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // These are the ONLY six module navigation buttons.
  // The four top-level application views remain in App.tsx above the dashboard.
  const navItems: {
    id: BhuNavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      id: 'live_map',
      label: t.navLiveMap,
      icon: MapPin,
    },
    {
      id: 'sensing_grid',
      label: t.navSensingGrid,
      icon: Cpu,
      badge: activeCriticalNodesCount > 0 ? `${activeCriticalNodesCount} Alert` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'risk_forecasts',
      label: t.navRiskForecasts,
      icon: TrendingUp,
    },
    {
      id: 'sms_hub',
      label: t.navSmsBroadcast,
      icon: Radio,
      badge: `${registeredDevicesCount} Dev`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'citizen_reports',
      label: t.navCitizenReports,
      icon: Camera,
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} New` : undefined,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'simulation_bench',
      label: 'Simulation Bench',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <aside
      id="bhushakti-main-sidebar"
      className="w-full lg:w-64 shrink-0 bg-slate-900/90 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 lg:p-4 flex flex-col justify-between"
    >
      <div>
        <div className="hidden lg:flex items-center justify-between px-2 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Operations Command</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>

        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap lg:whitespace-normal cursor-pointer text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/40 text-emerald-300 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`hidden lg:block w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-emerald-400 translate-x-0.5' : 'text-slate-600'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="hidden lg:block mt-6 pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-bold mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NER Geotechnical Standard</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
            Calibrated for Himalayan flysch, Tipam siltstone & torrential monsoon rainfall thresholds.
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>IS 14458 / GSI Norms</span>
            <span className="text-emerald-400 font-bold">ISO 22320</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
