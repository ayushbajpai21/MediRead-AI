import { validateImageSignature } from "../middleware/uploadMiddleware.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

/**
 * Health check endpoint
 */
export async function getHealth(req, res) {
  let aiServiceStatus = "unknown";
  try {
    const aiHealth = await fetch(`${AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    if (aiHealth.ok) {
      aiServiceStatus = "connected";
    }
  } catch {
    aiServiceStatus = "disconnected (start with 'cd ai && python main.py')";
  }

  res.status(200).json({
    status: "ok",
    provider: "groq",
    service: "MediRead AI Express Gateway",
    pythonAiService: aiServiceStatus,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handles prescription image upload and delegates to Python AI microservice
 */
export async function analyzePrescription(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No prescription image was uploaded. Please provide an image file with key 'prescription'."
      });
    }

    // Verify binary signature (magic bytes)
    const isValidSignature = validateImageSignature(req.file.buffer);
    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        error: "The uploaded file does not match a valid image signature (JPEG, PNG, or WEBP)."
      });
    }

    // Prepare multipart payload for Python AI service
    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    formData.append("prescription", blob, req.file.originalname || "prescription.jpg");

    try {
      const response = await fetch(`${AI_SERVICE_URL}/analyze`, {
        method: "POST",
        body: formData,
        signal: AbortSignal.timeout(60000) // 60 seconds
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Python AI service responded with ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      return res.status(200).json({
        success: true,
        data,
        disclaimer: "AI transcription may be inaccurate. Always verify all medicine names, strengths, and dosages with a licensed doctor or pharmacist before consumption."
      });
    } catch (aiErr) {
      if (aiErr.cause?.code === "ECONNREFUSED" || aiErr.message?.includes("fetch failed")) {
        return res.status(503).json({
          success: false,
          error: "Python AI microservice is not running. Please start it using: 'cd ai && python main.py'."
        });
      }
      throw aiErr;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Handles interactive contextual chat via Python AI microservice
 */
export async function chatPrescription(req, res, next) {
  try {
    const { message, prescriptionData, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "A valid message string is required."
      });
    }

    if (!prescriptionData) {
      return res.status(400).json({
        success: false,
        error: "prescriptionData is required for contextual Q&A."
      });
    }

    try {
      const response = await fetch(`${AI_SERVICE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, prescriptionData, history: history || [] }),
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Python AI service responded with ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return res.status(200).json(result);
    } catch (aiErr) {
      if (aiErr.cause?.code === "ECONNREFUSED" || aiErr.message?.includes("fetch failed")) {
        return res.status(503).json({
          success: false,
          error: "Python AI microservice is not running. Please start it using: 'cd ai && python main.py'."
        });
      }
      throw aiErr;
    }
  } catch (error) {
    next(error);
  }
}
