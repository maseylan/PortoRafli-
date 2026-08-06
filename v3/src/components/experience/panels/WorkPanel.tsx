"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { PROJECT_DATA } from "../../../data/portfolioData";
import type { Project } from "../../../types";

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <article
      className={`glass-strong overflow-hidden transition-all duration-500 ${
        open ? "col-span-1 sm:col-span-2" : ""
      }`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-5 cursor-pointer group"
        aria-expanded={open}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] text-accent/80">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/60">
            {project.category}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold text-on-surface mt-3 group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 font-mono text-[8px] text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="font-mono text-[10px] text-on-surface-variant/70">
            {project.role} · {project.year}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-accent">
            {open ? "Close" : "Details"}
            <ArrowRight
              className={`w-3.5 h-3.5 transition-transform duration-300 ${open ? "rotate-90" : "group-hover:translate-x-1"}`}
            />
          </span>
        </div>
      </button>

      <div
        className={`grid transition-all duration-500 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-6 pt-1 border-t border-white/10">
            {project.image && (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-40 object-cover rounded-xl border border-white/10 mt-4"
              />
            )}
            <div className="grid grid-cols-3 gap-3 mt-4 text-[11px]">
              <div>
                <span className="block font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                  Role
                </span>
                <span className="text-on-surface-variant">{project.role}</span>
              </div>
              <div>
                <span className="block font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                  Client
                </span>
                <span className="text-on-surface-variant">{project.client}</span>
              </div>
              <div>
                <span className="block font-mono text-[8px] uppercase tracking-widest text-accent mb-1">
                  Year
                </span>
                <span className="text-on-surface-variant">{project.year}</span>
              </div>
            </div>
            <p className="mt-4 text-xs sm:text-sm text-secondary font-light leading-relaxed">
              {project.longDescription}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function WorkPanel() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-secondary font-light leading-relaxed">
        Selected projects across web, mobile, and automation — from test infrastructure to
        end-user experiences.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROJECT_DATA.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
