import React, { useState } from "react";

const SHORTHAND_ENTRIES = [
  { code: "OD / QD", meaning: "Once a day", hindi: "दिन में 1 बार", timing: "Take once every 24 hours at a fixed time" },
  { code: "BD / BID", meaning: "Twice a day", hindi: "दिन में 2 बार", timing: "Morning & Night (Approx 12h apart)" },
  { code: "TDS / TID", meaning: "Three times a day", hindi: "दिन में 3 बार", timing: "Morning, Afternoon, Night (Approx 8h apart)" },
  { code: "QID", meaning: "Four times a day", hindi: "दिन में 4 बार", timing: "Every 6 hours" },
  { code: "SOS / PRN", meaning: "As needed / In pain", hindi: "ज़रूरत पड़ने पर", timing: "Only during high fever or severe pain" },
  { code: "AC", meaning: "Before food", hindi: "खाने से पहले", timing: "Take 30 minutes before meal" },
  { code: "PC", meaning: "After food", hindi: "खाने के बाद", timing: "Take 15-30 minutes after meal" },
  { code: "HS", meaning: "At bedtime", hindi: "सोने से पहले", timing: "Take right before sleeping" }
];

export function ShorthandGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span>Doctor Shorthand Guide (OD, BD, TDS, SOS Explained)</span>
        </span>
        <span className="text-slate-400 font-normal">
          {isOpen ? "Hide guide ▲" : "View guide ▼"}
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SHORTHAND_ENTRIES.map((item) => (
              <div
                key={item.code}
                className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs"
              >
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-mono font-bold text-teal-800">{item.code}</span>
                  <span className="text-[11px] font-medium text-slate-500">{item.hindi}</span>
                </div>
                <div className="font-medium text-slate-800">{item.meaning}</div>
                <div className="text-[11px] text-slate-500 mt-1">{item.timing}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 mt-3 italic">
            Note: Always follow specific timing prescribed on your doctor's slip.
          </p>
        </div>
      )}
    </div>
  );
}
