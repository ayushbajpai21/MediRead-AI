import base64
import json
import logging
import io
import re
from datetime import datetime
from PIL import Image, ImageEnhance

from langchain_core.messages import HumanMessage, SystemMessage
from groq_client import get_vision_model, has_groq_key
from prompts import PRESCRIPTION_VISION_SYSTEM_PROMPT, PRESCRIPTION_VISION_USER_PROMPT
from schemas import PrescriptionAnalysis, Medicine
from shorthands import decode_shorthand

logger = logging.getLogger("mediread.ai")


def preprocess_prescription_image(image_bytes: bytes) -> bytes:
    """
    Applies image enhancement (converting RGBA to RGB, contrast + sharpness boost)
    to make faded doctor handwriting and faint ink significantly easier to read.
    """
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            # Handle RGBA/transparent PNGs properly
            if img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "RGBA":
                    background.paste(img, mask=img.split()[3])
                else:
                    background.paste(img.convert("RGB"))
                img = background
            elif img.mode != "RGB":
                img = img.convert("RGB")

            # Boost contrast slightly to make blue/black ink stand out from paper
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.25)

            # Boost sharpness to define cursive stroke edges
            sharpness_enhancer = ImageEnhance.Sharpness(img)
            img = sharpness_enhancer.enhance(1.3)

            # Save back to high quality JPEG
            output_buffer = io.BytesIO()
            img.save(output_buffer, format="JPEG", quality=95)
            return output_buffer.getvalue()
    except Exception as e:
        logger.warning(f"[MediRead AI] Preprocessing fallback: {e}")
        return image_bytes


def get_mock_prescription_data() -> PrescriptionAnalysis:
    """Fallback clinical mock used only when GROQ_API_KEY is completely missing."""
    return PrescriptionAnalysis(
        documentReadable=True,
        isPrescription=True,
        doctorName="Dr. Arvind Mehta (MD, Medicine)",
        clinicOrHospital="Apollo City Clinic, OPD Block B",
        date=datetime.now().strftime("%d/%m/%Y"),
        patientName="Patient Record #MR-8041",
        patientAge="42 Y / Male",
        diagnosisOrSymptoms=[
            "Acute Pharyngitis & Low-grade Fever (URTI)",
            "Mild Bronchospasm"
        ],
        medicines=[
            Medicine(
                name="Augmentin (Amoxicillin + Clavulanate)",
                strength="625 mg",
                dosage="1 tablet",
                frequency="BD",
                frequencyDecoded="Twice daily (दिन में 2 बार - सुबह और रात)",
                timing="After meals (खाने के बाद)",
                duration="5 days",
                purpose="Antibacterial medication for throat & respiratory infection",
                instructions="Complete the full 5-day course even if feeling better.",
                uncertainFields=[]
            ),
            Medicine(
                name="Dolo (Paracetamol)",
                strength="650 mg",
                dosage="1 tablet",
                frequency="SOS",
                frequencyDecoded="As needed (ज़रूरत पड़ने पर - तेज़ बुखार या बदन दर्द में)",
                timing="After food",
                duration="3 days (only when required)",
                purpose="Antipyretic & analgesic for fever and pain relief",
                instructions="Maintain at least 6 hours gap between doses. Max 3 tablets/day.",
                uncertainFields=[]
            )
        ],
        otherInstructions=[
            "Warm saline gargles 3 times daily for soothing the throat.",
            "Stay well hydrated: consume 2.5-3 liters of warm water daily."
        ],
        unclearText=[],
        needsHumanVerification=True,
        summaryNote="Standard outpatient prescription preview.",
        isMock=True,
        mockNotice="DEMO PREVIEW: Set your GROQ_API_KEY in ai/.env for live Groq vision transcription."
    )


async def analyze_prescription_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> PrescriptionAnalysis:
    """
    Analyzes prescription image bytes using Groq Vision model and LangChain.
    """
    if not has_groq_key():
        logger.warning("[MediRead AI] No GROQ_API_KEY found. Serving clinical demo structure.")
        return get_mock_prescription_data()

    vision_model = get_vision_model()
    if not vision_model:
        raise ValueError("Groq vision model could not be initialized.")

    # Enhance contrast and stroke edges before sending to Vision model
    processed_bytes = preprocess_prescription_image(image_bytes)

    base64_encoded = base64.b64encode(processed_bytes).decode("utf-8")
    data_url = f"data:image/jpeg;base64,{base64_encoded}"

    messages = [
        SystemMessage(content=PRESCRIPTION_VISION_SYSTEM_PROMPT),
        HumanMessage(
            content=[
                {"type": "text", "text": PRESCRIPTION_VISION_USER_PROMPT},
                {"type": "image_url", "image_url": {"url": data_url}}
            ]
        )
    ]

    try:
        response = await vision_model.ainvoke(messages)
        raw_text = response.content if isinstance(response.content, str) else json.dumps(response.content)

        # Robust JSON extraction
        clean_json = raw_text.strip()
        if "```json" in clean_json:
            clean_json = clean_json.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_json:
            clean_json = clean_json.split("```")[1].split("```")[0].strip()

        # Find first { and last }
        first_brace = clean_json.find("{")
        last_brace = clean_json.rfind("}")
        if first_brace != -1 and last_brace != -1:
            clean_json = clean_json[first_brace:last_brace + 1]

        parsed_dict = json.loads(clean_json)

        # Decode shorthands
        if "medicines" in parsed_dict and isinstance(parsed_dict["medicines"], list):
            for med in parsed_dict["medicines"]:
                freq = med.get("frequency") or med.get("dosage") or ""
                if not med.get("frequencyDecoded") and freq:
                    decoded = decode_shorthand(freq)
                    if decoded:
                        med["frequencyDecoded"] = f"{decoded['meaning']} ({decoded['hindi']})"

        # Ensure summaryNote exists
        if not parsed_dict.get("summaryNote"):
            doc = parsed_dict.get("doctorName") or "doctor"
            cnt = len(parsed_dict.get("medicines") or [])
            parsed_dict["summaryNote"] = f"Prescription by {doc} with {cnt} identified medications."

        validated = PrescriptionAnalysis(**parsed_dict)
        return validated
    except Exception as exc:
        logger.error(f"[MediRead AI] Vision analysis error: {exc}")
        # If model failed or gave malformed output, don't crash
        raise
