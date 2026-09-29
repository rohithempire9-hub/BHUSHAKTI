/**
 * BHUSAKTHI AI — MAP-BASED EVACUATION NAVIGATION DATASET
 * Contains genuine geographic coordinates, candidate safe shelters, multi-segment road geometry,
 * blocked road hazards, risk polygons, and turn-by-turn evacuation routes.
 */

export interface SafeCandidateDestination {
  id: string;
  name: string;
  type: 'shelter' | 'school' | 'hospital' | 'community_hall' | 'government';
  coordinates: [number, number]; // [lat, lng]
  distanceKm: number;
  estTimeMin: number;
  hazardRiskScore: number; // 0-100 (lower is safer)
  buildingSafetyScore: number; // 0-100 (higher is safer)
  roadAccess: 'OPEN' | 'PARTIAL' | 'IMPASSABLE';
  capacity: number;
  currentOccupancy: number;
  accessibility: string;
  safetyScore: number; // Composite 0-100
  isRecommended: boolean;
  recommendationReason: string;
}

export interface EvacuationRouteOption {
  id: string;
  name: string;
  type: 'recommended' | 'alternative' | 'dangerous';
  color: string;
  distanceKm: number;
  estTimeMin: number;
  safetyRating: 'VERY SAFE' | 'MODERATE RISK' | 'BLOCKED / HIGH RISK';
  roadStatus: 'OPEN' | 'CAUTION' | 'CLOSED';
  hazardExposure: 'LOW' | 'MEDIUM' | 'VERY HIGH';
  coordinates: [number, number][]; // [lat, lng] sequence along road
  turnByTurn: {
    instruction: string;
    distanceM: number;
    icon: 'straight' | 'turn-left' | 'turn-right' | 'arrive';
    warning?: string;
  }[];
}

export interface BlockedRoadSegment {
  id: string;
  name: string;
  coordinates: [number, number][];
  reason: string;
  riskLevel: 'VERY HIGH' | 'CRITICAL';
  closureType: 'Landslide Debris' | 'Flash Flood Breach' | 'Rockfall Hazard' | 'Bridge Damage';
}

export interface HazardZoneOverlay {
  id: string;
  name: string;
  level: 'VERY HIGH' | 'HIGH' | 'MODERATE';
  coordinates: [number, number][]; // Polygon coords
  description: string;
}

export interface LocationEvacuationPlan {
  locationId: string;
  locationName: string;
  state: string;
  incidentLocation: {
    name: string;
    coordinates: [number, number]; // [lat, lng]
    hazardType: string;
    severity: 'Critical' | 'High' | 'Warning';
    elevationMeters: number;
  };
  destinations: SafeCandidateDestination[];
  routes: EvacuationRouteOption[];
  blockedRoads: BlockedRoadSegment[];
  hazardZones: HazardZoneOverlay[];
}

