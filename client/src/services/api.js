import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000, // 45 seconds for vision analysis
  headers: {
    Accept: "application/json"
  }
});

/**
 * Health check endpoint
 */
export async function checkHealth() {
  const response = await apiClient.get("/health");
  return response.data;
}

/**
 * Upload and analyze prescription image
 */
export async function analyzePrescription(file) {
  const formData = new FormData();
  formData.append("prescription", file);

  const response = await apiClient.post("/prescriptions/analyze", formData, {
    headers: {
      // Let the browser automatically set the correct multipart boundary
      "Content-Type": undefined
    }
  });

  return response.data;
}

/**
 * Ask a contextual question about the extracted prescription
 */
export async function sendChatMessage(message, prescriptionData, history = []) {
  const response = await apiClient.post("/prescriptions/chat", {
    message,
    prescriptionData,
    history
  });

  return response.data;
}
