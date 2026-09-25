/**
 * BhuShakti AI - Geospatial Intelligence Dataset
 * Precise coordinates for Safe Routes, Community Hubs & Safe Areas,
 * and Geotechnical Multi-Tier Risk Zones (Extreme, High, Moderate, Low).
 */

export interface SafeEvacuationRoute {
  id: string;
  name: string;
  corridorCode: string;
  state: string;
  coordinates: [number, number][];
  elevationProfile: string;
  safetyStatus: 'ALL-CLEAR' | 'CAUTION-STABILIZED' | 'HIGH-RIDGE-BYPASS';
  distanceKm: number;
  estEvacTimeMinutes: number;
  connectedHub: string;
  capacityVehiclesPerHour: number;
  surfaceType: string;
  description: string;
}

export interface CommunityHub {
  id: string;
  name: string;
  hubType: 'Central Relief Hub' | 'Safe Evacuation Haven' | 'Medical Staging Post' | 'Heritage Rock Citadel';
  state: string;
  district: string;
  coordinates: [number, number];
  elevationM: number;
  safeCapacityPeople: number;
  currentOccupancy: number;
  supplies: {
    foodRationDays: number;
    waterSource: string;
    medicalAid: string;
    powerBackup: string;
    comms: string;
  };
  status: 'Ready / Fully Stocked' | 'Active Staging' | 'Open Safe Refuge';
  safeAreaRadiusMeters: number;
  safeAreaCoords: [number, number][];
}

export type RiskLevelTier = 'extreme' | 'high' | 'moderate' | 'low';

export interface GeospatialRiskZone {
  id: string;
  name: string;
  category: RiskLevelTier;
  state: string;
  district: string;
  coordinates: [number, number][];
  safetyFactor: number; // Factor of Safety (FS)
  instabilityScorePct: number;
  slopeAngleDeg: number;
  populationAtRisk: number;
  primaryHazard: string;
  activeAdvisory: string;
  geotechnicalNotes: string;
  recommendedSafeRouteId: string;
  nearestCommunityHubId: string;
}

