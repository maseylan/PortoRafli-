"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* ------------------------------ KONSTANTA RUANG ------------------------------ */

const WALL_H = 4.2;
const BACK_Z = -3.0;
const LEFT_X = -4.4;
const WALL_TEX = { w: 8.8, h: 4.2 };
const LEFT_WALL = { w: 6.8, h: 4.2, cz: 0.4 };

/** Bukaan jendela di dinding belakang & menyambung ke dinding kiri (Corner Window 90°) */
const WIN = {
  left: -4.35,
  right: 4.0,
  bottom: 0.2,
  top: 3.6,
  z: -3.0,
};
const WIN_CX = (WIN.left + WIN.right) / 2;
const WIN_CY = (WIN.bottom + WIN.top) / 2;
const WIN_W = WIN.right - WIN.left;
const WIN_H = WIN.top - WIN.bottom;

const WIN_LEFT = {
  startZ: -2.95,
  endZ: 3.7,
  w: 6.65,
  cz: (-2.95 + 3.7) / 2,
};

/* --------------------------- NOISE TERSEED (PURITY) --------------------------- */

function seededNoise(i: number, salt: number): number {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------ TEKSTUR PROSEDURAL ------------------------------ */

/** Tekstur plaster matte charcoal (#181A1F) — 80% memudar pekat ke dalam bayangan */
function makePlasterTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  // Target base: Sleek Deep Dark Charcoal #07080a (R=7, G=8, B=10)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const grain = (seededNoise(i * 7.3, 11) - 0.5) * 1.0;
      const block = (Math.floor(x / 16) * 16 + Math.floor(y / 16)) | 0;
      const mottle = (seededNoise(block, 23) - 0.5) * 0.6;
      const bigBlock = (Math.floor(x / 48) * 48 + Math.floor(y / 48)) | 0;
      const bigMottle = (seededNoise(bigBlock, 37) - 0.5) * 0.4;
      const v = Math.max(0, Math.min(255, Math.round(7 + grain + mottle + bigMottle)));
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v + 1;
      img.data[i * 4 + 2] = v + 3;
      img.data[i * 4 + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 2.5);
  return tex;
}

