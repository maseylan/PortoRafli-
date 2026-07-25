"use client";

import React from "react";
import dynamic from "next/dynamic";
import { STUDIO_LOGO } from "../../data/portfolioData";
import { ArrowUp, Mail, Github, Linkedin } from "lucide-react";

// Dynamic import for Three.js Ambient Canvas
const AmbientBackgroundCanvas = dynamic(() => import("../canvas/AmbientBackgroundCanvas"), {
  ssr: false,
});

interface FooterSectionProps {
  onNavigateHome: () => void;
  onOpenContact: () => void;
  isActive?: boolean;
}

export default function FooterSection({ onNavigateHome, onOpenContact, isActive = false }: FooterSectionProps) {
  return (
    <footer
      className="relative w-full h-full flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-16 sm:pt-24 pb-6 max-w-7xl mx-auto overflow-hidden bg-[#0e0d14]"
      aria-label="Footer Section and Contact Call to Action"
    >
      {/* Dynamic Ambient Background Canvas (Vibrant Cobalt #2F6FE0) */}
      <AmbientBackgroundCanvas color="#2F6FE0" />

      {/* Grid Overlay Accent */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Main CTA (Z-10) */}
      <div
        key={`footer-grid-${isActive}`}
        className="relative z-10 my-auto text-center flex flex-col items-center justify-center gap-4 sm:gap-6 py-4"
      >
        <span className={`font-mono text-[10px] sm:text-xs text-secondary uppercase tracking-[0.2em] ${
          isActive ? "animate-hero-0" : "opacity-0"
        }`}>
          [ Let's Build Something Exceptional ]
        </span>

        <h2 className={`font-display text-3xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white drop-shadow-lg leading-tight ${
          isActive ? "animate-hero-1" : "opacity-0"
        }`}>
          Have a project in mind?
        </h2>

        <button
          onClick={onOpenContact}
          className={`group flex items-center gap-2.5 sm:gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-secondary text-on-secondary font-mono text-[11px] sm:text-xs uppercase tracking-widest rounded-full font-bold shadow-lg hover:bg-secondary-container transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer ${
            isActive ? "animate-hero-2" : "opacity-0"
          }`}
          aria-label="Start a conversation modal"
        >
          <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Start a Conversation</span>
        </button>
      </div>

      {/* Bottom Bar (Z-10) */}
      <div className={`relative z-10 pt-4 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 ${
        isActive ? "animate-hero-3" : "opacity-0"
      }`}>
        <span className="font-display text-base sm:text-lg font-bold tracking-tight text-white">
          {STUDIO_LOGO}
        </span>

        <div className="flex items-center gap-4 sm:gap-6 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-on-surface-variant">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-secondary p-1"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/rafli-ahmad-078155200/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 hover:text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-secondary p-1"
          >
            <Linkedin className="w-3.5 h-3.5" />
            <span>LinkedIn</span>
          </a>
          <a
            href="mailto:rafliahmad758@gmail.com"
            className="flex items-center gap-1.5 hover:text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-secondary p-1"
          >
            <Mail className="w-3.5 h-3.5 text-secondary" />
            <span>Email</span>
          </a>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className="font-mono text-[9px] sm:text-[10px] text-on-surface-variant/60">
            © {new Date().getFullYear()} {STUDIO_LOGO}
          </span>
          <button
            onClick={onNavigateHome}
            className="p-2 sm:p-2.5 rounded-full border border-white/10 hover:border-secondary/50 hover:text-secondary transition-all focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer"
            aria-label="Navigate back to Hero section"
          >
            <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
