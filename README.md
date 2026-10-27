# MediRead AI 🩺
### *Understand your doctor's handwritten prescription, clearly and safely.*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangChain](https://img.shields.io/badge/LangChain-Python-1C3C3C?style=flat-square)](https://langchain.com)
[![Groq LPU](https://img.shields.io/badge/Groq-LPU_Inference-F55036?style=flat-square)](https://groq.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)

---

## 💡 Why I Built This

Doctors' handwriting has been a universal problem for decades. Almost everyone has stood at a pharmacy counter or sat at home trying to decipher cursive doctor scribbles—wondering if a pill is supposed to be taken before breakfast, twice a day, or only when you have a fever.

**MediRead AI** was built to solve this everyday frustration using vision LLMs running on Groq's ultra-fast LPU chips. Instead of guessing, the app extracts the handwriting, decodes confusing Latin medical abbreviations (*OD*, *BD*, *TDS*, *SOS*, *AC*, *PC*), and presents a clean, patient-friendly schedule.

> **Crucial Rule:** MediRead AI is an **accessibility and transcription assistant**, NOT a diagnostic tool. If handwriting is illegible, the model strictly marks it as *"Unclear — verification required"* instead of hallucinating dangerous drug dosages.

---

## ✨ Features That Actually Help Patients

- **⚡ Blazing Fast Vision OCR (Groq LPUs):** Analyzes prescription photos in seconds using open multimodal models (`llama-3.2-11b-vision-preview`).
- **📖 Doctor Shorthand Decoder (English + Hindi):**
  - `OD` $\rightarrow$ Once daily *(दिन में 1 बार)*
  - `BD / BID` $\rightarrow$ Twice daily *(दिन में 2 बार - सुबह और रात)*
  - `TDS / TID` $\rightarrow$ Three times a day *(दिन में 3 बार)*
  - `SOS` $\rightarrow$ As needed in emergency/fever *(ज़रूरत पड़ने पर)*
  - `AC / PC` $\rightarrow$ Before meals / After meals *(खाने से पहले / खाने के बाद)*
  - `HS` $\rightarrow$ At bedtime *(रात को सोने से पहले)*
- **⚠️ Zero-Hallucination Uncertainty Badges:** Any faded, ambiguous, or scribbled medicine name or dosage is flagged in distinct amber badges requiring human verification.
- **🔊 Audio Readout (Text-to-Speech):** A built-in "Listen" button reads the prescription aloud for elderly patients or anyone with vision difficulties.
- **📅 1-Click Medication Schedule (.ics):** Generates an `.ics` calendar file with medication alarm reminders for Apple Calendar, Google Calendar, or phone alarms.
- **🔍 Side-by-Side Zoom & Pan Viewer:** Inspect the original handwritten slip right next to the transcribed medication cards.
- **💬 Contextual Consultation Chat:** Ask questions like *"Which medicine is for fever?"* or *"When should I take Pan-D?"* grounded strictly in the prescription context. Refuses any dangerous dosage modifications.

---

## 🏗️ Architecture

The project is structured as a clean polyglot microservice:

```
mediread-ai/
├── ai/                          # Python AI Engine (FastAPI + LangChain + Groq)
│   ├── main.py                  # API server on port 8000 (Swagger docs at /docs)
│   ├── groq_client.py           # ChatGroq model configurations
│   ├── vision_analyzer.py       # Base64 image multimodal pipeline & fallback
│   ├── chat_assistant.py        # Contextual chat engine
│   ├── schemas.py               # Pydantic V2 models for structured output
│   ├── shorthands.py            # Medical abbreviation dictionary & decoders
│   ├── prompts.py               # Strict clinical transcription prompts
│   ├── test_ai.py               # Automated Python test runner
│   └── requirements.txt
├── server/                      # Node.js API Gateway (Express on port 5000)
│   ├── src/
│   │   ├── controllers/         # Proxies requests to Python AI
│   │   ├── middleware/          # Multer (RAM memory only) & magic byte validation
│   │   └── server.js            # Express server
│   └── test-api.js              # Integration test runner
├── client/                      # React UI (Vite + Tailwind on port 5173)
│   ├── src/
│   │   ├── components/          # Custom MR hospital logo, audio player, cards, chat
│   │   ├── utils/               # .ICS calendar generator
│   │   └── App.jsx              # Responsive split screen interface
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+ (Tested on 3.14)
- Node.js 18+ (Tested on v24)
- A free Groq Cloud API Key from [console.groq.com](https://console.groq.com/keys)

---

### 2. Start the Python AI Engine (Port 8000)
```bash
cd ai
pip install -r requirements.txt
python main.py
```
*Interactive Swagger documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).*

> **Tip:** Add your Groq API key in `ai/.env`:
> ```env
> GROQ_API_KEY=gsk_your_key_here
> GROQ_VISION_MODEL=llama-3.2-11b-vision-preview
> GROQ_CHAT_MODEL=llama-3.3-70b-versatile
> ```
> *(Even without an API key, the service starts in a safe Clinical Demo Mode for testing).*

---

### 3. Start the Express Gateway (Port 5000)
In a second terminal:
```bash
cd server
npm install
npm run dev
```

---

### 4. Start the React Frontend (Port 5173)
In a third terminal:
```bash
cd client
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🔒 Privacy & Safety First

- **RAM-Only Processing:** Prescription images are processed strictly in memory using Multer memory storage. No patient documents are saved to disk or permanent databases.
- **Binary Image Signature Check:** The gateway validates magic bytes (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG) to prevent malicious file uploads.
- **Strict Clinical Boundaries:** The system prompt explicitly instructs the LLM never to guess, never to alter prescribed dosages, and to decline clinical diagnosis.

---

## 🧪 Testing

Run automated tests across both layers:

```bash
# Python AI Tests (Vision, Shorthands, Chat)
cd ai
python test_ai.py

# Express Gateway Tests (Health, Magic Bytes, Upload Validation)
cd server
npm test
```

---

## ⚖️ Medical Disclaimer
MediRead AI is designed solely for reading assistance and accessibility. It does **not** provide medical diagnosis or replace consultation with licensed healthcare professionals. Always verify all medicine names, strengths, and dosage schedules with a registered pharmacist or your prescribing physician before taking any medication.

---

Made with ❤️ by [Ayush Bajpai](https://github.com/ayushbajpai21)
