import { BhuLanguage } from '../types/bhuShakti';

export interface TranslationSchema {
  // General / Platform
  platformTitle: string;
  platformSubtitle: string;
  selectLanguage: string;
  searchPlaceholder: string;
  systemOnline: string;
  weatherLive: string;
  gisUpdated: string;
  networkStatus: string;
  offlineSyncActive: string;

  // Sidebar Items
  dashboard: string;
  riskMap: string;
  liveMonitoring: string;
  safeRoutes: string;
  analytics: string;
  weatherRadar: string;
  alerts: string;
  smsWarning: string;
  fieldEvidence: string;
  disasterIntelligence: string;
  floodInundation: string;
  disaster3d: string;
  whatIfSimulator: string;
  historicalArchive: string;
  settings: string;

  // Sidebar Sections
  monitoringGisSection: string;
  emergencyFieldSection: string;
  advIntelligenceSection: string;
  systemHardwareSection: string;

  // Sidebar Badges
  badgeAlert: string;
  badgeRoutes: string;
  badgeActive: string;
  badgeDirectSos: string;
  badgeNew: string;
  badgeWarRoom: string;
  badgeEvents: string;

  // Map Controls & Labels
  searchStationOrArea: string;
  station: string;
  mapLayers: string;
  satellite: string;
  terrain: string;
  street: string;
  riskZones: string;
  safeZones: string;
  safeRoutesLayer: string;
  extreme: string;
  focus: string;
  safe: string;
  moderate: string;
  highRisk: string;
  critical: string;
  extremeRisk: string;
  floodInundationRisk: string;
  rainfallDopplerScale: string;
  thermalInfraredScale: string;
  windVelocity: string;
  riverCorridors: string;
  active: string;
  fitBounds: string;
  currentLocationGps: string;
  designatedEvacuationHaven: string;
  safeDestination: string;

  // AI Panel
  aiRiskIntelligence: string;
  liveSensors: string;
  physicsEngine: string;
  imdSynced: string;
  overview: string;
  hillCuts: string;
  glaciers: string;
  safeRoute: string;
  landslideRisk: string;
  factorOfSafety: string;
  factorOfSafetyShort: string;
  poreWaterPressure: string;
  live24hRainAccumulation: string;
  slopeCreep: string;
  hillCutFactor: string;
  naturalEquilibrium: string;
  glacialGlof: string;
  noGlacialBasin: string;
  sendEmergencySms: string;
  fullSmsDispatchCenter: string;
  whatsApp: string;

  // Sensors
  liveSensorTelemetry: string;
  temperature: string;
  soilMoisture: string;
  porePressure: string;
  rainfall: string;
  vibration: string;
  windSpeed: string;
  tilt: string;
  rainfall24h: string;

  // Statuses
  stable: string;
  normal: string;
  watch: string;
  elevated: string;
  light: string;
  high: string;
  criticalStatus: string;
  online: string;
  offline: string;
  torrential: string;
  heavy: string;
  gusty: string;
  calm: string;
  warning: string;
  surge: string;

  // Buttons & Actions
  inspectNode: string;
  sendEmergencyAlert: string;
  simulateMassSosAlert: string;
  fullMapView: string;
  photoEvidence: string;
  zoomToSafeZone: string;
  openEvacuationCommand: string;
  dismiss: string;
  acknowledged: string;

  // Metric Cards
  monitoring: string;
  activeIoTTelemetry: string;
  lowHazardEquilibrium: string;
  poreCreepWatchlist: string;
  slopeWarningActive: string;
  immediateAction: string;
  activeSos: string;
  focusNode: string;

  // Legacy mappings for full compatibility
  navDashboard?: string;
  navRiskMap?: string;
  navLiveMonitoring?: string;
  navSafeRoutes?: string;
  navAnalytics?: string;
  navWeatherRadar?: string;
  navAlerts?: string;
  navSmsWarning?: string;
  navFieldEvidence?: string;
  navDisasterIntelligence?: string;
  navDigitalTwin?: string;
  navWhatIfSimulator?: string;
  navHistoricalArchive?: string;
  navSettings?: string;
  sectionMonitoringGis?: string;
  sectionEmergencyField?: string;
  sectionAdvIntelligence?: string;
  sectionSystem?: string;
  metricMonitoring?: string;
  metricSafe?: string;
  metricModerate?: string;
  metricHigh?: string;
  metricCritical?: string;
  metricActiveSos?: string;
  metricFocusNode?: string;
  factorOfSafetyStable?: string;
  increasedVibration?: string;
  porePressureSurge?: string;
  gisMapHeader?: string;
  tabOverview?: string;
  tabHillCut?: string;
  tabGlacier?: string;
  tabEscape?: string;
  live24hRain?: string;
  sensorTemperature?: string;
  sensorSoilMoisture?: string;
  sensorPorePressure?: string;
  sensorRainfall?: string;
  sensorVibration?: string;
  sensorWindSpeed?: string;
  sensorTilt?: string;
  sensor24hRainfall?: string;
  statusNormal?: string;
  statusElevated?: string;
  statusWatch?: string;
  statusHigh?: string;
  statusCritical?: string;
  statusActive?: string;
  statusTorrential?: string;
  statusLight?: string;
  statusStable?: string;
  statusAlert?: string;
  statusGusty?: string;
  statusCalm?: string;
  statusWarning?: string;
  statusModerate?: string;
  statusHeavy?: string;
  mapSearchPlaceholder?: string;
  navLiveMap?: string;
  navSensingGrid?: string;
  navCitizenReports?: string;
  navSmsBroadcast?: string;
  navRiskForecasts?: string;
  lowRisk?: string;
  warningRisk?: string;
  emergencyRisk?: string;
  gisMapTitle?: string;
  gisMapSubtitle?: string;
  sensingGridTitle?: string;
  sensingGridSubtitle?: string;
  smsHubTitle?: string;
  smsHubSubtitle?: string;
  citizenPortalTitle?: string;
  citizenPortalSubtitle?: string;
  analyticsTitle?: string;
  simulateMassSos?: string;
  switchNodeMode?: string;
  physicalMode?: string;
  virtualAiMode?: string;
  submitReport?: string;
  autoExtractExif?: string;
  criticalAlertTitle?: string;
  criticalAlertMsg?: string;
}

export interface LanguageOption {
  code: BhuLanguage;
  label: string;
  native: string;
}
