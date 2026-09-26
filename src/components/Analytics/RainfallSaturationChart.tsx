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
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${breached ? 'bg-red-50 text-red-800 border-red-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
              {breached ? 'CRITICAL BREACH (>80%)' : 'FIRESTORE LIVE TELEMETRY'}
            </span>
            <span className="text-xs text-slate-700 font-semibold">{currentStationName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-mono">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>{history.length} persisted telemetry points</span>
            {lastLoaded && <span>• refreshed {lastLoaded.toLocaleTimeString()}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-mono font-semibold flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-600" /> {latestRain.toFixed(1)} mm/h
          </div>
          <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${breached ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
            <Droplets className="w-3.5 h-3.5 text-emerald-600" /> {latestMoisture.toFixed(1)}% saturation
          </div>
          <button onClick={() => void loadHistory()} disabled={loading} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer disabled:opacity-50" title="Refresh Firestore history">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-[350px] rounded-xl bg-white border border-slate-200 p-2 sm:p-3 shadow-xs">
        {history.length === 0 && !loading ? (
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center text-slate-500 gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <p className="text-sm font-semibold text-slate-800">Waiting for Firestore history</p>
            <p className="text-xs max-w-md text-slate-500">Allow the telemetry worker a few moments to sync historical records.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#475569' }} minTickGap={24} />
              <YAxis yAxisId="left" stroke="#2563eb" tick={{ fontSize: 10, fill: '#1e40af' }} domain={[0, 'auto']} unit=" mm" />
              <YAxis yAxisId="right" orientation="right" stroke={soilLineColor} tick={{ fontSize: 10, fill: '#475569' }} domain={[30, 100]} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any, name: any) => {
                  if (name === 'soilMoisturePct') return [`${value}%`, 'Soil Moisture'];
                  if (name === 'rainfallMmH') return [`${value} mm/h`, 'Rainfall'];
                  if (name === 'poreWaterPressureKpa') return [`${value} kPa`, 'Pore Pressure'];
                  return [value, name];
                }}
              />
              <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} label={{ value: '80% DANGER THRESHOLD', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} />
              <Bar yAxisId="left" dataKey="rainfallMmH" name="Rainfall" fill="#3b82f6" fillOpacity={0.65} radius={[3, 3, 0, 0]} barSize={12} />
              <Area yAxisId="right" type="monotone" dataKey="soilMoisturePct" fill={soilLineColor} fillOpacity={0.12} stroke="none" />
              <Line yAxisId="right" type="monotone" dataKey="soilMoisturePct" name="soilMoisturePct" stroke={soilLineColor} strokeWidth={2.5} dot={{ r: 2, fill: soilLineColor }} activeDot={{ r: 5, fill: soilLineColor }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-3">
          <span className="text-blue-700 font-semibold">■ Rainfall (mm/h)</span>
          <span className={breached ? 'text-red-700 font-bold' : 'text-cyan-700 font-semibold'}>━ Soil Moisture %</span>
          <span className="text-red-600 font-medium">┅ 80% danger threshold</span>
        </div>
        <span className="text-slate-400">Continuous telemetry sync • fallback estimation active</span>
      </div>
    </div>
  );
};
