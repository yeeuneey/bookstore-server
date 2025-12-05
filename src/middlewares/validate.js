const { ZodError } = require("zod");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

// ----------------------
// Body Validation
// ----------------------
exports.validateBody = (schema) => {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new AppError(
            "입력값이 올바르지 않습니다.",
            400,
            ERROR_CODES.VALIDATION_FAILED,
            err.errors
          )
        );
      }
      next(err);
    }
  };
};

// ----------------------
// Params Validation
// ----------------------
exports.validateParams = (schema) => {
  return (req, _res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new AppError(
            "URL 파라미터가 올바르지 않습니다.",
            400,
            ERROR_CODES.INVALID_QUERY_PARAM,
            err.errors
          )
        );
      }
      next(err);
    }
  };
};

// ----------------------
// Query Validation
// ----------------------
exports.validateQuery = (schema) => {
  return (req, _res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next(
          new AppError(
            "QueryString 값이 올바르지 않습니다.",
            400,
            ERROR_CODES.INVALID_QUERY_PARAM,
            err.errors
          )
        );
      }
      next(err);
    }
  };
};
