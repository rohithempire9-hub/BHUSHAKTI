import {
  First10MinutesPlan,
  RiskContradictionResult,
  UnknownRiskZone,
  SensorPlacementRecommendation,
  DisasterChainBreakerModel,
  RiskHalfLifeModel,
  DemographicVulnerabilityZone,
  SatelliteTaskingPriorityZone,
  RainfallFingerprintAnalysis,
  SlopeWeaknessProfile,
  EvidenceFusionReport,
  RescueUnitDigitalTwin,
  PreventionMeasureROI,
  AiNoAlertEvaluation,
  CounterfactualScenarioComparison,
  AiResponseScoreEvaluation,
  EmergencyDecisionBoardItem,
  EvidenceTimelineEvent,
  DisasterDigitalMemoryProfile,
  IncidentComparisonReport,
  SeverityTrajectoryState,
  FieldVerificationTask,
  FieldReportTrustEvaluation,
  AiCommanderSynthesis,
  SixtySecondBrief,
  AiDecisionAuditRecord,
  DisasterLearningEvaluation
} from '../types/bhuShaktiIntelligenceExtended';
import { LandslideStation } from '../types/landslide';

// ============================================================================
// 1. FIRST 10 MINUTES RESPONSE PLANNER (Feature 6)
// ============================================================================
export function getFirst10MinutesPlan(zoneName: string = 'Tawang Sela Pass'): First10MinutesPlan {
  return {
    incidentId: 'INC-NER-2026-042',
    zoneName,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    overallTrigger: 'Hyper-saturation (94% soil moisture) + active 7.2mm extensometer creep',
    elapsedSeconds: 145, // 2m 25s
    isDemoActive: true,
    steps: [
      // 0 - 2 MINUTES
      {
        id: 'step-01',
        phase: '0-2_MIN',
        phaseTitle: 'Phase 1: Immediate Verification & Triage',
        timeRange: '0:00 - 0:45',
        title: 'Multi-Sensor Evidence Verification',
        action: 'Corroborate Inclinometer #TW-04 with Doppler rainfall (>45mm/h) and pore water pressure telemetry.',
        targetAgency: 'Geotechnical Monitoring Cell (GSI / SDMA)',
        status: 'COMPLETED',
        estimatedSeconds: 45,
        outputArtifact: 'Evidence Triangulation Hash #8B7A-OK'
      },
      {
        id: 'step-02',
        phase: '0-2_MIN',
        phaseTitle: 'Phase 1: Immediate Verification & Triage',
        timeRange: '0:45 - 1:30',
        title: 'Satellite & Ground Deformation Cross-Check',
        action: 'Query Sentinel-1 InSAR ascending pass (orbit 121) and live optical change detector for active scarp headwall displacement.',
        targetAgency: 'ISRO Disaster Management Support (NRSC)',
        status: 'COMPLETED',
        estimatedSeconds: 45,
        outputArtifact: 'InSAR Headwall Velocity: 14.2 mm/day'
      },
      {
        id: 'step-03',
        phase: '0-2_MIN',
        phaseTitle: 'Phase 1: Immediate Verification & Triage',
        timeRange: '1:30 - 2:00',
        title: 'Disaster Control Room Priority Alert',
        action: 'Transmit high-priority encrypted WebSocket & telemetry packets to District Disaster Emergency Operations Center (DEOC).',
        targetAgency: 'State Emergency Operations Centre (SEOC)',
        status: 'COMPLETED',
        estimatedSeconds: 30,
        outputArtifact: 'SEOC Acknowledgment ACK-9912'
      },
      // 2 - 5 MINUTES
      {
        id: 'step-04',
        phase: '2-5_MIN',
        phaseTitle: 'Phase 2: Asset Exposure & Ground Deployment',
        timeRange: '2:00 - 3:15',
        title: 'Identify Vulnerable Arteries & Lifeline Highways',
        action: 'Isolate affected highway sections: NH-13 KM 42 to 49 (Sela Tunnel approach) and Bhalukpong-Charduar link.',
        targetAgency: 'Border Roads Organisation (BRO Vartak)',
        status: 'IN_PROGRESS',
        estimatedSeconds: 75,
        outputArtifact: 'Road Blockade Threat Corridor: 4.8 km'
      },
      {
        id: 'step-05',
        phase: '2-5_MIN',
        phaseTitle: 'Phase 2: Asset Exposure & Ground Deployment',
        timeRange: '3:15 - 4:15',
        title: 'Demographic Triage of Downslope Settlements',
        action: 'Cross-reference GIS footprint with Village V04 (Sanglem, Pop: 1,240) and downstream tourist transit lodges.',
        targetAgency: 'District Revenue & Civil Defense',
        status: 'IN_PROGRESS',
        estimatedSeconds: 60,
        outputArtifact: 'High Risk Population Triage: 420 Residents'
      },
      {
        id: 'step-06',
        phase: '2-5_MIN',
        phaseTitle: 'Phase 2: Asset Exposure & Ground Deployment',
        timeRange: '4:15 - 5:00',
        title: 'Dispatch Quick Response Team (QRT) & Roadblock Advisory',
        action: 'Instruct Police Checkposts at Jaswant Garh and Sange to halt civilian vehicle ascent; dispatch SDRF Rapid Team R04.',
        targetAgency: 'Arunachal Police & SDRF 1st Coy',
        status: 'PENDING',
        estimatedSeconds: 45,
        outputArtifact: 'Checkpost Divert Order #DIR-042'
      },
      // 5 - 10 MINUTES
      {
        id: 'step-07',
        phase: '5-10_MIN',
        phaseTitle: 'Phase 3: Public Warning, Evac & Pre-positioning',
        timeRange: '5:00 - 6:30',
        title: 'Broadcast Geo-Fenced CAP & Multi-Lingual SMS Alerts',
        action: 'Trigger localized Cell Broadcast Channel 4370 & GSM SMS in English, Hindi, and Monpa to all handsets inside hazard polygon.',
        targetAgency: 'Telecom Operators / C-DOT CAP Subsystem',
        status: 'PENDING',
        estimatedSeconds: 90,
        outputArtifact: 'CAP Alert XML dispatched to 2,840 handsets'
      },
      {
        id: 'step-08',
        phase: '5-10_MIN',
        phaseTitle: 'Phase 3: Public Warning, Evac & Pre-positioning',
        timeRange: '6:30 - 8:15',
        title: 'Activate Safe Evacuation Corridors to Ridge Shelters',
        action: 'Direct community volunteers via LoRa mesh speakers towards Western Ridge Primary School & Monastery Grounds.',
        targetAgency: 'Village Disaster Management Committee (VDMC)',
        status: 'PENDING',
        estimatedSeconds: 105,
        outputArtifact: 'Safe Evac Corridor Route R-15 Active'
      },
      {
        id: 'step-09',
        phase: '5-10_MIN',
        phaseTitle: 'Phase 3: Public Warning, Evac & Pre-positioning',
        timeRange: '8:15 - 10:00',
        title: 'Pre-Position Heavy Excavators & Medical Relief',
        action: 'Stage JCB 3DX & CAT excavators at KM 38; alert Tawang District Hospital trauma ward and NDRF 12th Bn staging post.',
        targetAgency: 'BRO Engineers & National Disaster Response Force',
        status: 'PENDING',
        estimatedSeconds: 105,
        outputArtifact: '2 Excavators + 3 Ambulances Staged'
      }
    ]
  };
}

// ============================================================================
// 2. RISK CONTRADICTION DETECTOR (Feature 7 & 10)
// ============================================================================
export function detectRiskContradictions(
  rainfallVal: number = 88,
  soilMoistureVal: number = 92,
  slopeAngleVal: number = 38,
  satelliteMovementVal: number = 18,
  historicalRiskVal: number = 35
): RiskContradictionResult {
  const sources: any[] = [
    {
      sourceName: 'Rainfall',
      valueText: `${rainfallVal} mm/24h (Doppler & Gauges)`,
      riskIndication: rainfallVal > 70 ? 'VERY_HIGH' : rainfallVal > 40 ? 'HIGH' : 'LOW',
      confidenceWeightPct: 92,
      numericVal: rainfallVal,
      description: 'Precipitation exceeds antecedent trigger thresholds by 140%.'
    },
    {
      sourceName: 'Soil Moisture',
      valueText: `${soilMoistureVal}% VWC (FDR Sensor Mesh)`,
      riskIndication: soilMoistureVal > 85 ? 'VERY_HIGH' : soilMoistureVal > 70 ? 'HIGH' : 'LOW',
      confidenceWeightPct: 89,
      numericVal: soilMoistureVal,
      description: 'Pore matrix is in deep saturation; liquid limit approached.'
    },
    {
      sourceName: 'Slope Angle',
      valueText: `${slopeAngleVal}° (SRTM/ALOS 12.5m DEM)`,
      riskIndication: slopeAngleVal > 35 ? 'VERY_HIGH' : slopeAngleVal > 25 ? 'HIGH' : 'LOW',
      confidenceWeightPct: 95,
      numericVal: slopeAngleVal,
      description: 'Steep colluvial slope prone to translational planar sliding.'
    },
    {
      sourceName: 'Satellite Movement',
      valueText: `${satelliteMovementVal} mm/yr (Sentinel-1 InSAR)`,
      riskIndication: satelliteMovementVal < 25 ? 'LOW' : 'HIGH',
      confidenceWeightPct: 62,
      numericVal: satelliteMovementVal,
      description: 'Recent radar line-of-sight velocity shows low antecedent creep prior to rainfall.'
    },
    {
      sourceName: 'Historical Risk',
      valueText: `${historicalRiskVal}% Past Frequency (GSI Atlas)`,
      riskIndication: historicalRiskVal < 40 ? 'LOW' : 'HIGH',
      confidenceWeightPct: 80,
      numericVal: historicalRiskVal,
      description: 'Recorded sector has experienced only 1 moderate debris slide in past 15 years.'
    }
  ];

  // Disagreement analysis: Rainfall & Soil are HIGH, but Satellite and History are LOW
  const hasConflict = rainfallVal > 60 && soilMoistureVal > 75 && satelliteMovementVal < 30;

  const agreementScore = hasConflict ? 64 : 91;
  const confidenceScore = hasConflict ? 58 : 88;

  return {
    hasConflict,
    conflictHeadline: hasConflict
      ? '⚠️ CONFLICTING EVIDENCE DETECTED (HYDROLOGY VS SATELLITE RADAR)'
      : '✅ EVIDENCE SOURCES STRONGLY CONVERGENT',
    evidenceAgreementScorePct: agreementScore,
    predictionConfidencePct: confidenceScore,
    operationalStatus: hasConflict ? 'FIELD_VERIFICATION_REQUIRED' : 'HIGH_CONFIDENCE_HAZARD',
    explanation: hasConflict
      ? 'Rainfall (88mm) and soil moisture (92%) indicate acute slope destabilization, but Sentinel-1 InSAR baseline movement is weak (18mm/yr). The system does not blindly trigger full-scale false alarm evacuation without manual or acoustic field verification.'
      : 'All primary and secondary modalities (Doppler radar, InSAR deformation, soil dielectric moisture, and slope gradient) agree on high geotechnical failure probability.',
    evidenceSources: sources,
    agreementMatrix: [
      { sourceA: 'Rainfall', sourceB: 'Soil Moisture', correlationPct: 94, status: 'ALIGNED' },
      { sourceA: 'Rainfall', sourceB: 'Slope Angle', correlationPct: 88, status: 'ALIGNED' },
      { sourceA: 'Soil Moisture', sourceB: 'Satellite Radar', correlationPct: 41, status: 'CONFLICT' },
      { sourceA: 'Rainfall', sourceB: 'Historical Atlas', correlationPct: 48, status: 'DIVERGENT' },
      { sourceA: 'Ground Inclinometer', sourceB: 'Satellite Radar', correlationPct: 52, status: 'CONFLICT' }
    ]
  };
}