// ==========================================
// 1. SAFE EVACUATION ROUTES & HIGH-RIDGE BYPASSES
// ==========================================
export const SAFE_EVACUATION_ROUTES: SafeEvacuationRoute[] = [
  {
    id: 'route-tawang-dirang-bypass',
    name: 'Dirang – Lubrang High Ridge Forest Bypass',
    corridorCode: 'EVAC-CORR-01',
    state: 'Arunachal Pradesh',
    coordinates: [
      [27.358, 92.245],
      [27.412, 92.195],
      [27.465, 92.152],
      [27.518, 92.088],
      [27.576, 91.986],
    ],
    elevationProfile: '1,580m – 2,240m (High Ridge Crest)',
    safetyStatus: 'ALL-CLEAR',
    distanceKm: 58,
    estEvacTimeMinutes: 85,
    connectedHub: 'hub-jang-pavilion',
    capacityVehiclesPerHour: 450,
    surfaceType: 'Reinforced Geogrid Macadam & Hard Gravel',
    description: 'Stabilized bypass traversing competent high-altitude granite bedrock crest. Completely avoids Sela Pass active debris chute.',
  },
  {
    id: 'route-sikkim-burtuk-bypass',
    name: 'Gangtok – Singtam High-Ridge Alternate Bypass',
    corridorCode: 'EVAC-CORR-02',
    state: 'Sikkim',
    coordinates: [
      [27.2415, 88.5021], // Singtam
      [27.2850, 88.5420],
      [27.3250, 88.6080], // Gangtok STNM Hospital
      [27.3680, 88.6380], // High Ridge over Burtuk
      [27.4200, 88.6650], // Higher North Sikkim Spur
    ],
    elevationProfile: '1,350m – 1,920m (Crest Traverse)',
    safetyStatus: 'ALL-CLEAR',
    distanceKm: 38,
    estEvacTimeMinutes: 55,
    connectedHub: 'hub-mangan-central',
    capacityVehiclesPerHour: 600,
    surfaceType: 'All-Weather Bituminous with Rock Netting',
    description: 'Upper contour road constructed 300m above NH-10 Burtuk sinking gap. Engineered drainage and gabion barriers ensure zero debris spill.',
  },
  {
    id: 'route-haflong-upper-lifeline',
    name: 'Haflong Upper Ridge Circuit Lifeline Route',
    corridorCode: 'EVAC-CORR-03',
    state: 'Assam',
    coordinates: [
      [25.178, 93.028], // Haflong Plateau
      [25.152, 93.065],
      [25.112, 93.115],
      [25.075, 93.168],
      [25.015, 93.210], // Silchar High Link
    ],
    elevationProfile: '680m – 820m (Sandstone Tableland)',
    safetyStatus: 'ALL-CLEAR',
    distanceKm: 46,
    estEvacTimeMinutes: 65,
    connectedHub: 'hub-haflong-plateau',
    capacityVehiclesPerHour: 520,
    surfaceType: 'Dual-Lane Asphalt with Concrete Retaining Walls',
    description: 'Elevated tableland highway bypassing Jatinga clay slump corridor. Fully guarded by deep bored drainage culverts.',
  },
  {
    id: 'route-kohima-viswema-ridge',
    name: 'Kohima – Viswema Mountain Pass Evacuation Corridor',
    corridorCode: 'EVAC-CORR-04',
    state: 'Nagaland',
    coordinates: [
      [25.675, 94.108], // Kohima High Crest
      [25.642, 94.120],
      [25.605, 94.130],
      [25.569, 94.138], // Viswema Hub
      [25.525, 94.152], // Southern Pass
    ],
    elevationProfile: '1,440m – 1,750m (Mountain Ridge Pass)',
    safetyStatus: 'ALL-CLEAR',
    distanceKm: 32,
    estEvacTimeMinutes: 45,
    connectedHub: 'hub-viswema-ground',
    capacityVehiclesPerHour: 400,
    surfaceType: 'Rock-Anchored Macadam',
    description: 'Traverses stable Barail range sandstone spine. Avoids Chumukedima-Dzüdza gorge bottleneck during heavy precipitation.',
  },
  {
    id: 'route-noney-upper-trail',
    name: 'Noney High-Ground Relief & Evacuation Trail',
    corridorCode: 'EVAC-CORR-05',
    state: 'Manipur',
    coordinates: [
      [24.795, 93.615],
      [24.818, 93.642],
      [24.845, 93.685],
      [24.872, 93.720],
      [24.898, 93.765],
    ],
    elevationProfile: '520m – 960m (Ascending Hill Spur)',
    safetyStatus: 'CAUTION-STABILIZED',
    distanceKm: 28,
    estEvacTimeMinutes: 50,
    connectedHub: 'hub-noney-high-camp',
    capacityVehiclesPerHour: 320,
    surfaceType: 'Compacted Aggregate with Reinforced Culverts',
    description: 'Ascends 400m above the Ijei river gorge floor. Safe escape path from potential landslide dam outburst floodings.',
  },
  {
    id: 'route-teesta-crest-bypass',
    name: 'Teesta Valley High Crest Bypass Corridor',
    corridorCode: 'EVAC-CORR-06',
    state: 'West Bengal & Sikkim',
    coordinates: [
      [26.915, 88.460],
      [26.965, 88.490],
      [27.025, 88.525],
      [27.085, 88.550],
      [27.145, 88.570],
    ],
    elevationProfile: '450m – 1,100m (High Terrace Contour)',
    safetyStatus: 'ALL-CLEAR',
    distanceKm: 42,
    estEvacTimeMinutes: 60,
    connectedHub: 'hub-passingdang-terrace',
    capacityVehiclesPerHour: 480,
    surfaceType: 'Engineered High Contour Pavement',
    description: 'Maintains traffic connectivity when Teesta river exceeds danger level by remaining 200m above riparian scour zones.',
  },
];

