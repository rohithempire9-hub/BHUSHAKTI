import React, { useState } from 'react';
import {
  Brain,
  Layers,
  Clock,
  GitBranch,
  ShieldAlert,
  Sliders,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Waves,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Sparkles,
  Info,
  RefreshCw,
  Compass,
  MapPin,
  HelpCircle,
  BarChart3,
  Network,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { First10MinutesPlannerView } from './WarRoom/First10MinutesPlannerView';
import { EvidenceContradictionFusionView } from './WarRoom/EvidenceContradictionFusionView';
import { ChainBreakerRoiView } from './WarRoom/ChainBreakerRoiView';
import { RiskHalfLifeView } from './WarRoom/RiskHalfLifeView';
import { VulnerablePopulationSatelliteView } from './WarRoom/VulnerablePopulationSatelliteView';
import { RainfallSlopeIndexView } from './WarRoom/RainfallSlopeIndexView';
import { DecisionBoardNoAlertView } from './WarRoom/DecisionBoardNoAlertView';
import { CounterfactualResponseScoreView } from './WarRoom/CounterfactualResponseScoreView';
import { EvidenceTimelineMemoryView } from './WarRoom/EvidenceTimelineMemoryView';
import { FieldVerificationTrustAuditView } from './WarRoom/FieldVerificationTrustAuditView';
import { AiCommanderBriefView } from './WarRoom/AiCommanderBriefView';
import { JudgeChallengeDisasterModeView } from './WarRoom/JudgeChallengeDisasterModeView';
import { CommandCenterWallDisplay } from './WarRoom/CommandCenterWallDisplay';
import { SihDemoCentralFlowDrawer } from './WarRoom/SihDemoCentralFlowDrawer';

export type ExtendedIntelligenceTab =
  | 'dna'
  | 'timemachine'
  | 'domino'
  | 'priority'
  | 'costofdelay'
  | 'drill'
  | 'first10min'
  | 'contradiction'
  | 'chainbreaker'
  | 'halflife'
  | 'vulnerable'
  | 'rainfallslope'
  | 'decisionboard'
  | 'counterfactual'
  | 'timeline'
  | 'fieldaudit'
  | 'commander'
  | 'judgechallenge'
  | 'sihflow';

export const DisasterIntelligenceSuite: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ExtendedIntelligenceTab>('sihflow');
  const [activeCategory, setActiveCategory] = useState<'WAR_ROOM' | 'CORE_ANALYTICS'>('WAR_ROOM');
  const [showWallDisplay, setShowWallDisplay] = useState<boolean>(false);
  const [isDisasterModeActive, setIsDisasterModeActive] = useState<boolean>(false);

  // Time Machine State
  const [rainfallProjection, setRainfallProjection] = useState<number>(20); // +20% default

  // Cost of Delay State
  const [delayMinutes, setDelayMinutes] = useState<number>(0);

  // Judge Drill State
  const [judgeChoice, setJudgeChoice] = useState<string | null>(null);

  // Disaster DNA Data
  const dnaFingerprintData = [
    { metric: 'Rainfall Signature', current: 91, historical: 88, threshold: 75 },
    { metric: 'Soil Moisture Sat.', current: 87, historical: 84, threshold: 80 },
    { metric: 'Slope Shear Creep', current: 82, historical: 79, threshold: 70 },
    { metric: 'Historical Similarity', current: 89, historical: 89, threshold: 65 },
    { metric: 'Ground Acceleration', current: 76, historical: 72, threshold: 60 },
    { metric: 'Terrain Instability', current: 81, historical: 83, threshold: 75 },
    { metric: 'Infrastructure Exposure', current: 72, historical: 68, threshold: 50 },
  ];

  // Domino Effect active hazard toggle
  const [dominoHazard, setDominoHazard] = useState<'landslide' | 'flood'>('landslide');
  const [activeDominoStep, setActiveDominoStep] = useState<number>(3);

  // Domino stages
  const landslideDominoSteps = [
    {
      step: 1,
      title: 'Monsoon Cloudburst',
      desc: '160mm precipitation triggers hyper-saturation in weathered mica-schist layer.',
      severity: 'warning',
      delay: 'T-0h',
    },
    {
      step: 2,
      title: 'Soil Pore Hyper-Saturation',
      desc: 'Pore pressure crosses 68 kPa, diminishing effective soil shear resistance.',
      severity: 'warning',
      delay: 'T+2h',
    },
    {
      step: 3,
      title: 'Rotational Slope Slip',
      desc: 'Shear displacement reaches 8.4 cm; slip surface mobilizes downhill at 18 m/s.',
      severity: 'emergency',
      delay: 'T+3.5h',
    },
    {
      step: 4,
      title: 'Lifeline Highway NH-13 Severed',
      desc: 'Debris fan covers 180 meters of roadway; transport link to Tawang district cut.',
      severity: 'emergency',
      delay: 'T+4h',
    },
    {
      step: 5,
      title: 'Village Valley Isolation',
      desc: '1,450 residents in Lumla corridor isolated with severed supply and power lines.',
      severity: 'emergency',
      delay: 'T+5h',
    },
    {
      step: 6,
      title: 'Secondary Flash Mudflow',
      desc: 'Debris dam breaches into Kameng River tributary, triggering downstream mud surges.',
      severity: 'emergency',
      delay: 'T+7h',
    },
  ];

  const floodDominoSteps = [
    {
      step: 1,
      title: 'Heavy Catchment Inflow',
      desc: 'Upper Brahmaputra basin receives continuous 190mm rainfall in 24 hours.',
      severity: 'warning',
      delay: 'T-0h',
    },
    {
      step: 2,
      title: 'River Stage Surge (+2.8m)',
      desc: 'River level surpasses high flood danger mark by 1.15m at Guwahati gauge.',
      severity: 'warning',
      delay: 'T+4h',
    },
    {
      step: 3,
      title: 'Embankment Breached',
      desc: 'Earthen dyke ruptures over 45 meters in low-lying Morigaon floodplains.',
      severity: 'emergency',
      delay: 'T+6h',
    },
    {
      step: 4,
      title: 'Inundation of 14 Villages',
      desc: 'Water level reaches 1.8 meters inside settlements; primary schools submerged.',
      severity: 'emergency',
      delay: 'T+8h',
    },
    {
      step: 5,
      title: 'District Bridge Submerged',
      desc: 'Arterial bridge closed to heavy vehicles, halting emergency fuel tankers.',
      severity: 'emergency',
      delay: 'T+11h',
    },
    {
      step: 6,
      title: 'Public Health & Potable Water Crisis',
      desc: 'Contamination of borewells requires preemptive NDRF water purification deployment.',
      severity: 'emergency',
      delay: 'T+16h',
    },
  ];

  // Time Machine Projections
  const timeMachineData = {
    0: { risk: 68, area: 1.4, roads: 'NH-13 Speed Advisory', villages: 'Normal Alert', pop: 340, action: 'Field patrol dispatch' },
    10: { risk: 74, area: 2.1, roads: 'Single lane traffic control', villages: 'Lumla lower ward watch', pop: 620, action: 'Issue SMS advisory' },
    20: { risk: 82, area: 3.5, roads: 'Precautionary closure R12', villages: '2 villages warning stage', pop: 1100, action: 'Stage emergency buses' },
    30: { risk: 89, area: 5.2, roads: 'NH-13 & SH-4 Total Closure', villages: 'Lumla & Kitpi mandatory evac', pop: 1850, action: 'Initiate zone evacuation' },
    50: { risk: 96, area: 8.8, roads: 'Multiple road collapses', villages: '4 villages catastrophic danger', pop: 3200, action: 'Declare State Red Alert' },
  };

  const currentProjection =
    timeMachineData[rainfallProjection as keyof typeof timeMachineData] ||
    timeMachineData[20];

  // Cost of Delay Matrix
  const delayData = {
    0: {
      action: 'Act Immediately (Now)',
      evacTime: '20 min window remaining',
      popAtRisk: 140,
      damageEstimateCr: 1.2,
      roadStatus: 'Clearable in 2 hours',
      outcome: 'Zero casualties; preventive drainage keeps road open.',
      badge: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
    },
    15: {
      action: 'Wait 15 Minutes',
      evacTime: '12 min window remaining',
      popAtRisk: 420,
      damageEstimateCr: 3.8,
      roadStatus: 'Single lane blocked by rockfall',
      outcome: 'Minor traffic blockage; delayed medical transfers.',
      badge: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
    },
    30: {
      action: 'Wait 30 Minutes',
      evacTime: 'Evacuation window closing (5m)',
      popAtRisk: 890,
      damageEstimateCr: 8.5,
      roadStatus: 'NH-13 fully severed',
      outcome: 'Civilian vehicles trapped between landslides; power cut.',
      badge: 'text-orange-300 bg-orange-500/20 border-orange-500/40',
    },
    60: {
      action: 'Wait 1 Hour',
      evacTime: 'Window lost (Evacuation blocked)',
      popAtRisk: 1850,
      damageEstimateCr: 22.0,
      roadStatus: '350m road washed into valley',
      outcome: 'Complete village isolation; requires Indian Air Force aerial supply.',
      badge: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
    },
    120: {
      action: 'Wait 2 Hours',
      evacTime: 'Catastrophic Failure Occurred',
      popAtRisk: 3400,
      damageEstimateCr: 48.5,
      roadStatus: 'Bridge washed away, slope cratered',
      outcome: 'Massive infrastructure destruction; extensive multi-week recovery.',
      badge: 'text-rose-300 bg-rose-900/40 border-rose-600',
    },
  };

  const currentDelay =
    delayData[delayMinutes as keyof typeof delayData] || delayData[0];

  return (
    <div id="disaster-intelligence-suite" className="space-y-6 w-full max-w-[1720px] mx-auto pb-12">
      {/* 1. HERO COMMAND HEADER */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0a1638] via-[#091535] to-[#050e24] border border-[#1b3674] p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                BHUSHAKTHI SIH DISASTER INTELLIGENCE
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PROPRIETARY FINGERPRINT &amp; PROPAGATION ENGINE
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                AI WAR ROOM MODE
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white font-sans tracking-tight">
              Disaster DNA, Time Machine &amp; Domino Propagation Engine
            </h1>
            <p className="text-xs sm:text-sm text-cyan-200/90 mt-1 max-w-3xl leading-relaxed">
              Synthesizes normalized disaster fingerprints, simulates downstream multi-hazard domino cascades, solves "Why Highest Risk ≠ Highest Priority", and validates emergency decisions.
            </p>
          </div>

          {/* Quick Stat Capsules */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-[#091533] border border-[#162e66] text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">DNA Match</div>
              <div className="text-lg font-black text-cyan-400 font-mono">89%</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[#091533] border border-[#162e66] text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Domino Cascade</div>
              <div className="text-lg font-black text-amber-400 font-mono">Stage 3 / 6</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-[#091533] border border-[#162e66] text-center">
              <div className="text-[10px] text-slate-400 font-mono uppercase">Priority Lead</div>
              <div className="text-lg font-black text-rose-400 font-mono">P1 Critical</div>
            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN NATIONAL COMMAND CENTER WALL DISPLAY OVERLAY */}
      {showWallDisplay && (
        <CommandCenterWallDisplay onClose={() => setShowWallDisplay(false)} />
      )}

      {/* 2. CATEGORY SWITCHER & SUB-NAVIGATION TABS */}
      <div className="space-y-2">
        {/* Category Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#050e24] border border-[#142854] rounded-2xl">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setActiveCategory('WAR_ROOM');
                if (['dna', 'timemachine', 'domino', 'priority', 'costofdelay', 'drill'].includes(activeTab)) {
                  setActiveTab('sihflow');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'WAR_ROOM'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>WAR ROOM & DECISION INTELLIGENCE</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-950 text-cyan-300 font-mono">
                SIH 2024+
              </span>
            </button>

            <button
              onClick={() => {
                setActiveCategory('CORE_ANALYTICS');
                if (!['dna', 'timemachine', 'domino', 'priority', 'costofdelay', 'drill'].includes(activeTab)) {
                  setActiveTab('dna');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'CORE_ANALYTICS'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>CORE PREDICTIVE MODELS</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWallDisplay(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-900 to-purple-900 hover:from-rose-800 hover:to-purple-800 text-rose-200 border border-rose-500/40 shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Full Screen War Room Wall Display</span>
            </button>
          </div>
        </div>

        {/* Tab Row: War Room Modules */}
        {activeCategory === 'WAR_ROOM' && (
          <div className="flex items-center gap-1.5 p-1.5 bg-[#061026] border border-[#142956] rounded-2xl text-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('sihflow')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'sihflow'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>★ SIH 38-Step Demo Flow</span>
            </button>

            <button
              onClick={() => setActiveTab('first10min')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'first10min'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>1. First 10 Min Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('contradiction')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'contradiction'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>2. Contradiction &amp; Fusion</span>
            </button>

            <button
              onClick={() => setActiveTab('chainbreaker')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'chainbreaker'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>3. Chain Breaker &amp; ROI</span>
            </button>

            <button
              onClick={() => setActiveTab('halflife')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'halflife'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>4. Half-Life &amp; Trajectory</span>
            </button>

            <button
              onClick={() => setActiveTab('vulnerable')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'vulnerable'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>5. Population &amp; Satellite</span>
            </button>

            <button
              onClick={() => setActiveTab('rainfallslope')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'rainfallslope'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Waves className="w-3.5 h-3.5" />
              <span>6. Rainfall &amp; Slope FS</span>
            </button>

            <button
              onClick={() => setActiveTab('decisionboard')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'decisionboard'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>7. Decision Board</span>
            </button>

            <button
              onClick={() => setActiveTab('counterfactual')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'counterfactual'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>8. Counterfactual AI</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>9. Evidence Timeline</span>
            </button>

            <button
              onClick={() => setActiveTab('fieldaudit')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'fieldaudit'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>10. Field Trust &amp; Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('commander')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'commander'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>11. AI Commander &amp; Brief</span>
            </button>

            <button
              onClick={() => setActiveTab('judgechallenge')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'judgechallenge'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-rose-300 hover:text-white hover:bg-rose-950/40'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>12. Judge Challenge &amp; Disaster Mode</span>
            </button>
          </div>
        )}

        {/* Tab Row: Core Analytics */}
        {activeCategory === 'CORE_ANALYTICS' && (
          <div className="flex items-center gap-1.5 p-1.5 bg-[#061026] border border-[#142956] rounded-2xl text-xs overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('dna')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'dna'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>1. Disaster DNA Fingerprint</span>
            </button>

            <button
              onClick={() => setActiveTab('timemachine')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'timemachine'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>2. Disaster Time Machine</span>
            </button>

            <button
              onClick={() => setActiveTab('domino')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'domino'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>3. Disaster Domino Effect</span>
            </button>

            <button
              onClick={() => setActiveTab('priority')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'priority'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>4. AI Priority Score Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('costofdelay')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'costofdelay'
                  ? 'bg-cyan-500 text-black shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>5. Cost of Delay &amp; Economy</span>
            </button>

            <button
              onClick={() => setActiveTab('drill')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'drill'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-amber-300 hover:text-white hover:bg-amber-950/40'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>6. "What Would You Do?" Judge Drill</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. TAB CONTENT PANELS */}

      {/* TAB 1: DISASTER DNA FINGERPRINT */}
      {activeTab === 'dna' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: DNA Helix Normalized Breakdown */}
            <div className="lg:col-span-7 rounded-2xl bg-[#081533] border border-[#152e66] p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#142854]">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>Disaster DNA: Multi-Parameter Normalized Vector</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Compares current live environmental indicators against historical slope failure fingerprints.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shrink-0 whitespace-nowrap">
                  Overall Match: 89%
                </span>
              </div>

              {/* Progress bars */}
              <div className="space-y-3.5">
                {dnaFingerprintData.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#050e22] border border-[#142854]">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-200">{item.metric}</span>
                      <div className="flex items-center gap-3 font-mono text-xs">
                        <span className="text-slate-400">Past: {item.historical}%</span>
                        <span className="font-black text-cyan-300">Live: {item.current}%</span>
                        <span className="text-rose-400 text-[10px]">Limit: {item.threshold}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
                      {/* Threshold marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                        style={{ left: `${item.threshold}%` }}
                      />
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.current >= item.threshold
                            ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                            : 'bg-gradient-to-r from-teal-400 to-cyan-500'
                        }`}
                        style={{ width: `${item.current}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Scientific Disclaimer */}
              <div className="mt-5 p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-2.5 text-xs text-cyan-200">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-cyan-300">Scientific Fingerprint Assessment:</strong>
                  Current atmospheric and geotechnical conditions resemble the devastating 2020 Tawang Slope Event by 89%.
                  <span className="text-cyan-400/80 block mt-0.5 text-[11px]">
                    *Note: Prototype similarity metric based on normalized vector correlation, not a deterministic guarantee.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Model AI Consensus & Second Opinion */}
            <div className="lg:col-span-5 space-y-6">
              {/* AI Second Opinion Card */}
              <div className="rounded-2xl bg-[#081533] border border-[#152e66] p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#142854]">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-bold text-white font-mono uppercase">
                    AI Second Opinion &amp; Model Disagreement
                  </h4>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Model A: Physics-Informed NN (PINN)</div>
                      <div className="text-[11px] text-slate-400">Pore pressure &amp; Mohr-Coulomb physics</div>
                    </div>
                    <span className="font-mono font-black text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800">
                      84% Risk
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Model B: Spatial Random Forest</div>
                      <div className="text-[11px] text-slate-400">Historical terrain slip correlations</div>
                    </div>
                    <span className="font-mono font-black text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                      78% Risk
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Model C: Empirical IS 14458 Standard</div>
                      <div className="text-[11px] text-slate-400">Bureau of Indian Standards safety rule</div>
                    </div>
                    <span className="font-mono font-black text-rose-400 px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800">
                      88% Risk
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Satellite InSAR Radar Verification</div>
                      <div className="text-[11px] text-slate-400">Sentinel-1 12-day mm-level displacement</div>
                    </div>
                    <span className="font-mono font-black text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                      81% Risk
                    </span>
                  </div>
                </div>

                {/* Consensus Fusion Bar */}
                <div className="mt-4 p-3 rounded-xl bg-[#061026] border border-cyan-500/30 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-300">Consensus Weighted Fusion Score:</span>
                    <span className="font-mono font-black text-cyan-200 text-sm">82.7%</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Confidence Interval: ±4.2%. Disagreement Level: Low. Models uniformly flag NH-13 toe shear failure.
                  </div>
                </div>
              </div>

              {/* Unknown Risk & Data Health Detector */}
              <div className="rounded-2xl bg-[#081533] border border-[#152e66] p-5 shadow-xl">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#142854]">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white font-mono uppercase">
                    Unknown Risk &amp; Data Health Scorecard
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                  <div className="p-3 rounded-xl bg-[#050e22] border border-[#142854]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Known Risk Volume</div>
                    <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">84%</div>
                    <div className="text-[10px] text-slate-400">Active sensors &amp; clear telemetry</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#050e22] border border-[#142854]">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Data Gap Risk</div>
                    <div className="text-xl font-black text-amber-400 font-mono mt-0.5">16%</div>
                    <div className="text-[10px] text-slate-400">Cloud occluded spur optical data</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200">
                  ⚠️ Sensor node Node-42 (East Ridge) reporting synthetic PINN inference due to fog obstruction. Confidence remains Grade A-.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISASTER TIME MACHINE */}
      {activeTab === 'timemachine' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#081533] border border-[#152e66] p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#142854]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>Disaster Time Machine: Past vs. Present vs. Future Projections</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Adjust rainfall scenario projection to inspect prospective hazard propagation across Himalayan lifelines.
                </p>
              </div>

              {/* Rain Projection Selector */}
              <div className="flex items-center gap-1.5 p-1.5 bg-[#050e22] border border-[#142854] rounded-xl text-xs overflow-x-auto">
                {[0, 10, 20, 30, 50].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRainfallProjection(pct)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                      rainfallProjection === pct
                        ? 'bg-cyan-500 text-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {pct === 0 ? 'Baseline (0%)' : `+${pct}% Rain`}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Chronological Cards: Past, Present, Future */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 1. PAST */}
              <div className="rounded-xl bg-[#050e22] border border-[#142854] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      HISTORICAL EVENT
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">July 2020</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">2020 Tawang Slide Baseline</h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Peak Rainfall:</span>
                      <span className="font-mono font-bold text-white">182 mm / 24h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Slope Displacement:</span>
                      <span className="font-mono font-bold text-white">9.4 cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Road Severance:</span>
                      <span className="font-mono font-bold text-rose-400">NH-13 cut for 72 hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Population Affected:</span>
                      <span className="font-mono font-bold text-white">2,100 citizens</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                  Historical toe failure caused by unsupported road widening and saturated schist bedrock.
                </div>
              </div>

              {/* 2. PRESENT */}
              <div className="rounded-xl bg-[#06122c] border border-cyan-500/50 p-4 flex flex-col justify-between relative shadow-lg">
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                    LIVE NOW
                  </span>
                </div>
                <div>
                  <div className="text-xs mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                      TELEMETRY SYNC
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">Current Active Conditions</h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Rainfall Rate:</span>
                      <span className="font-mono font-bold text-cyan-300">42 mm/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Inclinometer Shear:</span>
                      <span className="font-mono font-bold text-amber-300">1.8 cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Safety Factor (FS):</span>
                      <span className="font-mono font-bold text-amber-400">1.18 (Watch)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Hazard Level:</span>
                      <span className="font-mono font-bold text-amber-300 uppercase">Warning</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-cyan-500/30 text-[11px] text-cyan-200">
                  Current conditions at 89% resemblance to 2020 pre-failure signature. Precautionary speed controls active.
                </div>
              </div>

              {/* 3. FUTURE PROJECTION */}
              <div className="rounded-xl bg-[#140c1e] border border-rose-500/50 p-4 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      AI PROJECTION (+{rainfallProjection}%)
                    </span>
                    <span className="text-rose-400 font-mono text-[11px]">T+4 to T+12h</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">Simulated Scenario Outcome</h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Projected Risk Score:</span>
                      <span className="font-mono font-black text-rose-400 text-sm">
                        {currentProjection.risk}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Runout Impact Radius:</span>
                      <span className="font-mono font-bold text-white">{currentProjection.area} sq km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Road Corridor Impact:</span>
                      <span className="font-mono font-bold text-rose-300 text-[11px] truncate">
                        {currentProjection.roads}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Population Exposed:</span>
                      <span className="font-mono font-bold text-white">{currentProjection.pop} citizens</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-500/30">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Recommended Action</span>
                  <span className="text-xs font-bold text-rose-300">{currentProjection.action}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISASTER DOMINO EFFECT */}
      {activeTab === 'domino' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#081533] border border-[#152e66] p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#142854]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <GitBranch className="w-5 h-5 text-amber-400" />
                  <span>Cascading Domino Consequence Engine</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Trace how an initial atmospheric trigger cascades through geotechnical failure into civil isolation and humanitarian bottlenecks.
                </p>
              </div>

              {/* Hazard Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDominoHazard('landslide')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    dominoHazard === 'landslide'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-[#050e22] text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Landslide Domino</span>
                </button>
                <button
                  onClick={() => setDominoHazard('flood')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    dominoHazard === 'flood'
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-[#050e22] text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                  <span>Flood Cascade</span>
                </button>
              </div>
            </div>

            {/* Domino Sequence Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
              {(dominoHazard === 'landslide' ? landslideDominoSteps : floodDominoSteps).map((step) => {
                const isActive = activeDominoStep === step.step;
                const isPast = activeDominoStep > step.step;

                return (
                  <div
                    key={step.step}
                    onClick={() => setActiveDominoStep(step.step)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                      isActive
                        ? 'bg-[#151c3b] border-cyan-400 shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400'
                        : isPast
                        ? 'bg-[#091636] border-emerald-500/40 text-slate-300'
                        : 'bg-[#050e22] border-[#142854] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                            isActive
                              ? 'bg-cyan-400 text-black'
                              : isPast
                              ? 'bg-emerald-500 text-black'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {step.step}
                        </span>
                        <span className="font-bold text-slate-300">{step.delay}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-1 leading-snug">{step.title}</h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                        {step.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                      <span
                        className={`font-mono font-bold uppercase ${
                          step.severity === 'emergency' ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {step.severity}
                      </span>
                      {isActive && <span className="text-cyan-300 font-bold">Selected</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Domino Deep-Dive Card */}
            <div className="p-4 rounded-xl bg-[#050e22] border border-[#142854] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase">
                    Domino Stage {activeDominoStep} Analysis &amp; Intervention Point
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {(dominoHazard === 'landslide' ? landslideDominoSteps : floodDominoSteps)[activeDominoStep - 1]?.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                    {(dominoHazard === 'landslide' ? landslideDominoSteps : floodDominoSteps)[activeDominoStep - 1]?.desc}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Break chain at this step:</span>
                <button
                  onClick={() => alert(`Preemptive intervention triggered for Domino Stage ${activeDominoStep}! Early warning notification dispatched to district magistrate.`)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-md cursor-pointer whitespace-nowrap active:scale-95"
                >
                  Deploy Counter-Measure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI PRIORITY SCORE MATRIX */}
      {activeTab === 'priority' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#081533] border border-[#152e66] p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#142854]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>AI Priority Score: Why Highest Hazard Risk ≠ Highest Response Priority</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  BHUSAKTHI balances raw physical risk with population exposure, critical medical assets, and road bottleneck vulnerability.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-rose-500/20 text-rose-300 border border-rose-500/50 whitespace-nowrap">
                Centralized Triage Algorithm
              </span>
            </div>

            {/* Comparative Priority Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Zone A: High Risk + High Exposure (P1 Priority) */}
              <div className="rounded-xl bg-[#140e24] border-2 border-rose-500/60 p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white shadow-sm">
                      RESPONSE PRIORITY 1 (CRITICAL)
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">Tawang Valley Corridor (Station TAW-042)</h4>
                    <p className="text-xs text-slate-300">Lifeline highway NH-13 toe shear failure</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Priority Index</div>
                    <div className="text-2xl font-black text-rose-400 font-mono">94.2</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-rose-500/30 my-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hazard Risk Score:</span>
                    <span className="font-mono font-bold text-amber-300">84% (Moderate-High)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Population Exposure:</span>
                    <span className="font-mono font-bold text-rose-400">2,450 Residents</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Critical Infrastructure:</span>
                    <span className="font-mono font-bold text-white">District Hospital Route</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Alternative Detour:</span>
                    <span className="font-mono font-bold text-rose-400">None (Full Isolation)</span>
                  </div>
                </div>

                <div className="text-xs text-rose-200 leading-relaxed">
                  <strong>AI Justification:</strong> Although Station B has a slightly higher raw slope risk (89%), Zone A contains the only hospital access road and 2,450 civilians. Therefore, Zone A receives <strong>Top NDRF Dispatch Priority</strong>.
                </div>
              </div>

              {/* Zone B: Very High Risk + Low Exposure (P3 Priority) */}
              <div className="rounded-xl bg-[#050e22] border border-[#142854] p-5 shadow-lg">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                      RESPONSE PRIORITY 3 (SECONDARY)
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">Upper Ridge Scrubland (Station RID-019)</h4>
                    <p className="text-xs text-slate-400">Steep uninhabited escarpment</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Priority Index</div>
                    <div className="text-2xl font-black text-amber-400 font-mono">58.4</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-slate-800 my-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Hazard Risk Score:</span>
                    <span className="font-mono font-bold text-rose-400">89% (Higher Physical Risk)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Population Exposure:</span>
                    <span className="font-mono font-bold text-emerald-400">80 Shepherds</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Critical Infrastructure:</span>
                    <span className="font-mono font-bold text-slate-300">Dirt Tractor Trail</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Alternative Detour:</span>
                    <span className="font-mono font-bold text-slate-300">Ridge Path Available</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  <strong>AI Justification:</strong> Despite higher shear displacement, zero critical hospital lifelines are threatened. Monitored autonomously via LoRa sensors without diverting front-line rescue forces.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COST OF DELAY & ECONOMIC IMPACT */}
      {activeTab === 'costofdelay' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cost of Delay Interactive Simulator */}
            <div className="lg:col-span-7 rounded-2xl bg-[#081533] border border-[#152e66] p-5 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#142854]">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span>Cost of Delay Simulator</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Quantifies the exponential penalty of hesitating during active geotechnical slope creep.
                  </p>
                </div>

                {/* Delay Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-[#050e22] border border-[#142854] rounded-xl text-xs overflow-x-auto">
                  {[0, 15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDelayMinutes(mins)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                        delayMinutes === mins
                          ? 'bg-emerald-500 text-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {mins === 0 ? 'Act Now' : `+${mins}m Delay`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delay Metric Dashboard */}
              <div className="p-5 rounded-2xl bg-[#050e22] border border-[#142854] space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${currentDelay.badge}`}>
                    {currentDelay.action}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Exposure</span>
                    <span className="text-2xl font-black text-rose-400 font-mono">
                      ₹ {currentDelay.damageEstimateCr.toFixed(1)} Crore
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Evacuation Window:</span>
                    <span className="font-bold text-amber-300">{currentDelay.evacTime}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Population in Danger Zone:</span>
                    <span className="font-bold text-white">{currentDelay.popAtRisk} citizens</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Roadway Condition:</span>
                    <span className="font-bold text-slate-200">{currentDelay.roadStatus}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Consequence Severity:</span>
                    <span className="font-bold text-rose-400">{delayMinutes >= 60 ? 'Severe Crisis' : 'Mitigable'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#081533] p-3 rounded-xl border border-[#152e66]">
                  <strong>Consequence Forecast:</strong> {currentDelay.outcome}
                </p>
              </div>
            </div>

            {/* Economic Impact Exposure Breakdown */}
            <div className="lg:col-span-5 rounded-2xl bg-[#081533] border border-[#152e66] p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#142854]">
                  <h4 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span>Infrastructure Exposure (₹ Crore)</span>
                  </h4>
                  <span className="text-xs font-mono font-bold text-cyan-400">Total: ₹42.2 Cr</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Highways &amp; Retaining Walls</div>
                      <div className="text-[11px] text-slate-400">NH-13 KM 40-44 clearance &amp; rebuilding</div>
                    </div>
                    <span className="font-mono font-bold text-rose-400">₹ 14.5 Cr</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Bridges &amp; Culverts</div>
                      <div className="text-[11px] text-slate-400">Kameng suspension link structural stress</div>
                    </div>
                    <span className="font-mono font-bold text-rose-400">₹ 8.2 Cr</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Power &amp; Telecom Grid</div>
                      <div className="text-[11px] text-slate-400">66kV sub-station and 4 towers</div>
                    </div>
                    <span className="font-mono font-bold text-amber-400">₹ 4.1 Cr</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Agricultural Terraces &amp; Soil</div>
                      <div className="text-[11px] text-slate-400">Cardamom &amp; paddy terrace erosion</div>
                    </div>
                    <span className="font-mono font-bold text-amber-400">₹ 3.6 Cr</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#050e22] border border-[#142854] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">Civic Structures &amp; Schools</div>
                      <div className="text-[11px] text-slate-400">Lumla primary school &amp; clinic</div>
                    </div>
                    <span className="font-mono font-bold text-rose-400">₹ 11.8 Cr</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                *Economic impact represents replacement exposure computed via public works schedule of rates.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: "WHAT WOULD YOU DO?" JUDGE INTERACTIVE DRILL */}
      {activeTab === 'drill' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#081533] border border-[#152e66] p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#142854]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>SIH Judge Interactive Drill: "What Would You Do?"</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Test your real-time command decision against the BHUSAKTHI physics &amp; AI triage recommendation.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-amber-500/20 text-amber-300 border border-amber-500/50 whitespace-nowrap">
                Live Evaluation Sandbox
              </span>
            </div>

            {/* Scenario Briefing */}
            <div className="p-4 rounded-xl bg-[#050e22] border border-amber-500/40 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>ACTIVE CRISIS SCENARIO: TAWANG SECTOR 4</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Tawang has received <strong>160 mm rainfall</strong> over the past 18 hours. Ground inclinometers at Station TAW-042 have recorded <strong>2.8 cm displacement</strong>. Risk score escalated from 54% to <strong>79%</strong>. Highway NH-13 toe is fracturing. Village Lumla (1,200 residents) sits 400 meters below the active slip plane.
              </p>
            </div>

            {/* Decision Choices */}
            <div className="space-y-3 mb-6">
              <div className="text-xs font-bold text-slate-300 uppercase font-mono">
                Select Your Emergency Command Decision:
              </div>

              {[
                {
                  id: 'A',
                  title: 'Option A: Wait & Monitor',
                  desc: 'Take no immediate intervention. Await 6 more hours of sensor confirmation before issuing public alerts.',
                  rating: 'Critical Error (22/100)',
                  badge: 'bg-rose-950 text-rose-300 border-rose-800',
                },
                {
                  id: 'B',
                  title: 'Option B: Road Closure Only',
                  desc: 'Shut NH-13 immediately with barricades; keep village residents in homes without evacuation advisory.',
                  rating: 'Partial Response (68/100)',
                  badge: 'bg-amber-950 text-amber-300 border-amber-800',
                },
                {
                  id: 'C',
                  title: 'Option C: Instant Midnight Evacuation',
                  desc: 'Sound sirens and evacuate all 1,200 citizens onto the narrow muddy highway in total darkness.',
                  rating: 'High Risk Execution (55/100)',
                  badge: 'bg-orange-950 text-orange-300 border-orange-800',
                },
                {
                  id: 'D',
                  title: 'Option D: Close Road + Stage Pre-Evacuation Alert (AI Recommended)',
                  desc: 'Close NH-13 to civilian traffic, open emergency lane for NDRF, alert village headmen via SMS, and stage shelters on ridge.',
                  rating: 'Optimal Decision (98/100)',
                  badge: 'bg-emerald-950 text-emerald-300 border-emerald-500',
                },
              ].map((opt) => {
                const isSelected = judgeChoice === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setJudgeChoice(opt.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#12234e] border-cyan-400 shadow-lg ring-1 ring-cyan-400'
                        : 'bg-[#050e22] border-[#142854] hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm">{opt.title}</span>
                      </div>
                      <p className="text-xs text-slate-300">{opt.desc}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${opt.badge}`}>
                        {opt.rating}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Result Evaluation Display */}
            {judgeChoice && (
              <div className="p-5 rounded-2xl bg-[#050e22] border border-cyan-500/40 animate-fadeIn">
                <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-cyan-300 uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Evaluation of Your Command Choice</span>
                </div>

                {judgeChoice === 'D' ? (
                  <div className="space-y-2 text-xs text-emerald-200">
                    <div className="text-sm font-bold text-emerald-300">
                      Perfect Alignment with BHUSAKTHI AI Protocol (Score: 98/100)
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      By closing NH-13 immediately, you prevent civilian vehicles from getting crushed in the toe shear runout zone. Staging pre-evacuation shelters on the stable granite ridge allows an orderly transfer rather than a panic stampede down saturated muddy slopes.
                    </p>
                  </div>
                ) : judgeChoice === 'A' ? (
                  <div className="space-y-2 text-xs text-rose-200">
                    <div className="text-sm font-bold text-rose-400">
                      Disaster Warning: Severe Delay Incurred (Score: 22/100)
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      Pore water pressure exceeds 68 kPa within 2 hours. Waiting 6 hours ensures slope collapse before any protective advisory reaches village residents. Cost of delay calculator estimates ₹22 Cr damage.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs text-amber-200">
                    <div className="text-sm font-bold text-amber-300">
                      Sub-Optimal Execution (Score: {judgeChoice === 'B' ? '68/100' : '55/100'})
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      {judgeChoice === 'B'
                        ? 'Closing the road protects travelers, but leaving the village unalerted leaves 1,200 citizens exposed to downhill debris inundation.'
                        : 'Uncontrolled midnight evacuation onto muddy slopes causes stampedes and slips before shelters are prepared.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXTENDED WAR ROOM PANELS */}
      {activeTab === 'sihflow' && (
        <SihDemoCentralFlowDrawer
          onSelectStepTab={(tabKey) => {
            if (tabKey as ExtendedIntelligenceTab) {
              setActiveTab(tabKey as ExtendedIntelligenceTab);
            }
          }}
          onTriggerScenario={(scenId) => {
            if (scenId.includes('cloudburst')) {
              setIsDisasterModeActive(true);
              setActiveTab('judgechallenge');
            }
          }}
        />
      )}

      {activeTab === 'first10min' && <First10MinutesPlannerView />}

      {activeTab === 'contradiction' && <EvidenceContradictionFusionView />}

      {activeTab === 'chainbreaker' && <ChainBreakerRoiView />}

      {activeTab === 'halflife' && <RiskHalfLifeView />}

      {activeTab === 'vulnerable' && <VulnerablePopulationSatelliteView />}

      {activeTab === 'rainfallslope' && <RainfallSlopeIndexView />}

      {activeTab === 'decisionboard' && <DecisionBoardNoAlertView />}

      {activeTab === 'counterfactual' && <CounterfactualResponseScoreView />}

      {activeTab === 'timeline' && <EvidenceTimelineMemoryView />}

      {activeTab === 'fieldaudit' && <FieldVerificationTrustAuditView />}

      {activeTab === 'commander' && <AiCommanderBriefView />}

      {activeTab === 'judgechallenge' && (
        <JudgeChallengeDisasterModeView
          isDisasterModeActive={isDisasterModeActive}
          onActivateDisasterMode={setIsDisasterModeActive}
        />
      )}
    </div>
  );
};
