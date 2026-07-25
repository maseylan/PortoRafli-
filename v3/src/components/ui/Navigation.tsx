"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";

interface NavigationProps {
  activeSection: number;
  onNavigate: (index: number) => void;
}

const NAV_ITEMS = [
  { label: "HOME", index: 0 },
  { label: "EXPERIENCE", index: 1 },
  { label: "PROJECTS", index: 2 },
  { label: "ABOUT", index: 3 },
];

export default function Navigation({ activeSection, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo Monogram */}
        <button
          onClick={() => onNavigate(0)}
          className="group flex flex-col text-left focus-visible:ring-2 focus-visible:ring-secondary rounded-sm p-1 cursor-pointer"
          aria-label="Rafli Ahmad Fachrezi - Back to Home"
        >
          <div className="font-display font-bold text-sm tracking-wider uppercase">
            <span className="text-white">RAFLI </span>
            <span className="text-primary group-hover:text-secondary transition-colors">AHMAD FACHREZI</span>
          </div>
          <span className="font-mono text-[9px] text-secondary/90 tracking-wider">
            QA Automation Engineer & Fullstack Developer
          </span>
        </button>

        {/* Center Navigation Links (Clean Underline: HOME, EXPERIENCE, PROJECTS, ABOUT) */}
        <nav
          className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest"
          aria-label="Main Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.index;
            return (
              <button
                key={item.index}
                onClick={() => onNavigate(item.index)}
                className={`relative py-1 uppercase transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer ${
                  isActive
                    ? "text-primary font-bold"
                    : "text-on-surface-variant hover:text-secondary"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white border border-outline-variant/30 rounded-lg bg-surface-container-low/80 backdrop-blur-md cursor-pointer"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-6 right-6 mt-2 p-6 bg-surface-container-low/95 backdrop-blur-xl border border-outline-variant/40 rounded-2xl shadow-2xl flex flex-col gap-2 z-50">
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.index}
                onClick={() => {
                  onNavigate(item.index);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-4 py-3 font-mono text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
                  activeSection === item.index
                    ? "bg-primary/20 text-primary font-bold border border-primary/30"
                    : "text-on-surface-variant hover:bg-surface-container-high/40 hover:text-secondary"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