// ============================================================================
// 3. UNKNOWN RISK / DATA GAP MAP (Feature 8)
// ============================================================================
export const UNKNOWN_RISK_ZONES: UnknownRiskZone[] = [
  {
    id: 'GAP-ARU-01',
    zoneName: 'Upper Subansiri Gorge Corridor',
    state: 'Arunachal Pradesh',
    district: 'Upper Subansiri',
    category: 'UNKNOWN_RISK',
    coordinates: [28.182, 93.914],
    radiusKm: 14,
    reason: 'Cloud cover persistent across optical passes; steep gorge shadow creates radar InSAR decorrelation.',
    missingDataItems: ['Recent Sentinel-1 InSAR', 'Ground weather station within 35km', 'Subsurface lithology borehole data'],
    confidencePct: 38,
    recommendedAction: 'Immediate field reconnaissance team dispatch and airborne UAV LiDAR survey requested.',
    sensorDensityScore: 12
  },
  {
    id: 'GAP-MAN-02',
    zoneName: 'Tamenglong Western Ridge',
    state: 'Manipur',
    district: 'Tamenglong',
    category: 'DATA_GAP',
    coordinates: [24.985, 93.488],
    radiusKm: 11,
    reason: 'Cellular network blackhole prevents telemetry transmission from 2 community raingauges for >14 days.',
    missingDataItems: ['Real-time rainfall telemetry', 'Live pore pressure data', 'Citizen field reports'],
    confidencePct: 42,
    recommendedAction: 'Deploy LoRaWAN repeater or satellite Iridium backhaul to restore station telemetry.',
    sensorDensityScore: 8
  },
  {
    id: 'GAP-MEG-03',
    zoneName: 'South Garo Hills Escarpment',
    state: 'Meghalaya',
    district: 'South Garo Hills',
    category: 'UNKNOWN_RISK',
    coordinates: [25.295, 90.627],
    radiusKm: 9,
    reason: 'Heavy limestone karst terrain with unmapped subterranean conduits; surface runoff models unreliable.',
    missingDataItems: ['Subsurface hydrogeological map', 'Speleological water flow tracer', 'Ground acoustic tiltmeter'],
    confidencePct: 44,
    recommendedAction: 'Field verification required; classify as UNKNOWN rather than safe.',
    sensorDensityScore: 15
  },
  {
    id: 'GAP-SIK-04',
    zoneName: 'North Sikkim Chungthang Upper Slopes',
    state: 'Sikkim',
    district: 'Mangan',
    category: 'KNOWN_HIGH_RISK',
    coordinates: [27.604, 88.647],
    radiusKm: 8,
    reason: 'Glacial lake outburst (GLOF) residual moraine instability with steep 48° weathered granite slope.',
    missingDataItems: ['Permanent GNSS station (destroyed in 2023 flood)'],
    confidencePct: 88,
    recommendedAction: 'Continuous drone monitoring and strict road closure during precipitation > 20mm/h.',
    sensorDensityScore: 65
  },
  {
    id: 'GAP-ASS-05',
    zoneName: 'Dima Hasao Haflong Hill Cut',
    state: 'Assam',
    district: 'Dima Hasao',
    category: 'KNOWN_MODERATE_RISK',
    coordinates: [25.168, 93.024],
    radiusKm: 12,
    reason: 'Railway cutting slope stabilized with gabions, but high clay content expands when saturated.',
    missingDataItems: ['Toe pore water pressure sensors'],
    confidencePct: 76,
    recommendedAction: 'Visual inspection of weep holes and drainage discharge rates.',
    sensorDensityScore: 58
  }
];

// ============================================================================
// 4. SENSOR PLACEMENT OPTIMIZER (Feature 9)
// ============================================================================
export const RECOMMENDED_SENSOR_LOCATIONS: SensorPlacementRecommendation[] = [
  {
    id: 'REC-SNS-01',
    locationName: 'Sela Tunnel South Portal (NH-13)',
    state: 'Arunachal Pradesh',
    coordinates: [27.498, 92.112],
    priorityScore: 94,
    coverageGainPct: 34,
    recommendedSensorTypes: ['Inclinometer', 'Tilt Sensor', 'Soil Moisture Sensor', 'Rain Gauge'],
    primaryReason: 'High historical landslide frequency intersecting national strategic defense and tourism artery.',
    factors: {
      historicalFrequency: 92,
      rainfallExposure: 88,
      soilMoistureRisk: 90,
      slopeSteepness: 94,
      populationProtected: 82,
      roadCriticality: 98,
      existingUncertainty: 78
    },
    expectedCoverageImprovement: 'Increases regional early-warning lead time from 18 min to 3.5 hours for 18km corridor.',
    estimatedHardwareCostInr: '₹6.8 Lakhs (Solar LoRa Package)'
  },
  {
    id: 'REC-SNS-02',
    locationName: 'Haflong Railway Cutting KM 118',
    state: 'Assam',
    coordinates: [25.152, 93.018],
    priorityScore: 89,
    coverageGainPct: 27,
    recommendedSensorTypes: ['Tilt Sensor', 'GNSS', 'Rain Gauge', 'Soil Moisture Sensor'],
    primaryReason: 'Colluvial slope failure directly halts Lumding-Badarpur railway line, cutting off Barak Valley.',
    factors: {
      historicalFrequency: 86,
      rainfallExposure: 84,
      soilMoistureRisk: 88,
      slopeSteepness: 82,
      populationProtected: 95,
      roadCriticality: 92,
      existingUncertainty: 72
    },
    expectedCoverageImprovement: 'Reduces blind spot on southern railway bank; protects 14,000 daily commuters.',
    estimatedHardwareCostInr: '₹5.4 Lakhs'
  },
  {
    id: 'REC-SNS-03',
    locationName: 'Dzükou Valley Gateway (Viswema Ridge)',
    state: 'Nagaland',
    coordinates: [25.568, 94.124],
    priorityScore: 81,
    coverageGainPct: 22,
    recommendedSensorTypes: ['Rain Gauge', 'Soil Moisture Sensor', 'Water-Level Sensor'],
    primaryReason: 'Flash flood and mudflow funnel leading into dense rural agrarian settlements downslope.',
    factors: {
      historicalFrequency: 74,
      rainfallExposure: 90,
      soilMoistureRisk: 82,
      slopeSteepness: 78,
      populationProtected: 76,
      roadCriticality: 70,
      existingUncertainty: 84
    },
    expectedCoverageImprovement: 'Fills 28km meteorological data void in Kohima-Phek border transition.',
    estimatedHardwareCostInr: '₹4.2 Lakhs'
  },
  {
    id: 'REC-SNS-04',
    locationName: 'Champhai Indo-Myanmar Highway Fault',
    state: 'Mizoram',
    coordinates: [23.475, 93.328],
    priorityScore: 78,
    coverageGainPct: 19,
    recommendedSensorTypes: ['GNSS', 'Inclinometer', 'Tilt Sensor'],
    primaryReason: 'Tectonic active shear zone with recurring deep-seated creep threatening international border trade route.',
    factors: {
      historicalFrequency: 80,
      rainfallExposure: 72,
      soilMoistureRisk: 75,
      slopeSteepness: 76,
      populationProtected: 68,
      roadCriticality: 85,
      existingUncertainty: 80
    },
    expectedCoverageImprovement: 'Continuous sub-centimeter deformation tracking replaces biannual manual surveys.',
    estimatedHardwareCostInr: '₹8.5 Lakhs'
  }
];

// ============================================================================
// 5. DISASTER CHAIN BREAKER (Feature 11)
// ============================================================================
export function getDisasterChainBreakerModel(activeInterventionIds: string[] = []): DisasterChainBreakerModel {
  const initialRisk = 86;
  let riskReductionTotal = 0;
  let exposureReductionTotal = 0;

  const rawLinks: any[] = [
    {
      id: 'chain-01',
      order: 1,
      stageName: '1. Heavy Orographic Rainfall',
      description: 'Monsoon cloudburst delivers 145mm rainfall in 6 hours over saturated colluvial slopes.',
      intervention: {
        id: 'int-drainage',
        name: 'Clear Drainage & Deploy Siphon Tubes',
        type: 'drainage',
        estimatedRiskReductionPct: 18,
        estimatedExposureReductionPct: 8,
        costLakhs: 2.2,
        timeRequiredHours: 1.5,
        operationalDifficulty: 'LOW',
      }
    },
    {
      id: 'chain-02',
      order: 2,
      stageName: '2. Deep Soil Pore Saturation',
      description: 'Pore water pressure exceeds 65 kPa, dissolving effective shear strength across sliding plane.',
      intervention: {
        id: 'int-field-inspect',
        name: 'Urgent Hydro-Piezometer Inspection',
        type: 'field_inspection',
        estimatedRiskReductionPct: 11,
        estimatedExposureReductionPct: 5,
        costLakhs: 0.8,
        timeRequiredHours: 1.0,
        operationalDifficulty: 'LOW',
      }
    },
    {
      id: 'chain-03',
      order: 3,
      stageName: '3. Slope Shear Slip Mobilization',
      description: 'Mass movement of 12,000 m³ weathered mica-schist initiates downslope acceleration.',
      intervention: {
        id: 'int-road-closure',
        name: 'Preemptive Lifeline Road Closure',
        type: 'road_closure',
        estimatedRiskReductionPct: 27,
        estimatedExposureReductionPct: 34,
        costLakhs: 1.5,
        timeRequiredHours: 0.5,
        operationalDifficulty: 'LOW',
      }
    },
    {
      id: 'chain-04',
      order: 4,
      stageName: '4. Arterial Highway Severed',
      description: 'Debris fan covers 180m of NH-13 road surface; vehicular movement paralyzed.',
      intervention: {
        id: 'int-route-diversion',
        name: 'Activate Alternative Bypass Route R-15',
        type: 'route_diversion',
        estimatedRiskReductionPct: 14,
        estimatedExposureReductionPct: 22,
        costLakhs: 3.0,
        timeRequiredHours: 2.0,
        operationalDifficulty: 'MEDIUM',
      }
    },
    {
      id: 'chain-05',
      order: 5,
      stageName: '5. Village Isolation & Essential Cutoff',
      description: 'Village V04 (Sanglem) cut off from medical and food resupply lines.',
      intervention: {
        id: 'int-evacuation',
        name: 'Pre-Staging Village Evacuation & Relief',
        type: 'evacuation',
        estimatedRiskReductionPct: 20,
        estimatedExposureReductionPct: 31,
        costLakhs: 4.5,
        timeRequiredHours: 3.0,
        operationalDifficulty: 'MEDIUM',
      }
    },
    {
      id: 'chain-06',
      order: 6,
      stageName: '6. Critical Medical & Emergency Delay',
      description: 'Ambulance travel time increases from 25 min to >4.5 hours with casualty risks.',
      intervention: {
        id: 'int-resource-staging',
        name: 'Pre-Position NDRF Squad & Medical Unit',
        type: 'resource_staging',
        estimatedRiskReductionPct: 15,
        estimatedExposureReductionPct: 25,
        costLakhs: 3.8,
        timeRequiredHours: 1.0,
        operationalDifficulty: 'HIGH',
      }
    }
  ];

  const safeActiveIds = Array.isArray(activeInterventionIds) ? activeInterventionIds : [];
  const processedLinks = rawLinks.map((item) => {
    const isApplied = safeActiveIds.includes(item.intervention.id);
    if (isApplied) {
      riskReductionTotal += item.intervention.estimatedRiskReductionPct;
      exposureReductionTotal += item.intervention.estimatedExposureReductionPct;
    }
    return {
      id: item.id,
      order: item.order,
      stageName: item.stageName,
      description: item.description,
      isBroken: isApplied,
      availableIntervention: {
        ...item.intervention,
        isApplied
      }
    };
  });

  const cappedRiskReduction = Math.min(68, riskReductionTotal);
  const currentRisk = Math.max(18, initialRisk - cappedRiskReduction);

  return {
    hazardEvent: 'Tawang-Sela Pass Landslide & Highway NH-13 Severance Cascade',
    chainLinks: processedLinks,
    baselineRiskScore: initialRisk,
    currentRiskScore: currentRisk,
    totalRiskReductionPct: cappedRiskReduction,
    totalExposureReductionPct: Math.min(85, exposureReductionTotal),
    recommendedBestIntervention: '1st Priority: Clear drainage channels (-18% risk at lowest cost), followed immediately by Road Closure (-27% exposure reduction).'
  };
}

