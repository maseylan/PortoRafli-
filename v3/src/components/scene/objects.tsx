"use client";

import React, { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, useCursor } from "@react-three/drei";
import * as THREE from "three";
import {
  DESK_TOP_Y,
  DESK_SIZE,
  SCENE_OBJECTS,
  type SceneObjectConfig,
  type Palette,
} from "../../config/sceneConfig";
import { emitSceneEvent } from "../../lib/sceneEvents";
import {
  playObjectHover,
  playObjectClick,
  toggleMusic,
  isMusicPlaying,
  getLevel,
  type SoundId,
} from "../../audio/audioManager";

function easeOutBounce(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

/** Jatuh dari y=6 dengan stagger sesuai dropOrder (pola growon.kr) */
function DropIn({
  dropOrder,
  reducedMotion,
  children,
}: {
  dropOrder: number;
  reducedMotion: boolean;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const baseY = useRef(0);
  const started = useRef(false);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    if (!started.current) {
      started.current = true;
      baseY.current = group.position.y;
      group.position.y = baseY.current + 6;
      if (reducedMotion) {
        group.position.y = baseY.current;
        return;
      }
    }
    if (reducedMotion) return;

    const elapsed = state.clock.elapsedTime - dropOrder * 0.22;
    if (elapsed < 0) return;
    const t = Math.min(elapsed / 1.0, 1);
    group.position.y = baseY.current + 6 * (1 - easeOutBounce(t));
  });

  return <group ref={groupRef}>{children}</group>;
}

interface InteractiveProps {
  config: SceneObjectConfig;
  palette: Palette;
  reducedMotion?: boolean;
  onHoverChange?: (hovered: boolean) => void;
  children?: React.ReactNode;
  onClickOverride?: () => void;
}

/** Wrapper interaksi: hover → cursor + tooltip + sound, klik → event bus */
function Interactive({
  config,
  onHoverChange,
  onClickOverride,
  children,
}: InteractiveProps) {
  const isHovered = useRef(false);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const handleClick = useCallback(
    (e: { delta: number }) => {
      const delta = e.delta ?? 0;
      if (delta > 5) return;
      onClickOverride?.();
      emitSceneEvent({
        type: "object-click",
        objectId: config.id,
        action: config.action,
      });
    },
    [config, onClickOverride]
  );

  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!isHovered.current) {
          isHovered.current = true;
          setHovered(true);
          onHoverChange?.(true);
          playObjectHover(config.id as SoundId);
        }
        emitSceneEvent({
          type: "hover",
          objectId: config.id,
          x: e.nativeEvent.clientX,
          y: e.nativeEvent.clientY,
        });
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (isHovered.current) {
          isHovered.current = false;
          setHovered(false);
          onHoverChange?.(false);
          emitSceneEvent({ type: "hover", objectId: null, x: 0, y: 0 });
        }
      }}
      onClick={(e) => handleClick(e)}
    >
      {children}
    </group>
  );
}

/** Texture permukaan meja graphite / dark oak — terlihat kaya, terang & jelas */
function makeDeskTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // Base shade graphite / dark oak #484c58 → sangat jernih & bersih
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, "#424652");
  grad.addColorStop(0.5, "#525766");
  grad.addColorStop(1, "#454955");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Serat kayu/graphite halus
  for (let y = 0; y < size; y += 4) {
    ctx.fillStyle = `rgba(255, 255, 255, 0.05)`;
    ctx.fillRect(0, y, size, 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------ DESK ------------------------------ */

/** Meja lurus: bidang tunggal + 4 kaki + strip glow */
function Desk({ palette }: { palette: Palette }) {
  const deskTex = useMemo(() => makeDeskTexture(), []);
  const woodDark = "#2a2d36";
  const { width, depth, thickness, legThickness } = DESK_SIZE;

  const legs: [number, number][] = ([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const).map(
    ([sx, sz]) =>
      [sx * (width / 2 - legThickness * 0.55), sz * (depth / 2 - legThickness * 0.6)] as [
        number,
        number
      ]
  );

  return (
    <group position={[0, DESK_TOP_Y, 0]}>
      {/* Bidang atas satu piece — Clear Slate Graphite #484c58 (sangat jernih & bersih) */}
      <RoundedBox
        position={[0, -thickness / 2, 0]}
        args={[width, thickness, depth]}
        radius={0.04}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={deskTex}
          color="#ffffff"
          roughness={0.55}
          metalness={0.12}
          envMapIntensity={0.65}
        />
      </RoundedBox>

      {/* Legs */}
      {legs.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, -thickness / 2 - 0.55, z]} castShadow>
          <boxGeometry args={[legThickness, 1.1, legThickness]} />
          <meshStandardMaterial color={woodDark} roughness={0.75} metalness={0.15} />
        </mesh>
      ))}

      {/* Accent glow strip di tepi depan — tepat di atas permukaan */}
      <mesh position={[0, 0.005, depth / 2 + 0.002]}>
        <boxGeometry args={[width - 0.1, 0.012, 0.004]} />
        <meshStandardMaterial
          color={palette.primary}
          emissive={palette.primary}
          emissiveIntensity={0.5}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}

/* ----------------------------- MONITOR ----------------------------- */

/* ----------------------------- MONITOR ----------------------------- */

/** Curved display geometry — 1.44 x 0.84 with subtle 3D depth curvature */
function makeCurvedScreenGeometry(w: number, h: number) {
  const geo = new THREE.PlaneGeometry(w, h, 16, 16);
  const pos = geo.attributes.position;
  const halfW = w / 2;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = -0.012 * Math.pow(x / halfW, 2);
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/** Stand Neck Geometry — Slim center neck with smooth chamfered edges & cable routing hole */
function makeNeckGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.035, -0.58);
  shape.lineTo(-0.03, -0.02);
  shape.lineTo(0.03, -0.02);
  shape.lineTo(0.035, -0.58);
  shape.closePath();

  const hole = new THREE.Path();
  const hx = 0, hy = -0.38, hr = 0.016;
  hole.absarc(hx, hy + 0.015, hr, 0, Math.PI, false);
  hole.absarc(hx, hy - 0.015, hr, Math.PI, Math.PI * 2, false);
  hole.closePath();
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

/** Stand Base Geometry — Wider rounded rectangular base with chamfers (45% monitor width) */
function makeBaseGeometry() {
  const shape = new THREE.Shape();
  const w = 0.33, d = 0.16, r = 0.025;
  shape.moveTo(-w + r, -d);
  shape.lineTo(w - r, -d);
  shape.quadraticCurveTo(w, -d, w, -d + r);
  shape.lineTo(w, d - r);
  shape.quadraticCurveTo(w, d, w - r, d);
  shape.lineTo(-w + r, d);
  shape.quadraticCurveTo(-w, d, -w, d - r);
  shape.lineTo(-w, -d + r);
  shape.quadraticCurveTo(-w, -d, -w + r, -d);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 3,
  });
  geo.rotateX(Math.PI / 2);
  return geo;
}

