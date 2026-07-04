import React from "react";
import { motion } from "motion/react";
import { EXPERIENCE_DATA } from "../data";

export default function ExperienceList() {
  return (
    <section id="experience" className="py-24 md:py-36 px-6 md:px-16 max-w-7xl mx-auto scroll-mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left column heading */}
        <div className="lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-32"
          >
            <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-on-surface leading-tight">
              Professional<br />Experience
            </h2>
            <div className="h-0.5 w-12 bg-primary/30 mt-6 hidden lg:block" />
          </motion.div>
        </div>

        {/* Right column experience items */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {EXPERIENCE_DATA.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="border-t border-outline-variant/20 pt-8 hover:bg-surface-container-low/30 transition-all duration-500 p-6 -mx-6 rounded-lg group"
            >
              <div className="flex flex-col sm:flex-row justify-between items-baseline mb-4 gap-2">
                <h3 className="font-display text-2xl md:text-3xl text-primary group-hover:text-primary-fixed transition-colors duration-300">
                  {exp.role}
                </h3>
                <span className="font-mono text-xs text-on-surface-variant/80 tracking-widest uppercase">
                  {exp.period}
                </span>
              </div>
              <p className="text-on-surface font-medium text-sm mb-3">
                {exp.company}
              </p>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed font-light max-w-2xl">
                {exp.description}
              </p>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="mt-4 space-y-2 max-w-2xl">
                  {exp.bullets.map((bullet, i) => (
                    <li key={i} className="flex gap-3 text-on-surface-variant text-sm md:text-base font-light">
                      <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"></span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
