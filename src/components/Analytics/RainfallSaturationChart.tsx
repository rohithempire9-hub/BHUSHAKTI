import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Droplets, CloudRain, RefreshCw, Database, AlertTriangle } from 'lucide-react';
import { loadFirestoreAnalytics, AnalyticsPoint } from '../../services/firestoreAnalytics';

interface RainfallSaturationChartProps {
  currentStationName?: string;
  stationId?: string;
  simulatedRainfall?: number;
  simulatedDisplacement?: number;
}

export const RainfallSaturationChart: React.FC<RainfallSaturationChartProps> = ({
  currentStationName = 'Northeast India (Regional)',
  stationId,
  simulatedRainfall = 25,
  simulatedDisplacement = 0.8,
}) => {
  const [history, setHistory] = useState<AnalyticsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastLoaded, setLastLoaded] = useState<Date | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const rows = await loadFirestoreAnalytics(stationId, 160);
      setHistory(rows);
      setLastLoaded(new Date());
    } catch (error) {
      console.warn('[BhuShakti Analytics] Firestore history unavailable:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
    const interval = window.setInterval(() => void loadHistory(), 30_000);
    return () => window.clearInterval(interval);
  }, [stationId]);

  const chartData = useMemo(() => history.map((p) => ({
    ...p,
    time: new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  })), [history]);

  const latest = history[history.length - 1];
  const latestRain = latest?.rainfallMmH ?? simulatedRainfall;
  const latestMoisture = latest?.soilMoisturePct ?? Math.min(98, 50 + simulatedRainfall / 4 + simulatedDisplacement);
  const breached = latestMoisture >= 80 || history.some((p) => p.soilMoisturePct >= 80);
  const soilLineColor = breached ? '#ef4444' : '#06b6d4';

  return (
    <div id="rainfall-soil-saturation-analytics-chart" className="flex flex-col h-full min-h-[430px]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${breached ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'}`}>
              {breached ? 'CRITICAL BREACH (>80%)' : 'FIRESTORE LIVE HISTORY'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{currentStationName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
            <Database className="w-3 h-3" />
            <span>{history.length} persisted telemetry points</span>
            {lastLoaded && <span>• refreshed {lastLoaded.toLocaleTimeString()}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs font-mono flex items-center gap-1.5">
            <CloudRain className="w-3 h-3" /> {latestRain.toFixed(1)} mm/h
          </div>
          <div className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${breached ? 'bg-rose-950/70 border-rose-600/70 text-rose-300' : 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300'}`}>
            <Droplets className="w-3 h-3" /> {latestMoisture.toFixed(1)}% saturation
          </div>
          <button onClick={() => void loadHistory()} disabled={loading} className="p-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 disabled:opacity-50" title="Refresh Firestore history">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[350px] rounded-xl bg-slate-950/80 border border-slate-800 p-2 sm:p-3">
        {history.length === 0 && !loading ? (
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center text-slate-400 gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <p className="text-sm font-semibold">Waiting for Firestore history</p>
            <p className="text-xs max-w-md">Start the BhuShakti server and allow the history worker a few seconds to write telemetry snapshots.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 9 }} minTickGap={24} />
              <YAxis yAxisId="left" stroke="#60a5fa" tick={{ fontSize: 9 }} domain={[0, 'auto']} unit=" mm" />
              <YAxis yAxisId="right" orientation="right" stroke={soilLineColor} tick={{ fontSize: 9 }} domain={[30, 100]} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }}
                formatter={(value: any, name: any) => {
                  if (name === 'soilMoisturePct') return [`${value}%`, 'Soil Moisture'];
                  if (name === 'rainfallMmH') return [`${value} mm/h`, 'Rainfall'];
                  if (name === 'poreWaterPressureKpa') return [`${value} kPa`, 'Pore Pressure'];
                  return [value, name];
                }}
              />
              <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ value: '80% DANGER', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />
              <Bar yAxisId="left" dataKey="rainfallMmH" name="Rainfall" fill="#2563eb" fillOpacity={0.55} radius={[3, 3, 0, 0]} barSize={12} />
              <Area yAxisId="right" type="monotone" dataKey="soilMoisturePct" fill={soilLineColor} fillOpacity={0.12} stroke="none" />
              <Line yAxisId="right" type="monotone" dataKey="soilMoisturePct" name="soilMoisturePct" stroke={soilLineColor} strokeWidth={2.5} dot={{ r: 2, fill: soilLineColor }} activeDot={{ r: 5, fill: soilLineColor }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>■ Rainfall (mm/h)</span>
          <span className={breached ? 'text-rose-400 font-bold' : 'text-cyan-300 font-semibold'}>━ Soil Moisture %</span>
          <span className="text-rose-400">┅ 80% danger threshold</span>
        </div>
        <span>30s Firestore refresh • simulation values remain available as fallback</span>
      </div>
    </div>
  );
};
