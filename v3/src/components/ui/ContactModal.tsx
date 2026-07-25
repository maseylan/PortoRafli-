"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Check } from "lucide-react";
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#0e0d14]/85 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Modal Dialog Card (Matte Border, No Glow) */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-surface-container-high/95 p-8 shadow-2xl backdrop-blur-xl z-10 animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-highest/50 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
          aria-label="Close contact modal"
        >
          <X className="w-5 h-5" />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-10 text-center" aria-live="polite">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 border border-primary/40 text-primary">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-medium tracking-tight mb-2 text-white">
              Message Transmitted
            </h3>
            <p className="text-on-surface-variant text-sm max-w-sm mb-8 leading-relaxed font-light">
              Your message has been logged in the studio archive. We will respond promptly.
            </p>
            <button
              onClick={() => {
                setStatus("idle");
                onClose();
              }}
              className="px-8 py-3 bg-primary text-on-primary font-mono text-xs tracking-wider uppercase rounded-full font-bold shadow-md hover:bg-primary-container transition-all cursor-pointer"
            >
              [ Return to Experience ]
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="font-mono text-xs tracking-widest text-primary uppercase block mb-1 font-bold">
                [ Connect ]
              </span>
              <h2 id="contact-modal-title" className="font-display text-3xl font-medium tracking-tight text-white">
                Initiate Project
              </h2>
              <p className="text-on-surface-variant text-sm mt-1 font-light">
                Collaborate on web, mobile, or QA automation systems.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="block font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1">
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
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 text-white rounded-lg placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1">
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
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 text-white rounded-lg placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="block font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1">
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
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 text-white rounded-lg placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="contact-content" className="block font-mono text-xs text-on-surface-variant tracking-wider uppercase mb-1">
                  Message *
                </label>
                <textarea
                  id="contact-content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Project details, scope, timeline..."
                  disabled={status === "sending"}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-white/10 text-white rounded-lg placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm resize-none"
                />
              </div>

              {errorMessage && (
                <div className="text-error text-xs font-mono" role="alert">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3.5 bg-primary text-on-primary font-mono text-xs tracking-widest uppercase rounded-full font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary shadow-md"
                >
                  {status === "sending" ? (
                    <>
                      <span className="h-4 w-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                      Transmitting Inquiry...
                    </>
                  ) : (
                    <>
                      Transmit Transmission
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
