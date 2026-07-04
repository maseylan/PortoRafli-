import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import TechBackground from "./TechBackground";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative min-h-screen flex items-center justify-center px-6 md:px-16 pt-32 overflow-hidden cinematic-glow bg-[#0d0e11]"
    >
      {/* Dynamic Tech Background */}
      <TechBackground />

      {/* Dynamic Cursor Spotlight Overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(178, 198, 246, 0.08) 0%, transparent 80%)`,
          }}
        />
      )}

      {/* Subtle Grid Accent */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-20 text-center w-full max-w-5xl mx-auto flex flex-col justify-between h-[65vh]">
        {/* Header Metadata */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-between w-full font-mono text-[10px] tracking-[0.2em] text-on-surface-variant/70 uppercase"
        >
          <span>Rafli Ahmad Fachrezi // Fullstack & QA</span>
          <span>Location // Bekasi, Indonesia</span>
        </motion.div>

        {/* Display Typography */}
        <div className="my-auto py-12 flex flex-col items-center justify-center">
          {/* Main Title Backdrop Shadow Effect */}
          <div className="relative">
            {/* Blurred Underglow Text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="absolute inset-0 font-display text-[70px] md:text-[150px] leading-[0.8] tracking-[-0.05em] font-light italic select-none blur-xl text-primary"
            >
              Rafli
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="font-display text-[70px] md:text-[150px] leading-[0.8] tracking-[-0.05em] text-primary italic font-light mix-blend-lighten"
            >
              Rafli
            </motion.h1>
          </div>

          <div className="relative -mt-2 md:-mt-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 0.15, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="absolute inset-0 font-display text-[70px] md:text-[150px] leading-[0.8] tracking-[-0.05em] font-bold select-none blur-xl text-primary"
            >
              Ahmad
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="font-display text-[70px] md:text-[150px] leading-[0.8] tracking-[-0.05em] text-primary font-bold mix-blend-lighten"
            >
              Ahmad
            </motion.h1>
          </div>
        </div>

        {/* Footer Identifier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-auto"
        >
          <span className="font-mono text-[10px] text-on-surface-variant/60 tracking-[0.25em] uppercase bg-surface-container-low/30 px-4 py-2 border border-outline-variant/10 rounded-sm">
            [ Fullstack Developer & QA ]
          </span>
        </motion.div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-outline-variant/15 to-transparent" />
    </section>
  );
}
