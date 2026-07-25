"use client";

import React from "react";
import dynamic from "next/dynamic";
import { EXPERIENCE_DATA } from "../../data/portfolioData";
import { Briefcase, MapPin } from "lucide-react";

// Dynamic import for Three.js Ambient Canvas
const AmbientBackgroundCanvas = dynamic(() => import("../canvas/AmbientBackgroundCanvas"), {
  ssr: false,
});

interface ExperienceSectionProps {
  isActive?: boolean;
}

export default function ExperienceSection({ isActive = false }: ExperienceSectionProps) {
  return (
    <section
      className="relative w-full h-full flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-16 sm:pt-24 pb-4 max-w-7xl mx-auto overflow-hidden bg-[#0e0d14]"
      aria-label="Professional Experience Section"
    >
      {/* Dynamic Ambient Background Canvas (Vibrant Cobalt #2F6FE0) */}
      <AmbientBackgroundCanvas color="#2F6FE0" />

      {/* Grid Overlay Accent */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Main Content (Z-10) */}
      <div className="relative z-10 w-full my-auto py-1">
        {/* Section Header */}
        <div className="mb-3 sm:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-1 sm:gap-2 border-b border-white/10 pb-2 sm:pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[9px] sm:text-xs text-secondary uppercase tracking-widest mb-0.5 sm:mb-1">
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>Career Journey</span>
            </div>
            <h2 className="font-display text-xl sm:text-4xl font-medium tracking-tight text-white drop-shadow-md">
              Professional Experience
            </h2>
          </div>
          <p className="text-on-surface-variant text-[11px] sm:text-sm font-light max-w-md hidden sm:block">
            Full-stack development, QA automation, and stress-testing infrastructure across global remote & onsite environments.
          </p>
        </div>

        {/* Grid of Seamless Glassmorphic Experience Cards with Cobalt Accents */}
        <div
          key={`exp-grid-${isActive}`}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5"
        >
          {EXPERIENCE_DATA.slice(0, 3).map((exp, idx) => (
            <article
              key={exp.id}
              className={`border border-white/10 bg-white/[0.03] backdrop-blur-md p-3.5 sm:p-5 rounded-xl sm:rounded-2xl hover:border-secondary/50 hover:bg-white/[0.06] transition-all duration-300 flex flex-col justify-between group shadow-xl ${
                isActive
                  ? idx === 0
                    ? "animate-deck-card-0"
                    : idx === 1
                    ? "animate-deck-card-1"
                    : "animate-deck-card-2"
                  : "opacity-0"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
                  <span className="font-mono text-[9px] sm:text-[10px] px-2.5 py-0.5 rounded-full border bg-secondary/10 border-secondary/30 text-secondary font-medium">
                    {exp.period}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[9px] sm:text-[10px] text-on-surface-variant">
                    <MapPin className="w-3 h-3 text-secondary shrink-0" />
                    <span className="truncate">{exp.location}</span>
                  </span>
                </div>

                <h3 className="font-display text-sm sm:text-lg font-medium text-primary group-hover:text-secondary transition-colors leading-snug mb-0.5 sm:mb-1">
                  {exp.role}
                </h3>

                <div className="text-white font-medium text-[11px] sm:text-xs mb-1.5 sm:mb-3">
                  {exp.company}
                </div>

                <p className="text-on-surface-variant text-[10px] sm:text-xs leading-relaxed font-light mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                  {exp.description}
                </p>
              </div>

              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="space-y-1 pt-2 sm:pt-3 border-t border-white/10 hidden sm:block" aria-label={`Key deliverables at ${exp.company}`}>
                  {exp.bullets.slice(0, 2).map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-on-surface-variant text-[10px] sm:text-[11px] font-light leading-snug">
                      <span className="text-secondary mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary/80" />
                      <span className="line-clamp-1 sm:line-clamp-2">{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