// ============================================================================
// 6. RISK HALF-LIFE / RECOVERY (Feature 12)
// ============================================================================
export function calculateRiskHalfLife(
  initialRisk: number = 86,
  interventionsApplied: any = ['drainage', 'rain_stopped']
): RiskHalfLifeModel {
  // Normalize interventions to always be an array of strings
  const safeInterventions: string[] = Array.isArray(interventionsApplied)
    ? interventionsApplied.map(String)
    : typeof interventionsApplied === 'string'
    ? [interventionsApplied]
    : ['drainage', 'rain_stopped'];

  const hasDrainage = safeInterventions.includes('drainage');
  const rainStopped = safeInterventions.includes('rain_stopped');
  const hasRoadClosed = safeInterventions.includes('road_closed');

  let decayRate = 0.12; // baseline slow dissipation
  if (rainStopped) decayRate += 0.16;
  if (hasDrainage) decayRate += 0.22;
  if (hasRoadClosed) decayRate += 0.08;

  const halfLifeHours = Number((Math.log(2) / decayRate).toFixed(1));
  const timeToSafeHours = Number(((initialRisk - 35) / (decayRate * 22)).toFixed(1));

  const hoursSeries = [0, 2, 4, 8, 12, 18, 24, 36, 48];
  const decayTrajectory = hoursSeries.map((hrs) => {
    let modeled = initialRisk * Math.exp(-decayRate * (hrs / 3.5));
    if (hrs === 0) modeled = initialRisk;
    if (modeled < 24) modeled = 24;
    return {
      hoursElapsed: hrs,
      modeledRisk: Math.round(modeled),
      label: `T+${hrs}h`,
      stage: hrs === 0 ? 'Initial Trigger' : hrs < 8 ? 'Acute Creep' : hrs < 24 ? 'Pore Dissipation' : 'Slope Stabilization'
    };
  });

  const currentRisk = decayTrajectory[1].modeledRisk;
  const projectedRisk = decayTrajectory[4].modeledRisk;

  return {
    initialRisk,
    currentRisk,
    projectedRisk,
    halfLifeHours,
    timeToSafeHours: Math.max(8, timeToSafeHours),
    activeInterventions: interventionsApplied,
    rainfallStatus: rainStopped ? 'STOPPED' : 'CONTINUING',
    decayTrajectory,
    safeHighwayReopenWindow: 'T+14 Hours (Tomorrow 06:00 IST)',
    drainageRateMmPerHour: 8.5
  };
}

// ============================================================================
// 7. VULNERABLE POPULATION INTELLIGENCE (Feature 13)
// ============================================================================
export const VULNERABLE_POPULATION_ZONES: DemographicVulnerabilityZone[] = [
  {
    zoneId: 'VIL-01',
    villageName: 'Sanglem Village (V04)',
    district: 'Tawang',
    totalPopulation: 1240,
    childrenCount: 310,
    elderlyCount: 225,
    schoolsCount: 2,
    hospitalsCount: 1,
    touristExposureCount: 120,
    remoteHouseholdCount: 42,
    criticalInfrastructureDetails: ['11kV Transformer Substation', 'Sanglem Stream Culvert', 'PHC Dispensary'],
    exposureScore: 92,
    evacuationPriority: 'CRITICAL',
    evacuationPriorityRank: 1,
    recommendedEvacShelter: 'Tawang Monastery Upper Ridge Hall (Cap: 1,500)',
    accessRoadStatus: 'VULNERABLE'
  },
  {
    zoneId: 'VIL-02',
    villageName: 'Jaswant Garh Hamlet',
    district: 'Tawang',
    totalPopulation: 460,
    childrenCount: 88,
    elderlyCount: 74,
    schoolsCount: 1,
    hospitalsCount: 0,
    touristExposureCount: 340, // Highway memorial tourists
    remoteHouseholdCount: 18,
    criticalInfrastructureDetails: ['NH-13 Petrol Depot', 'BRO Equipment Yard'],
    exposureScore: 84,
    evacuationPriority: 'HIGH',
    evacuationPriorityRank: 2,
    recommendedEvacShelter: 'Army Transit Camp Shelter #4',
    accessRoadStatus: 'BLOCKED'
  },
  {
    zoneId: 'VIL-03',
    villageName: 'Lower Bhalukpong Settlement',
    district: 'West Kameng',
    totalPopulation: 2850,
    childrenCount: 680,
    elderlyCount: 410,
    schoolsCount: 4,
    hospitalsCount: 2,
    touristExposureCount: 180,
    remoteHouseholdCount: 65,
    criticalInfrastructureDetails: ['Kameng River Embankment', 'Sub-divisional Hospital'],
    exposureScore: 78,
    evacuationPriority: 'HIGH',
    evacuationPriorityRank: 3,
    recommendedEvacShelter: 'Higher Secondary School Complex',
    accessRoadStatus: 'OPEN'
  },
  {
    zoneId: 'VIL-04',
    villageName: 'Lumla Foothills Ward 2',
    district: 'Tawang',
    totalPopulation: 980,
    childrenCount: 210,
    elderlyCount: 180,
    schoolsCount: 1,
    hospitalsCount: 0,
    touristExposureCount: 45,
    remoteHouseholdCount: 30,
    criticalInfrastructureDetails: ['Potable Water Chlorination Plant'],
    exposureScore: 68,
    evacuationPriority: 'MODERATE',
    evacuationPriorityRank: 4,
    recommendedEvacShelter: 'Community Cultural Hall Lumla',
    accessRoadStatus: 'OPEN'
  }
];

// ============================================================================
// 8. SATELLITE OBSERVATION PRIORITY (Feature 14)
// ============================================================================
export const SATELLITE_TASKING_PRIORITY: SatelliteTaskingPriorityZone[] = [
  {
    zoneId: 'SAT-TWN-042',
    zoneName: 'Tawang Sela Pass Scarp Zone',
    coordinates: [27.502, 92.105],
    riskScore: 84,
    confidencePct: 61,
    escalationVelocity: 'RAPID',
    dataUncertaintyPct: 42,
    recentRainfall24hMm: 125,
    lastOpticalPassDate: '6 days ago (Sentinel-2 cloud obstructed)',
    lastSarPassDate: '48h ago (Sentinel-1 descending)',
    priorityRank: 'VERY_HIGH',
    recommendedSensorPayload: 'Sentinel-1 InSAR',
    recommendationDirective: 'Task upcoming ascending track SAR pass immediately to determine interferometric line-of-sight scarp slip.'
  },
  {
    zoneId: 'SAT-DIM-018',
    zoneName: 'Dima Hasao Hill Slopes',
    coordinates: [25.174, 93.032],
    riskScore: 78,
    confidencePct: 68,
    escalationVelocity: 'STEADY',
    dataUncertaintyPct: 35,
    recentRainfall24hMm: 95,
    lastOpticalPassDate: '3 days ago',
    lastSarPassDate: '24h ago',
    priorityRank: 'HIGH',
    recommendedSensorPayload: 'RISAT-1A SAR',
    recommendationDirective: 'Request emergency C-band polarimetric imaging through NRSC for soil dielectric wetness mapping.'
  },
  {
    zoneId: 'SAT-SIK-009',
    zoneName: 'Lachen-Lachung Valley Cut',
    coordinates: [27.725, 88.552],
    riskScore: 72,
    confidencePct: 64,
    escalationVelocity: 'STEADY',
    dataUncertaintyPct: 38,
    recentRainfall24hMm: 74,
    lastOpticalPassDate: '4 days ago',
    lastSarPassDate: '36h ago',
    priorityRank: 'HIGH',
    recommendedSensorPayload: 'Cartosat-3 High-Res',
    recommendationDirective: 'Acquire 0.28m stereo imagery for post-monsoon DEM differential extraction.'
  }
];

// ============================================================================
// 9. RAINFALL TRIGGER FINGERPRINT (Feature 15)
// ============================================================================
export function analyzeRainfallFingerprint(station?: LandslideStation | null): RainfallFingerprintAnalysis {
  const rain24 = station?.telemetry?.rainfall24hMm || 88;
  const rate = station?.telemetry?.rainfallRateMmH || 18;

  const intervals = {
    '1h': rate,
    '3h': Math.round(rate * 2.6),
    '6h': Math.round(rate * 4.8),
    '12h': Math.round(rain24 * 0.65),
    '24h': rain24,
    '3d': Math.round(rain24 * 1.85),
    '7d': Math.round(rain24 * 3.4)
  };

  const chartSeries = [
    { interval: '1 Hour', currentMm: intervals['1h'], historicalDisasterMm: 22, thresholdMm: 15 },
    { interval: '3 Hours', currentMm: intervals['3h'], historicalDisasterMm: 55, thresholdMm: 40 },
    { interval: '6 Hours', currentMm: intervals['6h'], historicalDisasterMm: 95, thresholdMm: 70 },
    { interval: '12 Hours', currentMm: intervals['12h'], historicalDisasterMm: 130, thresholdMm: 100 },
    { interval: '24 Hours', currentMm: intervals['24h'], historicalDisasterMm: 165, thresholdMm: 120 },
    { interval: '3 Days', currentMm: intervals['3d'], historicalDisasterMm: 290, thresholdMm: 220 },
    { interval: '7 Days', currentMm: intervals['7d'], historicalDisasterMm: 440, thresholdMm: 350 }
  ];

  const similarity = 87; // 87% fingerprint match
  return {
    stationId: station?.id || 'tawang-pass-01',
    stationName: station?.name || 'Tawang Sela Pass',
    rainfallIntervals: intervals,
    intensityClassification: rate > 35 ? 'EXTREME_CLOUDBURST' : rate > 15 ? 'HEAVY' : 'MODERATE',
    antecedentPrecipitationIndex: Math.round(intervals['7d'] * 0.82),
    criticalThresholdMm: 120,
    similarityToDisasterPatternPct: similarity,
    matchedHistoricalDisaster: 'July 2020 Sela Colluvial Catastrophic Debris Avalanche',
    diagnosticMessage: `Current rainfall acceleration (1h: ${intervals['1h']}mm, 24h: ${intervals['24h']}mm, 7d API: ${intervals['7d']}mm) demonstrates an ${similarity}% statistical match to hydro-meteorological signatures immediately preceding major Northeast Himalayan slope failures. Note: Modeled pattern correlation does not guarantee instant slope failure without verified structural shear deformation.`,
    chartSeries,
    isTriggerBreached: true,
    currentRainfallMmH: intervals['1h'],
    antecedentRainfall3dMm: intervals['3d'],
    cumulative7dMm: intervals['7d'],
    saturationIndexPct: similarity
  };
}

