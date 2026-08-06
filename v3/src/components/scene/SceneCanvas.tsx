"use client";

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ContactShadows } from "@react-three/drei";
import { CAMERA_CONFIG, type Palette } from "../../config/sceneConfig";
import { useScenePalette, usePrefersReducedMotion, useWebGLSupport } from "../../hooks/useScenePalette";
import { emitSceneEvent, subscribeSceneEvents } from "../../lib/sceneEvents";
import { SceneObjects } from "./objects";
import { OfficeRoom } from "./Room";
import { CameraRig } from "./CameraRig";

/** Lighting sinematik: AmbientLight 0.035 (0.02-0.05 range), Exposure 0.70 (0.65-0.75 range),
 *  Bayangan pekat #0B0C10 (80% ruangan berada dalam kegelapan). */
function SceneLights({ lampOn }: { lampOn: boolean }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const cyanRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const purpleRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 3.5);
    const step = (
      ref: { current: { intensity: number } | null },
      dimmed: number,
      normal: number
    ) => {
      if (!ref.current) return;
      const target = lampOn ? dimmed : normal;
      if (Math.abs(ref.current.intensity - target) > 0.0001) {
        ref.current.intensity = THREE.MathUtils.lerp(ref.current.intensity, target, k);
      }
    };

    // Zero ambient light — 100% direct light from monitor, desk lamp & moonlight
    step(ambientRef, 0.0, 0.0);
    step(keyRef, 0.01, 0.035);
    step(rimRef, 0.008, 0.025);
    step(cyanRef, 0.003, 0.012);
    step(fillRef, 0.003, 0.01);
    step(purpleRef, 0.003, 0.01);
    step(hemiRef, 0.001, 0.004);
  });

  return (
    <>
      {/* Zero AmbientLight */}
      <ambientLight ref={ambientRef} intensity={0} color="#000000" />
      {/* Weak moonlight silhouette key light */}
      <directionalLight
        ref={keyRef}
        position={[7, 9, 4]}
        intensity={0.035}
        color="#4A8DFF"
      />
      {/* Subtle cool rim light */}
      <directionalLight ref={rimRef} position={[-7, 3.5, -5]} intensity={0.025} color="#4A8DFF" />
      <directionalLight ref={cyanRef} position={[0, 2, -6]} intensity={0.012} color="#4A8DFF" />
      <directionalLight ref={fillRef} position={[2.5, 5, 8]} intensity={0.01} color="#334155" />
      <directionalLight ref={purpleRef} position={[-3, 4, 7]} intensity={0.01} color="#6366f1" />
      {/* Dark blue sky (#081026) and almost black ground (#020305) */}
      <hemisphereLight ref={hemiRef} intensity={0.008} color="#081026" groundColor="#020305" />
    </>
  );
}



function DynamicFog({ lampOn }: { lampOn: boolean }) {
  const fogRef = useRef<THREE.FogExp2>(null);
  useFrame((_, delta) => {
    if (!fogRef.current) return;
    const k = Math.min(1, delta * 3.5);
    const targetDensity = lampOn ? 0.088 : 0.045;
    fogRef.current.density = THREE.MathUtils.lerp(fogRef.current.density, targetDensity, k);
  });
  return <fogExp2 ref={fogRef} attach="fog" args={[lampOn ? "#000000" : "#020305", 0.045]} />;
}

/** R3F Frame Tracker — menghitung FPS & MS di dalam Canvas tanpa merender HTML */
function FPSTracker({
  fpsRef,
  msRef,
  dotRef,
}: {
  fpsRef: React.RefObject<HTMLSpanElement | null>;
  msRef: React.RefObject<HTMLSpanElement | null>;
  dotRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const frameCount = useRef(0);
  const lastTime = useRef(0);

  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (lastTime.current === 0) {
      lastTime.current = now;
      return;
    }
    const delta = now - lastTime.current;
    if (delta >= 300) {
      const fps = Math.round((frameCount.current * 1000) / delta);
      const ms = Number((delta / frameCount.current).toFixed(1));
      frameCount.current = 0;
      lastTime.current = now;

      if (fpsRef.current) fpsRef.current.textContent = `${fps} FPS`;
      if (msRef.current) msRef.current.textContent = `${ms} ms`;
      if (dotRef.current) {
        dotRef.current.className = `inline-block size-2 rounded-full shadow-[0_0_8px] transition-colors duration-300 ${
          fps >= 55
            ? "bg-emerald-400 shadow-emerald-400/90"
            : fps >= 30
            ? "bg-yellow-400 shadow-yellow-400/90"
            : "bg-red-500 shadow-red-500/90"
        }`;
      }
    }
  });

  return null;
}