// ==========================================
// 2. COMMUNITY HUBS & SAFE ASSEMBLY AREAS
// ==========================================
export const COMMUNITY_HUBS: CommunityHub[] = [
  {
    id: 'hub-mangan-central',
    name: 'Mangan Senior Secondary High-Ground Community Hub',
    hubType: 'Central Relief Hub',
    state: 'Sikkim',
    district: 'North Sikkim',
    coordinates: [27.512, 88.534],
    elevationM: 1380,
    safeCapacityPeople: 3500,
    currentOccupancy: 420,
    supplies: {
      foodRationDays: 21,
      waterSource: 'Protected Gravity Mountain Spring & RO Filter',
      medicalAid: 'Full Trauma Triage & 40 Recovery Cots',
      powerBackup: '65 kVA Solar Microgrid + Diesel Gen',
      comms: 'ISRO SATCOM Terminal & BSNL VHF Radio',
    },
    status: 'Ready / Fully Stocked',
    safeAreaRadiusMeters: 450,
    safeAreaCoords: [
      [27.515, 88.531],
      [27.516, 88.538],
      [27.509, 88.537],
      [27.508, 88.530],
    ],
  },
  {
    id: 'hub-jang-pavilion',
    name: 'Jang Community Safe Haven & Evacuation Pavilion',
    hubType: 'Safe Evacuation Haven',
    state: 'Arunachal Pradesh',
    district: 'Tawang',
    coordinates: [27.576, 91.986],
    elevationM: 2150,
    safeCapacityPeople: 2200,
    currentOccupancy: 180,
    supplies: {
      foodRationDays: 30,
      waterSource: 'Filtered High Reservoir Tank',
      medicalAid: 'Army 4x4 Mobile Field Clinic & Oxygen Cylinders',
      powerBackup: 'Dual Micro-Hydro Generators',
      comms: 'VSAT Satellite Phone & Army Radio Frequency',
    },
    status: 'Active Staging',
    safeAreaRadiusMeters: 500,
    safeAreaCoords: [
      [27.579, 91.982],
      [27.580, 91.990],
      [27.573, 91.989],
      [27.572, 91.981],
    ],
  },
  {
    id: 'hub-haflong-plateau',
    name: 'Haflong Circuit House Upper Plateau Safe Hub',
    hubType: 'Central Relief Hub',
    state: 'Assam',
    district: 'Dima Hasao',
    coordinates: [25.178, 93.028],
    elevationM: 780,
    safeCapacityPeople: 4500,
    currentOccupancy: 610,
    supplies: {
      foodRationDays: 18,
      waterSource: 'District Underground Reservoir (200k Liters)',
      medicalAid: '100-Bed Field Surge Hospital & 4 ALS Ambulances',
      powerBackup: 'Twin 120 kVA Industrial Generators',
      comms: 'NDRF Dedicated High-Band Comms Vehicle',
    },
    status: 'Ready / Fully Stocked',
    safeAreaRadiusMeters: 600,
    safeAreaCoords: [
      [25.182, 93.023],
      [25.183, 93.033],
      [25.174, 93.032],
      [25.173, 93.022],
    ],
  },
  {
    id: 'hub-viswema-ground',
    name: 'Viswema Community Ground High Safe Haven',
    hubType: 'Safe Evacuation Haven',
    state: 'Nagaland',
    district: 'Kohima',
    coordinates: [25.569, 94.138],
    elevationM: 1680,
    safeCapacityPeople: 2800,
    currentOccupancy: 240,
    supplies: {
      foodRationDays: 25,
      waterSource: 'Natural Perennial Mountain Fountain System',
      medicalAid: 'Primary Health Extension Post & Antivenom Depot',
      powerBackup: '40 kVA Solar-Battery Backup',
      comms: 'Police Wireless Trunk & HAM Radio Club Station',
    },
    status: 'Ready / Fully Stocked',
    safeAreaRadiusMeters: 400,
    safeAreaCoords: [
      [25.572, 94.134],
      [25.573, 94.142],
      [25.566, 94.141],
      [25.565, 94.133],
    ],
  },
  {
    id: 'hub-passingdang-terrace',
    name: 'Passingdang Monastery High Ground Terrace',
    hubType: 'Safe Evacuation Haven',
    state: 'Sikkim',
    district: 'North Sikkim (Dzongu Reserve)',
    coordinates: [27.540, 88.475],
    elevationM: 1520,
    safeCapacityPeople: 1600,
    currentOccupancy: 110,
    supplies: {
      foodRationDays: 28,
      waterSource: 'Alpine Stream Filtration Tank',
      medicalAid: 'Emergency First Aid Kit & First Responders',
      powerBackup: '20 kVA Solar Inverter Bank',
      comms: 'Emergency Satellite Handset',
    },
    status: 'Open Safe Refuge',
    safeAreaRadiusMeters: 380,
    safeAreaCoords: [
      [27.543, 88.471],
      [27.544, 88.479],
      [27.537, 88.478],
      [27.536, 88.470],
    ],
  },
  {
    id: 'hub-khonoma-citadel',
    name: 'Khonoma Fort Rock Citadel Safe Haven',
    hubType: 'Heritage Rock Citadel',
    state: 'Nagaland',
    district: 'Kohima',
    coordinates: [25.651, 94.024],
    elevationM: 1620,
    safeCapacityPeople: 1900,
    currentOccupancy: 80,
    supplies: {
      foodRationDays: 35,
      waterSource: 'Traditional Protected Stone Cisterns',
      medicalAid: 'Village Red Cross Volunteer Clinic',
      powerBackup: 'Decentralized Solar Home Systems',
      comms: 'VHF Handheld Transceivers Network',
    },
    status: 'Ready / Fully Stocked',
    safeAreaRadiusMeters: 350,
    safeAreaCoords: [
      [25.654, 94.020],
      [25.655, 94.028],
      [25.648, 94.027],
      [25.647, 94.019],
    ],
  },
  {
    id: 'hub-champhai-complex',
    name: 'Champhai District Sports Complex Safe Relief Center',
    hubType: 'Central Relief Hub',
    state: 'Mizoram',
    district: 'Champhai',
    coordinates: [23.476, 93.332],
    elevationM: 1390,
    safeCapacityPeople: 5200,
    currentOccupancy: 450,
    supplies: {
      foodRationDays: 20,
      waterSource: 'Municipal Piped Water & Chlorination Plant',
      medicalAid: 'District Hospital Liaison Surgical Post',
      powerBackup: '80 kVA Automatic Diesel Generator',
      comms: 'Fiber Broadband + Satellite Redundant Link',
    },
    status: 'Ready / Fully Stocked',
    safeAreaRadiusMeters: 550,
    safeAreaCoords: [
      [23.480, 93.327],
      [23.481, 93.337],
      [23.472, 93.336],
      [23.471, 93.326],
    ],
  },
  {
    id: 'hub-noney-high-camp',
    name: 'Noney Upper Terrace Rescue Base & Safe Camp',
    hubType: 'Medical Staging Post',
    state: 'Manipur',
    district: 'Noney',
    coordinates: [24.845, 93.685],
    elevationM: 920,
    safeCapacityPeople: 2600,
    currentOccupancy: 380,
    supplies: {
      foodRationDays: 15,
      waterSource: 'Mobile Water Purification Bowser Unit',
      medicalAid: 'SDRF 30-Bed Acute Care Emergency Tent',
      powerBackup: 'Portable Inverter Generators (4x 7.5kVA)',
      comms: 'Indian Army Tactical Radio Post',
    },
    status: 'Active Staging',
    safeAreaRadiusMeters: 480,
    safeAreaCoords: [
      [24.849, 93.680],
      [24.850, 93.690],
      [24.841, 93.689],
      [24.840, 93.679],
    ],
  },
];

