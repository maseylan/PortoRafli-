"use client";

import { useState, useSyncExternalStore } from "react";
import { FALLBACK_PALETTE, type Palette } from "../config/sceneConfig";

function readPalette(): Palette {
  if (typeof window === "undefined") return FALLBACK_PALETTE;
  try {
    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    return {
      primary: read("--color-primary", FALLBACK_PALETTE.primary),
      secondary: read("--color-secondary", FALLBACK_PALETTE.secondary),
      tertiary: read("--color-tertiary", FALLBACK_PALETTE.tertiary),
      surface: read("--color-surface", FALLBACK_PALETTE.surface),
    };
  } catch {
    return FALLBACK_PALETTE;
  }
}

/**
 * Baca warna design system dari CSS custom properties (globals.css @theme)
 * agar material 3D selalu sinkron dengan DOM — pola growon.kr.
 */
export function useScenePalette(): Palette {
  const [palette] = useState<Palette>(readPalette);
  return palette;
}

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => false
  );
}

/**
 * Deteksi dukungan WebGL (fallback: HeroSection pakai video hero).
 * Sinkron via lazy initializer — selesai sebelum render pertama.
 */
export function useWebGLSupport(): boolean {
  const [supported] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      return false;
    }
  });
  return supported;
}