// ============================================================================
// 10. SLOPE WEAKNESS INDEX (Feature 16)
// ============================================================================
export function calculateSlopeWeaknessIndex(station?: LandslideStation | null): SlopeWeaknessProfile {
  const slopeDeg = station?.slopeAngleDeg || 37;
  const soilMoisture = station?.telemetry?.soilMoisturePct || 84;
  const displacement = station?.telemetry?.displacementMm || 4.2;

  // Mohr-Coulomb Factor of Safety approximation
  const phiPrime = 32; // internal friction angle
  const cPrime = 18; // cohesion kPa
  const gamma = 19; // soil unit weight kN/m3
  const z = 2.5; // shear surface depth m
  const u = (soilMoisture / 100) * 45; // pore pressure kPa

  const normalStress = gamma * z * Math.pow(Math.cos((slopeDeg * Math.PI) / 180), 2);
  const shearStress = gamma * z * Math.sin((slopeDeg * Math.PI) / 180) * Math.cos((slopeDeg * Math.PI) / 180);
  const effectiveNormalStress = Math.max(1, normalStress - u);
  const shearStrength = cPrime + effectiveNormalStress * Math.tan((phiPrime * Math.PI) / 180);
  const fos = Number((shearStrength / Math.max(1, shearStress)).toFixed(2));

  let stabilityIndex: any = 'STABLE';
  let fillColor = '#10b981';
  let score = 24;

  if (fos < 1.05 || (slopeDeg > 35 && soilMoisture > 82)) {
    stabilityIndex = 'CRITICAL';
    fillColor = '#ef4444';
    score = 92;
  } else if (fos < 1.25 || soilMoisture > 75) {
    stabilityIndex = 'WEAK';
    fillColor = '#f97316';
    score = 74;
  } else if (fos < 1.45) {
    stabilityIndex = 'WATCH';
    fillColor = '#eab308';
    score = 48;
  }

  return {
    stationId: station?.id || 'tawang-pass-01',
    stationName: station?.name || 'Tawang Sela Pass',
    coordinates: [station?.latitude || 27.502, station?.longitude || 92.105],
    slopeAngleDeg: slopeDeg,
    soilWetnessPct: soilMoisture,
    groundMovementDetected: displacement > 1.0,
    groundMovementRateMmPerDay: Number((displacement * 0.8).toFixed(1)),
    historicalRiskRating: 'High',
    terrainCurvature: 'Concave (Water-accumulating)',
    stabilityIndex,
    stabilityScore: score,
    shearStressRatio: Number((shearStress / shearStrength).toFixed(2)),
    factorOfSafety: fos,
    gisFillColor: fillColor,
    failureLikelihood: stabilityIndex === 'CRITICAL' ? 'IMMINENT FAILURE' : 'ELEVATED SLIP RISK',
    geologicalFormation: 'Weathered Mica-Schist & Colluvium',
    slopeAngleDegrees: slopeDeg,
    cohesionKpa: cPrime,
    internalFrictionAngleDeg: phiPrime,
    poreWaterPressureKpa: Math.round(u),
    saturationRatioPct: soilMoisture
  };
}

// ============================================================================
// 11. AI EVIDENCE FUSION (8 Sources) (Feature 17)
// ============================================================================
export function getEvidenceFusionReport(station?: LandslideStation | null): EvidenceFusionReport {
  const sources: any[] = [
    {
      id: 'src-1',
      sourceType: 'Satellite InSAR',
      iconName: 'Satellite',
      status: 'ACTIVE_ELEVATED',
      freshness: '48h ago (Sentinel-1 LOS)',
      weightPct: 20,
      confidenceScore: 84,
      findingSummary: 'Ground velocity accelerated to 16.4 mm/year over upper scarp line.',
      supportsElevatedRisk: true
    },
    {
      id: 'src-2',
      sourceType: 'Weather Doppler & Rain',
      iconName: 'CloudRain',
      status: 'ACTIVE_ELEVATED',
      freshness: '5 mins ago (IMD Sohra Radar)',
      weightPct: 20,
      confidenceScore: 94,
      findingSummary: '24h accumulation: 88.4mm; persistent cloudburst cell overhead.',
      supportsElevatedRisk: true
    },
    {
      id: 'src-3',
      sourceType: 'Soil Hydrology',
      iconName: 'Droplets',
      status: 'ACTIVE_ELEVATED',
      freshness: 'Real-time LoRa Node',
      weightPct: 15,
      confidenceScore: 92,
      findingSummary: 'Volumetric water content reached 84.6%; matric suction near 0 kPa.',
      supportsElevatedRisk: true
    },
    {
      id: 'src-4',
      sourceType: 'Terrain & DEM',
      iconName: 'Mountain',
      status: 'ACTIVE_ELEVATED',
      freshness: 'Static 12.5m ALOS DEM',
      weightPct: 10,
      confidenceScore: 98,
      findingSummary: '37° slope angle with concave drainage concavity amplifying runoff focus.',
      supportsElevatedRisk: true
    },
    {
      id: 'src-5',
      sourceType: 'GIS Infrastructure',
      iconName: 'Map',
      status: 'ACTIVE_ELEVATED',
      freshness: 'Updated Today',
      weightPct: 10,
      confidenceScore: 90,
      findingSummary: 'Lifeline National Highway NH-13 spans downslope toe directly in runout fan.',
      supportsElevatedRisk: true
    },
    {
      id: 'src-6',
      sourceType: 'Historical Memory',
      iconName: 'Clock',
      status: 'ACTIVE_ELEVATED',
      freshness: 'Archive 2012-2025',
      weightPct: 10,
      confidenceScore: 86,
      findingSummary: '4 previous failure events triggered under identical rainfall thresholds.',
      supportsElevatedRisk: true
    },
    {
      id: 'src-7',
      sourceType: 'Crowdsourced Field Reports',
      iconName: 'Users',
      status: 'ACTIVE_ELEVATED',
      freshness: '32 mins ago',
      weightPct: 8,
      confidenceScore: 88,
      findingSummary: 'Verified citizen report: tension cracks 12cm wide crossing shoulder of NH-13.',
      supportsElevatedRisk: true
    },
    {
      id: 'src-8',
      sourceType: 'Ground Sensor Mesh',
      iconName: 'Radio',
      status: 'ACTIVE_NORMAL',
      freshness: '12 mins ago',
      weightPct: 7,
      confidenceScore: 82,
      findingSummary: 'Micro-vibration geophone baseline steady at 0.4 mm/s; tilt stable.',
      supportsElevatedRisk: false
    }
  ];

  const supportingCount = sources.filter((s) => s.supportsElevatedRisk).length;
  const agreementPct = Math.round((supportingCount / sources.length) * 100); // 7/8 = 88-91%

  return {
    stationId: station?.id || 'tawang-pass-01',
    stationName: station?.name || 'Tawang Sela Pass',
    sourcesSupportingElevatedRisk: supportingCount,
    totalAvailableSources: sources.length,
    evidenceAgreementPct: 91,
    aiConfidencePct: 88,
    sources,
    fusionVerdict: '7 of 8 independent multi-modal observation streams converge on critical slope instability.'
  };
}

// ============================================================================
// 12. RESCUE TEAM DIGITAL TWIN & DYNAMIC REROUTING (Feature 18)
// ============================================================================
export const RESCUE_UNITS_DIGITAL_TWIN: RescueUnitDigitalTwin[] = [
  {
    id: 'UNIT-R04',
    callsign: 'NDRF Quick Response Team R-04',
    unitType: 'Rescue Team (NDRF)',
    currentLocation: [27.535, 92.082],
    destinationName: 'Village V04 (Sanglem)',
    destinationCoords: [27.485, 92.115],
    originalRouteName: 'NH-13 Direct Arterial',
    isOriginalRouteBlocked: true,
    alternateRouteName: 'R-15 Western Ridge Bypass',
    additionalDistanceKm: 3.2,
    status: 'REROUTING',
    personnelCount: 18,
    specializedGear: 'Victim Locators, Hydraulic Cutters, Inflatable Boats, VHF Radio',
    aiRouteRecommendation: 'CRITICAL ALERT: Original route blocked by debris slip at KM 44. Divert unit immediately via Route R-15 (+3.2 km, +11 mins ETA).'
  },
  {
    id: 'UNIT-AMB-02',
    callsign: 'Advanced Life Support Ambulance AL-02',
    unitType: 'Ambulance',
    currentLocation: [27.585, 91.865],
    destinationName: 'Sela Emergency Triage Shelter',
    destinationCoords: [27.502, 92.105],
    originalRouteName: 'NH-13 South Corridor',
    isOriginalRouteBlocked: false,
    status: 'EN_ROUTE',
    personnelCount: 4,
    specializedGear: 'Portable Ventilator, Defibrillator, Trauma Surgical Kits',
    aiRouteRecommendation: 'Proceed on primary corridor with caution; highway clear up to KM 41.'
  },
  {
    id: 'UNIT-EXC-01',
    callsign: 'BRO Heavy Excavator CAT-320D',
    unitType: 'Heavy Excavator',
    currentLocation: [27.518, 92.095],
    destinationName: 'NH-13 Debris Choke Point KM 44',
    destinationCoords: [27.498, 92.108],
    originalRouteName: 'Service Track 4B',
    isOriginalRouteBlocked: false,
    status: 'ON_SITE',
    personnelCount: 3,
    specializedGear: 'Hydraulic Breaker, 1.2m³ Rock Bucket',
    aiRouteRecommendation: 'Stationed at active slip; commence clearing from upstream lateral bench.'
  },
  {
    id: 'UNIT-MED-03',
    callsign: 'State Disaster Medical Squad SM-03',
    unitType: 'Medical Squad',
    currentLocation: [27.562, 92.012],
    destinationName: 'Village V04 Health Center',
    destinationCoords: [27.485, 92.115],
    originalRouteName: 'Monastery Access Road',
    isOriginalRouteBlocked: false,
    status: 'EN_ROUTE',
    personnelCount: 8,
    specializedGear: 'Triage Tents, Blood Plasma, Water Purification Packs',
    aiRouteRecommendation: 'Pre-position at Western Ridge Primary School to receive evacuees.'
  }
];

