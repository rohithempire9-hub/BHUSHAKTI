export type CopilotIntent =
  | 'GENERAL'
  | 'GREETING'
  | 'CURRENT_RISK'
  | 'RISK_EXPLANATION'
  | 'WEATHER'
  | 'RAINFALL'
  | 'SOIL_MOISTURE'
  | 'LANDSLIDE'
  | 'FLOOD'
  | 'TERRAIN'
  | 'LOCATION'
  | 'MAP'
  | 'MAP_LAYER'
  | 'HISTORICAL_EVENT'
  | 'SIMULATION'
  | 'SIMULATION_STATUS'
  | 'SIMULATION_IMPACT'
  | 'WHAT_IF'
  | 'AFFECTED_BUILDINGS'
  | 'AFFECTED_ROADS'
  | 'POPULATION_EXPOSURE'
  | 'SAFE_DESTINATION'
  | 'SAFE_ROUTE'
  | 'EVACUATION'
  | 'EMERGENCY_RESPONSE'
  | 'EMERGENCY_BRIEF'
  | 'SHELTER'
  | 'HOSPITAL'
  | 'ROAD_STATUS'
  | 'SATELLITE'
  | 'SATELLITE_DATA'
  | '3D_DIGITAL_TWIN'
  | 'AI_EXPLANATION'
  | 'TECHNOLOGY'
  | 'ABOUT_BHUSAKTHI'
  | 'HOW_IT_WORKS'
  | 'LANGUAGE_CHANGE'
  | 'ALERT_WORKFLOW'
  | 'HELP'
  | 'UNKNOWN';

export interface CopilotLocationContext {
  id?: string;
  name?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  cameraHeight?: number;
}

export interface CopilotApiRequest {
  message: string;
  language?: string; // 'English', 'Telugu', 'Hindi', 'Assamese', 'en', 'te', 'hi', 'as'
  location?: CopilotLocationContext;
  context?: {
    location?: CopilotLocationContext;
    currentRisk?: {
      score?: number;
      status?: string;
      safetyFactor?: number;
      failureProbabilityPct?: number;
    };
    weather?: {
      rainfallRateMmH?: number;
      rainfall24hMm?: number;
      soilMoisturePct?: number;
      temperatureC?: number;
      poreWaterPressureKpa?: number;
      isLive?: boolean;
    };
    simulation?: {
      active?: boolean;
      disasterType?: string;
      severity?: string;
      timelineMinutes?: number;
      impactZoneKm2?: number;
      exposedBuildingsCount?: number;
      blockedRoadName?: string;
      alternativeRouteName?: string;
      shelterName?: string;
    };
  };
  history?: Array<{
    sender: 'user' | 'copilot';
    text: string;
  }>;
}

export interface CopilotAction {
  type:
    | 'CHANGE_LOCATION'
    | 'START_SIMULATION'
    | 'RESET_SIMULATION'
    | 'SHOW_MAP_LAYER'
    | 'FIND_SAFE_ROUTE'
    | 'CHANGE_LANGUAGE'
    | 'NAVIGATE_SECTION'
    | 'OPEN_ALERT_MODAL'
    | 'EMERGENCY_DISPATCH';
  payload?: any;
  label?: string;
}

export interface CopilotApiResponse {
  success: boolean;
  answer: string;
  language: string;
  languageCode?: string;
  location: string;
  confidence: number;
  intent: CopilotIntent | string;
  actions: CopilotAction[];
  sources: string[];
  sourceStatus: 'REAL DATA' | 'SIMULATION' | 'ESTIMATE';
  toolUsed?: string;
  modelUsed?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  timestamp: string;
  text: string;
  sources?: string[];
  actions?: CopilotAction[];
  sourceStatus?: 'REAL DATA' | 'SIMULATION' | 'ESTIMATE';
  language?: string;
  confidence?: number;
  location?: string;
  error?: boolean;
  errorCode?: string | number;
  failedQuery?: string;
  actionLink?: {
    label: string;
    section: string;
  };
}
