"use client";

import React from "react";
import { MapPin } from "lucide-react";
import { BIOGRAPHY_PORTRAIT, PHILOSOPHY_TAGS } from "../../../data/portfolioData";

export default function AboutPanel() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="shrink-0 mx-auto sm:mx-0">
          <div className="w-32 sm:w-40 aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/[0.02] shadow-2xl">
            <img
              src={BIOGRAPHY_PORTRAIT}
              alt="Portrait of Rafli Ahmad Fachrezi"
              className="w-full h-full object-cover object-[center_15%] opacity-90"
            />
          </div>
          <div className="mt-3 flex items-center justify-center sm:justify-start gap-1.5 font-mono text-[8px] uppercase tracking-wider text-on-surface-variant bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/10 w-fit mx-auto sm:mx-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Bekasi, ID · Open for Collaborations
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-display text-xl font-bold text-on-surface">
            Fullstack Developer <span className="text-accent">&amp;</span> QA Automation Engineer
          </h3>
          <p className="text-sm leading-relaxed text-secondary font-light mt-3">
            I build seamless user interfaces with React, Next.js, and Expo — supported by scalable
            backends in Express, PostgreSQL, and Python — while ensuring everything ships reliably
            through automated testing.
          </p>
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent font-bold mb-3">
          Philosophy
        </p>
        <div className="flex flex-wrap gap-1.5">
          {PHILOSOPHY_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full font-mono text-[9px] uppercase tracking-wider border border-white/10 bg-white/[0.04] text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="glass p-5 flex items-center gap-3">
        <MapPin className="w-4 h-4 text-accent shrink-0" />
        <p className="text-xs text-secondary font-light">
          Automation-first mindset:{" "}
          <span className="text-on-surface-variant">
            test what ships, ship what&apos;s tested.
          </span>
        </p>
      </div>
    </div>
  );
}
