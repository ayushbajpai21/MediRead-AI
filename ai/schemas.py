from typing import List, Optional
from pydantic import BaseModel, Field


class Medicine(BaseModel):
    name: Optional[str] = Field(None, description="Brand or generic medicine name. Set to None if illegible.")
    strength: Optional[str] = Field(None, description="Strength (e.g., 500mg, 10ml, 250mcg). None if not found.")
    dosage: Optional[str] = Field(None, description="Quantity/form per dose (e.g., 1 tablet, 2 puffs, 1 tsp).")
    frequency: Optional[str] = Field(None, description="Medical code e.g. OD, BD, TDS, SOS, 1-0-1. None if unclear.")
    frequencyDecoded: Optional[str] = Field(None, description="Plain English translation of frequency (e.g. 'Three times a day').")
    timing: Optional[str] = Field(None, description="Timing relative to food (e.g. 'After meals', 'Before food').")
    duration: Optional[str] = Field(None, description="Treatment duration (e.g. '5 days', '2 weeks').")
    purpose: Optional[str] = Field(None, description="High-level general therapeutic category or reason (e.g., 'Antibiotic').")
    instructions: Optional[str] = Field(None, description="Any specific doctor note (e.g. 'Take with warm water').")
    uncertainFields: List[str] = Field(default_factory=list, description="List of field names that are handwritten ambiguously.")


class PrescriptionAnalysis(BaseModel):
    documentReadable: bool = Field(True, description="Whether the image contains readable medical or prescription text.")
    isPrescription: bool = Field(True, description="True if document appears to be a doctor prescription or clinical note.")
    doctorName: Optional[str] = Field(None, description="Doctor's name if printed or legible.")
    clinicOrHospital: Optional[str] = Field(None, description="Clinic, hospital, or practice name if present.")
    date: Optional[str] = Field(None, description="Date of prescription if visible (e.g., '14/10/2024').")
    patientName: Optional[str] = Field(None, description="Patient name if clearly visible.")
    patientAge: Optional[str] = Field(None, description="Patient age or sex if visible (e.g., '34 M').")
    medicines: List[Medicine] = Field(default_factory=list, description="List of transcribed medicines.")
    diagnosisOrSymptoms: List[str] = Field(default_factory=list, description="Diagnosis or symptoms mentioned by doctor.")
    otherInstructions: List[str] = Field(default_factory=list, description="Lifestyle, dietary, or follow-up instructions.")
    unclearText: List[str] = Field(default_factory=list, description="Segments of handwriting that are too faded or cursive.")
    needsHumanVerification: bool = Field(True, description="Always true for medical safety unless printed and verified.")
    summaryNote: str = Field(..., description="A concise 1-2 sentence overview of the transcribed prescription.")
    isMock: Optional[bool] = False
    mockNotice: Optional[str] = None


class ChatMessage(BaseModel):
    role: str = Field(..., description="user, assistant, or system")
    content: str


class ChatRequest(BaseModel):
    message: str
    prescriptionData: PrescriptionAnalysis
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    success: bool = True
    reply: str
