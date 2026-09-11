import { DisasterEvidenceReport } from '../types/landslide';

// High-fidelity SVG photo data URLs representing field disaster evidence
function makeDisasterPhotoSvg(
  title: string,
  typeBadge: string,
  gradientStart: string,
  gradientEnd: string,
  featureDetails: string[]
): string {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="mountainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${gradientStart}"/>
      <stop offset="100%" stop-color="${gradientEnd}"/>
    </linearGradient>
    <linearGradient id="mudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#854d0e"/>
      <stop offset="100%" stop-color="#3f2305"/>
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background Sky & Mountain Silhouette -->
  <rect width="800" height="500" fill="url(#skyGrad)"/>
  <rect width="800" height="500" fill="url(#grid)"/>

  <!-- Mountain Slope Ridge -->
  <path d="M 0,320 L 180,180 L 360,250 L 520,120 L 720,240 L 800,190 L 800,500 L 0,500 Z" fill="#0f172a" opacity="0.8"/>
  
  <!-- Active Failure Slope Body -->
  <path d="M 120,500 L 220,260 Q 300,210 420,260 L 540,310 Q 640,360 760,500 Z" fill="url(#mountainGrad)"/>

  <!-- Debris / Mud Runout Lobe -->
  <path d="M 280,310 Q 360,330 380,380 Q 420,440 340,500 L 620,500 Q 560,420 510,360 Q 460,300 420,260 Z" fill="url(#mudGrad)" opacity="0.95"/>

  <!-- Tension Fissures / Fracture Lines -->
  <path d="M 260,240 Q 320,225 390,245" stroke="#ef4444" stroke-width="4" stroke-dasharray="6,4" fill="none"/>
  <path d="M 290,265 Q 350,250 430,270" stroke="#f59e0b" stroke-width="3" stroke-dasharray="8,4" fill="none"/>
  <path d="M 330,290 Q 380,280 470,305" stroke="#ef4444" stroke-width="3.5" stroke-dasharray="6,4" fill="none"/>

  <!-- Fallen Boulders / Rock Mass -->
  <polygon points="340,390 375,370 395,405 350,420" fill="#713f12" stroke="#451a03" stroke-width="2"/>
  <polygon points="440,430 480,410 500,445 455,465" fill="#582f0e" stroke="#2c1810" stroke-width="2"/>
  <polygon points="390,460 420,445 435,475 400,485" fill="#78350f" stroke="#451a03" stroke-width="2"/>

  <!-- Roadway with Debris Encroachment -->
  <path d="M 0,440 Q 400,450 800,430 L 800,485 Q 400,505 0,485 Z" fill="#334155"/>
  <path d="M 0,460 Q 400,470 800,450" stroke="#fbbf24" stroke-width="3" stroke-dasharray="14,14" fill="none"/>

  <!-- Road Blockage Marker Zone -->
  <rect x="330" y="435" width="220" height="50" fill="rgba(239, 68, 68, 0.4)" stroke="#ef4444" stroke-width="2" rx="6"/>
  <text x="440" y="465" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">
    ROAD BLOCKED: 100% ROADWAY IMPASSE
  </text>

  <!-- Evidence Identification Overlay HUD -->
  <rect x="20" y="20" width="760" height="70" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" rx="10"/>
  <text x="40" y="45" fill="#f8fafc" font-family="sans-serif" font-size="16" font-weight="800">
    FIELD EVIDENCE PHOTO: ${title}
  </text>
  <text x="40" y="68" fill="#94a3b8" font-family="sans-serif" font-size="12">
    GEO-TAGGED NORTHEAST DISASTER SURVEILLANCE • VERIFIED PHOTOMETRIC RECORD
  </text>

  <!-- Type Badge -->
  <rect x="620" y="32" width="140" height="28" fill="#dc2626" rx="6"/>
  <text x="690" y="51" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">
    ${typeBadge}
  </text>

  <!-- Feature Markers on Photo -->
  <g transform="translate(420, 240)">
    <circle r="12" fill="#ef4444" opacity="0.8"/>
    <circle r="6" fill="#ffffff"/>
    <rect x="20" y="-12" width="160" height="24" fill="#0f172a" rx="4" stroke="#ef4444" stroke-width="1"/>
    <text x="30" y="4" fill="#fca5a5" font-family="sans-serif" font-size="10" font-weight="bold">${featureDetails[0] || 'Scarp Fracture'}</text>
  </g>

  <g transform="translate(350, 360)">
    <circle r="12" fill="#f59e0b" opacity="0.8"/>
    <circle r="6" fill="#ffffff"/>
    <rect x="-180" y="-12" width="165" height="24" fill="#0f172a" rx="4" stroke="#f59e0b" stroke-width="1"/>
    <text x="-170" y="4" fill="#fde68a" font-family="sans-serif" font-size="10" font-weight="bold">${featureDetails[1] || 'Debris Runout'}</text>
  </g>
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_DISASTER_EVIDENCE: DisasterEvidenceReport[] = [
  {
    id: 'ev-dima-hasao-01',
    stationId: 'st-ne-01',
    locationName: 'Jatinga Valley Railway Cut (NH-27)',
    region: 'Assam, Northeast India',
    latitude: 25.1852,
    longitude: 93.0315,
    timestamp: '2026-09-10T14:32:00.000Z',
    reporterName: 'Er. Bhaskar Barman',
    reporterRole: 'Field Geologist',
    reporterContact: '+91 94350-12844',
    userObservations:
      'Massive 60-meter rotational scarp failure along excavated highway slope after 180mm continuous monsoon rains. Tension fissures have severed the shoulder pavement and mud slurry is engulfing the retaining crib-walls.',
    photoUrl: makeDisasterPhotoSvg(
      'Jatinga Cut Slope Failure',
      'ROTATIONAL SLUMP',
      '#451a03',
      '#78350f',
      ['Crescent Head Scarp', 'Mud Saturated Toe']
    ),
    photoThumbnailUrl: makeDisasterPhotoSvg(
      'Jatinga Cut',
      'ROTATIONAL SLUMP',
      '#451a03',
      '#78350f',
      ['Scarp', 'Toe']
    ),
    imageDimensions: { width: 800, height: 500 },
    imageFileName: 'jatinga_nh27_scarp_failure.jpg',
    imageSizeBytes: 78400,
    disasterType: 'Rotational Landslide',
    severityLevel: 'critical',
    identificationConfidencePct: 96,
    detectedFeatures: [
      'Arcuate head scarp with 3.2m vertical throw',
      'Tension crack network spanning 85 meters along ridge',
      'Debris lobe fully covering 2 traffic lanes of NH-27',
      'Sheared drainage catchwater channels'
    ],
    recommendedImmediateAction:
      'Close NH-27 section between Haflong and Jatinga. Evacuate 14 families living 120m below the crown. Mobilize heavy excavator and shotcrete team.',
    verificationStatus: 'Verified Disaster',
    verifiedBy: 'State Disaster Management Authority (ASDMA)',
    verifiedAt: '2026-09-10T15:05:00.000Z',
  },
  {
    id: 'ev-dzuko-valley-02',
    stationId: 'st-ne-03',
    locationName: 'Dzüko Valley Trekking Pass & Ridge',
    region: 'Nagaland / Manipur Border',
    latitude: 25.556,
    longitude: 94.062,
    timestamp: '2026-09-09T18:15:00.000Z',
    reporterName: 'Kevi Angami',
    reporterRole: 'Village Head',
    reporterContact: '+91 98622-49110',
    userObservations:
      'Loud roaring sound followed by high-velocity debris avalanche carrying soil and snapped bamboo groves into the Dzüko river stream. The trail is completely obliterated.',
    photoUrl: makeDisasterPhotoSvg(
      'Dzüko Valley Debris Surge',
      'DEBRIS FLOW',
      '#3b1b08',
      '#5c2e10',
      ['High Velocity Track', 'Buried River Channel']
    ),
    photoThumbnailUrl: makeDisasterPhotoSvg(
      'Dzüko Valley Debris',
      'DEBRIS FLOW',
      '#3b1b08',
      '#5c2e10',
      ['Track', 'Channel']
    ),
    imageDimensions: { width: 800, height: 500 },
    imageFileName: 'dzuko_gully_debris_surge.jpg',
    imageSizeBytes: 82100,
    disasterType: 'Debris Flow / Mudslide',
    severityLevel: 'critical',
    identificationConfidencePct: 94,
    detectedFeatures: [
      'Steep channelized debris flume with scouring to bedrock',
      'Temporary damming of upstream tributary creek',
      'Uprooted tree trunks and boulder slurry deposition',
      'High pore pressure slurry plume'
    ],
    recommendedImmediateAction:
      'Prohibit trekking access to valley. Alert downstream settlements in Viswema along stream basin for potential flash flood surge when dam breaches.',
    verificationStatus: 'Verified Disaster',
    verifiedBy: 'Nagaland State Disaster Management (NSDMA)',
    verifiedAt: '2026-09-09T19:00:00.000Z',
  },
  {
    id: 'ev-champhai-03',
    stationId: 'st-ne-06',
    locationName: 'Champhai Seismic Fault Terrace',
    region: 'Mizoram, Northeast India',
    latitude: 23.4735,
    longitude: 93.3282,
    timestamp: '2026-09-08T11:20:00.000Z',
    reporterName: 'Lalremruata Colney',
    reporterRole: 'Citizen Observer',
    reporterContact: '+91 97740-88231',
    userObservations:
      'Noticed deep stepped ground cracks passing directly through our terrace farming slopes and backyard retaining structure. The ground dropped by 20cm overnight.',
    photoUrl: makeDisasterPhotoSvg(
      'Champhai Terrace Cracks',
      'TENSION CRACKING',
      '#1e293b',
      '#475569',
      ['Stepped Shear Crack', 'Terrace Subsidence']
    ),
    photoThumbnailUrl: makeDisasterPhotoSvg(
      'Champhai Cracks',
      'TENSION CRACKING',
      '#1e293b',
      '#475569',
      ['Crack', 'Subsidence']
    ),
    imageDimensions: { width: 800, height: 500 },
    imageFileName: 'champhai_subsidence_cracks.jpg',
    imageSizeBytes: 69200,
    disasterType: 'Slope Tension Cracks & Subsidence',
    severityLevel: 'high',
    identificationConfidencePct: 91,
    detectedFeatures: [
      'Parallel tension fissures with 15-25cm vertical displacement',
      'Lateral spread in weathered shale and siltstone bed',
      'Distortion of masonry retaining stone foundation'
    ],
    recommendedImmediateAction:
      'Seal fractures with polythene sheeting to prevent monsoon water infiltration into slip plane. Install tilt sensors on nearest homestead.',
    verificationStatus: 'Under Investigation',
    verifiedBy: 'Geological Survey of India (NER Shillong)',
    verifiedAt: '2026-09-08T14:40:00.000Z',
  },
  {
    id: 'ev-guwahati-04',
    stationId: 'st-ne-09',
    locationName: 'Guwahati Kharghuli Hill Edge',
    region: 'Kamrup Metro, Assam',
    latitude: 26.195,
    longitude: 91.782,
    timestamp: '2026-09-07T09:45:00.000Z',
    reporterName: 'Rituraj Sharma',
    reporterRole: 'Emergency Responder',
    reporterContact: '+91 94351-77021',
    userObservations:
      'Uncontrolled hill cutting at the toe for building construction has destabilized the red soil slope. Boulders and gravel continuously trickling onto the access lane.',
    photoUrl: makeDisasterPhotoSvg(
      'Kharghuli Toe Cut Failure',
      'TOE CUT SLUMP',
      '#7c2d12',
      '#991b1b',
      ['Debuttressed Toe', 'Tilted Retaining Wall']
    ),
    photoThumbnailUrl: makeDisasterPhotoSvg(
      'Kharghuli Toe Cut',
      'TOE CUT SLUMP',
      '#7c2d12',
      '#991b1b',
      ['Toe Cut', 'Retaining Wall']
    ),
    imageDimensions: { width: 800, height: 500 },
    imageFileName: 'kharghuli_toe_excavation.jpg',
    imageSizeBytes: 74500,
    disasterType: 'Toe Cut Slump',
    severityLevel: 'high',
    identificationConfidencePct: 93,
    detectedFeatures: [
      'Anthropogenic toe excision leaving 70° vertical wall',
      'Overhanging red laterite crust with unsupported root layer',
      'Active minor rock and soil spalling during showers'
    ],
    recommendedImmediateAction:
      'Issue immediate stop-work order under Assam Hill Cutting Prohibition Act. Construct gabion retaining structure and install slope drain canvas.',
    verificationStatus: 'Pending Geologist Review',
  },
];