/** Black Cable Geometry — Threading through neck cable hole down to desk */
function makeCableGeometry() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.0, -0.045),
    new THREE.Vector3(0, -0.15, -0.055),
    new THREE.Vector3(0, -0.36, -0.02),
    new THREE.Vector3(0, -0.44, 0.01),
    new THREE.Vector3(0.02, -0.64, 0.05),
  ]);
  return new THREE.TubeGeometry(curve, 32, 0.006, 8, false);
}

/** Dynamic Modern Idle Desktop Texture Generator (16:9 full view) */
function makeIdleDesktopTexture(palettePrimary: string) {
  const width = 1024;
  const height = 576;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { tex: null, update: () => {} };

  const render = (time: number) => {
    // 1. Wallpaper OLED Deep Pitch Black #030408
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#020306");
    bgGrad.addColorStop(0.5, "#04050a");
    bgGrad.addColorStop(1, "#020306");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle ambient waves
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 2; i++) {
      ctx.beginPath();
      const waveGrad = ctx.createLinearGradient(0, height * 0.3, width, height * 0.7);
      waveGrad.addColorStop(0, palettePrimary || "#38bdf8");
      waveGrad.addColorStop(1, "#818cf8");
      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 2.5 + i * 1.5;
      for (let x = 0; x <= width; x += 20) {
        const y = height * 0.42 + Math.sin(x * 0.005 + time * 0.5 + i) * 50 + i * 35;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 2. Top Status Bar
    ctx.fillStyle = "rgba(4, 5, 10, 0.95)";
    ctx.fillRect(0, 0, width, 24);
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.fillText("⚡ PortoOS", 14, 16);
    ctx.font = "400 10px Inter, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText("File   Edit   View   Terminal   Window   Help", 100, 16);
    ctx.textAlign = "right";
    ctx.fillText("📶 84%   00:17", width - 14, 16);
    ctx.textAlign = "left";

    // 3. Code Editor Window (Left side)
    const winX = 24, winY = 36, winW = 570, winH = 475;
    ctx.fillStyle = "#05070e";
    ctx.beginPath(); ctx.roundRect(winX, winY, winW, winH, 8); ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"; ctx.lineWidth = 1; ctx.stroke();

    // Header
    ctx.fillStyle = "rgba(18, 22, 34, 0.96)";
    ctx.beginPath(); ctx.roundRect(winX, winY, winW, 32, [8, 8, 0, 0]); ctx.fill();
    ctx.fillStyle = "#ff5f56"; ctx.beginPath(); ctx.arc(winX + 18, winY + 16, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ffbd2e"; ctx.beginPath(); ctx.arc(winX + 32, winY + 16, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#27c93f"; ctx.beginPath(); ctx.arc(winX + 46, winY + 16, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#38bdf8"; ctx.font = "500 11px monospace";
    ctx.fillText("Experience.tsx — PortoV2", winX + 66, winY + 20);

    // Code lines
    const lines = [
      { text: "import { Canvas, useFrame } from '@react-three/fiber';", color: "#c084fc" },
      { text: "import { MonitorStand, Desktop } from './objects';", color: "#38bdf8" },
      { text: "", color: "" },
      { text: "export function PremiumWorkspace() {", color: "#f43f5e" },
      { text: "  const [active, setActive] = useState(true);", color: "#e2e8f0" },
      { text: "  // Render high-detail modern monitor stand", color: "#64748b" },
      { text: "  useFrame((state) => {", color: "#f59e0b" },
      { text: "    monitor.float(state.clock.elapsedTime);", color: "#34d399" },
      { text: "  });", color: "#f59e0b" },
      { text: "", color: "" },
      { text: "  return (", color: "#f43f5e" },
      { text: "    <Monitor width={1.48} bezel={0.02} glow={0.8}>", color: "#38bdf8" },
      { text: "      <Stand finish='aluminum' curvature={0.12} />", color: "#38bdf8" },
      { text: "    </Monitor>", color: "#38bdf8" },
      { text: "  );", color: "#f43f5e" },
      { text: "}", color: "#f43f5e" },
    ];

    let lineY = winY + 56;
    lines.forEach((line, idx) => {
      if (idx === 7) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
        ctx.fillRect(winX + 8, lineY - 13, winW - 16, 18);
      }
      ctx.fillStyle = "rgba(148, 163, 184, 0.45)";
      ctx.font = "400 11px monospace";
      ctx.fillText(String(idx + 1).padStart(2, " "), winX + 14, lineY);

      if (line.text) {
        ctx.fillStyle = line.color;
        ctx.font = "400 11px monospace";
        ctx.fillText(line.text, winX + 46, lineY);

        if (idx === 7 && Math.floor(time * 2) % 2 === 0) {
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(winX + 300, lineY - 10, 6, 12);
        }
      }
      lineY += 21;
    });

    // 4. Terminal Window (Right side)
    const termX = 614, termY = 195, termW = 386, termH = 316;
    ctx.fillStyle = "rgba(8, 9, 14, 0.94)";
    ctx.beginPath(); ctx.roundRect(termX, termY, termW, termH, 8); ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"; ctx.stroke();

    ctx.fillStyle = "rgba(16, 18, 28, 0.96)";
    ctx.beginPath(); ctx.roundRect(termX, termY, termW, 28, [8, 8, 0, 0]); ctx.fill();
    ctx.fillStyle = "#94a3b8"; ctx.font = "500 11px monospace";
    ctx.fillText("bash — 80x24", termX + 14, termY + 18);

    ctx.font = "400 11px monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText("eylan@antigravity:~/porto$ npm run dev", termX + 14, termY + 52);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText("▲ Next.js 16.2.11 (Turbopack)", termX + 14, termY + 76);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("  - Local:   http://localhost:3000", termX + 14, termY + 98);
    ctx.fillText("  - Network: http://192.168.1.5:3000", termX + 14, termY + 118);
    ctx.fillStyle = "#34d399";
    ctx.fillText("✓ Compiled / in 142ms", termX + 14, termY + 146);
    ctx.fillStyle = "#f59e0b";
    ctx.fillText("GET / 200 in 18ms (Turbopack HMR)", termX + 14, termY + 170);

    // 5. Glass Dock
    const dockW = 260, dockH = 36;
    const dockX = (width - dockW) / 2, dockY = height - 46;
    ctx.fillStyle = "rgba(18, 22, 34, 0.85)";
    ctx.beginPath(); ctx.roundRect(dockX, dockY, dockW, dockH, 14); ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)"; ctx.stroke();

    const icons = ["💻", "🌐", "🎵", "🎨", "⚙️", "📂"];
    icons.forEach((ic, i) => {
      ctx.font = "16px sans-serif";
      ctx.fillText(ic, dockX + 18 + i * 39, dockY + 24);
    });

    // 6. Vignette
    const vigGrad = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.35,
      width / 2, height / 2, width * 0.65
    );
    vigGrad.addColorStop(0, "rgba(0,0,0,0)");
    vigGrad.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, width, height);
  };

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  render(0);

  return {
    tex,
    update: (t: number) => {
      render(t);
      tex.needsUpdate = true;
    },
  };
}

