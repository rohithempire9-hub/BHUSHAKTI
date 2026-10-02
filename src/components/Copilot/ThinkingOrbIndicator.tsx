import React, { useEffect, useRef, useState } from 'react';
import { ThinkingOrb } from 'thinking-orbs';

interface ThinkingOrbIndicatorProps {
  label?: string;
  size?: number;
  className?: string;
}

export const ThinkingOrbIndicator: React.FC<ThinkingOrbIndicatorProps> = ({
  label = 'Thinking....',
  size = 48,
  className = ''
}) => {
  const [orbError, setOrbError] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High performance Canvas 3D Dotted Globe fallback in case of canvas context issue
  useEffect(() => {
    if (!orbError) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    const dotsCount = 180;
    const dots: Array<{ phi: number; theta: number }> = [];

    // Generate fibonacci spiral points on sphere
    for (let i = 0; i < dotsCount; i++) {
      const y = 1 - (i / (dotsCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = 2.399963 * i; // golden angle
      dots.push({ phi: y, theta });
    }

    const render = () => {
      angle += 0.035;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = canvas.width * 0.38;

      dots.forEach((dot, idx) => {
        // Rotate around Y and slight tilt
        const currentTheta = dot.theta + angle;
        const x3d = r * Math.sqrt(1 - dot.phi * dot.phi) * Math.cos(currentTheta);
        const y3d = r * dot.phi;
        const z3d = r * Math.sqrt(1 - dot.phi * dot.phi) * Math.sin(currentTheta);

        // Perspective projection
        const fov = 150;
        const scale = fov / (fov + z3d);
        const x2d = cx + x3d * scale;
        const y2d = cy + (y3d * 0.9 - z3d * 0.25) * scale;
        const alpha = Math.max(0.12, (z3d + r) / (2 * r));

        // Wave deformation
        const wave = Math.sin(dot.phi * 4 + angle * 2) * 1.5;

        ctx.beginPath();
        ctx.arc(x2d, y2d + wave, Math.max(0.6, 1.3 * scale), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${alpha.toFixed(2)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [orbError]);

  return (
    <div
      className={`inline-flex items-center gap-3.5 px-4 py-2 rounded-full bg-[#16171a]/95 border border-white/10 text-white shadow-xl backdrop-blur-md select-none transition-all ${className}`}
      role="status"
      aria-label="BHUSAKTHI Copilot is thinking"
    >
      <div className="relative flex items-center justify-center shrink-0 w-9 h-9 overflow-hidden rounded-full">
        {!orbError ? (
          <div
            className="flex items-center justify-center scale-90 transition-transform"
            onError={() => setOrbError(true)}
          >
            <ThinkingOrb state="working" size={size as any} />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={72}
            height={72}
            className="w-9 h-9 rounded-full object-contain"
          />
        )}
      </div>

      <span className="text-sm font-medium tracking-wide text-slate-200 pr-1 animate-pulse">
        {label}
      </span>
    </div>
  );
};
