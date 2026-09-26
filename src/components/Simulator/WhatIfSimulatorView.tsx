import React, { useState } from 'react';
import {
  runWhatIfSimulation,
  WhatIfInputParams
} from '../../services/whatIfSimulatorEngine';
import {
  Sliders,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Users,
  Activity,
  ArrowRight,
  Info,
  CheckCircle2,
  Share2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const WhatIfSimulatorView: React.FC = () => {
  const [params, setParams] = useState<WhatIfInputParams>({
    rainfallMultiplier: 1.0,
    soilSaturationOffset: 0,
    drainageCondition: 'Natural Baseline',
    roadClosureStatus: 'All Open',
    evacuationStatus: 'No Evacuation',
  });

  const result = runWhatIfSimulation(params);

  const handleReset = () => {
    setParams({
      rainfallMultiplier: 1.0,
      soilSaturationOffset: 0,
      drainageCondition: 'Natural Baseline',
      roadClosureStatus: 'All Open',
      evacuationStatus: 'No Evacuation',
    });
  };

  const handleApplyPreset = (name: 'monsoon_surge' | 'drainage_fix' | 'evac_mitigation') => {
    if (name === 'monsoon_surge') {
      setParams({
        rainfallMultiplier: 1.4, // +40%
        soilSaturationOffset: +15,
        drainageCondition: 'Degraded / Blocked',
        roadClosureStatus: 'All Open',
        evacuationStatus: 'No Evacuation',
      });
    } else if (name === 'drainage_fix') {
      setParams({
        rainfallMultiplier: 1.1,
        soilSaturationOffset: -10,
        drainageCondition: 'Engineered Geotextile Drains (+35% runoff)',
        roadClosureStatus: 'Single-Lane Advisory',
        evacuationStatus: 'No Evacuation',
      });
    } else if (name === 'evac_mitigation') {
      setParams({
        rainfallMultiplier: 1.3,
        soilSaturationOffset: +5,
        drainageCondition: 'Natural Baseline',
        roadClosureStatus: 'Precautionary Road Closure',
        evacuationStatus: 'Full Zone Evacuated to Ridge Shelter',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto pb-12 text-slate-900">
      {/* 1. HEADER */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
              PHYSICS WHAT-IF SIMULATOR
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              INTERVENTION SENSITIVITY TESTING
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            What-If Scenario Sandbox &amp; Consequence Simulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Simulate the geotechnical impact of rainfall surges, drainage improvements, traffic closures, and emergency evacuations before making real-world decisions.
          </p>
        </div>

        {/* Preset scenario buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => handleApplyPreset('monsoon_surge')}
            className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Scenario 1: Rainfall +40% Surge
          </button>
          <button
            onClick={() => handleApplyPreset('drainage_fix')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Scenario 2: Drainage Improved
          </button>
          <button
            onClick={() => handleApplyPreset('evac_mitigation')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Scenario 3: Road Closed &amp; Evacuation
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-mono transition-all cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. PARAMETERS CONTROLS (LEFT) + BEFORE VS AFTER DELTA OUTCOMES (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PARAMETER SLIDERS & OPTIONS (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                  Scenario Parameters Workbench
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Live Delta Calculation</span>
            </div>

            {/* Slider 1: Rainfall Surcharge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Rainfall Multiplier / Surcharge</span>
                <span className="font-mono text-blue-700 font-bold">
                  {Math.round((params.rainfallMultiplier - 1.0) * 100) >= 0 ? '+' : ''}
                  {Math.round((params.rainfallMultiplier - 1.0) * 100)}% ({params.rainfallMultiplier.toFixed(1)}x)
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={params.rainfallMultiplier}
                onChange={(e) => setParams({ ...params, rainfallMultiplier: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-50% (Drought)</span>
                <span>Baseline (1.0x)</span>
                <span>+100% (Cloudburst Deluge)</span>
              </div>
            </div>

            {/* Slider 2: Soil Moisture Saturation Offset */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Soil Moisture Saturation Offset</span>
                <span className="font-mono text-amber-700 font-bold">
                  {params.soilSaturationOffset >= 0 ? '+' : ''}
                  {params.soilSaturationOffset}% VWC
                </span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                step={5}
                value={params.soilSaturationOffset}
                onChange={(e) => setParams({ ...params, soilSaturationOffset: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-30% Dry Matrix</span>
                <span>0% Ambient Baseline</span>
                <span>+30% Liquefaction Threshold</span>
              </div>
            </div>

            {/* Dropdown 3: Drainage Condition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Slope Drainage Condition</label>
              <select
                value={params.drainageCondition}
                onChange={(e) => setParams({ ...params, drainageCondition: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="Degraded / Blocked">Degraded / Blocked (Toe culverts filled with silt: +12 risk)</option>
                <option value="Natural Baseline">Natural Baseline (Standard unlined mountain gullies)</option>
                <option value="Engineered Geotextile Drains (+35% runoff)">Engineered Geotextile Drains (+35% rapid runoff: -23 risk)</option>
              </select>
            </div>

            {/* Dropdown 4: Road Closure Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Strategic Road / Highway Status</label>
              <select
                value={params.roadClosureStatus}
                onChange={(e) => setParams({ ...params, roadClosureStatus: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="All Open">All Open (Civilian convoys and trucks unrestricted)</option>
                <option value="Single-Lane Advisory">Single-Lane Advisory (Speed restriction &amp; warning boards)</option>
                <option value="Precautionary Road Closure">Precautionary Road Closure (NH-13 shut; vehicles diverted to bypass)</option>
              </select>
            </div>

            {/* Dropdown 5: Evacuation Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">Civilian Population Evacuation Status</label>
              <select
                value={params.evacuationStatus}
                onChange={(e) => setParams({ ...params, evacuationStatus: e.target.value as any })}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="No Evacuation">No Evacuation (2,180 residents remain in zone)</option>
                <option value="School & Vulnerable Elderly Evacuated">School &amp; Vulnerable Elderly Evacuated (340 students moved to safe hall)</option>
                <option value="Full Zone Evacuated to Ridge Shelter">Full Zone Evacuated to Ridge Shelter (Complete safety)</option>
              </select>
            </div>
          </div>
        </div>

        {/* BEFORE VS AFTER IMPACT SCORECARD (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
                  Before vs After Simulation Result
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                SCENARIO MODEL (ESTIMATION)
              </span>
            </div>

            {/* Comparison Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 my-4">
              {/* Risk Score */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Geotechnical Risk Score</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-400 line-through">
                    {result.baselineRiskScore}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                  <span
                    className={`text-2xl font-bold font-mono ${
                      result.simulatedRiskScore > 75
                        ? 'text-red-600'
                        : result.simulatedRiskScore > 50
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {result.simulatedRiskScore}/100
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-bold font-mono">
                  {result.deltaRiskScore > 0 ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> +{result.deltaRiskScore} pts risk escalation
                    </span>
                  ) : result.deltaRiskScore < 0 ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" /> {result.deltaRiskScore} pts risk reduction
                    </span>
                  ) : (
                    <span className="text-slate-500">0 pts (No change)</span>
                  )}
                </div>
              </div>

              {/* Factor of Safety */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Slope Factor of Safety (FS)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-400 line-through">
                    {result.baselineSafetyFactor.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                  <span
                    className={`text-2xl font-bold font-mono ${
                      result.simulatedSafetyFactor < 1.0
                        ? 'text-red-600'
                        : result.simulatedSafetyFactor < 1.3
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {result.simulatedSafetyFactor.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-bold font-mono">
                  {result.simulatedSafetyFactor < 1.0 ? (
                    <span className="text-red-600">Shear Failure (&lt; 1.0)</span>
                  ) : (
                    <span className="text-emerald-700">Stable FS (&gt; 1.0)</span>
                  )}
                </div>
              </div>

              {/* Exposed Population */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Exposed Population</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-slate-400 line-through">
                    {result.baselineExposedPeople}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">→</span>
                  <span className="text-2xl font-bold font-mono text-blue-700">
                    {result.simulatedExposedPeople}
                  </span>
                </div>
                <div className="mt-1 text-[11px] font-bold font-mono">
                  {result.deltaExposedPeople < 0 ? (
                    <span className="text-emerald-700">
                      {result.deltaExposedPeople} protected by evac
                    </span>
                  ) : (
                    <span className="text-slate-500">Full exposure</span>
                  )}
                </div>
              </div>

              {/* Cascade Hazard Probability */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-mono block">Multi-Hazard Cascade Prob</span>
                <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
                  {result.cascadeProbabilityPct}%
                </div>
                <div className="mt-1 text-[11px] font-bold font-mono text-slate-500">
                  River Damming &amp; Flood Chain
                </div>
              </div>
            </div>

            {/* Recharts Comparison Chart */}
            <div className="h-44 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.comparisonChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="baseline" name="Baseline Condition" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="simulated" name="Simulated Scenario" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Verdict Summary Box */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-800 mt-auto">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <strong className="text-slate-900 font-mono uppercase text-[11px]">
                  Simulation Verdict
                </strong>
              </div>
              <p className="leading-relaxed text-slate-700">{result.simulatedVerdict}</p>
              <div className="mt-2 pt-2 border-t border-blue-200 flex items-center gap-2 text-blue-800">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">Recommended Intervention: {result.recommendedIntervention}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
