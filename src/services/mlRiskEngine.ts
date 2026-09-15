import { SensorTelemetry, MLRiskAssessment, RiskStatus } from '../types/landslide';

/**
 * Conservative geotechnical risk engine.
 * Risk should increase when multiple independent indicators agree.
 * A dry/non-raining location must not become critical merely because humidity
 * or a static station parameter is high.
 */
export function evaluateLandslideRisk(
  telemetry: SensorTelemetry,
  slopeAngleDeg: number,
  soilType: string,
  vegetationCoverPct: number,
  faultDistanceKm: number
): MLRiskAssessment {
  const {
    temperatureC,
    soilMoisturePct,
    erosionRateMmPerYr,
    erosionLiveMmH,
    poreWaterPressureKpa,
    vibrationMmS,
    rainfallRateMmH,
    rainfall24hMm,
    displacementMm,
    tiltAngleDeg
  } = telemetry;

  let frictionAngle = 32;
  let soilCohesionKpa = 18;
  if (soilType.toLowerCase().includes('clay') || soilType.toLowerCase().includes('saprolite')) {
    frictionAngle = 24;
    soilCohesionKpa = 12;
  } else if (soilType.toLowerCase().includes('basalt') || soilType.toLowerCase().includes('granite')) {
    frictionAngle = 36;
    soilCohesionKpa = 26;
  } else if (soilType.toLowerCase().includes('sand') || soilType.toLowerCase().includes('scree')) {
    frictionAngle = 30;
    soilCohesionKpa = 5;
  }

  const rootCohesion = (vegetationCoverPct / 100) * 8;
  const effectiveCohesion = soilCohesionKpa + rootCohesion;
  const effectiveSlopeRad = ((slopeAngleDeg + Math.max(0, tiltAngleDeg)) * Math.PI) / 180;
  const sinBeta = Math.sin(effectiveSlopeRad);
  const cosBeta = Math.cos(effectiveSlopeRad);
  const tanPhi = Math.tan((frictionAngle * Math.PI) / 180);
  const depthZ = 2.0;
  const gammaSoil = 19.0;
  const totalNormalStress = gammaSoil * depthZ * Math.pow(cosBeta, 2);
  const effectiveNormalStress = Math.max(2, totalNormalStress - poreWaterPressureKpa);
  const shearResistance = effectiveCohesion + effectiveNormalStress * tanPhi;
  const shearDrivingStress = Math.max(1, gammaSoil * depthZ * sinBeta * cosBeta + (vibrationMmS * 1.5));
  const safetyFactorRaw = shearResistance / shearDrivingStress;
  const safetyFactor = Math.min(3.2, Math.max(0.65, Number(safetyFactorRaw.toFixed(2))));

  // Environmental scores use conservative thresholds.
  const moistureScore = Math.min(100, Math.max(0, (soilMoisturePct - 55) * 2.2));
  const porePressureScore = Math.min(100, Math.max(0, ((poreWaterPressureKpa - 18) / 32) * 100));
  const erosionScore = Math.min(100, Math.max(0,
    (Math.max(0, erosionRateMmPerYr - 10) / 25) * 35 +
    (Math.max(0, erosionLiveMmH - 2) / 6) * 65
  ));
  const rainScore = Math.min(100, Math.max(0,
    (Math.max(0, rainfallRateMmH - 2) / 28) * 55 +
    (Math.max(0, rainfall24hMm - 20) / 100) * 45
  ));
  const creepScore = Math.min(100, Math.max(0, displacementMm * 18 + Math.abs(tiltAngleDeg) * 12));
  const vibrationScore = Math.min(100, Math.max(0, ((vibrationMmS - 2) / 4) * 100));

  let tempFactor = 0;
  if (temperatureC < 2 && temperatureC > -4) tempFactor = 25;
  else if (temperatureC > 38) tempFactor = 15;

  let calculatedRisk = (
    moistureScore * 0.20 +
    porePressureScore * 0.23 +
    erosionScore * 0.12 +
    rainScore * 0.20 +
    creepScore * 0.15 +
    vibrationScore * 0.07 +
    tempFactor * 0.03
  );

  // Critical/high states require corroborating evidence.
  const activeRain = rainfallRateMmH >= 5 || rainfall24hMm >= 35;
  const heavyRain = rainfallRateMmH >= 20 || rainfall24hMm >= 80;
  const wetSoil = soilMoisturePct >= 70;
  const highPorePressure = poreWaterPressureKpa >= 30;
  const activeMovement = displacementMm >= 2.5 || Math.abs(tiltAngleDeg) >= 0.18;
  const strongMovement = displacementMm >= 5 || Math.abs(tiltAngleDeg) >= 0.35;
  const highVibration = vibrationMmS >= 4;
  const significantErosion = erosionLiveMmH >= 4;

  // Dry conditions get a strong safety floor unless there is direct ground movement.
  const dryAndStable = rainfallRateMmH < 2 && rainfall24hMm < 20 &&
    soilMoisturePct < 60 && poreWaterPressureKpa < 20 && !activeMovement;
  if (dryAndStable) calculatedRisk = Math.min(calculatedRisk, 22);

  // Require multiple independent warning signals for high/critical risk.
  const corroboratingSignals = [heavyRain, wetSoil, highPorePressure, activeMovement, highVibration, significantErosion]
    .filter(Boolean).length;

  if (heavyRain && wetSoil && highPorePressure && (activeMovement || significantErosion)) {
    calculatedRisk = Math.max(calculatedRisk, 82);
  } else if (corroboratingSignals >= 3 && activeRain) {
    calculatedRisk = Math.max(calculatedRisk, 62);
  } else if (activeRain && (wetSoil || highPorePressure)) {
    calculatedRisk = Math.max(calculatedRisk, 42);
  }

  // A stable, dry slope cannot become critical from the mathematical FS alone.
  if (!activeRain && !wetSoil && !highPorePressure && !activeMovement) {
    calculatedRisk = Math.min(calculatedRisk, 28);
  }

  const riskScore = Math.round(Math.min(99, Math.max(3, calculatedRisk)));

  let status: RiskStatus = 'safe';
  let failureProbabilityPct = Math.max(1, Math.round(riskScore * 0.12));
  let predictionWindow = 'SAFE: Stable conditions. Continue routine telemetry monitoring.';
  let recommendedAction = 'Safe zone. Routine telemetry monitoring.';

  // CRITICAL requires either severe direct movement/low FS with corroboration,
  // or the combined rain + saturation + pore pressure + movement evidence.
  const criticalEvidence =
    (heavyRain && wetSoil && highPorePressure && (activeMovement || strongMovement)) ||
    (safetyFactor < 0.95 && (activeMovement || highPorePressure || heavyRain));

  if (criticalEvidence && riskScore >= 75) {
    status = 'critical';
    failureProbabilityPct = Math.min(98, 72 + Math.round((riskScore - 75) * 0.9));
    predictionWindow = 'CRITICAL: Multiple independent instability indicators detected; immediate assessment required.';
    recommendedAction = 'IMMEDIATE EVACUATION REQUIRED. Close downslope transport routes and activate emergency procedures.';
  } else if ((corroboratingSignals >= 3 && riskScore >= 55) || (safetyFactor < 1.15 && activeRain)) {
    status = 'high';
    failureProbabilityPct = Math.min(75, 42 + Math.round(Math.max(0, riskScore - 55) * 0.9));
    predictionWindow = 'HIGH RISK: Multiple instability indicators developing; increase monitoring and prepare evacuation.';
    recommendedAction = 'Issue high-risk advisory. Prepare evacuation corridors and mobilize monitoring teams.';
  } else if (riskScore >= 30 || (activeRain && (wetSoil || highPorePressure))) {
    status = 'moderate';
    failureProbabilityPct = Math.min(45, 10 + Math.round(riskScore * 0.45));
    predictionWindow = 'MODERATE: Elevated environmental loading. Continue continuous rainfall and ground-motion monitoring.';
    recommendedAction = 'Yellow advisory. Inspect drainage and monitor rainfall, pore pressure and ground movement.';
  }

  const drivers: string[] = [];
  if (poreWaterPressureKpa > 30) drivers.push(`Pore Pressure (${poreWaterPressureKpa.toFixed(1)} kPa)`);
  if (erosionRateMmPerYr > 12 || erosionLiveMmH > 3) drivers.push(`Accelerated Erosion (${erosionRateMmPerYr.toFixed(1)} mm/yr)`);
  if (soilMoisturePct > 70) drivers.push(`High Soil Saturation (${soilMoisturePct.toFixed(0)}%)`);
  if (rainfall24hMm > 35) drivers.push(`Cumulative Rain (${rainfall24hMm.toFixed(0)} mm)`);
  if (displacementMm > 2.5) drivers.push(`Extensometer Creep (${displacementMm.toFixed(1)} mm)`);
  if (Math.abs(tiltAngleDeg) > 0.18) drivers.push(`Inclinometer Movement (${Math.abs(tiltAngleDeg).toFixed(2)}°)`);
  if (vibrationMmS > 4) drivers.push(`Micro-Seismic Vibration (${vibrationMmS.toFixed(2)} mm/s)`);

  // Deterministic model-quality indicator rather than a random fake confidence.
  const dataQuality = Math.round(Math.max(65, Math.min(98,
    70 + (activeRain ? 8 : 0) + (wetSoil ? 6 : 0) + (highPorePressure ? 6 : 0) + (activeMovement ? 5 : 0)
  )));

  return {
    riskScore,
    safetyFactor,
    status,
    isSafeZone: status === 'safe',
    failureProbabilityPct,
    mlConfidencePct: dataQuality,
    mlPredictionWindow: predictionWindow,
    primaryRiskDrivers: drivers.length > 0 ? drivers : ['None (Optimal Geotechnical Stability)'],
    recommendedAction,
    lastEvaluated: new Date().toISOString()
  };
}
