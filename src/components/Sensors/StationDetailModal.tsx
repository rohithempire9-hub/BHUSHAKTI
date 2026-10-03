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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="clay-modal w-full max-w-4xl overflow-hidden my-8 max-h-[92vh] flex flex-col text-slate-800">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-white/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7)] ${
                isSafe
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : riskAssessment.status === 'critical'
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-amber-100 text-amber-700 border border-amber-300'
              }`}
            >
              {isSafe ? <ShieldCheck className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">{station.name}</h2>
                {/* Safe zone requirement: show SAFE ONLY */}
                {isSafe ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)]">
                    SAFE
                  </span>
                ) : (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)] ${
                      riskAssessment.status === 'critical'
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : riskAssessment.status === 'high'
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {riskAssessment.status} ({riskAssessment.riskScore}%)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {station.region}, {station.country} • Elevation {station.elevationM}m • Slope {station.slopeAngleDeg}° • {station.soilType}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="clay-control w-8 h-8 rounded-xl text-slate-500 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Banner */}
          {isSafe ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">SAFE ZONE CONFIRMED</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Geotechnical parameters are fully consolidated. Factor of Safety is {riskAssessment.safetyFactor} (well above the 1.50 critical threshold). No failure hazards detected.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold text-xs shrink-0 border border-emerald-300 shadow-[inset_1px_1px_1px_rgba(255,255,255,0.8)]">
                FS: {riskAssessment.safetyFactor}
              </span>
            </div>
          ) : (
            <div
              className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.9)] ${
                riskAssessment.status === 'critical'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                    <span>{riskAssessment.status} Alert Advisory</span>
                    <span className="text-xs font-mono font-normal">
                      Failure Probability: {riskAssessment.failureProbabilityPct}%
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-slate-700">
                    {riskAssessment.recommendedAction}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onOpenEvidenceForStation && (
                  <button
                    onClick={() => onOpenEvidenceForStation(station)}
                    className="clay-button-secondary px-3.5 py-2 text-xs font-bold gap-1.5"
                    title="Upload or inspect user photo evidence for this station"
                  >
                    <Camera className="w-3.5 h-3.5 text-rose-600" />
                    <span>Photo Evidence</span>
                  </button>
                )}
                <button
                  onClick={() => onOpenSmsModalForStation(station)}
                  className="clay-button-danger px-3.5 py-2 text-xs font-bold gap-1.5"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Dispatch Alert SMS</span>
                </button>
              </div>
            </div>
          )}

          {/* 1. Real-Time Telemetry Sensor Dials */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
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
              <div className="clay-card-raised p-3.5">
                <div className="text-slate-600 flex items-center gap-1.5 mb-1 text-xs font-semibold">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  Pore Pressure
                </div>
                <div className="text-lg font-bold text-slate-800 font-mono">
                  {telemetry.poreWaterPressureKpa} <span className="text-xs font-normal text-slate-500">kPa</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Piezometer shear zone
                </div>
              </div>

              {/* Inclinometer Tilt / Displacement */}
              <div className="clay-card-raised p-3.5">
                <div className="text-slate-600 flex items-center gap-1.5 mb-1 text-xs font-semibold">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  Extensometer Creep
                </div>
                <div className="text-lg font-bold text-slate-800 font-mono">
                  {telemetry.displacementMm} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Tilt shift: {telemetry.tiltAngleDeg}°
                </div>
              </div>

              {/* Peak Vibration / Tremor */}
              <div className="clay-card-raised p-3.5">
                <div className="text-slate-600 flex items-center gap-1.5 mb-1 text-xs font-semibold">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Seismic Vibration
                </div>
                <div className="text-lg font-bold text-slate-800 font-mono">
                  {telemetry.vibrationMmS} <span className="text-xs font-normal text-slate-500">mm/s</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Triaxial geophone
                </div>
              </div>

              {/* Precipitation Rate */}
              <div className="clay-card-raised p-3.5">
                <div className="text-slate-600 flex items-center gap-1.5 mb-1 text-xs font-semibold">
                  <CloudRain className="w-4 h-4 text-blue-500" />
                  Current Rain Rate
                </div>
                <div className="text-lg font-bold text-slate-800 font-mono">
                  {telemetry.rainfallRateMmH} <span className="text-xs font-normal text-slate-500">mm/h</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Optical disdrometer
                </div>
              </div>

              {/* 24h Cumulative Rain */}
              <div className="clay-card-raised p-3.5">
                <div className="text-slate-600 flex items-center gap-1.5 mb-1 text-xs font-semibold">
                  <CloudRain className="w-4 h-4 text-sky-500" />
                  24h Cumulative Rain
                </div>
                <div className="text-lg font-bold text-slate-800 font-mono">
                  {telemetry.rainfall24hMm} <span className="text-xs font-normal text-slate-500">mm</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Rainfall trigger: 60mm
                </div>
              </div>
            </div>
          </div>

          {/* 2. Interactive Weather & Seismic Simulation Controls */}
          <div className="clay-panel p-4">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              Dynamic Simulation & Real-Time Stress Testing
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Test machine learning early alert sensitivity by introducing simulated environmental disturbances.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={triggerMonsoonRain}
                className="clay-button px-3 py-2 text-xs font-bold gap-1.5"
              >
                <CloudRain className="w-4 h-4 text-cyan-600" />
                <span>Simulate Heavy Downpour (+45mm)</span>
              </button>
              <button
                onClick={triggerMicroTremor}
                className="clay-button px-3 py-2 text-xs font-bold gap-1.5"
              >
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Simulate Fault Micro-Tremor</span>
              </button>
              <button
                onClick={resetToDryBaseline}
                className="clay-button-secondary px-3 py-2 text-xs font-bold"
              >
                Reset to Safe Baseline
              </button>
            </div>
          </div>

          {/* 3. Gemini AI Geotechnical Diagnosis */}
          <div className="clay-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500 animate-spin" style={{ animationDuration: '8s' }} />
                <h4 className="text-sm font-bold text-slate-900">
                  Gemini AI Geotechnical Stability Specialist
                </h4>
              </div>
              <button
                id="run-ai-geotechnical-btn"
                disabled={isAnalyzingAI}
                onClick={handleRunAiAnalysis}
                className="clay-button-primary px-3.5 py-1.5 text-xs font-bold gap-1.5 disabled:opacity-50"
              >
                {isAnalyzingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Telemetry...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Geotechnical Analysis</span>
                  </>
                )}
              </button>
            </div>

            {aiReport ? (
              <div className="clay-card-raised p-4 text-xs text-slate-800 leading-relaxed font-sans space-y-2 whitespace-pre-line">
                <div className="text-[11px] text-blue-600 font-bold mb-1 flex items-center justify-between">
                  <span>Engineered Diagnostics ({aiReport.source})</span>
                  <span>Evaluated at {new Date().toLocaleTimeString()}</span>
                </div>
                {aiReport.analysis}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Click above to generate an expert geotechnical appraisal factoring in temperature gradients, pore pressure dissipation, and accelerated soil erosion velocities.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200/80 bg-white/80 flex items-center justify-between text-xs text-slate-500">
          <div>Station ID: <span className="font-mono text-slate-800 font-bold">{station.id}</span></div>
          <button
            onClick={onClose}
            className="clay-button-secondary px-4 py-1.5 text-xs font-bold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