/** Static noise overlay for TV scan/hover effect */
function makeNoiseTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function Monitor({ palette, ...interactive }: InteractiveProps) {
  const screenMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const staticMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const floatGroupRef = useRef<THREE.Group>(null);
  const ledMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const hoveredRef = useRef(false);
  const flashRef = useRef(false);
  const flashTimer = useRef<number | null>(null);
  const lastDesktopUpdate = useRef(0);

  const desktopTex = useMemo(() => makeIdleDesktopTexture(palette.primary), [palette.primary]);
  const noiseTex = useMemo(() => makeNoiseTexture(), []);
  const screenGeometry = useMemo(() => makeCurvedScreenGeometry(1.46, 0.83), []);
  const neckGeometry = useMemo(() => makeNeckGeometry(), []);
  const baseGeometry = useMemo(() => makeBaseGeometry(), []);
  const cableGeometry = useMemo(() => makeCableGeometry(), []);

  useEffect(() => {
    return () => {
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Optimization: Throttle 1024x576 desktop texture update to 2 FPS (every 500ms for blinking cursor)
    if (desktopTex && t - lastDesktopUpdate.current > 0.5) {
      lastDesktopUpdate.current = t;
      desktopTex.update(t);
    }

    if (staticMatRef.current) {
      const target = hoveredRef.current ? 0.75 : 0;
      staticMatRef.current.opacity = THREE.MathUtils.lerp(
        staticMatRef.current.opacity,
        target,
        Math.min(1, delta * 9)
      );
    }



    if (ledMatRef.current) {
      const ledPulse = Math.sin(t * 2.0) * 0.4 + 1.2;
      ledMatRef.current.emissiveIntensity = ledPulse;
    }

    if (floatGroupRef.current) {
      floatGroupRef.current.position.y = Math.sin(t * 1.1) * 0.0012;
      floatGroupRef.current.rotation.z = Math.sin(t * 0.7) * 0.002;
    }
  });

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onHoverChange={(h) => {
        hoveredRef.current = h;
      }}
      onClickOverride={() => {
        playObjectClick("monitor");
        flashRef.current = true;
        if (flashTimer.current) window.clearTimeout(flashTimer.current);
        flashTimer.current = window.setTimeout(() => {
          flashRef.current = false;
        }, 900);
      }}
    >
      <group position={interactive.config.position} rotation={interactive.config.rotation}>
        {/* ==================== ANCHORED STAND (FLAT ON DESK) ==================== */}
        {/* Stand Base (Rests flat on desk top Y = 1.15) */}
        <mesh
          geometry={baseGeometry}
          position={[0, -0.65, 0.02]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#c0c3cd"
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>

        {/* Stand Neck */}
        <mesh
          geometry={neckGeometry}
          position={[0, -0.32, -0.045]}
          rotation={[0.08, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color="#b0b3bd"
            roughness={0.3}
            metalness={0.85}
          />
        </mesh>

        {/* Hinge Joint */}
        <group position={[0, 0, -0.042]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.04, 16]} />
            <meshStandardMaterial color="#303038" roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0, -0.008]} castShadow>
            <boxGeometry args={[0.055, 0.055, 0.012]} />
            <meshStandardMaterial color="#b0b3bd" roughness={0.3} metalness={0.85} />
          </mesh>
        </group>

        {/* Cable */}
        <mesh geometry={cableGeometry} castShadow>
          <meshStandardMaterial color="#0c0d12" roughness={0.65} metalness={0.1} />
        </mesh>

        {/* ==================== MONITOR HEAD (TILTS & FLOATS SLIGHTLY) ==================== */}
        <group ref={floatGroupRef} rotation={[-0.06, 0, 0]}>
          {/* Bezel Main Body — Deep Matte Black #050508, 0.05 envMapIntensity */}
          <RoundedBox args={[1.48, 0.85, 0.035]} radius={0.02} position={[0, 0, -0.015]} castShadow receiveShadow>
            <meshStandardMaterial color="#050508" roughness={0.35} metalness={0.85} envMapIntensity={0.05} />
          </RoundedBox>

          {/* Back Plate Housing */}
          <group position={[0, 0, -0.028]}>
            <RoundedBox args={[1.38, 0.75, 0.032]} radius={0.025} castShadow>
              <meshStandardMaterial color="#1a1a20" roughness={0.45} metalness={0.25} />
            </RoundedBox>

            {/* Rear Ventilation Slots */}
            <group position={[0, 0.25, -0.018]}>
              {[-0.3, -0.15, 0, 0.15, 0.3].map((x) => (
                <mesh key={x} position={[x, 0, 0]}>
                  <boxGeometry args={[0.1, 0.012, 0.004]} />
                  <meshStandardMaterial color="#0d0d12" roughness={0.7} />
                </mesh>
              ))}
            </group>

            {/* VESA Mounting Plate Details */}
            <group position={[0, 0, -0.018]}>
              <mesh castShadow>
                <boxGeometry args={[0.16, 0.16, 0.008]} />
                <meshStandardMaterial color="#22222a" roughness={0.4} metalness={0.5} />
              </mesh>
              {[[-0.065, -0.065], [0.065, -0.065], [-0.065, 0.065], [0.065, 0.065]].map(
                ([vx, vy], i) => (
                  <mesh key={i} position={[vx, vy, -0.005]}>
                    <cylinderGeometry args={[0.006, 0.006, 0.004, 12]} />
                    <meshStandardMaterial color="#888a92" roughness={0.3} metalness={0.8} />
                  </mesh>
                )
              )}
            </group>
          </group>

          {/* Curved Display Screen — Pure OLED pitch black background with zero gray reflection */}
          <mesh geometry={screenGeometry} position={[0, 0, 0.018]}>
            <meshBasicMaterial
              ref={screenMatRef}
              color="#ffffff"
              map={desktopTex.tex}
              toneMapped={false}
            />
          </mesh>

          {/* TV Static Noise Overlay (Positioned in front at Z = 0.020) */}
          {noiseTex && (
            <mesh geometry={screenGeometry} position={[0, 0, 0.020]}>
              <meshBasicMaterial
                ref={staticMatRef}
                map={noiseTex}
                transparent
                opacity={0}
                depthWrite={false}
                toneMapped={false}
              />
            </mesh>
          )}

          {/* Top Webcam Dot */}
          <mesh position={[0, 0.415, 0.018]}>
            <circleGeometry args={[0.006, 12]} />
            <meshStandardMaterial color="#08080c" roughness={0.2} metalness={0.8} />
          </mesh>

          {/* Bottom Bezel Logo Emboss */}
          <group position={[0, -0.415, 0.018]}>
            <mesh>
              <boxGeometry args={[0.04, 0.008, 0.002]} />
              <meshStandardMaterial color="#888a94" roughness={0.3} metalness={0.8} />
            </mesh>
          </group>

          {/* Standby LED */}
          <mesh position={[0.68, -0.415, 0.018]}>
            <circleGeometry args={[0.004, 12]} />
            <meshStandardMaterial
              ref={ledMatRef}
              color="#2563eb"
              emissive="#2563eb"
              emissiveIntensity={1.8}
            />
          </mesh>

          {/* Monitor glow — Netral Murni #ffffff (Tanpa cooltone biru) */}
          <rectAreaLight
            position={[0, -0.1, 0.1]}
            rotation={[-0.4, 0, 0]}
            width={1.25}
            height={0.6}
            color="#ffffff"
            intensity={1.8}
          />

          {/* Backlight Glow (#f1f5f9) */}
          <pointLight
            position={[0, 0, -0.15]}
            color="#f1f5f9"
            intensity={0.3}
            distance={1.5}
            decay={2}
          />
        </group>
      </group>
    </Interactive>
  );
}

