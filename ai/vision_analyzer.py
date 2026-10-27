import base64
import json
import logging
import io
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
    Applies image enhancement (contrast + sharpness boost)
    to make faded doctor handwriting and faint ink significantly easier to read.
    """
    try:
        with Image.open(io.BytesIO(image_bytes)) as img:
            # Convert to RGB if needed
            if img.mode != "RGB":
                img = img.convert("RGB")

            # Boost contrast slightly to make blue/black ink stand out from paper
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.35)

            # Boost sharpness to define cursive stroke edges
            sharpness_enhancer = ImageEnhance.Sharpness(img)
            img = sharpness_enhancer.enhance(1.4)

            # Save back to high quality JPEG
            output_buffer = io.BytesIO()
            img.save(output_buffer, format="JPEG", quality=95)
            return output_buffer.getvalue()
    except Exception as e:
        logger.warning(f"[MediRead AI] Preprocessing fallback: {e}")
        return image_bytes


def get_mock_prescription_data() -> PrescriptionAnalysis:
    """Fallback clinical mock used when GROQ_API_KEY is not configured."""
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
            ),
            Medicine(
                name="Pan-D (Pantoprazole + Domperidone)",
                strength="40 mg / 30 mg",
                dosage="1 capsule",
                frequency="OD",
                frequencyDecoded="Once daily (दिन में 1 बार - सुबह खाली पेट)",
                timing="Before breakfast (AC - नाश्ते से 30 मिनट पहले)",
                duration="5 days",
                purpose="Gastric acid reducer to prevent stomach irritation",
                instructions="Take with half glass of plain water.",
                uncertainFields=[]
            ),
            Medicine(
                name="Montair-LC (Montelukast + Levocetirizine)",
                strength=None,
                dosage="1 tablet",
                frequency="HS",
                frequencyDecoded="At bedtime (रात को सोने से पहले)",
                timing="Night time (सोने से पहले)",
                duration="7 days",
                purpose="Antiallergic for cough & runny nose",
                instructions="May cause mild drowsiness. Avoid driving late night.",
                uncertainFields=["strength"]
            )
        ],
        otherInstructions=[
            "Warm saline gargles 3 times daily for soothing the throat.",
            "Stay well hydrated: consume 2.5-3 liters of warm water daily.",
            "Follow-up in OPD after 5 days if fever persists."
        ],
        unclearText=[
            "Doctor signature and lower registration seal partially faint."
        ],
        needsHumanVerification=True,
        summaryNote="Standard outpatient prescription for acute pharyngitis and fever. Decoded 4 medications with dosages and precautions.",
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

        clean_json = raw_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        elif clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
        clean_json = clean_json.strip()

        parsed_dict = json.loads(clean_json)

        if "medicines" in parsed_dict and isinstance(parsed_dict["medicines"], list):
            for med in parsed_dict["medicines"]:
                if med.get("frequency") and not med.get("frequencyDecoded"):
                    decoded = decode_shorthand(med["frequency"])
                    if decoded:
                        med["frequencyDecoded"] = f"{decoded['meaning']} ({decoded['hindi']})"

        validated = PrescriptionAnalysis(**parsed_dict)
        return validated
    except Exception as exc:
        logger.error(f"[MediRead AI] Vision analysis error: {exc}")
        raise
