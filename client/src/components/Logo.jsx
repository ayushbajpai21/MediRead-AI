import React from "react";

export function Logo({ size = "default", className = "" }) {
  const isLarge = size === "large";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Custom Hospital / Medicine MR Monogram Emblem */}
      <div
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-700 via-teal-800 to-slate-900 shadow-sm border border-teal-600/30 ${
          isLarge ? "w-14 h-14" : "w-10 h-10"
        }`}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={isLarge ? "w-9 h-9" : "w-6 h-6"}
        >
          {/* Medical Cross Background Accent */}
          <rect x="20" y="8" width="4" height="28" rx="2" fill="#2DD4BF" opacity="0.3" />
          <rect x="8" y="20" width="28" height="4" rx="2" fill="#2DD4BF" opacity="0.3" />

          {/* Letter M - Modern Architectural Lines */}
          <path
            d="M 10 32 L 10 13 L 17 23 L 24 13 L 24 32"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Letter R - Medical Prescription Rx Curve with Capsule loop */}
          <path
            d="M 24 13 L 30 13 C 33.5 13 35.5 15.2 35.5 18 C 35.5 20.8 33.5 23 30 23 L 24 23 M 29 23 L 35.5 32"
            stroke="#2DD4BF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Medical Cross Accent Node */}
          <circle cx="24" cy="23" r="2.2" fill="#FFFFFF" />
        </svg>

        {/* Small Prescription Notch / Hospital Pulse Dot */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-bold tracking-tight text-slate-900 text-lg leading-tight">
            MediRead
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-teal-800 bg-teal-100 rounded-md uppercase">
            AI
          </span>
        </div>
        <span className="text-[11px] font-medium tracking-wide text-slate-600 leading-none mt-0.5">
          Prescription Assistant
        </span>
      </div>
    </div>
  );
}
