import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { AlertTriangle, Radio, ShieldCheck, Compass } from 'lucide-react';

interface TerrainVisualizationProps {
  className?: string;
}

export const TerrainVisualization: React.FC<TerrainVisualizationProps> = ({
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 320;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x061525, 0.035);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    // 3/4 elevated aerial perspective looking down at an angle (matching IMAGE 2)
    camera.position.set(0, 5.8, 8.8);
    camera.lookAt(0, 0.2, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (e) {
      console.warn('WebGL initialization fallback:', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0a2b4c, 1.8);
    scene.add(ambientLight);

    // Sunlight from top-right giving realistic terrain shadow & ridge definition
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(6, 10, 4);
    scene.add(sunLight);

    // Cyan holographic edge bounce light
    const cyanLight = new THREE.DirectionalLight(0x00d9ff, 1.6);
    cyanLight.position.set(-6, 4, -4);
    scene.add(cyanLight);

    // Red warning point light emanating from the high-risk mountain peak
    const redPeakLight = new THREE.PointLight(0xff2222, 2.8, 7);
    redPeakLight.position.set(-0.6, 2.2, -0.4);
    scene.add(redPeakLight);

    // 3. Procedural Realistic Mountain 3D Geometry
    const gridX = 140;
    const gridY = 100;
    const planeGeo = new THREE.PlaneGeometry(9.6, 6.8, gridX, gridY);
    planeGeo.rotateX(-Math.PI / 2);

    const posAttr = planeGeo.attributes.position;
    const vertexCount = posAttr ? posAttr.count : 0;

    // Perlin-style noise generation for realistic alpine mountain range
    const noise = (x: number, y: number) => {
      return (
        Math.sin(x * 1.5 + Math.cos(y * 1.8)) * 0.45 +
        Math.sin(x * 3.2 - y * 2.8) * 0.25 +
        Math.cos(x * 6.5 + y * 5.5) * 0.12
      );
    };

    // Calculate height for each vertex: prominent central high-risk mountain
    for (let i = 0; i < vertexCount; i++) {
      const vx = posAttr.getX(i);
      const vz = posAttr.getZ(i);

      // Distance from prominent central high-risk peak (-0.6, -0.4)
      const dxPeak = vx - (-0.6);
      const dzPeak = vz - (-0.4);
      const distPeakSq = dxPeak * dxPeak + dzPeak * dzPeak;
      // High steep mountain peak
      const peakElevation = 2.1 * Math.exp(-distPeakSq * 0.85);

      // Secondary mountain ridge running northwest to southeast
      const ridgeElevation = 1.2 * Math.exp(-Math.pow(vx * 0.5 + vz * 0.7 - 0.2, 2) * 1.2);

      // Valleys and foothills with rocky noise
      const valleyTrough = Math.sin(vz * 0.8 + 1.2) * 0.15;
      const rockDetails = noise(vx, vz);

      // Edge falloff to keep terrain inside the holographic box
      const edgeFactorX = Math.cos((vx / 4.8) * (Math.PI / 2));
      const edgeFactorZ = Math.cos((vz / 3.4) * (Math.PI / 2));
      const boundaryDamp = Math.max(0, edgeFactorX * edgeFactorZ);

      let finalHeight = (peakElevation + ridgeElevation * 0.6 + rockDetails * 0.4 + valleyTrough) * boundaryDamp;
      finalHeight = Math.max(0.04, finalHeight);

      posAttr.setY(i, finalHeight);
    }

    planeGeo.computeVertexNormals();

    // 4. Procedural High-Detail Terrain Texture Canvas
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 1024;
    texCanvas.height = 768;
    const ctx = texCanvas.getContext('2d')!;

    // Background Valley Green
    const grad = ctx.createLinearGradient(0, 0, 1024, 768);
    grad.addColorStop(0, '#113e28');
    grad.addColorStop(0.35, '#195e38');
    grad.addColorStop(0.7, '#144c2c');
    grad.addColorStop(1, '#0e331e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 768);

    // Forest canopy texturing (stippled alpine vegetation)
    ctx.fillStyle = '#0a2e19';
    for (let f = 0; f < 3500; f++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 768;
      ctx.fillRect(rx, ry, Math.random() * 3 + 1, Math.random() * 3 + 1);
    }

    // Winding Valley River (Turquoise water cutting through terrain)
    ctx.strokeStyle = '#00d9ff';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#00d9ff';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(1024, 450);
    ctx.bezierCurveTo(800, 480, 680, 560, 520, 600);
    ctx.bezierCurveTo(360, 640, 240, 620, 0, 720);
    ctx.stroke();

    // Secondary river shimmer
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Small Village Settlements & Road Network along the valley
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(960, 380);
    ctx.bezierCurveTo(720, 410, 580, 490, 440, 540);
    ctx.bezierCurveTo(300, 590, 200, 580, 40, 680);
    ctx.stroke();
    ctx.setLineDash([]);

    // Settlement building footprints
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    const villageCenters = [
      { x: 740, y: 440 },
      { x: 560, y: 520 },
      { x: 380, y: 560 },
      { x: 220, y: 620 }
    ];
    villageCenters.forEach((vc) => {
      for (let b = 0; b < 6; b++) {
        const bx = vc.x + (Math.random() - 0.5) * 45;
        const by = vc.y + (Math.random() - 0.5) * 35;
        ctx.fillRect(bx, by, 7, 7);
        ctx.strokeRect(bx, by, 7, 7);
      }
    });

    // Central High-Risk Mountain Elevation Heatmap Gradient
    // Perfectly centered around (-0.6, -0.4) on the plane
    // Mapping: Plane bounds [-4.8..4.8, -3.4..3.4] to Canvas [0..1024, 0..768]
    const peakCanvasX = (( -0.6 + 4.8) / 9.6) * 1024;
    const peakCanvasY = (( -0.4 + 3.4) / 6.8) * 768;

    // Radial Risk Heatmap: Green -> Yellow -> Orange -> Red summit
    const riskGrad = ctx.createRadialGradient(
      peakCanvasX,
      peakCanvasY,
      10,
      peakCanvasX,
      peakCanvasY,
      270
    );
    riskGrad.addColorStop(0, '#ef4444'); // Crimson Red High-Risk Peak
    riskGrad.addColorStop(0.18, '#f87171');
    riskGrad.addColorStop(0.38, '#f97316'); // Vibrant Orange Elevated Risk
    riskGrad.addColorStop(0.62, '#eab308'); // Bright Yellow Moderate Risk
    riskGrad.addColorStop(0.85, 'rgba(132, 204, 22, 0.6)'); // Yellow-green
    riskGrad.addColorStop(1, 'transparent'); // Blends into green valley

    ctx.fillStyle = riskGrad;
    ctx.beginPath();
    ctx.arc(peakCanvasX, peakCanvasY, 270, 0, Math.PI * 2);
    ctx.fill();

    // Topographic Elevation Contour Lines
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.45)';
    ctx.lineWidth = 1.8;
    for (let r = 35; r < 260; r += 28) {
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
        const wobble = Math.sin(a * 5 + r) * 6 + Math.cos(a * 3) * 4;
        const cx = peakCanvasX + Math.cos(a) * (r + wobble);
        const cy = peakCanvasY + Math.sin(a) * (r + wobble);
        if (a === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // Safe Route (Glowing AI-generated evacuation path from IMAGE 2)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#00d9ff';
    ctx.shadowBlur = 10;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(880, 420);
    ctx.bezierCurveTo(700, 460, 520, 510, 360, 540);
    ctx.bezierCurveTo(240, 570, 160, 600, 40, 640);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    const terrainTexture = new THREE.CanvasTexture(texCanvas);
    terrainTexture.colorSpace = THREE.SRGBColorSpace;

    const terrainMat = new THREE.MeshStandardMaterial({
      map: terrainTexture,
      roughness: 0.68,
      metalness: 0.15,
      flatShading: false
    });

    const terrainMesh = new THREE.Mesh(planeGeo, terrainMat);
    scene.add(terrainMesh);

    // 5. Holographic Wireframe Grid Overlay (Subtle 3D Grid wrapping terrain)
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      wireframe: true,
      transparent: true,
      opacity: 0.14
    });
    const wireframeMesh = new THREE.Mesh(planeGeo, wireframeMat);
    wireframeMesh.position.y += 0.015;
    scene.add(wireframeMesh);

    // 6. Futuristic Transparent Holographic Digital-Twin Box
    // Matches the rectangular holographic box from IMAGE 2
    const boxWidth = 9.8;
    const boxHeight = 2.6;
    const boxDepth = 7.0;

    const boxGeo = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    // Position box so terrain sits inside its base volume
    const boxCenterY = boxHeight / 2 - 0.1;

    // Glowing Cyan Edges
    const edgesGeo = new THREE.EdgesGeometry(boxGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x00d9ff,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    });
    const boxEdges = new THREE.LineSegments(edgesGeo, edgeMat);
    boxEdges.position.y = boxCenterY;
    scene.add(boxEdges);

    // Transparent Glass Walls of the Digital-Twin Volume
    const glassMat = new THREE.MeshBasicMaterial({
      color: 0x041c33,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const boxGlass = new THREE.Mesh(boxGeo, glassMat);
    boxGlass.position.y = boxCenterY;
    scene.add(boxGlass);

    // Corner Light Flares / Holographic Pillars
    const cornerPillars = [
      [-boxWidth / 2, -boxDepth / 2],
      [boxWidth / 2, -boxDepth / 2],
      [-boxWidth / 2, boxDepth / 2],
      [boxWidth / 2, boxDepth / 2]
    ];
    cornerPillars.forEach(([px, pz]) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(px, 0, pz),
        new THREE.Vector3(px, boxHeight, pz)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.95
      });
      const pillar = new THREE.Line(lineGeo, lineMat);
      scene.add(pillar);
    });

    // 7. Holographic Scanning Light Bar
    const scanGeo = new THREE.PlaneGeometry(boxWidth, 0.08);
    scanGeo.rotateX(-Math.PI / 2);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const scanMesh = new THREE.Mesh(scanGeo, scanMat);
    scene.add(scanMesh);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Holographic scan bar movement back and forth
      const scanZ = Math.sin(elapsedTime * 1.2) * (boxDepth / 2 - 0.2);
      scanMesh.position.set(0, 1.4 + Math.cos(elapsedTime * 1.5) * 0.2, scanZ);

      // Subtle breathing pulse on red peak light
      redPeakLight.intensity = 2.4 + Math.sin(elapsedTime * 3) * 0.8;

      // Subtle cyan glow pulse
      edgeMat.opacity = 0.75 + Math.sin(elapsedTime * 2) * 0.15;

      // Subtle camera parallax based on mouse
      camera.position.x = mousePos.x * 0.5;
      camera.position.y = 5.8 + mousePos.y * 0.3;
      camera.lookAt(0, 0.3, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      terrainMat.dispose();
      boxGeo.dispose();
      edgeMat.dispose();
    };
  }, [mousePos]);

  return (
    <div
      className={`relative select-none ${className}`}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        setMousePos({ x, y });
      }}
    >
      {/* 3D WebGL Digital Twin Viewport */}
      <div
        ref={mountRef}
        className="relative w-[380px] sm:w-[500px] lg:w-[540px] h-[270px] sm:h-[320px] lg:h-[340px] rounded-3xl overflow-visible flex items-center justify-center filter drop-shadow-[0_0_35px_rgba(0,217,255,0.35)]"
      >
        {/* ======================================================== */}
        {/* FLOATING 3D ANALYSIS LABELS (EXACTLY MATCHING IMAGE 2)   */}
        {/* ======================================================== */}
        
        {/* 1. HIGH RISK AREA (Floating Red Pill Badge on Central Peak) */}
        <div
          className="absolute z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#3d0b16]/90 border border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.85)] animate-pulse pointer-events-none"
          style={{
            top: '38%',
            left: '52%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <AlertTriangle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
          <span className="text-[11px] font-bold text-rose-100 tracking-wide font-sans">
            High Risk Area
          </span>
        </div>

        {/* 2. SERVICE AREA (Floating Cyan/Blue Pill Marker in Valley) */}
        <div
          className="absolute z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#04192f]/90 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.65)] pointer-events-none"
          style={{
            top: '26%',
            left: '48%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <Radio className="w-3 h-3 text-cyan-300 shrink-0" />
          <span className="text-[10px] font-semibold text-cyan-200 tracking-wide font-mono">
            Service Area
          </span>
        </div>

        {/* 3. SETTLEMENT / SAFE ZONE (Floating Teal Marker) */}
        <div
          className="absolute z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#04243b]/85 border border-teal-400/80 shadow-[0_0_12px_rgba(20,184,166,0.5)] pointer-events-none"
          style={{
            top: '24%',
            left: '32%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
          <span className="text-[9px] font-mono text-teal-200 font-bold">
            Settlement
          </span>
        </div>

        {/* Holographic Digital Twin Coordinate Header Tag */}
        <div className="absolute -bottom-2 right-4 z-20 px-2.5 py-0.5 rounded-md bg-[#04192f]/90 border border-cyan-500/40 text-[9px] font-mono text-cyan-300/80 flex items-center gap-1.5 shadow-md pointer-events-none">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>3D DIGITAL TWIN · 27.89°N 93.42°E</span>
        </div>
      </div>
    </div>
  );
};
