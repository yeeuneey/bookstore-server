require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(
        "존재하지 않는 이메일입니다.",
        404,
        ERROR_CODES.NOT_FOUND
      );
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppError(
        "비밀번호가 올바르지 않습니다.",
        401,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Refresh Token DB 저장
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return res.json({
      message: "로그인에 성공했습니다.",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    req.log.error("Login Error:", { error: err });
    return next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
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

    // DB에 저장된 refreshToken과 동일한지 확인
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError("토큰이 일치하지 않습니다.", 403, ERROR_CODES.FORBIDDEN);
    }

    // 새로운 Access Token 발급
    const newAccessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({
      message: "토큰 재발급에 성공했습니다.",
      accessToken: newAccessToken,
    });
  } catch (err) {
    req.log.error("Refresh Error:", { error: err });
    return next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { userId } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return res.json({ message: "로그아웃 완료" });
  } catch (err) {
    return next(err);
  }
};

