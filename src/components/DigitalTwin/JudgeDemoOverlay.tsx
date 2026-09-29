import React, { useEffect, useState } from 'react';
import { Sparkles, X, ChevronRight, ChevronLeft, Pause, Play, CheckCircle2 } from 'lucide-react';

interface JudgeDemoOverlayProps {
  currentStepIndex: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onStopDemo: () => void;
}

export const JUDGE_DEMO_STEPS = [
  {
    title: '1. Real Geographic Digital Twin Baseline',
    narration: 'BHUSAKTHI loads real satellite imagery, Cesium World Terrain, and OpenStreetMap 3D buildings for the selected location.',
    durationSec: 7
  },
  {
    title: '2. Live Sensor Telemetry & InSAR Creep',
    narration: 'Telemetry monitors real-time precipitation, inclinometer tilt, volumetric water content, and historical fault proximity.',
    durationSec: 7
  },
  {
    title: '3. Intense Rainfall & Infiltration Surge',
    narration: 'Simulation initiates cloudburst precipitation. Soil saturation climbs, overwhelming pore-water percolation limits.',
    durationSec: 8
  },
  {
    title: '4. Critical Slope Shear Failure',
    narration: 'Factor of Safety drops below 1.05. Tension cracks appear along the upper crest, triggering mass regolith movement.',
    durationSec: 8
  },
  {
    title: '5. Colluvial Debris Flow Runout',
    narration: 'High-velocity debris propagates downslope following the natural DEM drainage gradient toward transport arteries.',
    durationSec: 8
  },
  {
    title: '6. Building Exposure & Road Blockage',
    narration: 'The system highlights exposed 3D structures and marks the primary arterial highway as impassable.',
    durationSec: 8
  },
  {
    title: '7. River Choke & Domino Flood Wave',
    narration: 'DISASTER DOMINO: Debris dams the river gorge, ponding upstream backwater before unleashing a downstream surge.',
    durationSec: 9
  },
  {
    title: '8. Intervention Simulator (Protective ROI)',
    narration: 'Testing precautionary interventions: Road closures and early staging reduce potential exposure by up to 55%.',
    durationSec: 8
  },
  {
    title: '9. Autonomous Safe Destination Finder',
    narration: 'Evaluating elevated shelters, schools, and civic halls with composite safety scores to determine the lowest-risk haven.',
    durationSec: 8
  },
  {
    title: '10. Safe Evacuation Route Navigation',
    narration: 'Calculating a multi-segment evacuation route avoiding all compromised corridors with turn-by-turn guidance.',
    durationSec: 8
  },
  {
    title: '11. Emergency Command Brief & Execution',
    narration: 'The complete chain: Detect → Verify → Predict → Simulate → Intervene → Evacuate → Respond.',
    durationSec: 7
  }
];

export const JudgeDemoOverlay: React.FC<JudgeDemoOverlayProps> = ({
  currentStepIndex,
  onNextStep,
  onPrevStep,
  onStopDemo
}) => {
  const currentStep = JUDGE_DEMO_STEPS[currentStepIndex] || JUDGE_DEMO_STEPS[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / JUDGE_DEMO_STEPS.length) * 100);

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-indigo-200 shadow-2xl w-full max-w-xl text-slate-800 pointer-events-auto space-y-2.5 font-sans">
      {/* Progress Bar & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider">
              JUDGE DEMONSTRATION MODE ({currentStepIndex + 1} OF {JUDGE_DEMO_STEPS.length})
            </div>
            <h4 className="text-xs font-black text-slate-900">{currentStep.title}</h4>
          </div>
        </div>
        <button
          onClick={onStopDemo}
          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
        >
          Exit Demo
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Narration */}
      <p className="text-xs text-slate-600 leading-relaxed bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100">
        {currentStep.narration}
      </p>

      {/* Controls */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <button
          onClick={onPrevStep}
          disabled={currentStepIndex === 0}
          className="px-2.5 py-1 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="text-[10px] font-mono text-slate-400">
          Auto-advancing • Interactive 3D Digital Twin
        </span>

        <button
          onClick={onNextStep}
          className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 cursor-pointer"
        >
          <span>{currentStepIndex === JUDGE_DEMO_STEPS.length - 1 ? 'Finish Demo' : 'Next Step'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
