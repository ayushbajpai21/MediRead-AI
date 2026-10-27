/**
 * Centralized safe error handling middleware.
 * Prevents leaking server internal stack traces or API keys to the client.
 */
export function errorHandler(err, req, res, next) {
  console.error(`[Server Error] ${req.method} ${req.url}:`, err.message);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "The uploaded file exceeds the 5 MB size limit. Please upload a smaller image."
    });
  }

  if (err.message && err.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(422).json({
      success: false,
      error: "Invalid request data format.",
      details: err.errors ? err.errors.map(e => ({ path: e.path.join("."), message: e.message })) : []
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  const userSafeMessage = statusCode === 500
    ? "An error occurred while processing your prescription. Please ensure the image is clear and try again."
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: userSafeMessage
  });
}
