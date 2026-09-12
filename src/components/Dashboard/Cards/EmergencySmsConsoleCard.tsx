import React from 'react';
import {
  Radio,
  ShieldAlert,
  Send,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  TowerControl
} from 'lucide-react';
import { RegisteredDeviceProfile } from '../../../types/bhuShakti';

interface EmergencySmsConsoleCardProps {
  devices: RegisteredDeviceProfile[];
  onSimulateMassSos: () => void;
  onDispatchIndividual?: (dev: RegisteredDeviceProfile) => void;
  simulatedRiskLevel?: 'safe' | 'warning' | 'critical';
}

export const EmergencySmsConsoleCard: React.FC<EmergencySmsConsoleCardProps> = ({
  devices,
  onSimulateMassSos,
  onDispatchIndividual,
  simulatedRiskLevel = 'safe',
}) => {
  // Demo 5 priority devices for clean formatted presentation
  const displayDevices = devices.slice(0, 5);

  const isCritical = simulatedRiskLevel === 'critical';
  const isWarning = simulatedRiskLevel === 'warning';

  return (
    <div className="flex flex-col h-full">
      {/* Top Section with Prominent Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-100 font-sans tracking-tight">
              Emergency Broadcasting Console
            </h4>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap shrink-0">
              Cell Broadcast Ch. 4370
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            Offline GSM / LoRaWAN cellular gateway for Northeast India
          </p>
        </div>

        {/* Prominent Action Button: "Simulate Mass SOS Alert" */}
        <button
          id="card-simulate-mass-sos-btn"
          onClick={onSimulateMassSos}
          className="relative group flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs shadow-lg shadow-rose-950/70 border-2 border-rose-400/50 transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
        >
          <ShieldAlert className="w-4 h-4 text-amber-200 animate-bounce shrink-0" />
          <span className="tracking-wide uppercase font-sans whitespace-nowrap">
            Simulate Mass SOS Alert
          </span>
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping shrink-0" />
        </button>
      </div>

      {/* Network Tower & Relay Telemetry */}
      <div className="grid grid-cols-3 gap-2 mb-2.5 text-[11px]">
        <div className="p-1.5 px-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between min-w-0">
          <span className="text-slate-400 truncate">Towers:</span>
          <span className="font-mono font-bold text-emerald-400 shrink-0 ml-1">18 BSNL</span>
        </div>
        <div className="p-1.5 px-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between min-w-0">
          <span className="text-slate-400 truncate">Latency:</span>
          <span className="font-mono font-bold text-cyan-400 shrink-0 ml-1">&lt; 0.8s</span>
        </div>
        <div className="p-1.5 px-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between min-w-0">
          <span className="text-slate-400 truncate">Proto:</span>
          <span className="font-mono font-bold text-slate-300 shrink-0 ml-1">CAP v1.2</span>
        </div>
      </div>

      {/* Neatly formatted control layout tracking 4-5 demo device profiles */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {displayDevices.map((dev) => {
          // Compute status dynamically based on simulation or device property
          const alertStatus = isCritical
            ? 'DISPATCHED'
            : isWarning
            ? 'WARNING'
            : dev.alertStatus === 'DISPATCHED'
            ? 'DISPATCHED'
            : 'ARMED';

          const isDispatched = alertStatus === 'DISPATCHED';

          const statusBadgeColor = isDispatched
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
            : isWarning
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

          return (
            <div
              key={dev.id}
              id={`sms-device-item-${dev.id}`}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700/90 transition-colors flex flex-col justify-between gap-1.5 overflow-hidden"
            >
              {/* Top Row: Name & Alert Status Tag */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="min-w-0 truncate">
                  <div className="font-bold text-slate-100 text-xs flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="truncate">{dev.deviceName}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {dev.role}
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono tracking-wider border shrink-0 whitespace-nowrap ${statusBadgeColor}`}
                >
                  {alertStatus}
                </span>
              </div>

              {/* Bottom Row: Phone, Region, Language Profile & Dispatch Button */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-[11px]">
                <div className="flex items-center gap-2.5 text-slate-300 min-w-0 truncate">
                  <span className="font-mono text-slate-200 flex items-center gap-1 shrink-0">
                    <Phone className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    {dev.mobileNumber}
                  </span>
                  <span className="text-slate-400 truncate">
                    <strong className="text-slate-300 font-medium">Target:</strong> {dev.region}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (onDispatchIndividual) onDispatchIndividual(dev);
                    else onSimulateMassSos();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[10px] font-bold transition-colors inline-flex items-center gap-1 border border-slate-700 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Send className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                  <span>Broadcast</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
