"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Check, Mail, Sparkles } from "lucide-react";
import { Message } from "../../types";

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

  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setErrorMessage("");
    setStatus("sending");

    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", content: "" });
    }, 1500);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      {/* Dark Glass Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0e0d14]/90 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Redesigned Seamless Glass Modal Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0e0d14] p-5 sm:p-8 shadow-2xl backdrop-blur-2xl z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Decorative Grid Overlay Accent */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-on-surface-variant hover:text-secondary transition-colors p-1.5 rounded-full hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-secondary cursor-pointer z-20"
          aria-label="Close contact modal"
        >
          <X className="w-5 h-5" />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center relative z-10" aria-live="polite">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/15 border border-secondary/40 text-secondary shadow-lg">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-medium tracking-tight mb-2 text-white">
              Message Transmitted
            </h3>
            <p className="text-on-surface-variant text-xs sm:text-sm max-w-sm mb-6 leading-relaxed font-light">
              Your inquiry has been logged in the studio channel. I will respond to your email promptly.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                onClose();
              }}
              className="px-6 py-2.5 bg-secondary text-on-secondary font-mono text-xs tracking-wider uppercase rounded-full font-bold shadow-md hover:bg-secondary-container transition-all cursor-pointer"
            >
              [ Return to Portfolio ]
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Header */}
            <div className="mb-5 sm:mb-6 border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] tracking-widest text-secondary uppercase font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>DIRECT CHANNEL // INITIATE PROJECT</span>
              </div>
              <h2 id="contact-modal-title" className="font-display text-xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md">
                Start a Conversation
              </h2>
              <p className="text-on-surface-variant text-[11px] sm:text-xs font-light mt-1">
                Collaborate on web, mobile app development, or QA automation architecture.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="contact-name" className="block font-mono text-[10px] text-secondary tracking-widest uppercase mb-1 font-bold">
                  Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your Name / Organization"
                  disabled={status === "sending"}
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/10 text-white rounded-xl placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-xs sm:text-sm font-sans"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block font-mono text-[10px] text-secondary tracking-widest uppercase mb-1 font-bold">
                  Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@company.com"
                  disabled={status === "sending"}
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/10 text-white rounded-xl placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-xs sm:text-sm font-sans"
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="block font-mono text-[10px] text-secondary tracking-widest uppercase mb-1 font-bold">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Fullstack, QA automation, consultation..."
                  disabled={status === "sending"}
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/10 text-white rounded-xl placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-xs sm:text-sm font-sans"
                />
              </div>

              <div>
                <label htmlFor="contact-content" className="block font-mono text-[10px] text-secondary tracking-widest uppercase mb-1 font-bold">
                  Message *
                </label>
                <textarea
                  id="contact-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Project specifications, timeline, scope..."
                  disabled={status === "sending"}
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/10 text-white rounded-xl placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-xs sm:text-sm font-sans resize-none"
                />
              </div>

              {errorMessage && (
                <div className="text-error text-xs font-mono" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 bg-secondary text-on-secondary font-mono text-xs tracking-widest uppercase rounded-full font-bold hover:bg-secondary-container transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-secondary shadow-lg"
                >
                  {status === "sending" ? (
                    <>
                      <span className="h-4 w-4 border-2 border-on-secondary/30 border-t-on-secondary rounded-full animate-spin" />
                      TRANSMITTING INQUIRY...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      <span>SEND MESSAGE</span>
                      <Send className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
