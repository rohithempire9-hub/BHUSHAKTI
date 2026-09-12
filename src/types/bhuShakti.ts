export type BhuLanguage = 'en' | 'as' | 'kha' | 'lus' | 'mni';

export type SensingNodeMode = 'physical' | 'virtual';

export interface SensingNodeDevice {
  id: string;
  nodeCode: string;             // e.g. "Node_01_Tawang"
  label: string;                // e.g. "Node_01_Tawang (Virtual AI)"
  locationName: string;         // e.g. "Tawang Sela Pass"
  state: string;                // e.g. "Arunachal Pradesh"
  latitude: number;
  longitude: number;
  elevationM: number;
  mode: SensingNodeMode;        // 'physical' | 'virtual'
  
  // Real-time telemetry
  soilMoisturePct: number;      // 0 - 100%
  tiltAngleDeg: number;         // 0 - 45°
  hourlyRainfallMm: number;     // mm/h
  rainfall24hMm: number;        // 24h mm
  poreWaterPressureKpa: number; // kPa
  safetyFactor: number;         // FS < 1.0 failing, > 1.5 stable
  riskLevel: 'low' | 'warning' | 'emergency';
  
  // Physical ESP32 Hardware Diagnostics
  rssiDbm?: number;             // e.g. -68 dBm
  batteryVoltage?: number;      // e.g. 3.92 V
  batteryPct?: number;          // e.g. 88%
  loraFrequencyMhz?: number;    // e.g. 865.2 MHz (IN865)
  firmwareVersion?: string;     // e.g. "v2.4.1-esp32-s3"
  lastPacketReceived?: string;
  
  // Virtual AI Diagnostics
  pinnModelName?: string;       // e.g. "GeoPINN-NER-v4"
  aiConfidencePct?: number;     // e.g. 96.4%
  syntheticNoisePct?: number;   // e.g. 2.1%
  isSimulatingSurge?: boolean;  // True when user tests stress trigger
}

export interface RegisteredDeviceProfile {
  id: string;
  deviceName: string;           // e.g. "NDRF Sector Commander 1"
  mobileNumber: string;         // e.g. "+91 94350 12890"
  region: string;               // e.g. "Dima Hasao, Assam"
  nodeAssociation: string;      // e.g. "Node_04_Dima_Hasao"
  alertStatus: 'ARMED / ACTIVE' | 'DISPATCHED' | 'STANDBY';
  role: 'NDRF Task Force' | 'District Disaster Authority' | 'BRO Road Patrol' | 'Village Council Head' | 'Rail Safety Unit';
  lastPingTime: string;
}

export interface RemoteVillagePin {
  id: string;
  villageName: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  populationAtRisk: number;
  riskStatus: 'low' | 'warning' | 'emergency';
  associatedHighway: string;    // e.g. "NH-10", "NH-27", "NH-29"
  safeShelterHaven: string;
  lastInspection: string;
  currentAdvisory: string;
}

export interface HighwayRiskSegment {
  id: string;
  highwayCode: string;          // e.g. "NH-10"
  segmentName: string;          // e.g. "Sevoke - Teesta - 9th Mile Burtuk"
  state: string;
  coordinates: [number, number][];
  overallRisk: 'low' | 'warning' | 'emergency';
  riskScorePct: number;
  activeBlockades: number;
  criticalPoints: {
    kmMarker: string;
    lat: number;
    lng: number;
    status: 'low' | 'warning' | 'emergency';
    description: string;
  }[];
}

export interface CitizenCrowdsourceReport {
  id: string;
  timestamp: string;
  locationName: string;
  state: string;
  latitude: number;
  longitude: number;
  elevationM?: number;
  reporterName: string;
  reporterRole: string;
  contactNumber: string;
  observations: string;
  photoUrl: string;
  photoFileName?: string;
  
  // EXIF metadata
  exifExtracted: boolean;
  exifData?: {
    cameraModel?: string;
    dateTimeOriginal?: string;
    gpsAltitudeM?: number;
    gpsAccuracyM?: number;
    shutterSpeed?: string;
  };
  
  // AI Identification
  disasterType: string;         // e.g. "Debris Flow & Toe Slump"
  severity: 'low' | 'warning' | 'emergency';
  aiConfidencePct: number;
  recommendedAction: string;
  
  // Workflow Status
  status: 'Pending Review' | 'Dispatched to NDRF' | 'Verified Disaster';
  dispatchedUnit?: string;
}
