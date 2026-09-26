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
      className="relative overflow-hidden rounded-2xl border-2 border-red-300 bg-red-50 p-3 sm:p-4 text-slate-900 shadow-sm transition-all"
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-red-700 shrink-0">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs whitespace-nowrap shrink-0">
                CRITICAL THRESHOLD BREACH
              </span>
              <span className="text-xs font-mono font-bold text-red-900 whitespace-nowrap shrink-0">
                {criticalNodes.length} Node{criticalNodes.length > 1 ? 's' : ''} in Emergency State
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-white text-red-900 border border-red-200 whitespace-nowrap shrink-0 font-bold">
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
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center shrink-0">
          <button
            id="banner-inspect-node-btn"
            onClick={() => onInspectNode(leadNode)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 border border-slate-300 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Inspect Node</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>

          <button
            id="banner-mass-sos-trigger-btn"
            onClick={onTriggerMassSos}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white border border-red-500 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>Simulate Mass SOS Alert</span>
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg text-red-500 hover:text-red-800 hover:bg-red-100 transition-colors cursor-pointer shrink-0"
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