/* ----------------------------- NOTEBOOK ----------------------------- */

function Notebook({ palette, ...interactive }: InteractiveProps) {
  const moveRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);

  useFrame((state, delta) => {
    const g = moveRef.current;
    if (!g) return;
    // idle: bergerak 1px / bob sangat halus
    g.position.y = 0.005 + Math.sin(state.clock.elapsedTime * 0.9) * 0.004;
    // hover: rotasi kecil
    const target = hoveredRef.current ? 0.12 : 0;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, target, Math.min(1, delta * 6));
  });

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onHoverChange={(h) => {
        hoveredRef.current = h;
      }}
      onClickOverride={() => playObjectClick("notebook")}
    >
      <group position={interactive.config.position} rotation={interactive.config.rotation}>
        <group ref={moveRef}>
          {/* Cover */}
          <RoundedBox args={[0.32, 0.05, 0.44]} radius={0.014} castShadow>
            <meshStandardMaterial color={palette.tertiary} roughness={0.55} metalness={0.15} />
          </RoundedBox>
          {/* Pages */}
          <mesh position={[0, 0.033, 0]}>
            <boxGeometry args={[0.285, 0.018, 0.405]} />
            <meshStandardMaterial color="#f2ead8" roughness={0.9} />
          </mesh>
          {/* Cover tip */}
          <mesh position={[0, 0.055, 0]} rotation={[-0.06, 0, 0]}>
            <boxGeometry args={[0.3, 0.012, 0.42]} />
            <meshStandardMaterial color={palette.tertiary} roughness={0.55} />
          </mesh>
          {/* Spine */}
          <mesh position={[0, 0.025, 0.223]}>
            <boxGeometry args={[0.32, 0.035, 0.014]} />
            <meshStandardMaterial color="#a16207" roughness={0.5} />
          </mesh>
          {/* Logo dot */}
          <mesh position={[0, 0.008, 0]}>
            <circleGeometry args={[0.035, 16]} />
            <meshStandardMaterial color="#a16207" roughness={0.4} />
          </mesh>
        </group>
      </group>
    </Interactive>
  );
}

/* -------------------------------- CUP -------------------------------- */

/** Partikel uap kopi — naik perlahan lalu memudar */
function Steam() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      const p = (t * 0.16 + i * 0.22) % 1;
      child.position.set(
        Math.sin(t * 1.1 + i * 1.7) * 0.022,
        0.24 + p * 0.24,
        Math.cos(t * 0.9 + i) * 0.012
      );
      child.scale.setScalar(1 - p * 0.45);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = 0.16 * (1 - p);
    });
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.24, 0]}>
          <sphereGeometry args={[0.014, 6, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

function Cup({ palette, ...interactive }: InteractiveProps) {
  const cupRef = useRef<THREE.Group>(null);
  const hoveredRef = useRef(false);

  useFrame((_, delta) => {
    const g = cupRef.current;
    if (!g) return;
    const target = hoveredRef.current ? 1.03 : 1;
    const s = THREE.MathUtils.lerp(g.scale.x, target, Math.min(1, delta * 7));
    g.scale.setScalar(s);
  });

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onHoverChange={(h) => {
        hoveredRef.current = h;
      }}
      onClickOverride={() => playObjectClick("cup")}
    >
      <group position={interactive.config.position}>
        <group ref={cupRef}>
          <mesh castShadow position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.09, 0.065, 0.18, 28]} />
            <meshStandardMaterial color={palette.tertiary} roughness={0.35} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.145, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.01, 28]} />
            <meshStandardMaterial color="#1c1200" roughness={0.25} metalness={0.5} />
          </mesh>
          <mesh position={[0.108, 0.07, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.05, 0.015, 12, 28]} />
            <meshStandardMaterial color={palette.tertiary} roughness={0.35} metalness={0.15} />
          </mesh>
          <Steam />
        </group>
      </group>
    </Interactive>
  );
}

/* ----------------------------- TURNTABLE ----------------------------- */

function Turntable({ palette, ...interactive }: InteractiveProps) {
  const platterRef = useRef<THREE.Mesh>(null);
  const tonearmRef = useRef<THREE.Group>(null);
  const [playing, setPlaying] = useState(false);

  useFrame((_, delta) => {
    if (platterRef.current) {
      const spin = isMusicPlaying() ? 0.35 + getLevel() * 1.4 : 0.02;
      platterRef.current.rotation.y += delta * spin;
    }
    if (tonearmRef.current) {
      const target = isMusicPlaying() ? 0.55 : 0;
      tonearmRef.current.rotation.z = THREE.MathUtils.lerp(
        tonearmRef.current.rotation.z,
        target,
        Math.min(1, delta * 4)
      );
    }
  });

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onClickOverride={() => {
        const on = toggleMusic();
        setPlaying(on);
        playObjectClick("turntable");
      }}
    >
      <group position={interactive.config.position} rotation={interactive.config.rotation}>
        {/* Base */}
        <RoundedBox args={[0.62, 0.06, 0.62]} radius={0.02} castShadow>
          <meshStandardMaterial color="#14121e" roughness={0.5} metalness={0.4} />
        </RoundedBox>
        {/* Platter */}
        <mesh ref={platterRef} position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.015, 40]} />
          <meshStandardMaterial color="#1d1b2b" roughness={0.3} metalness={0.6} />
        </mesh>
        {/* Disc label */}
        <mesh position={[0, 0.052, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.005, 24]} />
          <meshStandardMaterial color={playing ? palette.tertiary : palette.primary} roughness={0.4} />
        </mesh>
        {/* Tonearm */}
        <group ref={tonearmRef} position={[0.3, 0.03, 0.2]} rotation={[0, 0.4, 0]}>
          <mesh position={[0.1, 0.02, 0]} castShadow>
            <boxGeometry args={[0.28, 0.014, 0.014]} />
            <meshStandardMaterial color="#383454" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0.25, 0.035, 0]}>
            <boxGeometry args={[0.03, 0.02, 0.02]} />
            <meshStandardMaterial color="#14121e" />
          </mesh>
        </group>
        {/* Power dot */}
        <mesh position={[0, 0.04, 0.29]}>
          <circleGeometry args={[0.015, 12]} />
          <meshStandardMaterial
            color={playing ? "#34d399" : "#3f3b52"}
            emissive={playing ? "#34d399" : "#000000"}
            emissiveIntensity={playing ? 2 : 0}
          />
        </mesh>
      </group>
    </Interactive>
  );
}

/* -------------------------------- LAMP -------------------------------- */

const LAMP_MATTE = "#16161a";
const LAMP_SATIN = "#1f1f26";
const LAMP_BRUSHED = "#b9bcc4";

