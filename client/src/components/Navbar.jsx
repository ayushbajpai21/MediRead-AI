import React from "react";
import { Logo } from "./Logo.jsx";

export function Navbar({ onReset, hasResults }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={hasResults ? onReset : undefined} 
          className={hasResults ? "cursor-pointer transition-opacity hover:opacity-90" : ""}
          role={hasResults ? "button" : undefined}
          tabIndex={hasResults ? 0 : undefined}
        >
          <Logo />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Groq LPU Vision</span>
          </div>

          {hasResults && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-xs"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Prescription</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
