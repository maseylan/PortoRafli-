"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { BIOGRAPHY_PORTRAIT, PHILOSOPHY_TAGS } from "../../data/portfolioData";
import { Sparkles, Compass, Cpu, Palette, User } from "lucide-react";

// Dynamic import for Three.js Ambient Canvas
const AmbientBackgroundCanvas = dynamic(() => import("../canvas/AmbientBackgroundCanvas"), {
  ssr: false,
});

const TAG_DETAILS: Record<string, { icon: React.ReactNode; text: string }> = {
  "Fullstack Development": {
    icon: <Palette size={14} className="text-secondary" />,
    text: "Building responsive web applications using React, Vue, Next.js, and robust backends with Python, FastAPI, and Express/Laravel.",
  },
  "API Testing": {
    icon: <Compass size={14} className="text-secondary" />,
    text: "Ensuring data integrity and robust backend communication using Pytest, Postman, and schema validation.",
  },
  "CI/CD Integration": {
    icon: <Sparkles size={14} className="text-secondary" />,
    text: "Automating execution workflows and integrating testing securely into continuous delivery pipelines.",
  },
  "Performance Testing": {
    icon: <Cpu size={14} className="text-secondary" />,
    text: "Engineering stress testing infrastructure using Selenium Grid, Docker, and multi-threaded parallel execution.",
  },
};

const SKILL_GROUPS = [
  { name: "Frontend & Mobile", skills: ["TypeScript", "React", "Next.js", "Chakra UI", "React Native"] },
  { name: "Backend & Database", skills: ["Express.js", "PostgreSQL", "MongoDB", "Node.js", "FastAPI"] },
  { name: "QA & Automation", skills: ["Playwright", "Pytest", "Selenium", "Docker", "CI/CD"] },
];

interface AboutSectionProps {
  isActive?: boolean;
}

export default function AboutSection({ isActive = false }: AboutSectionProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <section
      className="relative w-full h-full flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-16 sm:pt-24 pb-4 max-w-7xl mx-auto overflow-hidden bg-[#0e0d14]"
      aria-label="About Me and Capability Philosophy"
    >
      {/* Dynamic Ambient Background Canvas (Vibrant Cobalt #2F6FE0) */}
      <AmbientBackgroundCanvas color="#2F6FE0" />

      {/* Grid Overlay Accent */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Main Content (Z-10) */}
      <div
        key={`about-grid-${isActive}`}
        className="relative z-10 w-full my-auto py-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center"
      >
        {/* Left Column: Portrait & Availability Badge */}
        <div className={`lg:col-span-4 flex flex-col items-center justify-center ${
          isActive ? "animate-deck-card-0" : "opacity-0"
        }`}>
          <div className="relative aspect-square w-24 sm:w-56 lg:w-64 rounded-xl sm:rounded-2xl overflow-hidden bg-white/[0.02] border border-secondary/30 shadow-2xl group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <img
              src={BIOGRAPHY_PORTRAIT}
              alt="Portrait of Rafli Ahmad Fachrezi"
              className="w-full h-full object-cover object-[center_15%] opacity-90 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 border border-secondary/40 rounded-xl sm:rounded-2xl pointer-events-none" />
          </div>

          <div className="mt-2 sm:mt-3 flex items-center gap-1.5 font-mono text-[8px] sm:text-[10px] uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-secondary/30 backdrop-blur-md shadow-md">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Bekasi, ID // Open for Collaborations</span>
          </div>
        </div>

        {/* Right Column: Bio Statement & Tech Stack Grid */}
        <div className="lg:col-span-8 flex flex-col gap-2.5 sm:gap-4">
          <div className={`flex items-center gap-2 font-mono text-[9px] sm:text-xs text-secondary uppercase tracking-widest ${
            isActive ? "animate-hero-0" : "opacity-0"
          }`}>
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
            <span>Biography & Core Competencies</span>
          </div>

          <h2 className={`font-display text-base sm:text-3xl lg:text-4xl font-medium tracking-tight text-white leading-tight drop-shadow-md ${
            isActive ? "animate-hero-1" : "opacity-0"
          }`}>
            Engineering scalable applications and ensuring software reliability.
          </h2>

          <p className={`text-on-surface-variant text-[11px] sm:text-sm leading-relaxed font-light ${
            isActive ? "animate-hero-2" : "opacity-0"
          }`}>
            I am a Fullstack Developer and QA Automation Engineer with expertise in modern web/mobile development and automated software testing. I build seamless user interfaces with React, Next.js, and Expo, supported by scalable backends in Express, PostgreSQL, and Python.
          </p>

          {/* Structured Tech Stack Badges */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 ${
            isActive ? "animate-deck-card-1" : "opacity-0"
          }`}>
            {SKILL_GROUPS.map((group) => (
              <div key={group.name} className="bg-white/[0.03] border border-white/10 p-2 sm:p-3 rounded-lg sm:rounded-xl backdrop-blur-md hover:border-secondary/40 transition-all">
                <span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-wider block mb-1 font-bold text-secondary">
                  {group.name}
                </span>
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-1.5 py-0.5 bg-white/[0.04] border border-white/10 rounded font-mono text-[8px] sm:text-[9px] text-on-surface-variant"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Capability Chips */}
          <div className={`mt-0.5 space-y-1.5 ${
            isActive ? "animate-deck-card-2" : "opacity-0"
          }`}>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Operational Capabilities">
              {PHILOSOPHY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full font-mono text-[8px] sm:text-[10px] uppercase tracking-wider border transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer ${
                    activeTag === tag
                      ? "bg-secondary text-on-secondary border-secondary font-bold shadow-md"
                      : "bg-white/[0.03] hover:bg-white/[0.08] text-on-surface border-white/10"
                  }`}
                  aria-pressed={activeTag === tag}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Dynamic Info Box */}
            <div className="min-h-[34px] relative">
              {activeTag ? (
                <div className="flex items-start gap-1.5 p-2 bg-white/[0.04] border border-secondary/30 rounded-lg text-xs backdrop-blur-md shadow-lg">
                  <div className="mt-0.5 shrink-0">{TAG_DETAILS[activeTag].icon}</div>
                  <div className="text-on-surface-variant leading-relaxed text-[9px] sm:text-[11px]">
                    <strong className="text-white font-mono mr-1">[{activeTag}]</strong>{" "}
                    {TAG_DETAILS[activeTag].text}
                  </div>
                </div>
              ) : (
                <p className="text-[8px] sm:text-[10px] font-mono text-on-surface-variant/50 italic pt-0.5">
                  * Select a capability chip to inspect operational philosophy details.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
