import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // CORS configuration
  const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl) or matched origin
        if (!origin || origin === allowedOrigin || origin.startsWith("http://localhost:")) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true
    })
  );

  // Rate Limiting
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many requests from this IP. Please try again after a few minutes."
    }
  });
  app.use(globalLimiter);

  // JSON Body Parser
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // API Routes
  app.use("/api", prescriptionRoutes);

  // Fallback 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Endpoint ${req.method} ${req.originalUrl} not found.`
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
