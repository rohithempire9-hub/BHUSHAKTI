import React, { useState, useEffect, useRef } from 'react';
import { BrandHeader } from './BrandHeader';
import { LanguageSelector, AuthLanguage } from './LanguageSelector';
import { FeatureList } from './FeatureList';
import { CopilotVisual } from './AICopilotRobot';
import { TerrainVisualization } from './TerrainVisualization';
import { FloatingDataCards } from './FloatingDataCards';
import { BottomFeatureCards } from './BottomFeatureCards';
import { LoginPanel } from './LoginPanel';

interface BhuShaktiAuthPageProps {
  onSuccess?: () => void;
}

const MOTTO_TRANSLATIONS: Record<AuthLanguage, { title: string; subtitle: string; headerTagline: string }> = {
  en: {
    title: 'Smarter Technology.',
    subtitle: 'Stronger Communities.',
    headerTagline: 'Real-time insights. Safer communities. A resilient tomorrow.'
  },
  te: {
    title: 'స్మార్ట్ టెక్నాలజీ.',
    subtitle: 'బలమైన సమాజాలు.',
    headerTagline: 'నిజ-సమయ అంతర్దృష్టులు. సురక్షిత సమాజాలు. స్థితిస్థాపక రేపు.'
  },
  hi: {
    title: 'स्मार्ट तकनीक।',
    subtitle: 'सशक्त समुदाय।',
    headerTagline: 'वास्तविक समय की अंतर्दृष्टि। सुरक्षित समुदाय। लचीला कल।'
  },
  as: {
    title: 'উন্নত প্ৰযুক্তি।',
    subtitle: 'শক্তিশালী সমাজ।',
    headerTagline: 'বাস্তৱ সময়ৰ অন্তৰ্দৃষ্টি। নিৰাপদ সমাজ। এখন সক্ষম ভৱিষ্যত।'
  }
};