const DESKTOP_DPR: [number, number] = [1, 1.0];

function SceneInner({
  focusId,
  isMobile,
  lampOn,
  fpsRef,
  msRef,
  dotRef,
}: {
  focusId: string | null;
  isMobile: boolean;
  lampOn: boolean;
  fpsRef: React.RefObject<HTMLSpanElement | null>;
  msRef: React.RefObject<HTMLSpanElement | null>;
  dotRef: React.RefObject<HTMLSpanElement | null>;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const palette = useScenePalette();
  const bootEmitted = useRef(false);

  // Emit boot-done setelah frame pertama dirender
  useEffect(() => {
    if (reducedMotion) {
      emitSceneEvent({ type: "boot-done" });
    }
  }, [reducedMotion]);

  return (
    <Canvas
      dpr={isMobile ? 1 : 0.8}
      frameloop="always"
      onCreated={({ gl }) => {
        gl.outputColorSpace = THREE.SRGBColorSpace;
        if (!bootEmitted.current) {
          bootEmitted.current = true;
          emitSceneEvent({ type: "boot-done" });
        }
      }}
      camera={{ position: [5.2, 3.3, 5.9], fov: CAMERA_CONFIG.fov, near: 0.1, far: 60 }}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.NoToneMapping,
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <FPSTracker fpsRef={fpsRef} msRef={msRef} dotRef={dotRef} />
      <SceneLights lampOn={lampOn} />

      {/* Fog atmosferik teranimasi dinamis — tebal & pekat saat lampu menyala */}
      <DynamicFog lampOn={lampOn} />

      <OfficeRoom mobile={isMobile} lampOn={lampOn} />

      <SceneObjects palette={palette} reducedMotion={reducedMotion} />

      {/* Unified Floor Contact Shadows — High efficiency static bake pass (frames=1) */}
      <ContactShadows
        position={[0, 0.01, 0.2]}
        opacity={0.88}
        scale={9.5}
        blur={1.6}
        far={4.5}
        resolution={256}
        color="#0B0C10"
        frames={1}
      />

      <CameraRig focusId={focusId} reducedMotion={reducedMotion} />
    </Canvas>
  );
}

interface SceneCanvasProps {
  focusId: string | null;
}

export default function SceneCanvas({ focusId }: SceneCanvasProps) {
  const webglOk = useWebGLSupport();
  const [isMobile, setIsMobile] = useState(false);
  const [lampOn, setLampOn] = useState(false);

  const fpsTextRef = useRef<HTMLSpanElement>(null);
  const msTextRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    return subscribeSceneEvents((event) => {
      if (event.type === "lamp-change") setLampOn(event.on);
    });
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 767px)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Skip SSR/hydration: hanya render Canvas setelah mount di client
  const mounted = useSyncExternalStore(
    (onStoreChange) => {
      const id = setTimeout(onStoreChange, 0);
      return () => clearTimeout(id);
    },
    () => true,
    () => false
  );

  if (!mounted || !webglOk) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#09090b]">
      <SceneInner
        focusId={focusId}
        isMobile={isMobile}
        lampOn={lampOn}
        fpsRef={fpsTextRef}
        msRef={msTextRef}
        dotRef={dotRef}
      />
      {/* Vignette dark mode — saat lampu nyala, fokus visual mengerucut ke area meja */}
      <div
        className={`pointer-events-none fixed inset-0 z-[5] transition-opacity duration-700 ${
          lampOn ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 70% 62% at 50% 56%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* ============ HUD FPS COUNTER HTML OVERLAY (DILUAR R3F CANVAS) ============ */}
      <div className="pointer-events-none fixed bottom-5 right-6 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-1.5 backdrop-blur-md shadow-lg shadow-black/40">
        <span
          ref={dotRef}
          className="inline-block size-2 rounded-full bg-emerald-400 shadow-[0_0_8px] shadow-emerald-400/90"
        />
        <span
          ref={fpsTextRef}
          className="font-mono text-xs font-semibold tracking-tight text-white/90"
        >
          -- FPS
        </span>
        <span className="font-mono text-[10px] text-white/30">|</span>
        <span
          ref={msTextRef}
          className="font-mono text-[11px] font-medium text-white/60"
        >
          -- ms
        </span>
      </div>
    </div>
  );
}
