import React, { useState } from "react";
import { motion } from "motion/react";
import { X, ExternalLink, Sliders, Layout, Eye, Sparkles } from "lucide-react";
import { Project } from "../types";

interface ProjectDetailModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  if (!project) return null;

  // Custom interactive playground states for each project
  // 1. Ethereal Spaces states
  const [focalDepth, setFocalDepth] = useState(15);
  const [shadowIntensity, setShadowIntensity] = useState(85);
  const [spotlightExposure, setSpotlightExposure] = useState(110);

  // 2. Monolith System states
  const [monolithTheme, setMonolithTheme] = useState<"dark" | "light" | "neon">("dark");
  const [monolithDensity, setMonolithDensity] = useState<"compact" | "normal" | "spacious">("normal");

  // 3. Void Aesthetics states
  const [voidContrast, setVoidContrast] = useState(120);
  const [eclipseAngle, setEclipseAngle] = useState(45);
  const [ambientGlow, setAmbientGlow] = useState(40);

  // Calculate dynamic styling for project 1 rendering
  const getEtherealSpacesStyle = () => {
    return {
      filter: `brightness(${spotlightExposure}%) contrast(${shadowIntensity}%) blur(${Math.max(0, (focalDepth - 10) / 5)}px)`,
      transition: "filter 0.2s ease-out",
    };
  };

  // Calculate styling for Project 3 rendering
  const getVoidAestheticsStyle = () => {
    return {
      filter: `contrast(${voidContrast}%) brightness(${100 - ambientGlow / 2}%)`,
      boxShadow: `0 0 ${ambientGlow}px rgba(178, 198, 246, ${ambientGlow / 200})`,
      transition: "filter 0.2s ease-out, box-shadow 0.2s ease-out",
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0d0e11]/90 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.98 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="relative w-full max-w-5xl h-[85vh] md:h-[80vh] overflow-hidden rounded-xl border border-outline-variant/20 bg-[#121316] flex flex-col shadow-2xl"
      >
        {/* Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent z-10" />

        {/* Header - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md z-10">
          <span className="font-mono text-[11px] tracking-widest text-on-surface-variant">
            [ ARCHIVE UNIT // {project.year} ]
          </span>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-high/50"
            aria-label="Close detail modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-12">
          {/* Main Title & Category */}
          <div className="space-y-3">
            <span className="font-mono text-xs tracking-wider text-primary">
              [ {project.category.toUpperCase()} ]
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-on-surface">
              {project.title}
            </h1>
          </div>

          {/* Banner Media Showcase */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-surface-container-low border border-outline-variant/10 group">
            <img
              src={project.image}
              alt={project.title}
              style={
                project.id === "ethereal-spaces"
                  ? getEtherealSpacesStyle()
                  : project.id === "void-aesthetics"
                  ? getVoidAestheticsStyle()
                  : undefined
              }
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
            />
            {project.id === "void-aesthetics" && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                  background: `linear-gradient(${eclipseAngle}deg, rgba(178,198,246,0) 20%, rgba(178,198,246,${ambientGlow / 300}) 50%, rgba(0,0,0,0.8) 80%)`,
                  transition: "background 0.3s ease",
                }}
              />
            )}
            <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-md border border-outline-variant/30 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider flex items-center gap-1.5">
              <Eye size={12} className="text-primary" />
              LIVE SHADER FEED // {project.year}
            </div>
          </div>

          {/* Metadata Grid & Philosophy */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
            {/* Left Sidebar Info */}
            <div className="md:col-span-4 space-y-6 md:border-r border-outline-variant/20 md:pr-8">
              <div>
                <h4 className="font-mono text-xs tracking-widest text-on-surface-variant uppercase mb-1">
                  Role
                </h4>
                <p className="text-sm font-medium text-on-surface">{project.role}</p>
              </div>

              <div>
                <h4 className="font-mono text-xs tracking-widest text-on-surface-variant uppercase mb-1">
                  Client
                </h4>
                <p className="text-sm font-medium text-on-surface">{project.client}</p>
              </div>

              <div>
                <h4 className="font-mono text-xs tracking-widest text-on-surface-variant uppercase mb-1">
                  Timeline
                </h4>
                <p className="text-sm font-medium text-on-surface">{project.year}</p>
              </div>

              <div>
                <h4 className="font-mono text-xs tracking-widest text-on-surface-variant uppercase mb-2">
                  System Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-surface-container border border-outline-variant/20 rounded font-mono text-[10px] text-on-surface-variant"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column Project Statement */}
            <div className="md:col-span-8 space-y-6">
              <div>
                <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-2">
                  [ CONCEPT STATEMENT ]
                </span>
                <p className="text-on-surface text-lg leading-relaxed font-light">
                  {project.description}
                </p>
              </div>

              <p className="text-on-surface-variant text-base leading-relaxed font-light">
                {project.longDescription}
              </p>
            </div>
          </div>

          {/* Interactive Playground Section */}
          <div className="border border-outline-variant/20 bg-surface-container-low/40 rounded-xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <Sliders size={18} className="text-primary" />
                <div>
                  <h3 className="font-display text-lg font-medium tracking-tight text-on-surface">
                    Interactive Workspace
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Manipulate client-side rendering attributes of this exhibit in real time.
                  </p>
                </div>
              </div>
              <span className="font-mono text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded">
                EXPERIMENT ENGINE v1.2
              </span>
            </div>

            {/* Custom controls based on project ID */}
            {project.id === "ethereal-spaces" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Focal Depth (Blur)</span>
                    <span className="text-primary">{focalDepth}m</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={focalDepth}
                    onChange={(e) => setFocalDepth(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-container h-1 rounded-lg cursor-pointer appearance-none"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 leading-normal">
                    Adjusts the artificial camera lens depth-of-field effect in the brutalist corridor.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Shadow Contrast</span>
                    <span className="text-primary">{shadowIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={shadowIntensity}
                    onChange={(e) => setShadowIntensity(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-container h-1 rounded-lg cursor-pointer appearance-none"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 leading-normal">
                    Amplifies concrete texture shadows, manipulating the architectural starkness.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Spotlight Exposure</span>
                    <span className="text-primary">{spotlightExposure}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={spotlightExposure}
                    onChange={(e) => setSpotlightExposure(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-container h-1 rounded-lg cursor-pointer appearance-none"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 leading-normal">
                    Simulates intensity adjustment of the overhead skylight hitting the slate walls.
                  </p>
                </div>
              </div>
            )}

            {project.id === "monolith-system" && (
              <div className="space-y-6">
                {/* Visualizer output */}
                <div
                  className={`border border-outline-variant/30 rounded-lg p-5 transition-all duration-300 ${
                    monolithTheme === "dark"
                      ? "bg-[#0d0e11] text-[#e3e2e6]"
                      : monolithTheme === "light"
                      ? "bg-[#f5f5f7] text-[#1a1c20]"
                      : "bg-[#090b14] text-[#7eb4fc]"
                  }`}
                >
                  <div className="flex justify-between items-center border-b border-outline-variant/20 pb-3 mb-4">
                    <span className="font-mono text-xs">MONOLITH // SANDBOX GRID</span>
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                  </div>

                  <div
                    className={`grid gap-4 ${
                      monolithDensity === "compact"
                        ? "grid-cols-4 text-[10px] p-2"
                        : monolithDensity === "normal"
                        ? "grid-cols-2 text-xs p-4"
                        : "grid-cols-1 text-sm p-6"
                    } transition-all duration-300`}
                  >
                    <div className="border border-outline-variant/20 rounded p-3 bg-surface-container-low/10 backdrop-blur">
                      <p className="font-mono text-primary mb-1">[ MODULE_ALPHA ]</p>
                      <p className="opacity-80">System throughput registers at normal operating range.</p>
                    </div>
                    <div className="border border-outline-variant/20 rounded p-3 bg-surface-container-low/10 backdrop-blur">
                      <p className="font-mono text-primary mb-1">[ MODULE_BETA ]</p>
                      <p className="opacity-80">Grid telemetry synchronization is complete.</p>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <span className="block text-xs font-mono text-on-surface-variant">
                      Aesthetic Theme Theme Mode:
                    </span>
                    <div className="flex gap-2">
                      {(["dark", "light", "neon"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setMonolithTheme(t)}
                          className={`flex-1 py-2 rounded text-xs font-mono uppercase tracking-wider border cursor-pointer transition-all ${
                            monolithTheme === t
                              ? "bg-primary text-background border-primary"
                              : "bg-surface-container border-outline-variant/20 text-on-surface hover:border-primary/40"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-xs font-mono text-on-surface-variant">
                      Density Modifier:
                    </span>
                    <div className="flex gap-2">
                      {(["compact", "normal", "spacious"] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => setMonolithDensity(d)}
                          className={`flex-1 py-2 rounded text-xs font-mono uppercase tracking-wider border cursor-pointer transition-all ${
                            monolithDensity === d
                              ? "bg-primary text-background border-primary"
                              : "bg-surface-container border-outline-variant/20 text-on-surface hover:border-primary/40"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {project.id === "void-aesthetics" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Shutter Contrast</span>
                    <span className="text-primary">{voidContrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    value={voidContrast}
                    onChange={(e) => setVoidContrast(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-container h-1 rounded-lg cursor-pointer appearance-none"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 leading-normal">
                    Alters black levels and contrast ratios in the editorial scene composition.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Eclipse Light Angle</span>
                    <span className="text-primary">{eclipseAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={eclipseAngle}
                    onChange={(e) => setEclipseAngle(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-container h-1 rounded-lg cursor-pointer appearance-none"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 leading-normal">
                    Rotates the cool-blue digital light slit passing behind the conceptual product.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-on-surface-variant">Ambient Corona Glow</span>
                    <span className="text-primary">{ambientGlow}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={ambientGlow}
                    onChange={(e) => setAmbientGlow(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-container h-1 rounded-lg cursor-pointer appearance-none"
                  />
                  <p className="text-[10px] text-on-surface-variant/70 leading-normal">
                    Modulates the subtle glow scatter representing physical light bouncing in a void.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-lowest flex justify-between items-center">
          <span className="text-[10px] font-mono text-on-surface-variant">
            [ SECURE SANDBOX MODULES VERIFY_OK ]
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/20 rounded font-mono text-xs text-on-surface tracking-wider transition-colors cursor-pointer"
          >
            [ Close Exhibit ]
          </button>
        </div>
      </motion.div>
    </div>
  );
}
