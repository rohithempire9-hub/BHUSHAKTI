import { LandslideStation } from './landslide';

// ============================================================================
// NEW FEATURE 6: FIRST 10 MINUTES RESPONSE PLANNER
// ============================================================================
export interface First10MinutesStep {
  id: string;
  phase: '0-2_MIN' | '2-5_MIN' | '5-10_MIN';
  phaseTitle: string;
  timeRange: string;
  title: string;
  action: string;
  targetAgency: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CRITICAL';
  estimatedSeconds: number;
  outputArtifact: string;
}

export interface First10MinutesPlan {
  incidentId: string;
  zoneName: string;
  timestamp: string;
  overallTrigger: string;
  elapsedSeconds: number;
  isDemoActive: boolean;
  steps: First10MinutesStep[];
}

// ============================================================================
// NEW FEATURE 7 & 10: RISK CONTRADICTION & CROSS-VERIFICATION
// ============================================================================
export interface EvidenceSourceValue {
  sourceName: 'Rainfall' | 'Soil Moisture' | 'Slope Angle' | 'Historical Risk' | 'Satellite Movement' | 'Ground Sensor' | 'Field Report';
  valueText: string;
  riskIndication: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  confidenceWeightPct: number;
  numericVal: number;
  description: string;
}

export interface RiskContradictionResult {
  hasConflict: boolean;
  conflictHeadline: string;
  evidenceAgreementScorePct: number; // e.g. 64%
  predictionConfidencePct: number; // e.g. 58%
  operationalStatus: 'NORMAL' | 'EVIDENCE_ALIGNED' | 'FIELD_VERIFICATION_REQUIRED' | 'HIGH_CONFIDENCE_HAZARD';
  explanation: string;
  evidenceSources: EvidenceSourceValue[];
  agreementMatrix: {
    sourceA: string;
    sourceB: string;
    correlationPct: number;
    status: 'ALIGNED' | 'DIVERGENT' | 'CONFLICT';
  }[];
}

// ============================================================================
// NEW FEATURE 8: UNKNOWN RISK / DATA GAP MAP
// ============================================================================
export type RiskMapCategory =
  | 'KNOWN_LOW_RISK'
  | 'KNOWN_MODERATE_RISK'
  | 'KNOWN_HIGH_RISK'
  | 'UNKNOWN_RISK'
  | 'DATA_GAP';

export interface UnknownRiskZone {
  id: string;
  zoneName: string;
  state: string;
  district: string;
  category: RiskMapCategory;
  coordinates: [number, number]; // [lat, lng]
  radiusKm: number;
  polygon?: [number, number][];
  reason: string;
  missingDataItems: string[];
  confidencePct: number;
  recommendedAction: string;
  lastSatellitePass?: string;
  sensorDensityScore: number; // 0 - 100
}

// ============================================================================
// NEW FEATURE 9: SENSOR PLACEMENT OPTIMIZER
// ============================================================================
export type SensorHardwareType =
  | 'Rain Gauge'
  | 'Soil Moisture Sensor'
  | 'Tilt Sensor'
  | 'Inclinometer'
  | 'GNSS'
  | 'Water-Level Sensor';

export interface SensorPlacementRecommendation {
  id: string;
  locationName: string;
  state: string;
  coordinates: [number, number];
  priorityScore: number; // e.g. 92
  coverageGainPct: number; // e.g. 31%
  recommendedSensorTypes: SensorHardwareType[];
  primaryReason: string;
  factors: {
    historicalFrequency: number;
    rainfallExposure: number;
    soilMoistureRisk: number;
    slopeSteepness: number;
    populationProtected: number;
    roadCriticality: number;
    existingUncertainty: number;
  };
  expectedCoverageImprovement: string;
  estimatedHardwareCostInr: string;
}

// ============================================================================
// NEW FEATURE 11: DISASTER CHAIN BREAKER
// ============================================================================
export interface CascadeChainLink {
  id: string;
  order: number;
  stageName: string;
  description: string;
  isBroken: boolean;
  availableIntervention?: {
    id: string;
    name: string;
    type: 'drainage' | 'road_closure' | 'field_inspection' | 'evacuation' | 'resource_staging' | 'route_diversion';
    estimatedRiskReductionPct: number;
    estimatedExposureReductionPct: number;
    costLakhs: number;
    timeRequiredHours: number;
    operationalDifficulty: 'LOW' | 'MEDIUM' | 'HIGH';
    isApplied: boolean;
  };
}

