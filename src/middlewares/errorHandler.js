// src/middlewares/errorHandler.js
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");
const logger = require("../utils/logger");

module.exports = (err, req, res, _next) => {
  const isAppError = err instanceof AppError;
  const status = isAppError ? err.status : 500;
  const code = isAppError ? err.code : ERROR_CODES.INTERNAL_SERVER_ERROR;
  const message = err.message || "서버 오류가 발생했습니다.";

  logger.error("request_error", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    message,
    details: err.details,
    error: err,
  });

  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      status,
      details: err.details || undefined,
    },
  });
};
