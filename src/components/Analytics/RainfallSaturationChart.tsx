import React, { useState } from 'react';
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
import { TrendingUp, Droplets, CloudRain, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { HOURLY_RAINFALL_SATURATION_SERIES } from '../../data/bhuShaktiData';

interface RainfallSaturationChartProps {
  currentStationName?: string;
  simulatedRainfall?: number;
  simulatedDisplacement?: number;
}

export const RainfallSaturationChart: React.FC<RainfallSaturationChartProps> = ({
  currentStationName = 'Northeast India (Regional Cumulative)',
  simulatedRainfall = 25,
  simulatedDisplacement = 0.8,
}) => {
  const [activeRange, setActiveRange] = useState<'24h' | '48h'>('24h');

  // Dynamic 24-hour simulation scaling:
  // When simulatedRainfall increases, the recent 8-10 hours rise in rainfall and soil saturation
  const simulatedData = HOURLY_RAINFALL_SATURATION_SERIES.map((pt, idx) => {
    // Weight increases towards the most recent hours (right side of chart)
    const factor = idx / HOURLY_RAINFALL_SATURATION_SERIES.length;
    const rainBoost = Math.round((simulatedRainfall - 25) * factor);
    const effectiveRain = Math.max(2, Math.round(pt.rainfallMmH + rainBoost));

    // Soil moisture rises with rainfall saturation
    const moistureBoost = Math.round(((simulatedRainfall - 25) / 150) * 38 * factor + (simulatedDisplacement / 15) * 8 * factor);
    const effectiveMoisture = Math.min(98, Math.max(35, Math.round(pt.soilMoisturePct + moistureBoost)));

    return {
      ...pt,
      rainfallMmH: effectiveRain,
      soilMoisturePct: effectiveMoisture,
    };
  });

  const latestPoint = simulatedData[simulatedData.length - 1] || { rainfallMmH: 25, soilMoisturePct: 62 };
  const isBreaching = simulatedData.some((d) => d.soilMoisturePct >= 80) || latestPoint.soilMoisturePct >= 80;

  // Prompt requirement: "When lines breach this limit, the chart line color should dynamically transition from cyan to emergency crimson."
  const soilLineColor = isBreaching ? '#ef4444' : '#06b6d4'; // Glowing cyan vs Emergency crimson

  return (
    <div id="rainfall-soil-saturation-analytics-chart" className="flex flex-col h-full">
      {/* Header & Metric summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border transition-colors whitespace-nowrap shrink-0 ${
                isBreaching
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
              }`}
            >
              {isBreaching ? 'CRITICAL BREACH (>80%)' : 'NORMAL INFILTRATION'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono truncate">
              Dual-Axis: Rain (bar) vs Soil (line)
            </span>
          </div>
        </div>

        {/* Current Readout Badges */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 flex items-center gap-1.5 whitespace-nowrap">
            <CloudRain className="w-3 h-3 text-blue-400 shrink-0" />
            <span>{latestPoint.rainfallMmH} mm/h</span>
          </div>
          <div
            className={`px-2 py-0.5 rounded-lg border flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap ${
              isBreaching
                ? 'bg-rose-950/70 border-rose-600/70 text-rose-300'
                : 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300'
            }`}
          >
            <Droplets className="w-3 h-3 shrink-0" />
            <span>{latestPoint.soilMoisturePct}% Saturation</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-0 rounded-xl bg-slate-950/80 border border-slate-800 p-2 sm:p-2.5 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={simulatedData} margin={{ top: 8, right: 12, left: -14, bottom: 0 }}>
            <defs>
              <linearGradient id="rainBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.65} />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="moistureAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={soilLineColor} stopOpacity={0.25} />
                <stop offset="100%" stopColor={soilLineColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />

            {/* Left Y-Axis: Cumulative Rainfall (semi-transparent blue bars) */}
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#60a5fa"
              tick={{ fontSize: 10 }}
              domain={[0, Math.max(100, Math.ceil(simulatedRainfall * 1.25))]}
              unit=" mm"
            />

            {/* Right Y-Axis: Soil Moisture Saturation (glowing cyan / emergency crimson) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke={soilLineColor}
              tick={{ fontSize: 10 }}
              domain={[30, 100]}
              unit="%"
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '12px',
                color: '#f8fafc',
                fontSize: '11px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
              }}
              formatter={(value: any, name: any) => {
                if (name === 'soilMoisturePct') return [`${value}%`, 'Soil Moisture Saturation'];
                if (name === 'rainfallMmH') return [`${value} mm/h`, 'Rainfall Precipitation'];
                return [value, name];
              }}
            />

            {/* Subtle horizontal dashed threshold line at 80% saturation */}
            <ReferenceLine
              yAxisId="right"
              y={80}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: '80% DANGER THRESHOLD',
                fill: '#ef4444',
                fontSize: 9,
                position: 'insideTopRight',
              }}
            />

            {/* Left Y-Axis: Cumulative Rainfall (semi-transparent blue bars) */}
            <Bar
              yAxisId="left"
              dataKey="rainfallMmH"
              name="Cumulative Rainfall"
              fill="url(#rainBarGradient)"
              radius={[3, 3, 0, 0]}
              barSize={14}
            />

            {/* Soft area under soil saturation line */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="soilMoisturePct"
              fill="url(#moistureAreaGradient)"
              stroke="none"
            />

            {/* Right Y-Axis: Soil Moisture Saturation (glowing cyan line, transitions to emergency crimson when >80%) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="soilMoisturePct"
              name="Soil Moisture Saturation"
              stroke={soilLineColor}
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: soilLineColor }}
              activeDot={{ r: 5, fill: soilLineColor }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Scientific Summary Bar */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-500/70 rounded-sm" />
            <span className="text-slate-300">Rainfall (mm)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-1 rounded-full transition-colors"
              style={{ backgroundColor: soilLineColor }}
            />
            <span className={isBreaching ? 'text-rose-400 font-bold' : 'text-cyan-300 font-semibold'}>
              Soil Moisture % {isBreaching ? '(Breached)' : '(Cyan Safe)'}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-rose-400 font-mono text-[10px]">
            <span className="w-2.5 h-0.5 border-b border-dashed border-rose-500" />
            <span>80% Yield Limit</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Antecedent Saturation Model</span>
        </div>
      </div>
    </div>
  );
};
