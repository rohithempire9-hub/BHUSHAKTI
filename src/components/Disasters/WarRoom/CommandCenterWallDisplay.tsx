import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Maximize2,
  Minimize2,
  Radio,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Users,
  Clock,
  Flame,
  CloudRain,
  Mountain
} from 'lucide-react';
import { getCommandCenterWallData } from '../../../services/bhuShaktiAdvancedIntelligence';

interface WallDisplayProps {
  onClose?: () => void;
}

export const CommandCenterWallDisplay: React.FC<WallDisplayProps> = ({ onClose }) => {
  const [wallData, setWallData] = useState(() => getCommandCenterWallData());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveTime, setLiveTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020713] text-white flex flex-col p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      {/* 1. Ultra-Wide Top Command Bar */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Monitor className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-wider uppercase font-mono text-white">
                BHUSAKTHI NATIONAL WAR ROOM
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse">
                LIVE OPS MODE
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              DEOC / SEOC Multi-Hazard Integrated Common Operating Picture (COP)
            </div>
          </div>
        </div>

        {/* Live Clock & Fullscreen Toggle */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-mono text-slate-400 uppercase">National Standard Time</div>
            <div className="text-2xl font-mono font-black text-cyan-300 tracking-wider">
              {liveTime}
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
            title="Toggle Fullscreen Projector Mode"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer"
            >
              Exit Wall Display
            </button>
          )}
        </div>
      </div>

      {/* 2. Key War Room Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
        <div className="p-3.5 rounded-xl bg-[#050f24] border border-cyan-500/30">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Monitored Stations</div>
          <div className="text-2xl font-mono font-black text-cyan-300 mt-0.5">
            {wallData.monitoredStationsCount}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold">100% Online</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1c0b16] border border-rose-500/40">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Active Emergencies</div>
          <div className="text-2xl font-mono font-black text-rose-400 mt-0.5">
            {wallData.activeEmergenciesCount}
          </div>
          <div className="text-[10px] text-rose-300 font-bold">Tawang NH-13 KM 44</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050f24] border border-amber-500/30">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Population at Risk</div>
          <div className="text-2xl font-mono font-black text-amber-400 mt-0.5">
            {wallData.populationAtRiskCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">18 Villages</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050f24] border border-purple-500/30">
          <div className="text-[10px] font-mono text-slate-400 uppercase">CAP Cellular SMS</div>
          <div className="text-2xl font-mono font-black text-purple-300 mt-0.5">
            {wallData.cellularAlertsBroadcastCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-purple-300 font-bold">Channel 4370 Active</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050f24] border border-emerald-500/30">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Rescue Units Staged</div>
          <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">
            {wallData.rescueUnitsDeployedCount}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold">12 NDRF / 8 SDRF</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#050f24] border border-teal-500/30">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Radar Satellites</div>
          <div className="text-2xl font-mono font-black text-teal-300 mt-0.5">
            4 Passes
          </div>
          <div className="text-[10px] text-slate-400">RISAT-1A / NISAR</div>
        </div>
      </div>

      {/* 3. National Zone Status Ticker Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 flex-1">
        {wallData.zones.map((zone) => (
          <div
            key={zone.name}
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              zone.status === 'CRITICAL'
                ? 'bg-[#1a0c1e] border-rose-500/60 ring-1 ring-rose-500/30'
                : zone.status === 'WARNING'
                ? 'bg-[#18120c] border-amber-500/60'
                : 'bg-[#050f24] border-slate-800'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">{zone.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    zone.status === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : zone.status === 'WARNING'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {zone.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 mb-3">
                <div className="flex justify-between">
                  <span>Factor of Safety (FS):</span>
                  <span className="font-mono font-bold text-white">{zone.fs}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rainfall Rate:</span>
                  <span className="font-mono text-cyan-300">{zone.rainRate} mm/h</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Lead Time:</span>
                  <span className="font-mono text-amber-300 font-bold">{zone.leadTime}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] pt-2 border-t border-slate-800/80 font-mono text-cyan-200 truncate">
              Directive: {zone.directive}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Breaking Incident News Ticker */}
      <div className="rounded-xl bg-[#050f24] border border-cyan-500/40 p-2.5 flex items-center gap-3 text-xs">
        <span className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold font-mono text-[10px] shrink-0 animate-pulse">
          LIVE FLASH
        </span>
        <div className="overflow-hidden whitespace-nowrap text-slate-200 font-mono text-[11px]">
          [10:45 IST] Tawang Sela Pass NH-13 KM 44: Pore water pressure 68 kPa. Cordon operational. Bypass via Route R-15 established. 3,200 CAP Cell Broadcast SMS successfully delivered via Autonomous Cellular Gateway.
        </div>
      </div>
    </div>
  );
};
