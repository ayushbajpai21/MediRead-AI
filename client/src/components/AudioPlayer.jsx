import React, { useState, useEffect } from "react";

export function AudioPlayer({ prescriptionData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!isSupported || !prescriptionData?.medicines?.length) {
    return null;
  }

  const prepareScript = () => {
    let script = `Prescription Summary. `;
    if (prescriptionData.doctorName) {
      script += `Prescribed by ${prescriptionData.doctorName}. `;
    }

    script += `You have ${prescriptionData.medicines.length} medications prescribed. `;

    prescriptionData.medicines.forEach((med, idx) => {
      script += `Medicine number ${idx + 1}: ${med.name || "Medicine name unclear"}. `;
      if (med.strength) script += `Strength: ${med.strength}. `;
      if (med.dosage) script += `Take ${med.dosage}. `;
      if (med.frequencyDecoded) script += `Schedule: ${med.frequencyDecoded}. `;
      if (med.timing) script += `Timing: ${med.timing}. `;
      if (med.instructions) script += `Special note: ${med.instructions}. `;
    });

    if (prescriptionData.otherInstructions?.length) {
      script += `General instructions: ${prescriptionData.otherInstructions.join(". ")}. `;
    }

    script += `Please confirm all details with your pharmacist before taking.`;
    return script;
  };

  const handlePlay = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const text = prepareScript();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, clear cadence for medical speech
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50/70 border border-teal-200/60 text-teal-900 text-xs font-medium">
      <span className="text-teal-700 font-medium">Audio Readout:</span>

      {!isPlaying ? (
        <button
          onClick={handlePlay}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors shadow-2xs"
          title="Listen to transcription"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>{isPaused ? "Resume" : "Listen"}</span>
        </button>
      ) : (
        <button
          onClick={handlePause}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
          title="Pause readout"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          <span>Pause</span>
        </button>
      )}

      {(isPlaying || isPaused) && (
        <button
          onClick={handleStop}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
          title="Stop readout"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
          <span>Stop</span>
        </button>
      )}
    </div>
  );
}