/** Profil tiang lathe — chamfer halus di bawah/atas + taper halus ke atas */
function makeLampPoleGeometry() {
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.033, 0.048),
    new THREE.Vector2(0.033, 0.064),
    new THREE.Vector2(0.0295, 0.07),
    new THREE.Vector2(0.0295, 1.84),
    new THREE.Vector2(0.0245, 1.885),
    new THREE.Vector2(0.0245, 1.9),
    new THREE.Vector2(0.01, 1.912),
    new THREE.Vector2(0, 1.916),
  ];
  return new THREE.LatheGeometry(profile, 12);
}

/** Alas segitiga membulat — bevel tebal, kesan berat & stabil */
function makeLampBaseGeometry() {
  const shape = new THREE.Shape();
  const r = 0.35;
  const cr = 0.075;
  const corners = [
    new THREE.Vector2(0, r),
    new THREE.Vector2(-r * 0.866, -r * 0.5),
    new THREE.Vector2(r * 0.866, -r * 0.5),
  ];
  const dirs = corners.map((c, i) =>
    corners[(i + 1) % 3].clone().sub(c).normalize()
  );
  const start = corners[0].clone().sub(dirs[2].clone().multiplyScalar(cr));
  shape.moveTo(start.x, start.y);
  for (let i = 0; i < 3; i++) {
    const exit = corners[i].clone().add(dirs[i].clone().multiplyScalar(cr));
    shape.quadraticCurveTo(corners[i].x, corners[i].y, exit.x, exit.y);
    if (i < 2) {
      const nextEntry = corners[i + 1].clone().sub(dirs[i].clone().multiplyScalar(cr));
      shape.lineTo(nextEntry.x, nextEntry.y);
    }
  }
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/** Floor lamp Skandinavia — leher lengkung elegan, shade kerucut,
 *  cahaya berlapis (spot hangat + fill lembut), animasi idle sangat halus */
function Lamp({ palette, ...interactive }: InteractiveProps) {
  const [on, setOn] = useState(false);
  const lightRef = useRef<THREE.PointLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const bulbMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const armGroupRef = useRef<THREE.Group>(null);
  const spotTarget = useMemo(() => new THREE.Object3D(), []);
  const hoveredRef = useRef(false);

  const materials = useMemo(
    () => ({
      pole: new THREE.MeshStandardMaterial({
        color: LAMP_MATTE,
        roughness: 0.82,
        metalness: 0.35,
      }),
      satin: new THREE.MeshStandardMaterial({
        color: LAMP_SATIN,
        roughness: 0.4,
        metalness: 0.55,
      }),
      brushed: new THREE.MeshStandardMaterial({
        color: LAMP_BRUSHED,
        roughness: 0.38,
        metalness: 0.9,
      }),
      reflector: new THREE.MeshStandardMaterial({
        color: "#e6dcc6",
        roughness: 0.22,
        metalness: 0.95,
        side: THREE.BackSide,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#232329",
        roughness: 0.55,
        metalness: 0.5,
      }),
      cable: new THREE.MeshStandardMaterial({
        color: "#0f0f13",
        roughness: 0.85,
        metalness: 0.1,
      }),
    }),
    []
  );

  const poleGeo = useMemo(() => makeLampPoleGeometry(), []);
  const baseGeo = useMemo(() => makeLampBaseGeometry(), []);
  const armGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, 0.055, 0),
      new THREE.Vector3(0.18, 0.062, 0),
      new THREE.Vector3(0.32, 0.008, 0),
      new THREE.Vector3(0.44, -0.1, 0),
      new THREE.Vector3(0.52, -0.235, 0),
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.019, 8, false);
  }, []);
  const floorCableGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.028, -0.3),
      new THREE.Vector3(0.03, 0.014, -0.5),
      new THREE.Vector3(0.04, 0.009, -0.64),
      new THREE.Vector3(0.055, 0.008, -0.85),
      new THREE.Vector3(0.07, 0.008, -1.0),
    ]);
    return new THREE.TubeGeometry(curve, 10, 0.006, 6, false);
  }, []);

  useFrame((_, delta) => {
    const k = Math.min(1, delta * 5);
    if (spotRef.current) {
      const target = on ? 18.0 : hoveredRef.current ? 2.5 : 0;
      if (Math.abs(spotRef.current.intensity - target) > 0.01) {
        spotRef.current.intensity = THREE.MathUtils.lerp(
          spotRef.current.intensity,
          target,
          k
        );
      }
    }
    if (lightRef.current) {
      const target = on ? 4.0 : hoveredRef.current ? 0.6 : 0;
      if (Math.abs(lightRef.current.intensity - target) > 0.01) {
        lightRef.current.intensity = THREE.MathUtils.lerp(
          lightRef.current.intensity,
          target,
          k
        );
      }
    }
    if (bulbMatRef.current) {
      const target = on ? 3.5 : 0;
      if (Math.abs(bulbMatRef.current.emissiveIntensity - target) > 0.01) {
        bulbMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
          bulbMatRef.current.emissiveIntensity,
          target,
          k
        );
      }
    }
  });

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onHoverChange={(h) => {
        hoveredRef.current = h;
      }}
      onClickOverride={() => {
        setOn((prev) => {
          const next = !prev;
          emitSceneEvent({ type: "lamp-change", on: next });
          return next;
        });
        playObjectClick("lamp");
      }}
    >
      {/* rotasi: leher mengarah ke keyboard & notebook, bukan ke monitor */}
      <group position={interactive.config.position} rotation={interactive.config.rotation}>
        {/* Alas segitiga membulat — brushed metal */}
        <mesh geometry={baseGeo} material={materials.brushed} castShadow receiveShadow />

        {/* Tiang — lathe chamfer, matte black, taper halus ke atas */}
        <mesh geometry={poleGeo} material={materials.pole} castShadow />
        <mesh position={[0, 1.902, 0]} material={materials.pole} castShadow>
          <cylinderGeometry args={[0.027, 0.031, 0.06, 12]} />
        </mesh>

        {/* Kabel menempel di tiang */}
        <mesh position={[0.0295, 0.85, 0]} material={materials.cable}>
          <cylinderGeometry args={[0.006, 0.006, 1.75, 6]} />
        </mesh>

        {/* Kabel lantai + saklar inline */}
        <mesh geometry={floorCableGeo} material={materials.cable} />
        <RoundedBox
          args={[0.03, 0.022, 0.055]}
          radius={0.008}
          position={[0.042, 0.016, -0.64]}
          material={materials.dark}
        />
        <mesh position={[0.042, 0.03, -0.64]} material={materials.dark}>
          <cylinderGeometry args={[0.009, 0.009, 0.012, 8]} />
        </mesh>

        {/* Leher lengkung + head — berayun sangat halus */}
        <group ref={armGroupRef} position={[0, 1.9, 0]}>
          {/* Lengan lengkung elegan */}
          <mesh geometry={armGeo} material={materials.pole} castShadow />

          {/* Hinge penghubung arm & shade + sekrup kecil */}
          <mesh
            position={[0.52, -0.235, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={materials.satin}
            castShadow
          >
            <cylinderGeometry args={[0.026, 0.026, 0.1, 12]} />
          </mesh>
          {[0.045, -0.045].map((dz) => (
            <mesh
              key={dz}
              position={[0.52, -0.235, dz]}
              rotation={[Math.PI / 2, 0, 0]}
              material={materials.brushed}
            >
              <cylinderGeometry args={[0.0055, 0.0055, 0.008, 8]} />
            </mesh>
          ))}
          <mesh
            position={[0.52, -0.185, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.brushed}
          >
            <cylinderGeometry args={[0.0055, 0.0055, 0.008, 8]} />
          </mesh>

          {/* Shade kerucut — satin hitam di luar, reflektif hangat di dalam */}
          <group position={[0.52, -0.235, 0]} rotation={[0, 0, 0.32]}>
            <mesh position={[0, -0.12, 0]} material={materials.satin} castShadow>
              <coneGeometry args={[0.15, 0.24, 24, 1, true]} />
            </mesh>
            <mesh position={[0, -0.115, 0]} material={materials.reflector}>
              <coneGeometry args={[0.143, 0.23, 24, 1, true]} />
            </mesh>
            <mesh position={[0, -0.245, 0]} material={materials.satin}>
              <cylinderGeometry args={[0.152, 0.152, 0.012, 24, 1, true]} />
            </mesh>
            <mesh position={[0, -0.06, 0]} material={materials.dark}>
              <cylinderGeometry args={[0.005, 0.005, 0.1, 6]} />
            </mesh>
            {/* Bohlam hangat yang terlihat */}
            <mesh position={[0, -0.105, 0]}>
              <sphereGeometry args={[0.035, 10, 8]} />
              <meshStandardMaterial
                ref={bulbMatRef}
                color={on ? "#fff4e0" : "#2a2438"}
                emissive="#ffd9a8"
                emissiveIntensity={0}
                roughness={0.3}
              />
            </mesh>
          </group>

          {/* Fill lembut di dalam shade */}
          <pointLight
            ref={lightRef}
            position={[0.52, -0.28, 0]}
            color="#FFC45A"
            intensity={0}
            distance={3.2}
            decay={2}
          />
          {/* Spot utama hangat (2900K - #FFC45A) — menyinari notebook, keyboard, coffee mug, & permukaan meja depan-kiri */}
          <spotLight
            ref={spotRef}
            position={[0.52, -0.48, 0]}
            target={spotTarget}
            color="#FFC45A"
            intensity={0}
            angle={0.48}
            penumbra={0.85}
            distance={4.2}
            decay={2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
        </group>
      </group>
      {/* Target spot di world-space — tengah area keyboard & notebook */}
      <primitive object={spotTarget} position={[-0.43, 1.12, 0.24]} />
    </Interactive>
  );
}

/* ----------------------------- KEYBOARD ----------------------------- */

function Keyboard({ palette, ...interactive }: InteractiveProps) {
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const hoveredRef = useRef(false);

  useFrame((_, delta) => {
    if (!bodyMatRef.current) return;
    const target = hoveredRef.current ? 0.4 : 0;
    if (Math.abs(bodyMatRef.current.emissiveIntensity - target) > 0.001) {
      bodyMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        bodyMatRef.current.emissiveIntensity,
        target,
        Math.min(1, delta * 6)
      );
    }
  });

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onHoverChange={(h) => {
        hoveredRef.current = h;
      }}
      onClickOverride={() => playObjectClick("keyboard")}
    >
      <group position={interactive.config.position} rotation={interactive.config.rotation}>
        <RoundedBox args={[0.56, 0.05, 0.2]} radius={0.014} castShadow>
          <meshStandardMaterial
            ref={bodyMatRef}
            color="#1d1b2b"
            roughness={0.5}
            metalness={0.3}
            emissive={palette.primary}
            emissiveIntensity={0}
          />
        </RoundedBox>
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3, 4].map((col) => (
            <mesh key={`${row}-${col}`} position={[-0.19 + col * 0.095, 0.03, 0.06 - row * 0.048]}>
              <boxGeometry args={[0.066, 0.014, 0.034]} />
              <meshStandardMaterial color="#383454" roughness={0.6} />
            </mesh>
          ))
        )}
        {/* Spacebar */}
        <mesh position={[-0.05, 0.03, 0.108]}>
          <boxGeometry args={[0.22, 0.014, 0.034]} />
          <meshStandardMaterial color="#383454" roughness={0.6} />
        </mesh>
      </group>
    </Interactive>
  );
}

