const { ZodError } = require("zod");

// 공통 에러 응답 생성 함수
const buildErrorResponse = (message, errors) => ({
  success: false,
  error: {
    type: "VALIDATION_ERROR",
    message,
    details: errors,
  },
});

// ----------------------
// Body Validation
// ----------------------
exports.validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json(buildErrorResponse("입력값이 올바르지 않습니다.", err.errors));
      }
      next(err);
    }
  };
};

// ----------------------
// Params Validation
// ----------------------
exports.validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json(buildErrorResponse("URL 파라미터가 올바르지 않습니다.", err.errors));
      }
      next(err);
    }
  };
};

// ----------------------
// Query Validation
// ----------------------
exports.validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res
          .status(400)
          .json(buildErrorResponse("QueryString 값이 올바르지 않습니다.", err.errors));
      }
      next(err);
    }
  };
};
