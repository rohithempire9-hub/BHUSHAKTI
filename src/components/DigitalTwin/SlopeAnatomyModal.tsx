import React from 'react';
import { Layers, X, Info, ShieldAlert, Mountain } from 'lucide-react';
import { SlopeCutawayLayer } from './disasterSimulationData';

interface SlopeAnatomyModalProps {
  slopeData: SlopeCutawayLayer;
  locationName: string;
  onClose: () => void;
}

export const SlopeAnatomyModal: React.FC<SlopeAnatomyModalProps> = ({
  slopeData,
  locationName,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 font-sans text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                AI SLOPE ANATOMY — SUBSURFACE CUTAWAY
              </h3>
              <p className="text-[11px] text-slate-500">
                Conceptual Geotechnical Model • {locationName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conceptual Subsurface Graphic Diagram */}
        <div className="bg-slate-950 rounded-2xl p-4 text-white space-y-2 border border-slate-800 font-mono text-[11px]">
          <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1 border-b border-slate-800">
            <span>SURFACE TO BEDROCK PROFILE</span>
            <span className="text-purple-400">SLOPE: {slopeData.shearPlaneAngleDeg}°</span>
          </div>

          {/* Layer 1: Vegetated Topsoil */}
          <div className="bg-emerald-900/60 p-2 rounded-lg border border-emerald-700/60 flex justify-between items-center">
            <span className="text-emerald-300 font-bold">1. Vegetated Colluvial Soil Layer</span>
            <span className="text-emerald-400">0.0 – {slopeData.soilLayerThicknessM}m</span>
          </div>

          {/* Layer 2: Groundwater / Pore Seepage Plane */}
          <div className="bg-blue-900/60 p-2 rounded-lg border border-blue-700/60 flex justify-between items-center">
            <span className="text-blue-300 font-bold">2. Water Table / Phreatic Pore Seepage</span>
            <span className="text-blue-400">Depth {slopeData.waterTableDepthM}m ({slopeData.porePressureLevel})</span>
          </div>

          {/* Layer 3: Shear Slip Plane */}
          <div className="bg-rose-900/60 p-2 rounded-lg border border-rose-700/60 flex justify-between items-center animate-pulse">
            <span className="text-rose-300 font-bold">3. Critical Geotechnical Shear Plane</span>
            <span className="text-rose-400">FS = {slopeData.slopeStabilityFactor} (UNSTABLE)</span>
          </div>

          {/* Layer 4: Intact Bedrock */}
          <div className="bg-slate-800 p-2 rounded-lg border border-slate-700 flex justify-between items-center">
            <span className="text-slate-300 font-bold">4. Competent Lithological Bedrock</span>
            <span className="text-slate-400">&gt; {slopeData.bedrockDepthM}m depth</span>
          </div>
        </div>

        {/* Geomechanical Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block">Geological Lithology:</span>
            <strong className="text-slate-800 text-[11px] leading-tight block mt-0.5">
              {slopeData.geologicalUnit}
            </strong>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 text-[10px] block">Pore Water Status:</span>
            <strong className={`text-[11px] leading-tight block mt-0.5 ${
              slopeData.porePressureLevel === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'
            }`}>
              {slopeData.porePressureLevel} PRESSURE SPIKE
            </strong>
          </div>
        </div>

        {/* Scientific Disclaimer */}
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900 leading-snug flex items-start gap-2">
          <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <span>
            <strong>Conceptual Subsurface Visualization:</strong> Illustrates the scientific mechanics of shear failure caused by intense pore-water pressure along the colluvium-bedrock boundary. Calibrated with Copernicus DEM surface gradient.
          </span>
        </div>
      </div>
    </div>
  );
};
