export type RiskStatus = 'safe' | 'moderate' | 'high' | 'critical';

export interface SensorTelemetry {
  temperatureC: number;           // Ambient & surface soil temperature (°C)
  soilMoisturePct: number;        // Volumetric Water Content (%)
  erosionRateMmPerYr: number;     // Soil erosion rate (mm/year)
  erosionLiveMmH: number;         // Active live runoff erosion (mm/hour)
  poreWaterPressureKpa: number;   // Pore water pressure in shear zone (kPa)
  vibrationMmS: number;           // Peak particle velocity / seismic vibration (mm/s)
  rainfallRateMmH: number;        // Current precipitation rate (mm/h)
  rainfall24hMm: number;          // 24-hour cumulative rainfall (mm)
  displacementMm: number;         // Extensometer slope creep displacement (mm)
  tiltAngleDeg: number;           // Live inclinometer tilt variance (degrees)
  lastUpdated: string;            // Timestamp
}

export interface MLRiskAssessment {
  riskScore: number;              // 0 to 100%
  safetyFactor: number;           // Factor of Safety (FS): <1.0 failing, >1.8 safe
  status: RiskStatus;             // 'safe' | 'moderate' | 'high' | 'critical'
  isSafeZone: boolean;            // True if status is strictly 'safe'
  failureProbabilityPct: number;  // 0 - 99%
  mlConfidencePct: number;        // Model certainty (e.g., 94%)
  mlPredictionWindow: string;     // e.g. "Safe / Stable > 60 days" or "Warning: 4-12 hours"
  primaryRiskDrivers: string[];   // e.g. ["Critical Pore Pressure", "Monsoon Infiltration"]
  recommendedAction: string;      // Action directive
  lastEvaluated: string;
}

export interface NaturalDisasterRecord {
  id: string;
  year: number | string;
  eventTitle: string;
  category: 'Major Landslide' | 'GLOF & Debris Surge' | 'Earthquake & Liquefaction' | 'Monsoon Cloudburst' | 'Riverbank Collapse';
  state: string;
  location: string;
  fatalitiesText: string;
  impactDescription: string;
  geotechnicalTrigger: string;
  severityLevel: 'Catastrophic' | 'Severe' | 'Moderate';
}

export interface SafeZoneCriteria {
  id: string;
  title: string;
  measuredValue: string;
  requiredThreshold: string;
  isPassed: boolean;
  scientificExplanation: string;
}

export interface SafeZoneAuditResult {
  isCertifiedSafe: boolean;
  stationId: string;
  stationName: string;
  overallSafetyFactor: number;
  criteria: SafeZoneCriteria[];
  certifiedTimestamp: string;
  certificateId: string;
  geotechnicalNotes: string;
}

export interface AnthropogenicHillCutting {
  hasGovernmentCut: boolean;
  cutActivityType: 'Highway 4-Laning Excavation' | 'Railway Tunnel & Slope Cut' | 'Hill Terracing & Urban Cutting' | 'Quarrying Toe Removal' | 'Natural Stable Slope';
  naturalSlopeDeg: number;
  excavatedSlopeDeg: number;
  toeDebuttressed: boolean;
  retainingWallCondition: 'Missing / None' | 'Severely Cracked' | 'Shotcrete Damaged' | 'Stable Geotechnical Anchors';
  blastingFissureIndex: number; // 0 to 10
  cutRiskScore: number; // 0 to 100
  governmentFieldNotice: string;
}

export interface GlacierRisk {
  isGlacierZone: boolean;
  glacierName?: string;
  moraineLakeName?: string;
  iceMeltRateMmDay?: number;
  tempTriggerC?: number;
  moraineDamStabilityFS?: number;
  tempMoistureSurgeActive?: boolean;
  thermalSensitivityIndex?: number; // 1 to 10
  glofRiskDescription?: string;
}

export interface EscapeRoute {
  safeShelterName: string;
  shelterElevationM: number;
  elevationGainM: number;
  primaryRouteName: string;
  alternateRouteName: string;
  distanceKm: number;
  estimatedEscapeMins: number;
  blockedRoadsList: string[];
  safeWaypoints: {
    name: string;
    lat: number;
    lng: number;
    type: 'Safe Shelter' | 'Evacuation Hub' | 'Blocked Road' | 'Hazard Zone';
  }[];
  evacuationInstructions: string[];
}

export interface StationKPIs {
  activeAlerts: number;
  highRiskZones: number;
  landslideRiskPct: number;
  floodRiskPct: number;
  affectedRoads: number;
  villagesAtRisk: number;
  alertSubtitle: string;
  zoneSubtitle: string;
  roadSubtitle: string;
  villageSubtitle: string;
}

export interface LandslideStation {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  slopeAngleDeg: number;
  soilType: string;
  vegetationCoverPct: number;
  faultDistanceKm: number;
  historicalLandslidesCount: number;
  telemetry: SensorTelemetry;
  riskAssessment: MLRiskAssessment;
  isCustomLocation?: boolean;
  disasterHistory?: NaturalDisasterRecord[];
  safeAuditResult?: SafeZoneAuditResult;
  anthropogenicCutting?: AnthropogenicHillCutting;
  glacierRisk?: GlacierRisk;
  escapeRoute?: EscapeRoute;
  kpis?: StationKPIs;
}

export interface SmsSubscriber {
  id: string;
  fullName: string;
  phoneNumber: string;
  countryCode: string;
  role: 'Resident' | 'Emergency Responder' | 'Geotechnical Officer' | 'Civil Defense' | 'Transport Authority';
  assignedStationId: string;      // Station ID or 'ALL'
  alertThreshold: 'all' | 'moderate_and_above' | 'high_and_critical' | 'critical_only';
  isActive: boolean;
  registeredAt: string;
}

export interface SmsAlertRecord {
  id: string;
  timestamp: string;
  stationId: string;
  stationName: string;
  region: string;
  severity: RiskStatus;
  message: string;
  recipientsCount: number;
  recipientsList: string[];       // Phone numbers
  deliveryStatus: 'Delivered' | 'Broadcasting' | 'Failed';
  triggerReason: string;
}

export interface TelemetryHistoryPoint {
  time: string;
  temperatureC: number;
  soilMoisturePct: number;
  erosionRate: number;
  porePressureKpa: number;
  riskScore: number;
}
