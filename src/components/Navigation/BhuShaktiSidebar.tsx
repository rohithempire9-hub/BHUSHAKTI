import React from 'react';
import {
  Home,
  Map,
  Flame,
  ShieldCheck,
  BarChart3,
  CloudRain,
  AlertTriangle,
  Radio,
  FileText,
  BrainCircuit,
  Waves,
  Box,
  GitBranch,
  Archive,
  ChevronRight,
  Compass,
  Activity,
  X
} from 'lucide-react';
import { BhuLanguage } from '../../types/bhuShakti';
import { TRANSLATIONS } from '../../utils/translations';

export type BhuNavSection =
  | 'dashboard'
  | 'risk_map'
  | 'landslide'
  | 'flood'
  | 'war_room'
  | 'disaster_3d'
  | 'what_if'
  | 'emergency_response'
  | 'weather'
  | 'analytics'
  | 'historical'
  | 'field_reports'
  | 'alerts'
  | 'ai_insights'
  | 'settings';

interface BhuShaktiSidebarProps {
  currentSection: BhuNavSection;
  onSelectSection: (section: BhuNavSection) => void;
  currentLanguage?: BhuLanguage;
  pendingReportsCount?: number;
  activeCriticalNodesCount?: number;
  registeredDevicesCount?: number;
  onOpenSmsModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItemConfig {
  id: BhuNavSection | 'sms_center';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconGradient: string;
  iconShadow: string;
  action?: () => void;
}

export const BhuShaktiSidebar: React.FC<BhuShaktiSidebarProps> = ({
  currentSection,
  onSelectSection,
  currentLanguage = 'en',
  pendingReportsCount = 1,
  activeCriticalNodesCount = 3,
  onOpenSmsModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // SECTION 1 — MONITORING & GIS
  const monitoringItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: t.navDashboard,
      icon: Home,
      iconGradient: 'from-blue-600 to-indigo-600',
      iconShadow: 'shadow-blue-500/30',
    },
    {
      id: 'risk_map',
      label: t.navRiskMap,
      icon: Map,
      iconGradient: 'from-emerald-500 to-teal-600',
      iconShadow: 'shadow-emerald-500/25',
    },
    {
      id: 'landslide',
      label: t.navLiveMonitoring,
      icon: Flame,
      iconGradient: 'from-amber-400 via-orange-500 to-amber-600',
      iconShadow: 'shadow-orange-500/30',
    },
    {
      id: 'emergency_response',
      label: t.navSafeRoutes,
      icon: ShieldCheck,
      iconGradient: 'from-teal-500 via-emerald-600 to-teal-700',
      iconShadow: 'shadow-teal-500/25',
    },
    {
      id: 'analytics',
      label: t.navAnalytics,
      icon: BarChart3,
      iconGradient: 'from-purple-500 via-purple-600 to-indigo-600',
      iconShadow: 'shadow-purple-500/30',
    },
    {
      id: 'weather',
      label: t.navWeatherRadar,
      icon: CloudRain,
      iconGradient: 'from-cyan-400 via-cyan-500 to-blue-600',
      iconShadow: 'shadow-cyan-500/30',
    },
  ];

  // SECTION 2 — EMERGENCY & FIELD
  const emergencyItems: NavItemConfig[] = [
    {
      id: 'alerts',
      label: t.navAlerts,
      icon: AlertTriangle,
      iconGradient: 'from-red-500 via-rose-600 to-pink-600',
      iconShadow: 'shadow-red-500/30',
    },
    {
      id: 'sms_center',
      label: t.navSmsWarning,
      icon: Radio,
      iconGradient: 'from-amber-500 via-orange-500 to-red-500',
      iconShadow: 'shadow-orange-500/30',
      action: () => {
        if (onOpenSmsModal) onOpenSmsModal();
        else onSelectSection('alerts');
      },
    },
    {
      id: 'field_reports',
      label: t.navFieldEvidence,
      icon: FileText,
      iconGradient: 'from-emerald-500 to-teal-600',
      iconShadow: 'shadow-emerald-500/25',
    },
    {
      id: 'war_room',
      label: t.navDisasterIntelligence,
      icon: BrainCircuit,
      iconGradient: 'from-purple-500 via-indigo-600 to-purple-700',
      iconShadow: 'shadow-purple-500/30',
    },
  ];

