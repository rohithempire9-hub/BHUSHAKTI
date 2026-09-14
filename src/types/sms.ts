export interface GeoJSONPolygon {
  type: 'Polygon';
  // GeoJSON standard: coordinates is array of rings, each ring is array of [longitude, latitude]
  coordinates: number[][][];
}

export type AlertSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Advisory';

export interface DisasterAlertPayload {
  headline: string;
  severity: AlertSeverity | string;
  instruction: string;
  geometry: GeoJSONPolygon;
  channel?: 'sms' | 'cell_broadcast' | 'all';
  targetStationId?: string;
  incidentType?: string;
  sendRealSms?: boolean;
  priorityRecipients?: string[];
}

export interface TargetedRecipient {
  phone: string;
  name: string;
  role: string;
  distanceKm?: number;
  isInsidePolygon: boolean;
  reason: string;
}

export interface DeliveryReceipt {
  recipient: string;
  phone: string;
  status: 'DELIVERED' | 'QUEUED' | 'TRANSMITTED' | 'SIMULATED_SUCCESS' | 'FAILED';
  provider: 'Twilio' | 'Fast2SMS' | 'BSNL_CellBroadcast_4370' | 'Native_Cellular' | 'Telecom_Gateway';
  timestamp: string;
  messageId: string;
  details?: string;
}

export interface BroadcastPolygonResponse {
  status: 'DISPATCH_INITIATED' | 'COMPLETED' | 'FAILED';
  incident_id: string;
  recipients_targeted: number;
  recipients_list?: TargetedRecipient[];
  sms_message: string;
  cap_xml?: string;
  polygon_wkt?: string;
  delivery_receipts?: DeliveryReceipt[];
  provider_used?: string;
  error?: string;
}

export interface SmsGatewaySettings {
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromPhone?: string;
  fast2SmsApiKey?: string;
  preferredProvider: 'auto' | 'twilio' | 'fast2sms' | 'cellular_direct';
  autoCellBroadcastCh4370: boolean;
}
