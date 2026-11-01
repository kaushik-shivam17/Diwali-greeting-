import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Flame, Volume2 } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface FireworkRocket {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  palette: string[];
  trail: { x: number; y: number }[];
}

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  shimmer: boolean;
}

const FESTIVE_PALETTES: string[][] = [
  ['#fde68a', '#fbbf24', '#f59e0b', '#fffbeb'], // Royal Metallic Gold
  ['#fb7185', '#e11d48', '#f43f5e', '#fde047'], // Ruby Red & Kundan Gold
  ['#fdba74', '#f97316', '#ea580c', '#fef08a'], // Saffron Marigold & Amber
  ['#d8b4fe', '#a855f7', '#ec4899', '#fde68a'], // Royal Purple & Magenta Gold
];

interface FireworksCanvasProps {
  externalBurstSignal?: number;
}

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({
  externalBurstSignal = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [burstCount, setBurstCount] = useState(12);
  const [autoLaunch, setAutoLaunch] = useState(true);
  const autoLaunchRef = useRef(true);
  const launchFnRef = useRef<((targetX?: number, targetY?: number, immediate?: boolean) => void) | null>(null);

  useEffect(() => {
    autoLaunchRef.current = autoLaunch;
  }, [autoLaunch]);

  useEffect(() => {
    if (externalBurstSignal > 0 && launchFnRef.current) {
      launchFnRef.current(undefined, undefined, true);
      launchFnRef.current(undefined, undefined, true);
    }
  }, [externalBurstSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 520;
    };
    window.addEventListener('resize', handleResize);

    const rockets: FireworkRocket[] = [];
    const sparks: FireworkSpark[] = [];

    const explodeAt = (x: number, y: number, palette: string[]) => {
      const isMobile = width < 640;
      const count = prefersReducedMotion ? 24 : isMobile ? 48 : 76;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.12;
        const speed = 1.4 + Math.random() * 4.8;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.012 + Math.random() * 0.014,
          color: palette[Math.floor(Math.random() * palette.length)],
          size: 1.6 + Math.random() * 2.2,
          shimmer: Math.random() > 0.45,
        });
      }
      // Inner golden willow core
      for (let j = 0; j < 18; j++) {
        const angle = (Math.PI * 2 * j) / 18;
        const speed = 0.7 + Math.random() * 1.6;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: 0.016,
          color: '#fffbeb',
          size: 2.2,
          shimmer: true,
        });
      }
    };

    const launchFirework = (targetX?: number, targetY?: number, immediate = false) => {
      const tx = targetX ?? width * (0.18 + Math.random() * 0.64);
      const ty = targetY ?? height * (0.16 + Math.random() * 0.42);
      const palette = FESTIVE_PALETTES[Math.floor(Math.random() * FESTIVE_PALETTES.length)];

      if (immediate || prefersReducedMotion) {
        explodeAt(tx, ty, palette);
        return;
      }

      const startX = width * (0.3 + Math.random() * 0.4);
      const startY = height;
      const dx = tx - startX;
      const dy = ty - startY;
      const steps = 28;
      rockets.push({
        x: startX,
        y: startY,
        targetX: tx,
        targetY: ty,
        vx: dx / steps,
        vy: dy / steps,
        palette,
        trail: [],
      });
    };

    launchFnRef.current = launchFirework;

    // Seed initial celebratory bursts so the canvas looks vibrant immediately
    explodeAt(width * 0.28, height * 0.32, FESTIVE_PALETTES[0]);
    explodeAt(width * 0.72, height * 0.26, FESTIVE_PALETTES[1]);
    explodeAt(width * 0.5, height * 0.22, FESTIVE_PALETTES[2]);

    let frameId = 0;
    let lastAutoLaunch = performance.now();

    const render = (now: number) => {
      ctx.fillStyle = 'rgba(10, 4, 20, 0.22)';
      ctx.fillRect(0, 0, width, height);

      if (autoLaunchRef.current && now - lastAutoLaunch > (prefersReducedMotion ? 2600 : 1250)) {
        launchFirework();
        lastAutoLaunch = now;
      }

      // Update rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 6) r.trail.shift();

        r.x += r.vx;
        r.y += r.vy;

        // Draw golden ascending comet trail
        ctx.beginPath();
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          if (t === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 2;
        ctx.stroke();

        const dist = Math.hypot(r.targetX - r.x, r.targetY - r.y);
        if (dist < 14 || r.y <= r.targetY) {
          explodeAt(r.x, r.y, r.palette);
          rockets.splice(i, 1);
        }
      }

      // Update sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.965;
        s.vy = s.vy * 0.965 + 0.042; // Gentle gravity
        s.alpha -= s.decay;

        if (s.alpha <= 0.02) {
          sparks.splice(i, 1);
          continue;
        }

        const flicker = s.shimmer ? 0.65 + Math.random() * 0.35 : 1;
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha * flicker);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (launchFnRef.current) {
      launchFnRef.current(x, y, true);
      soundEngine.playFireworkSparkle();
      setBurstCount((c) => c + 1);
    }
  };

  const triggerGrandSalvo = () => {
    if (!launchFnRef.current) return;
    for (let i = 0; i < 4; i++) {
      window.setTimeout(() => {
        launchFnRef.current?.(undefined, undefined, true);
        soundEngine.playFireworkSparkle();
      }, i * 140);
    }
    setBurstCount((c) => c + 4);
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden gold-border-glow bg-[#090314]">
      <canvas
        ref={canvasRef}
        data-testid="fireworks-canvas"
        onPointerDown={handleCanvasPointerDown}
        aria-label="इंटरएक्टिव दीपावली आतिशबाजी कैनवास — आतिशबाजी चलाने के लिए कहीं भी टैप या क्लिक करें"
        className="w-full h-[380px] sm:h-[460px] block cursor-crosshair touch-manipulation"
      />

      {/* Interactive overlay header & controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-4 sm:p-6 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-[#07030d]/90 via-[#07030d]/40 to-transparent">
        <div>
          <p className="text-xs font-medium tracking-wider text-amber-300/90">
            आकाश में उत्सव · टैप या क्लिक करें
          </p>
          <h3 className="text-lg sm:text-xl font-hindi-display text-amber-100">
            स्वर्णिम आतिशबाजी महोत्सव
          </h3>
        </div>

        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            type="button"
            onClick={triggerGrandSalvo}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-orange-600 text-[#090314] hover:from-amber-400 hover:to-orange-500 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>मaha आतिशबाजी चलाएँ ({burstCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoLaunch((prev) => !prev)}
            aria-pressed={autoLaunch}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border border-amber-400/35 bg-[#120726]/90 text-amber-200 hover:border-amber-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{autoLaunch ? 'स्वचालित: चालू' : 'स्वचालित: बंद'}</span>
          </button>
        </div>
      </div>

      {/* Bottom instructional hint */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-4">
        <p className="text-xs text-amber-200/80 bg-[#0b0418]/85 px-4 py-1.5 rounded-md border border-amber-500/20">
          आकाश में कहीं भी स्पर्श (Tap/Click) करके सतरंगी पटाखे और फुलझड़ियाँ जलाएँ
        </p>
      </div>
    </div>
  );
};