  // SECTION 3 — ANALYSIS & SIMULATION
  const simulationItems: NavItemConfig[] = [
    {
      id: 'flood',
      label: 'Flood Inundation',
      icon: Waves,
      iconGradient: 'from-cyan-500 to-blue-600',
      iconShadow: 'shadow-cyan-500/25',
    },
    {
      id: 'disaster_3d',
      label: t.navDigitalTwin,
      icon: Box,
      iconGradient: 'from-blue-500 via-indigo-600 to-blue-700',
      iconShadow: 'shadow-blue-500/30',
    },
    {
      id: 'what_if',
      label: t.navWhatIfSimulator,
      icon: GitBranch,
      iconGradient: 'from-purple-500 via-pink-600 to-rose-500',
      iconShadow: 'shadow-pink-500/25',
    },
    {
      id: 'historical',
      label: t.navHistoricalArchive,
      icon: Archive,
      iconGradient: 'from-amber-400 via-orange-500 to-amber-600',
      iconShadow: 'shadow-orange-500/25',
    },
  ];

  const handleItemClick = (item: NavItemConfig) => {
    if (item.action) {
      item.action();
    } else {
      onSelectSection(item.id as BhuNavSection);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavGroup = (
    title: string,
    HeaderIcon: React.ComponentType<{ className?: string }>,
    iconColor: string,
    items: NavItemConfig[],
    showDivider = false
  ) => (
    <div className="space-y-1.5">
      {showDivider && (
        <div className="my-3.5 border-t border-slate-200/80" />
      )}

      {/* Section Header */}
      <div className="flex items-center gap-2 px-3 pt-1 pb-1.5 text-[11px] font-black uppercase tracking-wider text-slate-500 font-mono">
        <HeaderIcon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span>{title}</span>
      </div>

      {/* Items Container */}
      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;

          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              onClick={() => handleItemClick(item)}
              className={`w-full group flex items-center justify-between h-[56px] px-3 py-2 rounded-2xl transition-all duration-200 ease-out cursor-pointer text-left ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50/95 via-blue-50/60 to-indigo-50/30 border border-blue-200/90 border-l-[4px] border-l-blue-600 shadow-sm shadow-blue-500/10'
                  : 'bg-white hover:bg-slate-50/90 border border-transparent hover:border-slate-200/70 hover:translate-x-1 shadow-none hover:shadow-2xs'
              }`}
            >
              {/* Left: Colorful Icon Container & Item Name (Vertically centered, full width) */}
              <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                {/* 40-44px Colorful Gradient Icon Box */}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.iconGradient} flex items-center justify-center shrink-0 shadow-md ${item.iconShadow} transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>

                {/* Item Name */}
                <span
                  className={`truncate text-[13px] font-bold tracking-tight transition-colors ${
                    isActive
                      ? 'text-blue-900 font-extrabold'
                      : 'text-[#0F172A] group-hover:text-blue-700'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {/* Right: Right-facing navigation arrow only (No badges/tags) */}
              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-all duration-200 ml-2 ${
                  isActive
                    ? 'text-blue-600 translate-x-0.5'
                    : 'text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-y-auto max-h-[calc(100vh-120px)] pr-1.5 scrollbar-thin space-y-2">
        {/* Mobile Header with Close Button */}
        {onCloseMobile && (
          <div className="lg:hidden flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wider">
                BhuShakti Navigation
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Section 1: MONITORING & GIS */}
        {renderNavGroup(t.sectionMonitoringGis, Compass, 'text-blue-600', monitoringItems, false)}

        {/* Section 2: EMERGENCY & FIELD */}
        {renderNavGroup(t.sectionEmergencyField, AlertTriangle, 'text-rose-600', emergencyItems, true)}

        {/* Section 3: ANALYSIS & SIMULATION */}
        {renderNavGroup(t.sectionAdvIntelligence, Activity, 'text-blue-600', simulationItems, true)}
      </div>

      {/* Footer System Status Card */}
      <div className="pt-3 border-t border-slate-200/90 text-xs text-slate-500">
        <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/80 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[10.5px] text-slate-800 font-bold tracking-tight">
              PINN AI MODEL v3.2
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (280-300px width on desktop) */}
      <aside
        id="bhushakti-main-sidebar"
        className="hidden lg:flex w-[290px] xl:w-[300px] shrink-0 bg-white border-r border-slate-200/90 p-4 flex-col justify-between shadow-xs z-30"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative w-[300px] max-w-[85vw] bg-white border-r border-slate-200 p-4 shadow-2xl z-10 overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
