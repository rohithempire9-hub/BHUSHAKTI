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
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus
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
      <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
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

  // Circular gauge calculations
  const riskScore = kpis.landslideRiskPct;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  // Determine risk color
  const getRiskColor = (score: number) => {
    if (score >= 80) return '#ef4444'; // red-500
    if (score >= 55) return '#f97316'; // orange-500
    if (score >= 30) return '#eab308'; // amber-500
    return '#10b981'; // emerald-500
  };

  const riskStrokeColor = getRiskColor(riskScore);

  // Play audio siren helper
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

    try {
      window.open(`sms:+91${phone}?body=${encodeURIComponent(alertMsg)}`, '_blank');
    } catch {}
  };

  // Telemetry items with values, units, status and trends
  const telemetryMetrics = [
    {
      label: 'Temperature',
      value: station.telemetry?.temperatureC ?? 18.4,
      unit: '°C',
      status: (station.telemetry?.temperatureC ?? 18) > 28 ? 'Elevated' : 'Normal',
      statusColor: (station.telemetry?.temperatureC ?? 18) > 28 ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-700',
      trend: '→ Stable',
      icon: Thermometer,
      iconColor: 'text-orange-500'
    },
    {
      label: 'Soil Moisture',
      value: station.telemetry?.soilMoisturePct ?? 68,
      unit: '%',
      status: (station.telemetry?.soilMoisturePct ?? 68) > 75 ? 'Critical' : (station.telemetry?.soilMoisturePct ?? 68) > 60 ? 'High' : 'Normal',
      statusColor: (station.telemetry?.soilMoisturePct ?? 68) > 75 ? 'bg-red-50 text-red-700' : (station.telemetry?.soilMoisturePct ?? 68) > 60 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-700',
      trend: '↑ +3.2%',
      icon: Droplets,
      iconColor: 'text-blue-500'
    },
    {
      label: 'Pore Pressure',
      value: station.telemetry?.poreWaterPressureKpa ?? 24.5,
      unit: 'kPa',
      status: (station.telemetry?.poreWaterPressureKpa ?? 24) > 30 ? 'High' : 'Watch',
      statusColor: (station.telemetry?.poreWaterPressureKpa ?? 24) > 30 ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700',
      trend: '↑ +1.1',
      icon: Activity,
      iconColor: 'text-indigo-500'
    },
    {
      label: 'Rainfall Rate',
      value: station.telemetry?.rainfallRateMmH ?? 12.4,
      unit: 'mm/h',
      status: (station.telemetry?.rainfallRateMmH ?? 12) > 20 ? 'Torrential' : (station.telemetry?.rainfallRateMmH ?? 12) > 8 ? 'Active' : 'Light',
      statusColor: (station.telemetry?.rainfallRateMmH ?? 12) > 20 ? 'bg-red-50 text-red-700' : 'bg-sky-50 text-sky-700',
      trend: '↑ +4 mm',
      icon: CloudRain,
      iconColor: 'text-sky-500'
    },
    {
      label: 'Rainfall 24h',
      value: station.telemetry?.rainfall24hMm ?? 48.2,
      unit: 'mm',
      status: (station.telemetry?.rainfall24hMm ?? 48) > 60 ? 'Heavy' : 'Moderate',
      statusColor: (station.telemetry?.rainfall24hMm ?? 48) > 60 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700',
      trend: '↑ +12 mm',
      icon: CloudRain,
      iconColor: 'text-blue-600'
    },
    {
      label: 'Vibration',
      value: (station.telemetry as any)?.vibrationMmS ?? 1.8,
      unit: 'mm/s',
      status: ((station.telemetry as any)?.vibrationMmS ?? 1.8) > 2.5 ? 'Alert' : 'Normal',
      statusColor: ((station.telemetry as any)?.vibrationMmS ?? 1.8) > 2.5 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700',
      trend: '→ 0.02',
      icon: Activity,
      iconColor: 'text-amber-500'
    },
    {
      label: 'Displacement',
      value: (station.telemetry as any)?.displacementMm ?? 14.2,
      unit: 'mm',
      status: ((station.telemetry as any)?.displacementMm ?? 14) > 20 ? 'Critical' : 'Creep',
      statusColor: ((station.telemetry as any)?.displacementMm ?? 14) > 20 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700',
      trend: '↑ +0.8 mm',
      icon: Navigation,
      iconColor: 'text-rose-500'
    },
    {
      label: 'Tilt',
      value: (station.telemetry as any)?.tiltAngleDeg ?? 3.4,
      unit: '°',
      status: ((station.telemetry as any)?.tiltAngleDeg ?? 3) > 5 ? 'Warning' : 'Normal',
      statusColor: ((station.telemetry as any)?.tiltAngleDeg ?? 3) > 5 ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700',
      trend: '→ 0.1°',
      icon: Compass,
      iconColor: 'text-purple-500'
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 text-slate-900 overflow-hidden min-w-0">
      {/* Top Header */}
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-1 min-w-0">
          <span className="text-[11px] font-bold tracking-wider uppercase text-blue-700 font-mono truncate">
            AI RISK INTELLIGENCE
          </span>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono font-bold shrink-0">
            LIVE SENSORS
          </span>
        </div>

        <div className="flex items-baseline justify-between gap-2 min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">{station.name}</h2>
          <span className="text-xs sm:text-sm font-semibold text-slate-500 shrink-0">{station.region}</span>
        </div>

        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">Physics-Informed Geotechnical Engine</span>
          <span>•</span>
          <span className="shrink-0">IMD Synced</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[9px] font-bold shrink-0 border border-emerald-200">
            ONLINE
          </span>
        </div>
      </div>

      {/* Sub navigation pills */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs min-w-0">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveSubTab('hill_cut')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'hill_cut'
              ? 'bg-white text-amber-700 shadow-xs'
              : 'text-slate-600 hover:text-amber-800'
          }`}
        >
          <Mountain className="w-3 h-3 text-amber-600" />
          Hill Cuts
        </button>
        <button
          onClick={() => setActiveSubTab('glacier')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'glacier'
              ? 'bg-white text-sky-700 shadow-xs'
              : 'text-slate-600 hover:text-sky-800'
          }`}
        >
          <Snowflake className="w-3 h-3 text-sky-600" />
          Glaciers
        </button>
        <button
          onClick={() => setActiveSubTab('escape')}
          className={`flex-1 py-1.5 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'escape'
              ? 'bg-white text-emerald-700 shadow-xs'
              : 'text-slate-600 hover:text-emerald-800'
          }`}
        >
          <Navigation className="w-3 h-3 text-emerald-600" />
          Safe Route
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CIRCULAR GAUGE & SCIENTIFIC TELEMETRY */}
      {activeSubTab === 'overview' && (
        <div className="space-y-4">
          {/* Gauge and Quick Metrics */}
          <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
            {/* Circular Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  className="stroke-slate-200"
                  strokeWidth="12"
                  fill="transparent"
                />
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
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
                  {riskScore}%
                </span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                  Landslide Risk
                </span>
              </div>
            </div>

            {/* Core Geotechnical Summary */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">Factor of Safety (FS)</div>
                <div
                  className={`font-mono font-black text-sm ${
                    station.riskAssessment.safetyFactor < 1.0
                      ? 'text-red-600'
                      : station.riskAssessment.safetyFactor < 1.4
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {station.riskAssessment.safetyFactor.toFixed(2)}
                  <span className="text-[10px] font-normal text-slate-500 ml-1">
                    {station.riskAssessment.safetyFactor >= 1.5 ? '(Stable)' : '(Slope Creep)'}
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">Pore Water Pressure</div>
                <div className="font-mono font-black text-sm text-slate-900">
                  {station.telemetry.poreWaterPressureKpa.toFixed(1)} <span className="text-[10px] text-slate-500">kPa</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="text-[10px] text-slate-500 font-medium">Live 24h Rain Accumulation</div>
                <div className="font-mono font-black text-sm text-blue-700">
                  {station.telemetry.rainfall24hMm.toFixed(1)} <span className="text-[10px] text-slate-500">mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* 8-Metric Scientific Sensor Telemetry Grid */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono px-0.5">
              Live Sensor Telemetry
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {telemetryMetrics.map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.label}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-semibold mb-1">
                      <span className="truncate">{m.label}</span>
                      <Icon className={`w-3 h-3 shrink-0 ${m.iconColor}`} />
                    </div>
                    <div className="font-mono font-black text-sm text-slate-900">
                      {typeof m.value === 'number' ? m.value.toFixed(1) : m.value}
                      <span className="text-[10px] text-slate-500 font-normal ml-0.5">{m.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] mt-1 pt-1 border-t border-slate-200/60">
                      <span className={`px-1 py-0.2 rounded font-bold ${m.statusColor}`}>
                        {m.status}
                      </span>
                      <span className="text-slate-500 font-mono">{m.trend}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hill Cut & Glacier Status Badges */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div
              className={`p-2.5 rounded-xl border ${
                cutting?.hasGovernmentCut
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1 font-bold text-[10px] text-amber-700 mb-0.5">
                <Mountain className="w-3 h-3" />
                HILL CUT FACTOR
              </div>
              <div className="font-medium truncate">
                {cutting?.hasGovernmentCut
                  ? `${cutting.excavatedSlopeDeg}° Cut (${cutting.cutActivityType.split(' ')[0]})`
                  : 'Natural Equilibrium'}
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border ${
                glacier?.isGlacierZone
                  ? 'bg-sky-50 border-sky-200 text-sky-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-1 font-bold text-[10px] text-sky-700 mb-0.5">
                <Snowflake className="w-3 h-3" />
                GLACIAL GLOF
              </div>
              <div className="font-medium truncate">
                {glacier?.isGlacierZone ? `${glacier.iceMeltRateMmDay}mm/d Melt` : 'No Glacial Basin'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANTHROPOGENIC HILL CUTTING */}
      {activeSubTab === 'hill_cut' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-1">
              <span className="flex items-center gap-1.5">
                <Mountain className="w-4 h-4 text-amber-600" />
                Government Hill-Cutting Audit
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-mono text-[10px] font-bold">
                {cutting?.hasGovernmentCut ? 'ACTIVE EXCAVATION' : 'STABLE SLOPE'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-2.5 text-xs">
              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-slate-500">Natural vs Excavated Slope</div>
                <div className="font-bold text-slate-900 mt-0.5 font-mono">
                  {cutting?.naturalSlopeDeg}° <span className="text-slate-400">→</span>{' '}
                  <span className="text-amber-700">{cutting?.excavatedSlopeDeg}°</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-amber-200">
                <div className="text-[10px] text-slate-500">Toe Support Status</div>
                <div
                  className={`font-bold mt-0.5 ${
                    cutting?.toeDebuttressed ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {cutting?.toeDebuttressed ? 'Toe Debuttressed / Cut' : 'Passive Toe Intact'}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-700 leading-relaxed bg-white p-2.5 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-800">Engineering Field Notice: </span>
              {cutting?.governmentFieldNotice ||
                'Natural slope monitored by Geological Survey of India with zero toe cutting.'}
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
              <span>Retaining Wall: <strong className="text-slate-900">{cutting?.retainingWallCondition}</strong></span>
              <span>Blasting Index: <strong className="text-amber-700 font-mono">{cutting?.blastingFissureIndex}/10</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE LANDSLIDE GLACIERS & GLOF RISK */}
      {activeSubTab === 'glacier' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-sky-950">
            <div className="flex items-center justify-between text-xs font-bold text-sky-800 mb-1">
              <span className="flex items-center gap-1.5">
                <Snowflake className="w-4 h-4 text-sky-600" />
                Glacial Melt &amp; Moraine Dam GLOF
              </span>
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 font-mono text-[10px] font-bold">
                {glacier?.isGlacierZone ? 'THERMAL WATCH' : 'NON-GLACIAL'}
              </span>
            </div>

            {glacier?.isGlacierZone ? (
              <div className="space-y-2 mt-2">
                <div className="text-xs font-bold text-slate-900">{glacier.glacierName}</div>
                <div className="text-[11px] text-sky-700">{glacier.moraineLakeName}</div>

                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-sky-200">
                    <div className="text-[10px] text-slate-500">Ice Melt Rate</div>
                    <div className="font-bold text-sky-700 font-mono">{glacier.iceMeltRateMmDay} mm/day</div>
                  </div>
                  <div className="p-2 rounded-xl bg-white border border-sky-200">
                    <div className="text-[10px] text-slate-500">Temp Trigger Threshold</div>
                    <div className="font-bold text-amber-700 font-mono">
                      {station.telemetry.temperatureC}°C <span className="text-[10px] text-slate-400">(Limit: {glacier.tempTriggerC}°C)</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-sky-200 leading-relaxed">
                  {glacier.glofRiskDescription}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center">
                This location is below the perennial snowline. No hanging glaciers or glacial lakes present.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SAFE ROUTE TO ESCAPE */}
      {activeSubTab === 'escape' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-emerald-600" />
                Designated Safe Escape Corridor
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                +{escape?.elevationGainM || 25}m Elevation Safety
              </span>
            </div>

            <div className="my-2 space-y-1.5 text-xs">
              <div className="p-2 rounded-xl bg-white border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Designated High Haven</div>
                  <div className="font-bold text-slate-900">{escape?.safeShelterName || 'District High Ridge Relief Ground'}</div>
                </div>
                <div className="text-right font-mono text-emerald-700 font-bold">
                  {escape?.distanceKm || 2.8} km • {escape?.estimatedEscapeMins || 12} mins
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white border border-emerald-200">
                <div className="text-[10px] text-slate-500">Primary Escape Route</div>
                <div className="font-semibold text-emerald-800 text-[11px]">{escape?.primaryRouteName}</div>
              </div>

              {escape?.blockedRoadsList && escape.blockedRoadsList.length > 0 && (
                <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[11px]">
                  <div className="font-bold text-red-700 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
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
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-800 flex items-center gap-2 animate-pulse">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{smsSentSuccess}</span>
        </div>
      )}

      {/* Action Buttons: Instant Emergency SMS to Gutla rohith & Full Gateway */}
      <div className="space-y-2 pt-2 border-t border-slate-200">
        <button
          id="quick-sms-gutla-rohith-btn"
          onClick={handleQuickDispatchGutla}
          className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs cursor-pointer border border-red-500"
        >
          <Radio className="w-4 h-4 animate-pulse text-white" />
          <span>⚡ Send Emergency SMS to Gutla rohith (+91 9032479657)</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSmsModal}
            className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Full SMS Dispatch Center</span>
          </button>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/919032479657?text=${encodeURIComponent(
              `⚠️ EMERGENCY LANDSLIDE ALERT [BHUSHAKTI]: Unstable slope at ${station.name} (${station.region}). Factor of Safety ${station.riskAssessment.safetyFactor}. Designated High Haven: ${escape?.safeShelterName || 'High Ridge Assembly'}. Evacuate immediately!`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
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