// ==========================================
// 3. GEOSPATIAL MULTI-TIER RISK ZONES
// (EXTREME, HIGH, MODERATE, LOW)
// ==========================================
export const GEOSPATIAL_RISK_ZONES: GeospatialRiskZone[] = [
  // ----------------------------------------
  // A. EXTREME RISK ZONES (Critical Geohazard - Red)
  // ----------------------------------------
  {
    id: 'zone-extreme-burtuk',
    name: 'Burtuk 9th Mile Active Sinking Basin',
    category: 'extreme',
    state: 'Sikkim',
    district: 'East Sikkim',
    coordinates: [
      [27.362, 88.608],
      [27.378, 88.635],
      [27.352, 88.648],
      [27.336, 88.620],
    ],
    safetyFactor: 0.74,
    instabilityScorePct: 94,
    slopeAngleDeg: 46,
    populationAtRisk: 3100,
    primaryHazard: 'Deep-Seated Rotational Shear & Progressive Sinking',
    activeAdvisory: 'CRITICAL EVACUATION ADVISORY: 1.8m road sinking detected. Total civilian vehicle ban on NH-10 section.',
    geotechnicalNotes: 'Colluvial slope saturated by cloudburst runoff; shear strength lower than active overburden weight.',
    recommendedSafeRouteId: 'route-sikkim-burtuk-bypass',
    nearestCommunityHubId: 'hub-mangan-central',
  },
  {
    id: 'zone-extreme-jatinga',
    name: 'Jatinga Valley Debris Flow & Sinking Chute',
    category: 'extreme',
    state: 'Assam',
    district: 'Dima Hasao',
    coordinates: [
      [25.102, 92.962],
      [25.148, 92.978],
      [25.142, 93.018],
      [25.092, 92.998],
    ],
    safetyFactor: 0.81,
    instabilityScorePct: 96,
    slopeAngleDeg: 49,
    populationAtRisk: 4200,
    primaryHazard: 'Mass Clay Colluvium Slide & Highway Breach',
    activeAdvisory: 'EMERGENCY CODE RED: 150m road bench destroyed. Water accumulating rapidly behind debris slip.',
    geotechnicalNotes: 'Over-consolidated shale weathered into slick plastic clay with zero effective cohesion under saturation.',
    recommendedSafeRouteId: 'route-haflong-upper-lifeline',
    nearestCommunityHubId: 'hub-haflong-plateau',
  },
  {
    id: 'zone-extreme-noney',
    name: 'Noney Tupul Railway Yard Rupture Basin',
    category: 'extreme',
    state: 'Manipur',
    district: 'Noney',
    coordinates: [
      [24.798, 93.618],
      [24.842, 93.638],
      [24.832, 93.672],
      [24.788, 93.652],
    ],
    safetyFactor: 0.69,
    instabilityScorePct: 98,
    slopeAngleDeg: 52,
    populationAtRisk: 3800,
    primaryHazard: 'Debris Avalanche into River & Flash Flood Outburst',
    activeAdvisory: 'IMMEDIATE SIREN EVACUATION: Hill cut overburden moving at 12 mm/h towards Ijei river gorge.',
    geotechnicalNotes: 'Uncompacted excavated railway fill resting on inclined sandstone plane with continuous groundwater discharge.',
    recommendedSafeRouteId: 'route-noney-upper-trail',
    nearestCommunityHubId: 'hub-noney-high-camp',
  },
  {
    id: 'zone-extreme-sela',
    name: 'Sela Pass South Headscarp Rupture Sector',
    category: 'extreme',
    state: 'Arunachal Pradesh',
    district: 'West Kameng / Tawang',
    coordinates: [
      [27.488, 92.082],
      [27.532, 92.098],
      [27.522, 92.132],
      [27.478, 92.115],
    ],
    safetyFactor: 0.85,
    instabilityScorePct: 91,
    slopeAngleDeg: 48,
    populationAtRisk: 2200,
    primaryHazard: 'High-Angle Rock Shear Plane Activation',
    activeAdvisory: 'BORDER CORRIDOR CODE RED: 22,000 m³ rock mass impending release over NH-13 Km 42-45.',
    geotechnicalNotes: 'Glacial freeze-thaw cycles expanded rock clefts; pore-water pressure exceeds critical shear threshold.',
    recommendedSafeRouteId: 'route-tawang-dirang-bypass',
    nearestCommunityHubId: 'hub-jang-pavilion',
  },
  {
    id: 'zone-extreme-melthum',
    name: 'Melthum Stone Quarry Sinking Face',
    category: 'extreme',
    state: 'Mizoram',
    district: 'Aizawl',
    coordinates: [
      [23.700, 92.692],
      [23.732, 92.708],
      [23.725, 92.732],
      [23.692, 92.718],
    ],
    safetyFactor: 0.78,
    instabilityScorePct: 92,
    slopeAngleDeg: 54,
    populationAtRisk: 2900,
    primaryHazard: 'Quarry High-Wall Planar Cleavage Failure',
    activeAdvisory: 'CRITICAL HIGH-WALL WARNING: Tension fissures propagating into Aizawl southern road flank.',
    geotechnicalNotes: 'Steeply dipping siltstone beds weakened by unscientific quarrying and heavy seasonal monsoons.',
    recommendedSafeRouteId: 'route-kohima-viswema-ridge',
    nearestCommunityHubId: 'hub-champhai-complex',
  },

  // ----------------------------------------
  // B. HIGH RISK ZONES (Orange)
  // ----------------------------------------
  {
    id: 'zone-high-teesta-gorge',
    name: 'Teesta River Gorge Scour & Toe Undermining Zone',
    category: 'high',
    state: 'West Bengal & Sikkim',
    district: 'Kalimpong / Darjeeling',
    coordinates: [
      [27.038, 27.038 < 88 ? 88.478 : 27.038], // safeguard lat,lng
      [27.082, 88.512],
      [27.068, 88.542],
      [27.022, 88.508],
    ],
    safetyFactor: 1.08,
    instabilityScorePct: 78,
    slopeAngleDeg: 42,
    populationAtRisk: 5200,
    primaryHazard: 'Hydraulic Toe Scour & Highway Undermining',
    activeAdvisory: 'HIGH HAZARD ALERT: Teesta River velocity 4.2 m/s eroding foundation of retaining masonry.',
    geotechnicalNotes: 'Metamorphic Daling phyllites experiencing rapid toe loss under turbulent river vortex action.',
    recommendedSafeRouteId: 'route-teesta-crest-bypass',
    nearestCommunityHubId: 'hub-passingdang-terrace',
  },
  {
    id: 'zone-high-dzudza',
    name: 'Dzüdza River Bridge Landslide Approach Zone',
    category: 'high',
    state: 'Nagaland',
    district: 'Kohima',
    coordinates: [
      [25.668, 94.032],
      [25.702, 94.052],
      [25.695, 94.078],
      [25.658, 94.062],
    ],
    safetyFactor: 1.12,
    instabilityScorePct: 75,
    slopeAngleDeg: 44,
    populationAtRisk: 3400,
    primaryHazard: 'Talus Creep & Abutment Displacement',
    activeAdvisory: 'HIGH RISK ADVISORY: One-way commercial vehicle traffic only. Escort vehicles deployed.',
    geotechnicalNotes: 'Disang shales interbedded with crushed mudstones prone to swelling upon moisture intake.',
    recommendedSafeRouteId: 'route-kohima-viswema-ridge',
    nearestCommunityHubId: 'hub-khonoma-citadel',
  },
  {
    id: 'zone-high-mangan',
    name: 'Mangan North Ridge Crown Crack Zone',
    category: 'high',
    state: 'Sikkim',
    district: 'North Sikkim',
    coordinates: [
      [27.492, 88.512],
      [27.532, 88.528],
      [27.525, 88.558],
      [27.485, 88.542],
    ],
    safetyFactor: 1.15,
    instabilityScorePct: 72,
    slopeAngleDeg: 40,
    populationAtRisk: 4600,
    primaryHazard: 'Tension Fissure Extension across Upper Ridge',
    activeAdvisory: 'HIGH RISK WARNING: 24h evacuation notice for lower slope settlements. Heavy machinery staging.',
    geotechnicalNotes: 'Gneissic saprolite soil mantle saturated by continuous monsoon rainfall above 150mm/24h.',
    recommendedSafeRouteId: 'route-sikkim-burtuk-bypass',
    nearestCommunityHubId: 'hub-mangan-central',
  },
  {
    id: 'zone-high-haflong-cut',
    name: 'Haflong Town Escarpment Peripheral Zone',
    category: 'high',
    state: 'Assam',
    district: 'Dima Hasao',
    coordinates: [
      [25.158, 93.002],
      [25.198, 93.022],
      [25.192, 93.052],
      [25.148, 93.035],
    ],
    safetyFactor: 1.14,
    instabilityScorePct: 74,
    slopeAngleDeg: 38,
    populationAtRisk: 6100,
    primaryHazard: 'Peripheral Gully Erosion & Urban Hill Edge Failure',
    activeAdvisory: 'HIGH RISK NOTICE: Drainage convergence into unprotected slope toe. Citizens alerted to avoid steep cuts.',
    geotechnicalNotes: 'Uncontrolled municipal drainage discharge saturating fine sandy loam colluvium.',
    recommendedSafeRouteId: 'route-haflong-upper-lifeline',
    nearestCommunityHubId: 'hub-haflong-plateau',
  },

  // ----------------------------------------
  // C. MODERATE RISK ZONES (Yellow / Amber)
  // ----------------------------------------
  {
    id: 'zone-mod-viswema',
    name: 'Viswema Terraced Drainage Catchment',
    category: 'moderate',
    state: 'Nagaland',
    district: 'Kohima',
    coordinates: [
      [25.548, 94.118],
      [25.588, 94.135],
      [25.582, 94.162],
      [25.542, 94.148],
    ],
    safetyFactor: 1.32,
    instabilityScorePct: 52,
    slopeAngleDeg: 32,
    populationAtRisk: 5200,
    primaryHazard: 'Terraced Field Surcharge & Rill Gullying',
    activeAdvisory: 'MODERATE MONITORING: Agricultural terraced channels handling drainage. Night patrols active.',
    geotechnicalNotes: 'Traditional bund management prevents deep shear; monitored for saturated liquefaction.',
    recommendedSafeRouteId: 'route-kohima-viswema-ridge',
    nearestCommunityHubId: 'hub-viswema-ground',
  },
  {
    id: 'zone-mod-champhai',
    name: 'Champhai Border Valley Saturated Plain',
    category: 'moderate',
    state: 'Mizoram',
    district: 'Champhai',
    coordinates: [
      [23.452, 93.312],
      [23.495, 93.332],
      [23.488, 93.358],
      [23.445, 93.342],
    ],
    safetyFactor: 1.38,
    instabilityScorePct: 48,
    slopeAngleDeg: 28,
    populationAtRisk: 7800,
    primaryHazard: 'Riverbank Saturation & Lowland Silt Inundation',
    activeAdvisory: 'MODERATE WATCH: Tiau riverbank erosion monitored; temporary embankments constructed.',
    geotechnicalNotes: 'Alluvial silt with sand lenses; moderate cohesion with low bearing capacity during flood surge.',
    recommendedSafeRouteId: 'route-kohima-viswema-ridge',
    nearestCommunityHubId: 'hub-champhai-complex',
  },
  {
    id: 'zone-mod-bhalukpong',
    name: 'Bhalukpong Sub-Himalayan Foothill Slope',
    category: 'moderate',
    state: 'Arunachal Pradesh',
    district: 'West Kameng',
    coordinates: [
      [27.002, 92.622],
      [27.038, 92.642],
      [27.032, 92.672],
      [26.992, 92.652],
    ],
    safetyFactor: 1.40,
    instabilityScorePct: 44,
    slopeAngleDeg: 30,
    populationAtRisk: 3100,
    primaryHazard: 'Siwalik Soft Sandstone Rill Erosion',
    activeAdvisory: 'MODERATE ADVISORY: Periodic clearance of small gravel spills; road passing smoothly.',
    geotechnicalNotes: 'Young friable sandstone with high infiltration capacity; moderate risk during extended rainfall.',
    recommendedSafeRouteId: 'route-tawang-dirang-bypass',
    nearestCommunityHubId: 'hub-jang-pavilion',
  },
  {
    id: 'zone-mod-majuli',
    name: 'Majuli Island Riverine Overflow Buffer Plain',
    category: 'moderate',
    state: 'Assam',
    district: 'Majuli',
    coordinates: [
      [26.960, 94.110],
      [27.150, 94.390],
      [26.920, 94.470],
      [26.840, 94.190],
    ],
    safetyFactor: 1.45,
    instabilityScorePct: 42,
    slopeAngleDeg: 12,
    populationAtRisk: 8900,
    primaryHazard: 'Riverine Floodplain Inundation & Embankment Seepage',
    activeAdvisory: 'MODERATE FLOOD WATCH: Brahmaputra flow 0.8m below danger level. Embankments intact.',
    geotechnicalNotes: 'Fine micaceous silt and sand flats; geo-bag revetments protecting populated spurs.',
    recommendedSafeRouteId: 'route-haflong-upper-lifeline',
    nearestCommunityHubId: 'hub-haflong-plateau',
  },

  // ----------------------------------------
  // D. LOW RISK ZONES (Safe Geological Shields - Green)
  // ----------------------------------------
  {
    id: 'zone-low-mawlynnong',
    name: 'Mawlynnong Stable Root Bed Shield',
    category: 'low',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    coordinates: [
      [25.185, 91.888],
      [25.222, 91.905],
      [25.215, 91.932],
      [25.178, 91.920],
    ],
    safetyFactor: 1.88,
    instabilityScorePct: 12,
    slopeAngleDeg: 18,
    populationAtRisk: 950,
    primaryHazard: 'Superficial Topsoil Wash (Non-Hazardous)',
    activeAdvisory: 'SAFE ZONE: Indigenous ficus living root networks anchor slopes; natural cascades functioning normally.',
    geotechnicalNotes: 'Competent sandstone bedrock anchored by multi-tiered indigenous living root biological retaining systems.',
    recommendedSafeRouteId: 'route-haflong-upper-lifeline',
    nearestCommunityHubId: 'hub-haflong-plateau',
  },
  {
    id: 'zone-low-khonoma',
    name: 'Khonoma Protected Forest Ridge Shield',
    category: 'low',
    state: 'Nagaland',
    district: 'Kohima',
    coordinates: [
      [25.632, 94.005],
      [25.668, 94.022],
      [25.660, 94.045],
      [25.625, 94.032],
    ],
    safetyFactor: 1.94,
    instabilityScorePct: 9,
    slopeAngleDeg: 22,
    populationAtRisk: 2100,
    primaryHazard: 'Zero Mass Movement Detected',
    activeAdvisory: 'SAFE REFUGE ZONE: Protected community forest canopy intercepts rainfall; zero slope creep.',
    geotechnicalNotes: 'Dense alder root matrix stabilizes weathered mantle down to 6 meters depth.',
    recommendedSafeRouteId: 'route-kohima-viswema-ridge',
    nearestCommunityHubId: 'hub-khonoma-citadel',
  },
  {
    id: 'zone-low-tawang-shield',
    name: 'Tawang High Granite Plateau Safe Shield',
    category: 'low',
    state: 'Arunachal Pradesh',
    district: 'Tawang',
    coordinates: [
      [27.568, 91.838],
      [27.608, 91.858],
      [27.602, 91.892],
      [27.558, 91.872],
    ],
    safetyFactor: 2.12,
    instabilityScorePct: 6,
    slopeAngleDeg: 15,
    populationAtRisk: 4800,
    primaryHazard: 'Stable Geological Basement (Optimal Haven)',
    activeAdvisory: 'PRIMARY SAFE HAVEN: Massive competent granite batholith; designated mass shelter assembly zone.',
    geotechnicalNotes: 'Unfractured high-grade leucogranite with infinite bearing capacity and zero slip vulnerability.',
    recommendedSafeRouteId: 'route-tawang-dirang-bypass',
    nearestCommunityHubId: 'hub-jang-pavilion',
  },
  {
    id: 'zone-low-shillong-plateau',
    name: 'Shillong Peak Stable Crystalline Plateau',
    category: 'low',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    coordinates: [
      [25.532, 91.832],
      [25.568, 91.852],
      [25.562, 91.885],
      [25.522, 91.868],
    ],
    safetyFactor: 2.25,
    instabilityScorePct: 4,
    slopeAngleDeg: 10,
    populationAtRisk: 6200,
    primaryHazard: 'Stable Tableland Plateau',
    activeAdvisory: 'CENTRAL SAFE ASSEMBLY REGION: High tableland free from flooding, mudslides, or rockfall.',
    geotechnicalNotes: 'Archaean gneissic plateau with gentle slope gradients and robust natural rainwater discharge channels.',
    recommendedSafeRouteId: 'route-haflong-upper-lifeline',
    nearestCommunityHubId: 'hub-haflong-plateau',
  },
];
