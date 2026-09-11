import React, { useState } from 'react';
import { LandslideStation } from '../../types/landslide';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Mountain,
  Snowflake,
  Compass,
  Navigation,
  CheckCircle2,
  Radio,
  ExternalLink,
  PhoneCall,
  Share2,
  ChevronRight,
  Info,
  MapPin,
  Clock,
  Layers
} from 'lucide-react';

interface AiRiskIntelligencePanelProps {
  station: LandslideStation | null;
  onOpenSmsModal: () => void;
  onOpenEscapeModal?: () => void;
}

export const AiRiskIntelligencePanel: React.FC<AiRiskIntelligencePanelProps> = ({
  station,
  onOpenSmsModal,
  onOpenEscapeModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'hill_cut' | 'glacier' | 'escape'>('overview');
  const [smsSentSuccess, setSmsSentSuccess] = useState<string | null>(null);

  if (!station) {
    return (
      <div className="p-8 text-center text-slate-400 bg-[#0c1634] rounded-3xl border border-slate-800">
        Select a monitoring zone to view AI Risk Intelligence
      </div>
    );
  }

  const kpis = station.kpis || {
    activeAlerts: station.riskAssessment.status === 'critical' ? 4 : station.riskAssessment.status === 'high' ? 3 : 1,
    highRiskZones: 5,
    landslideRiskPct: station.riskAssessment.riskScore,
    floodRiskPct: Math.round(station.riskAssessment.riskScore * 0.65),
    affectedRoads: station.riskAssessment.status === 'critical' ? 5 : 2,
    villagesAtRisk: station.riskAssessment.status === 'critical' ? 14 : 6,
    alertSubtitle: `${station.riskAssessment.status.toUpperCase()} at ${station.name}`,
    zoneSubtitle: station.region,
    roadSubtitle: 'Road access monitored',
    villageSubtitle: `${station.name} sector`,
  };

  const cutting = station.anthropogenicCutting;
  const glacier = station.glacierRisk;
  const escape = station.escapeRoute;

  // Circular gauge calculations (24% or riskScore)
  const riskScore = kpis.landslideRiskPct;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  // Determine risk color
  const getRiskColor = (score: number) => {
    if (score >= 80) return '#f43f5e'; // rose-500
    if (score >= 55) return '#f97316'; // orange-500
    if (score >= 30) return '#eab308'; // yellow-500
    return '#10b981'; // emerald-500
  };

  const riskStrokeColor = getRiskColor(riskScore);

  // Play audio emergency siren helper
  const triggerAudioSiren = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(587, now + 0.3);
      osc.frequency.linearRampToValueAtTime(880, now + 0.6);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.9);
    } catch {}
  };

  // 1-Click Instant SMS Emergency Dispatch for Gutla rohith (9032479657)
  const handleQuickDispatchGutla = () => {
    triggerAudioSiren();
    const phone = '9032479657';
    const alertMsg = `⚠️ EMERGENCY LANDSLIDE ALERT [BHUSHAKTI]: Critical slope instability at ${station.name} (${station.region}). Factor of Safety ${station.riskAssessment.safetyFactor}. Safe high-ground shelter: ${escape?.safeShelterName || 'Designated Ridge Shelter'}. Evacuate immediately!`;

    // Trigger browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⚠️ EMERGENCY ALERT: ${station.name}`, {
          body: alertMsg,
          icon: '/favicon.ico',
        });
      } catch {}
    }

    setSmsSentSuccess(`Emergency alert dispatched to Gutla rohith (+91 9032479657)!`);
    setTimeout(() => setSmsSentSuccess(null), 7000);

    // Deep link open SMS or WhatsApp
    window.open(`sms:+91${phone}?body=${encodeURIComponent(alertMsg)}`, '_blank');
  };

  return (
    <div className="bg-[#0b1433]/95 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-5 text-white">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold tracking-wider uppercase text-cyan-400">
            AI RISK INTELLIGENCE
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
            LIVE SENSORS
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-black text-white tracking-tight">{station.name}</h2>
          <span className="text-sm font-semibold text-slate-400">{station.region}</span>
        </div>

        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>BHUSAKTHI demo provider adapter</span>
          <span>•</span>
          <span>11 Sept 2026, 10:16 am</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">DEMO</span>
        </div>
      </div>

      {/* Sub navigation pills */}
      <div className="flex items-center gap-1.5 bg-[#070d22] p-1 rounded-2xl border border-slate-800 text-xs">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSubTab('hill_cut')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'hill_cut'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <Mountain className="w-3 h-3" />
          Hill Cuts
        </button>
        <button
          onClick={() => setActiveSubTab('glacier')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'glacier'
              ? 'bg-cyan-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          <Snowflake className="w-3 h-3" />
          Glaciers
        </button>
        <button
          onClick={() => setActiveSubTab('escape')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'escape'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          <Navigation className="w-3 h-3" />
          Safe Route
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CIRCULAR GAUGE (matching screenshot) */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {/* Circular Gauge Meter */}
          <div className="flex items-center justify-center py-2 relative">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                {/* Background Track */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Progress Value Arc */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={riskStrokeColor}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Central Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black font-mono tracking-tight text-white">
                  {riskScore}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Landslide Risk
                </span>
              </div>
            </div>

            {/* Quick Metrics Alongside Gauge */}
            <div className="ml-4 space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Factor of Safety (FS)</div>
                <div className={`font-mono font-black text-sm ${station.riskAssessment.safetyFactor < 1.0 ? 'text-rose-400' : station.riskAssessment.safetyFactor < 1.4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {station.riskAssessment.safetyFactor.toFixed(2)}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">
                    {station.riskAssessment.safetyFactor >= 1.5 ? '(Stable)' : '(Slope Creep)'}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Pore Pressure</div>
                <div className="font-mono font-black text-sm text-cyan-300">
                  {station.telemetry.poreWaterPressureKpa.toFixed(1)} <span className="text-[10px]">kPa</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">Live 24h Rain</div>
                <div className="font-mono font-black text-sm text-indigo-300">
                  {station.telemetry.rainfall24hMm.toFixed(1)} <span className="text-[10px]">mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hill Cutting & Glacier Indicators */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className={`p-2.5 rounded-2xl border ${cutting?.hasGovernmentCut ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
              <div className="flex items-center gap-1 font-bold text-[10px] text-amber-400 mb-0.5">
                <Mountain className="w-3 h-3" />
                HILL CUT FACTOR
              </div>
              <div>{cutting?.hasGovernmentCut ? `${cutting.excavatedSlopeDeg}° Cut Slope (${cutting.cutActivityType.split(' ')[0]})` : 'Natural Equilibrium'}</div>
            </div>

            <div className={`p-2.5 rounded-2xl border ${glacier?.isGlacierZone ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-200' : 'bg-slate-900/60 border-slate-800 text-slate-300'}`}>
              <div className="flex items-center gap-1 font-bold text-[10px] text-cyan-400 mb-0.5">
                <Snowflake className="w-3 h-3" />
                GLACIAL GLOF
              </div>
              <div>{glacier?.isGlacierZone ? `${glacier.iceMeltRateMmDay}mm/d Melt Rate` : 'No Glacial Basin'}</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANTHROPOGENIC HILL CUTTING & EXCAVATION AUDIT */}
      {activeSubTab === 'hill_cut' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Mountain className="w-4 h-4" />
                Government Hill-Cutting Audit
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                {cutting?.hasGovernmentCut ? 'ACTIVE EXCAVATION' : 'STABLE SLOPE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Natural vs Excavated Slope</div>
                <div className="font-bold text-white mt-0.5 font-mono">
                  {cutting?.naturalSlopeDeg}° <span className="text-slate-500">→</span> <span className="text-amber-400">{cutting?.excavatedSlopeDeg}°</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Toe Support Status</div>
                <div className={`font-bold mt-0.5 ${cutting?.toeDebuttressed ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {cutting?.toeDebuttressed ? 'Toe Debuttressed / Cut' : 'Passive Toe Intact'}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-300">Engineering Field Notice: </span>
              {cutting?.governmentFieldNotice || 'Natural slope monitored by Geological Survey of India with zero toe cutting.'}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Retaining Wall: <strong className="text-slate-200">{cutting?.retainingWallCondition}</strong></span>
              <span>Blasting Index: <strong className="text-amber-400 font-mono">{cutting?.blastingFissureIndex}/10</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE LANDSLIDE GLACIERS & GLOF RISK */}
      {activeSubTab === 'glacier' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/40 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Snowflake className="w-4 h-4" />
                Glacial Melt & Moraine Dam GLOF
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px]">
                {glacier?.isGlacierZone ? 'THERMAL WATCH' : 'NON-GLACIAL'}
              </span>
            </div>

            {glacier?.isGlacierZone ? (
              <div className="space-y-2 mt-2">
                <div className="text-xs font-bold text-white">{glacier.glacierName}</div>
                <div className="text-[11px] text-cyan-300">{glacier.moraineLakeName}</div>

                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Ice Melt Rate</div>
                    <div className="font-bold text-cyan-400 font-mono">{glacier.iceMeltRateMmDay} mm/day</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Temp Trigger Threshold</div>
                    <div className="font-bold text-amber-400 font-mono">
                      {station.telemetry.temperatureC}°C <span className="text-[10px] text-slate-400">(Limit: {glacier.tempTriggerC}°C)</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-cyan-100 bg-cyan-950/60 p-2.5 rounded-xl border border-cyan-500/30 leading-relaxed">
                  {glacier.glofRiskDescription}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-3 text-center">
                This location is below the perennial snowline. No hanging glaciers or glacial lakes present.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SAFE ROUTE TO ESCAPE */}
      {activeSubTab === 'escape' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4" />
                Designated Safe Escape Corridor
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                +{escape?.elevationGainM || 25}m Elevation Safety
              </span>
            </div>

            <div className="my-2 space-y-1.5 text-xs">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Designated High Haven</div>
                  <div className="font-bold text-white">{escape?.safeShelterName || 'District High Ridge Relief Ground'}</div>
                </div>
                <div className="text-right font-mono text-emerald-400 font-bold">
                  {escape?.distanceKm || 2.8} km • {escape?.estimatedEscapeMins || 12} mins
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">Primary Escape Route</div>
                <div className="font-semibold text-emerald-300 text-[11px]">{escape?.primaryRouteName}</div>
              </div>

              {escape?.blockedRoadsList && escape.blockedRoadsList.length > 0 && (
                <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-[11px]">
                  <div className="font-bold text-rose-400 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3" />
                    Blocked / Submerged Roads to AVOID:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10.5px]">
                    {escape.blockedRoadsList.map((road, idx) => (
                      <li key={idx}>{road}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instant Notification Status */}
      {smsSentSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{smsSentSuccess}</span>
        </div>
      )}

      {/* Action Buttons: Instant Emergency SMS to Gutla rohith & Full Gateway */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <button
          id="quick-sms-gutla-rohith-btn"
          onClick={handleQuickDispatchGutla}
          className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-lg shadow-rose-950/60 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-rose-400/40"
        >
          <Radio className="w-4 h-4 animate-pulse text-white" />
          <span>⚡ Send Emergency SMS to Gutla rohith (+91 9032479657)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSmsModal}
            className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Full SMS Dispatch Center</span>
          </button>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/919032479657?text=${encodeURIComponent(
              `⚠️ EMERGENCY LANDSLIDE ALERT [BHUSHAKTI]: Unstable slope at ${station.name} (${station.region}). Factor of Safety ${station.riskAssessment.safetyFactor}. Designated High Haven: ${escape?.safeShelterName || 'High Ridge Assembly'}. Evacuate immediately!`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-500/50 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Send WhatsApp Alert to Gutla rohith"
          >
            <PhoneCall className="w-3.5 h-3.5 text-white" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
