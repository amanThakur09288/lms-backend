const logger = require("../config/logger");
const AppError = require("../utils/AppError");

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    logger.warn(`${req.method} ${req.originalUrl} — ${err.message}`);
    return res.status(err.statusCode).json({ success: false, error: err.message });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      error: `A record with this ${err.meta?.target?.[0] || "value"} already exists`,
    });
  }

  logger.error(`Unexpected error on ${req.method} ${req.originalUrl}: ${err.stack}`);
  return res.status(500).json({ success: false, error: "Something went wrong. Please try again later." });
}

module.exports = errorHandler;