import * as THREE from 'three';
import {
  LocationGeographicProfile,
  LocationElevationResult,
  GEOGRAPHIC_LOCATIONS,
  getGeographicLocationById,
} from './geospatialDataService';
import {
  LocationBounds,
  LocationFeatureDataset,
  TerrainDemResult,
  VERIFIED_LOCATION_DATASETS,
  getLocationFeatureDataset,
  sampleDemElevationAt,
  getTerrainCacheKey,
} from './locationDemStore';

function distanceToPolyline(px: number, pz: number, coords: [number, number][]): number {
  if (!coords || coords.length === 0) return 999;
  if (coords.length === 1) return Math.hypot(px - coords[0][0], pz - coords[0][1]);
  let minDist = 999;
  for (let i = 0; i < coords.length - 1; i++) {
    const x1 = coords[i][0];
    const z1 = coords[i][1];
    const x2 = coords[i + 1][0];
    const z2 = coords[i + 1][1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const lenSq = dx * dx + dz * dz;
    let dist = 999;
    if (lenSq === 0) {
      dist = Math.hypot(px - x1, pz - z1);
    } else {
      const t = Math.max(0, Math.min(1, ((px - x1) * dx + (pz - z1) * dz) / lenSq));
      dist = Math.hypot(px - (x1 + t * dx), pz - (z1 + t * dz));
    }
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}


export type CameraViewName =
  | 'OVERVIEW'
  | 'REGIONAL'
  | 'MOUNTAIN'
  | 'SLOPE'
  | 'LANDSLIDE'
  | 'ROAD'
  | 'RIVER'
  | 'VILLAGE'
  | 'FLOOD'
  | 'IMPACT'
  | 'INCIDENT'
  | 'AERIAL';

export type RainIntensity = 'OFF' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'EXTREME';
export type VisualMode = 'DISASTER' | 'REALISTIC' | 'SATELLITE' | 'HEATMAP' | 'ELEVATION';
export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export interface LayerVisibility {
  terrain: boolean;
  forest: boolean;
  roads: boolean;
  rivers: boolean;
  villages: boolean;
  rain: boolean;
  landslide: boolean;
  flood: boolean;
  impactZone: boolean;
  contours: boolean;
  sensors?: boolean;
  warningSigns?: boolean;
  riskHeatmap?: boolean;
  landslideRisk?: boolean;
  floodRisk?: boolean;
  powerLines?: boolean;
  safetyRoutes?: boolean;
  labels?: boolean;
}

export interface ScenarioState {
  stepIndex: number;
  progress: number;
  rainfallMmH: number;
  soilSaturationPct: number;
  factorOfSafety: number;
  porePressureKpa: number;
  riverDischargeM3s: number;
  floodWaterDepthM: number;
  floodExtentKm2: number;
  debrisVelocityKmh: number;
  roadStatus: 'NORMAL' | 'PARTIALLY BLOCKED' | 'BLOCKED' | 'EMERGENCY ACCESS ONLY';
  villageAtRisk: boolean;
  statusText: string;
}

export interface InteractiveEntityInfo {
  id: string;
  name: string;
  category: 'mountain' | 'road' | 'village' | 'river' | 'landslide' | 'infrastructure' | 'sensor';
  metrics: { [key: string]: string | number };
  status: string;
  aiRecommendation: string;
}

export interface CameraPreset {
  pos: THREE.Vector3;
  target: THREE.Vector3;
}

const CAMERA_PRESETS: Record<CameraViewName, CameraPreset> = {
  OVERVIEW: {
    pos: new THREE.Vector3(85, 65, 95),
    target: new THREE.Vector3(0, 8, 0),
  },
  REGIONAL: {
    pos: new THREE.Vector3(85, 65, 95),
    target: new THREE.Vector3(0, 8, 0),
  },
  MOUNTAIN: {
    pos: new THREE.Vector3(-65, 48, 62),
    target: new THREE.Vector3(-28, 26, 0),
  },
  SLOPE: {
    pos: new THREE.Vector3(-32, 34, 25),
    target: new THREE.Vector3(-18, 22, 2),
  },
  LANDSLIDE: {
    pos: new THREE.Vector3(-6, 24, 32),
    target: new THREE.Vector3(-16, 15, 2),
  },
  ROAD: {
    pos: new THREE.Vector3(-2, 14, 16),
    target: new THREE.Vector3(-8, 6.5, 0),
  },
  RIVER: {
    pos: new THREE.Vector3(36, 19, 48),
    target: new THREE.Vector3(16, 5, 8),
  },
  VILLAGE: {
    pos: new THREE.Vector3(46, 22, -22),
    target: new THREE.Vector3(26, 8, -6),
  },
  FLOOD: {
    pos: new THREE.Vector3(38, 28, 12),
    target: new THREE.Vector3(20, 5, 6),
  },
  IMPACT: {
    pos: new THREE.Vector3(-2, 16, 20),
    target: new THREE.Vector3(-8, 7.5, 0),
  },
  INCIDENT: {
    pos: new THREE.Vector3(10, 18, 18),
    target: new THREE.Vector3(-6, 8, 2),
  },
  AERIAL: {
    pos: new THREE.Vector3(0, 115, 12),
    target: new THREE.Vector3(0, 5, 0),
  },
};

export class DisasterTwinEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private clock: THREE.Clock;

  // Interaction & Orbit
  private isMouseDown = false;
  private isRightMouseDown = false;
  private mousePrevPos = { x: 0, y: 0 };
  private cameraTarget = new THREE.Vector3(0, 8, 0);
  private cameraDistance = 120;
  private cameraTheta = Math.PI / 4;
  private cameraPhi = Math.PI / 3.4;

  // Camera Tweening
  private isCameraTransitioning = false;
  private targetCameraPos: THREE.Vector3 | null = null;
  private targetCameraTarget: THREE.Vector3 | null = null;
  private cameraTransitionAlpha = 0;

  // Cinematic Tour Mode
  private isCinematicTour = false;

  // 3D Scene Components
  private terrainMesh!: THREE.Mesh;
  private terrainWireframeMesh!: THREE.LineSegments;
  private forestMesh!: THREE.InstancedMesh;
  private roadGroup!: THREE.Group;
  private roadMarkingGroup!: THREE.Group;
  private riverMesh!: THREE.Mesh;
  private riverWaterParticles!: THREE.Points;
  private floodMesh!: THREE.Mesh;
  private villageGroup!: THREE.Group;
  private infrastructureGroup!: THREE.Group;
  private powerLinesGroup!: THREE.Group;
  private rainParticles!: THREE.Points;
  private rainPositions!: Float32Array;
  private lightningLight!: THREE.PointLight;
  private tensionCracksMesh!: THREE.LineSegments;
  private slideWedgeGroup!: THREE.Group;
  private debrisRockParticles!: THREE.Points;
  private debrisMudParticles!: THREE.Points;
  private debrisPositions!: Float32Array;
  private debrisVelocities!: Float32Array;
  private debrisDamMesh!: THREE.Mesh;
  private roadBlockageDebris!: THREE.Group;
  private impactZonePerimeter!: THREE.Mesh;
  private flowVectorsGroup!: THREE.Group;
  private telemetryTowerGroup!: THREE.Group;
  private evacuationRouteGroup!: THREE.Group;
  private riskVolumeMesh!: THREE.Mesh;
  private landslideRiskMesh!: THREE.Mesh;
  private floodRiskMesh!: THREE.Mesh;
  private contourMesh!: THREE.LineSegments;
  private backdropMountainMesh!: THREE.Mesh;
  private currentLocationProfile: LocationGeographicProfile = GEOGRAPHIC_LOCATIONS[19]; // Default Tawang
  private currentDemData: LocationElevationResult | null = null;
  private roadSignPostMesh?: THREE.Mesh;
  private roadSignBoardMesh?: THREE.Mesh;

  // 3D IoT Sensor Beacons & Signs
  private tiltmeterRipples!: THREE.Mesh;
  private piezometerWave!: THREE.Mesh;
  private anemometerRotor!: THREE.Group;
  private radarWaves!: THREE.Mesh;
  private sensorGroup!: THREE.Group;
  private warningSignGroup!: THREE.Group;
  private cloudsGroup!: THREE.Group;
  private slopeWarningMesh!: THREE.Group;
  private roadBlockedSignMesh!: THREE.Group;

  // Lighting & Atmosphere
  private dirLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private ambientLight!: THREE.AmbientLight;
  private sunSphere!: THREE.Mesh;

  // Configuration
  private layerVisibility: LayerVisibility = {
    terrain: true,
    forest: true,
    roads: true,
    rivers: true,
    villages: true,
    rain: true,
    landslide: true,
    flood: true,
    impactZone: true,
    contours: false,
    sensors: true,
    warningSigns: true,
    riskHeatmap: false,
    powerLines: true,
    safetyRoutes: true,
    labels: true,
  };

  private currentVisualMode: VisualMode = 'DISASTER';
  private currentRainIntensity: RainIntensity = 'OFF';
  private currentQuality: GraphicsQuality = 'HIGH';
  private currentProgress = 0;
  private currentScenarioState: ScenarioState = {
    stepIndex: 0,
    progress: 0,
    rainfallMmH: 0,
    soilSaturationPct: 32,
    factorOfSafety: 1.65,
    porePressureKpa: 12,
    riverDischargeM3s: 42,
    floodWaterDepthM: 0,
    floodExtentKm2: 0,
    debrisVelocityKmh: 0,
    roadStatus: 'NORMAL',
    villageAtRisk: false,
    statusText: 'BASELINE: Stable Mountain Slope (FS = 1.65)',
  };

  // Raycasting for interactive 3D markers
  private raycaster = new THREE.Raycaster();
  private mouseVector = new THREE.Vector2();
  private onEntitySelectedCallback?: (info: InteractiveEntityInfo) => void;

  constructor(container: HTMLElement, onSelectEntity?: (info: InteractiveEntityInfo) => void) {
    this.container = container;
    this.onEntitySelectedCallback = onSelectEntity;
    this.clock = new THREE.Clock();

    // Scene with realistic Himalayan atmospheric sky & horizon fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x6e96be);
    this.scene.fog = new THREE.FogExp2(0x88a9c8, 0.0028);

    // Camera
    const aspect = container.clientWidth / Math.max(1, container.clientHeight);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 1200);
    this.updateCameraOrbit();

    // High performance WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // Build scene architecture
    this.setupLighting();
    this.buildHighDetailMountainTerrain();
    this.buildBackdropMountains();
    this.buildContourLines();
    this.buildInstancedForestVegetation();
    this.buildHighwayNH13AndBridges();
    this.buildRiverSystemAndFloodDynamics();
    this.buildVillageAndCriticalInfrastructure();
    this.buildPowerGridAndLifelines();
    this.buildVolumetricRainAndWeather();
    this.buildLandslideKinematicsAndDebrisLayers();
    this.buildSafeEvacuationRoutes();
    this.build3DRiskVolumesAndOverlays();
    this.buildConformalRiskLayers();
    this.buildTelemetrySensorsAndBoreholes();
    this.buildDynamicWarningSigns();
    this.buildVolumetricClouds();

    this.bindEvents();
    this.startAnimationLoop();
  }

  // -------------------------------------------------------------
  // LIGHTING & ENVIRONMENT
  // -------------------------------------------------------------
  private setupLighting(): void {
    // Soft sky ambient fill
    this.ambientLight = new THREE.AmbientLight(0xd4e5f7, 0.72);
    this.scene.add(this.ambientLight);

    // Atmospheric hemisphere: warm sunlight above, deep forest bounce below
    this.hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x223620, 0.88);
    this.hemiLight.position.set(0, 150, 0);
    this.scene.add(this.hemiLight);

    // Warm golden-hour mountain sun casting crisp, soft shadows into gullies and valleys
    this.dirLight = new THREE.DirectionalLight(0xfff6ea, 2.2);
    this.dirLight.position.set(85, 120, 60);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.bias = -0.0004;
    this.dirLight.shadow.camera.near = 15;
    this.dirLight.shadow.camera.far = 380;
    const d = 110;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.scene.add(this.dirLight);

    // Lightning Flash Light (Triggered in severe weather)
    this.lightningLight = new THREE.PointLight(0xcfd8dc, 0, 250);
    this.lightningLight.position.set(-15, 65, 0);
    this.scene.add(this.lightningLight);
  }

  // -------------------------------------------------------------
  // LOCATION-SPECIFIC 3D GEOGRAPHIC TERRAIN ELEVATION PIPELINE
  // -------------------------------------------------------------
  public getTerrainHeight(x: number, z: number): number {
    return this.calculateLocationTerrainHeight(x, z, this.currentLocationProfile, this.currentDemData);
  }

  private calculateLocationTerrainHeight(
    x: number,
    z: number,
    loc: LocationGeographicProfile,
    dem: LocationElevationResult | null
  ): number {
    const ds = getLocationFeatureDataset(loc.id);
    const u = Math.min(1, Math.max(0, (x + 110) / 220));
    const v = Math.min(1, Math.max(0, (z + 110) / 220));

    // 1. Location-specific elevation raster (from live Copernicus DEM or verified Copernicus/SRTM raster)
    const elevations = (dem && dem.elevations && dem.elevations.length >= 64)
      ? dem.elevations
      : ds.elevationRaster;

    const minM = (dem && dem.minElevationM !== undefined) ? dem.minElevationM : ds.minElevationM;
    const maxM = (dem && dem.maxElevationM !== undefined) ? dem.maxElevationM : ds.maxElevationM;
    const reliefM = Math.max(12, maxM - minM);

    // 2. High-precision bicubic/hermite sampling of the location's DEM raster
    const rawElevM = sampleDemElevationAt(elevations, 8, u, v);
    const normElev = Math.max(0, Math.min(1, (rawElevM - minM) / reliefM));

    // 3. Scale vertical relief proportionally to the real geographic relief of the location
    let targetRelief = 26.0;
    if (loc.category === 'FLOODPLAIN_ISLAND' || reliefM < 50) {
      // Majuli: very flat Brahmaputra river island (relief is only ~28m above water)
      targetRelief = 1.6;
    } else if (loc.category === 'LOWER_RELIEF_TRIPURA' || reliefM < 90) {
      // Agartala: gentle low relief plain (~53m relief)
      targetRelief = 4.2;
    } else if (loc.category === 'RAINFALL_PLATEAU') {
      // Cherrapunji / Umiam: High sandstone tableland with abrupt canyon gorge drop
      targetRelief = 20.0;
    } else {
      // High mountain ranges: Gangtok, Tawang, Aizawl, Kohima, Wayanad, Chamoli
      targetRelief = Math.min(50, Math.max(14.0, (reliefM / 2400) * 44 * (loc.engineProfile?.elevationScale || 1.0)));
    }

    let h = 2.4 + normElev * targetRelief;

    // 4. Subtle micro-geomorphic roughness scaled by cliffSteepness (preserves real DEM macro shape while adding crisp rock/soil texture)
    const ruggedFactor = (loc.engineProfile?.cliffSteepness || 1.0) * Math.min(1.0, reliefM / 1000);
    if (loc.category !== 'FLOODPLAIN_ISLAND') {
      const microNoise =
        (Math.sin(x * 0.18 + z * 0.14) * 0.45 +
         Math.cos(x * 0.32 - z * 0.28) * 0.25) * ruggedFactor;
      h += microNoise;
    } else {
      // Alluvial sandbar ripples for Majuli
      const sandbarMounds = (Math.sin(u * 14.0) * 0.25 + Math.cos(v * 10.0) * 0.2) * 0.5;
      h += sandbarMounds;
    }

    // 5. Location-specific river valley carving following the location's real river polyline
    const distRiver = distanceToPolyline(x, z, ds.riverCoords);
    const riverWidth = loc.category === 'FLOODPLAIN_ISLAND' ? 18.0 : 12.0 * (loc.engineProfile?.riverBedWidth || 1.0);
    if (distRiver < riverWidth) {
      const t = distRiver / riverWidth; // 0 at center, 1 at bank
      const carveFactor = Math.pow(1 - t, 1.8);
      const bedH = loc.category === 'FLOODPLAIN_ISLAND' ? 2.15 : 3.2;
      h = h * (1 - carveFactor * 0.75) + bedH * (carveFactor * 0.75);
    }

    return Math.max(2.15, h);
  }

  // Get slope angle (in degrees) at coordinate (x, z)
  public getSlopeAngle(x: number, z: number): number {
    const delta = 1.0;
    const hL = this.getTerrainHeight(x - delta, z);
    const hR = this.getTerrainHeight(x + delta, z);
    const hD = this.getTerrainHeight(x, z - delta);
    const hU = this.getTerrainHeight(x, z + delta);
    const dzdx = (hR - hL) / (2 * delta);
    const dzdz = (hU - hD) / (2 * delta);
    const slopeRad = Math.atan(Math.sqrt(dzdx * dzdx + dzdz * dzdz));
    return (slopeRad * 180) / Math.PI;
  }

  private createTerrainDetailTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.CanvasTexture(canvas);

    ctx.fillStyle = '#7a7f72';
    ctx.fillRect(0, 0, 512, 512);

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      const striation = Math.sin(y * 0.14) * 16 + Math.sin(y * 0.38) * 9;
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        const noise = (Math.random() - 0.5) * 26 + Math.sin(x * 0.18 + y * 0.08) * 12;
        const val = Math.max(0, Math.min(255, 128 + striation + noise));
        data[idx] = val * 0.96;
        data[idx + 1] = val * 1.02;
        data[idx + 2] = val * 0.92;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }

  private buildHighDetailMountainTerrain(): void {
    const size = 220;
    const segments = 160; // High mesh fidelity
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const posAttr = geometry.attributes.position;
    const count = posAttr.count;

    const colors = new Float32Array(count * 3);
    const col = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = this.getTerrainHeight(x, z);
      posAttr.setY(i, y);

      const slope = this.getSlopeAngle(x, z);

      // Multi-criteria natural geological shading
      if (y < 4.2) {
        // Riverbed gravel / alluvial silt
        col.setRGB(0.34, 0.38, 0.38);
      } else if (x > -26 && x < -4 && z > -18 && z < 18) {
        // Colluvial slide zone: weathered reddish-brown clay & unstable schist
        col.setRGB(0.58, 0.35, 0.22);
      } else if (slope > 42) {
        // Sheer Escarpment & Cliffs: dark jagged rock & slate
        const rockTint = 0.36 + Math.sin(x * 0.2 + z * 0.15) * 0.04;
        col.setRGB(rockTint, rockTint * 0.96, rockTint * 0.92);
      } else if (y > 38) {
        // High altitude granite ridge & cold rock with snow pockets
        const snowPockets = (1 - Math.abs(Math.sin(x * 0.12))) * 0.15;
        const tint = 0.82 + snowPockets;
        col.setRGB(tint, tint * 0.97, Math.min(1.0, tint * 1.05));
      } else if (slope > 28) {
        // Sub-alpine scree & weathered brown stone
        col.setRGB(0.48, 0.44, 0.38);
      } else if (y < 18) {
        // Lush valley & alpine forest canopy
        const varG = 0.28 + Math.sin(x * 0.25) * 0.06;
        col.setRGB(0.14, 0.38 + varG * 0.14, 0.18);
      } else {
        // Mid-elevation montane forest & alpine meadows
        col.setRGB(0.22, 0.42, 0.24);
      }

      // Micro ambient-shadowing for concave depressions
      const ao = Math.min(1.0, 0.88 + y * 0.0035);
      col.multiplyScalar(ao);

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const detailTex = this.createTerrainDetailTexture();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: detailTex,
      bumpMap: detailTex,
      bumpScale: 0.85,
      roughness: 0.86,
      metalness: 0.06,
      flatShading: false,
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.receiveShadow = true;
    this.terrainMesh.castShadow = true;
    this.terrainMesh.userData = { entityId: 'mountain_corridor' };
    this.scene.add(this.terrainMesh);
  }

  // -------------------------------------------------------------
  // DISTANT HIMALAYAN HORIZON BACKDROP (Eliminates flat cut plane)
  // -------------------------------------------------------------
  private buildBackdropMountains(): void {
    const ringRadiusInner = 105;
    const ringRadiusOuter = 360;
    const segmentsTheta = 96;
    const segmentsRad = 12;

    const geometry = new THREE.RingGeometry(ringRadiusInner, ringRadiusOuter, segmentsTheta, segmentsRad);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    const col = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z);
      const angle = Math.atan2(z, x);

      // Blend factor from inner terrain boundary to distant ring
      const blend = Math.min(1, Math.max(0, (dist - ringRadiusInner) / 45));

      // Majestic panoramic mountain ridges encircling the horizon
      const peakNoise =
        Math.abs(Math.sin(angle * 7)) * 55 +
        Math.abs(Math.cos(angle * 13)) * 32 +
        Math.sin(angle * 29) * 14;

      const falloff = Math.max(0, 1 - Math.pow(Math.abs(dist - 235) / 125, 2));
      const h = Math.max(0, peakNoise * falloff * blend);
      pos.setY(i, h);

      if (h > 45) {
        col.setRGB(0.88, 0.92, 0.96); // Distant snow summits
      } else if (h > 24) {
        col.setRGB(0.46, 0.52, 0.60); // Slate blue granite ridges
      } else {
        col.setRGB(0.30, 0.42, 0.38); // Deep forest foothills
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.05,
      flatShading: false,
    });

    this.backdropMountainMesh = new THREE.Mesh(geometry, material);
    this.backdropMountainMesh.receiveShadow = true;
    this.scene.add(this.backdropMountainMesh);
  }

  // -------------------------------------------------------------
  // ELEVATION CONTOUR LINES (Optional Professional GIS Overlay)
  // -------------------------------------------------------------
  private buildContourLines(): void {
    const linesGroup = new THREE.Group();
    const contourMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      linewidth: 1,
    });

    // Create isolines at 5m vertical intervals (5m to 40m)
    for (let contourH = 6; contourH <= 38; contourH += 4) {
      const points: THREE.Vector3[] = [];
      for (let z = -75; z <= 75; z += 3) {
        for (let x = -80; x <= 80; x += 3) {
          const y = this.getTerrainHeight(x, z);
          if (Math.abs(y - contourH) < 0.4) {
            points.push(new THREE.Vector3(x, y + 0.1, z));
          }
        }
      }
      if (points.length > 10) {
        const cGeom = new THREE.BufferGeometry().setFromPoints(points);
        const cPoints = new THREE.Points(cGeom, new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.6, transparent: true, opacity: 0.4 }));
        linesGroup.add(cPoints);
      }
    }

    this.contourMesh = linesGroup as any;
    this.contourMesh.visible = false;
    this.scene.add(linesGroup);
  }

  // -------------------------------------------------------------
  // FOREST DETAIL & INSTANCED VEGETATION
  // -------------------------------------------------------------
  private buildInstancedForestVegetation(): void {
    const treeCount = 650;
    // Composite tree geometry: Alpine conifer
    const canopyGeom = new THREE.ConeGeometry(0.85, 2.8, 5);
    canopyGeom.translate(0, 1.8, 0);

    const trunkGeom = new THREE.CylinderGeometry(0.12, 0.2, 0.8, 5);
    trunkGeom.translate(0, 0.4, 0);

    const treeGeom = new THREE.BufferGeometry();
    const cPos = canopyGeom.attributes.position.array;
    const tPos = trunkGeom.attributes.position.array;
    const merged = new Float32Array(cPos.length + tPos.length);
    merged.set(cPos, 0);
    merged.set(tPos, cPos.length);
    treeGeom.setAttribute('position', new THREE.BufferAttribute(merged, 3));
    treeGeom.computeVertexNormals();

    const treeMat = new THREE.MeshStandardMaterial({
      color: 0x1b4324,
      roughness: 0.8,
      metalness: 0.05,
      flatShading: true,
    });

    this.forestMesh = new THREE.InstancedMesh(treeGeom, treeMat, treeCount);
    this.forestMesh.castShadow = true;
    this.forestMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    let placed = 0;

    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 24;
      const radius = 8 + (i % 65);
      const x = Math.cos(angle) * radius * 1.15 - 6;
      const z = Math.sin(angle) * radius * 1.08;

      // Disallow trees in unstable gully or directly in river channel
      const inGully = x > -25 && x < -3 && z > -18 && z < 18;
      const riverCenter = 16 + Math.sin(z * 0.048) * 8.5;
      const inRiver = Math.abs(x - riverCenter) < 4.8;

      const y = this.getTerrainHeight(x, z);
      const slope = this.getSlopeAngle(x, z);

      if (!inGully && !inRiver && y >= 5.0 && y <= 28.0 && slope < 36) {
        dummy.position.set(x, y - 0.2, z);
        const sc = 0.75 + (Math.sin(i * 1.8) * 0.35 + 0.35);
        dummy.scale.set(sc, sc * (0.9 + (i % 4) * 0.12), sc);
        dummy.rotation.y = (i * 0.85) % Math.PI;
        dummy.updateMatrix();
        this.forestMesh.setMatrixAt(placed, dummy.matrix);
        placed++;
      }
    }

    this.forestMesh.count = placed;
    this.forestMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.forestMesh);
  }

  // -------------------------------------------------------------
  // MOUNTAIN ROAD SYSTEM: NH-13, CONCRETE BRIDGE & ROAD BARRIERS
  // -------------------------------------------------------------
  private buildHighwayNH13AndBridges(): void {
    this.roadGroup = new THREE.Group();
    this.roadMarkingGroup = new THREE.Group();

    const roadPoints: THREE.Vector3[] = [];
    for (let z = -75; z <= 75; z += 4) {
      let x = -13 + (z + 75) * 0.37;
      if (z > 2 && z < 36) {
        x += Math.sin((z / 34) * Math.PI) * 4.2;
      }
      let y = this.getTerrainHeight(x, z) + 0.35;

      // Bridge across river gorge (z between 10 and 30)
      if (z >= 10 && z <= 28) {
        y = Math.max(y, 9.2); // Elevated concrete bridge span
      }
      roadPoints.push(new THREE.Vector3(x, y, z));
    }

    const roadCurve = new THREE.CatmullRomCurve3(roadPoints);
    const roadGeom = new THREE.TubeGeometry(roadCurve, 100, 1.5, 4, false);
    const pos = roadGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, pos.getY(i) * 0.14);
    }
    roadGeom.computeVertexNormals();

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1f242c,
      roughness: 0.9,
      metalness: 0.15,
    });
    const roadMesh = new THREE.Mesh(roadGeom, roadMat);
    roadMesh.receiveShadow = true;
    roadMesh.userData = { entityId: 'highway_nh13' };
    this.roadGroup.add(roadMesh);

    // Realistic W-Beam Guardrails with vertical posts along mountain outer curve
    const guardrailMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.85,
      roughness: 0.3,
    });
    const postGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6);
    const beamGeom = new THREE.BoxGeometry(0.08, 0.25, 3.8);

    for (let g = 0; g < roadPoints.length - 1; g += 2) {
      const pt = roadPoints[g];
      // Offset slightly to outer side of mountain road
      const post = new THREE.Mesh(postGeom, guardrailMat);
      post.position.set(pt.x + 1.6, pt.y + 0.45, pt.z);
      post.castShadow = true;
      this.roadGroup.add(post);

      const beam = new THREE.Mesh(beamGeom, guardrailMat);
      beam.position.set(pt.x + 1.6, pt.y + 0.65, pt.z + 1.8);
      this.roadGroup.add(beam);
    }

    // Yellow Dashed Center Lane Dividers
    const dashGeom = new THREE.BoxGeometry(0.12, 0.04, 1.8);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    for (let m = 0; m < roadPoints.length; m += 2) {
      const pt = roadPoints[m];
      const dash = new THREE.Mesh(dashGeom, dashMat);
      dash.position.set(pt.x, pt.y + 0.08, pt.z);
      this.roadMarkingGroup.add(dash);
    }
    this.roadGroup.add(this.roadMarkingGroup);

    // Highway Signage Post ("NH-13 TAWANG PASS - ELEV 3,024M")
    const signPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 })
    );
    signPost.position.set(-16.5, this.getTerrainHeight(-16.5, -45) + 1.6, -45);
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.2, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.4 })
    );
    signBoard.position.set(-16.5, this.getTerrainHeight(-16.5, -45) + 2.6, -45);
    this.roadSignPostMesh = signPost;
    this.roadSignBoardMesh = signBoard;
    this.roadGroup.add(signPost, signBoard);

    // Concrete Bridge Piers over gorge
    const bridgePierMat = new THREE.MeshStandardMaterial({
      color: 0xdde2ea,
      roughness: 0.7,
      metalness: 0.15,
    });

    const pier1 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.3, 8.5, 8), bridgePierMat);
    pier1.position.set(14, 4.5, 14);
    const pier2 = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.3, 8.5, 8), bridgePierMat);
    pier2.position.set(19, 4.5, 24);
    pier1.castShadow = true;
    pier2.castShadow = true;
    this.roadGroup.add(pier1, pier2);

    // Guard rails along bridge
    const railGeom = new THREE.BoxGeometry(0.12, 0.75, 16);
    const railL = new THREE.Mesh(railGeom, bridgePierMat);
    railL.position.set(15.2, 9.5, 19);
    const railR = new THREE.Mesh(railGeom, bridgePierMat);
    railR.position.set(18.2, 9.5, 19);
    this.roadGroup.add(railL, railR);

    // Road Blockage Debris Boulder Pile (Revealed when Landslide triggers)
    this.roadBlockageDebris = new THREE.Group();
    const rubbleGeom = new THREE.DodecahedronGeometry(1.3, 1);
    const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x54371f, roughness: 0.95 });

    for (let b = 0; b < 32; b++) {
      const boulder = new THREE.Mesh(rubbleGeom, rubbleMat);
      const angle = (b / 32) * Math.PI * 2;
      boulder.position.set(
        -8.5 + Math.cos(angle) * (2.0 + (b % 4) * 0.7),
        6.8 + (b % 4) * 0.45,
        -0.5 + Math.sin(angle) * 3.2
      );
      const sc = 0.65 + Math.random() * 0.85;
      boulder.scale.set(sc, sc * 1.25, sc);
      boulder.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      boulder.castShadow = true;
      this.roadBlockageDebris.add(boulder);
    }

    // Road barrier warning cones
    const coneGeom = new THREE.ConeGeometry(0.35, 0.9, 6);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    for (let c = -4; c <= 4; c += 2) {
      const cone = new THREE.Mesh(coneGeom, coneMat);
      cone.position.set(-6, 7.2, c);
      this.roadBlockageDebris.add(cone);
    }

    this.roadBlockageDebris.visible = false;
    this.roadGroup.add(this.roadBlockageDebris);

    this.scene.add(this.roadGroup);
  }

  // -------------------------------------------------------------
  // RIVER SYSTEM, GORGE WATER DYNAMICS & FLOOD INUNDATION
  // -------------------------------------------------------------
  private buildRiverSystemAndFloodDynamics(): void {
    const riverPoints: THREE.Vector3[] = [];
    for (let z = -80; z <= 80; z += 4) {
      const x = 16 + Math.sin(z * 0.048) * 8.5;
      const y = 3.6 + Math.cos(z * 0.038) * 0.45;
      riverPoints.push(new THREE.Vector3(x, y, z));
    }

    const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
    const riverGeom = new THREE.TubeGeometry(riverCurve, 100, 3.6, 4, false);
    const pos = riverGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, pos.getY(i) * 0.12);
    }
    riverGeom.computeVertexNormals();

    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Vibrant Azure Blue
      roughness: 0.14,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
    });

    this.riverMesh = new THREE.Mesh(riverGeom, riverMat);
    this.riverMesh.userData = { entityId: 'tawang_river' };
    this.scene.add(this.riverMesh);

    // River Velocity Particle Stream
    const flowCount = 180;
    const flowGeom = new THREE.BufferGeometry();
    const flowPos = new Float32Array(flowCount * 3);
    for (let f = 0; f < flowCount; f++) {
      const z = -75 + (f / flowCount) * 150;
      const x = 16 + Math.sin(z * 0.048) * 8.5 + (Math.random() - 0.5) * 2.5;
      const y = 3.8;
      flowPos[f * 3] = x;
      flowPos[f * 3 + 1] = y;
      flowPos[f * 3 + 2] = z;
    }
    flowGeom.setAttribute('position', new THREE.BufferAttribute(flowPos, 3));
    this.riverWaterParticles = new THREE.Points(
      flowGeom,
      new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.5, transparent: true, opacity: 0.75 })
    );
    this.scene.add(this.riverWaterParticles);

    // Debris Dam in Riverbed (where slide chokes river gorge)
    const damGeom = new THREE.CylinderGeometry(5.0, 7.8, 4.6, 14);
    damGeom.rotateZ(Math.PI / 2);
    const damMat = new THREE.MeshStandardMaterial({
      color: 0x482d18,
      roughness: 0.95,
      metalness: 0.05,
    });
    this.debrisDamMesh = new THREE.Mesh(damGeom, damMat);
    this.debrisDamMesh.position.set(16, 2.6, 4);
    this.debrisDamMesh.scale.set(0.01, 0.01, 0.01);
    this.scene.add(this.debrisDamMesh);

    // Expanding Flood Inundation Plane (Low valley & village flats)
    const floodGeom = new THREE.PlaneGeometry(75, 95, 36, 36);
    floodGeom.rotateX(-Math.PI / 2);
    const floodMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1, // Deep Surging Flood Blue
      roughness: 0.22,
      metalness: 0.75,
      transparent: true,
      opacity: 0.8,
    });
    this.floodMesh = new THREE.Mesh(floodGeom, floodMat);
    this.floodMesh.position.set(24, 1.8, 5);
    this.floodMesh.scale.set(0.18, 1, 0.18);
    this.floodMesh.visible = false;
    this.scene.add(this.floodMesh);

    // Flow vectors: Directional arrows
    this.flowVectorsGroup = new THREE.Group();
    const arrowGeom = new THREE.ConeGeometry(0.55, 1.5, 4);
    arrowGeom.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let k = -60; k <= 60; k += 16) {
      const arrow = new THREE.Mesh(arrowGeom, arrowMat);
      const rx = 16 + Math.sin(k * 0.048) * 8.5;
      arrow.position.set(rx, 4.1, k);
      arrow.rotation.y = Math.atan2(Math.cos(k * 0.048) * 0.45, 1);
      this.flowVectorsGroup.add(arrow);
    }
    this.scene.add(this.flowVectorsGroup);
  }

  // -------------------------------------------------------------
  // VILLAGES, CRITICAL ASSETS (HOSPITAL, SCHOOL, COMMUNITY HAVEN)
  // -------------------------------------------------------------
  private buildVillageAndCriticalInfrastructure(): void {
    this.villageGroup = new THREE.Group();
    this.infrastructureGroup = new THREE.Group();

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const redRoofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
    const blueRoofMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
    const greenRoofMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 });

    // 18 Mountain Dwellings along eastern terrace (x: 23 to 42, z: -28 to 12)
    for (let h = 0; h < 18; h++) {
      const hx = 25 + (h % 4) * 4.2 + Math.sin(h) * 1.6;
      const hz = -24 + Math.floor(h / 4) * 7.8 + Math.cos(h) * 1.6;
      const hy = this.getTerrainHeight(hx, hz);

      const house = new THREE.Group();
      const wall = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.7, 2.1), wallMat);
      wall.position.y = 0.85;
      wall.castShadow = true;
      house.add(wall);

      const roofGeom = new THREE.ConeGeometry(2.1, 1.2, 4);
      roofGeom.rotateY(Math.PI / 4);
      const roof = new THREE.Mesh(roofGeom, h % 3 === 0 ? redRoofMat : h % 3 === 1 ? blueRoofMat : greenRoofMat);
      roof.position.y = 2.2;
      roof.castShadow = true;
      house.add(roof);

      house.position.set(hx, hy, hz);
      house.rotation.y = (h * 0.38) % Math.PI;
      house.userData = { entityId: `house_${h}`, name: `Sector 04 Cottage #${h + 1}` };
      this.villageGroup.add(house);
    }

    // Community Monastery & High Assembly Hall (Designated High Haven)
    const monastery = new THREE.Group();
    const mBase = new THREE.Mesh(new THREE.BoxGeometry(5.8, 3.2, 4.6), wallMat);
    mBase.position.y = 1.6;
    mBase.castShadow = true;
    const mRoof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 2.2, 4), redRoofMat);
    mRoof.rotateY(Math.PI / 4);
    mRoof.position.y = 4.2;
    mRoof.castShadow = true;
    monastery.add(mBase, mRoof);
    monastery.position.set(36, this.getTerrainHeight(36, -8), -8);
    monastery.userData = { entityId: 'monastery_haven', name: 'High Ridge Monastery Assembly Haven' };
    this.villageGroup.add(monastery);

    // Primary Health Center / Hospital
    const clinic = new THREE.Group();
    const cBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 3.2), wallMat);
    cBase.position.y = 1.1;
    const cRoof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 3.6), blueRoofMat);
    cRoof.position.y = 2.3;
    // Red Cross Emblem
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.05), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    crossH.position.set(0, 1.2, 1.65);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.05), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    crossV.position.set(0, 1.2, 1.65);
    clinic.add(cBase, cRoof, crossH, crossV);
    clinic.position.set(29, this.getTerrainHeight(29, -15), -15);
    clinic.userData = { entityId: 'district_health_center', name: 'Tawang Sub-District Health Center' };
    this.infrastructureGroup.add(clinic);

    // District School (Evacuation shelter)
    const school = new THREE.Group();
    const sBase = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.4, 3.4), wallMat);
    sBase.position.y = 1.2;
    const sRoof = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.6, 4), greenRoofMat);
    sRoof.rotateY(Math.PI / 4);
    sRoof.position.y = 3.1;
    school.add(sBase, sRoof);
    school.position.set(32, this.getTerrainHeight(32, 2), 2);
    school.userData = { entityId: 'govt_high_school', name: 'Government Secondary School Tawang' };
    this.infrastructureGroup.add(school);

    this.scene.add(this.villageGroup);
    this.scene.add(this.infrastructureGroup);
  }

  // -------------------------------------------------------------
  // POWER GRID, TRANSMISSION PYLONS & TELECOM MAST
  // -------------------------------------------------------------
  private buildPowerGridAndLifelines(): void {
    this.powerLinesGroup = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    // 4 Transmission Pylons across mountain pass
    const pylonGeom = new THREE.CylinderGeometry(0.2, 0.7, 10, 4);
    const pylonCoords = [
      { x: -24, z: -35 },
      { x: -10, z: -15 },
      { x: 8, z: 8 },
      { x: 26, z: 28 },
    ];

    pylonCoords.forEach((pt, idx) => {
      const y = this.getTerrainHeight(pt.x, pt.z);
      const pylon = new THREE.Mesh(pylonGeom, metalMat);
      pylon.position.set(pt.x, y + 5, pt.z);
      pylon.castShadow = true;
      this.powerLinesGroup.add(pylon);
    });

    // Wire connection line
    const wirePoints = pylonCoords.map((pt) => new THREE.Vector3(pt.x, this.getTerrainHeight(pt.x, pt.z) + 9.8, pt.z));
    const wireGeom = new THREE.BufferGeometry().setFromPoints(wirePoints);
    const wireLine = new THREE.Line(wireGeom, new THREE.LineBasicMaterial({ color: 0x64748b, linewidth: 2 }));
    this.powerLinesGroup.add(wireLine);

    // LoRa / Telemetry Mast on high ridge with blinking red beacon
    this.telemetryTowerGroup = new THREE.Group();
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.28, 12, 6), metalMat);
    mast.position.y = 6;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    beacon.position.y = 12.1;
    this.telemetryTowerGroup.add(mast, beacon);
    this.telemetryTowerGroup.position.set(-28, this.getTerrainHeight(-28, -25), -25);
    this.telemetryTowerGroup.userData = { entityId: 'iot_gateway_tower', name: 'IoT Early Warning Gateway Mast' };
    this.scene.add(this.telemetryTowerGroup);

    this.scene.add(this.powerLinesGroup);
  }

  // -------------------------------------------------------------
  // VOLUMETRIC RAINFALL, WEATHER CLOUDS & LIGHTNING
  // -------------------------------------------------------------
  private buildVolumetricRainAndWeather(): void {
    const rainCount = 5500;
    const geometry = new THREE.BufferGeometry();
    this.rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount; i++) {
      this.rainPositions[i * 3] = (Math.random() - 0.5) * 160;
      this.rainPositions[i * 3 + 1] = Math.random() * 85 + 4;
      this.rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 160;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(this.rainPositions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xa5b4fc,
      size: 0.45,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.scene.add(this.rainParticles);
  }

  // -------------------------------------------------------------
  // LANDSLIDE KINEMATICS, TENSION CRACKS & MULTI-LAYER DEBRIS
  // -------------------------------------------------------------
  private buildLandslideKinematicsAndDebrisLayers(): void {
    // 1. Tension Cracks Mesh (Crown rupture fracture line)
    const crackPoints: THREE.Vector3[] = [
      new THREE.Vector3(-25, 31.0, -10),
      new THREE.Vector3(-22, 30.2, -5),
      new THREE.Vector3(-19, 29.5, 0),
      new THREE.Vector3(-18, 28.9, 6),
      new THREE.Vector3(-21, 29.3, 11),
      new THREE.Vector3(-24, 30.0, 15),
    ];

    const crackGeom = new THREE.BufferGeometry().setFromPoints(crackPoints);
    const crackMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      linewidth: 3,
    });
    this.tensionCracksMesh = new THREE.LineSegments(crackGeom, crackMat);
    this.scene.add(this.tensionCracksMesh);

    // 2. Sliding Colluvial Wedge Mass
    this.slideWedgeGroup = new THREE.Group();
    const wedgeGeom = new THREE.ConeGeometry(5.8, 10.2, 7);
    wedgeGeom.rotateX(Math.PI / 2.7);
    const wedgeMat = new THREE.MeshStandardMaterial({
      color: 0x6e4526,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true,
    });
    const wedgeMesh = new THREE.Mesh(wedgeGeom, wedgeMat);
    wedgeMesh.castShadow = true;
    this.slideWedgeGroup.add(wedgeMesh);
    this.slideWedgeGroup.position.set(-20, 27.5, 2);
    this.scene.add(this.slideWedgeGroup);

    // 3. Dynamic Debris Flow Particles (Layer 1: Heavy Rocks & Boulders)
    const rockCount = 1200;
    const rockGeom = new THREE.BufferGeometry();
    this.debrisPositions = new Float32Array(rockCount * 3);
    this.debrisVelocities = new Float32Array(rockCount * 3);

    for (let d = 0; d < rockCount; d++) {
      this.debrisPositions[d * 3] = -20 + (Math.random() - 0.5) * 6;
      this.debrisPositions[d * 3 + 1] = 27.5 + (Math.random() - 0.5) * 4;
      this.debrisPositions[d * 3 + 2] = 2 + (Math.random() - 0.5) * 12;

      this.debrisVelocities[d * 3] = 0.55 + Math.random() * 0.7;
      this.debrisVelocities[d * 3 + 1] = -(0.75 + Math.random() * 0.65);
      this.debrisVelocities[d * 3 + 2] = (Math.random() - 0.5) * 0.45;
    }

    rockGeom.setAttribute('position', new THREE.BufferAttribute(this.debrisPositions, 3));
    this.debrisRockParticles = new THREE.Points(
      rockGeom,
      new THREE.PointsMaterial({ color: 0x78350f, size: 0.85, transparent: true, opacity: 0 })
    );
    this.scene.add(this.debrisRockParticles);

    // 4. Dynamic Debris Flow Particles (Layer 2: Saturated Mud & Silt)
    const mudCount = 800;
    const mudGeom = new THREE.BufferGeometry();
    const mudPos = new Float32Array(mudCount * 3);
    for (let m = 0; m < mudCount; m++) {
      mudPos[m * 3] = -18 + (Math.random() - 0.5) * 7;
      mudPos[m * 3 + 1] = 26 + (Math.random() - 0.5) * 4;
      mudPos[m * 3 + 2] = 2 + (Math.random() - 0.5) * 12;
    }
    mudGeom.setAttribute('position', new THREE.BufferAttribute(mudPos, 3));
    this.debrisMudParticles = new THREE.Points(
      mudGeom,
      new THREE.PointsMaterial({ color: 0x451a03, size: 1.2, transparent: true, opacity: 0 })
    );
    this.scene.add(this.debrisMudParticles);
  }

  // -------------------------------------------------------------
  // SAFE EVACUATION ROUTES & IMPACT BOUNDARIES
  // -------------------------------------------------------------
  private buildSafeEvacuationRoutes(): void {
    this.evacuationRouteGroup = new THREE.Group();

    // Route A (High Ridge Escape -> Green)
    const routePoints = [
      new THREE.Vector3(26, this.getTerrainHeight(26, -18) + 0.4, -18),
      new THREE.Vector3(30, this.getTerrainHeight(30, -14) + 0.4, -14),
      new THREE.Vector3(34, this.getTerrainHeight(34, -10) + 0.4, -10),
      new THREE.Vector3(36, this.getTerrainHeight(36, -8) + 0.5, -8),
    ];
    const rGeom = new THREE.BufferGeometry().setFromPoints(routePoints);
    const rLine = new THREE.Line(
      rGeom,
      new THREE.LineBasicMaterial({ color: 0x10b981, linewidth: 4 })
    );
    this.evacuationRouteGroup.add(rLine);

    this.scene.add(this.evacuationRouteGroup);
  }

  // -------------------------------------------------------------
  // 3D RISK VOLUMES & AI OVERLAYS
  // -------------------------------------------------------------
  private build3DRiskVolumesAndOverlays(): void {
    // Transparent 3D risk volume enclosing the unstable slope
    const boxGeom = new THREE.BoxGeometry(22, 16, 26);
    const boxMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0,
      wireframe: true,
    });
    this.riskVolumeMesh = new THREE.Mesh(boxGeom, boxMat);
    this.riskVolumeMesh.position.set(-14, 18, 1);
    this.scene.add(this.riskVolumeMesh);

    // Impact zone boundary ring around village
    const perimeterGeom = new THREE.RingGeometry(15, 17, 36);
    perimeterGeom.rotateX(-Math.PI / 2);
    const perimeterMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    this.impactZonePerimeter = new THREE.Mesh(perimeterGeom, perimeterMat);
    this.impactZonePerimeter.position.set(30, 6.5, -6);
    this.scene.add(this.impactZonePerimeter);
  }

  // -------------------------------------------------------------
  // BHUSAKTHI AI CONFORMAL TERRAIN RISK OVERLAYS (LANDSLIDE & FLOOD)
  // Conforms accurately to terrain elevations, slope angles & river hydrology
  // LOW -> Green, MODERATE -> Yellow, HIGH -> Orange, VERY HIGH -> Red
  // -------------------------------------------------------------
  private buildConformalRiskLayers(): void {
    const size = 220;
    const segments = 160;

    // 1. LANDSLIDE SUSCEPTIBILITY OVERLAY (Follows mountain slope gradient & shear zones)
    const lsGeom = new THREE.PlaneGeometry(size, size, segments, segments);
    lsGeom.rotateX(-Math.PI / 2);
    const lsPos = lsGeom.attributes.position;
    const lsCount = lsPos.count;
    const lsColors = new Float32Array(lsCount * 3);
    const lsAlpha = new Float32Array(lsCount);
    const col = new THREE.Color();

    for (let i = 0; i < lsCount; i++) {
      const x = lsPos.getX(i);
      const z = lsPos.getZ(i);
      const y = this.getTerrainHeight(x, z);
      lsPos.setY(i, y + 0.12);

      const slope = this.getSlopeAngle(x, z);
      const inColluvialGully = x > -28 && x < -2 && z > -22 && z < 22;

      // Classification based on slope & shear geometry:
      if (inColluvialGully && slope > 28) {
        // High-shear colluvial gully fracture: VERY HIGH (Red)
        col.setRGB(0.94, 0.27, 0.27);
        lsAlpha[i] = 0.88;
      } else if (slope >= 42) {
        // Sheer mountain crests & escarpments: VERY HIGH (Red)
        col.setRGB(0.94, 0.27, 0.27);
        lsAlpha[i] = 0.88;
      } else if (slope >= 32) {
        // High steepness talus slopes: HIGH (Orange)
        col.setRGB(0.98, 0.45, 0.09);
        lsAlpha[i] = 0.82;
      } else if (slope >= 22) {
        // Moderate slope gradients: MODERATE (Yellow)
        col.setRGB(0.92, 0.70, 0.03);
        lsAlpha[i] = 0.72;
      } else if (slope >= 14 && y > 6.0) {
        // Low slope transition: LOW (Green)
        col.setRGB(0.13, 0.77, 0.37);
        lsAlpha[i] = 0.58;
      } else {
        // Flat alluvial plains & river valley floor: unpainted
        col.setRGB(0.13, 0.77, 0.37);
        lsAlpha[i] = 0.0;
      }

      lsColors[i * 3] = col.r;
      lsColors[i * 3 + 1] = col.g;
      lsColors[i * 3 + 2] = col.b;
    }

    lsGeom.setAttribute('color', new THREE.BufferAttribute(lsColors, 3));
    lsGeom.setAttribute('aAlpha', new THREE.BufferAttribute(lsAlpha, 1));
    lsGeom.computeVertexNormals();

    const lsMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.75 },
      },
      vertexShader: `
        attribute float aAlpha;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = color;
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          if (vAlpha <= 0.01) discard;
          gl_FragColor = vec4(vColor, vAlpha * uOpacity);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    this.landslideRiskMesh = new THREE.Mesh(lsGeom, lsMaterial);
    this.landslideRiskMesh.visible = false; // Default OFF
    this.landslideRiskMesh.userData = { entityId: 'landslide_risk_layer', name: 'Landslide Susceptibility Layer' };
    this.scene.add(this.landslideRiskMesh);

    // 2. FLOOD SUSCEPTIBILITY OVERLAY (Follows low-lying areas, river gorge & floodplains)
    const flGeom = new THREE.PlaneGeometry(size, size, segments, segments);
    flGeom.rotateX(-Math.PI / 2);
    const flPos = flGeom.attributes.position;
    const flCount = flPos.count;
    const flColors = new Float32Array(flCount * 3);
    const flAlpha = new Float32Array(flCount);

    for (let i = 0; i < flCount; i++) {
      const x = flPos.getX(i);
      const z = flPos.getZ(i);
      const y = this.getTerrainHeight(x, z);
      flPos.setY(i, y + 0.12);

      const riverCenter = 16 + Math.sin(z * 0.048) * 8.5 + Math.cos(z * 0.09) * 2.2;
      const distToRiver = Math.abs(x - riverCenter);
      const slope = this.getSlopeAngle(x, z);

      // Hydrological classification:
      if (distToRiver < 5.0 || y < 4.2) {
        // Active River Channel / Floodway: VERY HIGH (Red)
        col.setRGB(0.94, 0.27, 0.27);
        flAlpha[i] = 0.88;
      } else if (distToRiver < 10.5 && y < 7.2) {
        // Immediate Inundation Plain: HIGH (Orange)
        col.setRGB(0.98, 0.45, 0.09);
        flAlpha[i] = 0.82;
      } else if (distToRiver < 18.0 && y < 10.5 && slope < 22) {
        // Secondary Flood Terrace: MODERATE (Yellow)
        col.setRGB(0.92, 0.70, 0.03);
        flAlpha[i] = 0.72;
      } else if (distToRiver < 28.0 && y < 14.0 && slope < 16) {
        // Peripheral Basin Flats: LOW (Green)
        col.setRGB(0.13, 0.77, 0.37);
        flAlpha[i] = 0.58;
      } else {
        // Mountain slopes / high ridges: unpainted
        col.setRGB(0.13, 0.77, 0.37);
        flAlpha[i] = 0.0;
      }

      flColors[i * 3] = col.r;
      flColors[i * 3 + 1] = col.g;
      flColors[i * 3 + 2] = col.b;
    }

    flGeom.setAttribute('color', new THREE.BufferAttribute(flColors, 3));
    flGeom.setAttribute('aAlpha', new THREE.BufferAttribute(flAlpha, 1));
    flGeom.computeVertexNormals();

    const flMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uOpacity: { value: 0.75 },
      },
      vertexShader: `
        attribute float aAlpha;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = color;
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          if (vAlpha <= 0.01) discard;
          gl_FragColor = vec4(vColor, vAlpha * uOpacity);
        }
      `,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });

    this.floodRiskMesh = new THREE.Mesh(flGeom, flMaterial);
    this.floodRiskMesh.visible = false; // Default OFF
    this.floodRiskMesh.userData = { entityId: 'flood_risk_layer', name: 'Flood Susceptibility Layer' };
    this.scene.add(this.floodRiskMesh);
  }

  // -------------------------------------------------------------
  // 3D IOT SENSORS & TELEMETRY BEACONS
  // -------------------------------------------------------------
  private buildTelemetrySensorsAndBoreholes(): void {
    this.sensorGroup = new THREE.Group();

    // 1. Inclinometer Station INCL-01 (Shear creep on slope)
    const tiltGroup = new THREE.Group();
    const tiltPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
    );
    tiltPole.position.y = 1.6;
    tiltPole.castShadow = true;

    const tiltBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
    );
    tiltBox.position.set(0, 2.7, 0);

    const tiltSolar = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.05, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 })
    );
    tiltSolar.position.set(0, 3.1, 0.2);
    tiltSolar.rotation.x = 0.4;
    tiltGroup.add(tiltPole, tiltBox, tiltSolar);

    // Pulsing ground ripple ring
    const rippleGeom = new THREE.RingGeometry(0.8, 1.4, 24);
    rippleGeom.rotateX(-Math.PI / 2);
    this.tiltmeterRipples = new THREE.Mesh(
      rippleGeom,
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    this.tiltmeterRipples.position.y = 0.1;
    tiltGroup.add(this.tiltmeterRipples);

    const tx = -17;
    const tz = 5;
    const ty = this.getTerrainHeight(tx, tz);
    tiltGroup.position.set(tx, ty, tz);
    tiltGroup.userData = { entityId: 'sensor_tiltmeter' };
    this.sensorGroup.add(tiltGroup);

    // 2. Piezometer Borehole PIEZ-04 (Pore-water pressure sensor)
    const piezGroup = new THREE.Group();
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 })
    );
    collar.position.y = 0.3;

    const pLogBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.8, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 })
    );
    pLogBox.position.set(0, 0.9, 0);

    const pAntenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.6, 6),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8 })
    );
    pAntenna.position.set(0.2, 1.6, 0);
    piezGroup.add(collar, pLogBox, pAntenna);

    // Hydrostatic vertical pulse cylinder
    const waveGeom = new THREE.CylinderGeometry(0.8, 0.8, 3.2, 16, 1, true);
    this.piezometerWave = new THREE.Mesh(
      waveGeom,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    this.piezometerWave.position.y = 1.6;
    piezGroup.add(this.piezometerWave);

    const px = -13;
    const pz = -3;
    const py = this.getTerrainHeight(px, pz);
    piezGroup.position.set(px, py, pz);
    piezGroup.userData = { entityId: 'sensor_piezometer' };
    this.sensorGroup.add(piezGroup);

    // 3. AWS-02 Weather Station & Rain Gauge
    const awsGroup = new THREE.Group();
    const awsMast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.25, 6.5, 6),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
    );
    awsMast.position.y = 3.25;

    const funnel = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 })
    );
    funnel.position.set(-0.5, 4.5, 0);

    this.anemometerRotor = new THREE.Group();
    for (let c = 0; c < 3; c++) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4),
        new THREE.MeshBasicMaterial({ color: 0x1e293b })
      );
      arm.rotateZ(Math.PI / 2);
      arm.position.x = 0.25;
      const cup = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xef4444 })
      );
      cup.position.x = 0.5;
      const cupSub = new THREE.Group();
      cupSub.add(arm, cup);
      cupSub.rotation.y = (c * Math.PI * 2) / 3;
      this.anemometerRotor.add(cupSub);
    }
    this.anemometerRotor.position.set(0, 6.6, 0);

    awsGroup.add(awsMast, funnel, this.anemometerRotor);
    const ax = -25;
    const az = -20;
    const ay = this.getTerrainHeight(ax, az);
    awsGroup.position.set(ax, ay, az);
    awsGroup.userData = { entityId: 'sensor_aws' };
    this.sensorGroup.add(awsGroup);

    // 4. Ultrasonic River Radar Gauge RAD-03 (on Bridge Pier)
    const radarGroup = new THREE.Group();
    const radarHorn = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 0.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 })
    );
    radarHorn.rotateX(Math.PI);
    radarHorn.position.y = -0.3;

    const radarRingsGeom = new THREE.RingGeometry(0.6, 1.2, 16);
    radarRingsGeom.rotateX(Math.PI / 2);
    this.radarWaves = new THREE.Mesh(
      radarRingsGeom,
      new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
    );
    this.radarWaves.position.y = -2.5;

    radarGroup.add(radarHorn, this.radarWaves);
    radarGroup.position.set(16.5, 9.0, 19);
    radarGroup.userData = { entityId: 'sensor_river_radar' };
    this.sensorGroup.add(radarGroup);

    this.scene.add(this.sensorGroup);
  }

  // -------------------------------------------------------------
  // DYNAMIC 3D WARNING SIGNS & HOLOGRAPHIC BILLBOARDS
  // -------------------------------------------------------------
  private buildDynamicWarningSigns(): void {
    this.warningSignGroup = new THREE.Group();

    // 1. "SLOPE INSTABILITY" 3D Sign above active tension crack
    this.slopeWarningMesh = new THREE.Group();
    const diamondGeom = new THREE.BoxGeometry(3.6, 3.6, 0.2);
    diamondGeom.rotateZ(Math.PI / 4);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
      emissive: 0x78350f,
      emissiveIntensity: 0.35,
    });
    const diamondMesh = new THREE.Mesh(diamondGeom, diamondMat);

    const borderGeom = new THREE.BoxGeometry(4.0, 4.0, 0.15);
    borderGeom.rotateZ(Math.PI / 4);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const borderMesh = new THREE.Mesh(borderGeom, borderMat);
    borderMesh.position.z = -0.05;

    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 1.6, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    bar.position.y = 0.25;

    const dot = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.3),
      new THREE.MeshBasicMaterial({ color: 0x0f172a })
    );
    dot.position.y = -0.9;

    this.slopeWarningMesh.add(borderMesh, diamondMesh, bar, dot);
    this.slopeWarningMesh.position.set(-20, 36, 2);
    this.slopeWarningMesh.userData = { entityId: 'warning_slope_instability' };
    this.slopeWarningMesh.visible = false;
    this.warningSignGroup.add(this.slopeWarningMesh);

    // 2. "ROAD BLOCKED" 3D Emergency Sign above NH-13 debris
    this.roadBlockedSignMesh = new THREE.Group();
    const octGeom = new THREE.CylinderGeometry(2.0, 2.0, 0.2, 8);
    octGeom.rotateX(Math.PI / 2);
    const octMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      emissive: 0x991b1b,
      emissiveIntensity: 0.4,
    });
    const octMesh = new THREE.Mesh(octGeom, octMat);

    const whiteBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.55, 0.25),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.roadBlockedSignMesh.add(octMesh, whiteBar);
    this.roadBlockedSignMesh.position.set(-8, 11, 0);
    this.roadBlockedSignMesh.userData = { entityId: 'warning_road_blocked' };
    this.roadBlockedSignMesh.visible = false;
    this.warningSignGroup.add(this.roadBlockedSignMesh);

    this.scene.add(this.warningSignGroup);
  }

  // -------------------------------------------------------------
  // VOLUMETRIC MOUNTAIN CLOUDS
  // -------------------------------------------------------------
  private buildVolumetricClouds(): void {
    this.cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xdce7f5,
      roughness: 0.95,
      metalness: 0.05,
      transparent: true,
      opacity: 0.72,
    });

    const cloudCoords = [
      { x: -35, y: 46, z: -30, sc: 1.2 },
      { x: -28, y: 50, z: -10, sc: 1.5 },
      { x: -32, y: 48, z: 18, sc: 1.3 },
      { x: -20, y: 52, z: 42, sc: 1.4 },
      { x: -40, y: 45, z: 0, sc: 1.6 },
    ];

    cloudCoords.forEach((c) => {
      const cluster = new THREE.Group();
      for (let p = 0; p < 6; p++) {
        const puff = new THREE.Mesh(
          new THREE.DodecahedronGeometry(3.5 + Math.random() * 2.2, 1),
          cloudMat
        );
        puff.position.set(
          (Math.random() - 0.5) * 8 * c.sc,
          (Math.random() - 0.5) * 3 * c.sc,
          (Math.random() - 0.5) * 8 * c.sc
        );
        cluster.add(puff);
      }
      cluster.position.set(c.x, c.y, c.z);
      this.cloudsGroup.add(cluster);
    });

    this.scene.add(this.cloudsGroup);
  }

  // -------------------------------------------------------------
  // SIMULATION STATE & KINEMATICS UPDATER
  // -------------------------------------------------------------
  public setSimulationProgress(progress: number, state: ScenarioState): void {
    this.currentProgress = Math.max(0, Math.min(1, progress));
    this.currentScenarioState = state;

    // 1. Weather Intensity
    let targetRain: RainIntensity = 'OFF';
    if (this.currentProgress > 0.08 && this.currentProgress <= 0.22) targetRain = 'LIGHT';
    else if (this.currentProgress > 0.22 && this.currentProgress <= 0.42) targetRain = 'MODERATE';
    else if (this.currentProgress > 0.42 && this.currentProgress <= 0.75) targetRain = 'HEAVY';
    else if (this.currentProgress > 0.75) targetRain = 'EXTREME';
    this.setWeatherIntensity(targetRain);

    // 2. Tension Cracks Color & Expansion
    if (this.tensionCracksMesh) {
      const crackMat = this.tensionCracksMesh.material as THREE.LineBasicMaterial;
      if (this.currentProgress < 0.2) crackMat.color.setHex(0x10b981);
      else if (this.currentProgress < 0.35) crackMat.color.setHex(0xfacc15);
      else if (this.currentProgress < 0.45) crackMat.color.setHex(0xf97316);
      else crackMat.color.setHex(0xef4444);

      this.tensionCracksMesh.visible = this.currentProgress >= 0.15 && this.layerVisibility.landslide;
    }

    // 3. Sliding Wedge Movement (Detachment & Downhill Acceleration)
    if (this.slideWedgeGroup) {
      if (this.currentProgress < 0.4) {
        this.slideWedgeGroup.position.set(-20, 27.5, 2);
        this.slideWedgeGroup.rotation.set(0, 0, 0);
      } else {
        const slideT = Math.min(1, (this.currentProgress - 0.4) / 0.24);
        this.slideWedgeGroup.position.x = -20 + slideT * 11.5;
        this.slideWedgeGroup.position.y = 27.5 - slideT * 19.5;
        this.slideWedgeGroup.position.z = 2 + slideT * 1.6;
        this.slideWedgeGroup.rotation.z = slideT * 0.42;
      }
    }

    // 4. Debris Flow Particles
    const isDebrisActive = this.currentProgress >= 0.42 && this.currentProgress < 0.95 && this.layerVisibility.landslide;
    if (this.debrisRockParticles) {
      (this.debrisRockParticles.material as THREE.PointsMaterial).opacity = isDebrisActive ? 0.9 : 0;
    }
    if (this.debrisMudParticles) {
      (this.debrisMudParticles.material as THREE.PointsMaterial).opacity = isDebrisActive ? 0.8 : 0;
    }

    // 5. Road Blockage (NH-13 Severed)
    if (this.roadBlockageDebris) {
      this.roadBlockageDebris.visible = this.currentProgress >= 0.52 && this.layerVisibility.roads;
    }

    // 6. River Damming & Blockage
    if (this.debrisDamMesh) {
      if (this.currentProgress >= 0.58) {
        const damScale = Math.min(1, (this.currentProgress - 0.58) / 0.18);
        this.debrisDamMesh.scale.set(damScale, damScale, damScale);
      } else {
        this.debrisDamMesh.scale.set(0.01, 0.01, 0.01);
      }
    }

    // 7. Flood Inundation & Rising River
    if (this.floodMesh) {
      if (this.currentProgress >= 0.65 && this.layerVisibility.flood) {
        this.floodMesh.visible = true;
        const floodT = Math.min(1, (this.currentProgress - 0.65) / 0.35);
        this.floodMesh.position.y = 3.6 + floodT * 3.0; // Water level rise
        const hScale = 0.25 + floodT * 0.85;
        this.floodMesh.scale.set(hScale, 1, hScale);
      } else {
        this.floodMesh.visible = false;
      }
    }

    // 8. 3D Risk Volume & Village Impact Perimeter
    if (this.riskVolumeMesh) {
      const volMat = this.riskVolumeMesh.material as THREE.MeshBasicMaterial;
      volMat.opacity = this.currentProgress >= 0.28 ? 0.25 + (this.currentProgress - 0.28) * 0.3 : 0;
    }

    if (this.impactZonePerimeter) {
      const perimMat = this.impactZonePerimeter.material as THREE.MeshBasicMaterial;
      perimMat.opacity = this.currentProgress >= 0.72 && this.layerVisibility.impactZone ? 0.55 : 0;
    }

    // 9. 3D Dynamic Warning Signs & Holograms
    if (this.slopeWarningMesh) {
      this.slopeWarningMesh.visible = this.currentProgress >= 0.22 && this.layerVisibility.landslide && (this.layerVisibility.warningSigns !== false);
    }
    if (this.roadBlockedSignMesh) {
      this.roadBlockedSignMesh.visible = this.currentProgress >= 0.52 && this.layerVisibility.roads && (this.layerVisibility.warningSigns !== false);
    }

    // 10. Camera Track in Cinematic Mode
    if (this.isCinematicTour) {
      this.updateCinematicTour(this.currentProgress);
    }
  }

  public setWeatherIntensity(intensity: RainIntensity): void {
    this.currentRainIntensity = intensity;
    if (!this.rainParticles) return;

    const rainMat = this.rainParticles.material as THREE.PointsMaterial;
    const expFog = this.scene.fog instanceof THREE.FogExp2 ? this.scene.fog : null;

    switch (intensity) {
      case 'OFF':
        rainMat.opacity = 0;
        if (expFog) expFog.density = 0.003;
        this.dirLight.intensity = 1.8;
        break;
      case 'LIGHT':
        rainMat.opacity = 0.35;
        if (expFog) expFog.density = 0.005;
        this.dirLight.intensity = 1.5;
        break;
      case 'MODERATE':
        rainMat.opacity = 0.6;
        if (expFog) expFog.density = 0.008;
        this.dirLight.intensity = 1.2;
        break;
      case 'HEAVY':
        rainMat.opacity = 0.85;
        if (expFog) expFog.density = 0.013;
        this.dirLight.intensity = 0.8;
        break;
      case 'EXTREME':
        rainMat.opacity = 1.0;
        if (expFog) expFog.density = 0.018;
        this.dirLight.intensity = 0.55;
        break;
    }
  }

  public setVisualMode(mode: VisualMode): void {
    this.currentVisualMode = mode;
    if (!this.terrainMesh) return;

    const tMat = this.terrainMesh.material as THREE.MeshStandardMaterial;

    switch (mode) {
      case 'DISASTER':
      case 'REALISTIC':
        tMat.wireframe = false;
        tMat.roughness = 0.85;
        tMat.metalness = 0.1;
        break;
      case 'SATELLITE':
        tMat.wireframe = false;
        tMat.roughness = 0.7;
        tMat.metalness = 0.2;
        break;
      case 'HEATMAP':
        tMat.wireframe = false;
        // Turn on risk overlays
        break;
      case 'ELEVATION':
        if (this.contourMesh) this.contourMesh.visible = true;
        break;
    }
  }

  public setLayerVisibility(layers: LayerVisibility): void {
    this.layerVisibility = { ...layers };
    if (this.terrainMesh) this.terrainMesh.visible = layers.terrain;
    if (this.contourMesh) this.contourMesh.visible = layers.contours;
    if (this.forestMesh) this.forestMesh.visible = layers.forest;
    if (this.roadGroup) this.roadGroup.visible = layers.roads;
    if (this.riverMesh) this.riverMesh.visible = layers.rivers;
    if (this.villageGroup) this.villageGroup.visible = layers.villages;
    if (this.infrastructureGroup) this.infrastructureGroup.visible = layers.villages;
    if (this.powerLinesGroup) this.powerLinesGroup.visible = layers.powerLines;
    if (this.rainParticles) (this.rainParticles.material as THREE.PointsMaterial).visible = layers.rain;
    if (this.tensionCracksMesh) this.tensionCracksMesh.visible = layers.landslide && this.currentProgress >= 0.15;
    if (this.slideWedgeGroup) this.slideWedgeGroup.visible = layers.landslide;
    if (this.floodMesh) this.floodMesh.visible = layers.flood && this.currentProgress >= 0.65;
    if (this.impactZonePerimeter) this.impactZonePerimeter.visible = layers.impactZone && this.currentProgress >= 0.72;
    if (this.evacuationRouteGroup) this.evacuationRouteGroup.visible = !!layers.safetyRoutes;
    if (this.sensorGroup) this.sensorGroup.visible = layers.sensors !== false;
    if (this.warningSignGroup) this.warningSignGroup.visible = layers.warningSigns !== false;
    if (this.contourMesh) this.contourMesh.visible = !!layers.contours;
    if (this.landslideRiskMesh) this.landslideRiskMesh.visible = !!layers.landslideRisk;
    if (this.floodRiskMesh) this.floodRiskMesh.visible = !!layers.floodRisk;
  }

  // -------------------------------------------------------------
  // CAMERA SYSTEM & 90-SECOND CINEMATIC DISASTER STORY
  // -------------------------------------------------------------
  public setCameraView(view: CameraViewName): void {
    this.isCinematicTour = false;
    const preset = CAMERA_PRESETS[view] || CAMERA_PRESETS.REGIONAL;
    this.animateCameraTo(preset.pos, preset.target);
  }

  public toggleCinematicTour(enable?: boolean): boolean {
    this.isCinematicTour = enable !== undefined ? enable : !this.isCinematicTour;
    return this.isCinematicTour;
  }

  public getIsCinematicTour(): boolean {
    return this.isCinematicTour;
  }

  private animateCameraTo(targetPos: THREE.Vector3, targetTarget: THREE.Vector3): void {
    this.targetCameraPos = targetPos.clone();
    this.targetCameraTarget = targetTarget.clone();
    this.cameraTransitionAlpha = 0;
    this.isCameraTransitioning = true;
  }

  private updateCinematicTour(progress: number): void {
    let targetPos: THREE.Vector3;
    let targetLook: THREE.Vector3;

    if (progress < 0.18) {
      targetPos = CAMERA_PRESETS.MOUNTAIN.pos;
      targetLook = CAMERA_PRESETS.MOUNTAIN.target;
    } else if (progress < 0.38) {
      targetPos = CAMERA_PRESETS.SLOPE.pos;
      targetLook = CAMERA_PRESETS.SLOPE.target;
    } else if (progress < 0.55) {
      targetPos = CAMERA_PRESETS.LANDSLIDE.pos;
      targetLook = CAMERA_PRESETS.LANDSLIDE.target;
    } else if (progress < 0.68) {
      targetPos = CAMERA_PRESETS.ROAD.pos;
      targetLook = CAMERA_PRESETS.ROAD.target;
    } else if (progress < 0.8) {
      targetPos = CAMERA_PRESETS.RIVER.pos;
      targetLook = CAMERA_PRESETS.RIVER.target;
    } else if (progress < 0.9) {
      targetPos = CAMERA_PRESETS.FLOOD.pos;
      targetLook = CAMERA_PRESETS.FLOOD.target;
    } else {
      targetPos = CAMERA_PRESETS.VILLAGE.pos;
      targetLook = CAMERA_PRESETS.VILLAGE.target;
    }

    this.camera.position.lerp(targetPos, 0.04);
    this.cameraTarget.lerp(targetLook, 0.04);
    this.camera.lookAt(this.cameraTarget);
  }

  public zoomIn(): void {
    this.isCinematicTour = false;
    this.cameraDistance = Math.max(28, this.cameraDistance * 0.82);
    this.updateCameraOrbit();
  }

  public zoomOut(): void {
    this.isCinematicTour = false;
    this.cameraDistance = Math.min(260, this.cameraDistance * 1.22);
    this.updateCameraOrbit();
  }

  public resetCamera(): void {
    this.isCinematicTour = false;
    this.animateCameraTo(CAMERA_PRESETS.OVERVIEW.pos, CAMERA_PRESETS.OVERVIEW.target);
  }

  public tiltCamera(mode?: 'topo' | 'oblique' | 'profile'): void {
    this.isCinematicTour = false;
    if (mode === 'topo') {
      this.animateCameraTo(new THREE.Vector3(0, 135, 0.01), new THREE.Vector3(0, 0, 0));
    } else if (mode === 'profile') {
      this.animateCameraTo(new THREE.Vector3(95, 22, 95), new THREE.Vector3(0, 10, 0));
    } else {
      this.animateCameraTo(CAMERA_PRESETS.OVERVIEW.pos, CAMERA_PRESETS.OVERVIEW.target);
    }
  }

  // -------------------------------------------------------------
  // LOCATION-SPECIFIC RIVER COURSE & HYDROLOGY
  // -------------------------------------------------------------
  private getRiverPointsForLocation(loc: LocationGeographicProfile): THREE.Vector3[] {
    const ds = getLocationFeatureDataset(loc.id);
    const coords = ds.riverCoords;
    const curvePoints = coords.map((c) => {
      const rx = c[0];
      const rz = c[1];
      const ry = loc.category === 'FLOODPLAIN_ISLAND' ? 2.15 : 3.25;
      return new THREE.Vector3(rx, ry, rz);
    });

    const catmull = new THREE.CatmullRomCurve3(curvePoints);
    const numSamples = 40;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      const pt = catmull.getPoint(t);
      points.push(new THREE.Vector3(pt.x, loc.category === 'FLOODPLAIN_ISLAND' ? 2.15 : 3.25, pt.z));
    }
    return points;
  }

  // -------------------------------------------------------------
  // LOCATION-SPECIFIC ROAD ALIGNMENT & TOPOGRAPHY
  // -------------------------------------------------------------
  private getRoadPointsForLocation(loc: LocationGeographicProfile): THREE.Vector3[] {
    const ds = getLocationFeatureDataset(loc.id);
    const coords = ds.roadCoords;
    const curvePoints = coords.map((c) => {
      const rx = c[0];
      const rz = c[1];
      const ry = this.getTerrainHeight(rx, rz) + 0.35;
      return new THREE.Vector3(rx, ry, rz);
    });

    const catmull = new THREE.CatmullRomCurve3(curvePoints);
    const numSamples = 50;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      const pt = catmull.getPoint(t);
      const groundH = this.getTerrainHeight(pt.x, pt.z);
      points.push(new THREE.Vector3(pt.x, groundH + 0.35, pt.z));
    }
    return points;
  }

  // -------------------------------------------------------------
  // DISPOSE & REBUILD LOCATION-SPECIFIC SETTLEMENTS & INFRASTRUCTURE
  // -------------------------------------------------------------
  private disposeObjectRecursive(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).geometry) {
        (child as THREE.Mesh).geometry.dispose();
      }
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          mat.dispose();
        }
      }
    });
  }

  private rebuildSettlementsAndInfrastructure(loc: LocationGeographicProfile): void {
    const ds = getLocationFeatureDataset(loc.id);

    // 1. Clear and dispose previous settlements
    if (this.villageGroup) {
      while (this.villageGroup.children.length > 0) {
        const obj = this.villageGroup.children[0];
        this.disposeObjectRecursive(obj);
        this.villageGroup.remove(obj);
      }
    }

    // 2. Clear and dispose previous infrastructure
    if (this.infrastructureGroup) {
      while (this.infrastructureGroup.children.length > 0) {
        const obj = this.infrastructureGroup.children[0];
        this.disposeObjectRecursive(obj);
        this.infrastructureGroup.remove(obj);
      }
    }

    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const redRoofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 });
    const blueRoofMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
    const greenRoofMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.5 });
    const stiltMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    const isStilt = loc.category === 'FLOODPLAIN_ISLAND'; // Majuli stilt chang-ghar architecture

    // Place location settlements at exact geographic coordinates
    const settlementCoords = ds.settlementCoords;
    for (let h = 0; h < settlementCoords.length; h++) {
      const [hx, hz] = settlementCoords[h];
      const hy = this.getTerrainHeight(hx, hz);
      const house = new THREE.Group();

      if (isStilt) {
        const stilts = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 6), stiltMat);
        stilts.position.y = 0.6;
        house.add(stilts);
        const wall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 2.0), wallMat);
        wall.position.y = 1.9;
        wall.castShadow = true;
        house.add(wall);
        const roofGeom = new THREE.ConeGeometry(2.2, 1.1, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, greenRoofMat);
        roof.position.y = 3.1;
        roof.castShadow = true;
        house.add(roof);
      } else {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.7, 2.1), wallMat);
        wall.position.y = 0.85;
        wall.castShadow = true;
        house.add(wall);
        const roofGeom = new THREE.ConeGeometry(2.1, 1.2, 4);
        roofGeom.rotateY(Math.PI / 4);
        const roof = new THREE.Mesh(roofGeom, h % 3 === 0 ? redRoofMat : h % 3 === 1 ? blueRoofMat : greenRoofMat);
        roof.position.y = 2.2;
        roof.castShadow = true;
        house.add(roof);
      }

      house.position.set(hx, hy, hz);
      house.rotation.y = (h * 0.42) % Math.PI;
      const sName = ds.settlements[h % ds.settlements.length] || `${ds.shortName} Sector #${h + 1}`;
      house.userData = { entityId: `house_${ds.id}_${h}`, name: sName };
      if (this.villageGroup) {
        this.villageGroup.add(house);
      }
    }

    // Place location infrastructure
    const infraNames = ds.infrastructure;
    for (let j = 0; j < Math.min(3, infraNames.length); j++) {
      const name = infraNames[j];
      const baseCoord = settlementCoords[j % settlementCoords.length] || [0, 0];
      const ix = baseCoord[0] + (j === 0 ? 5 : j === 1 ? -5 : 3);
      const iz = baseCoord[1] + (j === 0 ? 6 : j === 1 ? -6 : -4);
      const iy = this.getTerrainHeight(ix, iz);

      const bldg = new THREE.Group();
      if (j === 0) {
        // District Hospital / Primary Medical Facility
        const bBase = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 3.2), wallMat);
        bBase.position.y = 1.1;
        const bRoof = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.4, 3.6), blueRoofMat);
        bRoof.position.y = 2.3;
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.25, 0.05), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        crossH.position.set(0, 1.2, 1.65);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.8, 0.05), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        crossV.position.set(0, 1.2, 1.65);
        bldg.add(bBase, bRoof, crossH, crossV);
      } else if (j === 1) {
        // Assembly Haven / Community Shelter
        const bBase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.8, 3.8), wallMat);
        bBase.position.y = 1.4;
        const bRoof = new THREE.Mesh(new THREE.ConeGeometry(4.4, 1.8, 4), redRoofMat);
        bRoof.rotateY(Math.PI / 4);
        bRoof.position.y = 3.7;
        bldg.add(bBase, bRoof);
      } else {
        // Emergency Control Post / Helipad
        const bBase = new THREE.Mesh(new THREE.BoxGeometry(4.8, 1.8, 3.0), wallMat);
        bBase.position.y = 0.9;
        const bRoof = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.3, 3.4), greenRoofMat);
        bRoof.position.y = 1.95;
        bldg.add(bBase, bRoof);
      }

      bldg.position.set(ix, iy, iz);
      bldg.userData = { entityId: `infra_${ds.id}_${j}`, name };
      if (this.infrastructureGroup) {
        this.infrastructureGroup.add(bldg);
      }
    }
  }

  // -------------------------------------------------------------
  // UPDATE INSTANCED FOREST VEGETATION FOR NEW TERRAIN
  // -------------------------------------------------------------
  private updateForestVegetationForLocation(loc: LocationGeographicProfile): void {
    if (!this.forestMesh) return;
    const treeCount = 650;
    const dummy = new THREE.Object3D();
    let placed = 0;

    for (let i = 0; i < treeCount; i++) {
      const angle = (i / treeCount) * Math.PI * 24;
      const radius = 8 + (i % 65);
      const x = Math.cos(angle) * radius * 1.15 - 6;
      const z = Math.sin(angle) * radius * 1.08;

      const y = this.getTerrainHeight(x, z);
      const slope = this.getSlopeAngle(x, z);

      let valid = false;
      if (loc.category === 'FLOODPLAIN_ISLAND') {
        valid = y >= 2.6 && y <= 4.8 && slope < 12;
      } else if (loc.category === 'RAINFALL_PLATEAU') {
        valid = y >= 20.0 && slope < 28;
      } else if (loc.category === 'WESTERN_GHATS') {
        valid = y >= 4.5 && y <= 28.0 && slope < 34;
      } else if (loc.category === 'NORTHEAST_RIDGES') {
        valid = y >= 5.0 && y <= 28.0 && slope < 35 && Math.abs(x) > 3.0;
      } else {
        valid = y >= 5.0 && y <= 28.0 && slope < 36;
      }

      if (valid) {
        dummy.position.set(x, y - 0.2, z);
        const sc = 0.75 + (Math.sin(i * 1.8) * 0.35 + 0.35);
        dummy.scale.set(sc, sc * (0.9 + (i % 4) * 0.12), sc);
        dummy.rotation.y = (i * 0.85) % Math.PI;
        dummy.updateMatrix();
        this.forestMesh.setMatrixAt(placed, dummy.matrix);
        placed++;
      }
    }

    this.forestMesh.count = placed;
    this.forestMesh.instanceMatrix.needsUpdate = true;
  }

  // -------------------------------------------------------------
  // UPDATE CONFORMAL RISK LAYERS (Follows actual slopes & riverbed)
  // -------------------------------------------------------------
  private updateConformalRiskLayersForLocation(loc: LocationGeographicProfile): void {
    // 1. Landslide Susceptibility Overlay
    if (this.landslideRiskMesh) {
      const lsPos = this.landslideRiskMesh.geometry.attributes.position;
      const lsColors = this.landslideRiskMesh.geometry.attributes.color as THREE.BufferAttribute;
      const lsAlpha = this.landslideRiskMesh.geometry.attributes.aAlpha as THREE.BufferAttribute;
      const count = lsPos.count;
      const col = new THREE.Color();

      const isFloodplain = loc.category === 'FLOODPLAIN_ISLAND';

      for (let i = 0; i < count; i++) {
        const x = lsPos.getX(i);
        const z = lsPos.getZ(i);
        const y = this.getTerrainHeight(x, z);
        lsPos.setY(i, y + 0.12);

        const slope = this.getSlopeAngle(x, z);

        if (isFloodplain) {
          lsAlpha.setX(i, 0.0);
        } else if (slope >= 42) {
          col.setRGB(0.94, 0.27, 0.27);
          lsAlpha.setX(i, 0.88);
          lsColors.setXYZ(i, col.r, col.g, col.b);
        } else if (slope >= 30) {
          col.setRGB(0.98, 0.45, 0.09);
          lsAlpha.setX(i, 0.82);
          lsColors.setXYZ(i, col.r, col.g, col.b);
        } else if (slope >= 20) {
          col.setRGB(0.92, 0.70, 0.03);
          lsAlpha.setX(i, 0.72);
          lsColors.setXYZ(i, col.r, col.g, col.b);
        } else if (slope >= 12 && y > 5.0) {
          col.setRGB(0.13, 0.77, 0.37);
          lsAlpha.setX(i, 0.58);
          lsColors.setXYZ(i, col.r, col.g, col.b);
        } else {
          lsAlpha.setX(i, 0.0);
        }
      }

      lsPos.needsUpdate = true;
      lsColors.needsUpdate = true;
      lsAlpha.needsUpdate = true;
      this.landslideRiskMesh.geometry.computeVertexNormals();
    }

    // 2. Flood Susceptibility Overlay
    if (this.floodRiskMesh) {
      const flPos = this.floodRiskMesh.geometry.attributes.position;
      const flColors = this.floodRiskMesh.geometry.attributes.color as THREE.BufferAttribute;
      const flAlpha = this.floodRiskMesh.geometry.attributes.aAlpha as THREE.BufferAttribute;
      const count = flPos.count;
      const col = new THREE.Color();

      const isFloodplain = loc.category === 'FLOODPLAIN_ISLAND';

      for (let i = 0; i < count; i++) {
        const x = flPos.getX(i);
        const z = flPos.getZ(i);
        const y = this.getTerrainHeight(x, z);
        flPos.setY(i, y + 0.12);

        if (isFloodplain) {
          if (y < 2.5) {
            col.setRGB(0.94, 0.27, 0.27);
            flAlpha.setX(i, 0.88);
          } else if (y < 3.2) {
            col.setRGB(0.98, 0.45, 0.09);
            flAlpha.setX(i, 0.80);
          } else if (y < 3.8) {
            col.setRGB(0.92, 0.70, 0.03);
            flAlpha.setX(i, 0.70);
          } else {
            col.setRGB(0.13, 0.77, 0.37);
            flAlpha.setX(i, 0.55);
          }
          flColors.setXYZ(i, col.r, col.g, col.b);
        } else {
          if (y < 4.2) {
            col.setRGB(0.94, 0.27, 0.27);
            flAlpha.setX(i, 0.88);
          } else if (y < 6.5) {
            col.setRGB(0.98, 0.45, 0.09);
            flAlpha.setX(i, 0.78);
          } else if (y < 9.0) {
            col.setRGB(0.92, 0.70, 0.03);
            flAlpha.setX(i, 0.65);
          } else if (y < 12.0) {
            col.setRGB(0.13, 0.77, 0.37);
            flAlpha.setX(i, 0.50);
          } else {
            flAlpha.setX(i, 0.0);
          }
          flColors.setXYZ(i, col.r, col.g, col.b);
        }
      }

      flPos.needsUpdate = true;
      flColors.needsUpdate = true;
      flAlpha.needsUpdate = true;
      this.floodRiskMesh.geometry.computeVertexNormals();
    }
  }

  // -------------------------------------------------------------
  // PRIMARY GEOGRAPHIC TERRAIN LOADER (LOCATION PIPELINE)
  // -------------------------------------------------------------
  public loadLocationGeographicTerrain(
    loc: LocationGeographicProfile,
    demResult?: LocationElevationResult | null
  ): void {
    this.isCinematicTour = false;
    this.currentLocationProfile = loc;
    this.currentDemData = demResult !== undefined ? demResult : this.currentDemData;

    // 1. Camera Fly-To
    const targetPos = loc.engineProfile?.cameraPos || [85, 65, 95];
    const targetTarget = loc.engineProfile?.cameraTarget || [0, 8, 0];
    this.animateCameraTo(
      new THREE.Vector3(targetPos[0], targetPos[1], targetPos[2]),
      new THREE.Vector3(targetTarget[0], targetTarget[1], targetTarget[2])
    );

    // 2. Backdrop Mountains Ring Scaling & Skyline
    if (this.backdropMountainMesh) {
      if (loc.category === 'FLOODPLAIN_ISLAND') {
        this.backdropMountainMesh.scale.set(1, 0.06, 1);
      } else if (loc.category === 'LOWER_RELIEF_TRIPURA') {
        this.backdropMountainMesh.scale.set(1, 0.20, 1);
      } else if (loc.category === 'WESTERN_GHATS') {
        this.backdropMountainMesh.scale.set(1, 0.75, 1);
      } else if (loc.category === 'NORTHEAST_RIDGES') {
        this.backdropMountainMesh.scale.set(1, 0.95, 1);
      } else if (loc.category === 'RAINFALL_PLATEAU') {
        this.backdropMountainMesh.scale.set(1, 1.0, 1);
      } else if (loc.category === 'SIKKIM_HIMALAYAN') {
        this.backdropMountainMesh.scale.set(1, 1.25, 1);
      } else {
        this.backdropMountainMesh.scale.set(1, 1.45, 1);
      }
    }

    // 3. Terrain Mesh Geometry & Multi-Criteria Natural Shading
    if (this.terrainMesh) {
      const posAttr = this.terrainMesh.geometry.attributes.position;
      const colorAttr = this.terrainMesh.geometry.attributes.color;
      const count = posAttr.count;
      const col = new THREE.Color();

      for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i);
        const z = posAttr.getZ(i);
        const y = this.getTerrainHeight(x, z);
        posAttr.setY(i, y);

        const slope = this.getSlopeAngle(x, z);

        // Location-specific natural geological palette:
        if (loc.category === 'FLOODPLAIN_ISLAND') {
          if (y < 2.4) {
            col.setRGB(0.24, 0.44, 0.52);
          } else if (slope < 6) {
            col.setRGB(0.35, 0.58, 0.28);
          } else {
            col.setRGB(0.52, 0.58, 0.42);
          }
        } else if (loc.category === 'WESTERN_GHATS') {
          if (x < -48 || slope > 38) {
            col.setRGB(0.38, 0.36, 0.32);
          } else if (y < 4.2) {
            col.setRGB(0.32, 0.38, 0.38);
          } else if (slope < 26) {
            col.setRGB(0.12, 0.52, 0.18);
          } else {
            col.setRGB(0.22, 0.44, 0.22);
          }
        } else if (loc.category === 'RAINFALL_PLATEAU') {
          if (slope > 34) {
            col.setRGB(0.64, 0.45, 0.32);
          } else if (y < 4.2) {
            col.setRGB(0.26, 0.32, 0.36);
          } else {
            col.setRGB(0.28, 0.46, 0.24);
          }
        } else if (loc.category === 'NORTHEAST_RIDGES') {
          if (slope > 38) {
            col.setRGB(0.46, 0.42, 0.36);
          } else if (y > 22) {
            col.setRGB(0.36, 0.48, 0.28);
          } else {
            col.setRGB(0.18, 0.52, 0.20);
          }
        } else if (loc.category === 'SIKKIM_HIMALAYAN') {
          if (y > 34) {
            col.setRGB(0.85, 0.88, 0.92);
          } else if (slope > 38) {
            col.setRGB(0.44, 0.40, 0.36);
          } else {
            col.setRGB(0.20, 0.44, 0.22);
          }
        } else {
          if (y > 34) {
            col.setRGB(0.92, 0.95, 0.98);
          } else if (slope > 40) {
            col.setRGB(0.38, 0.42, 0.46);
          } else if (slope > 28) {
            col.setRGB(0.48, 0.44, 0.38);
          } else if (y < 16) {
            col.setRGB(0.14, 0.40, 0.18);
          } else {
            col.setRGB(0.24, 0.46, 0.26);
          }
        }

        colorAttr.setXYZ(i, col.r, col.g, col.b);
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      this.terrainMesh.geometry.computeVertexNormals();
    }

    // 4. River System Re-alignment
    if (this.riverMesh) {
      const riverPoints = this.getRiverPointsForLocation(loc);
      const riverCurve = new THREE.CatmullRomCurve3(riverPoints);
      const radius = loc.category === 'FLOODPLAIN_ISLAND' ? 7.2 : 3.4 * (loc.engineProfile?.riverBedWidth || 1.0);
      this.riverMesh.geometry.dispose();
      this.riverMesh.geometry = new THREE.TubeGeometry(riverCurve, 100, radius, 4, false);
      const rPos = this.riverMesh.geometry.attributes.position;
      for (let i = 0; i < rPos.count; i++) {
        rPos.setY(i, rPos.getY(i) * 0.12);
      }
      this.riverMesh.geometry.computeVertexNormals();

      // Reposition river water particles
      if (this.riverWaterParticles) {
        const pAttr = this.riverWaterParticles.geometry.attributes.position as THREE.BufferAttribute;
        const count = pAttr.count;
        for (let f = 0; f < count; f++) {
          const t = f / count;
          const pt = riverCurve.getPoint(t);
          pAttr.setXYZ(f, pt.x + (Math.sin(f * 2.3) - 0.5) * (radius * 0.6), pt.y + 0.15, pt.z);
        }
        pAttr.needsUpdate = true;
      }
    }

    // 5. Road System Re-alignment
    if (this.roadGroup) {
      const roadPoints = this.getRoadPointsForLocation(loc);
      const roadCurve = new THREE.CatmullRomCurve3(roadPoints);
      const roadMesh = this.roadGroup.children[0] as THREE.Mesh;
      if (roadMesh && roadMesh.geometry) {
        roadMesh.geometry.dispose();
        roadMesh.geometry = new THREE.TubeGeometry(roadCurve, 100, 1.5, 4, false);
        const rPos = roadMesh.geometry.attributes.position;
        for (let i = 0; i < rPos.count; i++) {
          rPos.setY(i, rPos.getY(i) * 0.14);
        }
        roadMesh.geometry.computeVertexNormals();
      }

      if (this.roadSignPostMesh && this.roadSignBoardMesh && roadPoints.length > 10) {
        const signRef = roadPoints[Math.floor(roadPoints.length / 4)];
        this.roadSignPostMesh.position.set(signRef.x + 2.5, signRef.y + 1.2, signRef.z);
        this.roadSignBoardMesh.position.set(signRef.x + 2.5, signRef.y + 2.2, signRef.z);
      }
    }

    // 6. Settlements & Infrastructure
    this.rebuildSettlementsAndInfrastructure(loc);

    // 7. Forest Vegetation
    this.updateForestVegetationForLocation(loc);

    // 8. Conformal Risk Overlays
    this.updateConformalRiskLayersForLocation(loc);
  }

  public setLocationProfile(profile: {
    id: string;
    elevationScale?: number;
    ruggedness?: number;
    vegetationTone?: 'dense_emerald' | 'subalpine_fir' | 'tropical_bamboo' | 'riverine_wetland' | 'glacier_ice';
    cameraPos?: [number, number, number];
    cameraTarget?: [number, number, number];
  }): void {
    const loc = getGeographicLocationById(profile.id);
    this.loadLocationGeographicTerrain(loc, this.currentDemData);
  }

  private updateCameraOrbit(): void {
    const x = this.cameraTarget.x + this.cameraDistance * Math.sin(this.cameraPhi) * Math.sin(this.cameraTheta);
    const y = this.cameraTarget.y + this.cameraDistance * Math.cos(this.cameraPhi);
    const z = this.cameraTarget.z + this.cameraDistance * Math.sin(this.cameraPhi) * Math.cos(this.cameraTheta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.cameraTarget);
  }

  // -------------------------------------------------------------
  // ANIMATION LOOP & MULTI-LAYER PARTICLES
  // -------------------------------------------------------------
  private startAnimationLoop(): void {
    const render = () => {
      this.animFrameId = requestAnimationFrame(render);
      const delta = this.clock.getDelta();
      const elapsed = this.clock.getElapsedTime();

      // Camera Smooth Lerp
      if (this.isCameraTransitioning && this.targetCameraPos && this.targetCameraTarget) {
        this.cameraTransitionAlpha += delta * 2.2;
        if (this.cameraTransitionAlpha >= 1) {
          this.camera.position.copy(this.targetCameraPos);
          this.cameraTarget.copy(this.targetCameraTarget);
          this.isCameraTransitioning = false;
          const offset = new THREE.Vector3().subVectors(this.camera.position, this.cameraTarget);
          this.cameraDistance = offset.length();
          this.cameraPhi = Math.acos(Math.max(-1, Math.min(1, offset.y / this.cameraDistance)));
          this.cameraTheta = Math.atan2(offset.x, offset.z);
        } else {
          this.camera.position.lerp(this.targetCameraPos, 0.08);
          this.cameraTarget.lerp(this.targetCameraTarget, 0.08);
          this.camera.lookAt(this.cameraTarget);
        }
      }

      // Rain Particles Fall
      if (this.rainParticles && this.currentRainIntensity !== 'OFF') {
        const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
        const count = positions.length / 3;
        const fallSpeed = 42 * delta;

        for (let i = 0; i < count; i++) {
          positions[i * 3 + 1] -= fallSpeed;
          if (positions[i * 3 + 1] < 2) positions[i * 3 + 1] = 85;
        }
        this.rainParticles.geometry.attributes.position.needsUpdate = true;
      }

      // Debris Rocks Flow
      if (this.debrisRockParticles && this.currentProgress >= 0.42 && this.currentProgress < 0.95) {
        const dPos = this.debrisRockParticles.geometry.attributes.position.array as Float32Array;
        const dCount = dPos.length / 3;

        for (let j = 0; j < dCount; j++) {
          dPos[j * 3] += this.debrisVelocities[j * 3] * delta * 14;
          dPos[j * 3 + 1] += this.debrisVelocities[j * 3 + 1] * delta * 14;
          dPos[j * 3 + 2] += this.debrisVelocities[j * 3 + 2] * delta * 14;

          if (dPos[j * 3 + 1] < 4.2 || dPos[j * 3] > 18) {
            dPos[j * 3] = -20 + (Math.random() - 0.5) * 6;
            dPos[j * 3 + 1] = 27.5 + (Math.random() - 0.5) * 4;
            dPos[j * 3 + 2] = 2 + (Math.random() - 0.5) * 12;
          }
        }
        this.debrisRockParticles.geometry.attributes.position.needsUpdate = true;
      }

      // River Water Particle Stream
      if (this.riverWaterParticles) {
        const rPos = this.riverWaterParticles.geometry.attributes.position.array as Float32Array;
        const rCount = rPos.length / 3;
        for (let r = 0; r < rCount; r++) {
          rPos[r * 3 + 2] += 22 * delta;
          if (rPos[r * 3 + 2] > 75) rPos[r * 3 + 2] = -75;
          const z = rPos[r * 3 + 2];
          rPos[r * 3] = 16 + Math.sin(z * 0.048) * 8.5;
        }
        this.riverWaterParticles.geometry.attributes.position.needsUpdate = true;
      }

      // River Ripple & Flood Surge
      if (this.riverMesh) {
        (this.riverMesh.material as THREE.MeshStandardMaterial).roughness = 0.12 + Math.sin(elapsed * 2.8) * 0.04;
      }

      if (this.floodMesh && this.floodMesh.visible) {
        this.floodMesh.position.y += Math.sin(elapsed * 2.2) * 0.02 * delta;
      }

      // Telemetry Beacon Blink
      if (this.telemetryTowerGroup) {
        const beacon = this.telemetryTowerGroup.children[1] as THREE.Mesh;
        if (beacon) {
          (beacon.material as THREE.MeshBasicMaterial).color.setHex(Math.sin(elapsed * 6) > 0 ? 0xff0000 : 0x330000);
        }
      }

      // Animate 3D Sensor Pulses & Rotations
      if (this.tiltmeterRipples) {
        const tScale = 1.0 + ((elapsed * 1.5) % 1.0) * 0.9;
        this.tiltmeterRipples.scale.set(tScale, tScale, tScale);
        (this.tiltmeterRipples.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 - ((elapsed * 1.5) % 1.0) * 0.8);
      }

      if (this.piezometerWave) {
        const pScale = 1.0 + ((elapsed * 1.2) % 1.0) * 0.6;
        this.piezometerWave.scale.set(pScale, 1.0, pScale);
        (this.piezometerWave.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - ((elapsed * 1.2) % 1.0) * 0.7);
      }

      if (this.anemometerRotor) {
        const windSpin = (this.currentScenarioState.rainfallMmH > 0 ? 12 : 3) * delta;
        this.anemometerRotor.rotation.y += windSpin;
      }

      if (this.radarWaves) {
        const rScale = 1.0 + ((elapsed * 2.0) % 1.0) * 0.7;
        this.radarWaves.scale.set(rScale, rScale, rScale);
        (this.radarWaves.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 - ((elapsed * 2.0) % 1.0) * 0.8);
      }

      // Animate warning signs floating & rotating
      if (this.slopeWarningMesh && this.slopeWarningMesh.visible) {
        this.slopeWarningMesh.position.y = 36 + Math.sin(elapsed * 2.5) * 0.5;
        this.slopeWarningMesh.rotation.y = Math.sin(elapsed * 1.2) * 0.35;
      }

      if (this.roadBlockedSignMesh && this.roadBlockedSignMesh.visible) {
        this.roadBlockedSignMesh.position.y = 11 + Math.sin(elapsed * 3.0) * 0.4;
        this.roadBlockedSignMesh.rotation.y = Math.sin(elapsed * 1.8) * 0.3;
      }

      // Cloud drift over mountain peaks
      if (this.cloudsGroup) {
        this.cloudsGroup.position.x = Math.sin(elapsed * 0.04) * 3.5;
      }

      // Lightning flash in severe storm
      if (this.lightningLight) {
        if (this.currentRainIntensity === 'EXTREME' || this.currentRainIntensity === 'HEAVY') {
          if (Math.random() < 0.012) {
            this.lightningLight.intensity = 5.0;
          } else {
            this.lightningLight.intensity = Math.max(0, this.lightningLight.intensity - delta * 14);
          }
        } else {
          this.lightningLight.intensity = 0;
        }
      }

      this.renderer.render(this.scene, this.camera);
    };

    render();
  }

  // -------------------------------------------------------------
  // EVENT BINDINGS & INTERACTION RAYCASTING
  // -------------------------------------------------------------
  private bindEvents(): void {
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isMouseDown = e.button === 0 && !e.shiftKey;
      this.isRightMouseDown = e.button === 2 || (e.button === 0 && e.shiftKey) || e.button === 1;
      this.mousePrevPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown && !this.isRightMouseDown) return;

      const deltaX = e.clientX - this.mousePrevPos.x;
      const deltaY = e.clientY - this.mousePrevPos.y;
      this.mousePrevPos = { x: e.clientX, y: e.clientY };

      if (this.isMouseDown) {
        this.cameraTheta -= deltaX * 0.0055;
        this.cameraPhi = Math.max(0.12, Math.min(Math.PI / 2.05, this.cameraPhi - deltaY * 0.0055));
        this.isCameraTransitioning = false;
        this.updateCameraOrbit();
      } else if (this.isRightMouseDown) {
        const panSpeed = Math.max(0.05, this.cameraDistance * 0.0016);
        const forward = new THREE.Vector3().subVectors(this.cameraTarget, this.camera.position).setY(0).normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        this.cameraTarget.addScaledVector(right, -deltaX * panSpeed);
        this.cameraTarget.addScaledVector(forward, deltaY * panSpeed);
        this.isCameraTransitioning = false;
        this.updateCameraOrbit();
      }
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      this.isRightMouseDown = false;
    });

    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouseVector, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0 && this.onEntitySelectedCallback) {
        // Find topmost object with metadata
        for (const hit of intersects) {
          let curr: THREE.Object3D | null = hit.object;
          while (curr && curr !== this.scene) {
            if (curr.userData && curr.userData.entityId) {
              const entityId = curr.userData.entityId;
              let info: InteractiveEntityInfo;

              if (entityId === 'sensor_tiltmeter') {
                info = {
                  id: entityId,
                  name: 'BhuShakti Inclinometer Node INCL-01 (Shear Creep)',
                  category: 'sensor',
                  metrics: {
                    'Sensor Type': 'Bi-Axial Subsurface MEMS Inclinometer',
                    'Shear Creep Tilt': `${(this.currentScenarioState.progress * 6.8 + 1.2).toFixed(2)}°`,
                    'Displacement Rate': `${(this.currentScenarioState.progress * 18.5 + 0.4).toFixed(1)} mm/hr`,
                    'LoRa Telemetry': '433 MHz • -68 dBm • Battery 98%',
                  },
                  status: this.currentScenarioState.progress >= 0.35 ? 'CRITICAL DISPLACEMENT ACCELERATION' : 'NOMINAL EQUILIBRIUM',
                  aiRecommendation: 'Real-time inclinometer indicates active progressive shear creep along 42° plane. Immediate downslope hazard clearance recommended.',
                };
              } else if (entityId === 'sensor_piezometer') {
                info = {
                  id: entityId,
                  name: 'BhuShakti Piezometer PIEZ-04 (Pore-Water Hydrostatic)',
                  category: 'sensor',
                  metrics: {
                    'Pore-Water Pressure': `${this.currentScenarioState.porePressureKpa} kPa`,
                    'Groundwater Head': `+${(this.currentScenarioState.progress * 4.6 + 0.8).toFixed(1)}m elevation`,
                    'Effective Stress': `${Math.max(12, Math.round(100 - this.currentScenarioState.porePressureKpa * 0.85))}% of baseline`,
                    'Borehole Depth': '14.5m below surface',
                  },
                  status: this.currentScenarioState.porePressureKpa >= 65 ? 'HYDROSTATIC UPLIFT CRITICAL' : 'EQUILIBRIUM HYDROLOGY',
                  aiRecommendation: 'Hydrostatic pore-water uplift has reduced normal clamping stress by over 50%. Saturated liquefaction failure imminent.',
                };
              } else if (entityId === 'sensor_aws') {
                info = {
                  id: entityId,
                  name: 'Automatic Weather Station (AWS-02 High Catchment)',
                  category: 'sensor',
                  metrics: {
                    'Precipitation Rate': `${this.currentScenarioState.rainfallMmH} mm/h`,
                    '24h Cumulative Rain': `${Math.round(this.currentScenarioState.rainfallMmH * 2.8 + 48)} mm`,
                    'Soil Saturation': `${this.currentScenarioState.soilSaturationPct}% volumetric`,
                    'Anemometer Wind': `${Math.round(this.currentScenarioState.rainfallMmH * 0.45 + 18)} km/h`,
                  },
                  status: this.currentScenarioState.rainfallMmH >= 70 ? 'CLOUDBURST THRESHOLD BREACHED' : 'MONITORING PRECIPITATION',
                  aiRecommendation: 'Catchment precipitation intensity exceeded 70 mm/h. Automatic flash cascade alert dispatched to disaster management network.',
                };
              } else if (entityId === 'sensor_river_radar') {
                info = {
                  id: entityId,
                  name: 'Ultrasonic River Stage Radar (RAD-03 Bridge Pier)',
                  category: 'sensor',
                  metrics: {
                    'River Stage Surcharge': `+${this.currentScenarioState.floodWaterDepthM.toFixed(2)}m above datum`,
                    'River Discharge': `${this.currentScenarioState.riverDischargeM3s} m³/s`,
                    'Gorge Barrier Dam': this.currentProgress >= 0.58 ? 'Landslide Barrier Damming Active' : 'Free Flowing',
                    'Ultrasonic Range': '15.4m to riverbed',
                  },
                  status: this.currentScenarioState.floodWaterDepthM >= 1.2 ? 'SURGE FLOODING' : 'STABLE STREAMFLOW',
                  aiRecommendation: 'Upstream landslide dam forming water surcharge. Downstream evacuation alert triggered for riverbank agrarian parcels.',
                };
              } else if (entityId === 'warning_slope_instability') {
                info = {
                  id: entityId,
                  name: '⚠️ Active Slope Instability Crown (Tension Fracture)',
                  category: 'landslide',
                  metrics: {
                    'Factor of Safety (FS)': this.currentScenarioState.factorOfSafety.toFixed(2),
                    'Crown Crack Width': `${Math.round(this.currentScenarioState.progress * 85 + 15)} mm`,
                    'Slope Shear Angle': '42° Colluvial Mica-Schist',
                    'Vulnerable Mass': '18,500 m³ rock and debris',
                  },
                  status: this.currentScenarioState.factorOfSafety < 1.0 ? 'IMMINENT SHEAR DETACHMENT' : 'HIGH INSTABILITY WARNING',
                  aiRecommendation: 'Slope equilibrium breached. Immediate cordon of NH-13 road chainage 12+400 and launch of automated evacuation sirens.',
                };
              } else if (entityId === 'warning_road_blocked') {
                info = {
                  id: entityId,
                  name: '⛔ NH-13 Strategic Corridor Severed (Landslide Debris)',
                  category: 'road',
                  metrics: {
                    'Debris Volume on Road': '12,400 m³ boulders & saturated mud',
                    'Blocked Span': '240 meters (Chainage 12+400)',
                    'Passability': '0% — Completely Severed',
                    'Alternative Bypass': 'High Ridge Evacuation Route Active',
                  },
                  status: 'SEVERED — EMERGENCY ACCESS ONLY',
                  aiRecommendation: 'Divert all strategic convoy and civilian movement to High Ridge Route B. Border Roads Organisation quick-response machinery en route.',
                };
              } else if (entityId === 'district_health_center') {
                info = {
                  id: entityId,
                  name: 'Tawang Sub-District Health Center & Field Clinic',
                  category: 'infrastructure',
                  metrics: {
                    'Bed Capacity': '42 Acute Care Beds',
                    'Trauma Triage': 'Ready for Mass Casualty',
                    'Elevation Buffer': 'Safe Terrace (+14m above river)',
                    'Backup Power': 'Dual 75 kVA Diesel Gensets',
                  },
                  status: 'OPERATIONAL HAVEN',
                  aiRecommendation: 'Prepare emergency receiving bay for potential cold-injury and mudslide trauma evacuees.',
                };
              } else if (entityId === 'govt_high_school') {
                info = {
                  id: entityId,
                  name: 'Government Secondary School Tawang (Shelter #02)',
                  category: 'infrastructure',
                  metrics: {
                    'Shelter Capacity': '650 Persons',
                    'Potable Water': '18,000 Liters Underground Tank',
                    'Flood Exposure': 'Safe High Terrace',
                    'Communications': 'HAM Radio & Satellite Terminal',
                  },
                  status: 'DESIGNATED EVACUATION SHELTER',
                  aiRecommendation: 'Staging ground for community shelter and dry rations distribution.',
                };
              } else if (entityId === 'iot_gateway_tower') {
                info = {
                  id: entityId,
                  name: 'BhuShakti LoRaWAN Telemetry Gateway Mast',
                  category: 'infrastructure',
                  metrics: {
                    'Active Nodes': '14 Subsurface & Hydrology Sensors',
                    'Uptime': '99.98% High Mountain Reliability',
                    'RF Transmission': '868 MHz Long-Range Spread Spectrum',
                    'Satellite Uplink': 'ISRO GSAT Disaster Relay Active',
                  },
                  status: 'GATEWAY HEALTHY',
                  aiRecommendation: 'Redundant telemetry loop operating with 0 packet loss.',
                };
              } else if (entityId === 'highway_nh13') {
                info = {
                  id: entityId,
                  name: 'National Highway NH-13 (Trans-Arunachal Highway)',
                  category: 'road',
                  metrics: {
                    'Corridor Length': '14.2 km in sector',
                    'Current Status': this.currentScenarioState.roadStatus,
                    'Blocked Section': this.currentScenarioState.roadStatus !== 'NORMAL' ? 'Chainage 12+400 (240m)' : 'None',
                    'Traffic Load': 'Strategic Logistics Corridor',
                  },
                  status: this.currentScenarioState.roadStatus,
                  aiRecommendation: 'Divert military and civilian transport via High Ridge Pass Route B.',
                };
              } else if (entityId === 'tawang_river') {
                info = {
                  id: entityId,
                  name: 'Tawang Chu River Gorge',
                  category: 'river',
                  metrics: {
                    'Current Discharge': `${this.currentScenarioState.riverDischargeM3s} m³/s`,
                    'Surcharge Level': `+${this.currentScenarioState.floodWaterDepthM.toFixed(1)}m`,
                    'Gorge Obstruction': this.currentProgress >= 0.58 ? 'Landslide Barrier Dam Active' : 'Unimpeded',
                    'Downstream Risk': 'Extreme (Haora/Tawang Confluence)',
                  },
                  status: this.currentProgress >= 0.65 ? 'FLOOD SURGE IN PROGRESS' : 'FLOWING NORMAL',
                  aiRecommendation: 'Evacuate agricultural flats within 500m riparian buffer immediately.',
                };
              } else if (entityId.startsWith('house') || entityId === 'monastery_haven') {
                info = {
                  id: entityId,
                  name: curr.userData.name || 'Tawang Sector 04 Village',
                  category: 'village',
                  metrics: {
                    'Population Exposure': 2840,
                    'Critical Assets': 7,
                    'Evacuation Shelter': 'High Ridge Monastery Assembly',
                    'Flood Perimeter': this.currentScenarioState.villageAtRisk ? 'INUNDATION PERIMETER REACHED' : 'SAFE RIDGE',
                  },
                  status: this.currentScenarioState.villageAtRisk ? 'VILLAGE AT RISK' : 'STABLE',
                  aiRecommendation: 'Activate First 10 Minutes evacuation siren & dispatch NDRF Sector 04 squad.',
                };
              } else {
                info = {
                  id: entityId,
                  name: 'Tawang High Slope Sector',
                  category: 'mountain',
                  metrics: {
                    'Elevation': '2,840m - 3,250m',
                    'Slope Angle': '42° Shear Plane',
                    'Factor of Safety': this.currentScenarioState.factorOfSafety.toFixed(2),
                    'Pore Pressure': `${this.currentScenarioState.porePressureKpa} kPa`,
                  },
                  status: this.currentScenarioState.factorOfSafety < 1.0 ? 'FAILURE ACTIVE' : 'MONITORING',
                  aiRecommendation: 'Continuous IoT sensing with 10-second sampling rate active.',
                };
              }

              this.onEntitySelectedCallback(info);
              return;
            }
            curr = curr.parent;
          }
        }
      }
    });

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.cameraDistance = Math.max(25, Math.min(220, this.cameraDistance + e.deltaY * 0.08));
        this.isCameraTransitioning = false;
        this.updateCameraOrbit();
      },
      { passive: false }
    );

    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  public resize(width: number, height: number): void {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public resetSimulation(): void {
    this.setSimulationProgress(0, {
      stepIndex: 0,
      progress: 0,
      rainfallMmH: 0,
      soilSaturationPct: 32,
      factorOfSafety: 1.65,
      porePressureKpa: 12,
      riverDischargeM3s: 42,
      floodWaterDepthM: 0,
      floodExtentKm2: 0,
      debrisVelocityKmh: 0,
      roadStatus: 'NORMAL',
      villageAtRisk: false,
      statusText: 'BASELINE: Stable Mountain Slope (FS = 1.65)',
    });
    this.setCameraView('REGIONAL');
  }

  public dispose(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