/* ------------------------------ MOUSE ------------------------------ */

function Mouse({ palette, ...interactive }: InteractiveProps) {
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const hoveredRef = useRef(false);

  useFrame((_, delta) => {
    if (!bodyMatRef.current) return;
    const target = hoveredRef.current ? 0.5 : 0;
    if (Math.abs(bodyMatRef.current.emissiveIntensity - target) > 0.001) {
      bodyMatRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        bodyMatRef.current.emissiveIntensity,
        target,
        Math.min(1, delta * 6)
      );
    }
  });

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onHoverChange={(h) => {
        hoveredRef.current = h;
      }}
      onClickOverride={() => playObjectClick("mouse")}
    >
      <group position={interactive.config.position} rotation={interactive.config.rotation}>
        {/* Badan */}
        <RoundedBox args={[0.13, 0.045, 0.09]} radius={0.02} castShadow>
          <meshStandardMaterial
            ref={bodyMatRef}
            color="#1d1b2b"
            roughness={0.4}
            metalness={0.3}
            emissive={palette.primary}
            emissiveIntensity={0}
          />
        </RoundedBox>
        {/* Scroll wheel */}
        <mesh position={[0, 0.026, 0.012]}>
          <boxGeometry args={[0.02, 0.012, 0.02]} />
          <meshStandardMaterial color="#14121e" roughness={0.5} />
        </mesh>
        {/* Logo accent */}
        <mesh position={[0, 0.026, -0.012]}>
          <circleGeometry args={[0.02, 16]} />
          <meshStandardMaterial
            color={palette.primary}
            emissive={palette.primary}
            emissiveIntensity={0.9}
          />
        </mesh>
      </group>
    </Interactive>
  );
}

/* ------------------------------ PENCIL ------------------------------ */

function Pencil({ palette, ...interactive }: InteractiveProps) {
  const groupRef = useRef<THREE.Group>(null);
  const anim = useRef({ rolling: false, t: 0 });

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const s = anim.current;
    if (s.rolling) {
      s.t += delta;
      group.rotation.z = Math.sin(s.t * 5) * 0.25;
      group.position.x += delta * 1.1;
      group.position.y = 1.215 + Math.sin(s.t * 7) * 0.02;
      if (s.t > 1.3) {
        s.rolling = false;
        s.t = 0;
      }
    } else if (s.t > 0) {
      s.t -= delta;
      group.position.x -= delta * 1.1;
    }
  });

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onClickOverride={() => {
        anim.current.rolling = true;
        playObjectClick("pencil");
      }}
    >
      <group
        ref={groupRef}
        position={interactive.config.position}
        rotation={interactive.config.rotation}
      >
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.36, 14]} />
          <meshStandardMaterial color={palette.tertiary} roughness={0.5} />
        </mesh>
        <mesh position={[0.2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.034, 0.08, 14]} />
          <meshStandardMaterial color="#f5e6c8" roughness={0.6} />
        </mesh>
        <mesh position={[0.238, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.015, 0.032, 10]} />
          <meshStandardMaterial color="#1c1200" roughness={0.4} />
        </mesh>
        <mesh position={[-0.19, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.045, 14]} />
          <meshStandardMaterial color="#9ca3af" roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[-0.217, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.015, 14]} />
          <meshStandardMaterial color="#f9a8d4" roughness={0.6} />
        </mesh>
      </group>
    </Interactive>
  );
}

