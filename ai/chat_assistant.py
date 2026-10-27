import logging
from typing import List
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from groq_client import get_chat_model, has_groq_key
from prompts import PRESCRIPTION_CHAT_SYSTEM_PROMPT
from schemas import PrescriptionAnalysis, ChatMessage

logger = logging.getLogger("mediread.ai")


def format_prescription_context(data: PrescriptionAnalysis) -> str:
    """Builds a structured textual context string from the extracted prescription."""
    if not data:
        return "No prescription data available."

    lines = [
        "PRESCRIPTION SUMMARY:",
        f"- Doctor: {data.doctorName or 'Not identified'}",
        f"- Clinic/Hospital: {data.clinicOrHospital or 'Not identified'}",
        f"- Date: {data.date or 'Not visible'}",
        f"- Patient: {data.patientName or 'Unknown'} ({data.patientAge or 'N/A'})",
        f"- Document Readable: {'Yes' if data.documentReadable else 'No'}",
        "\nPRESCRIBED MEDICINES:"
    ]

    if data.medicines:
        for i, med in enumerate(data.medicines, start=1):
            uncertain_str = ", ".join(med.uncertainFields) if med.uncertainFields else "None"
            lines.append(
                f"{i}. {med.name or '[Unclear Medicine Name]'}\n"
                f"   - Strength: {med.strength or '[Not specified]'}\n"
                f"   - Dosage: {med.dosage or '[Not specified]'}\n"
                f"   - Frequency: {med.frequency or '[Unclear]'} ({med.frequencyDecoded or 'N/A'})\n"
                f"   - Timing: {med.timing or '[Not specified]'}\n"
                f"   - Duration: {med.duration or '[Not specified]'}\n"
                f"   - Instructions: {med.instructions or 'None'}\n"
                f"   - Uncertain Fields: {uncertain_str}"
            )
    else:
        lines.append("No legible medications found.")

    if data.otherInstructions:
        lines.append("\nDOCTOR'S GENERAL INSTRUCTIONS:")
        for inst in data.otherInstructions:
            lines.append(f"- {inst}")

    if data.unclearText:
        lines.append("\nUNCLEAR / ILLEGIBLE HANDWRITING:")
        for un in data.unclearText:
            lines.append(f"- {un}")

    return "\n".join(lines)


async def answer_prescription_question(
    message: str,
    prescription_data: PrescriptionAnalysis,
    history: List[ChatMessage] = None
) -> str:
    """
    Handles contextual Q&A strictly grounded in the extracted prescription data.
    """
    if not message or not message.strip():
        raise ValueError("A valid question string is required.")

    if not has_groq_key():
        # Contextual demo replies
        q_lower = message.lower()
        if any(w in q_lower for w in ["timing", "khana", "food", "before", "after"]):
            return "Based on your prescription, Pan-D is to be taken before breakfast (AC), while Augmentin and Dolo are prescribed after meals (PC). Montair-LC should be taken at bedtime (HS)."
        if any(w in q_lower for w in ["fever", "pain", "dolo"]):
            return "Dolo 650mg is prescribed on an 'SOS' basis (as needed) for fever or body ache. Maintain at least a 6-hour gap between doses. Do not exceed 3 tablets in 24 hours."
        if any(w in q_lower for w in ["dose", "2 tablet", "change", "increase"]):
            return "I cannot advise any change in dosage. Please take only the exact dose prescribed by your doctor or consult your pharmacist."
        return f"[Demo Mode] Based on the prescription from {prescription_data.doctorName or 'your doctor'}, you have {len(prescription_data.medicines)} prescribed medications. Please verify any specific queries with your pharmacist."

    chat_model = get_chat_model()
    if not chat_model:
        raise ValueError("Groq chat model could not be initialized.")

    prescription_context = format_prescription_context(prescription_data)

    messages = [
        SystemMessage(content=f"{PRESCRIPTION_CHAT_SYSTEM_PROMPT}\n\nCURRENT PRESCRIPTION CONTEXT:\n{prescription_context}")
    ]

    # Append recent conversation history
    if history:
        for msg in history[-6:]:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                messages.append(AIMessage(content=msg.content))

    messages.append(HumanMessage(content=message))

    try:
        response = await chat_model.ainvoke(messages)
        return response.content if isinstance(response.content, str) else str(response.content)
    except Exception as exc:
        logger.error(f"[MediRead AI] Chat error: {exc}")
        raise
