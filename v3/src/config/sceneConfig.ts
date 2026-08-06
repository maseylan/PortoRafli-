export type PanelId = "work" | "about" | "contact";

export type SceneObjectAction =
  | { type: "navigate"; panel: PanelId }
  | { type: "toggle-music" }
  | { type: "toggle-lamp" }
  | { type: "physics-pencil" }
  | { type: "physics-chair" }
  | { type: "physics-plant" }
  | { type: "physics-bench" }
  | { type: "sfx"; sound: "type" | "mouse" };

export interface SceneObjectConfig {
  id: string;
  label: string;
  /** label yang muncul di tooltip */
  actionLabel: string;
  /** posisi PUSAT objek (lokal, meja di posisi 0,0,0) */
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  /** urutan jatuh saat drop-in — makin kecil makin awal (meja = 1) */
  dropOrder: number;
  action: SceneObjectAction;
}

/** Tinggi permukaan atas meja — semua objek duduk di atasnya */
export const DESK_TOP_Y = 1.15;

/** Meja lurus — komposisi growon (terpusat, mengisi ±60% viewport) */
export const DESK_SIZE = {
  width: 3.4,
  depth: 1.9,
  thickness: 0.16,
  legThickness: 0.13,
};

/**
 * SCENE_OBJECTS — "signature scene" meja kerja bentuk L
 * (pola growon.kr). Objek dibuat prosedural di components/scene/objects.tsx.
 * Mapping objek → aksi:
 *   monitor  → work (focal point, glow)
 *   notebook → about
 *   cup      → contact
 *   turntable → musik
 *   lamp (standing) → point light
 *   keyboard → SFX type
 *   pencil   → fisika menggelinding
 *   chair (kursi kantor) → putar 360°
 */
export const SCENE_OBJECTS: SceneObjectConfig[] = [
  {
    id: "monitor",
    label: "MONITOR",
    actionLabel: "WORK",
    position: [-0.6, 1.8, -0.48],
    rotation: [0, 0.55, 0],
    dropOrder: 2,
    action: { type: "navigate", panel: "work" },
  },
  {
    id: "keyboard",
    label: "KEYBOARD",
    actionLabel: "TYPE",
    position: [-0.08, 1.175, 0.3],
    rotation: [0, 0.52, 0],
    dropOrder: 3,
    action: { type: "sfx", sound: "type" },
  },
  {
    id: "mouse",
    label: "MOUSE",
    actionLabel: "CLICK",
    position: [0.42, 1.175, 0.45],
    rotation: [0, 0.45, 0],
    dropOrder: 4,
    action: { type: "sfx", sound: "mouse" },
  },
  {
    id: "notebook",
    label: "NOTEBOOK",
    actionLabel: "ABOUT",
    position: [-0.78, 1.175, 0.18],
    rotation: [0, 0.88, 0],
    dropOrder: 5,
    action: { type: "navigate", panel: "about" },
  },
  {
    id: "pencil",
    label: "PENCIL",
    actionLabel: "ROLL",
    position: [-0.76, 1.215, 0.16],
    rotation: [0.08, 1.12, 0.05],
    dropOrder: 6,
    action: { type: "physics-pencil" },
  },
  {
    id: "cup",
    label: "COFFEE CUP",
    actionLabel: "CONTACT",
    position: [0.72, 1.18, 0.38],
    rotation: [0, 0.8, 0],
    dropOrder: 7,
    action: { type: "navigate", panel: "contact" },
  },
  {
    id: "turntable",
    label: "TURNTABLE",
    actionLabel: "MUSIC",
    position: [1.25, 1.18, -0.5],
    rotation: [0, -0.35, 0],
    dropOrder: 8,
    action: { type: "toggle-music" },
  },
  {
    id: "lamp",
    label: "FLOOR LAMP",
    actionLabel: "LIGHT",
    position: [-2.0, 0, 0.35],
    rotation: [0, 0.15, 0],
    dropOrder: 9,
    action: { type: "toggle-lamp" },
  },
  {
    id: "plant",
    label: "TALL PINE TREE",
    actionLabel: "SWAY PINE",
    position: [-2.85, 0, 1.85],
    rotation: [0, 0.4, 0],
    scale: [1.75, 1.85, 1.75],
    dropOrder: 10,
    action: { type: "physics-plant" },
  },
  {
    id: "bench",
    label: "ERGONOMIC CHAIR",
    actionLabel: "SIT",
    position: [0.25, 0, 1.52],
    rotation: [0, 3.29, 0],
    scale: [1.18, 1.18, 1.18],
    dropOrder: 11,
    action: { type: "physics-bench" },
  },
];

/**
 * FOCUS_POINTS — framing dive-in per objek (pola growon):
 * saat objek diklik, kamera mendekat ke titik fokus sebelum panel dibuka.
 */
export const FOCUS_POINTS: Record<
  string,
  { target: [number, number, number]; depth: number; liftY: number }
> = {
  monitor: {
    target: [-0.6, 1.8, -0.44],
    depth: 0.15,
    liftY: 0,
  },
  notebook: {
    target: [-0.78, 1.175, 0.18],
    depth: 1.2,
    liftY: 0.1,
  },
  cup: {
    target: [0.72, 1.18, 0.38],
    depth: 1.2,
    liftY: 0.05,
  },
};

/** Kamera diam (dunia "nyata") — pandangan dekat: meja & kursi mengisi frame */
export const BASE_CAMERA = {
  position: [4.6, 2.9, 5.15] as [number, number, number],
  target: [0.15, 1.05, 0.05] as [number, number, number],
};

export const CAMERA_CONFIG = {
  fov: 30,
  near: 0.1,
  far: 60,
  /** parallax pointer — sangat kecil, tidak memusingkan */
  parallaxFactor: 0.08,
  /** kecepatan easing kamera (base ↔ dive) */
  lerpSpeed: 3.2,
};

/** Warna dibaca runtime dari CSS vars (sinkron design system DOM ↔ WebGL) */
export const FALLBACK_PALETTE = {
  primary: "#2563eb",
  secondary: "#94a3b8",
  tertiary: "#facc15",
  surface: "#09090b",
};

export type Palette = typeof FALLBACK_PALETTE;
