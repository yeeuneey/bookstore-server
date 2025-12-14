// src/middlewares/rateLimiter.js
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000); // 기본 1분
const max = Number(process.env.RATE_LIMIT_MAX || 100); // 기본 1분당 100회

// 간단한 메모리 기반 슬라이딩 윈도우 방식 (IP 기준)
const hits = new Map();

module.exports = (req, res, next) => {
  const now = Date.now();
  const key = req.ip || req.connection.remoteAddress || "unknown";
  const entry = hits.get(key) || { count: 0, expires: now + windowMs };

  // 윈도우 만료 시 초기화
  if (now > entry.expires) {
    entry.count = 0;
    entry.expires = now + windowMs;
  }

  entry.count += 1;
  hits.set(key, entry);

  const remaining = Math.max(0, max - entry.count);
  const retryAfterSec = Math.max(0, Math.ceil((entry.expires - now) / 1000));

  res.setHeader("X-RateLimit-Limit", String(max));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.expires / 1000)));

  if (entry.count > max) {
    res.setHeader("Retry-After", String(retryAfterSec));
    return next(
      new AppError("요청 한도를 초과했습니다.", 429, ERROR_CODES.TOO_MANY_REQUESTS)
    );
  }

  return next();
};
