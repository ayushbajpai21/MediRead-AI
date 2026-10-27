import React, { useState } from "react";

export function PrescriptionViewer({ imageUrl, fileName, fileSize }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header bar with controls */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Original Prescription Image
          </h3>
          <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
            {fileName} {fileSize ? `(${fileSize})` : ""}
          </p>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.75}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 text-sm font-semibold transition-colors"
            title="Zoom Out"
          >
            -
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 h-7 flex items-center justify-center text-[11px] font-mono font-medium text-slate-700 hover:bg-slate-100 rounded transition-colors"
            title="Reset Zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="w-7 h-7 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-40 text-sm font-semibold transition-colors"
            title="Zoom In"
          >
            +
          </button>
        </div>
      </div>

      {/* Image Pan & View Area */}
      <div className="relative flex-1 min-h-[380px] max-h-[620px] overflow-auto bg-slate-100 flex items-center justify-center p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Original doctor prescription"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "center center",
              transition: "transform 0.15s ease-out"
            }}
            className="max-w-full max-h-full object-contain rounded shadow-xs select-none"
          />
        ) : (
          <span className="text-xs text-slate-400">No image available</span>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
        <span>Use zoom controls to inspect cursive handwriting</span>
        <span className="text-teal-700 font-medium">Original Document</span>
      </div>
    </div>
  );
}
