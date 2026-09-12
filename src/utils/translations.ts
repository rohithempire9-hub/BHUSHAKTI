import { BhuLanguage } from '../types/bhuShakti';

export interface TranslationStrings {
  platformTitle: string;
  platformSubtitle: string;
  networkStatus: string;
  offlineSyncActive: string;
  selectLanguage: string;
  
  // Navigation
  navLiveMap: string;
  navSensingGrid: string;
  navCitizenReports: string;
  navSmsBroadcast: string;
  navRiskForecasts: string;
  
  // Risk states
  lowRisk: string;
  warningRisk: string;
  emergencyRisk: string;
  
  // Sections
  gisMapTitle: string;
  gisMapSubtitle: string;
  sensingGridTitle: string;
  sensingGridSubtitle: string;
  smsHubTitle: string;
  smsHubSubtitle: string;
  citizenPortalTitle: string;
  citizenPortalSubtitle: string;
  analyticsTitle: string;
  
  // Actions
  simulateMassSos: string;
  switchNodeMode: string;
  physicalMode: string;
  virtualAiMode: string;
  submitReport: string;
  autoExtractExif: string;
  
  // Alerts
  criticalAlertTitle: string;
  criticalAlertMsg: string;
  dismiss: string;
  acknowledged: string;
}

export const TRANSLATIONS: Record<BhuLanguage, TranslationStrings> = {
  en: {
    platformTitle: 'BhuShakti',
    platformSubtitle: 'AI-Based Early Warning & Landslide Risk Monitoring for North Eastern Region (NER)',
    networkStatus: 'Network Status',
    offlineSyncActive: 'Offline-Sync Active',
    selectLanguage: 'Select Language',
    
    navLiveMap: 'Live Map',
    navSensingGrid: 'Sensing Grid',
    navCitizenReports: 'Citizen Reports',
    navSmsBroadcast: 'SMS Broadcast Panel',
    navRiskForecasts: 'Risk Forecasts',
    
    lowRisk: 'Low Risk',
    warningRisk: 'Warning / Moderate',
    emergencyRisk: 'High Emergency Risk',
    
    gisMapTitle: 'Interactive GIS Topographic Risk Map',
    gisMapSubtitle: 'Simulated NH Corridors & Remote Village Monitoring across 8 NER States',
    sensingGridTitle: 'Hybrid Sensing Grid Manager',
    sensingGridSubtitle: 'Real-time LoRa Telemetry & Physics-Informed Virtual AI Node Nodes',
    smsHubTitle: 'SMS Early Warning Hub',
    smsHubSubtitle: 'Multi-Network Emergency Cell Broadcast & Registered Responder Directory',
    citizenPortalTitle: 'Citizen Crowdsourced Reporting Portal',
    citizenPortalSubtitle: 'Field Photo Geotagging & Automated AI Geohazard Classification',
    analyticsTitle: 'Rainfall vs. Soil Saturation Dynamic Forecast',
    
    simulateMassSos: 'Simulate Mass SOS Alert',
    switchNodeMode: 'Switch between Physical ESP32 / Virtual AI Mode',
    physicalMode: 'Physical ESP32 Mode',
    virtualAiMode: 'Virtual AI Mode',
    submitReport: 'Dispatch Citizen Georeport',
    autoExtractExif: 'Auto-extract GPS metadata from photo EXIF tags',
    
    criticalAlertTitle: 'CRITICAL SLOPE HAZARD TRIGGERED',
    criticalAlertMsg: 'Soil Moisture > 80% & Inclinometer Tilt > 2.5° detected! Immediate evacuation protocol advised.',
    dismiss: 'Dismiss',
    acknowledged: 'Acknowledged',
  },
  
  as: {
    platformTitle: 'ভূশক্তি (BhuShakti)',
    platformSubtitle: 'উত্তৰ-পূৰ্বাঞ্চলৰ বাবে AI ভিত্তিক ভূমিস্খলন আগতীয়া সতৰ্কবাৰ্তা আৰু নিৰীক্ষণ ব্যৱস্থা',
    networkStatus: 'নেটৱৰ্ক স্থিতি',
    offlineSyncActive: 'অফলাইন-চিঙ্ক সক্ৰিয়',
    selectLanguage: 'ভাষা বাছক',
    
    navLiveMap: 'সজীৱ মেপ',
    navSensingGrid: 'চেন্সিং গ্ৰিড',
    navCitizenReports: 'নাগৰিক প্ৰতিবেদন',
    navSmsBroadcast: 'SMS সম্প্ৰচাৰ পেনেল',
    navRiskForecasts: 'বিপদৰ পূৰ্বানুমান',
    
    lowRisk: 'কম বিপদ (Low)',
    warningRisk: 'সতৰ্কতা (Warning)',
    emergencyRisk: 'জৰুৰীকালীন বিপদ (Emergency)',
    
    gisMapTitle: 'পাৰস্পৰিক GIS ভূ-প্ৰাকৃতিক বিপদ মানচিত্ৰ',
    gisMapSubtitle: 'উত্তৰ-পূৰ্বাঞ্চলৰ ৮খন ৰাজ্যৰ ৰাষ্ট্ৰীয় ঘাইপথ আৰু দুৰ্গম গাঁওসমূহৰ নিৰীক্ষণ',
    sensingGridTitle: 'হাইব্ৰিড চেন্সিং গ্ৰিড ব্যৱস্থাপক',
    sensingGridSubtitle: 'বাস্তৱ-সময়ৰ শাৰীৰিক ESP32 আৰু ভাৰ্চুৱেল AI নোড নিৰীক্ষণ',
    smsHubTitle: 'SMS আগতীয়া সতৰ্কবাৰ্তা হাব',
    smsHubSubtitle: 'জৰুৰীকালীন কোষ সম্প্ৰচাৰ আৰু পঞ্জীভুক্ত সঁহাৰিকৰ্তা নিয়ন্ত্ৰণ',
    citizenPortalTitle: 'নাগৰিক ক্ৰাউডচৰ্চিং প্ৰতিবেদন প’ৰ্টেল',
    citizenPortalSubtitle: 'ক্ষেত্ৰৰ ফটো আৰু AI ভিত্তিক দুৰ্যোগ চিনাক্তকৰণ',
    analyticsTitle: 'বৰষুণ বনাম মাটিৰ আৰ্দ্ৰতা গতিশীল বিশ্লেষণ',
    
    simulateMassSos: 'সামূহিক SOS সতৰ্কবাৰ্তা অনুকৰণ কৰক',
    switchNodeMode: 'শাৰীৰিক ESP32 / ভাৰ্চুৱেল AI মোডৰ মাজত সলনি কৰক',
    physicalMode: 'শাৰীৰিক ESP32 মোড',
    virtualAiMode: 'ভাৰ্চুৱেল AI মোড',
    submitReport: 'প্ৰতিবেদন প্ৰেৰণ কৰক',
    autoExtractExif: 'ফটোৰ পৰা GPS মেটাডাটা স্বয়ংক্ৰিয়ভাৱে সংগ্ৰহ কৰক (EXIF)',
    
    criticalAlertTitle: 'গুৰুতৰ ভূমিস্খলনৰ আশংকা সংকেত',
    criticalAlertMsg: 'মাটিৰ আৰ্দ্ৰতা ৮০% তকৈ অধিক আৰু হেলনীয়া কোণ বৃদ্ধি পাইছে! তৎপৰভাৱে স্থান খালী কৰাৰ নিৰ্দেশ।',
    dismiss: 'অগ্ৰাহ্য কৰক',
    acknowledged: 'স্বীকাৰ কৰা হ’ল',
  },
  
  kha: {
    platformTitle: 'BhuShakti (Ka Bor ka Khyndew)',
    platformSubtitle: 'Ka AI ban ai jingmaham kloi halor ka jingtwad khyndew ha Thain Shatei Lam Mihngi (NER)',
    networkStatus: 'Jinglong ka Network',
    offlineSyncActive: 'Offline-Sync treikam',
    selectLanguage: 'Jied Ktien',
    
    navLiveMap: 'Map ba Treikam',
    navSensingGrid: 'Sensing Grid',
    navCitizenReports: 'Kaiphod ki Nongshongshnong',
    navSmsBroadcast: 'SMS Broadcast Panel',
    navRiskForecasts: 'Jingantor Jingma',
    
    lowRisk: 'Jingma ba rit (Low)',
    warningRisk: 'Jingmaham (Warning)',
    emergencyRisk: 'Jingma ba khraw (Emergency)',
    
    gisMapTitle: 'GIS Map Jingma halor ki Lum bad Surok Bah',
    gisMapSubtitle: 'Jingpeitngor ia ki surok bah kum NH-10, NH-27 bad ki shnong nongkyndong',
    sensingGridTitle: 'Hybrid Sensing Grid Manager',
    sensingGridSubtitle: 'ESP32 Hardware bad Virtual AI Nodes ban pynbiang data',
    smsHubTitle: 'SMS Jingmaham Kloi Hub',
    smsHubSubtitle: 'Phah SMS sha ki nongtrei pyllait im bad nongshongshnong',
    citizenPortalTitle: 'Portal Kaiphod ki Nongshongshnong',
    citizenPortalSubtitle: 'Thep dur bad shim GPS kyrpang na ka dur (EXIF)',
    analyticsTitle: 'Jingshlei Um bad ka Jingkdor ka Khyndew',
    
    simulateMassSos: 'Pynmih Mass SOS Alert',
    switchNodeMode: 'Pynkylla hapdeng Physical ESP32 / Virtual AI Mode',
    physicalMode: 'Physical ESP32 Mode',
    virtualAiMode: 'Virtual AI Mode',
    submitReport: 'Phah ka Kaiphod',
    autoExtractExif: 'Shim beit ia ka GPS na ka dur (EXIF tags)',
    
    criticalAlertTitle: 'JINGMAHAM BA KHRAW HALOR KA JINGTWAD KHYNDEW',
    criticalAlertMsg: 'Ka um hapoh khyndew palat 80% bad ka jingthiah lum ka la kylla! Kynriah mardor.',
    dismiss: 'Wad phai',
    acknowledged: 'La sngewthuh',
  },
  
  lus: {
    platformTitle: 'BhuShakti (Lei Chakna)',
    platformSubtitle: 'Hmarchhak Bial (NER) tan Min Hlauhawm Hriattirna leh Enzui Rual Khawl (AI-Based)',
    networkStatus: 'Network Dinhmun',
    offlineSyncActive: 'Offline-Sync a nung mek',
    selectLanguage: 'Tawng Thlang rawh',
    
    navLiveMap: 'Map Nung',
    navSensingGrid: 'Sensing Grid',
    navCitizenReports: 'Mipuite Report',
    navSmsBroadcast: 'SMS Puandarhna Panel',
    navRiskForecasts: 'Hlauhawm Thlir Lawkna',
    
    lowRisk: 'Hlauhawm Lo (Low)',
    warningRisk: 'Fimkhur a tul (Warning)',
    emergencyRisk: 'Hlauhawm Nasa (Emergency)',
    
    gisMapTitle: 'GIS Khawvel Risk Map',
    gisMapSubtitle: 'NH-10, NH-27 leh khaw kilkhawr zualte vilna hmun',
    sensingGridTitle: 'Hybrid Sensing Grid Enkawltu',
    sensingGridSubtitle: 'ESP32 Physical Device leh Virtual AI Nodes inkawp',
    smsHubTitle: 'SMS Hriattirna Rang Hub',
    smsHubSubtitle: 'Emergency Cell Broadcast hmanga mipuite hrilhhriatna',
    citizenPortalTitle: 'Mipui Tana Min Thlalak Thawnna Portal',
    citizenPortalSubtitle: 'Thlalak thehluh leh GPS Metadata (EXIF) lakchhuah zung zung',
    analyticsTitle: 'Ruahsur Dan leh Lei Hnawn Dan Khaikhinna',
    
    simulateMassSos: 'Mass SOS Alert Chhuah rawh',
    switchNodeMode: 'Physical ESP32 / Virtual AI Mode inthlakna',
    physicalMode: 'Physical ESP32 Mode',
    virtualAiMode: 'Virtual AI Mode',
    submitReport: 'Report Thawn rawh',
    autoExtractExif: 'Thlalak atangin GPS Metadata la chhuak nghal rawh (EXIF)',
    
    criticalAlertTitle: 'LEI MIN HLAUHAWM NASA TAK A THLENG MEK',
    criticalAlertMsg: 'Lei hnawnna 80% a pel a, awn lam a sang hle! Inthiarfihlim vat a ngai.',
    dismiss: 'Hnar rawh',
    acknowledged: 'Hriatthiam a ni',
  },
  
  mni: {
    platformTitle: 'ভুশক্তি (BhuShakti)',
    platformSubtitle: 'অৱাং-নোংপোক লমদমগীদমক AI য়ুম্ফম ওইবা চীং ক্রপ খঙহনবা অমসুং য়েংশিনবা সিস্তেম',
    networkStatus: 'নেতৱার্ক ফিবম',
    offlineSyncActive: 'ওফলাইন-সিঙ্ক চত্থরি',
    selectLanguage: 'লোল খনবিউ',
    
    navLiveMap: 'লাইভ মেপ',
    navSensingGrid: 'সেন্সিং গ্রিদ',
    navCitizenReports: 'মীয়ামগী রিপোর্ত',
    navSmsBroadcast: 'SMS ব্রোদকাস্ত পেনেল',
    navRiskForecasts: 'খুদোংথিবা ফোংদোকপা',
    
    lowRisk: 'খুদোংথিবা নেম্বা (Low)',
    warningRisk: 'চেকশিনবা য়াওবা (Warning)',
    emergencyRisk: 'য়াম্না খুদোংথিবা (Emergency)',
    
    gisMapTitle: 'GIS চীং-কোল খুদোংথিবা মেপ',
    gisMapSubtitle: 'NER ৰাজ্যশিংগী নেসনেল হাইৱেজ অমসুং খুঙ্গংশিং য়েংশিনবা',
    sensingGridTitle: 'হাইব্রিদ সেন্সিং গ্রিদ মেনেজর',
    sensingGridSubtitle: 'ফিজিকেল ESP32 অমসুং ভর্চুৱেল AI নোডস লাইভ দেতা',
    smsHubTitle: 'SMS খোঙজেল য়াংনা খঙহনবা হব',
    smsHubSubtitle: 'ইমর্জেন্সী সেল ব্রোদকাস্ত অমসুং রেস্পোন্দর লিস্ত',
    citizenPortalTitle: 'মীয়ামগী দেতা থারকপা পোর্তেল',
    citizenPortalSubtitle: 'চীং ক্ৰপ ফোটো থারকপা অমসুং GPS মেতাদেতা লৌথোকপা (EXIF)',
    analyticsTitle: 'নোং চুরকপা অমসুং লৈবাক ঈশিং পুশিনবা এনলাইসিস',
    
    simulateMassSos: 'মাশ SOS সংকেত থাদোকউ',
    switchNodeMode: 'ফিজিকেল ESP32 / ভর্চুৱেল AI মোদ হোংদোকউ',
    physicalMode: 'ফিজিকেল ESP32 মোদ',
    virtualAiMode: 'ভর্চুৱেল AI মোদ',
    submitReport: 'রিপোর্ত থাগৎলু',
    autoExtractExif: 'ফোটোদগী GPS মেতাদেতা মশক খঙদোকউ (EXIF tags)',
    
    criticalAlertTitle: 'চীং ক্ৰপ খুদোংথিনিংঙাই ওইরবা সংকেত',
    criticalAlertMsg: 'লৈবাক ঈশিং পুশিনবা ৮০% হেল্লে অমসুং চীং য়েংবা হেনগৎলে! মফম অসিদগী লাপ্না চত্থোকউ।',
    dismiss: 'ত্থাদোকউ',
    acknowledged: 'খঙলে',
  }
};
