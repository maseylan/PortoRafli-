import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BIOGRAPHY_PORTRAIT, PHILOSOPHY_TAGS } from "../data";
import { Sparkles, Compass, Cpu, Palette } from "lucide-react";

const TAG_DETAILS: Record<string, { icon: React.ReactNode; text: string }> = {
  "Fullstack Development": {
    icon: <Palette size={14} className="text-primary" />,
    text: "Building responsive web applications using React, Vue, Next.js, and robust backends with Python, FastAPI, and Laravel.",
  },
  "API Testing": {
    icon: <Compass size={14} className="text-primary" />,
    text: "Ensuring data integrity and robust backend communication using Pytest and Postman.",
  },
  "CI/CD Integration": {
    icon: <Sparkles size={14} className="text-primary" />,
    text: "Automating execution workflows and integrating testing securely into continuous delivery pipelines.",
  },
  "Performance Testing": {
    icon: <Cpu size={14} className="text-primary" />,
    text: "Engineering stress testing infrastructure using Selenium Grid, Docker, and multi-threaded parallel execution.",
  },
};

export default function AboutMe() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <section id="about" className="py-24 md:py-36 px-6 md:px-16 max-w-7xl mx-auto scroll-mt-12 cinematic-glow">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left column - Grayscale custom portrait with color-glow hover */}
        <div className="lg:col-span-5 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="relative aspect-square w-full max-w-[380px] rounded-full overflow-hidden bg-surface-container border border-outline-variant/20 shadow-2xl group cursor-pointer"
          >
            {/* Ambient Backlight glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            <img
              src={BIOGRAPHY_PORTRAIT}
              alt="Portrait of Rafli Ahmad Fachrezi"
              className="w-full h-full object-cover object-[center_15%] opacity-75 grayscale group-hover:grayscale-0 group-hover:scale-[1.02] group-hover:opacity-90 transition-all duration-1000 ease-out"
            />

            {/* Glowing overlay lines */}
            <div className="absolute inset-0 border border-primary/20 rounded-full scale-95 pointer-events-none group-hover:scale-[0.98] transition-transform duration-700" />
          </motion.div>
        </div>

        <div className="lg:col-span-1"></div>

        {/* Right column - Philosophy Details */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-mono text-xs text-primary tracking-[0.2em] uppercase"
          >
            [ Philosophy ]
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-3xl md:text-5xl font-medium text-on-surface leading-tight tracking-tight"
          >
            Engineering scalable applications and ensuring software reliability.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 text-on-surface-variant text-sm md:text-base leading-relaxed font-light"
          >
            <p>
              I am a Fullstack Developer and QA Automation Engineer with experience in building end-to-end web applications and robust software testing frameworks. I specialize in crafting seamless user interfaces with modern frontend technologies like React and Vue, while powering them with scalable backends in Python and Laravel.
            </p>
            <p>
              Bridging the gap between development and quality assurance, I build custom QA tools, complex automation dashboards, and CI/CD pipelines to streamline workflows. I am passionate about delivering highly performant, maintainable solutions and collaborating with cross-functional teams to ensure zero-defect software delivery.
            </p>
          </motion.div>

          {/* Interactive Chips/Tags with custom interactive tooltip container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 space-y-4"
          >
            <div className="flex flex-wrap gap-2.5">
              {PHILOSOPHY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-wider border cursor-pointer transition-all duration-300 ${activeTag === tag
                    ? "bg-primary text-background border-primary shadow-[0_0_15px_rgba(178,198,246,0.25)]"
                    : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface border-outline-variant/20 hover:border-primary/40"
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Dynamic Info Panel based on Selected Tag */}
            <div className="h-16 relative">
              <AnimatePresence mode="wait">
                {activeTag ? (
                  <motion.div
                    key={activeTag}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-2.5 p-3.5 bg-surface-container-low/60 border border-outline-variant/15 rounded-lg text-xs"
                  >
                    <div className="mt-0.5">{TAG_DETAILS[activeTag].icon}</div>
                    <div className="text-on-surface-variant leading-relaxed">
                      <strong className="text-on-surface font-mono mr-1">[{activeTag}]</strong>{" "}
                      {TAG_DETAILS[activeTag].text}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    className="text-[11px] font-mono tracking-wider text-on-surface-variant italic pl-1.5 pt-2"
                  >
                    * Select a capability chip to inspect operational philosophy details.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
