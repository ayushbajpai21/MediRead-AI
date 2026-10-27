import React, { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "../services/api.js";

const QUICK_QUESTIONS = [
  "When should I take each medicine?",
  "Are these medicines before or after food?",
  "Which medicine is for fever or pain?",
  "Are there any special warnings on this slip?"
];

export function ChatSection({ prescriptionData }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your prescription assistant. I can answer questions specifically about the medicines and instructions transcribed from your doctor's slip. How can I help?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (questionText) => {
    const text = (questionText || input).trim();
    if (!text || isSending) return;

    setInput("");
    setChatError("");

    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setIsSending(true);

    try {
      const response = await sendChatMessage(text, prescriptionData, newHistory);
      if (response && response.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
      } else {
        throw new Error("No response returned from the assistant.");
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatError(err.response?.data?.error || err.message || "Failed to communicate with chat service.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I could not process your query right now. Please verify your question or try again."
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[520px]">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
            Ask Questions About This Prescription
          </h3>
          <p className="text-[11px] text-slate-500">
            Strictly answers from extracted data • Powered by Groq LPU
          </p>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
          Contextual AI
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="p-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-[11px] font-medium text-slate-400 shrink-0">Quick prompts:</span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={isSending}
            className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 text-xs">
        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                  isUser
                    ? "bg-teal-700 text-white rounded-br-xs shadow-2xs"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs"
                }`}
              >
                {!isUser && (
                  <span className="block text-[10px] font-semibold text-teal-800 uppercase tracking-wider mb-1">
                    MediRead Assistant
                  </span>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-200 rounded-xl px-3.5 py-2.5 rounded-bl-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] ml-1">Analyzing prescription context...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Error alert if any */}
      {chatError && (
        <div className="px-4 py-1.5 bg-red-50 text-red-700 text-[11px] border-t border-red-100">
          {chatError}
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question (e.g. 'How many days do I take Augmentin?')..."
          disabled={isSending}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600 text-xs text-slate-800"
        />
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || isSending}
          className="px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 disabled:bg-slate-200 text-white font-medium text-xs transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
        >
          Send
        </button>
      </div>
    </div>
  );
}
