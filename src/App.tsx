"use client";

import { useEffect, useRef, useState } from "react";
import PhotonicCenotaph from "./components/PhotonicCenotaph";
import ScrollContent from "./components/ScrollContent";

// ─── Particle Canvas Background (Stars & Connections) ─────────────────────────
function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let W = (c.width = window.innerWidth);
    let H = (c.height = window.innerHeight);

    const STAR_COUNT = 100;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.1 + 0.2,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.5 + 0.15,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach((s) => {
        s.x = (s.x + s.vx + W) % W;
        s.y = (s.y + s.vy + H) % H;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,180,220,${s.alpha})`;
        ctx.fill();
      });

      // Draw connecting lines between nearby stars
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(255, 0, 51, ${0.05 * (1 - d / 110)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = c.width = window.innerWidth;
      H = c.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2,
        pointerEvents: "none",
        opacity: 0.45,
      }}
    />
  );
}

// ─── Digital Noise Overlay (Analog Grain) ─────────────────────────────────────
function NoiseOverlay() {
  const [src, setSrc] = useState("");
  useEffect(() => {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const d = ctx.createImageData(256, 256);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = Math.floor(Math.random() * 255);
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 16; // soft opacity
    }
    ctx.putImageData(d, 0, 0);
    setSrc(c.toDataURL());
  }, []);

  if (!src) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
        backgroundImage: `url(${src})`,
        backgroundRepeat: "repeat",
        opacity: 0.35,
        mixBlendMode: "overlay",
      }}
    />
  );
}

export default function App() {
  const scrollProgress = useRef(0);
  const [emissionIntensity, setEmissionIntensity] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#08080c",
        color: "#e8e8f0",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      {/* ── Immersive Interactive Overlays ── */}
      <ParticleField />
      <NoiseOverlay />

      {/* Radial red ambient glow behind the artifact */}
      <div
        style={{
          position: "fixed",
          right: "12%",
          top: "15%",
          width: "550px",
          height: "550px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,18,40,0.08) 0%, rgba(255,18,40,0.02) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 1,
          animation: "ambientPulse 4s ease-in-out infinite",
        }}
      />

      {/* Vignette edges */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 4,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* ── Fixed Fullscreen 3D Background Canvas (Vanilla Three.js) ── */}
      <div className="canvas-container" style={{ zIndex: 5 }}>
        <PhotonicCenotaph
          scrollProgress={scrollProgress}
          emissionIntensity={emissionIntensity}
        />
      </div>

      {/* ── Overlay Scrollytelling Panels ── */}
      <ScrollContent
        scrollProgress={scrollProgress}
        setEmissionIntensity={setEmissionIntensity}
      />

      {/* ── Industrial Standby Status Bar (Bottom) ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(8,8,12,0.92)",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          padding: "11px 4%",
          gap: "24px",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.12em",
          color: "#444455",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: emissionIntensity > 0.1 ? "#ff0022" : "#0044ff", animation: "glowPulse 1.8s infinite" }}>●</span>
          {emissionIntensity > 0.1 ? "STASIS PROTOCOL ACTIVE" : "SYSTEM STANDBY / SECURE"}
        </span>
        <span>S/N: MSG3C-2066-8734-X9</span>
        <span style={{ marginLeft: "auto" }}>
          MOLECULAR CRYPTO-MATRIX · TYPE: INDUSTRIAL GRADE SECURE
        </span>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes ambientPulse {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
