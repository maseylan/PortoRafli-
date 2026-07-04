import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { STUDIO_LOGO } from "../data";

interface NavigationProps {
  onContactClick: () => void;
}

export default function Navigation({ onContactClick }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#121316]/70 border-b border-outline-variant/10 py-4 backdrop-blur-xl"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-16 flex justify-between items-center">
          {/* Logo */}
          <a
            href="#"
            className="font-display text-xl md:text-2xl font-bold tracking-tighter text-on-surface hover:text-primary transition-colors duration-300"
          >
            {STUDIO_LOGO}
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-10 font-mono text-[11px] tracking-[0.15em] uppercase">
            <button
              onClick={() => scrollToSection("experience")}
              className="text-on-surface-variant hover:text-primary transition-colors duration-300 cursor-pointer"
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection("projects")}
              className="text-on-surface-variant hover:text-primary transition-colors duration-300 cursor-pointer"
            >
              Projects
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-on-surface-variant hover:text-primary transition-colors duration-300 cursor-pointer"
            >
              About Me
            </button>
          </div>

          {/* Contact Button */}
          <button
            onClick={onContactClick}
            className="hidden md:inline-flex items-center justify-center px-8 py-2.5 border border-primary/40 text-primary hover:bg-primary hover:text-background hover:border-primary transition-all duration-300 font-mono text-[10px] tracking-widest uppercase rounded-sm cursor-pointer"
          >
            Contact
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-on-surface hover:text-primary transition-colors p-1"
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[60px] z-30 bg-[#121316]/95 border-b border-outline-variant/20 backdrop-blur-2xl flex flex-col p-8 md:hidden gap-6 shadow-2xl"
          >
            <div className="flex flex-col gap-5 font-mono text-xs tracking-widest uppercase">
              <button
                onClick={() => scrollToSection("experience")}
                className="text-left text-on-surface-variant hover:text-primary py-2 cursor-pointer"
              >
                Experience
              </button>
              <button
                onClick={() => scrollToSection("projects")}
                className="text-left text-on-surface-variant hover:text-primary py-2 cursor-pointer"
              >
                Projects
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left text-on-surface-variant hover:text-primary py-2 cursor-pointer"
              >
                About Me
              </button>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                onContactClick();
              }}
              className="w-full py-3.5 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-background transition-all font-mono text-[10px] tracking-widest uppercase rounded-sm text-center cursor-pointer"
            >
              Contact Studio
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
