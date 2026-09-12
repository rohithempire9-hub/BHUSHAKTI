import React from 'react';
import { AlertOctagon, Radio, ArrowRight, X, ShieldAlert, Sparkles } from 'lucide-react';
import { SensingNodeDevice } from '../../types/bhuShakti';

interface CriticalHazardBannerProps {
  criticalNodes: SensingNodeDevice[];
  onTriggerMassSos: () => void;
  onInspectNode: (node: SensingNodeDevice) => void;
  onDismiss?: () => void;
}

export const CriticalHazardBanner: React.FC<CriticalHazardBannerProps> = ({
  criticalNodes,
  onTriggerMassSos,
  onInspectNode,
  onDismiss,
}) => {
  if (!criticalNodes || criticalNodes.length === 0) return null;

  const leadNode = criticalNodes[0];

  return (
    <div
      id="critical-hazard-alert-banner"
      className="relative overflow-hidden rounded-2xl border-2 border-rose-500/80 bg-gradient-to-r from-rose-950/90 via-red-900/80 to-rose-950/90 p-3 sm:p-4 text-white shadow-2xl shadow-rose-950/80 animate-pulse transition-all"
    >
      {/* Background glowing sweep */}
      <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 via-red-500/30 to-rose-500/20 blur-xl pointer-events-none opacity-50" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-600/40 border border-rose-400/50 text-rose-200 shrink-0 shadow-inner">
            <AlertOctagon className="w-6 h-6 animate-spin [animation-duration:8s]" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm whitespace-nowrap shrink-0">
                CRITICAL THRESHOLD BREACH
              </span>
              <span className="text-xs font-mono font-bold text-rose-200 whitespace-nowrap shrink-0">
                {criticalNodes.length} Node{criticalNodes.length > 1 ? 's' : ''} in Emergency State
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-black/40 text-amber-300 border border-amber-400/30 whitespace-nowrap shrink-0">
                FS: {(leadNode.safetyFactor ?? 0.88).toFixed(2)} (Failing: &lt;1.0)
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-rose-100 leading-snug">
              High risk slope failure detected at <strong className="text-white underline">{leadNode.locationName}</strong>.
              <span className="ml-1 text-rose-200">
                Moisture: <strong className="text-white">{(leadNode.soilMoisturePct ?? 82).toFixed(1)}%</strong> (&gt;80% limit), Tilt: <strong className="text-white">{(leadNode.tiltAngleDeg ?? 3.4).toFixed(1)}°</strong>, Rain: <strong className="text-white">{(leadNode.hourlyRainfallMm ?? 45).toFixed(0)} mm/h</strong>.
              </span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          <button
            id="banner-inspect-node-btn"
            onClick={() => onInspectNode(leadNode)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Inspect Node</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>

          <button
            id="banner-mass-sos-trigger-btn"
            onClick={onTriggerMassSos}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-black text-white border border-rose-400/60 shadow-lg shadow-rose-950/60 transition-all flex items-center gap-1.5 transform hover:scale-105 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>Simulate Mass SOS Alert</span>
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/50 transition-colors cursor-pointer shrink-0"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