/** Peta kekasaran abu-abu (bukan untuk map warna) — variasi diperluas */
function makeRoughnessTexture(base: number, amp: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;
      const n = (seededNoise(i * 5.1, 31) - 0.5) * amp;
      // Wider roughness patches for plaster feel
      const bigBlock = (Math.floor(x / 24) * 24 + Math.floor(y / 24)) | 0;
      const bigN = (seededNoise(bigBlock, 39) - 0.5) * (amp * 0.6);
      const v = base + n + bigN;
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

/** Layout papan kayu deterministik — lebar, tint, sudut grain & knot diacak per papan */
function buildPlankLayout(size: number, rows: number, minW: number, maxW: number) {
  const rowH = size / rows;
  const planks: {
    x: number;
    y: number;
    w: number;
    h: number;
    tint: number;
    grain: number;
    knot: number;
  }[] = [];
  for (let r = 0; r < rows; r++) {
    const stagger = seededNoise(r * 97 + 5, 81) > 0.5 ? rowH * 0.5 : 0;
    let x = -stagger;
    let idx = r * 100;
    while (x < size) {
      const w = minW + seededNoise(idx, 51) * (maxW - minW);
      planks.push({
        x,
        y: r * rowH,
        w,
        h: rowH,
        tint: seededNoise(idx, 52),
        grain: (seededNoise(idx, 53) - 0.5) * 0.32,
        knot: seededNoise(idx, 54),
      });
      x += w;
      idx++;
    }
  }
  return planks;
}

/** Lantai dark ebony walnut — sangat gelap agar pendaran glow terlihat tajam & kontras */
function makeWoodFloorTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const planks = buildPlankLayout(size, 2, 180, 280);

  for (const p of planks) {
    // Floor base shade (#060709)
    const shade = Math.max(2, 4 + p.tint * 3);
    const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
    g.addColorStop(0, `rgb(${shade + 1}, ${shade}, ${shade - 1})`);
    g.addColorStop(1, `rgb(${shade}, ${shade - 1}, ${shade - 2})`);
    ctx.fillStyle = g;
    ctx.fillRect(p.x, p.y, p.w, p.h);

    // grain — serat miring sesuai sudut acak per papan (wider rotation range)
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
    ctx.rotate(p.grain * 1.4);
    for (let gs = 0; gs < 16; gs++) {
      const gy = (seededNoise(gs * 3 + p.tint * 100, 53) - 0.5) * (p.h - 6);
      const gShade = shade - 5 - seededNoise(gs * 7 + p.tint, 55) * 12;
      ctx.fillStyle = `rgba(${gShade}, ${gShade - 3}, ${gShade - 8}, 0.5)`;
      ctx.fillRect(-p.w / 2, gy, p.w, 1.4);
    }
    // knot sesekali
    if (p.knot > 0.72) {
      const kx = (p.knot - 0.72) * 6 * p.w - p.w / 2;
      const ky = (seededNoise(p.tint * 31, 56) - 0.5) * (p.h - 10);
      ctx.fillStyle = "rgba(12, 10, 7, 0.75)";
      ctx.beginPath();
      ctx.ellipse(kx, ky, 2.4, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // sambungan antar papan — garis gelap tipis
  for (const p of planks) {
    ctx.fillStyle = "rgba(8, 6, 4, 0.85)";
    ctx.fillRect(p.x, p.y + p.h - 1.5, p.w + 1.5, 1.5);
    ctx.fillRect(p.x + p.w - 1.5, p.y, 1.5, p.h + 1.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // Reduced tiling with larger planks
  tex.repeat.set(1.6, 1.2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Roughness map lantai — variasi per papan, wider range for non-uniform feel */
function makeWoodRoughnessTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // Match larger plank layout
  const planks = buildPlankLayout(size, 2, 90, 140);
  for (const p of planks) {
    // Wider roughness variation per plank
    const base = 120 + p.tint * 60;
    ctx.fillStyle = `rgb(${base}, ${base}, ${base})`;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    for (let n = 0; n < 90; n++) {
      const nx = p.x + seededNoise(n * 7 + p.tint * 40, 71) * p.w;
      const ny = p.y + seededNoise(n * 13 + p.tint, 72) * p.h;
      const v = base - 16 + seededNoise(n * 3, 73) * 32;
      ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.35)`;
      ctx.fillRect(nx, ny, 1.5, 1.5);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // Reduced tiling to match floor texture
  tex.repeat.set(3.2, 2.4);
  return tex;
}

/** Hook untuk tekstur pemandangan jendela: SIANG HARI saat lampu MATI (lampOn=false) VS MALAM HARI saat lampu NYALA (lampOn=true) */
function useCityTexture(lampOn: boolean) {
  const nightRatioRef = useRef(lampOn ? 1 : 0);

  const city = useMemo(() => {
    const w = 320;
    const h = 160;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;

    // Data bintang teranimasi (berbagai ukuran & twinkling slow)
    const stars = Array.from({ length: 110 }, (_, i) => ({
      x: seededNoise(i, 41) * w,
      y: seededNoise(i, 42) * h * 0.55,
      size: seededNoise(i, 43) > 0.85 ? 2.0 : seededNoise(i, 43) > 0.5 ? 1.2 : 0.8,
      phase: seededNoise(i, 44) * Math.PI * 2,
      speed: 0.6 + seededNoise(i, 45) * 1.2,
    }));

    // Data awan lambat melayang malam/siang
    const clouds = Array.from({ length: 6 }, (_, i) => ({
      x: seededNoise(i, 91) * w * 1.5,
      y: 12 + seededNoise(i, 92) * h * 0.34,
      w: 65 + seededNoise(i, 93) * 85,
      h: 20 + seededNoise(i, 94) * 26,
      speed: 0.8 + seededNoise(i, 95) * 1.8,
      alpha: 0.14 + seededNoise(i, 96) * 0.14,
    }));

    // Layer 1: Distant Skyline (Gedung paling jauh — bluer tone, soft atmospheric haze)
    const distantBuildings: { x: number; w: number; h: number }[] = [];
    let dx = -15, didx = 0;
    while (dx < w + 20) {
      const bw = 12 + seededNoise(didx, 31) * 18;
      const bh = 90 + seededNoise(didx, 32) * 80;
      distantBuildings.push({ x: dx, w: bw, h: bh });
      dx += bw + 3;
      didx++;
    }

    // Layer 2: Medium-Distance Buildings (Gedung menengah dengan jendela acak)
    const midBuildings: {
      x: number;
      w: number;
      h: number;
      beacon: boolean;
      windows: { rx: number; ry: number; type: "dark" | "warm" | "cool"; alpha: number }[];
    }[] = [];
    let mx = -5, midx = 100;
    while (mx < w + 20) {
      const bw = 22 + seededNoise(midx, 56) * 34;
      const bh = 55 + seededNoise(midx, 57) * 75;
      const beacon = bh > 115 && seededNoise(midx, 55) > 0.45;
      const windows: { rx: number; ry: number; type: "dark" | "warm" | "cool"; alpha: number }[] = [];
      const rows = Math.floor(bh / 11);
      const cols = Math.floor((bw - 6) / 7);

      for (let ry = 0; ry < rows; ry++) {
        for (let c2 = 0; c2 < cols; c2++) {
          const randVal = seededNoise(midx * 13 + ry * 19 + c2, 77);
          let type: "dark" | "warm" | "cool" = "dark";
          if (randVal > 0.80) {
            type = "warm"; // ~20% warm yellow
          } else if (randVal > 0.70) {
            type = "cool"; // ~10% cool blue
          } // ~70% dark

          windows.push({
            rx: mx + 3 + c2 * 7,
            ry: h - bh + 5 + ry * 11,
            type,
            alpha: 0.55 + seededNoise(midx * 7 + ry + c2, 79) * 0.40,
          });
        }
      }
      midBuildings.push({ x: mx, w: bw, h: bh, beacon, windows });
      mx += bw + 4;
      midx++;
    }

    // Layer 3: Foreground Dark Silhouettes (Gedung paling depan — siluet pekat)
    const fgBuildings: { x: number; w: number; h: number }[] = [];
    let fx = -5, fidx = 200;
    while (fx < w + 20) {
      const bw = 28 + seededNoise(fidx, 81) * 40;
      const bh = 24 + seededNoise(fidx, 82) * 32;
      fgBuildings.push({ x: fx, w: bw, h: bh });
      fx += bw + 3;
      fidx++;
    }

    const render = (time: number, nightRatio: number) => {
      // 1. Langit Gradient Malam: Top #06080E -> Middle #0B1224 -> Horizon #24345E
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      const daySky0 = [56, 189, 248];
      const daySky1 = [224, 242, 254];

      const rTop = Math.round(daySky0[0] * (1 - nightRatio) + 6 * nightRatio);
      const gTop = Math.round(daySky0[1] * (1 - nightRatio) + 8 * nightRatio);
      const bTop = Math.round(daySky0[2] * (1 - nightRatio) + 14 * nightRatio);

      const rMid = Math.round(daySky0[0] * (1 - nightRatio) + 11 * nightRatio);
      const gMid = Math.round(daySky0[1] * (1 - nightRatio) + 18 * nightRatio);
      const bMid = Math.round(daySky0[2] * (1 - nightRatio) + 36 * nightRatio);

      const rHor = Math.round(daySky1[0] * (1 - nightRatio) + 36 * nightRatio);
      const gHor = Math.round(daySky1[1] * (1 - nightRatio) + 52 * nightRatio);
      const bHor = Math.round(daySky1[2] * (1 - nightRatio) + 94 * nightRatio);

      sky.addColorStop(0.0, `rgb(${rTop}, ${gTop}, ${bTop})`);
      sky.addColorStop(0.48, `rgb(${rMid}, ${gMid}, ${bMid})`);
      sky.addColorStop(1.0, `rgb(${rHor}, ${gHor}, ${bHor})`);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // 1b. Pendaran Biru Horizon Kota (Subtle Blue City Glow)
      if (nightRatio > 0.1) {
        const cityGlow = ctx.createLinearGradient(0, h * 0.42, 0, h);
        cityGlow.addColorStop(0, "rgba(36, 52, 94, 0)");
        cityGlow.addColorStop(0.65, `rgba(36, 52, 94, ${(0.65 * nightRatio).toFixed(2)})`);
        cityGlow.addColorStop(1, `rgba(56, 189, 248, ${(0.28 * nightRatio).toFixed(2)})`);
        ctx.fillStyle = cityGlow;
        ctx.fillRect(0, h * 0.42, w, h * 0.58);
      }

      // 2. Bulan Malam (Soft Bloom + Subtle Halo + Realistic Glow) VS Matahari Siang
      const celestX = w * 0.76;
      const celestY = h * 0.20;

      if (nightRatio < 0.5) {
        // MATAHARI SIANG
        const sunAlpha = 1 - nightRatio * 2;
        const sunHalo = ctx.createRadialGradient(celestX, celestY, 4, celestX, celestY, 56);
        sunHalo.addColorStop(0, `rgba(255, 251, 235, ${(0.95 * sunAlpha).toFixed(2)})`);
        sunHalo.addColorStop(0.4, `rgba(254, 215, 170, ${(0.5 * sunAlpha).toFixed(2)})`);
        sunHalo.addColorStop(1, `rgba(186, 230, 253, 0)`);
        ctx.fillStyle = sunHalo;
        ctx.fillRect(celestX - 56, celestY - 56, 112, 112);

        ctx.beginPath();
        ctx.arc(celestX, celestY, 14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${sunAlpha.toFixed(2)})`;
        ctx.fill();
      } else {
        // BULAN MALAM — Soft Bloom + Multi-layer Halo Realistic Glow
        const moonAlpha = (nightRatio - 0.5) * 2;

        // Soft Outer Halo
        const outerHalo = ctx.createRadialGradient(celestX, celestY, 2, celestX, celestY, 72);
        outerHalo.addColorStop(0, `rgba(224, 242, 254, ${(0.95 * moonAlpha).toFixed(2)})`);
        outerHalo.addColorStop(0.22, `rgba(56, 189, 248, ${(0.45 * moonAlpha).toFixed(2)})`);
        outerHalo.addColorStop(0.55, `rgba(36, 52, 94, ${(0.18 * moonAlpha).toFixed(2)})`);
        outerHalo.addColorStop(1, "rgba(36, 52, 94, 0)");
        ctx.fillStyle = outerHalo;
        ctx.fillRect(celestX - 72, celestY - 72, 144, 144);

        // Core Moon Disc
        ctx.beginPath();
        ctx.arc(celestX, celestY, 13, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(241, 245, 249, ${moonAlpha.toFixed(2)})`;
        ctx.fill();

        // Subtle Crater Detail
        ctx.fillStyle = `rgba(148, 163, 184, ${(0.32 * moonAlpha).toFixed(2)})`;
        ctx.beginPath(); ctx.arc(celestX - 3.5, celestY - 2.5, 3.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(celestX + 2.5, celestY + 3.2, 4.2, 0, Math.PI * 2); ctx.fill();
      }

      // 3. Bintang (Sparse stars, multiple sizes & slow twinkling animation)
      if (nightRatio > 0.1) {
        stars.forEach((s) => {
          const opacity = (0.22 + (Math.sin(time * s.speed + s.phase) * 0.5 + 0.5) * 0.72) * nightRatio;
          ctx.fillStyle = `rgba(224, 242, 254, ${opacity.toFixed(2)})`;
          ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // 3b. Shooting Star (Meteor jatuh sesekali setiap 20-40 detik)
        const shootingCycle = (time % 28);
        if (shootingCycle < 0.85) {
          const progress = shootingCycle / 0.85;
          const sx = 60 + progress * 220;
          const sy = 15 + progress * 65;
          const tailLen = 35 * (1 - Math.abs(progress - 0.5) * 1.5);

          const meteorGrad = ctx.createLinearGradient(sx - tailLen, sy - tailLen * 0.3, sx, sy);
          meteorGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          meteorGrad.addColorStop(0.7, `rgba(56, 189, 248, ${(0.6 * nightRatio).toFixed(2)})`);
          meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${(0.95 * nightRatio).toFixed(2)})`);

          ctx.strokeStyle = meteorGrad;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(sx - tailLen, sy - tailLen * 0.3);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
      }

      // 3c. Awan bergerak sangat lambat (Translucent slow moving clouds)
      if (nightRatio > 0.05) {
        clouds.forEach((cloud) => {
          const cx = ((cloud.x + time * cloud.speed) % (w + cloud.w + 60)) - cloud.w - 30;
          const cy = cloud.y;
          const alpha = cloud.alpha;

          const drawCloudPuff = (ox: number, oy: number, r: number) => {
            const puff = ctx.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, r);
            puff.addColorStop(0,   `rgba(224, 242, 254, ${(alpha * 0.85).toFixed(2)})`);
            puff.addColorStop(0.5, `rgba(147, 197, 253, ${(alpha * 0.4).toFixed(2)})`);
            puff.addColorStop(1,   `rgba(36, 52, 94, 0)`);
            ctx.fillStyle = puff;
            ctx.beginPath();
            ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
            ctx.fill();
          };

          drawCloudPuff(0,             cy - cloud.h * 0.3, cloud.w * 0.28);
          drawCloudPuff(cloud.w * 0.3, cy - cloud.h * 0.5, cloud.w * 0.22);
          drawCloudPuff(-cloud.w * 0.3, cy - cloud.h * 0.2, cloud.w * 0.18);
          drawCloudPuff(cloud.w * 0.15, cy,                 cloud.w * 0.32);
        });
      }

      // 4. LAYER 1: Distant Skyline (Far Buildings — Bluer tone, Atmospheric Haze, Soft Contrast)
      distantBuildings.forEach((b) => {
        const r = Math.round(90 * (1 - nightRatio) + 15 * nightRatio);
        const g = Math.round(110 * (1 - nightRatio) + 25 * nightRatio);
        const bCol = Math.round(135 * (1 - nightRatio) + 48 * nightRatio);
        ctx.fillStyle = `rgb(${r}, ${g}, ${bCol})`;
        ctx.fillRect(b.x, h - b.h, b.w, b.h);
      });

      // 5. LAYER 2: Medium-Distance Buildings (Mid Buildings — Window Illumination ~70% dark, ~20% warm, ~10% cool)
      midBuildings.forEach((b) => {
        const r = Math.round(65 * (1 - nightRatio) + 12 * nightRatio);
        const g = Math.round(80 * (1 - nightRatio) + 18 * nightRatio);
        const bCol = Math.round(100 * (1 - nightRatio) + 34 * nightRatio);
        ctx.fillStyle = `rgb(${r}, ${g}, ${bCol})`;
        ctx.fillRect(b.x, h - b.h, b.w, b.h);

        b.windows.forEach((win) => {
          if (nightRatio > 0.2) {
            if (win.type === "warm") {
              ctx.fillStyle = `rgba(252, 211, 77, ${(win.alpha * nightRatio).toFixed(2)})`; // Warm Yellow ~20%
            } else if (win.type === "cool") {
              ctx.fillStyle = `rgba(56, 189, 248, ${(win.alpha * nightRatio).toFixed(2)})`; // Cool Blue ~10%
            } else {
              ctx.fillStyle = `rgba(15, 23, 42, ${(0.35 * nightRatio).toFixed(2)})`; // Dark ~70%
            }
            ctx.fillRect(win.rx, win.ry, 3.2, 4.2);
          } else {
            ctx.fillStyle = "rgba(224, 242, 254, 0.4)";
            ctx.fillRect(win.rx, win.ry, 3.2, 4.2);
          }
        });

        if (b.beacon && nightRatio > 0.5) {
          const beaconAlpha = Math.sin(time * 3.5) > 0.1 ? 0.95 : 0.15;
          ctx.fillStyle = `rgba(239, 68, 68, ${(beaconAlpha * nightRatio).toFixed(2)})`;
          ctx.fillRect(b.x + b.w / 2 - 1, h - b.h - 2, 2, 2);
        }
      });

      // 6. LAYER 3: Foreground Dark Silhouettes (Front Buildings — Darkest Silhouettes)
      fgBuildings.forEach((b) => {
        const r = Math.round(45 * (1 - nightRatio) + 6 * nightRatio);
        const g = Math.round(58 * (1 - nightRatio) + 8 * nightRatio);
        const bCol = Math.round(75 * (1 - nightRatio) + 14 * nightRatio);
        ctx.fillStyle = `rgb(${r}, ${g}, ${bCol})`;
        ctx.fillRect(b.x, h - b.h, b.w, b.h);
      });

      // 7. Gradien Gelap Pekat Atas Jendela (Deep Top Vignette Overlay untuk Kontras Navbar)
      const topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      topGrad.addColorStop(0,    "rgba(0, 0, 0, 1.0)");
      topGrad.addColorStop(0.25, "rgba(0, 0, 0, 0.95)");
      topGrad.addColorStop(0.55, "rgba(0, 0, 0, 0.60)");
      topGrad.addColorStop(0.82, "rgba(0, 0, 0, 0.20)");
      topGrad.addColorStop(1,    "rgba(0, 0, 0, 0.0)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, w, h * 0.65);

      tex.needsUpdate = true;
    };

    render(0, lampOn ? 1 : 0);
    return { tex, render };
  }, []);

  const lastCityRender = useRef(0);

  useFrame((_, delta) => {
    const target = lampOn ? 1 : 0;
    if (Math.abs(nightRatioRef.current - target) > 0.005) {
      const k = Math.min(1, delta * 3.0);
      nightRatioRef.current = THREE.MathUtils.lerp(nightRatioRef.current, target, k);
      // Throttle redraw canvas kota ke ~15 FPS — gerakan awan/bintang tetap halus,
      // tanpa menguras CPU saat transisi siang-malam.
      const now = performance.now();
      if (now - lastCityRender.current > 66) {
        lastCityRender.current = now;
        city.render(now * 0.001, nightRatioRef.current);
      }
    }
  });

  return city.tex;
}

/** Gradien linier gelap (untuk AO baked di pertemuan dinding-lantai) — lebih gelap */
function makeLinearShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(0.6, "rgba(0, 0, 0, 0.1)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.35)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/** Gradien radial gelap (untuk AO baked di sudut ruangan) — lebih gelap */
function makeRadialShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(0, 0, 0, 0.35)");
  grad.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/** Gradien linier gelap kiri→transparan (untuk AO vertikal di sudut dinding) — lebih gelap */
function makeHorizontalShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
  grad.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/** Gradien vertikal kerucut cahaya — terang di ujung (apex) → transparan di dasar */
function makeConeGlowTexture(): THREE.CanvasTexture {
  const w = 64;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.85)");
  grad.addColorStop(0.35, "rgba(255, 255, 255, 0.3)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/* ------------------------------ DEBU & SPARKS (SHADER) ------------------------------ */

const DUST_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aWarm;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vWarm;
  varying float vPhase;
  void main() {
    vec3 p = position;
    // Gerakan terbang & melayang dinamis 3D di seluruh ruangan
    p.x += sin(uTime * 0.35 + aPhase) * 0.45 + cos(uTime * 0.15 + aPhase * 2.5) * 0.22;
    p.y += sin(uTime * 0.28 + aPhase * 1.8) * 0.38 + cos(uTime * 0.12 + aPhase * 0.7) * 0.18;
    p.z += cos(uTime * 0.32 + aPhase * 1.2) * 0.42 + sin(uTime * 0.18 + aPhase * 3.0) * 0.20;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float pulse = 1.0 + sin(uTime * 3.2 + aPhase * 5.0) * 0.45;
    gl_PointSize = aSize * pulse * uPixelRatio * (28.0 / -mv.z);
    vWarm = aWarm;
    vPhase = aPhase;
    gl_Position = projectionMatrix * mv;
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uWarm;
  uniform float uOpacity;
  uniform float uTime;
  varying float vWarm;
  varying float vPhase;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float alpha = smoothstep(0.5, 0.01, d);
    alpha *= alpha;
    float sparkle = 0.55 + sin(uTime * 4.5 + vPhase * 8.0) * 0.45;
    vec3 col = mix(uColor, uWarm, clamp(vWarm, 0.0, 1.0));
    gl_FragColor = vec4(col, alpha * uOpacity * sparkle);
  }
`;

/** Debu melayang halus di udara (partikel 3D bertaburan) */
function RoomDust({ count = 60, mobile = false }: { count?: number; mobile?: boolean }) {
  const shader = useMemo(() => {
    const n = mobile ? Math.floor(count * 0.5) : count;
    const positions = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const phases = new Float32Array(n);
    const warms = new Float32Array(n);

    const lampX = -1.5;
    const lampY = 1.35;
    const lampZ = 0.3;

    for (let i = 0; i < n; i++) {
      const nearLight = seededNoise(i, 5) < 0.5;
      if (nearLight) {
        // Kluster partikel berkilau di area lampu & meja
        const r = 0.05 + seededNoise(i, 6) * 1.1;
        const a = seededNoise(i, 7) * Math.PI * 2;
        positions[i * 3] = lampX + Math.cos(a) * r;
        positions[i * 3 + 1] = lampY - 0.4 + seededNoise(i, 8) * 1.5;
        positions[i * 3 + 2] = lampZ + Math.sin(a) * r;
        warms[i] = seededNoise(i, 12) > 0.3 ? 1 : 0;
        sizes[i] = 0.022 + seededNoise(i, 9) * 0.035;
      } else {
        // Partikel terbang bebas di seluruh volume 3D ruangan
        positions[i * 3] = (seededNoise(i, 1) - 0.5) * 8.5;
        positions[i * 3 + 1] = 0.15 + seededNoise(i, 2) * 3.4;
        positions[i * 3 + 2] = -3.0 + seededNoise(i, 3) * 6.5;
        warms[i] = seededNoise(i, 13) > 0.7 ? 1 : 0;
        sizes[i] = 0.015 + seededNoise(i, 4) * 0.024;
      }
      phases[i] = seededNoise(i, 10) * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aWarm", new THREE.BufferAttribute(warms, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: DUST_VERTEX,
      fragmentShader: DUST_FRAGMENT,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: {
          value: typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        },
        uColor: { value: new THREE.Color("#38bdf8") },
        uWarm: { value: new THREE.Color("#ffb03a") },
        uOpacity: { value: 0.95 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geo, mat };
  }, [count, mobile]);

  useFrame((state) => {
    shader.mat.uniforms.uTime.value = state.clock.elapsedTime;
  });

  useEffect(
    () => () => {
      shader.geo.dispose();
      shader.mat.dispose();
    },
    [shader]
  );

  return <points geometry={shader.geo} material={shader.mat} frustumCulled={false} />;
}

/* ------------------------------ VOLUMETRIC LIGHT (FAKE) ------------------------------ */

/** Kerucut cahaya volumetrik palsu — additive ringan, hanya untuk lampu & monitor */
function VolumetricCone({
  origin,
  target,
  radius,
  color,
  opacity,
}: {
  origin: [number, number, number];
  target: [number, number, number];
  radius: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => seededNoise(origin[0] * 7 + origin[2] * 3, 91) * Math.PI * 2, [
    origin,
  ]);
  const { geo, quat, pos, mat } = useMemo(() => {
    const a = new THREE.Vector3(...origin);
    const b = new THREE.Vector3(...target);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const geo = new THREE.ConeGeometry(radius, len, 16, 1, true);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    const mat = new THREE.MeshBasicMaterial({
      map: makeConeGlowTexture(),
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    return { geo, quat: q, pos: a.clone().add(b).multiplyScalar(0.5), mat };
  }, [origin, target, radius, color, opacity]);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );

  return (
    <mesh ref={ref} geometry={geo} material={mat} position={pos} quaternion={quat} />
  );
}

/** Cahaya volumetrik halus: kerucut hangat (#FFC45A) dari lampu meja + kerucut biru (#4A8DFF) monitor */
function RoomVolumetrics({ lampOn }: { lampOn: boolean }) {
  return (
    <group>
      {lampOn && (
        <VolumetricCone
          origin={[-1.5, 1.35, 0.3]}
          target={[-0.25, 1.12, 0.25]}
          radius={0.7}
          color="#FFC45A"
          opacity={0.14}
        />
      )}
      <VolumetricCone
        origin={[-0.6, 1.72, -0.42]}
        target={[0.15, 1.5, 0.35]}
        radius={0.45}
        color="#4A8DFF"
        opacity={0.03}
      />
    </group>
  );
}

/* ------------------------------ REFLEKSI LINGKUNGAN ------------------------------ */

/** Environment map PMREM dari RoomEnvironment — refleksi lembut (bukan cermin) */
function RoomReflections() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new RoomEnvironment();
    const rt = pmrem.fromScene(env, 0.04);
    scene.environment = rt.texture;
    return () => {
      scene.environment = null;
      rt.dispose();
      pmrem.dispose();
      env.dispose();
    };
  }, [gl, scene]);

  return null;
}

/* ------------------------------ SHELF & DEKOR ------------------------------ */

/** Rak dinding minimalis — ~25cm di atas monitor, isi redup, contact shadow di bawah rak */
function Shelf() {
  return (
    <group position={[-0.1, 2.32, -2.86]}>
      {/* Contact shadow lembut di bawah papan rak */}
      <mesh position={[0, -0.06, -0.01]}>
        <planeGeometry args={[1.34, 0.12]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* Papan rak — gelap */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.05, 0.24]} />
        <meshStandardMaterial color="#181a1d" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* 3 buku berdiri — warna redup */}
      <mesh position={[-0.48, 0.158, 0]} rotation={[0, 0.08, -0.02]} castShadow>
        <boxGeometry args={[0.16, 0.26, 0.21]} />
        <meshStandardMaterial color="#1c2d30" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[-0.3, 0.128, 0.02]} rotation={[0, -0.06, 0.02]} castShadow>
        <boxGeometry args={[0.15, 0.2, 0.21]} />
        <meshStandardMaterial color="#2d3542" roughness={0.9} metalness={0.02} />
      </mesh>
      <mesh position={[-0.12, 0.148, -0.01]} rotation={[0, 0.05, -0.015]} castShadow>
        <boxGeometry args={[0.14, 0.24, 0.21]} />
        <meshStandardMaterial color="#242c3d" roughness={0.9} metalness={0.02} />
      </mesh>

      {/* Kamera analog mini — gelap */}
      <group position={[0.22, 0.08, 0.02]}>
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.1, 0.12]} />
          <meshStandardMaterial color="#19191d" roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0.03, 0.06]}>
          <boxGeometry args={[0.06, 0.04, 0.03]} />
          <meshStandardMaterial color="#121215" roughness={0.6} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.03, 16]} />
          <meshStandardMaterial color="#101014" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.085]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.006, 16]} />
          <meshStandardMaterial color="#60636b" roughness={0.35} metalness={0.8} />
        </mesh>
      </group>

      {/* Studio Speaker Mini — Matte Black */}
      <group position={[0.34, 0.08, 0.01]}>
        <mesh castShadow>
          <boxGeometry args={[0.10, 0.14, 0.10]} />
          <meshStandardMaterial color="#121316" roughness={0.8} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.02, 0.052]}>
          <circleGeometry args={[0.03, 16]} />
          <meshStandardMaterial color="#0a0a0d" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, -0.03, 0.052]}>
          <circleGeometry args={[0.02, 16]} />
          <meshStandardMaterial color="#0a0a0d" roughness={0.3} metalness={0.7} />
        </mesh>
      </group>

      {/* Karya seni berbingkai — di kanan, gelap */}
      <group position={[0.54, 0.175, -0.02]} rotation={[-0.07, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.24, 0.20, 0.02]} />
          <meshStandardMaterial color="#141418" roughness={0.7} metalness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.013]}>
          <planeGeometry args={[0.18, 0.14]} />
          <meshBasicMaterial color="#1e222a" />
        </mesh>
      </group>

      {/* Tanaman pot kecil di rak */}
      <group position={[-0.56, 0.07, 0.02]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.045, 0.035, 0.08, 12]} />
          <meshStandardMaterial color="#19191d" roughness={0.8} metalness={0.1} />
        </mesh>
        {/* Daun succulents */}
        {[0, 1.2, 2.4, 3.6, 4.8].map((rot, i) => (
          <mesh
            key={i}
            position={[Math.cos(rot) * 0.02, 0.055, Math.sin(rot) * 0.02]}
            rotation={[0.3, rot, 0.2]}
          >
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#1d3024" roughness={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------ TANAMAN ------------------------------ */

/* ------------------------------ REALISTIC INDOOR POTTED PLANT ------------------------------ */

/** Data variasi 9 helai daun tanaman hias indoor (Rubber Plant / Monstera) */
const REALISTIC_PLANT_LEAVES = [
  // Leaf 1: Daun utama bawah kanan — melengkung mekar
  { pos: [0.12, 0.22, 0.08], rot: [0.35, 0.4, -0.25], scale: [0.18, 0.28, 0.012], col: "#133b24" },
  // Leaf 2: Daun bawah kiri — miring keluar
  { pos: [-0.14, 0.26, -0.06], rot: [-0.28, -1.1, 0.30], scale: [0.17, 0.26, 0.012], col: "#194a2e" },
  // Leaf 3: Daun tengah depan — posisi membusur rendah
  { pos: [0.04, 0.30, 0.15], rot: [0.45, -0.2, 0.12], scale: [0.19, 0.29, 0.012], col: "#17442a" },
  // Leaf 4: Daun tengah belakang — naik ke atas
  { pos: [-0.08, 0.36, -0.14], rot: [-0.40, 2.1, -0.15], scale: [0.18, 0.27, 0.012], col: "#133b24" },
  // Leaf 5: Daun tengah kanan — mekar tinggi
  { pos: [0.16, 0.42, -0.05], rot: [0.15, 1.3, -0.32], scale: [0.20, 0.31, 0.012], col: "#1a4e30" },
  // Leaf 6: Daun tengah kiri — meliuk lembut
  { pos: [-0.15, 0.46, 0.08], rot: [0.22, -2.2, 0.25], scale: [0.19, 0.28, 0.012], col: "#143e26" },
  // Leaf 7: Daun atas depan — muda & mekar tegak
  { pos: [0.06, 0.52, 0.09], rot: [0.28, 0.3, -0.10], scale: [0.17, 0.25, 0.012], col: "#1e5837" },
  // Leaf 8: Daun pucuk teratas — daun kuncup berdiri
  { pos: [0.0, 0.60, -0.02], rot: [0.08, -0.4, 0.05], scale: [0.14, 0.22, 0.012], col: "#22623e" },
];

/** Tanaman hias indoor realistis — pot keramik matte charcoal + daun Rubber Plant/Monstera organik */
function Plant() {
  return (
    <group position={[-3.7, 0, -2.5]}>
      {/* Pot Keramik / Beton Matte Charcoal Minimalis */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.36, 24]} />
        <meshStandardMaterial color="#1c1e22" roughness={0.82} metalness={0.04} />
      </mesh>
      {/* Lis Bibir Pot */}
      <mesh position={[0, 0.355, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.188, 0.188, 0.02, 24]} />
        <meshStandardMaterial color="#24262b" roughness={0.78} metalness={0.05} />
      </mesh>

      {/* Tanah Potting Organik Gelap */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.165, 0.165, 0.02, 16]} />
        <meshStandardMaterial color="#16100a" roughness={0.95} />
      </mesh>

      {/* Batang Utama & Percabangan Organik */}
      <group position={[0, 0.34, 0]}>
        {/* Batang Kayu Utama */}
        <mesh position={[0, 0.16, 0]} rotation={[0.04, 0, -0.03]} castShadow>
          <cylinderGeometry args={[0.014, 0.022, 0.32, 10]} />
          <meshStandardMaterial color="#2a2016" roughness={0.85} />
        </mesh>

        {/* Daun-daun Tanaman Indoor dengan Lekukan & Tangkai Organik */}
        {REALISTIC_PLANT_LEAVES.map((leaf, i) => (
          <group
            key={i}
            position={leaf.pos as [number, number, number]}
            rotation={leaf.rot as [number, number, number]}
          >
            {/* Tangkai Daun */}
            <mesh position={[0, -0.06, 0]} rotation={[0.18, 0, 0]} castShadow>
              <cylinderGeometry args={[0.004, 0.007, 0.14, 8]} />
              <meshStandardMaterial color="#1f3424" roughness={0.65} />
            </mesh>

            {/* Helai Daun Membulat Tebal dengan Gloss Halus */}
            <RoundedBox
              args={leaf.scale as [number, number, number]}
              radius={0.06}
              smoothness={1}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={leaf.col}
                roughness={0.40}
                metalness={0.03}
                envMapIntensity={0.6}
              />
            </RoundedBox>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------ RGB CORNER LIGHT BAR ------------------------------ */

/** Texture gradien pendaran lampu sudut ke dinding */
function makeCornerWallGlowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(0, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0,    "rgba(125, 211, 252, 1.0)");
  grad.addColorStop(0.20, "rgba(59,  130, 246, 0.78)");
  grad.addColorStop(0.55, "rgba(30,  64,  175, 0.38)");
  grad.addColorStop(0.82, "rgba(30,  64,  175, 0.14)");
  grad.addColorStop(1,    "rgba(0,   0,   0,   0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Texture gradien pendaran alas lampu sudut ke lantai */
function makeCornerFloorGlowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 4, size / 2, size / 2, size / 2);
  grad.addColorStop(0,    "rgba(125, 211, 252, 1.0)");
  grad.addColorStop(0.20, "rgba(59,  130, 246, 0.78)");
  grad.addColorStop(0.55, "rgba(30,  64,  175, 0.38)");
  grad.addColorStop(0.82, "rgba(30,  64,  175, 0.14)");
  grad.addColorStop(1,    "rgba(0,   0,   0,   0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Lampu sudut RGB minimalis — pendaran gradien berkilau kaya ke sudut dinding & lantai */
function CornerRGBLamp() {
  const ledRef = useRef<THREE.MeshStandardMaterial>(null);
  const cornerWallGlowTex = useMemo(() => makeCornerWallGlowTexture(), []);
  const cornerFloorGlowTex = useMemo(() => makeCornerFloorGlowTexture(), []);

  const glowWallMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: cornerWallGlowTex,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [cornerWallGlowTex]
  );

  const glowWallMat2 = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: cornerWallGlowTex,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [cornerWallGlowTex]
  );

  const glowFloorMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: cornerFloorGlowTex,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [cornerFloorGlowTex]
  );



  return (
    <group position={[-4.32, 0, -2.92]} rotation={[0, Math.PI / 4, 0]}>
      {/* Base stand */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#141418" roughness={0.6} metalness={0.6} />
      </mesh>

      {/* Gradien Glow ke Lantai di Alas Lampu Sudut (2.4m x 2.4m) */}
      <mesh position={[0, 0.006, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 2.4]} />
        <primitive object={glowFloorMat} attach="material" />
      </mesh>

      {/* Vertical Aluminum Housing */}
      <mesh position={[0, 1.5, -0.012]} castShadow>
        <boxGeometry args={[0.018, 2.9, 0.018]} />
        <meshStandardMaterial color="#0e0e11" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* LED Diffuser Strip berkilau melempar gradien ke sudut dinding */}
      <mesh position={[0, 1.5, 0.004]}>
        <boxGeometry args={[0.022, 2.85, 0.01]} />
        <meshStandardMaterial
          ref={ledRef}
          color="#7dd3fc"
          emissive="#3b82f6"
          emissiveIntensity={2.6}
          roughness={0.15}
        />
      </mesh>

      {/* Gradien Glow ke Dinding Belakang Sudut — layer 1 (2.8m x 3.2m) */}
      <mesh position={[-0.42, 1.55, 0.22]} rotation={[0, Math.PI / 4, 0]}>
        <planeGeometry args={[2.8, 3.2]} />
        <primitive object={glowWallMat} attach="material" />
      </mesh>

      {/* Gradien Glow ke Dinding Belakang Sudut — layer 2 boost tengah (1.4m x 3.0m) */}
      <mesh position={[-0.28, 1.55, 0.14]} rotation={[0, Math.PI / 4, 0]}>
        <planeGeometry args={[1.4, 3.0]} />
        <primitive object={glowWallMat2} attach="material" />
      </mesh>

      {/* Gradien Glow ke Dinding Kiri Sudut — layer 1 (2.8m x 3.2m) */}
      <mesh position={[0.42, 1.55, 0.22]} rotation={[0, -Math.PI / 4, 0]}>
        <planeGeometry args={[2.8, 3.2]} />
        <primitive object={glowWallMat} attach="material" />
      </mesh>

      {/* Gradien Glow ke Dinding Kiri Sudut — layer 2 boost tengah (1.4m x 3.0m) */}
      <mesh position={[0.28, 1.55, 0.14]} rotation={[0, -Math.PI / 4, 0]}>
        <planeGeometry args={[1.4, 3.0]} />
        <primitive object={glowWallMat2} attach="material" />
      </mesh>

      {/* Corner RGB Wash Point Lights — lebih kuat */}
      <pointLight
        position={[0.08, 2.2, 0.28]}
        color="#7dd3fc"
        intensity={1.2}
        distance={5.0}
        decay={1.8}
      />
      <pointLight
        position={[0.08, 1.0, 0.28]}
        color="#3b82f6"
        intensity={0.9}
        distance={4.2}
        decay={1.8}
      />
      <pointLight
        position={[0.08, 0.15, 0.28]}
        color="#3b82f6"
        intensity={0.5}
        distance={3.0}
        decay={2}
      />
    </group>
  );
}

/* ------------------------------ BASEBOARD LED STRIP ------------------------------ */

/** Texture gradien pendaran cahaya LED ke lantai */
function makeFloorGradientTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, size);
  grad.addColorStop(0,    "rgba(125, 211, 252, 1.0)");
  grad.addColorStop(0.2,  "rgba(59,  130, 246, 0.78)");
  grad.addColorStop(0.55, "rgba(30,  64,  175, 0.38)");
  grad.addColorStop(0.82, "rgba(30,  64,  175, 0.14)");
  grad.addColorStop(1,    "rgba(0,   0,   0,   0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Texture gradien pendaran cahaya LED ke dinding terdekat */
function makeWallGradientTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, size, 0, 0);
  grad.addColorStop(0,    "rgba(125, 211, 252, 1.0)");
  grad.addColorStop(0.22, "rgba(59,  130, 246, 0.75)");
  grad.addColorStop(0.55, "rgba(30,  64,  175, 0.35)");
  grad.addColorStop(0.82, "rgba(30,  64,  175, 0.12)");
  grad.addColorStop(1,    "rgba(0,   0,   0,   0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Strip LED aksen di garis pinggiran bawah dinding dengan pendaran gradien ke lantai & dinding terdekat */
function BaseboardLED() {
  const ledRef = useRef<THREE.MeshStandardMaterial>(null);
  const floorGlowTex = useMemo(() => makeFloorGradientTexture(), []);
  const wallGlowTex = useMemo(() => makeWallGradientTexture(), []);

  const glowFloorMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: floorGlowTex,
        transparent: true,
        opacity: 0.98,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [floorGlowTex]
  );

  const glowWallMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: wallGlowTex,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [wallGlowTex]
  );



  return (
    <group>
      {/* Strip LED Dinding Belakang */}
      <mesh position={[0, 0.105, BACK_Z + 0.042]}>
        <boxGeometry args={[WALL_TEX.w, 0.014, 0.014]} />
        <meshStandardMaterial
          ref={ledRef}
          color="#7dd3fc"
          emissive="#3b82f6"
          emissiveIntensity={2.2}
          roughness={0.15}
        />
      </mesh>

      {/* Gradien Glow ke Lantai (Dinding Belakang) — disebar 0.72m */}
      <mesh position={[0, 0.006, BACK_Z + 0.36]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[WALL_TEX.w, 0.72]} />
        <primitive object={glowFloorMat} attach="material" />
      </mesh>

      {/* Gradien Glow ke Dinding Belakang (Naik ke Dinding) — disebar 0.65m */}
      <mesh position={[0, 0.36, BACK_Z + 0.045]}>
        <planeGeometry args={[WALL_TEX.w, 0.65]} />
        <primitive object={glowWallMat} attach="material" />
      </mesh>

      {/* Strip LED Dinding Kiri */}
      <mesh position={[LEFT_X + 0.042, 0.105, LEFT_WALL.cz]}>
        <boxGeometry args={[0.014, 0.014, LEFT_WALL.w]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#3b82f6"
          emissiveIntensity={2.2}
          roughness={0.15}
        />
      </mesh>

      {/* Gradien Glow ke Lantai (Dinding Kiri) — disebar 0.72m */}
      <mesh position={[LEFT_X + 0.36, 0.006, LEFT_WALL.cz]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[LEFT_WALL.w, 0.72]} />
        <primitive object={glowFloorMat} attach="material" />
      </mesh>

      {/* Gradien Glow ke Dinding Kiri (Naik ke Dinding) — disebar 0.65m */}
      <mesh position={[LEFT_X + 0.045, 0.36, LEFT_WALL.cz]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[LEFT_WALL.w, 0.65]} />
        <primitive object={glowWallMat} attach="material" />
      </mesh>

      {/* Cahaya Point Light Aksen Pendaran LED pada garis lantai-dinding */}
      <pointLight
        position={[-2.2, 0.20, BACK_Z + 0.22]}
        color="#3b82f6"
        intensity={0.45}
        distance={3.5}
        decay={2}
      />
      <pointLight
        position={[2.2, 0.20, BACK_Z + 0.22]}
        color="#3b82f6"
        intensity={0.45}
        distance={3.5}
        decay={2}
      />
      <pointLight
        position={[LEFT_X + 0.22, 0.20, -0.5]}
        color="#3b82f6"
        intensity={0.40}
        distance={3.2}
        decay={2}
      />
    </group>
  );
}

/* ------------------------------ RUANGAN ------------------------------ */

/**
 * OfficeRoom — lingkungan kerja gelap modern:
 * dinding charcoal plaster, lantai dark oak, jendela besar dengan kota malam,
 * panel akustik, rak mengambang, tanaman, LED backlight biru, AO baked & debu.
 */
export function OfficeRoom({
  mobile = false,
  lampOn = false,
}: {
  mobile?: boolean;
  lampOn?: boolean;
}) {
  const wallMaterial = useMemo(() => {
    const plaster = makePlasterTexture();
    return new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: plaster,
      bumpMap: plaster,
      bumpScale: 0.001,
      roughness: 0.98,
      metalness: 0.01,
      envMapIntensity: 0.08,
    });
  }, []);

  const floorMaterial = useMemo(() => {
    const wood = makeWoodFloorTexture();
    const rough = makeWoodRoughnessTexture();
    return new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: wood,
      bumpMap: wood,
      bumpScale: 0.006,
      roughnessMap: rough,
      roughness: 0.92,
      metalness: 0.01,
      envMapIntensity: 0.08,
    });
  }, []);

  const baseboardMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#181A1F",
        roughness: 0.8,
        metalness: 0.01,
        envMapIntensity: 0.08,
      }),
    []
  );

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d1d5db",
        roughness: 0.15,
        metalness: 0.95,
        envMapIntensity: 1.5,
      }),
    []
  );

  const glassMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0c1524",
        transparent: true,
        opacity: 0.32,
        roughness: 0.05,
        metalness: 0.40,
        envMapIntensity: 1.4,
      }),
    []
  );

  const cityTex = useCityTexture(lampOn);
  const cityMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({ map: cityTex, color: "#ffffff", toneMapped: false });
  }, [cityTex]);

  const panelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#151618",
        roughness: 0.95,
        metalness: 0.01,
        envMapIntensity: 0.02,
      }),
    []
  );

  const aoLinearMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: makeLinearShadowTexture(),
        transparent: true,
        blending: THREE.MultiplyBlending,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    []
  );

  const aoRadialMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: makeRadialShadowTexture(),
        transparent: true,
        blending: THREE.MultiplyBlending,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    []
  );

  const aoHorizontalMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: makeHorizontalShadowTexture(),
        transparent: true,
        blending: THREE.MultiplyBlending,
        depthWrite: false,
        fog: false,
        toneMapped: false,
      }),
    []
  );

  // Panels: clean 2x3, moved farther from monitor, increased spacing
  const panelCols = [2.65, 3.28];
  const panelRows = [0.85, 1.55, 2.25];

  return (
    <group>
      <RoomReflections />

      {/* ============ LANTAI — dark oak ============ */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0.4]}
        material={floorMaterial}
        receiveShadow
      >
        <planeGeometry args={[11, 10]} />
      </mesh>

      {/* ============ DINDING BELAKANG — plaster charcoal ============ */}
      <mesh position={[0, WALL_H / 2, BACK_Z]} material={wallMaterial} receiveShadow>
        <planeGeometry args={[WALL_TEX.w, WALL_TEX.h]} />
      </mesh>

      {/* ============ DINDING KIRI (sudut 90°) — Dibagi atas & bawah untuk bukaan jendela panorama ============ */}
      {/* Wall bagian bawah (di bawah jendela) */}
      <mesh
        position={[LEFT_X, 0.10, LEFT_WALL.cz]}
        rotation={[0, Math.PI / 2, 0]}
        material={wallMaterial}
        receiveShadow
      >
        <planeGeometry args={[LEFT_WALL.w, 0.20]} />
      </mesh>
      {/* Wall bagian atas (di atas jendela) */}
      <mesh
        position={[LEFT_X, 3.90, LEFT_WALL.cz]}
        rotation={[0, Math.PI / 2, 0]}
        material={wallMaterial}
        receiveShadow
      >
        <planeGeometry args={[LEFT_WALL.w, 0.60]} />
      </mesh>

      {/* ============ BASEBOARD ============ */}
      <mesh position={[0, 0.05, BACK_Z + 0.03]} material={baseboardMaterial} castShadow>
        <boxGeometry args={[WALL_TEX.w, 0.1, 0.04]} />
      </mesh>
      <mesh
        position={[LEFT_X + 0.03, 0.05, LEFT_WALL.cz]}
        material={baseboardMaterial}
        castShadow
      >
        <boxGeometry args={[0.04, 0.1, LEFT_WALL.w]} />
      </mesh>

      {/* ============ LED STRIP BASEBOARD (Glow Garis Pinggiran Bawah) ============ */}
      <BaseboardLED />

      {/* ============ JENDELA CORNER PANORAMA (DINDING BELAKANG + KIRI 90°) ============ */}
      {/* Jendela Dinding Belakang */}
      <group position={[WIN_CX, WIN_CY, WIN.z]}>
        {/* Kota/Langit (di depan dinding, dibingkai rel jendela) */}
        <mesh position={[0, 0, 0.015]} material={cityMaterial}>
          <planeGeometry args={[WIN_W, WIN_H]} />
        </mesh>
        {/* Kaca jendela */}
        <mesh position={[0, 0, 0.06]} material={glassMaterial}>
          <planeGeometry args={[WIN_W, WIN_H]} />
        </mesh>
        {/* Bingkai matte black aluminium — hanya bagian bawah & kanan (tanpa border atas) */}
        <mesh position={[0, -WIN_H / 2 - 0.03, 0.1]} material={frameMaterial}>
          <boxGeometry args={[WIN_W + 0.12, 0.06, 0.07]} />
        </mesh>
        <mesh position={[WIN_W / 2 + 0.03, 0, 0.1]} material={frameMaterial}>
          <boxGeometry args={[0.06, WIN_H + 0.06, 0.07]} />
        </mesh>
        {/* Mullion vertikal panorama belakang */}
        <mesh position={[-2.2, 0, 0.1]} material={frameMaterial}>
          <boxGeometry args={[0.035, WIN_H, 0.06]} />
        </mesh>
        <mesh position={[-0.1, 0, 0.1]} material={frameMaterial}>
          <boxGeometry args={[0.035, WIN_H, 0.06]} />
        </mesh>
        <mesh position={[2.0, 0, 0.1]} material={frameMaterial}>
          <boxGeometry args={[0.035, WIN_H, 0.06]} />
        </mesh>
      </group>

      {/* Jendela Dinding Kiri (Menyambung 90°) */}
      <group position={[LEFT_X, WIN_CY, WIN_LEFT.cz]} rotation={[0, Math.PI / 2, 0]}>
        {/* Kota/Langit di Dinding Kiri */}
        <mesh position={[0, 0, 0.015]} material={cityMaterial}>
          <planeGeometry args={[WIN_LEFT.w, WIN_H]} />
        </mesh>
        {/* Kaca Jendela Dinding Kiri */}
        <mesh position={[0, 0, 0.06]} material={glassMaterial}>
          <planeGeometry args={[WIN_LEFT.w, WIN_H]} />
        </mesh>
        {/* Bingkai matte black aluminium — hanya bagian bawah & ujung depan (tanpa border atas) */}
        <mesh position={[0, -WIN_H / 2 - 0.03, 0.1]} material={frameMaterial}>
          <boxGeometry args={[WIN_LEFT.w + 0.12, 0.06, 0.07]} />
        </mesh>
        {/* Bingkai Ujung Depan (Z = 3.7) */}
        <mesh position={[WIN_LEFT.w / 2 + 0.03, 0, 0.1]} material={frameMaterial}>
          <boxGeometry args={[0.06, WIN_H + 0.06, 0.07]} />
        </mesh>
        {/* Mullion vertikal panorama dinding kiri */}
        <mesh position={[-1.8, 0, 0.1]} material={frameMaterial}>
          <boxGeometry args={[0.035, WIN_H, 0.06]} />
        </mesh>
        <mesh position={[-0.2, 0, 0.1]} material={frameMaterial}>
          <boxGeometry args={[0.035, WIN_H, 0.06]} />
        </mesh>
        <mesh position={[1.4, 0, 0.1]} material={frameMaterial}>
          <boxGeometry args={[0.035, WIN_H, 0.06]} />
        </mesh>
      </group>

      {/* Tiang Sudut 90° Seamless Corner Post */}
      <mesh position={[LEFT_X + 0.03, WIN_CY, BACK_Z + 0.03]} material={frameMaterial}>
        <boxGeometry args={[0.08, WIN_H + 0.06, 0.08]} />
      </mesh>

      {/* ============ TANAMAN — sudut kiri belakang ============ */}
      <Plant />






      {/* ============ VOLUMETRIC LIGHT HALUS ============ */}
      <RoomVolumetrics lampOn={lampOn} />

      {/* ============ DEBU MELAYANG ============ */}
      <RoomDust mobile={mobile} />
    </group>
  );
}
