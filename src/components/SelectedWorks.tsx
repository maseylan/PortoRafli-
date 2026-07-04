import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { PROJECT_DATA } from "../data";
import { Project } from "../types";

interface SelectedWorksProps {
  onProjectClick: (project: Project) => void;
}

export default function SelectedWorks({ onProjectClick }: SelectedWorksProps) {
  return (
    <section id="projects" className="py-24 md:py-36 px-6 md:px-16 bg-[#0d0e11] scroll-mt-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Title Bar */}
        <div className="mb-16 md:mb-24 flex justify-between items-end">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="font-display text-4xl md:text-5xl font-medium tracking-tight text-on-surface"
          >
            Selected Works
          </motion.h2>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-mono text-xs text-on-surface-variant tracking-[0.15em] hidden md:block uppercase"
          >
            [ 03 Projects ]
          </motion.span>
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {PROJECT_DATA.map((project, index) => {
            const isFullWidth = project.id === "ethereal-spaces";
            const isOffset = project.id === "void-aesthetics";

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                onClick={() => onProjectClick(project)}
                className={`${isFullWidth ? "md:col-span-2" : "md:col-span-1"} ${
                  isOffset ? "md:mt-24" : ""
                } group cursor-pointer`}
              >
                {/* Image Showcase Box */}
                <div
                  className={`relative overflow-hidden rounded bg-[#1b1b1f] ${
                    isFullWidth ? "aspect-video" : "aspect-[4/5]"
                  } mb-6 border border-outline-variant/10 shadow-lg group-hover:border-primary/20 group-hover:shadow-[0_0_40px_rgba(178,198,246,0.12)] transition-all duration-700`}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-1000 ease-out"
                  />
                  {/* Subtle inner grid lines in image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Info & Text Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-2xl md:text-3xl text-on-surface group-hover:text-primary transition-colors duration-300 mb-1.5 font-medium tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm md:text-base font-light">
                      {project.category}
                    </p>
                  </div>
                  {/* Arrow Lift Transition Indicator */}
                  <div className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 p-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
