import { Router } from "express";
import { analyzePrescription, chatPrescription, getHealth } from "../controllers/prescriptionController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = Router();

// Health check
router.get("/health", getHealth);

// Upload and analyze prescription image
router.post("/prescriptions/analyze", upload.single("prescription"), analyzePrescription);

// Contextual Q&A chat
router.post("/prescriptions/chat", chatPrescription);

export default router;