export interface DisasterChainBreakerModel {
  hazardEvent: string;
  chainLinks: CascadeChainLink[];
  baselineRiskScore: number;
  currentRiskScore: number;
  totalRiskReductionPct: number;
  totalExposureReductionPct: number;
  recommendedBestIntervention: string;
}

// ============================================================================
// NEW FEATURE 12: RISK HALF-LIFE & RECOVERY
// ============================================================================
export interface RiskDecayPoint {
  hoursElapsed: number;
  modeledRisk: number;
  label: string;
  stage: string;
}

export interface RiskHalfLifeModel {
  initialRisk: number;
  currentRisk: number;
  projectedRisk: number;
  halfLifeHours: number;
  timeToSafeHours: number;
  activeInterventions: string[];
  rainfallStatus: 'CONTINUING' | 'EASING' | 'STOPPED';
  decayTrajectory: RiskDecayPoint[];
  safeHighwayReopenWindow?: string;
  drainageRateMmPerHour?: number;
}

// ============================================================================
// NEW FEATURE 13: VULNERABLE POPULATION INTELLIGENCE ("WHO NEEDS HELP FIRST?")
// ============================================================================
export interface DemographicVulnerabilityZone {
  zoneId: string;
  villageName: string;
  district: string;
  totalPopulation: number;
  childrenCount: number;
  elderlyCount: number;
  schoolsCount: number;
  hospitalsCount: number;
  touristExposureCount: number;
  remoteHouseholdCount: number;
  criticalInfrastructureDetails: string[];
  exposureScore: number; // 0 - 100
  evacuationPriority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  evacuationPriorityRank: number; // 1, 2, 3...
  recommendedEvacShelter: string;
  accessRoadStatus: 'OPEN' | 'VULNERABLE' | 'BLOCKED';
}

// ============================================================================
// NEW FEATURE 14: SATELLITE OBSERVATION PRIORITY
// ============================================================================
export interface SatelliteTaskingPriorityZone {
  zoneId: string;
  zoneName: string;
  coordinates: [number, number];
  riskScore: number;
  confidencePct: number;
  escalationVelocity: 'RAPID' | 'STEADY' | 'STATIC';
  dataUncertaintyPct: number;
  recentRainfall24hMm: number;
  lastOpticalPassDate: string;
  lastSarPassDate: string;
  priorityRank: 'VERY_HIGH' | 'HIGH' | 'MODERATE';
  recommendedSensorPayload: 'Sentinel-1 InSAR' | 'Sentinel-2 Multispectral' | 'RISAT-1A SAR' | 'Cartosat-3 High-Res';
  recommendationDirective: string;
}

// ============================================================================
// NEW FEATURE 15: RAINFALL TRIGGER FINGERPRINT
// ============================================================================
export interface RainfallFingerprintAnalysis {
  stationId: string;
  stationName: string;
  rainfallIntervals: {
    '1h': number;
    '3h': number;
    '6h': number;
    '12h': number;
    '24h': number;
    '3d': number;
    '7d': number;
  };
  intensityClassification: 'MODERATE' | 'HEAVY' | 'VERY_HEAVY' | 'EXTREME_CLOUDBURST';
  antecedentPrecipitationIndex: number; // API in mm
  criticalThresholdMm: number;
  similarityToDisasterPatternPct: number; // e.g. 87%
  matchedHistoricalDisaster: string;
  diagnosticMessage: string;
  chartSeries: { interval: string; currentMm: number; historicalDisasterMm: number; thresholdMm: number }[];
  isTriggerBreached?: boolean;
  currentRainfallMmH?: number;
  antecedentRainfall3dMm?: number;
  cumulative7dMm?: number;
  saturationIndexPct?: number;
}

