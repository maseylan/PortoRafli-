"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Navigation from "./ui/Navigation";
import HeroSection from "./ui/HeroSection";
import ExperienceSection from "./ui/ExperienceSection";
import ProjectsSection from "./ui/ProjectsSection";
import AboutSection from "./ui/AboutSection";
import FooterSection from "./ui/FooterSection";
import { Project } from "../types";
import { PROJECT_DATA } from "../data/portfolioData";

// Dynamically import heavy modals with ssr: false to strip their JS from initial bundle
const ProjectDetailModal = dynamic(() => import("./ui/ProjectDetailModal"), {
  ssr: false,
});
const ContactModal = dynamic(() => import("./ui/ContactModal"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const SECTION_COUNT = 5;
const SECTION_NAMES = ["HERO", "EXPERIENCE", "SELECTED WORKS", "ABOUT", "CONTACT"];
const ITEMS_PER_PAGE = 2;
const PROJECTS_SUBPAGES = Math.ceil(PROJECT_DATA.length / ITEMS_PER_PAGE);

export default function PinnedScrollContainer() {
  const [activeSection, setActiveSection] = useState(0);
  const [prevSection, setPrevSection] = useState<number | null>(null);
  const [projectSubPage, setProjectSubPage] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const isAnimatingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Navigate directly to a section index with smooth zoom transition
  const goToSection = useCallback((index: number, subIndex = 0) => {
    const targetIndex = Math.max(0, Math.min(SECTION_COUNT - 1, index));
    if (targetIndex === activeSection && subIndex === projectSubPage) return;

    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    setPrevSection(activeSection);
    setActiveSection(targetIndex);
    setProjectSubPage(subIndex);

    setTimeout(() => {
      isAnimatingRef.current = false;
      setPrevSection(null);
    }, 600);
  }, [activeSection, projectSubPage]);

  // Handle scroll step navigation
  const handleNextStep = useCallback(() => {
    if (activeSection === 2 && projectSubPage < PROJECTS_SUBPAGES - 1) {
      setProjectSubPage((prev) => prev + 1);
    } else if (activeSection < SECTION_COUNT - 1) {
      goToSection(activeSection + 1, 0);
    }
  }, [activeSection, projectSubPage, goToSection]);

  const handlePrevStep = useCallback(() => {
    if (activeSection === 2 && projectSubPage > 0) {
      setProjectSubPage((prev) => prev - 1);
    } else if (activeSection > 0) {
      const prevSub = activeSection - 1 === 2 ? PROJECTS_SUBPAGES - 1 : 0;
      goToSection(activeSection - 1, prevSub);
    }
  }, [activeSection, projectSubPage, goToSection]);

  // Wheel scroll event handler
  useEffect(() => {
    let lastWheelTime = 0;

    const handleWheel = (e: WheelEvent) => {
      if (selectedProject || isContactOpen) return;

      const now = Date.now();
      if (now - lastWheelTime < 650 || isAnimatingRef.current) return;

      if (e.deltaY > 15) {
        lastWheelTime = now;
        handleNextStep();
      } else if (e.deltaY < -15) {
        lastWheelTime = now;
        handlePrevStep();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [handleNextStep, handlePrevStep, selectedProject, isContactOpen]);

  // Touch swipe support for mobile/tablet
  useEffect(() => {
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (selectedProject || isContactOpen) return;

      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;

      if (Math.abs(diffY) > 40 && !isAnimatingRef.current) {
        if (diffY > 0) {
          handleNextStep();
        } else {
          handlePrevStep();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleNextStep, handlePrevStep, selectedProject, isContactOpen]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedProject || isContactOpen) return;

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          handleNextStep();
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          handlePrevStep();
          break;
        case "Home":
          e.preventDefault();
          goToSection(0, 0);
          break;
        case "End":
          e.preventDefault();
          goToSection(SECTION_COUNT - 1, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextStep, handlePrevStep, goToSection, selectedProject, isContactOpen]);

  // Helper to determine panel transition class
  const getPanelClass = (idx: number) => {
    if (activeSection === idx) return "active";
    if (prevSection === idx) return "exit-prev";
    return "";
  };

  return (
    <div ref={containerRef} className="pinned-viewport relative bg-[#0e0d14] text-[#f8fafc]">
      {/* Screen Reader Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Now viewing ${SECTION_NAMES[activeSection]} section${activeSection === 2 ? ` (Exhibit page ${projectSubPage + 1} of ${PROJECTS_SUBPAGES})` : ""}`}
      </div>

      {/* Navigation Header */}
      <Navigation
        activeSection={activeSection}
        onNavigate={(idx) => goToSection(idx, 0)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Pinned Section Panels */}
      <main className="relative w-full h-full z-10 overflow-hidden">
        {/* Section 0: Hero */}
        <div className={`section-panel ${getPanelClass(0)}`}>
          <HeroSection onExplore={() => goToSection(1, 0)} isActive={activeSection === 0} />
        </div>

        {/* Section 1: Experience */}
        <div className={`section-panel ${getPanelClass(1)}`}>
          <ExperienceSection isActive={activeSection === 1} />
        </div>

        {/* Section 2: Selected Works */}
        <div className={`section-panel ${getPanelClass(2)}`}>
          <ProjectsSection
            onProjectClick={(p) => setSelectedProject(p)}
            subPage={projectSubPage}
            onSetSubPage={(p) => setProjectSubPage(p)}
            isActive={activeSection === 2}
          />
        </div>

        {/* Section 3: About Me */}
        <div className={`section-panel ${getPanelClass(3)}`}>
          <AboutSection isActive={activeSection === 3} />
        </div>

        {/* Section 4: Footer & Contact CTA */}
        <div className={`section-panel ${getPanelClass(4)}`}>
          <FooterSection
            onNavigateHome={() => goToSection(0, 0)}
            onOpenContact={() => setIsContactOpen(true)}
            isActive={activeSection === 4}
          />
        </div>
      </main>

      {/* Seamless Floating Desktop Side Section Navigation Indicator */}
      <aside
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-4"
        aria-label="Section Navigation Track"
      >
        <span className="font-mono text-[8px] text-secondary font-bold tracking-widest uppercase writing-mode-vertical rotate-180 mb-1 opacity-70">
          INDEX
        </span>

        <div className="flex flex-col gap-3.5 items-center">
          {SECTION_NAMES.map((name, idx) => {
            const isActive = activeSection === idx;
            return (
              <button
                key={idx}
                onClick={() => goToSection(idx, 0)}
                className="group relative flex items-center justify-center focus-visible:ring-2 focus-visible:ring-secondary rounded cursor-pointer py-1"
                aria-label={`Navigate to section ${idx + 1}: ${name}`}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Seamless Floating Track Tick Indicator */}
                <div
                  className={`transition-all duration-300 rounded-full ${
                    isActive
                      ? "w-1 h-7 bg-secondary"
                      : "w-1 h-3 bg-white/25 group-hover:bg-primary group-hover:h-5"
                  }`}
                />

                {/* Glassmorphic Hover Tooltip Label */}
                <div className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-[#0e0d14]/95 border border-secondary/40 px-3 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap backdrop-blur-xl">
                  <span className="font-mono text-[9px] font-bold text-primary">
                    0{idx + 1}
                  </span>
                  <span className="font-mono text-[10px] font-bold text-white tracking-widest uppercase">
                    {name}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <span className="font-mono text-[9px] font-bold text-primary mt-1">
          0{activeSection + 1}
        </span>
      </aside>

      {/* Modals (Dynamically Imported) */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {isContactOpen && (
        <ContactModal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
        />
      )}
    </div>
  );
}
