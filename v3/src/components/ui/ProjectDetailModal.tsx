"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Project } from "../../types";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  const allImages = [project.image, ...(project.gallery || [])];
  const currentImage = allImages[currentImageIndex];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0e0d14]/90 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog Card (Matte Border, No Glow) */}
      <div className="relative w-full max-w-5xl h-[85vh] md:h-[82vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0e0d14] flex flex-col shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Clean Header Border */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-container-lowest/80 backdrop-blur-md z-10">
          <span className="font-mono text-[11px] tracking-widest text-primary uppercase font-bold">
            [ ARCHIVE EXHIBIT // {project.year} ]
          </span>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-high/50 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            aria-label="Close detail modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-10 custom-scrollbar">
          {/* Main Title & Category */}
          <div className="space-y-2">
            <span className="font-mono text-xs tracking-wider text-primary uppercase block">
              [ {project.category} ]
            </span>
            <h1 id="modal-title" className="font-display text-3xl md:text-5xl font-semibold tracking-tight text-white">
              {project.title}
            </h1>
          </div>

          {/* Banner Media Carousel */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10 group shadow-2xl">
            <img
              src={currentImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-40 scale-110"
            />
            <img
              key={currentImage}
              src={currentImage}
              alt={project.title}
              className="relative z-10 w-full h-full object-contain opacity-95 group-hover:opacity-100 transition-opacity duration-300"
            />

            {/* Carousel Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 border border-white/20 rounded-full text-white z-30 transition-all duration-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  aria-label="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 border border-white/20 rounded-full text-white z-30 transition-all duration-300 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-md focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                  aria-label="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentImageIndex === idx ? "bg-primary w-5" : "bg-white/40 hover:bg-white/80 w-1.5"
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-4 right-4 z-20 bg-background/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded text-[10px] font-mono tracking-wider flex items-center gap-1.5 text-white">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>INSPECTION FEED // {currentImageIndex + 1}/{allImages.length}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
            {/* Left Specs */}
            <div className="md:col-span-4 space-y-5 md:border-r border-white/10 md:pr-8">
              <div>
                <h2 className="font-mono text-xs tracking-widest text-primary uppercase mb-1">Role</h2>
                <p className="text-sm font-medium text-white">{project.role}</p>
              </div>
              <div>
                <h2 className="font-mono text-xs tracking-widest text-primary uppercase mb-1">Client</h2>
                <p className="text-sm font-medium text-white">{project.client}</p>
              </div>
              <div>
                <h2 className="font-mono text-xs tracking-widest text-primary uppercase mb-1">Timeline</h2>
                <p className="text-sm font-medium text-white">{project.year}</p>
              </div>
              <div>
                <h2 className="font-mono text-xs tracking-widest text-primary uppercase mb-2">Technologies</h2>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded font-mono text-[10px] text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Overview */}
            <div className="md:col-span-8 space-y-5">
              <div>
                <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-2 font-bold">
                  [ CONCEPT SUMMARY ]
                </span>
                <p className="text-white text-base md:text-lg leading-relaxed font-light">
                  {project.description}
                </p>
              </div>
              <div>
                <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-2 font-bold">
                  [ TECHNICAL ARCHITECTURE ]
                </span>
                <p className="text-on-surface-variant text-sm md:text-base leading-relaxed font-light">
                  {project.longDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-white/10 bg-surface-container-lowest flex justify-between items-center z-10">
          <span className="text-[10px] font-mono text-on-surface-variant/70">
            [ ARCHIVE SPECIFICATIONS VERIFIED ]
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-on-primary font-mono text-xs tracking-wider uppercase rounded-full font-bold hover:bg-primary-container transition-colors focus-visible:ring-2 focus-visible:ring-primary shadow-md cursor-pointer"
          >
            [ Close Exhibit ]
          </button>
        </div>
      </div>
    </div>
  );
}
