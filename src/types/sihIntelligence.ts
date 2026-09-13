export interface SlopeMemoryRecord {
  slopeId: string; // e.g. 'TAW-042'
  slopeName: string;
  stationId: string;
  state: string;
  district: string;
  coordinates: [number, number]; // [lat, lng]
  elevationM: number;
  slopeAngleDeg: number;
  geologyType: string;
  historicalDisasterYear: number;
  historicalEventName: string;
  historicalRainfallMm: number;
  historicalSoilMoisturePct: number;
  historicalGroundMovementMm: number;
  historicalPorePressureKpa: number;
  historicalImpactDescription: string;
  historicalFatalities: number;
  currentRainfallMm: number;
  currentSoilMoisturePct: number;
  currentGroundMovementMm: number;
  currentPorePressureKpa: number;
  similarityScorePct: number; // 0 - 100%
  similarityFactors: {
    factor: string;
    historicalVal: string;
    currentVal: string;
    matchPct: number;
    contribution: string;
  }[];
  verdictText: string;
}

export interface DisasterFingerprint {
  slopeId: string;
  slopeName: string;
  metrics: {
    name: string;
    currentValue: number; // 0 - 100 normalized
    historicalValue: number; // 0 - 100 normalized
    unit: string;
    rawCurrent: number;
    rawHistorical: number;
  }[];
  overallSimilarityPct: number;
  explanation: string;
}

export interface RiskFusionWeights {
  rainfall: number; // default 0.30
  soilMoisture: number; // default 0.20
  slope: number; // default 0.20
  historicalRisk: number; // default 0.15
  terrainInstability: number; // default 0.10
  exposure: number; // default 0.05
}

export interface WhyNowExplanation {
  previousRiskScore: number;
  currentRiskScore: number;
  deltaScore: number;
  primaryExplanation: string;
  contributions: {
    factor: string;
    previousVal: number;
    currentVal: number;
    scoreContribution: number; // e.g. +28
    severity: 'low' | 'moderate' | 'high' | 'critical';
  }[];
  finalScoreText: string;
}

export interface DataStreamHealth {
  streamName: string; // e.g. 'Weather Telemetry', 'Terrain & DEM', etc.
  status: 'GREEN' | 'YELLOW' | 'RED';
  freshnessText: string;
  sampleRate: string;
  statusLabel: 'EXCELLENT' | 'LIMITED' | 'UNAVAILABLE' | 'STALE';
  notes?: string;
}

export interface DataQualityReport {
  overallConfidencePct: number; // e.g. 88%
  confidenceGrade: 'VERY HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  confidenceExplanation: string;
  streams: DataStreamHealth[];
}

export interface CascadeNode {
  id: string;
  title: string;
  category: 'Trigger' | 'Primary Hazard' | 'Secondary Cascade' | 'Infrastructure Impact' | 'Societal Impact';
  probabilityPct: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  affectedLocations: string[];
}

export interface CascadeHazardChain {
  id: string;
  title: string;
  triggerEvent: string;
  activeSeverity: 'moderate' | 'high' | 'critical';
  nodes: CascadeNode[];
  riverBlockageRiskPct: number;
  downstreamFloodRiskPct: number;
  isolationRiskPct: number;
  actionDirective: string;
}

export interface ImpactAsset {
  id: string;
  name: string;
  type: 'village' | 'road' | 'bridge' | 'school' | 'hospital' | 'power_grid' | 'telecom';
  distanceFromHazardKm: number;
  populationOrCapacity: number;
  status: 'operational' | 'threatened' | 'blocked' | 'evacuate';
  coordinates: [number, number];
}

export interface VulnerablePopulationReport {
  zoneId: string;
  zoneName: string;
  totalPopulation: number;
  childrenCount: number;
  elderlyCount: number;
  criticalFacilitiesCount: number;
  roadAccessStatus: 'OPEN' | 'COMPROMISED' | 'SEVERELY BLOCKED';
  exposureScore: number; // 0 - 100
  priorityRanking: number; // 1 = highest
}

export interface EmergencyResourceItem {
  id: string;
  type: 'Rescue Team (NDRF)' | 'Rescue Team (SDRF)' | 'Ambulance' | 'Heavy Excavator' | 'Emergency Medical Unit' | 'Relief Distribution Truck' | 'Air Evac Helicopter';
  unitName: string;
  stationBase: string;
  currentStatus: 'Available' | 'Dispatched' | 'En Route' | 'On Site';
  assignedZone: string;
  etaMinutes: number;
}

export interface ResponsePlanStep {
  stepNumber: number;
  title: string;
  agency: string;
  priority: 'Immediate' | 'Urgent' | 'Standard';
  status: 'Pending' | 'In Progress' | 'Completed';
  instructions: string;
}

export interface SafeRouteItem {
  routeId: string;
  name: string;
  distanceKm: number;
  estTimeMinutes: number;
  safetyRating: 'Safe Corridor' | 'Caution Required' | 'Blocked / Impassable';
  pathDescription: string;
  isRecommended: boolean;
}

export interface SatelliteChangeObservation {
  id: string;
  locationName: string;
  dateBefore: string;
  dateAfter: string;
  vegetationLossPct: number;
  slopeDisplacementMm: number;
  detectedDeformationType: string;
  confidencePct: number;
  thumbnailBeforeUrl?: string;
  thumbnailAfterUrl?: string;
}

export interface EvidenceConflictRecord {
  id: string;
  location: string;
  satelliteObservation: string;
  fieldReportObservation: string;
  conflictStatus: 'CRITICAL CONFLICT' | 'MODERATE DISCREPANCY' | 'VERIFIED ALIGNED';
  systemActionDirective: string;
  escalatedPriority: boolean;
}

export interface PostDisasterIncidentRecord {
  incidentId: string; // e.g. 'TAW-042-2026-001'
  eventDate: string;
  locationName: string;
  state: string;
  hazardType: string;
  predictedRiskBefore: number;
  observedImpact: string;
  rainfall24hPreEventMm: number;
  alertDispatchTime: string;
  evacuationResponseTimeMinutes: number;
  fatalitiesRecorded: number;
  injuriesRecorded: number;
  infrastructureDamageSummary: string;
  rootGeotechnicalCause: string;
  postDisasterLessonsLearned: string[];
}