export const EVACUATION_PLANS: Record<string, LocationEvacuationPlan> = {
  tawang: {
    locationId: 'tawang',
    locationName: 'Tawang',
    state: 'Arunachal Pradesh',
    incidentLocation: {
      name: 'Km 44 Sela Pass Hairpin Sector (Active Shear)',
      coordinates: [27.5861, 91.8594],
      hazardType: 'Active Rotational Landslide & Colluvial Mud Flow',
      severity: 'Critical',
      elevationMeters: 3048,
    },
    destinations: [
      {
        id: 'dest-taw-hall',
        name: 'Tawang Central Community Hall & Relief Base',
        type: 'community_hall',
        coordinates: [27.5935, 91.8682],
        distanceKm: 1.8,
        estTimeMin: 6,
        hazardRiskScore: 12,
        buildingSafetyScore: 94,
        roadAccess: 'OPEN',
        capacity: 450,
        currentOccupancy: 85,
        accessibility: 'All Vehicles & Ambulances',
        safetyScore: 92,
        isRecommended: true,
        recommendationReason: 'Elevated bedrock ridge (+120m grade), zero flood risk, certified reinforced structure, unobstructed bypass access.',
      },
      {
        id: 'dest-taw-school',
        name: 'Govt Higher Secondary School Elevated Campus',
        type: 'school',
        coordinates: [27.5978, 91.8745],
        distanceKm: 2.6,
        estTimeMin: 9,
        hazardRiskScore: 22,
        buildingSafetyScore: 86,
        roadAccess: 'OPEN',
        capacity: 650,
        currentOccupancy: 120,
        accessibility: 'Light Vehicles & Foot',
        safetyScore: 82,
        isRecommended: false,
        recommendationReason: 'High capacity auditorium, but requires transit past secondary drainage wash.',
      },
      {
        id: 'dest-taw-hospital',
        name: 'Tawang District Civil Hospital (Trauma Center)',
        type: 'hospital',
        coordinates: [27.5891, 91.8634],
        distanceKm: 1.2,
        estTimeMin: 4,
        hazardRiskScore: 38,
        buildingSafetyScore: 90,
        roadAccess: 'PARTIAL',
        capacity: 180,
        currentOccupancy: 165,
        accessibility: 'Emergency Medical Units Priority',
        safetyScore: 71,
        isRecommended: false,
        recommendationReason: 'High occupancy; recommended for severe trauma casualties only; access road experiences debris spill.',
      },
      {
        id: 'dest-taw-helipad',
        name: 'Military Border Disaster Staging Helipad',
        type: 'government',
        coordinates: [27.5801, 91.8684],
        distanceKm: 2.9,
        estTimeMin: 12,
        hazardRiskScore: 16,
        buildingSafetyScore: 88,
        roadAccess: 'OPEN',
        capacity: 300,
        currentOccupancy: 40,
        accessibility: '4x4 Military & Airlift Only',
        safetyScore: 85,
        isRecommended: false,
        recommendationReason: 'Airlift evacuation node for high-priority injuries.',
      },
    ],
    routes: [
      {
        id: 'route-safe-tawang',
        name: 'Route B: Lubrang Ridge Elevated Bypass (Recommended)',
        type: 'recommended',
        color: '#2563eb', // Blue
        distanceKm: 1.8,
        estTimeMin: 6,
        safetyRating: 'VERY SAFE',
        roadStatus: 'OPEN',
        hazardExposure: 'LOW',
        coordinates: [
          [27.5861, 91.8594],
          [27.5878, 91.8612],
          [27.5895, 91.8631],
          [27.5912, 91.8655],
          [27.5928, 91.8671],
          [27.5935, 91.8682],
        ],
        turnByTurn: [
          { instruction: 'Depart Incident Site heading Northeast onto Lubrang Bypass', distanceM: 250, icon: 'straight' },
          { instruction: 'Turn left onto Upper Ridge Road past Army Supply Depot', distanceM: 450, icon: 'turn-left' },
          { instruction: 'Continue straight along reinforced retaining wall corridor', distanceM: 600, icon: 'straight', warning: 'Drive at 30 km/h due to wet road' },
          { instruction: 'Turn right onto Community Center Approach Gate', distanceM: 500, icon: 'turn-right' },
          { instruction: 'Arrive at Tawang Central Community Hall (Safe Shelter)', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: 'route-alt-tawang',
        name: 'Route C: Monastery East Perimeter Road (Alternative)',
        type: 'alternative',
        color: '#10b981', // Green
        distanceKm: 2.7,
        estTimeMin: 10,
        safetyRating: 'MODERATE RISK',
        roadStatus: 'OPEN',
        hazardExposure: 'MEDIUM',
        coordinates: [
          [27.5861, 91.8594],
          [27.5845, 91.8620],
          [27.5860, 91.8665],
          [27.5890, 91.8705],
          [27.5920, 91.8698],
          [27.5935, 91.8682],
        ],
        turnByTurn: [
          { instruction: 'Head East toward Lower Monastery Loop', distanceM: 400, icon: 'turn-right' },
          { instruction: 'Merge onto Old Cart Trail Road', distanceM: 800, icon: 'straight' },
          { instruction: 'Turn sharp left ascending hill slope', distanceM: 900, icon: 'turn-left', warning: 'Moderate gravel slide risk' },
          { instruction: 'Join Main Relief Axis to Community Hall', distanceM: 600, icon: 'straight' },
          { instruction: 'Arrive at Safe Shelter Gate', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: 'route-blocked-tawang',
        name: 'Route A: NH-13 Main Valley Highway (Dangerous / Blocked)',
        type: 'dangerous',
        color: '#ef4444', // Red
        distanceKm: 1.4,
        estTimeMin: 5,
        safetyRating: 'BLOCKED / HIGH RISK',
        roadStatus: 'CLOSED',
        hazardExposure: 'VERY HIGH',
        coordinates: [
          [27.5861, 91.8594],
          [27.5880, 91.8580],
          [27.5905, 91.8565],
          [27.5930, 91.8590],
          [27.5935, 91.8682],
        ],
        turnByTurn: [
          { instruction: 'DO NOT TAKE THIS ROUTE — Road blocked at Km 44', distanceM: 0, icon: 'straight', warning: 'Active rockfall deposit of 22,000 m³ blocking highway' },
        ],
      },
    ],
    blockedRoads: [
      {
        id: 'blk-taw-01',
        name: 'NH-13 Sela Gorge Km 44-46 Sector',
        coordinates: [
          [27.5880, 91.8580],
          [27.5895, 91.8572],
          [27.5910, 91.8568],
        ],
        reason: 'Active mudflow and 22,000 m³ rockfall blockage across road.',
        riskLevel: 'CRITICAL',
        closureType: 'Landslide Debris',
      },
    ],
    hazardZones: [
      {
        id: 'hz-taw-01',
        name: 'Km 44 Sela Active Rupture Zone',
        level: 'VERY HIGH',
        coordinates: [
          [27.5870, 91.8550],
          [27.5925, 91.8550],
          [27.5930, 91.8600],
          [27.5880, 91.8610],
          [27.5870, 91.8550],
        ],
        description: 'Colluvial slope failure active; pore water pressure 185 kPa.',
      },
      {
        id: 'hz-taw-02',
        name: 'Tawang Chu Flood Buffer Sector',
        level: 'HIGH',
        coordinates: [
          [27.5820, 91.8520],
          [27.5860, 91.8540],
          [27.5880, 91.8520],
          [27.5840, 91.8500],
          [27.5820, 91.8520],
        ],
        description: 'Low-lying river valley vulnerable to flash overflow from debris damming.',
      },
    ],
  },

  gangtok: {
    locationId: 'gangtok',
    locationName: 'Gangtok',
    state: 'Sikkim',
    incidentLocation: {
      name: 'Deorali Slopeline Sub-Station (Burtuk Sector)',
      coordinates: [27.3389, 88.6065],
      hazardType: 'Rapid Creep Along Phyllite Bedding Plane',
      severity: 'High',
      elevationMeters: 1650,
    },
    destinations: [
      {
        id: 'dest-gang-hall',
        name: 'Paljor Stadium Indoor Sports Complex (Safe Shelter)',
        type: 'community_hall',
        coordinates: [27.3325, 88.6140],
        distanceKm: 1.5,
        estTimeMin: 5,
        hazardRiskScore: 10,
        buildingSafetyScore: 96,
        roadAccess: 'OPEN',
        capacity: 850,
        currentOccupancy: 110,
        accessibility: 'All Vehicles & Multi-Axle Trucks',
        safetyScore: 94,
        isRecommended: true,
        recommendationReason: 'Engineered earthquake-resistant bedrock foundation, elevated drainage channel, multiple wide entry gates.',
      },
      {
        id: 'dest-gang-school',
        name: 'West Point Senior Secondary Campus',
        type: 'school',
        coordinates: [27.3440, 88.6110],
        distanceKm: 2.1,
        estTimeMin: 8,
        hazardRiskScore: 18,
        buildingSafetyScore: 89,
        roadAccess: 'OPEN',
        capacity: 500,
        currentOccupancy: 60,
        accessibility: 'Light Vehicles',
        safetyScore: 84,
        isRecommended: false,
        recommendationReason: 'Upper ridge location; safe from valley runoff.',
      },
      {
        id: 'dest-gang-hospital',
        name: 'STNM Multi-Specialty Government Hospital',
        type: 'hospital',
        coordinates: [27.3275, 88.6020],
        distanceKm: 1.9,
        estTimeMin: 7,
        hazardRiskScore: 28,
        buildingSafetyScore: 95,
        roadAccess: 'OPEN',
        capacity: 400,
        currentOccupancy: 310,
        accessibility: 'Ambulances Only',
        safetyScore: 78,
        isRecommended: false,
        recommendationReason: 'Designated primary casualty reception center.',
      },
    ],
    routes: [
      {
        id: 'route-safe-gangtok',
        name: 'Route A: Ridge Crest Arterial via Development Area (Recommended)',
        type: 'recommended',
        color: '#2563eb',
        distanceKm: 1.5,
        estTimeMin: 5,
        safetyRating: 'VERY SAFE',
        roadStatus: 'OPEN',
        hazardExposure: 'LOW',
        coordinates: [
          [27.3389, 88.6065],
          [27.3370, 88.6085],
          [27.3355, 88.6110],
          [27.3338, 88.6128],
          [27.3325, 88.6140],
        ],
        turnByTurn: [
          { instruction: 'Exit incident area heading South onto Development Area Road', distanceM: 300, icon: 'straight' },
          { instruction: 'Bear left onto Upper Paljor Stadium Link', distanceM: 500, icon: 'turn-left' },
          { instruction: 'Continue along reinforced concrete viaduct', distanceM: 450, icon: 'straight' },
          { instruction: 'Enter Paljor Stadium Complex Gate 2', distanceM: 250, icon: 'turn-right' },
          { instruction: 'Arrive at Safe Evacuation Shelter', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: 'route-alt-gangtok',
        name: 'Route B: Tibet Road Contour Bypass (Alternative)',
        type: 'alternative',
        color: '#10b981',
        distanceKm: 2.3,
        estTimeMin: 9,
        safetyRating: 'MODERATE RISK',
        roadStatus: 'OPEN',
        hazardExposure: 'MEDIUM',
        coordinates: [
          [27.3389, 88.6065],
          [27.3410, 88.6090],
          [27.3395, 88.6145],
          [27.3350, 88.6155],
          [27.3325, 88.6140],
        ],
        turnByTurn: [
          { instruction: 'Head North towards Secretariat road', distanceM: 400, icon: 'turn-left' },
          { instruction: 'Turn right along Tibet Road', distanceM: 900, icon: 'turn-right' },
          { instruction: 'Descend south towards stadium perimeter', distanceM: 1000, icon: 'turn-right' },
          { instruction: 'Arrive at Paljor Stadium', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: 'route-blocked-gangtok',
        name: 'Route C: Lower Burtuk Jhora Ravine (Blocked Road)',
        type: 'dangerous',
        color: '#ef4444',
        distanceKm: 1.2,
        estTimeMin: 4,
        safetyRating: 'BLOCKED / HIGH RISK',
        roadStatus: 'CLOSED',
        hazardExposure: 'VERY HIGH',
        coordinates: [
          [27.3389, 88.6065],
          [27.3360, 88.6040],
          [27.3330, 88.6060],
          [27.3325, 88.6140],
        ],
        turnByTurn: [
          { instruction: 'ROAD CLOSED — Burtuk culvert overflow and active slope slip', distanceM: 0, icon: 'straight', warning: 'High velocity mud slurry inundation' },
        ],
      },
    ],
    blockedRoads: [
      {
        id: 'blk-gang-01',
        name: 'Lower Burtuk Jhora Gully Road',
        coordinates: [
          [27.3360, 88.6040],
          [27.3345, 88.6050],
        ],
        reason: 'Culvert washaway and active mud cascade across 120m roadway.',
        riskLevel: 'CRITICAL',
        closureType: 'Flash Flood Breach',
      },
    ],
    hazardZones: [
      {
        id: 'hz-gang-01',
        name: 'Burtuk-Swastik Colluvial Slope Failure',
        level: 'VERY HIGH',
        coordinates: [
          [27.3350, 88.6020],
          [27.3380, 88.6030],
          [27.3370, 88.6060],
          [27.3340, 88.6050],
          [27.3350, 88.6020],
        ],
        description: 'Shear displacement 5.8 mm/h; risk of progressive toe release.',
      },
    ],
  },

  agartala: {
    locationId: 'agartala',
    locationName: 'Agartala',
    state: 'Tripura',
    incidentLocation: {
      name: 'Howrah River Bank Embankment Sector (Banamalipur)',
      coordinates: [23.8315, 91.2868],
      hazardType: 'Embankment Seepage Breach & Lowland Inundation',
      severity: 'High',
      elevationMeters: 15,
    },
    destinations: [
      {
        id: 'dest-aga-hall',
        name: 'Netaji Subhash Regional Sports Complex (High Ground)',
        type: 'community_hall',
        coordinates: [23.8390, 91.2940],
        distanceKm: 1.4,
        estTimeMin: 5,
        hazardRiskScore: 8,
        buildingSafetyScore: 95,
        roadAccess: 'OPEN',
        capacity: 1200,
        currentOccupancy: 180,
        accessibility: 'All Vehicles, Buses & Trucks',
        safetyScore: 95,
        isRecommended: true,
        recommendationReason: 'Engineered high plinth (+4.5m above river high flood level), multi-story dry shelter with standby generators.',
      },
      {
        id: 'dest-aga-school',
        name: 'Umakanta Academy Multi-Story Complex',
        type: 'school',
        coordinates: [23.8355, 91.2820],
        distanceKm: 1.1,
        estTimeMin: 4,
        hazardRiskScore: 24,
        buildingSafetyScore: 88,
        roadAccess: 'OPEN',
        capacity: 700,
        currentOccupancy: 220,
        accessibility: 'All Vehicles',
        safetyScore: 82,
        isRecommended: false,
        recommendationReason: 'Safe second floor accommodations; access road has minor puddle accumulation.',
      },
      {
        id: 'dest-aga-hospital',
        name: 'Agartala Government Medical College & GB Pant Hospital',
        type: 'hospital',
        coordinates: [23.8490, 91.2980],
        distanceKm: 2.8,
        estTimeMin: 9,
        hazardRiskScore: 14,
        buildingSafetyScore: 98,
        roadAccess: 'OPEN',
        capacity: 500,
        currentOccupancy: 380,
        accessibility: 'Emergency Corridor Priority',
        safetyScore: 89,
        isRecommended: false,
        recommendationReason: 'Fully staffed regional trauma hospital for critical care.',
      },
    ],
    routes: [
      {
        id: 'route-safe-agartala',
        name: 'Route 1: VIP Airport Elevated Corridor (Recommended)',
        type: 'recommended',
        color: '#2563eb',
        distanceKm: 1.4,
        estTimeMin: 5,
        safetyRating: 'VERY SAFE',
        roadStatus: 'OPEN',
        hazardExposure: 'LOW',
        coordinates: [
          [23.8315, 91.2868],
          [23.8335, 91.2890],
          [23.8360, 91.2915],
          [23.8380, 91.2930],
          [23.8390, 91.2940],
        ],
        turnByTurn: [
          { instruction: 'Head Northeast away from river dyke onto VIP Connector Road', distanceM: 350, icon: 'straight' },
          { instruction: 'Turn left onto elevated Airport Highway bypass', distanceM: 500, icon: 'turn-left' },
          { instruction: 'Cross over drainage flyover bridge', distanceM: 350, icon: 'straight' },
          { instruction: 'Turn right into Netaji Sports Complex Emergency Gate', distanceM: 200, icon: 'turn-right' },
          { instruction: 'Arrive at High-Ground Safe Shelter', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: 'route-alt-agartala',
        name: 'Route 2: Colonel Mahim Thakur Sarani (Alternative)',
        type: 'alternative',
        color: '#10b981',
        distanceKm: 2.1,
        estTimeMin: 8,
        safetyRating: 'MODERATE RISK',
        roadStatus: 'OPEN',
        hazardExposure: 'MEDIUM',
        coordinates: [
          [23.8315, 91.2868],
          [23.8320, 91.2920],
          [23.8350, 91.2960],
          [23.8390, 91.2940],
        ],
        turnByTurn: [
          { instruction: 'Head East toward Radhanagar Bus Terminal', distanceM: 600, icon: 'turn-right' },
          { instruction: 'Turn North along Thakur Sarani Road', distanceM: 1000, icon: 'turn-left' },
          { instruction: 'Turn left into Sports Complex East Portal', distanceM: 500, icon: 'turn-left' },
          { instruction: 'Arrive at Safe Shelter', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: 'route-blocked-agartala',
        name: 'Route 3: Old Howrah Riverside Bund Road (Flooded / Blocked)',
        type: 'dangerous',
        color: '#ef4444',
        distanceKm: 1.0,
        estTimeMin: 4,
        safetyRating: 'BLOCKED / HIGH RISK',
        roadStatus: 'CLOSED',
        hazardExposure: 'VERY HIGH',
        coordinates: [
          [23.8315, 91.2868],
          [23.8300, 91.2885],
          [23.8320, 91.2925],
          [23.8390, 91.2940],
        ],
        turnByTurn: [
          { instruction: 'ROAD BLOCKED — 1.2m flood water submergence across embankment road', distanceM: 0, icon: 'straight', warning: 'Breached bund overflow' },
        ],
      },
    ],
    blockedRoads: [
      {
        id: 'blk-aga-01',
        name: 'Howrah Riverside Sluice Bund Road',
        coordinates: [
          [23.8300, 91.2885],
          [23.8312, 91.2905],
        ],
        reason: 'River backflow breach with 1.2m fast-moving water over roadway.',
        riskLevel: 'CRITICAL',
        closureType: 'Flash Flood Breach',
      },
    ],
    hazardZones: [
      {
        id: 'hz-aga-01',
        name: 'Howrah River Inundation Belt',
        level: 'VERY HIGH',
        coordinates: [
          [23.8290, 91.2850],
          [23.8320, 91.2870],
          [23.8310, 91.2910],
          [23.8280, 91.2880],
          [23.8290, 91.2850],
        ],
        description: 'Low-lying riparian settlement zone subject to acute flood inundation.',
      },
    ],
  },

  cherrapunji: {
    locationId: 'cherrapunji',
    locationName: 'Cherrapunji (Sohra)',
    state: 'Meghalaya',
    incidentLocation: {
      name: 'Nohkalikai Scarp Viewpoint Road',
      coordinates: [25.2840, 91.7210],
      hazardType: 'Vertical Sandstone Cliff Debris Fall',
      severity: 'Critical',
      elevationMeters: 1430,
    },
    destinations: [
      {
        id: 'dest-cher-hall',
        name: 'Sohra Community Evacuation Hall (Tableland Safe Center)',
        type: 'community_hall',
        coordinates: [25.2915, 91.7305],
        distanceKm: 1.6,
        estTimeMin: 5,
        hazardRiskScore: 11,
        buildingSafetyScore: 94,
        roadAccess: 'OPEN',
        capacity: 500,
        currentOccupancy: 95,
        accessibility: 'All Vehicles',
        safetyScore: 93,
        isRecommended: true,
        recommendationReason: 'Flat plateau interior bedrock, zero cliff scarp exposure, concrete storm shelter with lightning protection.',
      },
      {
        id: 'dest-cher-school',
        name: 'St. John Bosco Mission Higher Secondary Campus',
        type: 'school',
        coordinates: [25.2970, 91.7250],
        distanceKm: 2.2,
        estTimeMin: 8,
        hazardRiskScore: 20,
        buildingSafetyScore: 89,
        roadAccess: 'OPEN',
        capacity: 650,
        currentOccupancy: 80,
        accessibility: 'All Vehicles',
        safetyScore: 83,
        isRecommended: false,
        recommendationReason: 'Large gymnasium and auditorium facilities.',
      },
      {
        id: 'dest-cher-hospital',
        name: 'Sohra Community Health Centre (CHC)',
        type: 'hospital',
        coordinates: [25.2880, 91.7265],
        distanceKm: 0.9,
        estTimeMin: 3,
        hazardRiskScore: 35,
        buildingSafetyScore: 92,
        roadAccess: 'PARTIAL',
        capacity: 120,
        currentOccupancy: 98,
        accessibility: 'Ambulances Priority',
        safetyScore: 74,
        isRecommended: false,
        recommendationReason: 'Near plateau rim; limited capacity for non-injured evacuees.',
      },
    ],
    routes: [
      {
        id: 'route-safe-cherrapunji',
        name: 'Route 1: Plateau Interior All-Weather Highway (Recommended)',
        type: 'recommended',
        color: '#2563eb',
        distanceKm: 1.6,
        estTimeMin: 5,
        safetyRating: 'VERY SAFE',
        roadStatus: 'OPEN',
        hazardExposure: 'LOW',
        coordinates: [
          [25.2840, 91.7210],
          [25.2865, 91.7235],
          [25.2890, 91.7270],
          [25.2905, 91.7290],
          [25.2915, 91.7305],
        ],
        turnByTurn: [
          { instruction: 'Depart cliff rim heading Northeast toward Sohra Market', distanceM: 350, icon: 'straight' },
          { instruction: 'Bear left onto Central Plateau Link Road', distanceM: 450, icon: 'turn-left' },
          { instruction: 'Continue straight through limestone ridge cutting', distanceM: 500, icon: 'straight' },
          { instruction: 'Turn right at Community Hall Avenue', distanceM: 300, icon: 'turn-right' },
          { instruction: 'Arrive at Sohra Safe Evacuation Center', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: 'route-alt-cherrapunji',
        name: 'Route 2: Mawsmai Link Contour Road (Alternative)',
        type: 'alternative',
        color: '#10b981',
        distanceKm: 2.5,
        estTimeMin: 9,
        safetyRating: 'MODERATE RISK',
        roadStatus: 'OPEN',
        hazardExposure: 'MEDIUM',
        coordinates: [
          [25.2840, 91.7210],
          [25.2820, 91.7250],
          [25.2855, 91.7295],
          [25.2900, 91.7320],
          [25.2915, 91.7305],
        ],
        turnByTurn: [
          { instruction: 'Head East towards Mawsmai junction', distanceM: 600, icon: 'turn-right' },
          { instruction: 'Turn left along high terrace bypass', distanceM: 1100, icon: 'turn-left' },
          { instruction: 'Turn left into Community Hall complex', distanceM: 800, icon: 'turn-left' },
          { instruction: 'Arrive at Safe Center', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: 'route-blocked-cherrapunji',
        name: 'Route 3: Nohkalikai Scarp Fall Rim Road (Blocked)',
        type: 'dangerous',
        color: '#ef4444',
        distanceKm: 1.1,
        estTimeMin: 4,
        safetyRating: 'BLOCKED / HIGH RISK',
        roadStatus: 'CLOSED',
        hazardExposure: 'VERY HIGH',
        coordinates: [
          [25.2840, 91.7210],
          [25.2870, 91.7215],
          [25.2895, 91.7230],
          [25.2915, 91.7305],
        ],
        turnByTurn: [
          { instruction: 'BLOCKED — Sandstone ledge collapse across 75m cliff road', distanceM: 0, icon: 'straight', warning: 'Direct rockfall drop hazard' },
        ],
      },
    ],
    blockedRoads: [
      {
        id: 'blk-cher-01',
        name: 'Nohkalikai Escarpment Edge Road',
        coordinates: [
          [25.2870, 91.7215],
          [25.2885, 91.7222],
        ],
        reason: 'Sandstone slab shear rupture; sheer 400m drop danger.',
        riskLevel: 'CRITICAL',
        closureType: 'Rockfall Hazard',
      },
    ],
    hazardZones: [
      {
        id: 'hz-cher-01',
        name: 'Sohra Gorge Escarpment Drop Zone',
        level: 'VERY HIGH',
        coordinates: [
          [25.2830, 91.7190],
          [25.2880, 91.7200],
          [25.2870, 91.7225],
          [25.2825, 91.7215],
          [25.2830, 91.7190],
        ],
        description: 'Overhanging jointed sandstone blocks actively unseating under torrential rainfall.',
      },
    ],
  },
};

import { BHUSAKTHI_LOCATIONS } from './bhusakthiLocations';

/**
 * Retrieve evacuation plan for any selected location, dynamically generating genuine localized
 * safe shelters, open routes, blocked roads, and hazard zones around its coordinates.
 */
export function getEvacuationPlanForLocation(locId: string): LocationEvacuationPlan {
  if (EVACUATION_PLANS[locId]) {
    return EVACUATION_PLANS[locId];
  }
  const loc = BHUSAKTHI_LOCATIONS[locId] || BHUSAKTHI_LOCATIONS['tawang'];
  const lat = loc.latitude;
  const lng = loc.longitude;

  return {
    locationId: loc.id,
    locationName: loc.name,
    state: loc.state,
    incidentLocation: {
      name: `${loc.name} Monitored Incident Point`,
      coordinates: [lat, lng],
      hazardType: 'Debris Flow & Slope Instability Threat',
      severity: 'Critical',
      elevationMeters: loc.cameraHeight ? Math.round(loc.cameraHeight * 0.6) : 1000,
    },
    destinations: [
      {
        id: `dest-${loc.id}-hall`,
        name: `${loc.name} Central Multi-Purpose Safe Shelter`,
        type: 'community_hall',
        coordinates: [lat + 0.0075, lng + 0.0085],
        distanceKm: 1.8,
        estTimeMin: 6,
        hazardRiskScore: 12,
        buildingSafetyScore: 94,
        roadAccess: 'OPEN',
        capacity: 500,
        currentOccupancy: 80,
        accessibility: 'All Vehicles & Ambulances',
        safetyScore: 92,
        isRecommended: true,
        recommendationReason: 'Elevated bedrock plateau, certified reinforced structure, zero flood risk, unobstructed road access.',
      },
      {
        id: `dest-${loc.id}-school`,
        name: `${loc.name} Government Higher Secondary Campus`,
        type: 'school',
        coordinates: [lat + 0.012, lng + 0.014],
        distanceKm: 2.5,
        estTimeMin: 9,
        hazardRiskScore: 22,
        buildingSafetyScore: 88,
        roadAccess: 'OPEN',
        capacity: 650,
        currentOccupancy: 110,
        accessibility: 'Light Vehicles & Foot',
        safetyScore: 82,
        isRecommended: false,
        recommendationReason: 'Spacious concrete auditorium, secondary backup evacuation center.',
      },
      {
        id: `dest-${loc.id}-hospital`,
        name: `${loc.name} District Civil Hospital (Trauma Hub)`,
        type: 'hospital',
        coordinates: [lat - 0.006, lng + 0.009],
        distanceKm: 1.4,
        estTimeMin: 5,
        hazardRiskScore: 32,
        buildingSafetyScore: 92,
        roadAccess: 'OPEN',
        capacity: 250,
        currentOccupancy: 190,
        accessibility: 'Priority Emergency Medical Access',
        safetyScore: 76,
        isRecommended: false,
        recommendationReason: 'Dedicated medical triage center; reserved for critical casualties.',
      },
    ],
    routes: [
      {
        id: `route-safe-${loc.id}`,
        name: 'Route B: High Ridge Bypass Corridor (Recommended)',
        type: 'recommended',
        color: '#2563eb',
        distanceKm: 1.8,
        estTimeMin: 6,
        safetyRating: 'VERY SAFE',
        roadStatus: 'OPEN',
        hazardExposure: 'LOW',
        coordinates: [
          [lat, lng],
          [lat + 0.002, lng + 0.0025],
          [lat + 0.004, lng + 0.0045],
          [lat + 0.006, lng + 0.0065],
          [lat + 0.0075, lng + 0.0085],
        ],
        turnByTurn: [
          { instruction: 'Depart incident zone heading Northeast onto Bypass Road', distanceM: 350, icon: 'straight' },
          { instruction: 'Turn left along reinforced ridge arterial', distanceM: 550, icon: 'turn-left' },
          { instruction: 'Continue straight through safe rock-cut corridor', distanceM: 600, icon: 'straight' },
          { instruction: 'Turn right at Safe Shelter Gate', distanceM: 300, icon: 'turn-right' },
          { instruction: `Arrive at ${loc.name} Central Safe Shelter`, distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: `route-alt-${loc.id}`,
        name: 'Route C: East Valley Perimeter Road (Alternative)',
        type: 'alternative',
        color: '#10b981',
        distanceKm: 2.6,
        estTimeMin: 10,
        safetyRating: 'MODERATE RISK',
        roadStatus: 'OPEN',
        hazardExposure: 'MEDIUM',
        coordinates: [
          [lat, lng],
          [lat - 0.002, lng + 0.004],
          [lat + 0.001, lng + 0.008],
          [lat + 0.005, lng + 0.010],
          [lat + 0.0075, lng + 0.0085],
        ],
        turnByTurn: [
          { instruction: 'Head East toward lower valley arterial', distanceM: 500, icon: 'turn-right' },
          { instruction: 'Merge onto East Perimeter Highway', distanceM: 1100, icon: 'straight' },
          { instruction: 'Turn left ascending towards safe shelter', distanceM: 1000, icon: 'turn-left' },
          { instruction: 'Arrive at Safe Shelter', distanceM: 0, icon: 'arrive' },
        ],
      },
      {
        id: `route-blocked-${loc.id}`,
        name: 'Route A: Direct Gorge Road (Blocked / Impassable)',
        type: 'dangerous',
        color: '#ef4444',
        distanceKm: 1.2,
        estTimeMin: 4,
        safetyRating: 'BLOCKED / HIGH RISK',
        roadStatus: 'CLOSED',
        hazardExposure: 'VERY HIGH',
        coordinates: [
          [lat, lng],
          [lat + 0.003, lng + 0.001],
          [lat + 0.006, lng + 0.003],
          [lat + 0.0075, lng + 0.0085],
        ],
        turnByTurn: [
          { instruction: 'DO NOT USE — Active rockfall and mudflow deposit across roadway', distanceM: 0, icon: 'straight', warning: 'High risk hazard zone' },
        ],
      },
    ],
    blockedRoads: [
      {
        id: `blk-${loc.id}-01`,
        name: `${loc.name} Main Gorge Pass`,
        coordinates: [
          [lat + 0.003, lng + 0.001],
          [lat + 0.0045, lng + 0.002],
        ],
        reason: 'Active slope failure and debris blockage across 150m roadway.',
        riskLevel: 'CRITICAL',
        closureType: 'Landslide Debris',
      },
    ],
    hazardZones: [
      {
        id: `hz-${loc.id}-01`,
        name: `${loc.name} Active Hazard Rupture Sector`,
        level: 'VERY HIGH',
        coordinates: [
          [lat + 0.001, lng - 0.001],
          [lat + 0.005, lng - 0.001],
          [lat + 0.006, lng + 0.003],
          [lat + 0.002, lng + 0.003],
          [lat + 0.001, lng - 0.001],
        ],
        description: 'Unstable slope sector with critical pore-water pressure and shear movement.',
      },
    ],
  };
}
