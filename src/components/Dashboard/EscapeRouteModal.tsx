import React from 'react';
import { LandslideStation } from '../../types/landslide';
import {
  Navigation,
  X,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Compass,
  Phone,
  Radio,
  Share2,
  ExternalLink,
  Footprints,
  Car,
  Clock,
  ArrowRight
} from 'lucide-react';

interface EscapeRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: LandslideStation | null;
  onTriggerSms: () => void;
}

export const EscapeRouteModal: React.FC<EscapeRouteModalProps> = ({
  isOpen,
  onClose,
  station,
  onTriggerSms,
}) => {
  if (!isOpen || !station) return null;

  const escape = station.escapeRoute;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0b1433] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Safe Route to Escape & Evacuation Plan</h3>
              <p className="text-xs text-slate-400">
                {station.name} • {station.region} (Elevation: {station.elevationM}m)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-Ground Destination Card */}
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Designated High-Ground Safe Shelter
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              +{escape?.elevationGainM || 30}m Elevation Gain
            </span>
          </div>

          <div className="text-lg font-extrabold text-white">
            {escape?.safeShelterName || 'District High Ridge Relief Ground'}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-mono text-emerald-300">
              <Compass className="w-3.5 h-3.5" />
              {escape?.distanceKm || 2.8} km distance
            </span>
            <span className="flex items-center gap-1 font-mono text-cyan-300">
              <Footprints className="w-3.5 h-3.5" />
              {escape?.estimatedEscapeMins || 15} mins by foot
            </span>
            <span className="flex items-center gap-1 font-mono text-indigo-300">
              <Car className="w-3.5 h-3.5" />
              6 mins by rescue vehicle
            </span>
          </div>
        </div>

        {/* Primary and Alternate Corridors */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5 mb-1">
              <ArrowRight className="w-4 h-4" />
              Primary Evacuation Corridor (Tarred & Reinforced)
            </div>
            <div className="text-slate-200 leading-relaxed font-semibold">
              {escape?.primaryRouteName}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="font-bold text-indigo-400 flex items-center gap-1.5 mb-1">
              <ArrowRight className="w-4 h-4" />
              Secondary / Alternate Emergency Bypass
            </div>
            <div className="text-slate-300 leading-relaxed">
              {escape?.alternateRouteName}
            </div>
          </div>
        </div>

        {/* Blocked Roads Warning */}
        {escape?.blockedRoadsList && escape.blockedRoadsList.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs space-y-2">
            <div className="font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              CRITICAL: Blocked / Flooded Roads to AVOID
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {escape.blockedRoadsList.map((road, idx) => (
                <li key={idx} className="leading-relaxed">
                  <strong className="text-rose-300">{road.split(':')[0]}:</strong>{' '}
                  {road.split(':')[1] || ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-white uppercase tracking-wider text-[11px]">
            Step-by-Step Evacuation Protocol
          </div>
          <div className="space-y-2">
            {(escape?.evacuationInstructions || [
              'Evacuate immediately without delaying to gather heavy personal effects.',
              'Move uphill perpendicular to natural drainage ravines, streams, and excavated hill toes.',
              'Report immediately to the District Emergency Shelter and identify yourself to civil defense.',
            ]).map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {idx + 1}
                </span>
                <span className="text-slate-300 leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts & Instant Dispatch */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400">
            Emergency Helpline: <strong className="text-emerald-400 font-mono">1077 (DEOC)</strong> / NDRF:{' '}
            <strong className="text-cyan-400 font-mono">1078</strong>
          </div>
          <button
            onClick={() => {
              onTriggerSms();
              onClose();
            }}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950 flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Dispatch Evacuation SMS to Gutla rohith
          </button>
        </div>
      </div>
    </div>
  );
};
