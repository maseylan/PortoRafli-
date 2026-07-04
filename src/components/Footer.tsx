import React from "react";
import { motion } from "motion/react";
import { STUDIO_LOGO } from "../data";

export default function Footer() {
  return (
    <footer className="bg-[#0d0e11] border-t border-outline-variant/10 py-16 px-6 md:px-16 w-full mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand Name */}
        <span className="font-display text-2xl font-bold tracking-tighter text-on-surface">
          {STUDIO_LOGO}
        </span>

        {/* Social Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] tracking-[0.15em] uppercase text-on-surface-variant/80">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors duration-300"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/rafli-ahmad-078155200/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors duration-300"
          >
            LinkedIn
          </a>
          <a
            href="mailto:rafliahmad758@gmail.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-primary transition-colors duration-300"
          >
            Email
          </a>
        </div>

        {/* Copyright notice */}
        <span className="font-mono text-[10px] text-on-surface-variant/50">
          © {new Date().getFullYear()} {STUDIO_LOGO}. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
