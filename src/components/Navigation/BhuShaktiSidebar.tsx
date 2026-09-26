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
  AlertTriangle,
  Cpu,
  Settings,
  ShieldCheck,
  Radio,
  Sliders,
  Brain,
  FileText,
  Smartphone,
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
  registeredDevicesCount,
  onOpenSmsModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  // Navigation Sections grouped with clear headers
  const monitoringItems: {
    id: BhuNavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    iconColor: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      iconColor: 'text-blue-600',
    },
    {
      id: 'risk_map',
      label: 'Risk Map',
      icon: Map,
      iconColor: 'text-emerald-600',
    },
    {
      id: 'landslide',
      label: 'Live Monitoring',
      icon: Flame,
      iconColor: 'text-amber-600',
      badge: activeCriticalNodesCount > 0 ? `${activeCriticalNodesCount} Alert` : undefined,
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      id: 'emergency_response',
      label: 'Safe Routes / Corridors',
      icon: ShieldCheck,
      iconColor: 'text-teal-600',
      badge: '6 Routes',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      iconColor: 'text-indigo-600',
    },
    {
      id: 'weather',
      label: 'Weather Radar',
      icon: CloudRain,
      iconColor: 'text-sky-600',
    },
  ];

  const emergencyItems: {
    id: BhuNavSection | 'sms_center';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    iconColor: string;
    action?: () => void;
  }[] = [
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      badge: '12 Active',
      badgeColor: 'bg-red-100 text-red-800 border-red-300 font-bold',
    },
    {
      id: 'sms_center',
      label: 'SMS Warning',
      icon: Radio,
      iconColor: 'text-red-600',
      badge: 'Direct SOS',
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      action: () => {
        if (onOpenSmsModal) onOpenSmsModal();
        else onSelectSection('alerts');
      },
    },
    {
      id: 'field_reports',
      label: 'Field Evidence',
      icon: FileText,
      iconColor: 'text-emerald-600',
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} New` : undefined,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      id: 'war_room',
      label: 'Disaster Intelligence',
      icon: Brain,
      iconColor: 'text-purple-600',
      badge: 'War Room',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    },
  ];

  const simulationItems: {
    id: BhuNavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
    iconColor: string;
  }[] = [
    {
      id: 'flood',
      label: 'Flood Inundation',
      icon: Waves,
      iconColor: 'text-cyan-600',
    },
    {
      id: 'disaster_3d',
      label: '3D Digital Twin',
      icon: Globe,
      iconColor: 'text-blue-600',
    },
    {
      id: 'what_if',
      label: 'What-If Simulator',
      icon: Sliders,
      iconColor: 'text-fuchsia-600',
    },
    {
      id: 'historical',
      label: 'Historical Archive',
      icon: Clock,
      iconColor: 'text-amber-600',
      badge: '12 Events',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: 'ai_insights',
      label: 'AI Stability Matrix',
      icon: Cpu,
      iconColor: 'text-violet-600',
    },
  ];

  const systemItems: {
    id: BhuNavSection | 'registered_devices';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    iconColor: string;
    action?: () => void;
  }[] = [
    {
      id: 'registered_devices',
      label: 'Registered Devices',
      icon: Smartphone,
      iconColor: 'text-slate-600',
      badge: registeredDevicesCount > 0 ? registeredDevicesCount : '8 Online',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      action: () => {
        onSelectSection('settings');
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      iconColor: 'text-slate-600',
    },
  ];

  const handleItemClick = (item: {
    id: string;
    action?: () => void;
  }) => {
    if (item.action) {
      item.action();
    } else {
      onSelectSection(item.id as BhuNavSection);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavGroup = (
    title: string,
    items: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badge?: string | number;
      badgeColor?: string;
      iconColor: string;
      action?: () => void;
    }>
  ) => (
    <div className="space-y-1 mb-3">
      <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
        {title}
      </div>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentSection === item.id;

        return (
          <button
            key={item.id}
            id={`sidebar-link-${item.id}`}
            onClick={() => handleItemClick(item)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
              isActive
                ? 'bg-blue-50 text-blue-800 border-l-4 border-blue-600 shadow-xs font-bold'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : item.iconColor}`} />
              <span className="truncate">{item.label}</span>
            </div>

            {item.badge && (
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono border shrink-0 ${
                  item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="overflow-y-auto max-h-[calc(100vh-140px)] pr-1 scrollbar-thin">
        {/* Operations Header */}
        <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider font-mono">
              OPERATIONS MATRIX
            </span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-500 hover:text-slate-800 p-1"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        {renderNavGroup('MONITORING & GIS', monitoringItems)}
        {renderNavGroup('EMERGENCY & FIELD', emergencyItems)}
        {renderNavGroup('ANALYSIS & SIMULATION', simulationItems)}
        {renderNavGroup('CONFIGURATION', systemItems)}
      </div>

      {/* Footer System Status Card */}
      <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] text-slate-700 font-bold">PINN AI MODEL v3.2</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="bhushakti-main-sidebar"
        className="hidden lg:flex w-64 shrink-0 bg-white border-r border-slate-200 p-3.5 flex-col justify-between shadow-xs z-30"
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
          <aside className="relative w-72 max-w-[85vw] bg-white border-r border-slate-200 p-4 shadow-2xl z-10 overflow-y-auto">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