// ============================================================================
// NEW FEATURE 16: SLOPE WEAKNESS INDEX
// ============================================================================
export interface SlopeWeaknessProfile {
  stationId: string;
  stationName: string;
  coordinates: [number, number];
  slopeAngleDeg: number;
  soilWetnessPct: number;
  groundMovementDetected: boolean;
  groundMovementRateMmPerDay: number;
  historicalRiskRating: 'Low' | 'Moderate' | 'High';
  terrainCurvature: 'Concave (Water-accumulating)' | 'Convex' | 'Planar';
  stabilityIndex: 'STABLE' | 'WATCH' | 'WEAK' | 'CRITICAL' | 'UNKNOWN';
  stabilityScore: number; // 0 - 100
  shearStressRatio: number;
  factorOfSafety: number;
  gisFillColor: string;
  failureLikelihood?: string;
  geologicalFormation?: string;
  slopeAngleDegrees?: number;
  cohesionKpa?: number;
  internalFrictionAngleDeg?: number;
  poreWaterPressureKpa?: number;
  saturationRatioPct?: number;
}

// ============================================================================
// NEW FEATURE 17: AI DISASTER EVIDENCE FUSION (8 SOURCES)
// ============================================================================
export interface EvidenceSourceCard {
  id: string;
  sourceType: 'Satellite InSAR' | 'Weather Doppler & Rain' | 'Soil Hydrology' | 'Terrain & DEM' | 'GIS Infrastructure' | 'Historical Memory' | 'Crowdsourced Field Reports' | 'Ground Sensor Mesh';
  iconName: string;
  status: 'ACTIVE_ELEVATED' | 'ACTIVE_NORMAL' | 'ACTIVE_LOW' | 'DATA_UNAVAILABLE';
  freshness: string;
  weightPct: number;
  confidenceScore: number;
  findingSummary: string;
  supportsElevatedRisk: boolean;
}

export interface EvidenceFusionReport {
  stationId: string;
  stationName: string;
  sourcesSupportingElevatedRisk: number; // e.g. 7
  totalAvailableSources: number; // e.g. 8
  evidenceAgreementPct: number; // e.g. 91%
  aiConfidencePct: number; // e.g. 88%
  sources: EvidenceSourceCard[];
  fusionVerdict: string;
}

// ============================================================================
// NEW FEATURE 18: RESCUE TEAM DIGITAL TWIN & REROUTING
// ============================================================================
export interface RescueUnitDigitalTwin {
  id: string;
  callsign: string;
  unitType: 'Rescue Team (NDRF)' | 'Ambulance' | 'Heavy Excavator' | 'Disaster Relief Boat' | 'Medical Squad' | 'Emergency 4x4';
  currentLocation: [number, number];
  destinationName: string;
  destinationCoords: [number, number];
  originalRouteName: string;
  isOriginalRouteBlocked: boolean;
  alternateRouteName?: string;
  additionalDistanceKm?: number;
  status: 'STATIONARY' | 'EN_ROUTE' | 'REROUTING' | 'ON_SITE';
  personnelCount: number;
  specializedGear: string;
  aiRouteRecommendation: string;
}

// ============================================================================
// NEW FEATURE 19: PREVENTION ROI SIMULATOR
// ============================================================================
export interface PreventionMeasureROI {
  id: string;
  measureName: string;
  estimatedCostLakhsInr: number;
  modeledRiskReductionPct: number;
  modeledExposureReductionPct: number;
  implementationTimeDays: number;
  efficiencyRatio: number; // Risk Reduction % / Cost Lakhs
  recommendationRating: 'HIGHEST_EFFICIENCY' | 'BALANCED' | 'HIGH_CAPEX';
  notes: string;
}

// ============================================================================
// NEW FEATURE 20: AI NO-ALERT DECISION
// ============================================================================
export interface AiNoAlertEvaluation {
  locationName: string;
  evaluatedRainfall: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH';
  evaluatedSlope: 'GENTLE' | 'MODERATE' | 'STEEP';
  evaluatedSoilMoisture: 'DRY' | 'MODERATE' | 'SATURATED';
  evaluatedHistoricalRisk: 'LOW' | 'MODERATE' | 'HIGH';
  evaluatedGroundMovement: 'NONE' | 'CREEP' | 'ACCELERATED';
  finalRiskScore: number;
  alertDecision: 'SEND_EMERGENCY_SMS' | 'DO_NOT_SEND_ALERT_YET' | 'ISSUE_ADVISORY_ONLY';
  confidencePct: number;
  primaryReason: string;
  preventedFalseAlarmBenefit: string;
}

