require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "이메일과 비밀번호는 필수입니다." });

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(404).json({ message: "존재하지 않는 이메일입니다." });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(401).json({ message: "비밀번호가 올바르지 않습니다." });

    // Access Token
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
      message: "로그인 성공",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ message: "Refresh Token이 필요합니다." });

    // 토큰이 위조/만료인지 검증
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "유효하지 않은 Refresh Token입니다." });
    }

    // DB에 저장된 refreshToken과 동일한지 확인
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "다시 로그인해야 합니다." });
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
      message: "토큰 재발급 성공",
      accessToken: newAccessToken,
    });
  } catch (err) {
    console.error("Refresh Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

exports.logout = async (req, res) => {
  try {
    const { userId } = req.body;

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return res.json({ message: "로그아웃 완료" });
  } catch (err) {
    return res.status(500).json({ message: "서버 오류" });
  }
};
