// src/middlewares/errorHandler.js
const AppError = require("../utils/AppError");

module.exports = (err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  // Zod 에러는 validate.js에서 이미 처리됨
  // 여기서는 비즈니스 에러 처리 중심

  // AppError 처리
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        status: err.status,
      },
    });
  }

  // 예기치 못한 에러
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "서버 내부 오류가 발생했습니다.",
      status: 500,
    },
  });
};
