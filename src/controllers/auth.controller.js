require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const getAccessSecret = () =>
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const getRefreshSecret = () =>
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError("존재하지 않는 이메일입니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppError("비밀번호가 올바르지 않습니다.", 401, ERROR_CODES.UNAUTHORIZED);
    }

    const ACCESS_SECRET = getAccessSecret();
    const REFRESH_SECRET = getRefreshSecret();
    if (!ACCESS_SECRET || !REFRESH_SECRET) {
      throw new AppError(
        "JWT 시크릿이 설정되지 않았습니다.",
        500,
        ERROR_CODES.UNKNOWN_ERROR
      );
    }

    const role = user.Role ?? user.role ?? "USER";
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role,
      },
      ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "로그인에 성공했습니다.",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    req.log?.error("Login Error:", { error: err });
    return next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const REFRESH_SECRET = getRefreshSecret();
    if (!REFRESH_SECRET) {
      throw new AppError(
        "JWT 리프레시 시크릿이 설정되지 않았습니다.",
        500,
        ERROR_CODES.UNKNOWN_ERROR
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (err) {
      const code =
        err.name === "TokenExpiredError"
          ? ERROR_CODES.TOKEN_EXPIRED
          : ERROR_CODES.UNAUTHORIZED;
      const message =
        err.name === "TokenExpiredError"
          ? "Refresh Token이 만료되었습니다."
          : "유효하지 않은 Refresh Token입니다.";
      throw new AppError(message, 401, code);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError("토큰이 유효하지 않습니다.", 403, ERROR_CODES.FORBIDDEN);
    }

    const ACCESS_SECRET = getAccessSecret();
    if (!ACCESS_SECRET) {
      throw new AppError(
        "JWT 액세스 시크릿이 설정되지 않았습니다.",
        500,
        ERROR_CODES.UNKNOWN_ERROR
      );
    }

    const role = user.Role ?? user.role ?? "USER";
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role,
      },
      ACCESS_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      message: "토큰 재발급에 성공했습니다.",
      accessToken: newAccessToken,
    });
  } catch (err) {
    req.log?.error("Refresh Error:", { error: err });
    return next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { userId } = req.body;

    await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    return res.json({ message: "로그아웃 완료" });
  } catch (err) {
    return next(err);
  }
};
