"use client";

import React, { useEffect, useState } from "react";

/**
 * Boot screen "Setting the scene…" — pola growon.kr.
 * Progress dikendalikan Experience (boot-done dari scene + min delay).
 */
export default function BootScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((prev) => Math.min(96, prev + Math.random() * 9));
    }, 90);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#0e0d14]">
      <div className="font-display italic font-extrabold text-2xl sm:text-3xl tracking-tight">
        <span className="text-white">RAFLI </span>
        <span className="text-primary">AHMAD FACHREZI</span>
      </div>
      <div className="font-mono text-[10px] tracking-[0.35em] text-on-surface-variant uppercase">
        Setting the scene…
      </div>
      <div className="w-64 h-[3px] bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
