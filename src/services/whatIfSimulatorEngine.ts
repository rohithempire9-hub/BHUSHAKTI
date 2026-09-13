export interface WhatIfInputParams {
  rainfallMultiplier: number; // e.g. 1.0 (normal), 1.4 (+40%), 0.7 (-30%)
  soilSaturationOffset: number; // e.g. +10%, -15%
  drainageCondition: 'Degraded / Blocked' | 'Natural Baseline' | 'Engineered Geotextile Drains (+35% runoff)';
  roadClosureStatus: 'All Open' | 'Single-Lane Advisory' | 'Precautionary Road Closure';
  evacuationStatus: 'No Evacuation' | 'School & Vulnerable Elderly Evacuated' | 'Full Zone Evacuated to Ridge Shelter';
}

export interface WhatIfSimulationResult {
  baselineRiskScore: number;
  simulatedRiskScore: number;
  deltaRiskScore: number;
  baselineSafetyFactor: number;
  simulatedSafetyFactor: number;
  deltaSafetyFactor: number;
  baselineExposedPeople: number;
  simulatedExposedPeople: number;
  deltaExposedPeople: number;
  cascadeProbabilityPct: number;
  simulatedVerdict: string;
  recommendedIntervention: string;
  comparisonChart: {
    category: string;
    baseline: number;
    simulated: number;
  }[];
}

export function runWhatIfSimulation(params: WhatIfInputParams): WhatIfSimulationResult {
  const baseRisk = 78;
  const baseFS = 1.04;
  const baseExposed = 2180;

  // Rainfall factor impact
  const rainDelta = (params.rainfallMultiplier - 1.0) * 45; // +40% rain adds ~18 pts
  // Saturation factor impact
  const saturationDelta = params.soilSaturationOffset * 0.4;

  // Drainage factor impact
  let drainageDelta = 0;
  if (params.drainageCondition === 'Degraded / Blocked') {
    drainageDelta = +12;
  } else if (params.drainageCondition === 'Engineered Geotextile Drains (+35% runoff)') {
    drainageDelta = -23; // significantly lowers risk!
  }

  // Road closure impact on risk & consequence
  let roadRiskDelta = 0;
  let exposedRoadPenalty = 0;
  if (params.roadClosureStatus === 'Precautionary Road Closure') {
    roadRiskDelta = -5; // eliminates traffic surcharge on cut
    exposedRoadPenalty = -600; // travelers removed from danger corridor
  } else if (params.roadClosureStatus === 'Single-Lane Advisory') {
    roadRiskDelta = -2;
    exposedRoadPenalty = -250;
  }

  // Evacuation status impact
  let evacPenalty = 0;
  if (params.evacuationStatus === 'Full Zone Evacuated to Ridge Shelter') {
    evacPenalty = -1900;
  } else if (params.evacuationStatus === 'School & Vulnerable Elderly Evacuated') {
    evacPenalty = -850;
  }

  const rawSimRisk = baseRisk + rainDelta + saturationDelta + drainageDelta + roadRiskDelta;
  const simulatedRisk = Math.min(99, Math.max(12, Math.round(rawSimRisk)));
  const deltaRisk = simulatedRisk - baseRisk;

  // Safety Factor calculation (Inversely proportional)
  const simulatedFS = Number(
    Math.max(0.65, Math.min(2.4, baseFS - (deltaRisk / 100) * 0.8)).toFixed(2)
  );
  const deltaFS = Number((simulatedFS - baseFS).toFixed(2));

  const simulatedExposed = Math.max(80, baseExposed + exposedRoadPenalty + evacPenalty);
  const deltaExposed = simulatedExposed - baseExposed;

  let simulatedVerdict = '';
  let recommendedIntervention = '';

  if (simulatedRisk >= 85) {
    simulatedVerdict = 'CRITICAL FAILURE IMMINENT: Catastrophic slope rupture predicted within hours under heightened rainfall surcharge.';
    recommendedIntervention = 'Mandatory full-valley evacuation, complete highway barricade at both portals, and army air-evac staging.';
  } else if (simulatedRisk >= 65) {
    simulatedVerdict = 'HIGH HAZARD: Active creeping slope failure with impending road blockage and debris spillover.';
    recommendedIntervention = 'Enforce single-lane restricted traffic, clear toe debris, and deploy drone InSAR tracking.';
  } else if (simulatedRisk <= 55) {
    simulatedVerdict = 'STABILIZED / MITIGATED RISK: Engineered drainage channels effectively lower pore-water pressure and prevent shear plane failure.';
    recommendedIntervention = 'Maintain clear drainage outfalls and resume scheduled commercial transit under continuous monitoring.';
  } else {
    simulatedVerdict = 'MODERATE ELEVATED RISK: Slope remains sensitive to heavy showers; retain precautionary staging.';
    recommendedIntervention = 'Continue automated tilt-sensor alerts and prepare relief staging.';
  }

  return {
    baselineRiskScore: baseRisk,
    simulatedRiskScore: simulatedRisk,
    deltaRiskScore: deltaRisk,
    baselineSafetyFactor: baseFS,
    simulatedSafetyFactor: simulatedFS,
    deltaSafetyFactor: deltaFS,
    baselineExposedPeople: baseExposed,
    simulatedExposedPeople: simulatedExposed,
    deltaExposedPeople: deltaExposed,
    cascadeProbabilityPct: Math.min(95, Math.max(15, Math.round(simulatedRisk * 0.95))),
    simulatedVerdict,
    recommendedIntervention,
    comparisonChart: [
      { category: 'Risk Score (0-100)', baseline: baseRisk, simulated: simulatedRisk },
      { category: 'Safety Factor (x50)', baseline: Math.round(baseFS * 50), simulated: Math.round(simulatedFS * 50) },
      { category: 'Exposed Civilians (/50)', baseline: Math.round(baseExposed / 50), simulated: Math.round(simulatedExposed / 50) },
      { category: 'Cascade Prob %', baseline: 76, simulated: Math.min(95, Math.max(15, Math.round(simulatedRisk * 0.95))) },
    ],
  };
}