// ============================================================================
// 13. PREVENTION ROI SIMULATOR (Feature 19)
// ============================================================================
export const PREVENTION_ROI_MEASURES: PreventionMeasureROI[] = [
  {
    id: 'roi-01',
    measureName: 'Sub-horizontal Perforated Wick Drains (Toe Pore Relief)',
    estimatedCostLakhsInr: 2.2,
    modeledRiskReductionPct: 24,
    modeledExposureReductionPct: 18,
    implementationTimeDays: 4,
    efficiencyRatio: 10.9,
    recommendationRating: 'HIGHEST_EFFICIENCY',
    notes: 'Relieves pore pressure at critical shear interface; maximum risk reduction per rupee invested.'
  },
  {
    id: 'roi-02',
    measureName: 'Preemptive Concrete Barricades & Road Diversion Gates',
    estimatedCostLakhsInr: 1.5,
    modeledRiskReductionPct: 15,
    modeledExposureReductionPct: 35,
    implementationTimeDays: 1,
    efficiencyRatio: 10.0,
    recommendationRating: 'HIGHEST_EFFICIENCY',
    notes: 'Extremely high civilian exposure reduction with minimal initial capital outlay.'
  },
  {
    id: 'roi-03',
    measureName: 'Autonomous LoRa Sensor & Early Siren Station',
    estimatedCostLakhsInr: 4.0,
    modeledRiskReductionPct: 21,
    modeledExposureReductionPct: 28,
    implementationTimeDays: 2,
    efficiencyRatio: 5.25,
    recommendationRating: 'BALANCED',
    notes: 'Provides permanent 24/7 telemetry monitoring and early warning autonomy.'
  },
  {
    id: 'roi-04',
    measureName: 'Engineered Soil Nailing & Shotcrete Grid Retaining Wall',
    estimatedCostLakhsInr: 28.0,
    modeledRiskReductionPct: 48,
    modeledExposureReductionPct: 52,
    implementationTimeDays: 60,
    efficiencyRatio: 1.71,
    recommendationRating: 'HIGH_CAPEX',
    notes: 'Permanent structural stabilization; ideal for multi-year capital budget works.'
  }
];

// ============================================================================
// 14. AI NO-ALERT DECISION (Feature 20)
// ============================================================================
export function evaluateAiNoAlertDecision(
  rainfallVal: number = 78,
  slopeVal: number = 14,
  soilMoistureVal: number = 42,
  groundMovementVal: number = 0
): AiNoAlertEvaluation {
  // Scenario demonstrating false-alarm reduction: Rainfall is high, but slope is gentle and soil is dry
  const isGentleSlope = slopeVal < 20;
  const isDrySoil = soilMoistureVal < 55;
  const noMovement = groundMovementVal < 0.5;

  const finalRisk = Math.round(
    rainfallVal * 0.35 + slopeVal * 0.25 + soilMoistureVal * 0.3 + groundMovementVal * 0.1
  );

  const shouldSuppressAlert = isGentleSlope && isDrySoil && noMovement;

  return {
    locationName: 'Guwahati Jalukbari Plains Sector',
    evaluatedRainfall: rainfallVal > 70 ? 'HIGH' : 'MODERATE',
    evaluatedSlope: isGentleSlope ? 'GENTLE' : 'STEEP',
    evaluatedSoilMoisture: isDrySoil ? 'DRY' : 'SATURATED',
    evaluatedHistoricalRisk: 'LOW',
    evaluatedGroundMovement: 'NONE',
    finalRiskScore: finalRisk, // e.g. 38
    alertDecision: shouldSuppressAlert ? 'DO_NOT_SEND_ALERT_YET' : 'SEND_EMERGENCY_SMS',
    confidencePct: 91,
    primaryReason: shouldSuppressAlert
      ? 'Rainfall is elevated (78mm), but multi-source geotechnical evidence indicates flat terrain (14° slope) and low soil moisture saturation (42%). Slope failure criteria are not met.'
      : 'Multiple destabilization parameters exceed warning thresholds.',
    preventedFalseAlarmBenefit: 'Prevents panicking 120,000 residents and unnecessary economic shutdowns.'
  };
}

// ============================================================================
// 15. COUNTERFACTUAL DISASTER AI (Feature 21)
// ============================================================================
export function getCounterfactualComparison(): CounterfactualScenarioComparison {
  return {
    scenarioTitle: 'Tawang NH-13 Sector KM 44 (Observed Delayed Action vs Counterfactual Early Action)',
    observedActionTime: '15:30 (3:30 PM) - Post-Slip Road Closure',
    counterfactualActionTime: '14:30 (2:30 PM) - 1 Hour Preemptive Advisory',
    observedActionName: 'Emergency response initiated AFTER debris blocked both lanes',
    counterfactualActionName: 'Road closed when pore pressure crossed 65 kPa (1 hour prior to slip)',
    observedExposurePopulation: 680,
    counterfactualExposurePopulation: 420,
    populationExposureDelta: -260, // -260 people exposed
    observedResponseDelayMinutes: 95,
    counterfactualResponseDelayMinutes: 35,
    responseDelayDeltaMinutes: -60, // 60 mins faster
    observedRoadClosureKm: 14.5,
    counterfactualRoadClosureKm: 4.2,
    modeledRiskReductionPct: 35,
    summaryInsight: 'Acting 1 hour earlier on AI pore-pressure trigger reduces civilian vehicle exposure by 260 persons (-38%) and prevents vehicles getting trapped in secondary runout.',
    withoutAiScenario: {
      alertLeadTimeMinutes: 12,
      casualtiesCount: 14,
      injuriesCount: 38,
      roadBlockageDurationHours: 18,
      economicLossCrInr: 12.4
    },
    withAiScenario: {
      alertLeadTimeMinutes: 72,
      casualtiesCount: 0,
      injuriesCount: 0,
      roadBlockageDurationHours: 4,
      economicLossCrInr: 4.2
    },
    netLivesSaved: 14,
    netInjuriesPrevented: 38,
    netEconomicSavingsCrInr: 8.2
  };
}

// ============================================================================
// 16. AI RESPONSE SCORE (Feature 22)
// ============================================================================
export function calculateAiResponseScore(): AiResponseScoreEvaluation {
  return {
    overallScore: 91,
    grade: 'EXCELLENT',
    breakdown: {
      speedScore: 23, // out of 25 (92%)
      riskReductionScore: 22, // out of 25 (88%)
      populationProtectionScore: 19, // out of 20 (95%)
      routeEfficiencyScore: 14, // out of 15 (93%)
      resourceEfficiencyScore: 13 // out of 15 (86%)
    },
    populationProtectedCount: 2400,
    overallRiskReductionPct: 38,
    recommendationsForImprovement: [
      'Pre-position heavy earth-moving equipment at Jaswant Garh 30 minutes earlier during yellow alert stage.',
      'Deploy autonomous LoRa repeater to eliminate the 8-minute communication latency to Sanglem village headman.',
      'Conduct regular community evacuation drills for the monastic ridge shelter route.'
    ]
  };
}

// ============================================================================
// 17. EMERGENCY DECISION BOARD (Feature 23)
// ============================================================================
export const EMERGENCY_DECISION_BOARD_ITEMS: EmergencyDecisionBoardItem[] = [
  {
    id: 'EDB-01',
    eventName: 'Tawang Sela Pass Landslide Threat',
    riskScore: 84,
    confidencePct: 88,
    exposureLevel: 'HIGH',
    affectedRoads: ['NH-13 KM 42-49', 'Sela South Access'],
    affectedVillages: ['Village V04 (Sanglem)', 'Jaswant Garh'],
    weatherStatus: 'Monsoon Cloudburst (88mm rain / 24h)',
    satelliteObservationSummary: 'Sentinel-1 InSAR: 16.4mm/yr creep detected',
    recommendedAction: 'Immediate Road Closure + Field Verification + SMS Broadcast',
    smsStatus: 'SENT',
    fieldTeamStatus: 'DISPATCHED'
  },
  {
    id: 'EDB-02',
    eventName: 'Dima Hasao Railway Cutting Creep',
    riskScore: 76,
    confidencePct: 82,
    exposureLevel: 'HIGH',
    affectedRoads: ['NH-54E', 'Lumding-Badarpur Railway'],
    affectedVillages: ['Lower Haflong', 'Jatinga'],
    weatherStatus: 'Heavy Continuous Rain (72mm / 24h)',
    satelliteObservationSummary: 'Recent InSAR shows localized subsidence',
    recommendedAction: 'Speed restriction to 15 km/h for trains + sensor inspection',
    smsStatus: 'APPROVED',
    fieldTeamStatus: 'ON_SITE'
  },
  {
    id: 'EDB-03',
    eventName: 'Guwahati Jalukbari Rain Flush',
    riskScore: 38,
    confidencePct: 91,
    exposureLevel: 'LOW',
    affectedRoads: ['NH-27 Bypass'],
    affectedVillages: ['Jalukbari Ward'],
    weatherStatus: 'Sudden Shower (78mm in 2h)',
    satelliteObservationSummary: 'Plains topography, no tectonic slope deformation',
    recommendedAction: 'Stormwater drain clearing; NO emergency SMS required (false-alarm prevention)',
    smsStatus: 'SUPPRESSED',
    fieldTeamStatus: 'STANDBY'
  }
];

// ============================================================================
// 18. AI EVIDENCE TIMELINE (Feature 24)
// ============================================================================
export const EVIDENCE_TIMELINE_EVENTS: EvidenceTimelineEvent[] = [
  {
    id: 'ev-01',
    timestamp: 'Today, 08:00',
    timeOffset: '08:00',
    category: 'WEATHER',
    headline: 'Precipitation Intensity Surges',
    detail: 'Doppler radar detects orographic cloud cluster hovering over Sela Range; rain rate exceeds 28mm/h.',
    severity: 'info',
    icon: 'CloudRain',
    sourceConfidencePct: 95
  },
  {
    id: 'ev-02',
    timestamp: 'Today, 09:30',
    timeOffset: '09:30',
    category: 'RISK',
    headline: 'Soil Pore Pressure Elevation',
    detail: 'LoRa node TW-02 telemetry records pore water pressure climbing from 32 kPa to 58 kPa.',
    severity: 'warning',
    icon: 'Droplets',
    sourceConfidencePct: 92
  },
  {
    id: 'ev-03',
    timestamp: 'Today, 11:00',
    timeOffset: '11:00',
    category: 'RISK',
    headline: 'Modeled Landslide Risk Climbs to 74 (Warning)',
    detail: 'Multi-factor ML algorithm triggers amber alert status across District DEOC dashboard.',
    severity: 'warning',
    icon: 'TrendingUp',
    sourceConfidencePct: 89
  },
  {
    id: 'ev-04',
    timestamp: 'Today, 12:20',
    timeOffset: '12:20',
    category: 'SATELLITE',
    headline: 'Satellite InSAR Differential Update',
    detail: 'Ascending track radar processing completed by NRSC confirms 14mm scarp deformation velocity.',
    severity: 'warning',
    icon: 'Satellite',
    sourceConfidencePct: 84
  },
  {
    id: 'ev-05',
    timestamp: 'Today, 13:00',
    timeOffset: '13:00',
    category: 'RISK',
    headline: 'Risk Score Escalates to 84 (CRITICAL)',
    detail: 'Factor of safety drops below 1.05; shear stress ratio exceeds 0.94.',
    severity: 'emergency',
    icon: 'AlertTriangle',
    sourceConfidencePct: 91
  },
  {
    id: 'ev-06',
    timestamp: 'Today, 13:05',
    timeOffset: '13:05',
    category: 'DECISION',
    headline: 'AI Commander Recommends Preemptive Road Closure',
    detail: 'Automatic directive issued to DEOC to barricade NH-13 at Jaswant Garh checkpoint.',
    severity: 'emergency',
    icon: 'ShieldAlert',
    sourceConfidencePct: 94
  },
  {
    id: 'ev-07',
    timestamp: 'Today, 13:10',
    timeOffset: '13:10',
    category: 'ALERT',
    headline: 'CAP Geo-Fenced SMS Broadcast Sent',
    detail: '2,840 registered handsets inside hazard polygon receive emergency evacuation alert.',
    severity: 'emergency',
    icon: 'Radio',
    sourceConfidencePct: 98
  },
  {
    id: 'ev-08',
    timestamp: 'Today, 13:20',
    timeOffset: '13:20',
    category: 'FIELD_REPORT',
    headline: 'Field Report & Photo Received from Patrol',
    detail: 'BRO patrol confirms 12cm tension cracks expanding across road surface; traffic halted safely.',
    severity: 'emergency',
    icon: 'Camera',
    sourceConfidencePct: 96
  },
  {
    id: 'ev-09',
    timestamp: 'Today, 13:25',
    timeOffset: '13:25',
    category: 'DECISION',
    headline: 'Zero Casualties Confirmed; Alternate Route R-15 Open',
    detail: 'Preemptive action successfully protected civilian commuters; rescue units staged.',
    severity: 'info',
    icon: 'CheckCircle2',
    sourceConfidencePct: 99
  }
];