// ============================================================================
// NEW FEATURE 21: COUNTERFACTUAL DISASTER AI
// ============================================================================
export interface CounterfactualScenarioComparison {
  scenarioTitle: string;
  observedActionTime: string;
  counterfactualActionTime: string;
  observedActionName: string;
  counterfactualActionName: string;
  observedExposurePopulation: number;
  counterfactualExposurePopulation: number;
  populationExposureDelta: number; // e.g. -260
  observedResponseDelayMinutes: number;
  counterfactualResponseDelayMinutes: number;
  responseDelayDeltaMinutes: number; // e.g. -60
  observedRoadClosureKm: number;
  counterfactualRoadClosureKm: number;
  modeledRiskReductionPct: number; // e.g. 35%
  summaryInsight: string;
  withoutAiScenario?: {
    alertLeadTimeMinutes: number;
    casualtiesCount: number;
    injuriesCount: number;
    roadBlockageDurationHours: number;
    economicLossCrInr: number;
  };
  withAiScenario?: {
    alertLeadTimeMinutes: number;
    casualtiesCount: number;
    injuriesCount: number;
    roadBlockageDurationHours: number;
    economicLossCrInr: number;
  };
  netLivesSaved?: number;
  netInjuriesPrevented?: number;
  netEconomicSavingsCrInr?: number;
}

// ============================================================================
// NEW FEATURE 22: AI RESPONSE SCORE
// ============================================================================
export interface AiResponseScoreEvaluation {
  overallScore: number; // 0 - 100
  grade: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL_DELAY';
  breakdown: {
    speedScore: number; // /25
    riskReductionScore: number; // /25
    populationProtectionScore: number; // /20
    routeEfficiencyScore: number; // /15
    resourceEfficiencyScore: number; // /15
  };
  populationProtectedCount: number;
  overallRiskReductionPct: number;
  recommendationsForImprovement: string[];
}

// ============================================================================
// NEW FEATURE 23: EMERGENCY DECISION BOARD
// ============================================================================
export interface EmergencyDecisionBoardItem {
  id: string;
  eventName: string;
  riskScore: number;
  confidencePct: number;
  exposureLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  affectedRoads: string[];
  affectedVillages: string[];
  weatherStatus: string;
  satelliteObservationSummary: string;
  recommendedAction: string;
  smsStatus: 'DRAFT' | 'APPROVED' | 'SENT' | 'SUPPRESSED';
  fieldTeamStatus: 'STANDBY' | 'DISPATCHED' | 'ON_SITE';
}

// ============================================================================
// NEW FEATURE 24: AI EVIDENCE TIMELINE
// ============================================================================
export interface EvidenceTimelineEvent {
  id: string;
  timestamp: string;
  timeOffset: string; // e.g. "08:00", "09:30"
  category: 'WEATHER' | 'SATELLITE' | 'RISK' | 'FIELD_REPORT' | 'ALERT' | 'DECISION';
  headline: string;
  detail: string;
  severity: 'info' | 'warning' | 'emergency';
  icon: string;
  sourceConfidencePct: number;
}

// ============================================================================
// NEW FEATURE 25 & 26: DISASTER DIGITAL MEMORY & INCIDENT COMPARISON
// ============================================================================
export interface DisasterDigitalMemoryProfile {
  zoneId: string;
  zoneName: string;
  totalHistoricalEventsRecorded: number;
  previousHighestRiskScore: number;
  averageRainfallBeforeEventsMm: number;
  previousEffectiveResponse: string;
  previousOutcome: string;
  predictionAccuracyRatePct: number;
  historicalEvents: {
    year: number;
    eventName: string;
    rainfallMm: number;
    impactDescription: string;
    fatalities: number;
    roadCutDays: number;
  }[];
}

export interface IncidentComparisonReport {
  eventA: {
    name: string;
    year: number;
    rainfallMm: number;
    soilMoisturePct: number;
    slopeDeg: number;
    groundMovementMm: number;
    historicalRisk: string;
    exposurePopulation: number;
    responseAction: string;
    impactOutcome: string;
  };
  eventB: {
    name: string;
    year: number;
    rainfallMm: number;
    soilMoisturePct: number;
    slopeDeg: number;
    groundMovementMm: number;
    historicalRisk: string;
    exposurePopulation: number;
    responseAction: string;
    impactOutcome: string;
  };
  overallSimilarityPct: number; // e.g. 82%
  keyDivergenceFactor: string;
  concludingAnalogy: string;
}

