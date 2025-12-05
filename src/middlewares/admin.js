const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

exports.adminOnly = (req, _res, next) => {
  if (req.user.role !== "ADMIN") {
    return next(
      new AppError(
        "관리자 권한이 필요합니다.",
        403,
        ERROR_CODES.FORBIDDEN
      )
    );
  }
  next();
};

