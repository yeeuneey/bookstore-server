require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "인증 토큰이 없습니다." });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "access_token_expired" });
    }
    return res.status(401).json({ message: "invalid_token" });
  }
};