export const BhuShaktiAuthPage: React.FC<BhuShaktiAuthPageProps> = ({ onSuccess }) => {
  const [currentLang, setCurrentLang] = useState<AuthLanguage>('en');
  const rainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subtle natural rainfall particle simulation for disaster realism
  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize);

    const dropsCount = 32;
    const drops = Array.from({ length: dropsCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 12 + Math.random() * 16,
      speed: 3.5 + Math.random() * 3.5,
      opacity: 0.15 + Math.random() * 0.18
    }));

    const renderRain = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1.2;

      drops.forEach((d) => {
        d.y += d.speed;
        d.x -= d.speed * 0.15;

        if (d.y > height) {
          d.y = -20;
          d.x = Math.random() * (width + 60);
        }

        ctx.strokeStyle = `rgba(56, 189, 248, ${d.opacity})`;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 2, d.y + d.length);
        ctx.stroke();
      });

      animId = requestAnimationFrame(renderRain);
    };

    renderRain();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const motto = MOTTO_TRANSLATIONS[currentLang] || MOTTO_TRANSLATIONS.en;

  return (
    <div className="relative w-screen h-screen overflow-x-hidden lg:overflow-hidden bg-[#041a33] text-slate-100 flex flex-col justify-between font-sans select-none">
      
      {/* ======================================================== */}
      {/* 1. CINEMATIC REALISTIC HIMALAYAN MOUNTAIN LANDSCAPE      */}
      {/* (HIGH-RESOLUTION PHOTOGRAPHY WITH SUBTLE BLUE OVERLAY)   */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Photorealistic High-Resolution Himalayan Mountain Landscape */}
        <img
          src="/images/himalayan_mountain_landscape.jpg"
          alt="Himalayan Mountain Landscape"
          loading="eager"
          decoding="async"
          onError={(e) => {
            // Fallback to secondary local image or CDN if needed
            const target = e.currentTarget;
            if (target.src.indexOf('himalayan_valley_landscape') === -1) {
              target.src = '/images/himalayan_valley_landscape.jpg';
            } else {
              target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85';
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-center scale-[1.02] filter brightness-95 contrast-[1.05] saturate-[1.1] transition-transform duration-1000"
        />

        {/* Subtle Cinematic Blue Overlay for Contrast & Text Readability */}
        <div className="absolute inset-0 bg-[#061e3d]/35 mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-[#031528]/25 pointer-events-none" />

        {/* Directional Soft Vignette Gradients (Darker at edges/bottom for reading text, transparent over mountains) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020b18]/85 via-transparent to-[#031326]/40 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020b18]/60 via-transparent to-[#020b18]/55 pointer-events-none" />

        {/* Atmospheric Sunlight & Cyan Depth Accents */}
        <div className="absolute top-1/6 left-1/4 w-[500px] h-[350px] rounded-full bg-cyan-400/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[400px] rounded-full bg-sky-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[250px] rounded-full bg-blue-900/20 blur-[100px] pointer-events-none" />

        {/* Subtle Natural Animated Rainfall Canvas */}
        <canvas ref={rainCanvasRef} className="absolute inset-0 pointer-events-none" />

        {/* ======================================================== */}
        {/* OBSERVATION DECK ARCHITECTURAL FRAMING (FROM REFERENCE)  */}
        {/* ======================================================== */}
        {/* 1. Curved Metallic Observation Facility Overhead Canopy (Top-Left) */}
        <div className="hidden lg:block absolute -top-10 -left-12 w-[720px] h-[220px] rounded-br-[360px] bg-gradient-to-b from-[#020914] via-[#031326] to-[#04192f]/60 border-b border-r border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] pointer-events-none z-10">
          <div className="absolute bottom-2 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </div>

        {/* 2. Curved Balcony Terrace Railing Ledge (Bottom) */}
        <div className="absolute -bottom-6 inset-x-0 h-40 bg-gradient-to-t from-[#010712] via-[#031427]/90 to-transparent border-t border-cyan-400/35 pointer-events-none z-10">
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          {/* Subtle metallic deck seams */}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(6,182,212,0.06)_50%,transparent_100%)]" />
        </div>

        {/* 3. Lush Green Foliage on Bottom-Right Terrace Margin */}
        <div className="hidden lg:block absolute -bottom-8 -right-4 w-72 h-72 pointer-events-none z-20 opacity-85">
          <svg viewBox="0 0 200 200" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
            <path d="M120 200 Q150 140 180 120 Q190 150 170 180 Z" fill="#14532d" opacity="0.9" />
            <path d="M100 200 Q130 130 160 90 Q175 120 150 160 Z" fill="#166534" opacity="0.95" />
            <path d="M140 200 Q160 150 200 130 Q210 160 190 190 Z" fill="#15803d" opacity="0.85" />
            <path d="M110 200 Q120 140 140 100 Q155 130 135 170 Z" fill="#22c55e" opacity="0.75" />
            <path d="M160 200 Q170 160 195 145 Q200 170 185 195 Z" fill="#4ade80" opacity="0.65" />
          </svg>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TOP APP BAR: BRANDING (LEFT) & LANGUAGE SELECTOR (RIGHT) */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full max-w-[1720px] mx-auto px-6 sm:px-12 pt-5 sm:pt-7 flex items-start justify-between">
        {/* Top-Left Branding */}
        <BrandHeader taglineLang={motto.headerTagline} />

        {/* Top-Right Language Selector */}
        <LanguageSelector
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          className="shrink-0 pt-2"
        />
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN CENTER STAGE: LEFT FEATURES, CENTER ROBOT/TERRAIN, RIGHT LOGIN */}
      {/* ======================================================== */}
      <div className="relative z-20 flex-1 max-w-[1720px] w-full mx-auto px-6 sm:px-12 py-2 lg:py-0 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6 items-center h-full">

          {/* LEFT COLUMN: FEATURE NAVIGATION (lg:col-span-2) */}
          <div className="lg:col-span-2 xl:col-span-3 flex flex-col justify-center space-y-6 z-20 pt-2">
            {/* Feature List (Monitor, Analyze, Plan, Respond, Simulate) */}
            <FeatureList language={currentLang} />
          </div>

          {/* CENTER HERO: ROBOT (LEFT) + REALISTIC 3D TERRAIN DIGITAL TWIN WITH SENSOR CARDS (RIGHT) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-5 items-center justify-center relative z-10 -ml-2">
            {/* 1. 3D AI Robot Assistant (Gesturing towards Terrain) */}
            <div className="relative shrink-0 -mr-10 z-20">
              <CopilotVisual size={260} />
            </div>

            {/* 2. Realistic 3D Digital Twin with Sensor Cards Floating Above */}
            <div className="flex flex-col items-center relative z-10">
              {/* Floating Metric Data Cards directly above terrain */}
              <div className="mb-2 z-20">
                <FloatingDataCards />
              </div>

              {/* Realistic 3D Holographic Digital Twin Terrain */}
              <div className="relative">
                <TerrainVisualization />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: LOGIN PANEL (lg:col-span-4) */}
          <div className="lg:col-span-4 xl:col-span-4 flex justify-center lg:justify-end z-30">
            <LoginPanel onSuccess={onSuccess} />
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. BOTTOM BAR: MOTTO (LEFT) + 4 PREVIEW CARDS (CENTER)   */}
      {/* ======================================================== */}
      <div className="relative z-30 w-full max-w-[1720px] mx-auto px-6 sm:px-12 pb-4 sm:pb-6 pt-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {/* Bottom-Left Motto */}
          <div className="lg:col-span-3">
            <div className="flex flex-col space-y-1.5 select-none">
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight font-sans drop-shadow">
                Smarter Technology. <br />
                <span className="text-[#00D9FF]">Stronger Communities.</span>
              </h3>
              {/* Cyan Accent Bar from reference */}
              <div className="w-28 h-1 rounded-full bg-gradient-to-r from-[#00D9FF] to-transparent shadow-[0_0_8px_#00D9FF]" />
            </div>
          </div>

          {/* Center Bottom 4 Feature Cards */}
          <div className="lg:col-span-5">
            <BottomFeatureCards />
          </div>

          {/* Right Spacer matching Login Panel width */}
          <div className="hidden lg:block lg:col-span-4" />
        </div>
      </div>

    </div>
  );
};
