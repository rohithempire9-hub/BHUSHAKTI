import React, { useState } from 'react';
import {
  CloudRain,
  Mountain,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Activity,
  Droplets,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';
import {
  analyzeRainfallFingerprint,
  calculateSlopeWeaknessIndex
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const RainfallSlopeIndexView: React.FC = () => {
  const [activeZone, setActiveZone] = useState<string>('Tawang Sela Pass');

  const rain = analyzeRainfallFingerprint(null);
  const slope = calculateSlopeWeaknessIndex(null);

  // 24-Hour Rainfall Intensity & Threshold Curve Data
  const rainfallChartData = [
    { hour: '00:00', rain: 4, threshold: 25, cumulative: 4 },
    { hour: '04:00', rain: 8, threshold: 25, cumulative: 12 },
    { hour: '08:00', rain: 14, threshold: 25, cumulative: 26 },
    { hour: '12:00', rain: 28, threshold: 25, cumulative: 54 },
    { hour: '16:00', rain: 42, threshold: 25, cumulative: 96 },
    { hour: '20:00', rain: 35, threshold: 25, cumulative: 131 },
    { hour: '23:00', rain: 22, threshold: 25, cumulative: 153 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              FEATURE 15 • RAINFALL TRIGGER FINGERPRINT
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
              FEATURE 16 • SLOPE WEAKNESS & FACTOR OF SAFETY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Geotechnical Slope Stability & Precipitation Antecedent Trigger
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Combines empirical antecedent precipitation index (API 7d/30d) against the Caine empirical curve with rigorous Mohr-Coulomb limit equilibrium Factor of Safety modeling.
          </p>
        </div>

        {/* Live Factor of Safety Status */}
        <div className="bg-[#05102a] p-3.5 rounded-xl border border-rose-500/30 text-xs shrink-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Geotechnical Factor of Safety</div>
          <div className="text-2xl font-mono font-black text-rose-400 mt-0.5">
            FS: {slope.factorOfSafety.toFixed(2)}
          </div>
          <div className="text-[10px] text-rose-300 font-bold mt-1">
            STATUS: {slope.failureLikelihood}
          </div>
        </div>
      </div>

      {/* Feature 15: Rainfall Fingerprint & Antecedent Precipitation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span>Antecedent Precipitation Index (API)</span>
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                rain.isTriggerBreached
                  ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {rain.isTriggerBreached ? 'THRESHOLD BREACHED' : 'SAFE MARGIN'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <div className="text-[10px] text-slate-400">Current Rate</div>
              <div className="text-base font-mono font-bold text-cyan-300">{rain.currentRainfallMmH} mm/h</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <div className="text-[10px] text-slate-400">3-Day Antecedent</div>
              <div className="text-base font-mono font-bold text-white">{rain.antecedentRainfall3dMm} mm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <div className="text-[10px] text-slate-400">7-Day Cumulative</div>
              <div className="text-base font-mono font-bold text-amber-400">{rain.cumulative7dMm} mm</div>
            </div>
            <div className="p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <div className="text-[10px] text-slate-400">Saturation Index</div>
              <div className="text-base font-mono font-bold text-rose-400">{rain.saturationIndexPct}%</div>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rainfallChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#14264f" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050e24',
                    borderColor: '#1e3a78',
                    borderRadius: '12px',
                    fontSize: '11px'
                  }}
                />
                <Bar dataKey="rain" fill="#06b6d4" name="Hourly Rain (mm)" />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeWidth={2} name="Trigger Threshold" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature 16: Geotechnical Slope Weakness Index (Mohr-Coulomb) */}
        <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mountain className="w-4 h-4 text-amber-400" />
              <span>Mohr-Coulomb Geotechnical Breakdown</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">
              Limit Equilibrium Method (Bishop Simplified)
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <span className="text-slate-300">Geological Formation:</span>
              <span className="font-bold text-white">{slope.geologicalFormation}</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <span className="text-slate-300">Slope Gradient Angle:</span>
              <span className="font-mono font-bold text-cyan-300">{slope.slopeAngleDegrees}°</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <span className="text-slate-300">Cohesion (c'):</span>
              <span className="font-mono font-bold text-white">{slope.cohesionKpa} kPa</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <span className="text-slate-300">Internal Friction Angle (φ'):</span>
              <span className="font-mono font-bold text-white">{slope.internalFrictionAngleDeg}°</span>
            </div>
            <div className="flex justify-between p-2.5 rounded-xl bg-[#050e24] border border-slate-800">
              <span className="text-slate-300">Pore Water Pressure (u):</span>
              <span className="font-mono font-bold text-rose-400">{slope.poreWaterPressureKpa} kPa (Sat: {slope.saturationRatioPct}%)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0a1b3d] border border-cyan-500/30 text-[11px] text-slate-300">
            <strong>Key Failure Mechanism:</strong> Water infiltration has elevated pore water pressure to 68 kPa, diminishing effective normal stress along the 38° joint plane, reducing Factor of Safety below the critical 1.0 limit.
          </div>
        </div>
      </div>
    </div>
  );
};
