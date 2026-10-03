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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="relative w-full max-w-2xl clay-modal p-6 text-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl clay-icon bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)]">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Safe Route to Escape &amp; Evacuation Plan</h3>
              <p className="text-xs text-slate-500">
                {station.name} • {station.region} (Elevation: {station.elevationM}m)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="clay-control w-8 h-8 rounded-xl text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High-Ground Destination Card */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Designated High-Ground Safe Shelter
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-300 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)]">
              +{escape?.elevationGainM || 30}m Elevation Gain
            </span>
          </div>

          <div className="text-lg font-extrabold text-slate-900">
            {escape?.safeShelterName || 'District High Ridge Relief Ground'}
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-mono text-emerald-700 font-bold">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              {escape?.distanceKm || 2.8} km distance
            </span>
            <span className="flex items-center gap-1 font-mono text-blue-700 font-bold">
              <Footprints className="w-3.5 h-3.5 text-blue-600" />
              {escape?.estimatedEscapeMins || 15} mins by foot
            </span>
            <span className="flex items-center gap-1 font-mono text-purple-700 font-bold">
              <Car className="w-3.5 h-3.5 text-purple-600" />
              6 mins by rescue vehicle
            </span>
          </div>
        </div>

        {/* Primary and Alternate Corridors */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl clay-card-raised">
            <div className="font-bold text-blue-700 flex items-center gap-1.5 mb-1">
              <ArrowRight className="w-4 h-4" />
              Primary Evacuation Corridor (Tarred &amp; Reinforced)
            </div>
            <div className="text-slate-800 leading-relaxed font-semibold">
              {escape?.primaryRouteName}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl clay-card-raised">
            <div className="font-bold text-indigo-700 flex items-center gap-1.5 mb-1">
              <ArrowRight className="w-4 h-4" />
              Secondary / Alternate Emergency Bypass
            </div>
            <div className="text-slate-700 leading-relaxed">
              {escape?.alternateRouteName}
            </div>
          </div>
        </div>

        {/* Blocked Roads Warning */}
        {escape?.blockedRoadsList && escape.blockedRoadsList.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.8)]">
            <div className="font-bold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              CRITICAL: Blocked / Flooded Roads to AVOID
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {escape.blockedRoadsList.map((road, idx) => (
                <li key={idx} className="leading-relaxed">
                  <strong className="text-rose-800">{road.split(':')[0]}:</strong>{' '}
                  {road.split(':')[1] || ''}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step-by-Step Instructions */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            Step-by-Step Evacuation Protocol
          </div>
          <div className="space-y-2">
            {(escape?.evacuationInstructions || [
              'Evacuate immediately without delaying to gather heavy personal effects.',
              'Move uphill perpendicular to natural drainage ravines, streams, and excavated hill toes.',
              'Report immediately to the District Emergency Shelter and identify yourself to civil defense.',
            ]).map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl clay-card-raised">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-300">
                  {idx + 1}
                </span>
                <span className="text-slate-700 leading-relaxed font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts & Instant Dispatch */}
        <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Emergency Helpline: <strong className="text-emerald-700 font-mono">1077 (DEOC)</strong> / NDRF:{' '}
            <strong className="text-blue-700 font-mono">1078</strong>
          </div>
          <button
            onClick={() => {
              onTriggerSms();
              onClose();
            }}
            className="clay-button-danger px-4 py-2 text-xs font-bold gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Dispatch Evacuation SMS to Gutla rohith</span>
          </button>
        </div>
      </div>
    </div>
  );
};
