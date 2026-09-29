import React, { useState } from 'react';
import { FileText, X, Printer, Check, ShieldCheck, AlertTriangle, MapPin, Route, Users, Building } from 'lucide-react';
import { SimulationImpactResult } from './disasterSimulationData';

interface EmergencyBriefModalProps {
  impactResult: SimulationImpactResult;
  onClose: () => void;
}

export const EmergencyBriefModal: React.FC<EmergencyBriefModalProps> = ({
  impactResult,
  onClose
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const briefText = `
BHUSAKTHI AI — EMERGENCY COMMAND BRIEF
============================================================
DATE/TIME: ${new Date().toLocaleString()}
INCIDENT TYPE: ${impactResult.disasterType.toUpperCase()} SIMULATION
LOCATION: ${impactResult.locationName}, ${impactResult.state}
STATUS: ACTIVE DECISION-SUPPORT RECOMMENDATION

1. SITUATION SUMMARY:
• Key Hazard: Colluvial slope failure with high-velocity debris avalanche across transport corridors.
• Timeline Phase: ${impactResult.phase.toUpperCase()} (T + ${impactResult.timelineMinutes}:00 min)
• Rainfall Accumulation: Model Input Threshold Breached
• Soil Saturation: Critical Pore-Pressure Spike (>80%)

2. PROJECTED CONSEQUENCES (PROTOTYPE MODEL ESTIMATE):
• Impact Zone Extent: ${impactResult.impactZoneKm2} km²
• Exposed OSM Buildings: ${impactResult.exposedBuildingsCount} structures
• At-Risk Population: ${impactResult.exposedPopulation.toLocaleString()} residents
• Compromised Lifeline Corridor: ${impactResult.blockedRoadName} (IMPASSABLE)

3. IMMEDIATE ACTION DIRECTIVES:
• Field Verification: Immediate deployment of rapid ground reconnaissance team.
• Precautionary Evacuation: Alert residents in colluvial runout apron.
• Traffic Diversion: Reroute all civilian vehicular traffic to ${impactResult.alternativeRouteName}.

4. DESIGNATED RELIEF DESTINATIONS & ROUTES:
• Recommended Haven: ${impactResult.shelterName} (High safety rating, elevated terrain)
• Recommended Safe Route: ${impactResult.alternativeRouteName} (${impactResult.evacuationDirection})
• Route Status: Avoids hazard runout zone. Continuous ridgeline clearance.

DISCLAIMER: Consequence estimates are synthesized prototype projections based on local DEM slope angles, catchment geometries, and OpenStreetMap data layers.
============================================================
`.trim();

    navigator.clipboard.writeText(briefText).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 pointer-events-auto">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-4 font-sans text-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-sm">
                EMERGENCY COMMAND BRIEF
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                AUTONOMOUS DISASTER DECISION-SUPPORT DOSSIER
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyText}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Copy Brief to Clipboard"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <span className="text-[11px]">Copy</span>}
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Print Brief"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Sheet */}
        <div className="space-y-3 text-xs leading-relaxed">
          {/* Key Identification Box */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">TARGET LOCATION:</span>
              <strong className="text-slate-900 text-xs">{impactResult.locationName}, {impactResult.state}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">SCENARIO:</span>
              <strong className="text-amber-700 text-xs">{impactResult.disasterType.toUpperCase()} ({impactResult.severity.toUpperCase()})</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">MODEL CONFIDENCE:</span>
              <strong className="text-blue-700 text-xs">{impactResult.confidencePercent}% CERTAINTY</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">TIMELINE PHASE:</span>
              <strong className="text-rose-700 text-xs">{impactResult.currentMilestoneText}</strong>
            </div>
          </div>

          {/* Section 1: Key Risk */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              1. Primary Risk Drivers & Mechanisms
            </h4>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-slate-600 text-[11px]">
              {impactResult.whyFactors.slice(0, 3).map((factor, i) => (
                <div key={i}>• {factor}</div>
              ))}
            </div>
          </div>

          {/* Section 2: Consequence Estimates */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              2. Potential Consequence Profile (Model Estimate)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Impact Zone</span>
                <strong className="text-slate-900 text-xs">{impactResult.impactZoneKm2} km²</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Exposed OSM</span>
                <strong className="text-slate-900 text-xs">{impactResult.exposedBuildingsCount} bldgs</strong>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Population</span>
                <strong className="text-slate-900 text-xs">{impactResult.exposedPopulation.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Section 3: Recommended Lifeline Response */}
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              3. Recommended Destination & Evacuation Lifeline
            </h4>
            <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-emerald-800">Designated Haven:</span>
                <strong className="text-emerald-900">{impactResult.shelterName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Recommended Route:</span>
                <strong className="text-emerald-900">{impactResult.alternativeRouteName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Compromised Corridor:</span>
                <strong className="text-rose-700">{impactResult.blockedRoadName} (AVOID)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <p className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-100">
          This brief clearly distinguishes between observed telemetry (rain/slope) and scenario estimates.
          We predict risk, not certainty. Precautionary field verification required before civil defense execution.
        </p>
      </div>
    </div>
  );
};
