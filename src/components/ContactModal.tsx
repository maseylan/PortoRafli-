import React, { useState } from "react";
import { motion } from "motion/react";
import { X, Send, Check } from "lucide-react";
import { Message } from "../types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState<Message>({
    name: "",
    email: "",
    subject: "",
    content: "",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setErrorMessage("");
    setStatus("sending");

    // Simulate sending with premium timing
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", content: "" });
    }, 1800);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#0d0e11]/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
        className="relative w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-high/95 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Glow Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-highest/50"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary shadow-[0_0_20px_rgba(178,198,246,0.1)]">
              <Check size={32} />
            </div>
            <h3 className="font-display text-2xl font-medium tracking-tight mb-3 text-on-surface">
              Message Transmitted
            </h3>
            <p className="text-on-surface-variant text-sm max-w-sm mb-8 leading-relaxed">
              Your inquiry has been logged in the studio archive. We will reach out shortly to initiate the dialogue.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                onClose();
              }}
              className="px-8 py-3 bg-primary text-background font-mono text-xs tracking-wider uppercase rounded hover:bg-primary-fixed hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
            >
              [ Return to Archive ]
            </button>
          </motion.div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-1">
                [ Connect ]
              </span>
              <h2 className="font-display text-3xl font-medium tracking-tight text-on-surface">
                Initiate Project
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                Collaborate on experiences that resonate emotionally.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="How should we address you?"
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 font-sans text-sm"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@company.com"
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 font-sans text-sm"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Partnership, consultation, or other inquiry"
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 font-sans text-sm"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1.5">
                  Message *
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Tell us about your timeline, vision, and scale..."
                  disabled={status === "sending"}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all duration-300 resize-none font-sans text-sm leading-relaxed"
                />
              </div>

              {errorMessage && (
                <div className="text-error text-xs font-mono tracking-wide">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-4 bg-primary text-background font-mono text-xs tracking-widest uppercase rounded hover:bg-primary-fixed hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  {status === "sending" ? (
                    <>
                      <span className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      Transmitting Inquiry...
                    </>
                  ) : (
                    <>
                      Transmit Transmission
                      <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
