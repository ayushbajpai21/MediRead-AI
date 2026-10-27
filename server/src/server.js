import dotenv from "dotenv";
import { createApp } from "./app.js";

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[MediRead AI Server] Listening on http://localhost:${PORT}`);
  console.log(`[MediRead AI Server] Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`[MediRead AI Server] Frontend Origin: ${process.env.FRONTEND_ORIGIN || "http://localhost:5173"}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn("[MediRead AI Server] WARNING: GROQ_API_KEY is not set. Server is running in safe clinical demo mode.");
  } else {
    console.log("[MediRead AI Server] GROQ_API_KEY detected. Live vision & chat models active.");
  }
});
