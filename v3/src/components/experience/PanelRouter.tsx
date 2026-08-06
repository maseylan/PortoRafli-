"use client";

import React from "react";
import { X } from "lucide-react";
import type { PanelId } from "../../config/sceneConfig";
import WorkPanel from "./panels/WorkPanel";
import AboutPanel from "./panels/AboutPanel";
import ContactPanel from "./panels/ContactPanel";

interface PanelRouterProps {
  panel: PanelId | null;
  onClose: () => void;
}

const PANEL_META: Record<PanelId, { index: string; kicker: string; title: string }> = {
  work: { index: "01", kicker: "Selected Works", title: "Work" },
  about: { index: "02", kicker: "Biography", title: "About" },
  contact: { index: "03", kicker: "Direct Channel", title: "Contact" },
};

/** Overlay panel ala growon.kr: backdrop blur + slide-in dari kanan */
export default function PanelRouter({ panel, onClose }: PanelRouterProps) {
  if (!panel) return null;
  const meta = PANEL_META[panel];

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[2px] animate-backdrop-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-y-0 right-0 z-40 w-full max-w-xl lg:max-w-2xl animate-panel-in"
        aria-label={meta.title}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full border-l border-white/10 bg-[linear-gradient(160deg,rgba(18,18,23,0.85),rgba(9,9,11,0.9))] backdrop-blur-2xl shadow-[-24px_0_60px_-12px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 sm:px-8 h-20 border-b border-white/[0.06] shrink-0">
            <div>
              <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-accent font-bold">
                <span className="text-on-surface-variant/50 mr-2">{meta.index}</span>
                {meta.kicker}
              </p>
              <h2 className="font-display italic font-extrabold text-2xl text-on-surface">
                {meta.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Konten */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 sm:px-8 py-6">
            {panel === "work" && <WorkPanel />}
            {panel === "about" && <AboutPanel />}
            {panel === "contact" && <ContactPanel />}
          </div>
        </div>
      </aside>
    </>
  );
}
