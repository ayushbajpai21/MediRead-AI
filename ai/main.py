import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from schemas import PrescriptionAnalysis, ChatRequest, ChatResponse
from vision_analyzer import analyze_prescription_image
from chat_assistant import answer_prescription_question

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("mediread.ai")

app = FastAPI(
    title="MediRead AI Microservice",
    description="Python LangChain + Groq Vision & Clinical Transcription Service",
    version="1.0.0"
)

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "MediRead AI Python Service",
        "provider": "groq",
        "framework": "LangChain Python"
    }


@app.post("/analyze", response_model=PrescriptionAnalysis)
async def analyze_prescription(prescription: UploadFile = File(...)):
    if not prescription:
        raise HTTPException(status_code=400, detail="No prescription file uploaded.")

    content_type = prescription.content_type or "image/jpeg"
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Please upload JPG, PNG, or WEBP."
        )

    try:
        image_bytes = await prescription.read()
        if len(image_bytes) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds 5MB limit.")

        result = await analyze_prescription_image(image_bytes, content_type)
        return result
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error in /analyze endpoint: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/chat", response_model=ChatResponse)
async def chat_prescription(request: ChatRequest):
    try:
        reply = await answer_prescription_question(
            message=request.message,
            prescription_data=request.prescriptionData,
            history=request.history
        )
        return ChatResponse(success=True, reply=reply)
    except Exception as exc:
        logger.error(f"Error in /chat endpoint: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
