require("dotenv").config();
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

exports.authMiddleware = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(
      new AppError(
        "인증 토큰이 필요합니다.",
        401,
        ERROR_CODES.UNAUTHORIZED
      )
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(
        new AppError(
          "Access Token이 만료되었습니다.",
          401,
          ERROR_CODES.TOKEN_EXPIRED
        )
      );
    }
    return next(
      new AppError("유효하지 않은 토큰입니다.", 401, ERROR_CODES.UNAUTHORIZED)
    );
  }
};
