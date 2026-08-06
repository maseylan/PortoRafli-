"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { PanelId } from "../../config/sceneConfig";

const PANELS: Array<{ id: PanelId; label: string }> = [
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

interface NavigationProps {
  booted: boolean;
  panel: PanelId | null;
  muted: boolean;
  onToggleMute: () => void;
  onToggleMusic: () => void;
  onNavigate: (id: PanelId) => void;
  onHome: () => void;
}

/** Top navigation ala growon.kr: wordmark kiri, index panel + audio kanan */
export default function Navigation({
  booted,
  panel,
  muted,
  onToggleMute,
  onToggleMusic,
  onNavigate,
  onHome,
}: NavigationProps) {
  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-opacity duration-700 ${
        booted ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        {/* Wordmark */}
        <button
          onClick={onHome}
          className="group text-left cursor-pointer"
          aria-label="Back to home"
        >
          <span className="font-display italic font-extrabold text-base sm:text-lg tracking-tight text-on-surface">
            RAFLI
          </span>
          <span className="font-display italic font-light text-base sm:text-lg text-on-surface-variant/70">
            {" "}
            AHMAD FACHREZI
          </span>
          <span className="block h-[1.5px] w-0 group-hover:w-full bg-gradient-to-r from-accent to-tertiary transition-all duration-500" />
        </button>

        {/* Index panel + audio */}
        <div className="flex items-center gap-5 sm:gap-8">
          <nav className="flex items-center gap-4 sm:gap-7" aria-label="Primary">
            {PANELS.map((item, i) => {
              const active = panel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`nav-item font-mono text-[10px] sm:text-[11px] tracking-[0.25em] uppercase cursor-pointer transition-colors duration-300 ${
                    active
                      ? "active text-on-surface font-bold"
                      : "text-on-surface-variant/70 hover:text-on-surface-variant"
                  }`}
                  aria-current={active ? "true" : undefined}
                >
                  <span className="mr-1.5 text-on-surface-variant/40">0{i + 1}</span>
                  {item.label}
                  <span className="nav-line" />
                </button>
              );
            })}
          </nav>

          <div className="hidden sm:block w-px h-5 bg-white/10" />

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMusic}
              className="w-9 h-9 rounded-full glass flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              aria-label="Turntable music"
              title="Turntable music"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            </button>
            <button
              onClick={onToggleMute}
              className="w-9 h-9 rounded-full glass flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
              aria-label={muted ? "Unmute" : "Mute"}
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-on-surface-variant" />
              ) : (
                <Volume2 className="w-4 h-4 text-on-surface-variant" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
