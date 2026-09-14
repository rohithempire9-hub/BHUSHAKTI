import React from 'react';
import { TrendingDown, Activity } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { calculateRiskHalfLife, calculateSeverityTrajectory } from '../../../services/bhuShaktiAdvancedIntelligence';

export const RiskHalfLifeView: React.FC = () => {
  // The service expects (initialRisk, interventionsApplied), not (hours, porePressure).
  const halfLife = calculateRiskHalfLife(86, ['drainage', 'rain_stopped']);
  const trajectory = calculateSeverityTrajectory(84, 'escalating');

  const recoveryChartData = [
    { hour: 'T+0h', fs: 0.92, porePressure: 68 },
    { hour: 'T+4h', fs: 1.05, porePressure: 61 },
    { hour: 'T+8h', fs: 1.14, porePressure: 54 },
    { hour: 'T+12h', fs: 1.25, porePressure: 47 },
    { hour: 'T+16h', fs: 1.35, porePressure: 40 },
    { hour: 'T+20h', fs: 1.48, porePressure: 34 },
    { hour: 'T+24h', fs: 1.58, porePressure: 28 },
    { hour: 'T+32h', fs: 1.72, porePressure: 21 },
    { hour: 'T+40h', fs: 1.84, porePressure: 16 },
    { hour: 'T+48h', fs: 1.95, porePressure: 12 }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="rounded-2xl bg-gradient-to-r from-[#0c1c45] via-[#09163a] to-[#060e24] border border-[#1b3674] p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-500/40">FEATURE 12 • RISK HALF-LIFE ENGINE</span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">FEATURE 27 • SEVERITY TRAJECTORY</span>
          </div>
          <h2 className="text-xl font-bold text-white">Slope Recovery Decay Curve & Severity Projection</h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">Models post-rainfall drainage, Factor of Safety recovery and the projected risk trajectory.</p>
        </div>
        <div className="bg-[#05102a] p-3 rounded-xl border border-teal-500/30 text-xs shrink-0">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Estimated Safe Reopen Window</div>
          <div className="text-lg font-mono font-black text-emerald-400 mt-0.5">{halfLife.safeHighwayReopenWindow}</div>
          <div className="text-[10px] text-slate-400 mt-1">Drainage Rate: <span className="text-cyan-300 font-bold">{halfLife.drainageRateMmPerHour} mm/h</span></div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><TrendingDown className="w-4 h-4 text-teal-400" />Factor of Safety & Pore Pressure Dissipation</h3>
          <p className="text-[11px] text-slate-400">Stable threshold: FS &gt; 1.50 and pore pressure &lt; 30 kPa.</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={recoveryChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#14264f" />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#050e24', borderColor: '#1e3a78', borderRadius: '12px', fontSize: '11px' }} />
              <ReferenceLine y={1.5} stroke="#10b981" strokeDasharray="4 4" label="Safe FS 1.50" />
              <Area type="monotone" dataKey="fs" stroke="#10b981" strokeWidth={2.5} fill="none" />
              <Area type="monotone" dataKey="porePressure" stroke="#06b6d4" strokeWidth={2} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-[#081533] border border-[#162d64] p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-rose-400" /><h3 className="text-sm font-bold text-white">Multi-Horizon Severity Trajectory</h3></div><span className="text-[10px] font-mono text-cyan-300">{trajectory.statusBadge}</span></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {(trajectory.projections ?? []).map((p, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#050e24] border border-slate-800">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-mono font-bold text-cyan-300">{p.horizon}</span><span className="text-[10px] font-mono font-bold text-slate-300">{p.trajectory}</span></div>
              <div className="text-2xl font-mono font-black text-white">{p.projectedRiskScore}<span className="text-xs text-slate-400"> / 100</span></div>
              <div className="text-xs text-slate-300 mt-2">Failure probability: <span className="text-amber-400 font-bold">{p.failureProbabilityPct}%</span></div>
              <div className="text-xs text-slate-400 mt-1">Driver: {p.primaryRiskDriver}</div>
              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-cyan-200">{p.recommendedPreparednessAction}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};