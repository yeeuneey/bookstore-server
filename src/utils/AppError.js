// src/utils/AppError.js
class AppError extends Error {
  constructor(message, status = 400, code = "BAD_REQUEST", details = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

module.exports = AppError;
