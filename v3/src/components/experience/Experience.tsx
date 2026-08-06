"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import SceneCanvas from "../scene/SceneCanvas";
import { subscribeSceneEvents } from "../../lib/sceneEvents";
import { SCENE_OBJECTS, type PanelId } from "../../config/sceneConfig";
import { unlockAudio, playWhoosh, setMuted, toggleMusic, isMusicPlaying } from "../../audio/audioManager";
import Navigation from "./Navigation";
import PanelRouter from "./PanelRouter";
import BootScreen from "./BootScreen";

interface TooltipState {
  label: string;
  x: number;
  y: number;
}

const PANEL_OBJECTS = ["monitor", "notebook", "cup"];

/** Durasi animasi dive-in kamera sebelum panel dibuka (pola growon) */
const DIVE_DELAY_MS = 750;
/** Fade penutup scene mulai saat kamera hampir menembus layar objek */
const DIVE_FADE_START_MS = 380;
const DIVE_FADE_MS = 420;

/** Tooltip hover tanpa re-render React — update langsung ke DOM ref */
function HoverTooltip({ booted, panel }: { booted: boolean; panel: PanelId | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribeSceneEvents((event) => {
      if (event.type === "hover") {
        const el = ref.current;
        if (!el) return;
        if (!event.objectId || !booted || panel) {
          el.style.display = "none";
          return;
        }
        const config = SCENE_OBJECTS.find((o) => o.id === event.objectId);
        if (config) {
          el.textContent = config.actionLabel;
          el.style.left = `${event.x + 16}px`;
          el.style.top = `${event.y + 16}px`;
          el.style.display = "block";
        } else {
          el.style.display = "none";
        }
      }
    });
  }, [booted, panel]);

  return (
    <div
      ref={ref}
      className="fixed z-40 pointer-events-none font-mono text-[10px] font-bold tracking-widest uppercase text-on-primary bg-primary px-3 py-1.5 rounded-lg shadow-2xl"
      style={{ display: "none" }}
    />
  );
}

export default function Experience() {
  const [booted, setBooted] = useState(false);
  const [fading, setFading] = useState(false);
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [muted, setMutedState] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [diveFade, setDiveFade] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const bootTimer = useRef<number | null>(null);
  const fadeTimer = useRef<number | null>(null);
  const panelTimer = useRef<number | null>(null);
  const diveFadeTimer = useRef<number | null>(null);
  const toastTimer = useRef<number | null>(null);
  const panelRef = useRef<PanelId | null>(null);

  useEffect(() => {
    panelRef.current = panel;
  }, [panel]);

  useEffect(() => {
    return () => {
      if (bootTimer.current) window.clearTimeout(bootTimer.current);
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
      if (panelTimer.current) window.clearTimeout(panelTimer.current);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  // Boot: tunggu scene siap (min 700ms agar tidak berkedip), lalu fade-out
  useEffect(() => {
    const unsubscribe = subscribeSceneEvents((event) => {
      if (event.type === "boot-done") {
        bootTimer.current = window.setTimeout(() => {
          setBooted(true);
          fadeTimer.current = window.setTimeout(() => setFading(true), 120);
        }, 700);
      }
    });
    return () => {
      unsubscribe();
      if (bootTimer.current) window.clearTimeout(bootTimer.current);
    };
  }, []);

  // Unlock audio pada gesture pertama
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  // Sinkron panel dengan URL hash (#work, #about, #contact) — pola growon pushState
  useEffect(() => {
    const parseHash = (): PanelId | null => {
      const h = window.location.hash.replace("#", "");
      return h === "work" || h === "about" || h === "contact" ? h : null;
    };

    const onPopState = () => {
      const h = parseHash();
      setPanel(h);
      if (!h) setFocusId(null);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const openPanel = useCallback((id: PanelId) => {
    if (panelRef.current === id && window.location.hash === `#${id}`) {
      setPanel(id);
      return;
    }
    if (panelTimer.current) window.clearTimeout(panelTimer.current);

    const object = SCENE_OBJECTS.find(
      (o) => o.action.type === "navigate" && o.action.panel === id
    );

    const commit = () => {
      // Panel ganti saat sudah terbuka → replace agar history tidak numpuk
      if (panelRef.current !== null) {
        window.history.replaceState({ panel: id }, "", `#${id}`);
      } else {
        window.history.pushState({ panel: id }, "", `#${id}`);
      }
      setPanel(id);
      playWhoosh(true);
    };

    if (object && panelRef.current === null) {
      // Dive-in: kamera mendekat ke objek dulu, panel buka setelah animasi
      setFocusId(object.id);
      panelTimer.current = window.setTimeout(commit, DIVE_DELAY_MS);
    } else {
      commit();
    }
  }, []);

  const closePanel = useCallback(() => {
    setFocusId(null);
    if (window.location.hash) {
      window.history.back();
    } else {
      setPanel(null);
    }
    playWhoosh(false);
  }, []);

  const toggleMute = () => {
    setMutedState((prev) => {
      setMuted(!prev);
      return !prev;
    });
  };

  const toggleMusicFromNav = () => {
    toggleMusic();
    showToast(isMusicPlaying() ? "Music on" : "Music off");
  };

  useEffect(() => {
    return subscribeSceneEvents((event) => {
      if (event.type !== "object-click") return;
      const action = event.action;
      if (action.type === "navigate" && action.panel) {
        openPanel(action.panel);
      } else if (action.type === "toggle-music") {
        showToast(isMusicPlaying() ? "Music on" : "Music off");
      } else if (action.type === "toggle-lamp") {
        showToast("Warm light toggled");
      }
    });
  }, [openPanel, showToast]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-surface text-on-surface">
      {/* Lapisan visual: ambience + noise + vignette (di belakang scene) */}
      <div className="absolute inset-0 bg-ambient z-0" />
      <div className="absolute inset-0 bg-noise z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-vignette z-0 pointer-events-none" />

      {/* Signature Scene 3D */}
      <SceneCanvas focusId={focusId} />

      {/* Hover Tooltip objek tanpa React re-render */}
      <HoverTooltip booted={booted} panel={panel} />

      {/* Hint interaksi (pola growon) */}
      {booted && !panel && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2.5 pointer-events-none animate-hint-fade">
          <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase text-on-surface-variant/70">
            Move &amp; interact
          </span>
          <div className="flex items-center gap-1.5">
            {PANEL_OBJECTS.map((id) => {
              const config = SCENE_OBJECTS.find((o) => o.id === id);
              return config ? (
                <span
                  key={id}
                  className="font-mono text-[8px] uppercase tracking-wider text-on-surface-variant/50 px-2 py-0.5 border border-white/10 rounded-full"
                >
                  {config.label} <span className="text-accent/70">→</span>{" "}
                  <span className="text-on-surface-variant/70">{config.actionLabel}</span>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Navigation (wordmark + index + audio) */}
      <Navigation
        booted={booted}
        panel={panel}
        muted={muted}
        onToggleMute={toggleMute}
        onToggleMusic={toggleMusicFromNav}
        onNavigate={openPanel}
        onHome={closePanel}
      />

      {/* Panel overlay (work/about/contact) */}
      <PanelRouter panel={panel} onClose={closePanel} />

      {/* Toast feedback */}
      {toast && (
        <div className="fixed bottom-24 lg:bottom-8 right-5 z-40 glass px-4 py-2.5 font-mono text-[10px] tracking-wider text-on-surface-variant uppercase animate-fade-in">
          {toast}
        </div>
      )}

      {/* Boot screen + fade out */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-700 ${
          fading ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        {!booted && <BootScreen />}
      </div>
    </div>
  );
}
