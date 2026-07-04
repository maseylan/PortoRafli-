/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import ExperienceList from "./components/ExperienceList";
import SelectedWorks from "./components/SelectedWorks";
import AboutMe from "./components/AboutMe";
import Footer from "./components/Footer";
import ProjectDetailModal from "./components/ProjectDetailModal";
import ContactModal from "./components/ContactModal";
import { Project } from "./types";

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#121316] text-[#e3e2e6] overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Decorative ambient background spotlight effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[20vh] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/2 blur-[140px]" />
        <div className="absolute top-[120vh] right-[5%] w-[400px] h-[400px] rounded-full bg-primary/1 blur-[120px]" />
        <div className="absolute bottom-[80vh] left-[5%] w-[450px] h-[450px] rounded-full bg-primary/2 blur-[150px]" />
      </div>

      {/* Navigation */}
      <Navigation onContactClick={() => setIsContactOpen(true)} />

      {/* Main Content Sections */}
      <main className="relative z-10">
        <Hero />
        <ExperienceList />
        <SelectedWorks onProjectClick={(p) => setSelectedProject(p)} />
        <AboutMe />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isContactOpen && (
          <ContactModal
            isOpen={isContactOpen}
            onClose={() => setIsContactOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

