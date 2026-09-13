import React, { useState } from 'react';
import { LandslideStation } from '../../types/landslide';
import { requestGeotechnicalAnalysis, AIAnalysisResult } from '../../services/aiService';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Thermometer,
  Activity,
  Droplets,
  TrendingUp,
  CloudRain,
  Compass,
  Sparkles,
  Radio,
  RefreshCw,
  Zap,
  CheckCircle2,
  FileText,
  AlertOctagon,
  Camera
} from 'lucide-react';

interface StationDetailModalProps {
  isOpen: boolean;
  station: LandslideStation | null;
  onClose: () => void;
  onUpdateStationTelemetry: (
    stationId: string,
    simulatedChanges: {
      rainfallRateMmH?: number;
      rainfall24hMm?: number;
      poreWaterPressureKpa?: number;
      soilMoisturePct?: number;
      erosionRateMmPerYr?: number;
      erosionLiveMmH?: number;
      displacementMm?: number;
      vibrationMmS?: number;
      temperatureC?: number;
    }
  ) => void;
  onOpenSmsModalForStation: (station: LandslideStation) => void;
  onOpenEvidenceForStation?: (station: LandslideStation) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  isOpen,
  station,
  onClose,
  onUpdateStationTelemetry,
  onOpenSmsModalForStation,
  onOpenEvidenceForStation
}) => {
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiReport, setAiReport] = useState<AIAnalysisResult | null>(null);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !station) return null;

  const { telemetry, riskAssessment } = station;
  const isSafe = riskAssessment.status === 'safe';

  // Handle AI analysis
  const handleRunAiAnalysis = async () => {
    setIsAnalyzingAI(true);
    try {
      const result = await requestGeotechnicalAnalysis(station);
      setAiReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Weather simulation triggers
  const triggerMonsoonRain = () => {
    onUpdateStationTelemetry(station.id, {
      rainfallRateMmH: telemetry.rainfallRateMmH + 18,
      rainfall24hMm: telemetry.rainfall24hMm + 45,
      soilMoisturePct: Math.min(96, telemetry.soilMoisturePct + 18),
      poreWaterPressureKpa: Number((telemetry.poreWaterPressureKpa + 14.5).toFixed(1)),
      erosionRateMmPerYr: Number((telemetry.erosionRateMmPerYr + 8.2).toFixed(1)),
      erosionLiveMmH: Number((telemetry.erosionLiveMmH + 3.8).toFixed(1)),
      displacementMm: Number((telemetry.displacementMm + 1.2).toFixed(2)),
    });
  };

  const triggerMicroTremor = () => {
    onUpdateStationTelemetry(station.id, {
      vibrationMmS: Number((telemetry.vibrationMmS + 4.2).toFixed(2)),
      displacementMm: Number((telemetry.displacementMm + 0.8).toFixed(2)),
    });
  };

  const resetToDryBaseline = () => {
    onUpdateStationTelemetry(station.id, {
      rainfallRateMmH: 0.5,
      rainfall24hMm: 8.0,
      soilMoisturePct: 34,
      poreWaterPressureKpa: 10.2,
      erosionRateMmPerYr: 3.5,
      erosionLiveMmH: 0.2,
      displacementMm: 0.1,
      vibrationMmS: 0.4,
    });
    setAiReport(null);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center border font-bold ${
                isSafe
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                  : riskAssessment.status === 'critical'
                  ? 'bg-rose-600/20 text-rose-400 border-rose-500/40 animate-pulse'
                  : 'bg-amber-600/20 text-amber-400 border-amber-500/40'
              }`}
            >
              {isSafe ? <ShieldCheck className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{station.name}</h2>
                {/* Safe zone requirement: show SAFE ONLY */}
                {isSafe ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                    SAFE
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
                      riskAssessment.status === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                        : riskAssessment.status === 'high'
                        ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    }`}
                  >
                    {riskAssessment.status} ({riskAssessment.riskScore}%)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {station.region}, {station.country} • Elevation {station.elevationM}m • Slope {station.slopeAngleDeg}° • {station.soilType}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Banner */}
          {isSafe ? (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-300">SAFE ZONE CONFIRMED</h4>
                  <p className="text-xs text-emerald-400/90 mt-0.5">
                    Geotechnical parameters are fully consolidated. Factor of Safety is {riskAssessment.safetyFactor} (well above the 1.50 critical threshold). No failure hazards detected.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs shrink-0 border border-emerald-500/30">
                FS: {riskAssessment.safetyFactor}
              </span>
            </div>
          ) : (
            <div
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                riskAssessment.status === 'critical'
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                    <span>{riskAssessment.status} Alert Advisory</span>
                    <span className="text-xs font-mono font-normal">
                      Failure Probability: {riskAssessment.failureProbabilityPct}%
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-slate-300">
                    {riskAssessment.recommendedAction}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onOpenEvidenceForStation && (
                  <button
                    onClick={() => onOpenEvidenceForStation(station)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
                    title="Upload or inspect user photo evidence for this station"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-400" />
                    <span>Photo Evidence</span>
                  </button>
                )}
                <button
                  onClick={() => onOpenSmsModalForStation(station)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  Dispatch Alert SMS
                </button>
              </div>
            </div>
          )}

          {/* 1. Real-Time Telemetry Sensor Dials */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Real-Time Geological Sensor Telemetry
              </h3>
              <span className="text-[11px] text-slate-400">
                Updated: {new Date(telemetry.lastUpdated).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Temperature */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Thermometer className="w-4 h-4 text-orange-400" />
                  Temperature
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {telemetry.temperatureC}°C
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Subsurface probe depth: 1.5m
                </div>
              </div>

              {/* Soil Erosion Rate */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Activity className="w-4 h-4 text-rose-400" />
                  Soil Erosion Rate
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {telemetry.erosionRateMmPerYr} <span className="text-xs font-normal">mm/y</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Live Runoff: <strong>{telemetry.erosionLiveMmH} mm/h</strong>
                </div>
              </div>

              {/* Volumetric Soil Moisture */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  Soil Moisture (VWC)
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {telemetry.soilMoisturePct}%
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Field capacity threshold: 75%
                </div>
              </div>

              {/* Pore Water Pressure */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Pore Pressure
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {telemetry.poreWaterPressureKpa} <span className="text-xs font-normal">kPa</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Piezometer shear zone
                </div>
              </div>

              {/* Inclinometer Tilt / Displacement */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  Extensometer Creep
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {telemetry.displacementMm} <span className="text-xs font-normal">mm</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Tilt shift: {telemetry.tiltAngleDeg}°
                </div>
              </div>

              {/* Peak Vibration / Tremor */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Seismic Vibration
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {telemetry.vibrationMmS} <span className="text-xs font-normal">mm/s</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Triaxial geophone
                </div>
              </div>

              {/* Precipitation Rate */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <CloudRain className="w-4 h-4 text-blue-400" />
                  Current Rain Rate
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {telemetry.rainfallRateMmH} <span className="text-xs font-normal">mm/h</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Optical disdrometer
                </div>
              </div>

              {/* 24h Cumulative Rain */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <CloudRain className="w-4 h-4 text-sky-400" />
                  24h Cumulative Rain
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {telemetry.rainfall24hMm} <span className="text-xs font-normal">mm</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Rainfall trigger: 60mm
                </div>
              </div>
            </div>
          </div>

          {/* 2. Interactive Weather & Seismic Simulation Controls */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              Dynamic Simulation & Real-Time Stress Testing
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Test machine learning early alert sensitivity by introducing simulated environmental disturbances.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={triggerMonsoonRain}
                className="px-3 py-2 bg-cyan-900/60 hover:bg-cyan-800/60 text-cyan-200 border border-cyan-700/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Simulate Heavy Downpour (+45mm)
              </button>
              <button
                onClick={triggerMicroTremor}
                className="px-3 py-2 bg-amber-900/60 hover:bg-amber-800/60 text-amber-200 border border-amber-700/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4 text-yellow-400" />
                Simulate Fault Micro-Tremor
              </button>
              <button
                onClick={resetToDryBaseline}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset to Safe Baseline
              </button>
            </div>
          </div>

          {/* 3. Gemini AI Geotechnical Diagnosis */}
          <div className="bg-gradient-to-br from-indigo-950/30 to-purple-950/30 p-5 rounded-2xl border border-indigo-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
                <h4 className="text-sm font-bold text-white">
                  Gemini AI Geotechnical Stability Specialist
                </h4>
              </div>
              <button
                id="run-ai-geotechnical-btn"
                disabled={isAnalyzingAI}
                onClick={handleRunAiAnalysis}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                {isAnalyzingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Telemetry...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Run AI Geotechnical Analysis
                  </>
                )}
              </button>
            </div>

            {aiReport ? (
              <div className="bg-slate-950/90 p-4 rounded-xl border border-indigo-500/30 text-xs text-slate-200 leading-relaxed font-sans space-y-2 whitespace-pre-line">
                <div className="text-[11px] text-indigo-400 font-semibold mb-1 flex items-center justify-between">
                  <span>Engineered Diagnostics ({aiReport.source})</span>
                  <span>Evaluated at {new Date().toLocaleTimeString()}</span>
                </div>
                {aiReport.analysis}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Click above to generate an expert geotechnical appraisal factoring in temperature gradients, pore pressure dissipation, and accelerated soil erosion velocities.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div>Station ID: <span className="font-mono text-slate-200">{station.id}</span></div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
