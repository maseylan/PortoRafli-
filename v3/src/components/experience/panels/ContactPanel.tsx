"use client";

import React, { useState } from "react";
import { Send, Check } from "lucide-react";
import type { Message } from "../../../types";

const inputClass =
  "w-full px-4 py-3 bg-white/[0.03] border border-white/10 text-on-surface rounded-xl placeholder:text-on-surface-variant/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all text-xs sm:text-sm";

export default function ContactPanel() {
  const [formData, setFormData] = useState<Message>({
    name: "",
    email: "",
    subject: "",
    content: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.content) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }
    setErrorMessage("");
    setStatus("sending");
    window.setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", content: "" });
    }, 1200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-10 animate-fade-in">
        <div className="mb-4 h-12 w-12 rounded-full bg-accent/15 border border-accent/40 text-accent flex items-center justify-center">
          <Check className="w-6 h-6" />
        </div>
        <h4 className="font-display text-xl font-bold text-on-surface mb-2">
          Message Transmitted
        </h4>
        <p className="text-on-surface-variant text-xs max-w-sm leading-relaxed font-light">
          Your inquiry has been logged. I will respond to your email promptly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="p-name"
            className="block font-mono text-[10px] text-on-surface-variant tracking-widest uppercase mb-1.5 font-bold"
          >
            Name *
          </label>
          <input
            id="p-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Your Name / Organization"
            disabled={status === "sending"}
            className={inputClass}
          />
        </div>
        <div>
          <label
            htmlFor="p-email"
            className="block font-mono text-[10px] text-on-surface-variant tracking-widest uppercase mb-1.5 font-bold"
          >
            Email *
          </label>
          <input
            id="p-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="name@company.com"
            disabled={status === "sending"}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="p-subject"
          className="block font-mono text-[10px] text-on-surface-variant tracking-widest uppercase mb-1.5 font-bold"
        >
          Subject
        </label>
        <input
          id="p-subject"
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          placeholder="Fullstack, QA automation, consultation..."
          disabled={status === "sending"}
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="p-content"
          className="block font-mono text-[10px] text-on-surface-variant tracking-widest uppercase mb-1.5 font-bold"
        >
          Message *
        </label>
        <textarea
          id="p-content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          required
          rows={5}
          placeholder="Project specifications, timeline, scope..."
          disabled={status === "sending"}
          className={`${inputClass} resize-none`}
        />
      </div>
      {errorMessage && (
        <div className="text-error text-xs font-mono" role="alert">
          {errorMessage}
        </div>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="btn-primary w-full sm:w-auto py-3.5 px-8 rounded-full font-mono text-[11px] tracking-[0.2em] uppercase font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {status === "sending" ? (
          <>
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Transmitting...
          </>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
