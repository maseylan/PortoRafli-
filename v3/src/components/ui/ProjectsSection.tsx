"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { PROJECT_DATA } from "../../data/portfolioData";
import { Project } from "../../types";
import { ArrowUpRight, FolderGit2, ChevronLeft, ChevronRight } from "lucide-react";

// Dynamic import for Three.js Ambient Canvas
const AmbientBackgroundCanvas = dynamic(() => import("../canvas/AmbientBackgroundCanvas"), {
  ssr: false,
});

interface ProjectsSectionProps {
  onProjectClick: (project: Project) => void;
  subPage: number;
  onSetSubPage?: (page: number) => void;
  isActive?: boolean;
}

const ITEMS_PER_PAGE = 2; // Display 2 cards per view

export default function ProjectsSection({ onProjectClick, subPage, onSetSubPage, isActive = false }: ProjectsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(PROJECT_DATA.map((p) => p.category)))];

  const filteredProjects = selectedCategory === "All"
    ? PROJECT_DATA
    : PROJECT_DATA.filter((p) => p.category === selectedCategory);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const safeSubPage = Math.min(subPage, Math.max(0, totalPages - 1));

  const currentProjects = filteredProjects.slice(
    safeSubPage * ITEMS_PER_PAGE,
    (safeSubPage + 1) * ITEMS_PER_PAGE
  );

  const handlePrevExhibit = () => {
    if (onSetSubPage && safeSubPage > 0) {
      onSetSubPage(safeSubPage - 1);
    }
  };

  const handleNextExhibit = () => {
    if (onSetSubPage && safeSubPage < totalPages - 1) {
      onSetSubPage(safeSubPage + 1);
    }
  };

  return (
    <section
      className="relative w-full h-full flex flex-col justify-between px-4 sm:px-8 lg:px-16 pt-16 sm:pt-24 pb-4 max-w-7xl mx-auto overflow-hidden bg-[#0e0d14]"
      aria-label="Selected Works Portfolio Showcase"
    >
      {/* Dynamic Ambient Background Canvas (Vibrant Cobalt #2F6FE0) */}
      <AmbientBackgroundCanvas color="#2F6FE0" />

      {/* Grid Overlay Accent */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Main Content (Z-10) */}
      <div className="relative z-10 w-full my-auto py-1">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-3 sm:mb-6 border-b border-white/10 pb-2 sm:pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-[9px] sm:text-xs text-secondary uppercase tracking-widest mb-0.5 sm:mb-1">
              <FolderGit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary" />
              <span>Featured Portfolio Exhibit</span>
            </div>
            <h2 className="font-display text-xl sm:text-4xl font-medium tracking-tight text-white drop-shadow-md">
              Selected Works
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-1 bg-white/[0.03] p-1 rounded-full border border-white/10 backdrop-blur-md">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    if (onSetSubPage) onSetSubPage(0);
                  }}
                  className={`px-2 py-0.5 sm:px-3 sm:py-1 font-mono text-[8px] sm:text-[10px] uppercase tracking-wider rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-secondary text-on-secondary font-bold shadow-md"
                      : "text-on-surface-variant hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Pitch Deck Exhibit Navigation Arrows */}
            <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-xs text-secondary bg-secondary/10 border border-secondary/30 px-2.5 py-1 rounded-full backdrop-blur-md">
              <button
                onClick={handlePrevExhibit}
                disabled={safeSubPage === 0}
                className="hover:text-white disabled:opacity-30 disabled:hover:text-secondary transition-colors cursor-pointer"
                aria-label="Previous Exhibit Slide"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1">
                EXHIBIT {safeSubPage + 1} / {totalPages || 1}
              </span>
              <button
                onClick={handleNextExhibit}
                disabled={safeSubPage >= totalPages - 1}
                className="hover:text-white disabled:opacity-30 disabled:hover:text-secondary transition-colors cursor-pointer"
                aria-label="Next Exhibit Slide"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pitch Deck Entry Grid */}
        <div
          key={`proj-grid-${selectedCategory}-${safeSubPage}-${isActive}`}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6"
        >
          {currentProjects.map((project, idx) => (
            <article
              key={project.id}
              onClick={() => onProjectClick(project)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onProjectClick(project);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View project details for ${project.title}`}
              className={`group cursor-pointer flex flex-col bg-white/[0.03] border border-white/10 p-3 sm:p-5 rounded-xl sm:rounded-2xl hover:border-secondary/50 hover:bg-white/[0.06] transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary shadow-xl backdrop-blur-md ${
                isActive
                  ? idx === 0
                    ? "animate-deck-card-0"
                    : "animate-deck-card-1"
                  : "opacity-0"
              }`}
            >
              {/* Image Box */}
              <div className="relative overflow-hidden rounded-lg sm:rounded-xl aspect-[16/8] sm:aspect-[16/9] mb-2 sm:mb-4 border border-white/10 bg-black/60 shadow-lg group-hover:border-secondary/40 transition-all duration-300">
                <img
                  src={project.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                />
                <img
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="relative z-10 w-full h-full object-contain opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-transform duration-300 ease-out drop-shadow-xl"
                />
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 font-mono text-[8px] sm:text-[10px] text-secondary bg-[#0e0d14]/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-secondary/30 backdrop-blur-md">
                  {project.year}
                </div>
              </div>

              {/* Details */}
              <div className="flex justify-between items-start mt-auto gap-2">
                <div>
                  <span className="font-mono text-[8px] sm:text-[10px] text-secondary uppercase tracking-wider block mb-0.5">
                    {project.category}
                  </span>
                  <h3 className="font-display text-sm sm:text-lg font-medium text-white group-hover:text-primary transition-colors leading-snug line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-on-surface-variant text-[10px] sm:text-xs font-light leading-relaxed line-clamp-1 sm:line-clamp-2 mt-0.5">
                    {project.description}
                  </p>
                </div>
                <div className="text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 p-1 sm:p-2 rounded-full bg-secondary/10 border border-secondary/30 shrink-0">
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Sub-page Navigation Dots */}
        <div className="flex justify-between items-center mt-3 sm:mt-6 pt-2 sm:pt-3 border-t border-white/10">
          <span className="font-mono text-[8px] sm:text-[10px] text-on-surface-variant/60 uppercase tracking-widest truncate max-w-[200px] sm:max-w-none">
            Scroll down or use arrows to slide pitch deck exhibits
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (onSetSubPage) {
                    onSetSubPage(idx);
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer ${
                  safeSubPage === idx ? "bg-secondary w-4 sm:w-6" : "bg-white/20 hover:bg-white/50 w-1.5 sm:w-2"
                }`}
                aria-label={`Jump to exhibit page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
