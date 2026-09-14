import React, { useState } from 'react';
import {
  Clock,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import {
  calculateRiskHalfLife,
  calculateSeverityTrajectory
} from '../../../services/bhuShaktiAdvancedIntelligence';

export const RiskHalfLifeView: React.FC = () => {
  const [hoursPostRain, setHoursPostRain] = useState<number>(14);
  const [currentPorePressure, setCurrentPorePressure] = useState<number>(68);

  const halfLife = calculateRiskHalfLife(hoursPostRain, currentPorePressure);
  const trajectory = calculateSeverityTrajectory(null);

  // Recovery chart data (T+0 to T+48 hours)
  const recoveryChartData = [
    { hour: 'T+0h', risk: 88, fs: 0.92, porePressure: 68 },
    { hour: 'T+4h', risk: 79, fs: 1.05, porePressure: 61 },
    { hour: 'T+8h', risk: 71, fs: 1.14, porePressure: 54 },
    { hour: 'T+12h', risk: 62, fs: 1.25, porePressure: 47 },
    { hour: 'T+16h', risk: 53, fs: 1.35, porePressure: 40 },
    { hour: 'T+20h', risk: 44, fs: 1.48, porePressure: 34 },
    { hour: 'T+24h', risk: 36, fs: 1.58, porePressure: 28 },
    { hour: 'T+32h', risk: 27, fs: 1.72, porePressure: 21 },
    { hour: 'T+40h', risk: 20, fs: 1.84, porePressure: 16 },
    { hour: 'T+48h', risk: 14, fs: 1.95, porePressure: 12 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-500/40">
              FEATURE 12 • RISK HALF-LIFE ENGINE
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
              FEATURE 27 • SEVERITY TRAJECTORY
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Slope Recovery Decay Curve & Severity Projection
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Answers the critical field command question: <em>"When will the slope become safe again after rainfall stops?"</em> Computes soil drainage half-life, Factor of Safety rebound, and safe roadway re-opening time windows.
          </p>
        </div>

        {/* Safe Reopen Window Card */}
        <div className="bg-[#05102a] p-3 rounded-xl border border-teal-500/30 text-xs shrink-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated Safe Reopen Window</div>
          <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">
            {halfLife.safeHighwayReopenWindow}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Drainage Rate: <span className="text-cyan-300 font-bold">{halfLife.drainageRateMmPerHour} mm/h</span>
          </div>
        </div>
      </div>

      {/* Recharts Factor of Safety Recovery Curve */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-teal-400" />
              <span>Factor of Safety (FS) & Pore Pressure Dissipation Curve</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Stable threshold reached when FS &gt; 1.50 and pore pressure &lt; 30 kPa.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Factor of Safety
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              Pore Pressure (kPa)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recoveryChartData}>
              <defs>
                <linearGradient id="fsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="poreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#14264f" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#050e24',
                  borderColor: '#1e3a78',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}
              />
              <ReferenceLine y={1.5} stroke="#10b981" strokeDasharray="4 4" label="Safe Threshold (1.50 FS)" />
              <Area type="monotone" dataKey="fs" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#fsGrad)" />
              <Area type="monotone" dataKey="porePressure" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#poreGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Feature 27: Multi-Horizon Severity Trajectory */}
      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">
              Multi-Horizon Severity Trajectory (Current vs +2h / +6h / +12h / +24h)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">
            Live Kalman-Filter Predictive Extrapolation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {trajectory.projections.map((p, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#050e24] border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-cyan-300 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                    {p.horizon}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      p.trajectory === 'ESCALATING'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : p.trajectory === 'PLATEAU'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {p.trajectory}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-mono font-black text-white">{p.projectedRiskScore}</span>
                  <span className="text-xs font-mono text-slate-400">/ 100 Risk</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Exp. Failure Prob:</span>
                    <span className="font-mono font-bold text-amber-400">{p.failureProbabilityPct}%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Key Driver:</span>
                    <span className="font-mono text-slate-400 truncate max-w-[120px]">{p.primaryRiskDriver}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-cyan-200">
                <strong>Recommended Action:</strong> {p.recommendedPreparednessAction}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