/* ------------------------------ CHAIR ------------------------------ */

const CHAIR_FRAME = "#090a0c";
const CHAIR_SEAT = "#0c0d10";
const CHAIR_MESH = "#0a0b0d";
const CHAIR_GRAPHITE = "#0c0d0f";

const STAR_ANGLES = [0, (Math.PI * 2) / 5, (Math.PI * 4) / 5, (Math.PI * 6) / 5, (Math.PI * 8) / 5];

/** Round rect path 2D — dipakai untuk frame & lubang backrest */
function roundedRectPath<T extends THREE.Path>(path: T, w: number, h: number, r: number): T {
  const x = w / 2;
  const y = h / 2;
  path.moveTo(-x + r, -y);
  path.lineTo(x - r, -y);
  path.quadraticCurveTo(x, -y, x, -y + r);
  path.lineTo(x, y - r);
  path.quadraticCurveTo(x, y, x - r, y);
  path.lineTo(-x + r, y);
  path.quadraticCurveTo(-x, y, -x, y - r);
  path.lineTo(-x, -y + r);
  path.quadraticCurveTo(-x, -y, -x + r, -y);
  return path;
}

/** Tekuk geometri di sumbu z — kurva cekung ke arah pengguna */
function bendCurved(geo: THREE.BufferGeometry, curvature: number, halfW: number) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, pos.getZ(i) + curvature * Math.pow(x / halfW, 2));
  }
  geo.computeVertexNormals();
  return geo;
}

/** Bahan mesh backrest — tekstur kisi transparan (tampilan breathable) */
function makeChairMeshTexture() {
  const size = 64;
  const cell = 16;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      ctx.fillStyle = "#23232a";
      ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 8);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------ PLANT (BIG PINE TREE) ------------------------------ */

