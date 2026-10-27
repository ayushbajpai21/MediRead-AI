"""
Doctor Prescription Shorthand Dictionary
Decodes medical Latin abbreviations into clear English & Hindi translations.
"""
import re
from typing import Optional, Dict, Any

MEDICAL_SHORTHANDS: Dict[str, Dict[str, Any]] = {
    # Frequency / Times per day
    "OD": {
        "meaning": "Once daily",
        "hindi": "दिन में 1 बार",
        "timingHint": "Har 24 ghante me ek baar",
        "scheduleHours": ["09:00"]
    },
    "QD": {
        "meaning": "Every day (Once daily)",
        "hindi": "रोज़ाना 1 बार",
        "timingHint": "Har din ek nishchit samay par",
        "scheduleHours": ["09:00"]
    },
    "BD": {
        "meaning": "Twice daily",
        "hindi": "दिन में 2 बार",
        "timingHint": "Subah aur raat (Lagbhag 12 ghante ke antar par)",
        "scheduleHours": ["09:00", "21:00"]
    },
    "BID": {
        "meaning": "Twice a day",
        "hindi": "दिन में 2 बार",
        "timingHint": "Subah aur shaam",
        "scheduleHours": ["09:00", "21:00"]
    },
    "TDS": {
        "meaning": "Three times daily",
        "hindi": "दिन में 3 बार",
        "timingHint": "Subah, dopahar aur raat (Har 8 ghante me)",
        "scheduleHours": ["08:00", "14:00", "20:00"]
    },
    "TID": {
        "meaning": "Three times a day",
        "hindi": "दिन में 3 बार",
        "timingHint": "Subah, dopahar, raat",
        "scheduleHours": ["08:00", "14:00", "20:00"]
    },
    "QID": {
        "meaning": "Four times daily",
        "hindi": "दिन में 4 बार",
        "timingHint": "Har 6 ghante me ek baar",
        "scheduleHours": ["06:00", "12:00", "18:00", "23:00"]
    },
    "SOS": {
        "meaning": "As needed / In emergency",
        "hindi": "ज़रूरत पड़ने पर (जैसे तेज़ दर्द/बुखार में)",
        "timingHint": "Sirf tab lein jab takleef ho, niyamit na lein",
        "scheduleHours": []
    },
    "PRN": {
        "meaning": "Pro re nata (As needed)",
        "hindi": "ज़रूरत के अनुसार",
        "timingHint": "Zaroorat ke anusaar",
        "scheduleHours": []
    },
    "STAT": {
        "meaning": "Immediately (Single dose)",
        "hindi": "तुरंत (केवल एक बार)",
        "timingHint": "Bina deri kiye turant lein",
        "scheduleHours": ["Immediate"]
    },

    # Timing relative to food
    "AC": {
        "meaning": "Before meals (Ante Cibum)",
        "hindi": "खाने से पहले (भूखे पेट)",
        "timingHint": "Khana khane se lagbhag 30 minute pehle"
    },
    "PC": {
        "meaning": "After meals (Post Cibum)",
        "hindi": "खाने के बाद",
        "timingHint": "Khana khane ke 15-30 minute baad"
    },
    "BBF": {
        "meaning": "Before breakfast",
        "hindi": "सुबह नाश्ते से पहले",
        "timingHint": "Subah khali pet"
    },
    "HS": {
        "meaning": "At bedtime (Hora Somni)",
        "hindi": "रात को सोने से पहले",
        "timingHint": "Sone se thik pehle"
    },
    "QAM": {
        "meaning": "Every morning",
        "hindi": "हर सुबह",
        "timingHint": "Subah ke waqt"
    },
    "QPM": {
        "meaning": "Every evening / night",
        "hindi": "हर शाम / रात",
        "timingHint": "Shaam ya raat ke waqt"
    }
}


def decode_shorthand(code: Optional[str]) -> Optional[Dict[str, Any]]:
    """
    Decodes an abbreviation string, e.g. 'TDS', '1-0-1', 'OD AC'.
    """
    if not code or not isinstance(code, str):
        return None

    clean_code = code.strip().upper()

    # Direct dictionary lookup
    if clean_code in MEDICAL_SHORTHANDS:
        return MEDICAL_SHORTHANDS[clean_code]

    # Pattern like 1-0-1 or 1-1-1
    if re.match(r"^[012]-[012]-[012]$", clean_code):
        parts = clean_code.split("-")
        m = "Morning" if int(parts[0]) > 0 else None
        a = "Afternoon" if int(parts[1]) > 0 else None
        n = "Night" if int(parts[2]) > 0 else None
        active = ", ".join(filter(None, [m, a, n]))
        return {
            "meaning": f"{clean_code} ({active})",
            "hindi": f"{clean_code} (सुबह/दोपहर/रात शेड्यूल)",
            "timingHint": f"Subah: {parts[0]}, Dopahar: {parts[1]}, Raat: {parts[2]}",
            "scheduleHours": [
                h for p, h in zip(parts, ["08:00", "14:00", "20:00"]) if int(p) > 0
            ]
        }

    return None