// ============================================================================
// 19. DISASTER DIGITAL MEMORY (Feature 25 & 26)
// ============================================================================
export const DISASTER_DIGITAL_MEMORY_PROFILE: DisasterDigitalMemoryProfile = {
  zoneId: 'ZONE-TWN-042',
  zoneName: 'Tawang Sela Pass Scarp Sector',
  totalHistoricalEventsRecorded: 4,
  previousHighestRiskScore: 91,
  averageRainfallBeforeEventsMm: 118,
  previousEffectiveResponse: 'Precautionary road closure + diversion to Western Ridge bypass R-15',
  previousOutcome: 'Road corridor successfully protected with zero civilian casualties in 2023',
  predictionAccuracyRatePct: 92.5,
  historicalEvents: [
    {
      year: 2023,
      eventName: 'July 2023 Sela Torrential Debris Flow',
      rainfallMm: 135,
      impactDescription: '8,000 m³ colluvium severed 120m highway; traffic reopened in 18 hours.',
      fatalities: 0,
      roadCutDays: 1
    },
    {
      year: 2020,
      eventName: 'August 2020 Sanglem Slump',
      rainfallMm: 158,
      impactDescription: 'Deep-seated rotational shear dammed local stream for 6 hours.',
      fatalities: 1,
      roadCutDays: 4
    },
    {
      year: 2016,
      eventName: 'May 2016 Pre-Monsoon Cloudburst Failure',
      rainfallMm: 122,
      impactDescription: 'Road washaway at KM 46; 4 military trucks halted.',
      fatalities: 0,
      roadCutDays: 2
    },
    {
      year: 2012,
      eventName: 'September 2012 Tawang Rockfall',
      rainfallMm: 98,
      impactDescription: 'Granite boulder detachment damaged telephone poles.',
      fatalities: 0,
      roadCutDays: 1
    }
  ]
};

export function compareIncidents(
  eventAId: string = '2020',
  eventBId: string = 'current'
): IncidentComparisonReport {
  return {
    eventA: {
      name: 'Event A: Sela Pass 2020 Disaster',
      year: 2020,
      rainfallMm: 158,
      soilMoisturePct: 88,
      slopeDeg: 37,
      groundMovementMm: 8.4,
      historicalRisk: 'High',
      exposurePopulation: 580,
      responseAction: 'Delayed road closure after slide occurred',
      impactOutcome: '1 fatality, 4 days highway severance'
    },
    eventB: {
      name: 'Event B: Current 2026 Situation',
      year: 2026,
      rainfallMm: 145,
      soilMoisturePct: 84,
      slopeDeg: 37,
      groundMovementMm: 7.2,
      historicalRisk: 'High',
      exposurePopulation: 420,
      responseAction: 'Early road closure + automated CAP SMS dispatch',
      impactOutcome: 'Zero casualties; evacuation underway'
    },
    overallSimilarityPct: 84,
    keyDivergenceFactor: 'Response Lead Time: 2026 benefited from 3.5 hours early AI warning vs 0 mins in 2020.',
    concludingAnalogy: 'The current hydrological and shear stress pattern is 84% identical to the 2020 Sela disaster; however, preemptive intervention has inverted the casualty risk.'
  };
}

// ============================================================================
// 20. DISASTER SEVERITY TRAJECTORY (Feature 27)
// ============================================================================
export function calculateSeverityTrajectory(
  currentRisk: number = 84,
  simulatedTrend: 'escalating' | 'stable' | 'recovering' = 'escalating'
): SeverityTrajectoryState {
  const sampleProjections = [
    {
      horizon: '+2 Hours',
      trajectory: (simulatedTrend === 'escalating' ? 'ESCALATING' : simulatedTrend === 'recovering' ? 'RECOVERING' : 'PLATEAU') as 'ESCALATING' | 'PLATEAU' | 'RECOVERING',
      projectedRiskScore: Math.min(98, currentRisk + 6),
      failureProbabilityPct: 78,
      primaryRiskDriver: 'Pore Pressure Infiltration',
      recommendedPreparednessAction: 'Preemptive roadblock at KM 44'
    },
    {
      horizon: '+6 Hours',
      trajectory: (simulatedTrend === 'escalating' ? 'ESCALATING' : simulatedTrend === 'recovering' ? 'RECOVERING' : 'PLATEAU') as 'ESCALATING' | 'PLATEAU' | 'RECOVERING',
      projectedRiskScore: Math.min(99, currentRisk + 12),
      failureProbabilityPct: 86,
      primaryRiskDriver: 'Continuous Orographic Precipitation',
      recommendedPreparednessAction: 'Evacuate downstream sector Sanglem V04'
    },
    {
      horizon: '+12 Hours',
      trajectory: (simulatedTrend === 'recovering' ? 'RECOVERING' : 'PLATEAU') as 'ESCALATING' | 'PLATEAU' | 'RECOVERING',
      projectedRiskScore: simulatedTrend === 'recovering' ? 44 : 76,
      failureProbabilityPct: 52,
      primaryRiskDriver: 'Antecedent Soil Saturation Decay',
      recommendedPreparednessAction: 'Maintain bypass diversion route R-15'
    },
    {
      horizon: '+24 Hours',
      trajectory: (simulatedTrend === 'recovering' ? 'RECOVERING' : 'PLATEAU') as 'ESCALATING' | 'PLATEAU' | 'RECOVERING',
      projectedRiskScore: simulatedTrend === 'recovering' ? 26 : 64,
      failureProbabilityPct: 34,
      primaryRiskDriver: 'Stabilization Curve',
      recommendedPreparednessAction: 'Initiate structural clearing & culvert inspection'
    }
  ];

  if (simulatedTrend === 'escalating') {
    return {
      pastRiskScore: 42,
      currentRiskScore: currentRisk,
      projectedRiskScore: Math.min(98, currentRisk + 14),
      trajectoryTrend: 'ESCALATING_RAPIDLY',
      statusBadge: '🟢 → 🟠 → 🔴 RISK ESCALATING RAPIDLY',
      colorHex: '#ef4444',
      timeHorizonHours: 6,
      projections: sampleProjections
    };
  } else if (simulatedTrend === 'recovering') {
    return {
      pastRiskScore: 84,
      currentRiskScore: 58,
      projectedRiskScore: 32,
      trajectoryTrend: 'RECOVERING',
      statusBadge: '🔴 → 🟠 → 🟢 RISK RECOVERING POST-DRAINAGE',
      colorHex: '#10b981',
      timeHorizonHours: 12,
      projections: sampleProjections
    };
  } else {
    return {
      pastRiskScore: 68,
      currentRiskScore: 72,
      projectedRiskScore: 70,
      trajectoryTrend: 'STABLE_ELEVATED',
      statusBadge: '🟠 → 🟠 → 🟠 STABLE ELEVATED THREAT',
      colorHex: '#f59e0b',
      timeHorizonHours: 8,
      projections: sampleProjections
    };
  }
}

// ============================================================================
// 21. FIELD VERIFICATION TASK GENERATOR & REPORT TRUST SCORE (Feature 28 & 29)
// ============================================================================
export function generateFieldVerificationTask(zoneName: string = 'Tawang KM 44'): FieldVerificationTask {
  return {
    taskId: 'TASK-VERIF-042',
    title: `Urgent Slope Inspection at ${zoneName}`,
    priority: 'HIGH',
    assignedToSector: 'Sector 3 Patrol (BRO / Local Police)',
    targetCoordinates: [27.498, 92.108],
    reason: 'Multi-modal discrepancy detected: Doppler rainfall and soil moisture indicate high failure probability, while satellite radar shows low baseline velocity. In-situ physical inspection required.',
    status: 'ACCEPTED',
    officerNotes: 'Inspected culvert 44/2; visible tension cracks 10-12cm along uphill shoulder. Seepage water murky with silt.',
    hasPhotoUpload: true,
    hasVideoUpload: false,
    officerConfirmation: 'CONFIRMED_HAZARD',
    updatedRiskScoreAfterVerification: 88
  };
}

export function evaluateFieldReportTrust(report: any): FieldReportTrustEvaluation {
  return {
    reportId: report?.id || 'REP-9921',
    reporterHandle: report?.reporterName || 'Citizen Rohan Bordoloi',
    overallTrustScorePct: 92,
    status: 'HIGH_CONFIDENCE_FIELD_EVIDENCE',
    metadataBreakdown: {
      gpsValidityScore: 98,
      timestampConsistencyScore: 95,
      imageMetadataAuthenticityScore: 90,
      locationConsistencyScore: 94,
      duplicateAnalysisScore: 88,
      aiComputerVisionConsistencyScore: 92,
      reporterHistoryScore: 86
    },
    aiImageAnalysisSummary: 'AI CV analysis confirms authentic tension fissures in asphalt with lateral displacement corresponding to GPS coordinates.'
  };
}