/** Objek pohon pinus hias besar dalam pot keramik matte charcoal — diklik untuk menggerakkan dahan & kanopi pinus */
function Plant({ palette, ...interactive }: InteractiveProps) {
  const foliageRef = useRef<THREE.Group>(null);
  const swaySpring = useRef({ active: false, velocity: 0, angle: 0 });

  useFrame((_, delta) => {
    const group = foliageRef.current;
    if (!group) return;
    const s = swaySpring.current;

    if (s.active || Math.abs(s.velocity) > 0.001 || Math.abs(s.angle) > 0.001) {
      const k = 40.0;
      const c = 6.0;
      const force = -k * s.angle - c * s.velocity;
      s.velocity += force * delta;
      s.angle += s.velocity * delta;

      group.rotation.z = s.angle;
      group.rotation.x = s.angle * 0.65;

      if (Math.abs(s.angle) < 0.001 && Math.abs(s.velocity) < 0.001) {
        s.active = false;
        s.angle = 0;
        s.velocity = 0;
        group.rotation.z = 0;
        group.rotation.x = 0;
      }
    }
  });

  const triggerSway = () => {
    swaySpring.current.active = true;
    swaySpring.current.velocity = 0.90;
    playObjectClick("plant");
  };

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onClickOverride={triggerSway}
    >
      <group
        position={interactive.config.position}
        rotation={interactive.config.rotation}
        scale={interactive.config.scale}
      >
        {/* Pot Keramik / Beton Matte Charcoal Minimalis */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.19, 0.44, 24]} />
          <meshStandardMaterial color="#1a1c20" roughness={0.82} metalness={0.04} />
        </mesh>
        {/* Lis Bibir Pot */}
        <mesh position={[0, 0.435, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.27, 0.27, 0.025, 24]} />
          <meshStandardMaterial color="#22242a" roughness={0.78} metalness={0.05} />
        </mesh>

        {/* Tanah Potting Organik Gelap */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.02, 16]} />
          <meshStandardMaterial color="#16100a" roughness={0.95} />
        </mesh>

        {/* Pohon Pinus Besar & Tinggi (Group dahan & kanopi yang diklik & bergoyang) */}
        <group ref={foliageRef} position={[0, 0.44, 0]}>
          {/* Batang Utama Pohon Pinus */}
          <mesh position={[0, 0.65, 0]} rotation={[0.04, 0, -0.03]} castShadow>
            <cylinderGeometry args={[0.028, 0.055, 1.30, 14]} />
            <meshStandardMaterial color="#3a2618" roughness={0.85} />
          </mesh>

          {/* 5 Tingkat Kanopi Jarum Pinus Hijau Segar Rimbun + Outline Crisp */}
          {[
            { pos: [0, 0.45, 0], radius: 0.50, height: 0.40, rot: [0.02, 0, 0.05] },
            { pos: [0, 0.72, 0], radius: 0.42, height: 0.36, rot: [-0.03, 0.5, 0.02] },
            { pos: [0, 0.95, 0], radius: 0.34, height: 0.32, rot: [0.01, 1.1, -0.04] },
            { pos: [0, 1.15, 0], radius: 0.25, height: 0.28, rot: [-0.02, 1.6, 0.03] },
            { pos: [0, 1.34, 0], radius: 0.16, height: 0.24, rot: [0, 2.2, 0] },
          ].map((tier, idx) => (
            <group key={idx} position={tier.pos as [number, number, number]} rotation={tier.rot as [number, number, number]}>
              {/* Mesh Utama Daun Pinus Warna Hijau #086623 */}
              <mesh castShadow receiveShadow>
                <coneGeometry args={[tier.radius, tier.height, 16]} />
                <meshStandardMaterial
                  color={idx % 2 === 0 ? "#086623" : "#064e1b"}
                  roughness={0.88}
                  metalness={0.0}
                  envMapIntensity={0.02}
                />
              </mesh>
              {/* Mesh Outline Penjelas Siluet Dedaunan */}
              <mesh scale={[1.035, 1.035, 1.035]}>
                <coneGeometry args={[tier.radius, tier.height, 16]} />
                <meshBasicMaterial
                  color={idx % 2 === 0 ? "#086623" : "#064e1b"}
                  side={THREE.BackSide}
                />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </Interactive>
  );
}

/* ------------------------------ BENCH (ERGONOMIC OFFICE CHAIR) ------------------------------ */

/** Kursi kantor ergonomis premium — 100% kokoh, stabil di lantai, tanpa glitch & tanpa muter-muter */
function Bench({ palette, ...interactive }: InteractiveProps) {
  const triggerClick = () => {
    playObjectClick("bench");
  };

  return (
    <Interactive
      config={interactive.config}
      palette={palette}
      onClickOverride={triggerClick}
    >
      <group
        position={interactive.config.position}
        rotation={interactive.config.rotation}
        scale={interactive.config.scale}
      >
        {/* ── KAKI BINTANG 5 (5-Star Wheel Base) Matte Black Powder-Coated Metal ── */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i / 5) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              {/* Lengan Kaki Miring Stabil */}
              <mesh position={[0.22, 0.052, 0]} rotation={[0, 0, -0.05]} castShadow receiveShadow>
                <boxGeometry args={[0.42, 0.038, 0.045]} />
                <meshStandardMaterial color="#141518" roughness={0.70} metalness={0.35} />
              </mesh>
              {/* Twin Caster Wheel Himpitan Roda Menempel Lantai (Y = 0.038) */}
              <group position={[0.40, 0.038, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.038, 0.038, 0.042, 16]} />
                  <meshStandardMaterial color="#18191c" roughness={0.75} metalness={0.20} />
                </mesh>
                <mesh position={[0, 0.022, 0]}>
                  <cylinderGeometry args={[0.018, 0.018, 0.012, 12]} />
                  <meshStandardMaterial color="#2a2c32" roughness={0.60} metalness={0.40} />
                </mesh>
              </group>
            </group>
          );
        })}

        {/* ── TIANG GAS PNEUMATIK Matte Black Metal ── */}
        <mesh position={[0, 0.24, 0]} castShadow>
          <cylinderGeometry args={[0.040, 0.052, 0.40, 18]} />
          <meshStandardMaterial color="#141518" roughness={0.65} metalness={0.45} />
        </mesh>
        {/* Mekanisme Penyetel Pneumatik Bawah Dudukan */}
        <mesh position={[0, 0.45, 0]} castShadow>
          <boxGeometry args={[0.24, 0.07, 0.24]} />
          <meshStandardMaterial color="#1c1d22" roughness={0.72} metalness={0.30} />
        </mesh>

        {/* ── DUDUKAN KURSI ERGONOLIS TEBAL Growon Style ── */}
        <group position={[0, 0.52, 0]}>
          {/* Base pan plastik / metal */}
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.34, 0.32, 0.06, 24]} />
            <meshStandardMaterial color="#141518" roughness={0.75} metalness={0.30} />
          </mesh>
          {/* Bantalan Kain Fabric Breathable Tebal dengan Kontur Ergonomis */}
          <RoundedBox
            position={[0, 0.06, 0.02]}
            args={[0.62, 0.12, 0.58]}
            radius={0.06}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#181a20" roughness={0.85} metalness={0.01} />
          </RoundedBox>
        </group>

        {/* ── SANDARAN PUNGGUNG ERGONOLIS LENGKUNGAN ORGANIK (S-Curve Ergonomic Recline Backrest) ── */}
        <group position={[0, 0.60, -0.22]} rotation={[-0.15, 0, 0]}>
          {/* Sendi Penyangga Spine (Flexible Spine Hinge) */}
          <mesh position={[0, 0.08, -0.02]} castShadow>
            <cylinderGeometry args={[0.025, 0.030, 0.12, 12]} />
            <meshStandardMaterial color="#1c1e24" roughness={0.60} metalness={0.50} />
          </mesh>

          {/* Rangka Belakang Miring Meliuk S-Curve (Spine Frame) Matte Black Metal */}
          <mesh position={[0, 0.32, -0.05]} rotation={[-0.08, 0, 0]} castShadow>
            <boxGeometry args={[0.085, 0.64, 0.045]} />
            <meshStandardMaterial color="#141518" roughness={0.68} metalness={0.40} />
          </mesh>

          {/* Bingkai Luar Sandaran Mesh Membulat Soft & Curved */}
          <RoundedBox
            position={[0, 0.45, -0.05]}
            args={[0.56, 0.74, 0.045]}
            radius={0.08}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#141518" roughness={0.70} metalness={0.35} />
          </RoundedBox>

          {/* Panel Jaring Mesh Breathable Glassmorphic Sheen Growon Style */}
          <RoundedBox
            position={[0, 0.45, -0.04]}
            args={[0.50, 0.68, 0.025]}
            radius={0.06}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#1f2636"
              transparent
              opacity={0.88}
              roughness={0.35}
              metalness={0.15}
              envMapIntensity={1.2}
            />
          </RoundedBox>

          {/* Penyangga Lumbar Punggung Bawah Organik (Lumbar Cushion Pad) */}
          <RoundedBox
            position={[0, 0.22, -0.015]}
            args={[0.44, 0.14, 0.04]}
            radius={0.035}
            smoothness={2}
            castShadow
          >
            <meshStandardMaterial color="#262a34" roughness={0.80} metalness={0.05} />
          </RoundedBox>
        </group>

        {/* ── HEADREST ERGONOLIS (Bantalan Kepala Ergonomis Atas) ── */}
        <group position={[0, 1.38, -0.32]}>
          {/* Tiang Penyangga Headrest */}
          <mesh position={[0, -0.08, -0.02]} rotation={[-0.08, 0, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.14, 12]} />
            <meshStandardMaterial color="#141518" roughness={0.68} metalness={0.40} />
          </mesh>
          {/* Bantalan Headrest Mesh */}
          <RoundedBox
            args={[0.34, 0.18, 0.08]}
            radius={0.04}
            smoothness={2}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#1c2028" roughness={0.80} metalness={0.02} />
          </RoundedBox>
        </group>

        {/* ── 4D ARMRESTS (Sandaran Tangan Ergonomis Mulus) ── */}
        {[-1, 1].map((side, i) => (
          <group key={i} position={[side * 0.32, 0.54, -0.02]}>
            {/* Tiang penyangga armrest matte black metal */}
            <mesh position={[0, 0.12, 0]} rotation={[0.08, 0, side * -0.05]} castShadow>
              <cylinderGeometry args={[0.018, 0.022, 0.24, 12]} />
              <meshStandardMaterial color="#141518" roughness={0.68} metalness={0.40} />
            </mesh>
            {/* Bantalan Armrest Halus Membulat */}
            <RoundedBox
              position={[0, 0.24, 0.02]}
              args={[0.09, 0.038, 0.26]}
              radius={0.015}
              smoothness={2}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#181a1f" roughness={0.75} metalness={0.05} />
            </RoundedBox>
          </group>
        ))}
      </group>
    </Interactive>
  );
}

/* ------------------------------ EXPORT ------------------------------ */

export function SceneObjects({
  palette,
  reducedMotion,
}: {
  palette: Palette;
  reducedMotion: boolean;
}) {
  return (
    <group>
      <DropIn dropOrder={1} reducedMotion={reducedMotion}>
        <Desk palette={palette} />
      </DropIn>

      {SCENE_OBJECTS.map((config) => {
        const common = { config, palette };
        switch (config.id) {
          case "monitor":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Monitor {...common} />
              </DropIn>
            );
          case "notebook":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Notebook {...common} />
              </DropIn>
            );
          case "cup":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Cup {...common} />
              </DropIn>
            );
          case "turntable":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Turntable {...common} />
              </DropIn>
            );
          case "lamp":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Lamp {...common} />
              </DropIn>
            );
          case "keyboard":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Keyboard {...common} />
              </DropIn>
            );
          case "mouse":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Mouse {...common} />
              </DropIn>
            );
          case "pencil":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Pencil {...common} />
              </DropIn>
            );
          case "plant":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Plant {...common} />
              </DropIn>
            );
          case "bench":
            return (
              <DropIn key={config.id} dropOrder={config.dropOrder} reducedMotion={reducedMotion}>
                <Bench {...common} />
              </DropIn>
            );
          default:
            return null;
        }
      })}
    </group>
  );
}
