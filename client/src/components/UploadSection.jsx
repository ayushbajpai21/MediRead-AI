import React, { useState, useRef } from "react";

const MAX_SIZE_MB = 5;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function UploadSection({ onAnalyze, isAnalyzing, error, onClearError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFileValidation = (file) => {
    setValidationError("");
    if (onClearError) onClearError();

    if (!file) return false;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationError("Unsupported file format. Please upload a JPG, PNG, or WEBP image.");
      return false;
    }

    if (file.size > MAX_BYTES) {
      setValidationError(`Image size exceeds ${MAX_SIZE_MB} MB limit (${formatFileSize(file.size)}). Please choose a smaller file.`);
      return false;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setValidationError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClearError) onClearError();
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    if (!selectedFile || isAnalyzing) return;
    onAnalyze(selectedFile, previewUrl);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header text */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-semibold mb-3">
          <span>Vision-Powered Transcription</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
          Understand Your Prescription Better
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          Upload a clear photo of your doctor’s handwritten prescription or hospital slip. MediRead AI transcribes medications, dosages, and schedules with medical abbreviation decoding.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {!selectedFile ? (
          /* Empty / Drag & Drop Zone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleTriggerUpload}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-teal-500 bg-teal-50/50"
                : "border-slate-300 hover:border-teal-500 hover:bg-slate-50/50"
            }`}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
              <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Click to browse or drag and drop prescription photo
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              Supports JPG, PNG, and WEBP formats (Max 5 MB)
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
              Camera photo or gallery upload
            </div>
          </div>
        ) : (
          /* File Preview & Action Area */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0 shadow-2xs">
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Size: {formatFileSize(selectedFile.size)} • Type: {selectedFile.type.replace("image/", "").toUpperCase()}
                </p>
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  <button
                    type="button"
                    onClick={handleTriggerUpload}
                    disabled={isAnalyzing}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isAnalyzing}
                    className="px-2.5 py-1 text-xs font-medium text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Analyze Action Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Processing Prescription with Groq Vision...</span>
                </>
              ) : (
                <span>Analyze Prescription</span>
              )}
            </button>
          </div>
        )}

        {/* Validation or API Errors */}
        {(validationError || error) && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            <strong>Error:</strong> {validationError || error}
          </div>
        )}

        {/* Privacy and Medical Notice */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            <span>Prescriptions processed in memory only. No images saved to disk.</span>
          </div>
          <span>Strictly for transcription readability. Not for self-diagnosis.</span>
        </div>
      </div>
    </div>
  );
}