// ============================================================================
// 22. AI DISASTER COMMANDER & 60-SECOND BRIEF (Feature 30 & 31)
// ============================================================================
export function getAiCommanderSynthesis(
  station?: LandslideStation | null,
  simulatedRainfall: number = 88
): AiCommanderSynthesis {
  const name = station?.name || 'Tawang Sela Pass';
  return {
    zoneName: name,
    whatIsHappening: `CRITICAL ELEVATED HAZARD: Severe geotechnical shear destabilization detected across ${name}. Modeled risk index is at 84/100.`,
    whyIsItHappening: `Primary physical drivers are acute orographic cloudburst (${simulatedRainfall}mm / 24h), volumetric soil hyper-saturation at 84%, and steep 37° topography with degraded basal drainage.`,
    whoIsAffected: `Directly threatens National Highway NH-13 (lifeline connecting Tawang with mainland India) and downstream settlement of Village V04 (Sanglem, Pop: 1,240, 2 schools, 1 clinic).`,
    whatCouldHappenNext: `Without immediate intervention, translational failure of approximately 12,000 m³ colluvium is modeled within the next 2-4 hours, causing 180m highway severance and downstream stream ponding.`,
    whatShouldWeDo: `1. Issue immediate traffic diversion advisory at Jaswant Garh and Sange checkposts.\n2. Dispatch cell-broadcast emergency evacuation alerts to Village V04.\n3. Pre-position BRO excavators and medical QRT along alternate Route R-15.`,
    whatDataIsMissing: `Ground deformation radar InSAR pass is 48 hours old due to satellite orbit cycle; field confirmation from Sector 3 patrol is actively filling this gap.`,
    commanderConfidencePct: 88,
    generatedTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export function generateSixtySecondBrief(commander: AiCommanderSynthesis): SixtySecondBrief {
  const speechText = `Attention District Emergency Operations Center. This is BHUSAKTHI AI with an executive sixty-second operational brief for ${commander.zoneName}.
Current situation: Modeled landslide risk has reached eighty-four out of one hundred, driven by severe rainfall of eighty-eight millimeters and soil moisture at eighty-four percent.
Exposed assets include National Highway thirteen and Village Sanglem with one thousand two hundred residents.
Prediction confidence is eighty-eight percent backed by seven out of eight evidence streams.
Immediate directives: Precautionary road closure of Highway thirteen from kilometer forty-two to forty-nine, activation of evacuation shelter at Tawang Monastery, and diversion of traffic via Route R-fifteen.
Control room acknowledgment is requested.`;

  return {
    briefId: `BRIEF-60S-${Date.now().toString().slice(-6)}`,
    headline: `60-SECOND DISASTER COMMAND BRIEF: ${commander.zoneName.toUpperCase()}`,
    formattedSpeechText: speechText,
    bulletPoints: [
      `Risk Level: 84/100 (CRITICAL) | Confidence: ${commander.commanderConfidencePct}%`,
      `Key Drivers: ${commander.whyIsItHappening.slice(0, 110)}...`,
      `Exposed Population: 1,240 Residents in Sanglem + NH-13 Commuters`,
      `Immediate Directive: Road Closure KM 42-49 & Route R-15 Bypass`
    ],
    recommendedActionDirectives: [
      'Precautionary Road Closure on NH-13',
      'Village V04 Evacuation Advisory to Upper Ridge',
      'Pre-position Excavators & Medical Relief Team R04'
    ],
    preparedBy: 'BHUSAKTHI AI Automated Incident Command Intelligence',
    classification: 'OFFICIAL USE ONLY'
  };
}

// ============================================================================
// 23. AI DECISION AUDIT & DISASTER LEARNING SCORE (Feature 32 & 33)
// ============================================================================
export const AI_DECISION_AUDIT_LOGS: AiDecisionAuditRecord[] = [
  {
    decisionId: 'BH-2026-00421',
    timestamp: 'Today, 13:05:22',
    incidentZone: 'Tawang Sela Pass KM 44',
    inputsEvaluated: ['Rainfall (88mm)', 'Soil Moisture (84%)', 'Slope (37°)', 'InSAR (16mm/yr)', 'Citizen Fissure Report'],
    riskScore: 84,
    confidencePct: 88,
    evidenceSourcesCount: 7,
    systemRecommendation: 'Preemptive Lifeline Road Closure + Mass Warning',
    actionTakenByAuthority: 'Approved by District Magistrate; Police Checkpost barricaded NH-13 at 13:12',
    operationalOutcome: 'Debris slide struck empty roadway at 14:10; zero fatalities recorded.',
    auditSignatureHash: '0x8f2a99e1c4b72018a'
  },
  {
    decisionId: 'BH-2026-00388',
    timestamp: 'Yesterday, 16:45:10',
    incidentZone: 'Guwahati Jalukbari Plains',
    inputsEvaluated: ['Rainfall (78mm)', 'Slope (14°)', 'Soil Moisture (42%)'],
    riskScore: 38,
    confidencePct: 91,
    evidenceSourcesCount: 5,
    systemRecommendation: 'DO NOT SEND EMERGENCY SMS (False Alarm Prevention)',
    actionTakenByAuthority: 'No alert issued; municipal drain clearing dispatched',
    operationalOutcome: 'No slope failure; prevented panic among 120,000 citizens',
    auditSignatureHash: '0x3c11d88a91b65e71'
  }
];

export function calculateDisasterLearningScore(): DisasterLearningEvaluation {
  return {
    eventId: 'EVT-EVAL-2026-01',
    eventName: '2026 Pre-Monsoon Tawang Sela Validation Event',
    predictedRiskCategory: 'CRITICAL',
    observedEventOutcome: 'CONFIRMED_LANDSLIDE',
    leadTimeHours: 3.5, // 3.5 hours advance lead time
    isFalseAlarm: false,
    predictionAccuracyGrade: 'A+',
    geotechnicalModelLessonsLearned: [
      'Inclinometer shear strain rate accelerated 45 minutes earlier than pore pressure crest.',
      'Citizen photo report of road tension cracks provided pivotal ground truth confirming model runout prediction.',
      'Route R-15 bypass capacity is sufficient for light vehicles but requires widening for heavy relief trucks.'
    ],
    suggestedWeightAdjustments: [
      'Increase antecedent 7-day rainfall weight from 0.15 to 0.18 in mica-schist formations.',
      'Slightly reduce optical satellite change detector weight during monsoon months due to cloud interference.'
    ]
  };
}

// ============================================================================
// 24. JUDGE CHALLENGE SIMULATOR (Feature 35)
// ============================================================================
export interface JudgeChallengeState {
  rainfallIncreasePct: number; // e.g. 10, 20, 30, 50
  baselineRisk: number;
  updatedRisk: number;
  deltaRisk: number;
  baselineExposedPop: number;
  updatedExposedPop: number;
  deltaExposedPop: number;
  baselineExposedRoadKm: number;
  updatedExposedRoadKm: number;
  responsePriority: 'ELEVATED' | 'HIGH' | 'CRITICAL' | 'CATASTROPHIC';
  recommendedAction: string;
  whatChangedSummary: string;
}

export function runJudgeChallenge(rainfallIncreasePct: number = 30): JudgeChallengeState {
  const baseRisk = 62;
  const riskGain = Math.round(rainfallIncreasePct * 0.72);
  const updatedRisk = Math.min(98, baseRisk + riskGain);

  const basePop = 820;
  const popGain = Math.round(rainfallIncreasePct * 18);

  const baseRoad = 4.2;
  const roadGain = Number((rainfallIncreasePct * 0.14).toFixed(1));

  let priority: any = 'HIGH';
  if (updatedRisk > 85) priority = 'CATASTROPHIC';
  else if (updatedRisk > 75) priority = 'CRITICAL';

  let rec = 'Issue precautionary travel advisory and alert standby earthmovers.';
  if (rainfallIncreasePct >= 30) {
    rec = 'IMMEDIATE MANDATORY EVACUATION of downslope Village V04; total road closure on NH-13 KM 42-49.';
  } else if (rainfallIncreasePct >= 20) {
    rec = 'Single-lane controlled convoy transit on NH-13; alert community shelters.';
  }

  const whatChanged = `A +${rainfallIncreasePct}% surge in precipitation elevates pore saturation by +${Math.round(rainfallIncreasePct * 0.65)}% and increases risk score from ${baseRisk} to ${updatedRisk} (+${riskGain} pts). Demographic exposure expands by +${popGain} citizens and an additional ${roadGain} km of highway corridor becomes vulnerable to mass debris flow.`;

  return {
    rainfallIncreasePct,
    baselineRisk: baseRisk,
    updatedRisk,
    deltaRisk: riskGain,
    baselineExposedPop: basePop,
    updatedExposedPop: basePop + popGain,
    deltaExposedPop: popGain,
    baselineExposedRoadKm: baseRoad,
    updatedExposedRoadKm: Number((baseRoad + roadGain).toFixed(1)),
    responsePriority: priority,
    recommendedAction: rec,
    whatChangedSummary: whatChanged
  };
}

export interface JudgeChallengeScenario {
  projectedRainfallMmH: number;
  resultingFactorOfSafety: number;
  estimatedHoursToSlopeFailure: number;
  evacuationPopulationNeeded: number;
  recommendedSystemResponse: string;
}

export function calculateJudgeChallengeScenario(rainfallIncreasePct: number = 20): JudgeChallengeScenario {
  const projectedRainfallMmH = 68.4 * (1 + rainfallIncreasePct / 100);
  const resultingFactorOfSafety = Math.max(0.68, Number((1.18 - (rainfallIncreasePct * 0.011)).toFixed(2)));
  const estimatedHoursToSlopeFailure = Math.max(0.8, Number((3.2 - (rainfallIncreasePct * 0.04)).toFixed(1)));
  const evacuationPopulationNeeded = Math.round(420 + rainfallIncreasePct * 26);
  const recommendedSystemResponse =
    rainfallIncreasePct >= 30
      ? `Critical instability: FS dropped to ${resultingFactorOfSafety.toFixed(2)} (< 1.0). Mandatory red-level evacuation ordered for downslope settlement (${evacuationPopulationNeeded.toLocaleString()} residents). Immediate barrier cordoning at NH-13 KM 42.`
      : `Elevated slope shearing risk: FS at ${resultingFactorOfSafety.toFixed(2)}. Pre-evacuation advisory dispatched via CAP Cell Broadcast to ${evacuationPopulationNeeded.toLocaleString()} citizens; QRT staging mobilized.`;

  return {
    projectedRainfallMmH,
    resultingFactorOfSafety,
    estimatedHoursToSlopeFailure,
    evacuationPopulationNeeded,
    recommendedSystemResponse
  };
}

export interface DisasterModeState {
  simulatedHazardZone: string;
  simulatedRainfallRateMmH: number;
  simulatedFactorOfSafety: number;
  capAlertsDispatched: boolean;
  rescueTeamsMobilized: number;
}

export function getDisasterModeState(isActive: boolean): DisasterModeState {
  return {
    simulatedHazardZone: 'Tawang Sela Pass NH-13 KM 44',
    simulatedRainfallRateMmH: isActive ? 114.5 : 42.0,
    simulatedFactorOfSafety: isActive ? 0.74 : 1.45,
    capAlertsDispatched: isActive,
    rescueTeamsMobilized: isActive ? 12 : 2
  };
}

export interface CommandCenterWallData {
  monitoredStationsCount: number;
  activeEmergenciesCount: number;
  populationAtRiskCount: number;
  cellularAlertsBroadcastCount: number;
  rescueUnitsDeployedCount: number;
  zones: Array<{
    name: string;
    status: 'CRITICAL' | 'WARNING' | 'MONITORING';
    fs: number;
    rainRate: number;
    leadTime: string;
    directive: string;
  }>;
}

export function getCommandCenterWallData(): CommandCenterWallData {
  return {
    monitoredStationsCount: 42,
    activeEmergenciesCount: 1,
    populationAtRiskCount: 1240,
    cellularAlertsBroadcastCount: 3200,
    rescueUnitsDeployedCount: 20,
    zones: [
      {
        name: 'Tawang Sela Pass (NH-13)',
        status: 'CRITICAL',
        fs: 0.88,
        rainRate: 88.4,
        leadTime: '2.4 Hours',
        directive: 'Immediate Cordon & Mass Evacuation'
      },
      {
        name: 'Wayanad Meppadi Slopes',
        status: 'WARNING',
        fs: 1.15,
        rainRate: 46.2,
        leadTime: '6.0 Hours',
        directive: 'Pre-evacuate Riverine Hamlets'
      },
      {
        name: 'Joshimath Subsidence Ridge',
        status: 'MONITORING',
        fs: 1.34,
        rainRate: 18.0,
        leadTime: '18.0 Hours',
        directive: 'Continuous InSAR & Tilt Sentinel'
      },
      {
        name: 'Shimla Ridge Overburden',
        status: 'MONITORING',
        fs: 1.42,
        rainRate: 12.5,
        leadTime: '24.0 Hours',
        directive: 'Routine Drainage Clearance'
      }
    ]
  };
}

export interface SihEvaluatorScenario {
  id: string;
  name: string;
  location: string;
  objective: string;
  keyFeatureDemonstrated: string;
}

export const SIH_EVALUATOR_SCENARIOS: SihEvaluatorScenario[] = [
  {
    id: 'scen-tawang-cloudburst',
    name: 'Cloudburst at Sela Pass',
    location: 'Tawang, Arunachal',
    objective: 'Demonstrates real-time FS plunge from 1.35 to 0.88 under 90mm/h rainfall intensity.',
    keyFeatureDemonstrated: 'Geotechnical Soil Physics & Factor of Safety'
  },
  {
    id: 'scen-wayanad-reconstruction',
    name: 'Wayanad Digital Memory Replay',
    location: 'Chooralmala, Kerala',
    objective: 'Replays the 2024 antecedent saturation signature against current live sensor arrays.',
    keyFeatureDemonstrated: 'Disaster Digital Memory & Historical Fingerprinting'
  },
  {
    id: 'scen-contradiction-fusion',
    name: 'Sensor Contradiction Resolution',
    location: 'NH-13 KM 44',
    objective: 'Simulates IoT rain gauge showing 12mm while SAR Interferometry & Piezo detect sub-surface failure.',
    keyFeatureDemonstrated: 'Multi-Source Bayesian Contradiction Fusion'
  },
  {
    id: 'scen-cap-cellular-broadcast',
    name: 'Autonomous CAP Alert Dispatch',
    location: 'Village Sanglem',
    objective: 'Triggers multi-lingual cell-broadcast SMS & automated siren relays within 60 seconds.',
    keyFeatureDemonstrated: 'First 10-Minutes Triage & Cellular Gateway'
  },
  {
    id: 'scen-roi-chain-breaker',
    name: 'Drainage Trench ROI Optimization',
    location: 'Sela East Escarpment',
    objective: 'Compares ₹4.5L preventive horizontal drains vs ₹8.2 Cr post-disaster road reconstruction.',
    keyFeatureDemonstrated: 'Prevention ROI & Disaster Chain Breaker'
  },
  {
    id: 'scen-satellite-tasking',
    name: 'Urgent SAR Satellite Re-tasking',
    location: 'North-East Border Zone',
    objective: 'Calculates orbital pass window for RISAT-1A & Sentinel-1 descending track.',
    keyFeatureDemonstrated: 'Satellite Tasking Priority & InSAR Coherence'
  },
  {
    id: 'scen-field-verification-trust',
    name: 'QRT EXIF Trust Audit',
    location: 'Tawang Patrol Outpost',
    objective: 'Evaluates cryptographically geotagged ground photo and weights against citizen report.',
    keyFeatureDemonstrated: 'Ground Field Verification Trust Engine'
  },
  {
    id: 'scen-60sec-commander-audio',
    name: 'Executive 60-Second Spoken Brief',
    location: 'State EOC War Room',
    objective: 'Synthesizes multi-hazard facts into crisp verbal briefing for Chief Secretary.',
    keyFeatureDemonstrated: 'Autonomous AI Commander Speech Synthesis'
  }
];

export interface SihDemoStep {
  stepNumber: number;
  stageNumber: number;
  stageName: string;
  title: string;
  description: string;
  expectedArtifact: string;
  targetComponent: string;
}

export const SIH_38_STEP_DEMO_FLOW: SihDemoStep[] = [
  {
    stepNumber: 1,
    stageNumber: 1,
    stageName: 'Telemetry Acquisition',
    title: 'Piezometer Pore Pressure Spike',
    description: 'Ground vibrating wire piezometers register sub-surface pore water pressure surging to 68 kPa.',
    expectedArtifact: 'Real-time telemetry chart',
    targetComponent: 'Sensor Telemetry Feed'
  },
  {
    stepNumber: 2,
    stageNumber: 1,
    stageName: 'Telemetry Acquisition',
    title: 'Rain Gauge Cumulative Saturation',
    description: 'Autonomous AWS rain gauge records 48-hour antecedent rainfall exceeding 180 mm threshold.',
    expectedArtifact: 'Rainfall Fingerprint Curve',
    targetComponent: 'Rainfall & Slope Analysis'
  },
  {
    stepNumber: 3,
    stageNumber: 1,
    stageName: 'Telemetry Acquisition',
    title: 'Tiltmeter Inclinometer Creep',
    description: 'Borehole inclinometer detects continuous 2.4 mm/hour shearing velocity along slip surface.',
    expectedArtifact: 'Inclinometer Shear Vector',
    targetComponent: 'Geotechnical Physics'
  },
  {
    stepNumber: 4,
    stageNumber: 1,
    stageName: 'Telemetry Acquisition',
    title: 'Unknown-Risk Shadow Zone Flagging',
    description: 'System identifies 3 high-slope unmonitored valleys lacking ground sensor coverage.',
    expectedArtifact: 'Spatial Shadow Zone Map',
    targetComponent: 'Blindspot & Sensor Placement'
  },
  {
    stepNumber: 5,
    stageNumber: 2,
    stageName: 'Multi-Source Fusion',
    title: 'InSAR Satellite Phase Unwrapping',
    description: 'Descending track interferogram confirms line-of-sight surface subsidence of -18 mm/yr.',
    expectedArtifact: 'SAR Coherence Map',
    targetComponent: 'Satellite Tasking View'
  },
  {
    stepNumber: 6,
    stageNumber: 2,
    stageName: 'Multi-Source Fusion',
    title: 'Contradiction Detection Engine',
    description: 'Resolves discrepancy between sparse cellular rain gauges and deep radar reflectivity.',
    expectedArtifact: 'Bayesian Fusion Weight Matrix',
    targetComponent: 'Evidence Contradiction Fusion'
  },
  {
    stepNumber: 7,
    stageNumber: 2,
    stageName: 'Multi-Source Fusion',
    title: 'Geological Digital Memory Matching',
    description: 'Correlates current pore pressure curve with historical 2024 Wayanad disaster profile (92% similarity).',
    expectedArtifact: 'Disaster Digital Memory Match',
    targetComponent: 'Digital Memory Archive'
  },
  {
    stepNumber: 8,
    stageNumber: 2,
    stageName: 'Multi-Source Fusion',
    title: 'Evidence Timeline Reconstruction',
    description: 'Sequences micro-events across 72 hours leading up to slope plastic deformation.',
    expectedArtifact: 'Chronological Audit Chain',
    targetComponent: 'Evidence Timeline'
  },
  {
    stepNumber: 9,
    stageNumber: 3,
    stageName: 'Predictive Geotech',
    title: 'Infinite Slope Factor of Safety',
    description: 'Computes modified Bishop circular slip FS = 0.88, confirming imminent structural rupture.',
    expectedArtifact: 'Dynamic FS Gauge',
    targetComponent: 'Factor of Safety Engine'
  },
  {
    stepNumber: 10,
    stageNumber: 3,
    stageName: 'Predictive Geotech',
    title: 'Risk Half-Life & Recovery Model',
    description: 'Calculates 24-hour post-rainfall drainage decay, estimating danger zone half-life at 14 hours.',
    expectedArtifact: 'Risk Half-Life Exponential Curve',
    targetComponent: 'Risk Half-Life View'
  },
  {
    stepNumber: 11,
    stageNumber: 3,
    stageName: 'Predictive Geotech',
    title: 'Debris Flow Runout Simulation',
    description: 'Voellmy friction runout model maps debris path down to NH-13 highway corridor KM 44.',
    expectedArtifact: 'Runout Vector Overlay',
    targetComponent: 'Terrain 3D Viewer'
  },
  {
    stepNumber: 12,
    stageNumber: 3,
    stageName: 'Predictive Geotech',
    title: 'Vulnerable Population Exposure',
    description: 'Overlays 250m buffer against census grid, pinpointing 420 residents and 28 schools/hospitals.',
    expectedArtifact: 'Demographic Triage Table',
    targetComponent: 'Vulnerable Population'
  },
  {
    stepNumber: 13,
    stageNumber: 4,
    stageName: 'Action & Evacuation',
    title: 'First 10-Minutes Execution Plan',
    description: 'Auto-triggers minute-by-minute protocol: sirens (T+2m), roadblocks (T+5m), SDRF dispatch (T+8m).',
    expectedArtifact: '10-Minute Operational Checklist',
    targetComponent: 'First 10 Minutes Planner'
  },
  {
    stepNumber: 14,
    stageNumber: 4,
    stageName: 'Action & Evacuation',
    title: 'CAP Cellular Broadcast SMS',
    description: 'Generates NDMA CAP-compliant alert in English, Hindi & Monpa for telecom base stations.',
    expectedArtifact: 'Cell Broadcast Message Payload',
    targetComponent: 'Emergency Broadcast'
  },
  {
    stepNumber: 15,
    stageNumber: 4,
    stageName: 'Action & Evacuation',
    title: 'Automated Road Cordon Dispatch',
    description: 'Orders automatic traffic signal diverters on NH-13 KM 42 and KM 48.',
    expectedArtifact: 'Traffic Diversion Order',
    targetComponent: 'Decision Board'
  },
  {
    stepNumber: 16,
    stageNumber: 4,
    stageName: 'Action & Evacuation',
    title: 'Rescue Units Digital Twin Staging',
    description: 'Monitors real-time GPS locations and readiness of 12 NDRF teams and 4 bulldozers.',
    expectedArtifact: 'Rescue Asset Fleet Status',
    targetComponent: 'Digital Twin Units'
  },
  {
    stepNumber: 17,
    stageNumber: 5,
    stageName: 'Governance & Audit',
    title: 'Autonomous AI Commander 60s Brief',
    description: 'Generates text-to-speech oral briefing for District Magistrate and War Room wall display.',
    expectedArtifact: 'Spoken Audio Stream & Text',
    targetComponent: 'Commander Brief View'
  },
  {
    stepNumber: 18,
    stageNumber: 5,
    stageName: 'Governance & Audit',
    title: 'Ground Field Verification Trust Audit',
    description: 'Validates QRT ground photos with EXIF geotags against satellite sensor estimates.',
    expectedArtifact: 'Trust Score & Validation Report',
    targetComponent: 'Field Verification View'
  },
  {
    stepNumber: 19,
    stageNumber: 5,
    stageName: 'Governance & Audit',
    title: 'AI Decision Audit Trail (Human-in-Loop)',
    description: 'Logs all algorithmic actions into an immutable audit registry with commander override switches.',
    expectedArtifact: 'Statutory Compliance Audit Log',
    targetComponent: 'Audit & Learning View'
  },
  {
    stepNumber: 20,
    stageNumber: 5,
    stageName: 'Governance & Audit',
    title: 'Disaster Prevention ROI Calculator',
    description: 'Evaluates economic benefit: ₹12.4 Cr damage prevented per ₹18 Lakh early intervention.',
    expectedArtifact: 'Cost-Benefit Ratio Matrix',
    targetComponent: 'Chain Breaker ROI'
  },
  {
    stepNumber: 21,
    stageNumber: 5,
    stageName: 'Governance & Audit',
    title: 'Interactive Judge Stress Test',
    description: 'Allows SIH jury to simulate +10% to +50% precipitation surges and verify model elasticity.',
    expectedArtifact: 'Dynamic Re-calculation Engine',
    targetComponent: 'Judge Challenge Simulator'
  }
];
