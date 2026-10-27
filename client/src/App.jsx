import React, { useState } from "react";
import { Navbar } from "./components/Navbar.jsx";
import { UploadSection } from "./components/UploadSection.jsx";
import { PrescriptionViewer } from "./components/PrescriptionViewer.jsx";
import { MedicineCard } from "./components/MedicineCard.jsx";
import { ShorthandGuide } from "./components/ShorthandGuide.jsx";
import { AudioPlayer } from "./components/AudioPlayer.jsx";
import { ChatSection } from "./components/ChatSection.jsx";
import { downloadCalendarFile } from "./utils/calendarExport.js";
import { analyzePrescription } from "./services/api.js";

export function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiError, setApiError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const handleAnalyze = async (file, url) => {
    setSelectedFile(file);
    setPreviewUrl(url);
    setIsAnalyzing(true);
    setApiError("");

    try {
      const response = await analyzePrescription(file);
      if (response && response.success && response.data) {
        setAnalysisResult(response.data);
      } else {
        throw new Error(response?.error || "Failed to analyze prescription image.");
      }
    } catch (err) {
      console.error("Prescription analysis failed:", err);
      const msg = err.response?.data?.error || err.message || "An unexpected error occurred during analysis.";
      setApiError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setApiError("");
    setCopySuccess(false);
  };

  const generatePlainTextSummary = () => {
    if (!analysisResult) return "";
    let txt = `MEDICINE PRESCRIPTION TRANSCRIPTION - MEDIREAD AI\n`;
    txt += `====================================================\n`;
    txt += `Doctor: ${analysisResult.doctorName || "Not identified"}\n`;
    txt += `Clinic/Hospital: ${analysisResult.clinicOrHospital || "Not identified"}\n`;
    txt += `Date: ${analysisResult.date || "Not visible"}\n`;
    txt += `Patient: ${analysisResult.patientName || "Unknown"} (${analysisResult.patientAge || "N/A"})\n\n`;

    txt += `PRESCRIBED MEDICINES:\n`;
    analysisResult.medicines?.forEach((m, i) => {
      txt += `${i + 1}. ${m.name || "UNCLEAR NAME"}\n`;
      if (m.strength) txt += `   Strength: ${m.strength}\n`;
      if (m.dosage) txt += `   Dosage: ${m.dosage}\n`;
      if (m.frequency) txt += `   Frequency: ${m.frequency} (${m.frequencyDecoded || ""})\n`;
      if (m.timing) txt += `   Timing: ${m.timing}\n`;
      if (m.duration) txt += `   Duration: ${m.duration}\n`;
      if (m.instructions) txt += `   Instructions: ${m.instructions}\n`;
      if (m.uncertainFields?.length) txt += `   [!] Unclear fields: ${m.uncertainFields.join(", ")}\n`;
      txt += `\n`;
    });

    if (analysisResult.otherInstructions?.length) {
      txt += `OTHER INSTRUCTIONS:\n- ${analysisResult.otherInstructions.join("\n- ")}\n\n`;
    }

    if (analysisResult.unclearText?.length) {
      txt += `UNCLEAR HANDWRITING NOTES:\n- ${analysisResult.unclearText.join("\n- ")}\n\n`;
    }

    txt += `DISCLAIMER: AI transcription may contain errors. Always verify with a certified pharmacist or doctor.\n`;
    return txt;
  };

  const handleCopyText = async () => {
    const text = generatePlainTextSummary();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  const handleDownloadTxt = () => {
    const text = generatePlainTextSummary();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `MediRead_Prescription_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar onReset={handleReset} hasResults={Boolean(analysisResult)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!analysisResult ? (
          /* Upload State */
          <UploadSection
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            error={apiError}
            onClearError={() => setApiError("")}
          />
        ) : (
          /* Results State */
          <div className="space-y-6">
            {/* Action Bar & Notification */}
            {analysisResult.isMock && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                    Demo Mode
                  </span>
                  <span>{analysisResult.mockNotice || "Running in mock mode. Add GROQ_API_KEY to server/.env for live vision analysis."}</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AudioPlayer prescriptionData={analysisResult} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* 1-Click Calendar Export */}
                <button
                  type="button"
                  onClick={() => downloadCalendarFile(analysisResult.medicines, analysisResult.doctorName)}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 font-medium transition-colors"
                  title="Add dosage schedule to Apple / Google / Phone Calendar"
                >
                  📅 Add to Calendar (.ics)
                </button>

                {/* Copy Text */}
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  {copySuccess ? "✓ Copied!" : "Copy Text"}
                </button>

                {/* Download TXT */}
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Download .TXT
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-medium transition-colors shadow-2xs"
                >
                  Analyze Another
                </button>
              </div>
            </div>

            {/* Split Screen Grid: 5 cols Left (Image), 7 cols Right (Structured Medical Data) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image Viewer */}
              <div className="lg:col-span-5 sticky top-20">
                <PrescriptionViewer
                  imageUrl={previewUrl}
                  fileName={selectedFile?.name || "prescription.jpg"}
                  fileSize={selectedFile?.size ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ""}
                />
              </div>

              {/* Right Column: Transcription Details & Chat */}
              <div className="lg:col-span-7 space-y-6">
                {/* Doctor & Patient Metadata Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Prescribing Doctor / Hospital
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                        {analysisResult.doctorName || "Doctor name not transcribed"}
                      </h3>
                      {analysisResult.clinicOrHospital && (
                        <p className="text-slate-500 text-[11px]">
                          {analysisResult.clinicOrHospital}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                        Date
                      </span>
                      <span className="font-medium text-slate-700">
                        {analysisResult.date || "Date not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-600">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Patient Record:</span>
                      <span className="font-medium text-slate-800">
                        {analysisResult.patientName || "Not identified"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Age / Sex:</span>
                      <span className="font-medium text-slate-800">
                        {analysisResult.patientAge || "N/A"}
                      </span>
                    </div>
                  </div>

                  {analysisResult.diagnosisOrSymptoms?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 block mb-1">
                        Diagnosis / Symptoms Noted:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.diagnosisOrSymptoms.map((diag, dIdx) => (
                          <span
                            key={dIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                          >
                            {diag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Shorthand Decoder Guide */}
                <ShorthandGuide />

                {/* Medicines Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <span>Prescribed Medications</span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
                        {analysisResult.medicines?.length || 0}
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Decoded into patient-friendly schedule
                    </span>
                  </div>

                  {analysisResult.medicines?.length > 0 ? (
                    <div className="space-y-3">
                      {analysisResult.medicines.map((med, index) => (
                        <MedicineCard key={index} medicine={med} index={index} />
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-slate-200 bg-white text-center text-xs text-slate-500">
                      No medications could be confidently identified from this image.
                    </div>
                  )}
                </div>

                {/* General Doctor Instructions */}
                {analysisResult.otherInstructions?.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs text-xs">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span>Doctor's General & Dietary Instructions</span>
                    </h4>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-600 pl-1">
                      {analysisResult.otherInstructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Unclear Handwriting Notes */}
                {analysisResult.unclearText?.length > 0 && (
                  <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-4 text-xs text-amber-900">
                    <h4 className="font-semibold text-amber-800 mb-1">
                      Ambiguous or Illegible Handwriting Noted:
                    </h4>
                    <ul className="space-y-1 list-disc list-inside text-amber-800/90 pl-1">
                      {analysisResult.unclearText.map((un, uIdx) => (
                        <li key={uIdx}>{un}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Interactive Groq Consultation Chat */}
                <div>
                  <ChatSection prescriptionData={analysisResult} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Hospital & Medical Legal Disclaimer Banner */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1.5">
          <p className="font-semibold text-slate-700">
            MediRead AI Clinical Transcription Disclaimer
          </p>
          <p className="text-[11px] leading-relaxed">
            This tool uses artificial intelligence (Groq LPU Vision) to assist in reading handwritten medical documents. It is NOT a medical diagnosis tool, prescribing system, or clinical authority. Medicine names, strengths, and dosages must always be verified by a registered pharmacist or qualified healthcare physician before consumption. Never alter doctor instructions or discontinue prescribed therapy based solely on AI output.
          </p>
        </div>
      </footer>
    </div>
  );
}
export default App;
