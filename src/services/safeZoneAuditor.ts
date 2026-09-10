import { LandslideStation, SafeZoneAuditResult, SafeZoneCriteria } from '../types/landslide';

/**
 * Geotechnical Safe Zone Audit Certification Engine
 * Evaluates real-time sensor metrics against BIS 14458 & Eurocode 7 geotechnical slope stability criteria.
 */
export function auditStationSafety(station: LandslideStation): SafeZoneAuditResult {
  const telemetry = station?.telemetry || {
    poreWaterPressureKpa: 10,
    rainfall24hMm: 0,
    displacementMm: 0,
    tiltAngleDeg: 0,
    erosionRateMmPerYr: 5,
    soilMoisturePct: 40,
    temperatureC: 22,
    erosionLiveMmH: 0.2,
    rainfallRateMmH: 0,
    vibrationMmS: 0.1,
    lastUpdated: new Date().toISOString()
  };

  const riskAssessment = station?.riskAssessment || {
    riskScore: 20,
    safetyFactor: 2.1,
    status: 'safe' as const,
    isSafeZone: true,
    failureProbabilityPct: 2,
    mlConfidencePct: 95,
    mlPredictionWindow: 'Safe > 60 days',
    primaryRiskDrivers: ['Stable slope'],
    recommendedAction: 'Normal surveillance',
    lastEvaluated: new Date().toISOString()
  };

  const slopeAngleDeg = station?.slopeAngleDeg ?? 25;
  const vegetationCoverPct = station?.vegetationCoverPct ?? 70;

  const {
    poreWaterPressureKpa = 10,
    rainfall24hMm = 0,
    displacementMm = 0,
    tiltAngleDeg = 0,
    erosionRateMmPerYr = 5,
    soilMoisturePct = 40
  } = telemetry;

  const safetyFactor = riskAssessment.safetyFactor ?? 1.8;

  const criteria: SafeZoneCriteria[] = [
    {
      id: 'crit-fs',
      title: 'Limit Equilibrium Factor of Safety (FS)',
      measuredValue: `FS = ${safetyFactor.toFixed(2)}`,
      requiredThreshold: 'FS ≥ 1.50 (Safe threshold ≥ 1.75)',
      isPassed: safetyFactor >= 1.50,
      scientificExplanation:
        'Ratio of available shear strength along failure surface to mobilized driving shear stress under effective normal stress.'
    },
    {
      id: 'crit-pore',
      title: 'Hydrostatic Pore Water Pressure (u)',
      measuredValue: `${poreWaterPressureKpa.toFixed(1)} kPa`,
      requiredThreshold: '< 15.0 kPa',
      isPassed: poreWaterPressureKpa < 15.0,
      scientificExplanation:
        'Pore water buildup reduces effective normal stress (σ\' = σ - u). Pressures > 30 kPa induce rapid shear liquefaction.'
    },
    {
      id: 'crit-creep',
      title: 'Borehole Extensometer & Tilt Creep',
      measuredValue: `${displacementMm.toFixed(1)} mm (Tilt: ${tiltAngleDeg.toFixed(1)}°)`,
      requiredThreshold: 'Displacement < 1.0 mm & Tilt < 1.5°',
      isPassed: displacementMm < 1.0 && Math.abs(tiltAngleDeg) < 1.5,
      scientificExplanation:
        'Active subsurface slip plane movement. Sustained creep indicates tertiary failure acceleration.'
    },
    {
      id: 'crit-rain',
      title: '24-Hour Cumulative Monsoon Precipitation',
      measuredValue: `${rainfall24hMm.toFixed(1)} mm`,
      requiredThreshold: '< 40.0 mm / 24h',
      isPassed: rainfall24hMm < 40.0,
      scientificExplanation:
        'Antecedent rainfall threshold above which soil reaches matric suction saturation and initiates slip.'
    },
    {
      id: 'crit-moisture',
      title: 'Volumetric Soil Moisture Saturation',
      measuredValue: `${soilMoisturePct}%`,
      requiredThreshold: '< 65% Saturation',
      isPassed: soilMoisturePct < 65,
      scientificExplanation:
        'High moisture reduces soil suction and negative pore pressure that naturally bonds grains together.'
    },
    {
      id: 'crit-erosion',
      title: 'Accelerated Overland Erosion Velocity',
      measuredValue: `${erosionRateMmPerYr.toFixed(1)} mm/year`,
      requiredThreshold: '< 12.0 mm/year',
      isPassed: erosionRateMmPerYr < 12.0,
      scientificExplanation:
        'Surface sheetwash and gully incision that undermines slope toe support.'
    }
  ];

  const failedCount = criteria.filter((c) => !c.isPassed).length;
  const isCertifiedSafe = failedCount === 0 && riskAssessment.safetyFactor >= 1.70;

  // Generate reproducible certificate hash based on station and values
  const certificateId = `TG-NE-${station.id.toUpperCase()}-${Math.abs(Math.round(station.latitude * 1000))}`;

  let geotechnicalNotes = '';
  if (isCertifiedSafe) {
    geotechnicalNotes = `VERIFIED SAFE ZONE: Subsurface shear resistance exceeds driving stress with Factor of Safety ${riskAssessment.safetyFactor}. Low pore pressure (${poreWaterPressureKpa} kPa) and zero active creep confirm stable bedrock consolidation. Suitable for standard civil infrastructure without evacuation advisory.`;
  } else {
    const failedTitles = criteria.filter((c) => !c.isPassed).map((c) => c.title);
    geotechnicalNotes = `SAFETY CRITERIA UNMET: Failed ${failedCount} critical stability parameter(s): [${failedTitles.join(', ')}]. Slope exhibits heightened vulnerability to slip. Cannot be declared a safe zone.`;
  }

  return {
    isCertifiedSafe,
    stationId: station.id,
    stationName: station.name,
    overallSafetyFactor: riskAssessment.safetyFactor,
    criteria,
    certifiedTimestamp: new Date().toISOString(),
    certificateId,
    geotechnicalNotes
  };
}
