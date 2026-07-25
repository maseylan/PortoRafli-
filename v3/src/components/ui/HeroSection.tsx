"use client";

import React, { useRef, useEffect } from "react";
import {
  Rocket,
  User,
  Calendar,
  FolderGit2,
  Code2,
  ShieldCheck,
  ArrowRight,
  ArrowDown,
  MapPin,
  Terminal,
} from "lucide-react";
import TechIcon from "./TechIcon";

interface HeroSectionProps {
  onExplore: () => void;
  isActive?: boolean;
}

const TECH_STACK_ICONS = [
  { name: "Python" },
  { name: "Selenium" },
  { name: "Playwright" },
  { name: "TypeScript" },
  { name: "Node.js" },
  { name: "React" },
  { name: "Next.js" },
  { name: "PostgreSQL" },
  { name: "Docker" },
  { name: "Git" },
];

export default function HeroSection({ onExplore, isActive = true }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Set video playback speed to 0.95x
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.95;
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-full flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-16 sm:pt-24 pb-4 overflow-hidden bg-[#0e0d14]"
      aria-label="Hero Introduction Section"
    >
      {/* Background Video from public/hero/hero.mp4 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-75 scale-105"
        >
          <source src="/hero/hero.mp4" type="video/mp4" />
        </video>
        {/* Clean Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0d14]/50 via-[#0e0d14]/30 to-[#0e0d14]/85" />
      </div>

      {/* Grid Overlay Accent */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:36px_36px]" />

      {/* Main 2-Column Hero Content Grid */}
      <div
        key={`hero-grid-${isActive}`}
        className="relative z-20 w-full max-w-7xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center"
      >
        {/* Left Column: Headline, Bio Paragraph & CTA Buttons */}
        <div className="lg:col-span-7 flex flex-col items-start gap-2.5 sm:gap-4">
          {/* Element 1: Category Tag */}
          <div className={`font-mono text-[9px] sm:text-xs text-secondary uppercase tracking-[0.15em] sm:tracking-[0.25em] font-medium flex items-center gap-1.5 sm:gap-2 bg-secondary/10 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-secondary/30 backdrop-blur-md ${
            isActive ? "animate-hero-0" : "opacity-0"
          }`}>
            <Terminal className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-secondary" />
            <span className="truncate">QA AUTOMATION ENGINEER • FULLSTACK DEVELOPER</span>
          </div>

          {/* Element 2: Headline Text */}
          <div className={`flex flex-col leading-[0.85] tracking-tight ${
            isActive ? "animate-hero-1" : "opacity-0"
          }`}>
            <h1 className="font-display text-3xl sm:text-6xl lg:text-8xl font-bold italic text-white drop-shadow-md">
              Rafli
            </h1>
            <h1 className="font-display text-3xl sm:text-6xl lg:text-8xl font-bold italic text-primary drop-shadow-md mt-0.5 sm:mt-1">
              Ahmad Fachrezi
            </h1>
          </div>

          {/* Element 3: Bio Paragraph */}
          <p className={`text-on-surface-variant text-[11px] sm:text-base leading-relaxed font-light max-w-xl text-left ${
            isActive ? "animate-hero-2" : "opacity-0"
          }`}>
            I build reliable software with automated testing, scalable backend, and modern web technologies that create impact.
          </p>

          {/* Element 4: CTA Action Buttons */}
          <div className={`flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5 sm:mt-2 ${
            isActive ? "animate-hero-3" : "opacity-0"
          }`}>
            <button
              onClick={onExplore}
              className="flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-primary text-on-primary font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary-container transition-all duration-300 cursor-pointer shadow-md"
            >
              <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>VIEW PROJECTS</span>
            </button>

            <button
              onClick={onExplore}
              className="flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-6 sm:py-3 border border-secondary/40 bg-secondary/10 hover:bg-secondary/20 text-secondary font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl backdrop-blur-md transition-all duration-300 cursor-pointer shadow-md"
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>CONTACT ME</span>
            </button>
          </div>
        </div>

        {/* Element 5: Right Column Glassmorphic Summary Card */}
        <div className={`lg:col-span-5 w-full ${
          isActive ? "animate-hero-4" : "opacity-0"
        }`}>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-6 backdrop-blur-md space-y-2 sm:space-y-4 hover:border-secondary/40 transition-all duration-300">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shrink-0">
                <Code2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h3 className="font-display text-sm sm:text-lg font-bold text-white">
                QA Automation Engineer
              </h3>
            </div>

            <div className="h-[1px] bg-white/10" />

            <p className="text-on-surface-variant text-[10px] sm:text-sm leading-relaxed font-light hidden sm:block">
              Specialized in test automation, API testing, and fullstack development to deliver high-quality applications.
            </p>

            <div className="space-y-1.5 sm:space-y-2 pt-0.5">
              <span className="font-mono text-[10px] sm:text-xs text-secondary uppercase tracking-wider font-bold block">
                Tech Stack
              </span>

              {/* Vector SVG Tech Logos Grid */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {TECH_STACK_ICONS.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-secondary/50 hover:bg-white/[0.08] transition-all duration-300 group cursor-default"
                    title={tech.name}
                  >
                    <TechIcon name={tech.name} className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[7px] sm:text-[8px] font-mono text-on-surface-variant/80 truncate w-full text-center mt-1 font-medium">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1.5 sm:pt-2 border-t border-white/10 flex justify-end">
              <button
                onClick={onExplore}
                className="flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold text-secondary hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
              >
                <span>VIEW EXPERIENCE</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Element 6: Unified Trustbar Metric Blocks (All 4 Metric Icons Electric Blue #38bdf8) */}
      <div className={`relative z-20 w-full max-w-7xl mx-auto space-y-2 pt-2 border-t border-white/10 ${
        isActive ? "animate-hero-5" : "opacity-0"
      }`}>
        {/* 4 Metric Blocks Container (All Icons Electric Blue) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3 bg-white/[0.02] border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 border-r border-white/10 pr-1 sm:pr-2">
            <div className="p-1 sm:p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 border border-secondary/20">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
            </div>
            <div>
              <div className="font-display text-sm sm:text-xl font-bold text-white">2+</div>
              <div className="font-mono text-[8px] sm:text-[10px] text-on-surface-variant/80 uppercase">Years Experience</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:border-r border-white/10 pr-1 sm:pr-2">
            <div className="p-1 sm:p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 border border-secondary/20">
              <FolderGit2 className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
            </div>
            <div>
              <div className="font-display text-sm sm:text-xl font-bold text-white">40+</div>
              <div className="font-mono text-[8px] sm:text-[10px] text-on-surface-variant/80 uppercase">Completed</div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-r border-white/10 pr-1 sm:pr-2">
            <div className="p-1 sm:p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 border border-secondary/20">
              <Code2 className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
            </div>
            <div>
              <div className="font-display text-sm sm:text-xl font-bold text-white">15+</div>
              <div className="font-mono text-[8px] sm:text-[10px] text-on-surface-variant/80 uppercase">Tech Stack</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1 sm:p-2 rounded-lg bg-secondary/10 text-secondary shrink-0 border border-secondary/20">
              <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
            </div>
            <div>
              <div className="font-display text-sm sm:text-xl font-bold text-white">100%</div>
              <div className="font-mono text-[8px] sm:text-[10px] text-on-surface-variant/80 uppercase font-bold">Commitment</div>
            </div>
          </div>
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between font-mono text-[9px] sm:text-[10px] text-on-surface-variant">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider truncate">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            AVAILABLE FOR FREELANCE
          </span>
          <span className="hidden sm:flex items-center gap-1 text-on-surface-variant/70 uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-secondary" />
            Bekasi, ID
          </span>
          <div className="flex items-center gap-1.5 uppercase tracking-widest text-secondary font-bold">
            <span>EXPLORE</span>
            <ArrowDown className="w-3 h-3 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