// ============================================================================
// NEW FEATURE 27: DISASTER SEVERITY TRAJECTORY
// ============================================================================
export interface SeverityTrajectoryProjection {
  horizon: string;
  trajectory: 'ESCALATING' | 'PLATEAU' | 'RECOVERING';
  projectedRiskScore: number;
  failureProbabilityPct: number;
  primaryRiskDriver: string;
  recommendedPreparednessAction: string;
}

export interface SeverityTrajectoryState {
  pastRiskScore: number;
  currentRiskScore: number;
  projectedRiskScore: number;
  trajectoryTrend: 'ESCALATING_RAPIDLY' | 'STABLE_ELEVATED' | 'RECOVERING' | 'STEADY_SAFE';
  statusBadge: string;
  colorHex: string;
  timeHorizonHours: number;
  projections?: SeverityTrajectoryProjection[];
}

// ============================================================================
// NEW FEATURE 28 & 29: FIELD VERIFICATION TASK & REPORT TRUST SCORE
// ============================================================================
export interface FieldVerificationTask {
  taskId: string;
  title: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  assignedToSector: string;
  targetCoordinates: [number, number];
  reason: string;
  status: 'PENDING_DISPATCH' | 'ACCEPTED' | 'REJECTED' | 'VERIFIED_COMPLETED';
  officerNotes?: string;
  hasPhotoUpload: boolean;
  hasVideoUpload: boolean;
  officerConfirmation: 'CONFIRMED_HAZARD' | 'REJECTED_FALSE_ALARM' | 'PENDING';
  updatedRiskScoreAfterVerification?: number;
}

export interface FieldReportTrustEvaluation {
  reportId: string;
  reporterHandle: string;
  overallTrustScorePct: number; // e.g. 92%
  status: 'HIGH_CONFIDENCE_FIELD_EVIDENCE' | 'REASONABLE_CONFIDENCE' | 'REQUIRES_VERIFICATION';
  metadataBreakdown: {
    gpsValidityScore: number;
    timestampConsistencyScore: number;
    imageMetadataAuthenticityScore: number;
    locationConsistencyScore: number;
    duplicateAnalysisScore: number;
    aiComputerVisionConsistencyScore: number;
    reporterHistoryScore: number;
  };
  aiImageAnalysisSummary: string;
}

// ============================================================================
// NEW FEATURE 30 & 31: AI DISASTER COMMANDER & 60-SECOND BRIEF
// ============================================================================
export interface AiCommanderSynthesis {
  zoneName: string;
  whatIsHappening: string;
  whyIsItHappening: string;
  whoIsAffected: string;
  whatCouldHappenNext: string;
  whatShouldWeDo: string;
  whatDataIsMissing: string;
  commanderConfidencePct: number;
  generatedTimestamp: string;
}

export interface SixtySecondBrief {
  briefId: string;
  headline: string;
  formattedSpeechText: string;
  bulletPoints: string[];
  recommendedActionDirectives: string[];
  preparedBy: string;
  classification: 'OFFICIAL USE ONLY' | 'PUBLIC EMERGENCY BROADCAST' | 'INTER-AGENCY DIRECTIVE';
}

// ============================================================================
// NEW FEATURE 32 & 33: AI DECISION AUDIT & DISASTER LEARNING SCORE
// ============================================================================
export interface AiDecisionAuditRecord {
  decisionId: string; // e.g. 'BH-2026-00421'
  timestamp: string;
  incidentZone: string;
  inputsEvaluated: string[];
  riskScore: number;
  confidencePct: number;
  evidenceSourcesCount: number;
  systemRecommendation: string;
  actionTakenByAuthority: string;
  operationalOutcome: string;
  auditSignatureHash: string;
}

export interface DisasterLearningEvaluation {
  eventId: string;
  eventName: string;
  predictedRiskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  observedEventOutcome: 'CONFIRMED_LANDSLIDE' | 'MINOR_DEBRIS' | 'NEAR_MISS' | 'FALSE_ALARM';
  leadTimeHours: number;
  isFalseAlarm: boolean;
  predictionAccuracyGrade: 'A+' | 'A' | 'B' | 'C' | 'RE-CALIBRATION_REQUIRED';
  geotechnicalModelLessonsLearned: string[];
  suggestedWeightAdjustments: string[];
}
