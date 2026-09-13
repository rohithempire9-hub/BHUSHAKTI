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
  Brain
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
}

export const BhuShaktiSidebar: React.FC<BhuShaktiSidebarProps> = ({
  currentSection,
  onSelectSection,
  pendingReportsCount,
  activeCriticalNodesCount,
}) => {
  const navItems: {
    id: BhuNavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    iconColor?: string;
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
      id: 'landslide',
      label: 'Landslide',
      icon: Flame,
      iconColor: 'text-amber-400',
      badge: activeCriticalNodesCount > 0 ? `${activeCriticalNodesCount} Active` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'flood',
      label: 'Flood',
      icon: Waves,
      iconColor: 'text-cyan-300',
    },
    {
      id: 'war_room',
      label: 'Disaster Intelligence',
      icon: Brain,
      iconColor: 'text-cyan-400',
      badge: 'War Room',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
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
      id: 'emergency_response',
      label: 'Emergency Response',
      icon: ShieldCheck,
      iconColor: 'text-rose-400',
      badge: 'Priority P1',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    {
      id: 'weather',
      label: 'Weather',
      icon: CloudRain,
      iconColor: 'text-sky-400',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      iconColor: 'text-purple-400',
    },
    {
      id: 'historical',
      label: 'Historical Events',
      icon: Clock,
      iconColor: 'text-amber-300',
      badge: '12',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'field_reports',
      label: 'Field Reports',
      icon: MapPin,
      iconColor: 'text-teal-400',
      badge: pendingReportsCount > 0 ? `${pendingReportsCount} New` : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
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
      id: 'ai_insights',
      label: 'AI Insights',
      icon: Cpu,
      iconColor: 'text-fuchsia-400',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      iconColor: 'text-slate-400',
    },
  ];

  return (
    <aside
      id="bhushakti-main-sidebar"
      className="w-full lg:w-64 shrink-0 bg-[#08132e] border-b lg:border-b-0 lg:border-r border-[#152754] p-3 lg:p-4 flex flex-col justify-between shadow-2xl z-30"
    >
      <div>
        {/* Clean Menu Header - Name/Title is exclusively situated on the outer header */}
        <div className="flex items-center justify-between px-3 py-2 mb-3 rounded-xl bg-[#0b183b] border border-[#172e66]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
              OPERATIONS MENU
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#102454] text-cyan-300 border border-cyan-500/30">
            12 MODULES
          </span>
        </div>

        {/* Stacked Vertical Menu Navigation */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin pb-1 lg:pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => onSelectSection(item.id)}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#102454] border border-cyan-400/60 text-white shadow-lg shadow-cyan-950/60 scale-[1.01]'
                    : 'text-slate-300 hover:text-white hover:bg-[#0c1a3e] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-[#0f1f46] text-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : item.iconColor || 'text-slate-300'}`} />
                  </div>
                  <span className={`truncate ${isActive ? 'font-bold text-white' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                        item.badgeColor || 'bg-[#12234f] text-slate-200 border-[#1f3873]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    className={`hidden lg:block w-3.5 h-3.5 transition-transform ${
                      isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-500 opacity-40'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Geotechnical Status Footer in Sidebar */}
      <div className="hidden lg:block pt-3 border-t border-[#162a5c]">
        <div className="p-2.5 rounded-xl bg-[#0a1738] border border-[#182f66] text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">NER Safe Zone Certified</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-tight">
            16 stations actively logging pore pressure &amp; slope kinematics.
          </p>
          <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-2 pt-1 border-t border-[#182f66]">
            <span>ENGINE v4.2-PROD</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
