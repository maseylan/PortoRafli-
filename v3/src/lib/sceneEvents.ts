"use client";

import type { SceneObjectAction } from "../config/sceneConfig";

export type SceneEvent =
  | { type: "object-click"; objectId: string; action: SceneObjectAction }
  | { type: "hover"; objectId: string | null; x: number; y: number }
  | { type: "boot-done" }
  | { type: "panel-open" }
  | { type: "panel-close" }
  | { type: "lamp-change"; on: boolean };

type SceneListener = (event: SceneEvent) => void;

const listeners = new Set<SceneListener>();

export function emitSceneEvent(event: SceneEvent) {
  listeners.forEach((listener) => listener(event));
}

export function subscribeSceneEvents(listener: SceneListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
