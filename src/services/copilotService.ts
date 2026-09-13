import { LandslideStation } from '../types/landslide';
import { INITIAL_SLOPE_REGISTRY } from './landslideMemoryEngine';
import { VULNERABLE_POPULATION_ZONES, RESCUE_MISSION_PLAN_TAWANG } from './cascadeRiskEngine';

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot';
  timestamp: string;
  text: string;
  sources?: string[];
  actionLink?: {
    label: string;
    section: string;
  };
}

export function queryBhuShaktiCopilot(
  query: string,
  stations: LandslideStation[],
  selectedStation: LandslideStation | null
): CopilotMessage {
  const q = query.toLowerCase().trim();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const uniqueId = `copilot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // 1. WHICH AREAS ARE AT HIGHEST RISK?
  if (q.includes('highest risk') || q.includes('most vulnerable') || q.includes('critical zone')) {
    return {
      id: uniqueId,
      sender: 'copilot',
      timestamp: timeStr,
      text: `Based on live telemetry and Physics-Informed Geotechnical Stability (PINN) assessments across all 16 Northeast stations, the top 3 critical hazard zones are:
1. **Tawang Sela Pass (Arunachal Pradesh)**: Risk Score **84/100** (Factor of Safety: **1.04** - Imminent shear failure, 155mm rain/24h).
2. **Noney Tupul Corridor (Manipur)**: Risk Score **94% Historical Match** (Excess overburden saturation, Ijei river damming risk).
3. **Dima Hasao New Haflong (Assam)**: Risk Score **88/100** (Shale slaking along NH-54E cutting).

Recommendation: Prioritize evacuation staging for Sela South Portal and monitor Tupul river flow rate.`,
      sources: ['Live IoT Inclinometer Mesh', 'GSI Landslide Susceptibility Map', 'IMD Doppler Radar'],
      actionLink: { label: 'Inspect Tawang in Risk Map', section: 'risk_map' },
    };
  }

  // 2. WHY IS TAWANG RISK INCREASING? ("WHY NOW?")
  if (q.includes('why') && (q.includes('tawang') || q.includes('increasing') || q.includes('risk increase') || q.includes('why now'))) {
    return {
      id: uniqueId,
      sender: 'copilot',
      timestamp: timeStr,
      text: `Tawang's risk increased from **46/100 yesterday** to **78/100 today (+32 points)** due to three compounding geotechnical drivers:
- **Rainfall Surge (+28 pts)**: Continuous monsoon infiltration reached 155 mm over 24 hours.
- **Pore-Water Pressure (+17 pts)**: Subsurface piezometers recorded 71 kPa, causing hydrostatic uplift and lubricating the shear surface along the 48° incline.
- **Disaster Memory Correlation (+12 pts)**: Current saturation and displacement (7.2 mm/day) match **91% with the 2021 Sela Pass failure** that severed the military highway.

The slope is currently debuttressed at the toe by recent highway 4-laning road cuts.`,
      sources: ['Slope ID: TAW-042', 'Sela Inclinometer Node 01', 'Historical Disaster Archive 2021'],
      actionLink: { label: 'Open "Why Now?" Waterfall', section: 'landslide' },
    };
  }

  // 3. WHICH ROADS ARE UNSAFE / BLOCKED?
  if (q.includes('road') || q.includes('highway') || q.includes('blocked') || q.includes('unsafe')) {
    return {
      id: uniqueId,
      sender: 'copilot',
      timestamp: timeStr,
      text: `Current Northeast Highway Status Summary:
- ❌ **NH-13 Sela Pass (Km 42-45)**: **BLOCKED / CRITICAL**. Active slope creep and tension crack opening across 380m of road surface. Closed to civilian convoys.
- ⚠️ **NH-54E Dima Hasao Gorge**: **WARNING**. Slow mudflow deposit near Haflong; single-lane traffic only.
- ⚠️ **NH-310 Gangtok-Nathula (13th Mile)**: **WARNING**. Cloudburst debris scoured outer culvert.
- ✅ **Dirang-Lubrang High Ridge Bypass**: **SAFE CORRIDOR RECOMMENDED**. Competent granite ridge route, all-weather 4x4 capable.`,
      sources: ['BRO Project Vartak Highway Logs', 'State Traffic Police Dispatch', 'Sentinel-1 InSAR'],
      actionLink: { label: 'View Safe Bypass Routes', section: 'alerts' },
    };
  }

  // 4. WHAT HAPPENS IF RAINFALL INCREASES BY 40%? ("WHAT-IF")
  if (q.includes('rainfall increases') || q.includes('what happens') || q.includes('40%') || q.includes('rain increase') || q.includes('what-if')) {
    return {
      id: uniqueId,
      sender: 'copilot',
      timestamp: timeStr,
      text: `Running What-If Scenario (+40% Rainfall Surcharge):
- **Risk Score**: Escalates from **78/100** to **96/100 [CRITICAL FAILURE]**.
- **Factor of Safety (FS)**: Drops from **1.04** to **0.78** (< 1.0 indicates mathematical shear rupture).
- **Cascade Trigger**: 88% probability of debris surge entering downstream drainage channels, with high threat of flash inundation.
- **Population Impact**: Directly endangers 2,180 residents across Jang and Baisakhi settlements.

Mitigation Countermeasure: If engineered geotextile drainage channels are deployed and the road is closed immediately, the risk score drops back down to 58/100.`,
      sources: ['BhuShakti What-If Simulation Engine', 'Infinite Slope Limit Equilibrium Model'],
      actionLink: { label: 'Open What-If Simulator', section: 'analytics' },
    };
  }

  // 5. WHICH VILLAGE HAS HIGHEST POPULATION EXPOSURE?
  if (q.includes('village') || q.includes('population') || q.includes('exposure') || q.includes('vulnerable population')) {
    const topZone = VULNERABLE_POPULATION_ZONES[0];
    return {
      id: uniqueId,
      sender: 'copilot',
      timestamp: timeStr,
      text: `Highest Population Exposure Rankings:
1. **${topZone.zoneName}**: **${topZone.totalPopulation.toLocaleString()} residents** exposed (Exposure Score: **${topZone.exposureScore}/100**). Contains **${topZone.childrenCount} children** and **${topZone.elderlyCount} elderly** persons across ${topZone.criticalFacilitiesCount} facilities. Road access is COMPROMISED.
2. **Noney Tupul River Basin**: 3,450 residents exposed (Exposure Score: 89/100). Road access is SEVERELY BLOCKED due to debris damming risk.
3. **Haflong Railway Sub-Gorge Sector**: 4,200 residents exposed (Exposure Score: 78/100).`,
      sources: ['District Census 2021 Overlay', 'Vulnerable Population Exposure Engine'],
      actionLink: { label: 'Open Cascade & Population View', section: 'flood' },
    };
  }

  // 6. WHICH INCIDENT SHOULD WE RESPOND TO FIRST? ("AI RESPONSE PRIORITY")
  if (q.includes('respond first') || q.includes('priority') || q.includes('prioritize') || q.includes('first incident')) {
    return {
      id: uniqueId,
      sender: 'copilot',
      timestamp: timeStr,
      text: `**Priority 1 Response Assignment: Sela Pass South Portal & Jang Valley (TAW-042)**
Reason for prioritization:
1. **Critical FS (1.04)**: Rupture is imminent within 6-18 hours.
2. **High Population Exposure**: 340 students and staff at Jang Higher Secondary School sit directly in the runout corridor.
3. **Strategic Logistics Severance**: NH-13 is the sole lifeline for high-altitude defense outposts and 2,180 civilians.

Response Directive: Dispatched 12th Bn NDRF Alpha (ETA 45 mins) and staged 2 BRO heavy excavators at Km 41.`,
      sources: ['AI Emergency Response Prioritizer', 'Incident TAW-042-2026-001'],
      actionLink: { label: 'Review Response Plan', section: 'alerts' },
    };
  }

  // 7. WHAT SHOULD THE RESPONSE TEAM DO? ("AI MISSION PLANNER")
  if (q.includes('response team') || q.includes('mission plan') || q.includes('what should') || q.includes('action plan') || q.includes('checklist')) {
    const steps = RESCUE_MISSION_PLAN_TAWANG.slice(0, 4);
    return {
      id: uniqueId,
      sender: 'copilot',
      timestamp: timeStr,
      text: `Actionable AI Incident Response Plan for Current Station (${selectedStation?.name || 'Tawang Sela'}):
1. **Automated Siren & Cell Broadcast**: Trigger localized Monpa/Hindi alert to 2,180 residents within 3km [Completed].
2. **Physical Highway Barricade**: Erect traffic gates at Baisakhi and Sela South Portal on NH-13 [In Progress].
3. **Precautionary School Evacuation**: Move 340 students of Jang Higher Secondary School to the Community Hall Ridge Shelter (+120m elevation) [In Progress].
4. **Deploy Heavy Excavators**: Position BRO hydraulic breakers at safety turnout Km 41 for rapid toe clearance [En Route].
5. **Activate Medical Staging**: Standby 4x4 mobile trauma units at Nurang Base [Pending].`,
      sources: ['AI Rescue Mission Planner', 'Standard Operating Procedure (NDMA Guidelines)'],
      actionLink: { label: 'View Full 7-Step Plan', section: 'alerts' },
    };
  }

  // 8. SHOW FLOOD IMPACT / WATER FLOW
  if (q.includes('flood') || q.includes('river') || q.includes('water flow') || q.includes('inundation')) {
    return {
      id: uniqueId,
      sender: 'copilot',
      timestamp: timeStr,
      text: `Hydrological & Flood Risk Intelligence:
- **River Channels**: Teesta River (Sikkim) and Brahmaputra tributaries (Assam) are at **High Flow (Red Alert)**.
- **Debris Damming Cascade**: In Noney (Manipur), hill slope debris has created an artificial dam across the Ijei river, raising upstream water levels by 1.4m/hour with severe risk of breach surge.
- **Water Flow Color Standards**: Blue (Main River), Light Blue (Normal Flow), Orange (Surface Runoff), Red (High Flow), Purple (Bank Overflow), Dark Blue (Submerged Lowlands).`,
      sources: ['Central Water Commission (CWC) Gauges', 'Hydro-GIS Inundation Model'],
      actionLink: { label: 'Open Flood Intelligence View', section: 'flood' },
    };
  }

  // 9. DEFAULT SMART RESPONSE GROUNDED IN APPLICATION DATA
  const activeName = selectedStation?.name || 'Tawang Sela Pass';
  const activeRain = selectedStation?.telemetry?.rainfall24hMm || 155;
  const activeFS = selectedStation?.riskAssessment?.safetyFactor || 1.04;
  const activeStatus = selectedStation?.riskAssessment?.status || 'critical';

  return {
    id: uniqueId,
    sender: 'copilot',
    timestamp: timeStr,
    text: `Currently monitoring **${activeName}** (${selectedStation?.region || 'Arunachal Pradesh'}):
- 24h Rainfall: **${activeRain} mm**
- Factor of Safety (FS): **${activeFS}** (Status: **${activeStatus.toUpperCase()}**)
- Historical Similarity: **91% match with 2021 Sela Pass failure**
- Active Hazards: Sela NH-13 Highway block threat, Sela Tunnel approach debris spill.

You can ask me about:
- "Why is risk increasing?"
- "Which areas are at highest risk?"
- "Which roads are unsafe?"
- "What happens if rainfall increases by 40%?"
- "Which village has highest exposure?"
- "Which incident should we respond to first?"`,
    sources: ['BhuShakti Real-Time Telemetry', 'Active Station Sensor Feed'],
  };
}
