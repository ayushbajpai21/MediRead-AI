import React from "react";

export function MedicineCard({ medicine, index }) {
  const uncertain = Array.isArray(medicine.uncertainFields) ? medicine.uncertainFields : [];
  const hasUncertainties = uncertain.length > 0;

  return (
    <div className={`p-4 rounded-xl border transition-shadow bg-white ${
      hasUncertainties ? "border-amber-300 ring-1 ring-amber-100" : "border-slate-200 hover:shadow-xs"
    }`}>
      {/* Top row: Medicine Name & Index */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-2.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            {index + 1}
          </span>
          <div>
            <h4 className="text-base font-semibold text-slate-900 tracking-tight leading-snug">
              {medicine.name ? (
                medicine.name
              ) : (
                <span className="text-amber-700 italic font-normal bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Unclear Medicine Name — Verification Required
                </span>
              )}
            </h4>
            {medicine.purpose && (
              <p className="text-xs text-slate-500 mt-0.5">
                {medicine.purpose}
              </p>
            )}
          </div>
        </div>

        {/* Strength Badge */}
        {medicine.strength ? (
          <span className="shrink-0 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-mono text-xs font-semibold border border-slate-200">
            {medicine.strength}
          </span>
        ) : (
          uncertain.includes("strength") && (
            <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
              Strength unclear
            </span>
          )
        )}
      </div>

      {/* Grid of clinical fields */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs border-t border-slate-100">
        {/* Dosage */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Dosage
          </span>
          <span className="font-medium text-slate-800">
            {medicine.dosage || (
              uncertain.includes("dosage") ? (
                <span className="text-amber-700">Unclear</span>
              ) : (
                "Not specified"
              )
            )}
          </span>
        </div>

        {/* Frequency & decoded shorthand */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Schedule
          </span>
          <div className="font-medium text-slate-800">
            {medicine.frequencyDecoded ? (
              <span className="inline-block font-medium text-teal-900">
                {medicine.frequencyDecoded}
              </span>
            ) : medicine.frequency ? (
              <span className="font-mono">{medicine.frequency}</span>
            ) : (
              <span className="text-slate-400">Not specified</span>
            )}
          </div>
        </div>

        {/* Timing with food */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Timing
          </span>
          <span className="font-medium text-slate-800">
            {medicine.timing || "As directed"}
          </span>
        </div>

        {/* Duration */}
        <div>
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Duration
          </span>
          <span className="font-medium text-slate-800">
            {medicine.duration || "As prescribed"}
          </span>
        </div>

        {/* Specific Doctor Instructions */}
        {medicine.instructions && (
          <div className="col-span-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Instructions
            </span>
            <span className="text-slate-700 italic">
              "{medicine.instructions}"
            </span>
          </div>
        )}
      </div>

      {/* Uncertainty warning note */}
      {hasUncertainties && (
        <div className="mt-3 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 flex items-start gap-2 text-xs text-amber-900">
          <span className="font-bold text-amber-700">Notice:</span>
          <span>
            Doctor handwriting for <strong className="font-semibold">{uncertain.join(", ")}</strong> is indistinct. Please verify with the dispensing chemist before administration.
          </span>
        </div>
      )}
    </div>
  );
}
