import React, { useState, useEffect, useRef } from 'react';

interface AICopilotRobotProps {
  className?: string;
  size?: number;
}

export const AICopilotRobot: React.FC<AICopilotRobotProps> = ({
  className = '',
  size = 280
}) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Direct DOM references for 60 FPS transform updates without re-renders
  const containerRef = useRef<HTMLDivElement | null>(null);
  const robotWrapRef = useRef<HTMLDivElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const eyesRef = useRef<SVGGElement | null>(null);
  const torsoRef = useRef<SVGGElement | null>(null);
  const lightConeRef = useRef<HTMLDivElement | null>(null);

  // Mutable animation state
  const targetRef = useRef({ x: 0, y: 0, active: false });
  const currentRef = useRef({ x: 0, y: 0, eyeX: 0, eyeY: 0, time: 0 });

  // Periodic natural eye blink cycle (every ~4.2 seconds)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4200);

    return () => clearInterval(blinkInterval);
  }, []);

  // Strong, clearly visible cursor-following & 3D face turn loop
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isTouchOnly =
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: coarse)').matches &&
      !window.matchMedia('(hover: hover)').matches;

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion || isTouchOnly || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      // Center of the robot's head
      const headCenterX = rect.left + rect.width / 2;
      const headCenterY = rect.top + rect.height * 0.34;

      const dx = e.clientX - headCenterX;
      const dy = e.clientY - headCenterY;

      // Dynamic normalization so rotation reaches full expressive extent across the screen
      const maxRadiusX = Math.max(window.innerWidth * 0.42, 280);
      const maxRadiusY = Math.max(window.innerHeight * 0.42, 280);

      const normX = Math.max(-1, Math.min(1, dx / maxRadiusX));
      const normY = Math.max(-1, Math.min(1, dy / maxRadiusY));

      targetRef.current.x = normX;
      targetRef.current.y = normY;
      targetRef.current.active = true;
    };

    const handleMouseLeave = () => {
      // Smoothly return to neutral center when cursor leaves the window
      targetRef.current.x = 0;
      targetRef.current.y = 0;
      targetRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave);

    let animId: number;

    const animate = () => {
      const target = targetRef.current;
      const current = currentRef.current;

      if (prefersReducedMotion) {
        if (headRef.current) headRef.current.style.transform = 'none';
        if (eyesRef.current) eyesRef.current.style.transform = 'none';
        if (torsoRef.current) torsoRef.current.style.transform = 'none';
        return;
      }

      // Smooth responsive easing: snappy and organic without sluggishness
      const headLerp = 0.088;
      const eyeLerp = 0.13;

      current.x += (target.x - current.x) * headLerp;
      current.y += (target.y - current.y) * headLerp;

      current.eyeX += (target.x - current.eyeX) * eyeLerp;
      current.eyeY += (target.y - current.eyeY) * eyeLerp;

      current.time += 0.026;
      // Gentle floating hover (in place, without shifting across screen)
      const floatY = Math.sin(current.time) * 4.5;

      // ========================================================
      // 1. VISIBLE HEAD & FACE TURN (Strong ±25° horizontal, ±12° vertical)
      // ========================================================
      // When cursor is RIGHT (current.x > 0) -> head rotates RIGHT
      // When cursor is LEFT (current.x < 0) -> head rotates LEFT
      // When cursor is UP (current.y < 0) -> tilts UP (negative X pitch)
      // When cursor is DOWN (current.y > 0) -> tilts DOWN (positive X pitch)
      const headRotY = current.x * 25;       // ±25° clearly visible face turn
      const headRotX = -current.y * 12;      // ±12° pitch tilt
      const headTiltZ = current.x * 4;       // ±4° subtle organic head roll
      const headShiftX = current.x * 8.5;    // head physically slides slightly toward gaze
      const headShiftY = current.y * 5.5;

      if (headRef.current) {
        headRef.current.style.transform = `translate(${headShiftX}px, ${headShiftY}px) rotateY(${headRotY}deg) rotateX(${headRotX}deg) rotateZ(${headTiltZ}deg)`;
      }

      // ========================================================
      // 2. EYES GLANCE TRACKING (±13px horizontal, ±7.5px vertical)
      // ========================================================
      // Cyan eyes & pupils clearly follow direction inside visor
      const eyeShiftX = current.eyeX * 13;
      const eyeShiftY = current.eyeY * 7.5;

      if (eyesRef.current) {
        eyesRef.current.style.transform = `translate(${eyeShiftX}px, ${eyeShiftY}px)`;
      }

      // ========================================================
      // 3. UPPER BODY / TORSO ROTATION (±10° turn with cursor)
      // ========================================================
      // Robot upper body turns slightly in the direction of the gaze
      const torsoRotY = current.x * 10;
      const torsoRotX = -current.y * 5;
      const torsoShiftX = current.x * 4;

      if (torsoRef.current) {
        torsoRef.current.style.transform = `translate(${torsoShiftX}px, 0px) rotateY(${torsoRotY}deg) rotateX(${torsoRotX}deg)`;
      }

      // ========================================================
      // 4. FLOATING HOVER IN ORIGINAL FIXED POSITION
      // ========================================================
      if (robotWrapRef.current) {
        robotWrapRef.current.style.transform = `translate3d(0px, ${floatY}px, 0)`;
      }

      // 5. Subtle holographic light cone reactive sheen
      if (lightConeRef.current) {
        lightConeRef.current.style.transform = `scaleX(${1 + Math.abs(current.x) * 0.08}) translateX(${current.x * 5}px)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none pointer-events-none ${className}`}
      style={{
        width: size,
        height: size * 1.25,
        perspective: '750px',
        perspectiveOrigin: '50% 40%'
      }}
      aria-hidden="true"
    >
      {/* Ambient background volumetric glow behind robot */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-68 h-68 rounded-full bg-cyan-500/22 blur-[90px] pointer-events-none animate-pulse"
      />

      {/* Subtle secondary sky-blue AI aura */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full bg-sky-400/18 blur-[65px] pointer-events-none"
      />

      {/* ======================================================== */}
      {/* 3D VOLUMETRIC ROBOT BODY (HOVERS IN PLACE & TURNS)       */}
      {/* ======================================================== */}
      <div
        ref={robotWrapRef}
        className="relative z-10 w-full flex items-center justify-center will-change-transform"
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        <svg
          viewBox="0 0 240 280"
          className="w-full h-auto drop-shadow-[0_18px_36px_rgba(0,0,0,0.75)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            overflow: 'visible',
            transformStyle: 'preserve-3d'
          }}
        >
          <defs>
            {/* White High-Gloss Ceramic Body Shading */}
            <linearGradient id="robotWhite3D" x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#f8fafc" />
              <stop offset="60%" stopColor="#e2e8f0" />
              <stop offset="85%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Specular Rim Highlight */}
            <linearGradient id="specularRim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>

            {/* Dark Curved Glass Visor Gradient */}
            <linearGradient id="glassVisor3D" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="40%" stopColor="#020617" />
              <stop offset="80%" stopColor="#03162b" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>

            {/* Visor 3D Specular Sheen Arc */}
            <linearGradient id="visorArcSheen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Cyan Neon Glow Filter */}
            <filter id="cyanGlowEffect" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Soft Eye Glint Glow Filter */}
            <filter id="eyeGlintGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Chest Core Reactor Gradient */}
            <radialGradient id="reactorCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#38bdf8" />
              <stop offset="85%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#04192f" />
            </radialGradient>
          </defs>

          {/* ==================================================== */}
          {/* HEAD & FACE: TURNS CLEARLY TOWARDS CURSOR (±25° ROT) */}
          {/* ==================================================== */}
          <g
            ref={headRef}
            className="will-change-transform"
            style={{
              transformOrigin: '120px 80px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Outer Rounded Ceramic Head Shell */}
            <rect
              x="48"
              y="22"
              width="144"
              height="112"
              rx="54"
              fill="url(#robotWhite3D)"
              stroke="#38bdf8"
              strokeWidth="1.6"
            />
            {/* Specular head highlight */}
            <path
              d="M70 28 C95 24 145 24 170 28 C155 34 85 34 70 28 Z"
              fill="url(#specularRim)"
            />

            {/* Lateral Ear Audio/Sensor Nodes with Cyan Rings */}
            {/* Left Ear */}
            <g>
              <rect x="36" y="60" width="16" height="34" rx="8" fill="#64748b" stroke="#0284c7" strokeWidth="1.2" />
              <circle cx="44" cy="77" r="5" fill="#38bdf8" filter="url(#cyanGlowEffect)" />
            </g>
            {/* Right Ear */}
            <g>
              <rect x="188" y="60" width="16" height="34" rx="8" fill="#64748b" stroke="#0284c7" strokeWidth="1.2" />
              <circle cx="196" cy="77" r="5" fill="#38bdf8" filter="url(#cyanGlowEffect)" />
            </g>

            {/* Curved Glossy Dark Visor Screen */}
            <rect
              x="60"
              y="36"
              width="120"
              height="84"
              rx="42"
              fill="url(#glassVisor3D)"
              stroke="#0891b2"
              strokeWidth="1.5"
            />

            {/* Visor Specular Reflection Sheen */}
            <path
              d="M72 46 Q120 38 168 54 Q120 62 72 46 Z"
              fill="url(#visorArcSheen)"
            />

            {/* EYE SUB-SYSTEM: VISIBLY GLANCES IN CURSOR DIRECTION */}
            <g
              ref={eyesRef}
              className="will-change-transform"
              filter="url(#cyanGlowEffect)"
            >
              {/* Left Eye */}
              {isBlinking ? (
                <line x1="82" y1="78" x2="106" y2="78" stroke="#00D9FF" strokeWidth="4" strokeLinecap="round" />
              ) : (
                <g>
                  <path
                    d="M82 82 C85 64 103 64 106 82"
                    stroke="#00D9FF"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Directional pupil highlight */}
                  <circle cx="94" cy="73" r="2.4" fill="#FFFFFF" filter="url(#eyeGlintGlow)" />
                </g>
              )}

              {/* Right Eye */}
              {isBlinking ? (
                <line x1="134" y1="78" x2="158" y2="78" stroke="#00D9FF" strokeWidth="4" strokeLinecap="round" />
              ) : (
                <g>
                  <path
                    d="M134 82 C137 64 155 64 158 82"
                    stroke="#00D9FF"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Directional pupil highlight */}
                  <circle cx="146" cy="73" r="2.4" fill="#FFFFFF" filter="url(#eyeGlintGlow)" />
                </g>
              )}
            </g>

            {/* Friendly Digital Smile Status Curve */}
            <path
              d="M110 98 Q120 104 130 98"
              stroke="#00D9FF"
              strokeWidth="2.2"
              strokeLinecap="round"
              filter="url(#cyanGlowEffect)"
            />
          </g>

          {/* NECK LINKAGE */}
          <rect x="104" y="138" width="32" height="10" rx="5" fill="#475569" stroke="#0f172a" strokeWidth="1" />
          <circle cx="120" cy="143" r="3" fill="#00D9FF" />

          {/* ==================================================== */}
          {/* BODY / TORSO: SUBTLY TURNS WITH HEAD TOWARDS CURSOR */}
          {/* ==================================================== */}
          <g
            ref={torsoRef}
            className="will-change-transform"
            style={{
              transformOrigin: '120px 200px',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* White Glossy Torso Shell */}
            <path
              d="M66 142 C66 142 52 185 60 225 C64 240 84 248 120 248 C156 248 176 240 180 225 C188 185 174 142 174 142 C164 136 142 134 120 134 C98 134 76 136 66 142 Z"
              fill="url(#robotWhite3D)"
              stroke="#0284c7"
              strokeWidth="1.6"
            />

            {/* Torso Top Specular Rim */}
            <path
              d="M78 144 C100 138 140 138 162 144 C150 148 90 148 78 144 Z"
              fill="url(#specularRim)"
            />

            {/* Chest Core Reactor Panel (BHUSAKTHI Ribbon Emblem) */}
            <circle cx="120" cy="188" r="24" fill="#04192f" stroke="#00D9FF" strokeWidth="2.2" />
            <circle cx="120" cy="188" r="18" fill="url(#reactorCore)" />
            {/* Stylized Interlocking Ribbon Mountain Peak inside Chest */}
            <path
              d="M112 196 C110 188 116 178 120 176 C124 178 130 188 128 196 C124 199 119 198 120 192"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#cyanGlowEffect)"
            />

            {/* Sleek Floating Articulated Robotic Arms */}
            {/* Left Arm (Relaxed downward) */}
            <path
              d="M56 152 C46 172 40 205 52 220 C56 225 63 220 63 210 C58 195 62 172 66 158 Z"
              fill="url(#robotWhite3D)"
              stroke="#0284c7"
              strokeWidth="1.3"
            />
            <circle cx="48" cy="218" r="6.5" fill="#04192f" stroke="#00D9FF" strokeWidth="1.2" />
            <circle cx="48" cy="218" r="3" fill="#00D9FF" filter="url(#cyanGlowEffect)" />

            {/* Right Arm (Gesturing Welcomingly toward the 3D Holographic Map) */}
            <path
              d="M184 152 C196 168 206 188 202 205 C198 215 188 212 186 202 C189 188 182 170 174 158 Z"
              fill="url(#robotWhite3D)"
              stroke="#0284c7"
              strokeWidth="1.3"
            />
            <circle cx="202" cy="202" r="6.5" fill="#04192f" stroke="#00D9FF" strokeWidth="1.2" />
            <circle cx="202" cy="202" r="3" fill="#00D9FF" filter="url(#cyanGlowEffect)" />
          </g>
        </svg>
      </div>

      {/* ======================================================== */}
      {/* GLOWING CIRCULAR HOLOGRAPHIC PLATFORM UNDER ROBOT        */}
      {/* ======================================================== */}
      <div className="relative -mt-6 w-60 flex flex-col items-center justify-center">
        {/* Holographic light cone projection beam */}
        <div
          ref={lightConeRef}
          className="w-48 h-18 bg-gradient-to-t from-cyan-400/40 via-cyan-400/12 to-transparent blur-md -mb-9 will-change-transform"
          style={{ clipPath: 'polygon(15% 100%, 85% 100%, 100% 0, 0 0)' }}
        />

        {/* Concentric rotating holographic disc rings */}
        <div className="relative w-52 h-14 flex items-center justify-center">
          {/* Outer glowing cyan perimeter ring */}
          <div className="absolute inset-0 rounded-[50%] border-2 border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.9)] animate-spin-slow" />

          {/* Middle dashed technical ring */}
          <div className="absolute inset-2.5 rounded-[50%] border border-dashed border-cyan-300/90 animate-reverse-spin" />

          {/* Inner core energy disc */}
          <div className="absolute inset-5 rounded-[50%] bg-gradient-to-r from-cyan-400/50 via-teal-300/60 to-blue-500/50 blur-[2px]" />

          {/* Center pinpoint emitter */}
          <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_14px_#38bdf8]" />
        </div>
      </div>
    </div>
  );
};

export const CopilotVisual = AICopilotRobot;
