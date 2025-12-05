// src/middlewares/errorHandler.js
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

module.exports = (err, _req, res, _next) => {
  console.error("Global Error:", err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        status: err.status,
        details: err.details || undefined,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: err.message || "서버 내부 오류가 발생했습니다.",
      status: 500,
    },
  });
};

