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
      className="relative overflow-hidden rounded-2xl border border-red-300/80 bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 p-3 sm:p-4 text-slate-900 shadow-[8px_10px_22px_-4px_rgba(244,63,94,0.18),-4px_-4px_12px_rgba(255,255,255,0.9),inset_1px_1px_2px_rgba(255,255,255,0.9)] transition-all"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl clay-icon bg-gradient-to-br from-red-500 to-rose-600 text-white shrink-0 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)]">
            <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs whitespace-nowrap shrink-0 border border-red-400">
                CRITICAL THRESHOLD BREACH
              </span>
              <span className="text-xs font-mono font-bold text-red-900 whitespace-nowrap shrink-0">
                {criticalNodes.length} Node{criticalNodes.length > 1 ? 's' : ''} in Emergency State
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white text-red-900 border border-red-200 whitespace-nowrap shrink-0 font-bold shadow-[inset_1px_1px_1px_rgba(255,255,255,0.9)]">
                FS: {(leadNode.safetyFactor ?? 0.88).toFixed(2)} (Failing: &lt;1.0)
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-red-950 leading-snug">
              High risk slope failure detected at <strong className="text-red-900 underline font-bold">{leadNode.locationName}</strong>.
              <span className="ml-1 text-red-800">
                Moisture: <strong className="text-red-950 font-bold">{(leadNode.soilMoisturePct ?? 82).toFixed(1)}%</strong> (&gt;80% limit), Tilt: <strong className="text-red-950 font-bold">{(leadNode.tiltAngleDeg ?? 3.4).toFixed(1)}°</strong>, Rain: <strong className="text-red-950 font-bold">{(leadNode.hourlyRainfallMm ?? 45).toFixed(0)} mm/h</strong>.
              </span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center shrink-0">
          <button
            id="banner-inspect-node-btn"
            onClick={() => onInspectNode(leadNode)}
            className="clay-button-secondary px-3.5 py-2 text-xs font-bold gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>Inspect Node</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          </button>

          <button
            id="banner-mass-sos-trigger-btn"
            onClick={onTriggerMassSos}
            className="clay-button-danger px-4 py-2 text-xs font-bold gap-1.5 whitespace-nowrap shrink-0"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>Simulate Mass SOS Alert</span>
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="clay-control w-8 h-8 rounded-xl text-red-500 hover:text-red-800 transition-colors shrink-0"
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
