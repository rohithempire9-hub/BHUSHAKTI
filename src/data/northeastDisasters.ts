import { NaturalDisasterRecord } from '../types/landslide';

export const NORTHEAST_NATURAL_DISASTERS: NaturalDisasterRecord[] = [
  {
    id: 'dis-2022-tupul',
    year: 2022,
    eventTitle: 'Tupul Railway Yard Catastrophic Landslide',
    category: 'Major Landslide',
    state: 'Manipur',
    location: 'Noney District, Tupul Railway Construction Site',
    fatalitiesText: '61 Fatalities (Territorial Army personnel & railway workers)',
    impactDescription:
      'Massive debris flow crushed the 107 Territorial Army encampment, buried earthmoving machinery, and created an artificial dam across the Ijei River threatening downstream villages with catastrophic flash floods.',
    geotechnicalTrigger:
      'Continuous 340mm monsoon cloudburst infiltrated sheared Disang Group splintery shale cuttings. Unreinforced slope toe collapsed under pore water pressure exceeding 52 kPa.',
    severityLevel: 'Catastrophic'
  },
  {
    id: 'dis-2023-lhonak',
    year: 2023,
    eventTitle: 'South Lhonak Glacial Lake Outburst Flood (GLOF) & Teesta Surge',
    category: 'GLOF & Debris Surge',
    state: 'Sikkim',
    location: 'North Sikkim (Chungthang, Mangan & Dikchu Corridor)',
    fatalitiesText: '100+ Fatalities & Missing (including 23 Indian Army soldiers)',
    impactDescription:
      'Glacial lake outburst flood completely washed away the 1,200 MW Teesta-III Chungthang Dam, severed National Highway 10 for over 40 days, washed away bridges, and buried villages in meters of thick glacial silt.',
    geotechnicalTrigger:
      'Sudden moraine dam breach triggered by cloudburst and lateral permafrost thaw. Debris flow moved at ~50 km/h carrying boulders up to 8 meters in diameter.',
    severityLevel: 'Catastrophic'
  },
  {
    id: 'dis-2024-remal-aizawl',
    year: 2024,
    eventTitle: 'Cyclone Remal Multi-Slope Collapse & Melthum Quarry Slide',
    category: 'Major Landslide',
    state: 'Mizoram',
    location: 'Aizawl (Melthum, Bawngkawn, Hlimen, and Falkawn)',
    fatalitiesText: '34 Fatalities (17 killed in Melthum stone quarry collapse)',
    impactDescription:
      'Remnants of Cyclone Remal dumped over 220mm rainfall in 24 hours. The quarry cliff collapsed onto worker quarters, while multiple road slumps cut off water supply and road links into Aizawl city.',
    geotechnicalTrigger:
      'Steeply dipping Surma Group sandstone-shale bedding planes became saturated. Water acted as a lubricant along slip surfaces, triggering catastrophic planar sliding on over-steepened faces.',
    severityLevel: 'Catastrophic'
  },
  {
    id: 'dis-2022-dima-hasao',
    year: 2022,
    eventTitle: 'Dima Hasao Hill District Multi-Slope Washouts & New Haflong Disaster',
    category: 'Major Landslide',
    state: 'Assam',
    location: 'Dima Hasao (Haflong, Jatinga, and Daotuhaja)',
    fatalitiesText: '18 Fatalities & 200,000 People Displaced',
    impactDescription:
      'Massive mudslides submerged the New Haflong railway station up to window levels, overturned passenger locomotives, and dismantled 12 major rail bridges, severing Tripura and Mizoram rail connectivity for 2 months.',
    geotechnicalTrigger:
      'Excess monsoon precipitation (+415% over normal) saturated highly weathered Barail shale formations. Liquefaction of unconsolidated railway embankment fills.',
    severityLevel: 'Catastrophic'
  },
  {
    id: 'dis-1950-assam-tibet',
    year: 1950,
    eventTitle: 'Great Assam-Tibet Intra-Continental Earthquake & Landslide Avalanches',
    category: 'Earthquake & Liquefaction',
    state: 'Assam & Arunachal Pradesh',
    location: 'Mishmi Hills, Subansiri, Dibang, and Upper Brahmaputra Valley',
    fatalitiesText: '4,800+ Fatalities',
    impactDescription:
      'Magnitude 8.6 mega-earthquake generated thousands of simultaneous mountain avalanches that choked rivers. The Subansiri dam burst 8 days later, producing a 7-meter wall of water. Brahmaputra riverbed permanently rose ~3 meters.',
    geotechnicalTrigger:
      'Intense seismic ground acceleration exceeding 0.6g along Main Frontal Thrust, causing massive deep-seated rock avalanches and total loss of soil cohesion.',
    severityLevel: 'Catastrophic'
  },
  {
    id: 'dis-1897-shillong',
    year: 1897,
    eventTitle: 'Great Shillong Plateau M8.1 Mega-Earthquake & Escarpment Collapses',
    category: 'Earthquake & Liquefaction',
    state: 'Meghalaya',
    location: 'Shillong Plateau, Cherrapunji Escarpment, and Garo Hills',
    fatalitiesText: '1,542 Fatalities',
    impactDescription:
      'Vertical ground accelerations exceeded 1.0g. Catastrophic rockfalls stripped the southern cliffs of Cherrapunji and Mawsmai. Every masonry building in Shillong, Guwahati, and Sylhet was leveled.',
    geotechnicalTrigger:
      'Blind thrust rupture on Oldham Fault. Massive gravitational cliff detachment along the southern boundary fault of Meghalaya.',
    severityLevel: 'Catastrophic'
  },
  {
    id: 'dis-2011-sikkim',
    year: 2011,
    eventTitle: 'Sikkim M6.9 Earthquake & Mangan-Chungthang Rockslides',
    category: 'Earthquake & Liquefaction',
    state: 'Sikkim',
    location: 'North Sikkim (Mangan, Dzongu, and Chungthang)',
    fatalitiesText: '111 Fatalities (60+ in Sikkim alone)',
    impactDescription:
      'Triggered over 355 major landslides along the steep gorge corridors of North Sikkim. Cut off all road access to Dzongu tribal belt for weeks.',
    geotechnicalTrigger:
      'Strike-slip seismic shaking along transverse fault across Higher Himalayan Crystalline rock mass already weakened by monsoon rains.',
    severityLevel: 'Severe'
  },
  {
    id: 'dis-2024-paglapahar',
    year: 2024,
    eventTitle: 'Pagla Pahar Chronic Rockfall & Slope Sinking, NH-29',
    category: 'Major Landslide',
    state: 'Nagaland',
    location: 'Kohima-Dimapur Highway Corridor (Pagla Pahar / Phesama)',
    fatalitiesText: '2 Fatalities & Total Highway Stoppage',
    impactDescription:
      'Gigantic boulders detached from the 200m vertical cliff, crushing multiple passenger vehicles and severing the lifelines of Kohima and Manipur.',
    geotechnicalTrigger:
      'Continuous fault shear in fractured Disang flysch rock. Ingress of monsoon water into open tension cracks created hydrostatic wedging.',
    severityLevel: 'Severe'
  },
  {
    id: 'dis-2023-sohra-cloudburst',
    year: 2023,
    eventTitle: 'Cherrapunji 1,012mm 48-Hour Monsoon Cloudburst & Sinkholes',
    category: 'Monsoon Cloudburst',
    state: 'Meghalaya',
    location: 'Sohra (Cherrapunji) - Mawsmai Rim',
    fatalitiesText: '5 Fatalities & Severe Infrastructure Damage',
    impactDescription:
      'World record rainfall pocket dumped 1,012 mm of rain in two days. Violent runoff stripped topsoil and triggered cave-ins in underlying karst limestone caverns.',
    geotechnicalTrigger:
      'Extreme rainfall intensity (45 mm/h peak) exceeded the soil infiltration rate by 300%, creating torrential overland flow and pore pressure liquefaction.',
    severityLevel: 'Severe'
  },
  {
    id: 'dis-2020-majuli-erosion',
    year: 2020,
    eventTitle: 'Majuli Island High-Discharge Riverbank Scouring & Breaches',
    category: 'Riverbank Collapse',
    state: 'Assam',
    location: 'Majuli Brahmaputra River Basin (Kamalabari & Salmora)',
    fatalitiesText: 'Zero direct deaths; 15,000 families displaced from lost land',
    impactDescription:
      'Brahmaputra in high flood state washed away over 14 square kilometers of fertile alluvial soil, destroying earthen embankments and heritage Satras.',
    geotechnicalTrigger:
      'Pore water seepage during flood recession caused shear failure of non-cohesive sandy silt riverbank strata (cantilever failure).',
    severityLevel: 'Severe'
  },
  {
    id: 'dis-2016-tamenglong',
    year: 2016,
    eventTitle: 'Tamenglong M6.7 Earthquake & Roadway Slope Failures',
    category: 'Earthquake & Liquefaction',
    state: 'Manipur',
    location: 'Tamenglong - Imphal Highway Corridor',
    fatalitiesText: '8 Fatalities & Widespread Road Damage',
    impactDescription:
      'Precipitated dozens of rotational landslides along the Imphal-Jiribam highway, opening 100-meter-long tension fissures along road edges.',
    geotechnicalTrigger:
      'Focal depth 55km intraplate earthquake shaking unconsolidated sedimentary strata on 35-degree slopes.',
    severityLevel: 'Severe'
  },
  {
    id: 'dis-2020-subansiri',
    year: 2020,
    eventTitle: 'Siang & Subansiri River Flash Surge Toe Scouring',
    category: 'Monsoon Cloudburst',
    state: 'Arunachal Pradesh',
    location: 'Upper Subansiri and Lower Siang Valley',
    fatalitiesText: '4 Fatalities & 3 Bridges Destroyed',
    impactDescription:
      'High-velocity glacial melt and monsoon runoff eroded the toe of steep Siwalik formation cuttings, causing massive highway subsidence.',
    geotechnicalTrigger:
      'Toe removal by hydraulic scouring destroyed the resisting passive wedge of the slope, causing immediate upper slope rotation.',
    severityLevel: 'Severe'
  }
];
