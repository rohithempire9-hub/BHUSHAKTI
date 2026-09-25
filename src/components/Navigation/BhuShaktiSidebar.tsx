import React from 'react';
import {
  Home,
  Map,
  Flame,
  Waves,
  Globe,
  CloudRain,
  BarChart3,
  Clock,
  MapPin,
  AlertTriangle,
  Cpu,
  Settings,
  ShieldCheck,
  ChevronRight,
  Radio,
  Sliders,
  Brain,
  FileText,
  X
} from 'lucide-react';
import { BhuLanguage } from '../../types/bhuShakti';

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
  currentLanguage: BhuLanguage;
  pendingReportsCount: number;
  activeCriticalNodesCount: number;
  registeredDevicesCount: number;
  onOpenSmsModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const BhuShaktiSidebar: React.FC<BhuShaktiSidebarProps> = ({
  currentSection,
  onSelectSection,
  pendingReportsCount,
  activeCriticalNodesCount,
  onOpenSmsModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Primary Navigation Sections
  const primaryNavItems: {
    id: BhuNavSection | 'sms_center';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    iconColor?: string;
    action?: () => void;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      iconColor: 'text-cyan-400',
    },
    {
      id: 'risk_map',
      label: 'Risk Map',
      icon: Map,
      iconColor: 'text-emerald-400',
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: CloudRain,
      iconColor: 'text-sky-400',
    },
    {
      id: 'landslide',
      label: 'Hazard Analysis',
      icon: Flame,
      iconColor: 'text-amber-400',
      badge: activeCriticalNodesCount > 0 ? `${activeCriticalNodesCount} Active` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      badge: '12',
      badgeColor: 'bg-rose-600 text-white font-bold',
    },
    {
      id: 'sms_center',
      label: 'SMS Center',
      icon: Radio,
      iconColor: 'text-rose-400',
      badge: 'Direct',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      action: () => {
        if (onOpenSmsModal) onOpenSmsModal();
        else onSelectSection('alerts');
      },
    },
    {
      id: 'field_reports',
      label: 'Reports',
      icon: FileText,
      iconColor: 'text-teal-400',
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} New` : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    },
    {
      id: 'emergency_response',
      label: 'Emergency Response',
      icon: ShieldCheck,
      iconColor: 'text-rose-400',
      badge: 'Priority P1',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      iconColor: 'text-slate-400',
    },
  ];

  // Advanced SIH Intelligence Modules
  const advancedNavItems: {
    id: BhuNavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
    iconColor?: string;
  }[] = [
    {
      id: 'war_room',
      label: 'Disaster Intelligence',
      icon: Brain,
      iconColor: 'text-cyan-400',
      badge: 'War Room',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    {
      id: 'flood',
      label: 'Flood Simulation',
      icon: Waves,
      iconColor: 'text-cyan-300',
    },
    {
      id: 'disaster_3d',
      label: '3D Digital Twin',
      icon: Globe,
      iconColor: 'text-indigo-400',
    },
    {
      id: 'what_if',
      label: 'What-If Simulator',
      icon: Sliders,
      iconColor: 'text-fuchsia-400',
      badge: 'Interactive',
      badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      iconColor: 'text-purple-400',
    },
    {
      id: 'historical',
      label: 'Historical Archive',
      icon: Clock,
      iconColor: 'text-amber-300',
      badge: '12 Events',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'ai_insights',
      label: 'AI Stability Matrix',
      icon: Cpu,
      iconColor: 'text-fuchsia-400',
    },
  ];

  const handleItemClick = (item: typeof primaryNavItems[0]) => {
    if (item.action) {
      item.action();
    } else if (item.id !== 'sms_center') {
      onSelectSection(item.id as BhuNavSection);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const handleAdvancedClick = (id: BhuNavSection) => {
    onSelectSection(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Operations Header */}
        <div className="flex items-center justify-between px-3 py-2 mb-3 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
              OPERATIONS MATRIX
            </span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Primary Stacked Menu */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-thin pb-1 lg:pb-2">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleItemClick(item)}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-slate-800/60 to-transparent text-cyan-200 border-l-2 border-cyan-400 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : item.iconColor || 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* ADVANCED INTELLIGENCE SUB-SECTION */}
          <div className="pt-2 mt-2 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-violet-400/90 font-mono">
              SIH INTELLIGENCE
            </div>
            {advancedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  id={`sidebar-link-${item.id}`}
                  onClick={() => handleAdvancedClick(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/25 via-slate-800/60 to-transparent text-violet-200 border-l-2 border-violet-400 shadow-sm font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-violet-300' : item.iconColor || 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Footer System Status Card */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="font-mono text-[10px] text-emerald-300 font-bold">PINN AI MODEL v3.2</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">READY</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="bhushakti-main-sidebar"
        className="hidden lg:flex w-64 shrink-0 bg-slate-950/70 backdrop-blur-2xl border-r border-white/10 p-4 flex-col justify-between shadow-2xl z-30"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (with backdrop blur) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] bg-slate-950/90 backdrop-blur-2xl border-r border-white/10 p-4 shadow-2xl z-10 overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
