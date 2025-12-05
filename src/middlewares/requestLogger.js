const { randomUUID } = require("crypto");
const logger = require("../utils/logger");

const createRequestLogger = (req, requestId) => {
  return logger.child({
    requestId,
    method: req.method,
    path: req.originalUrl,
  });
};

module.exports = (req, res, next) => {
  const start = process.hrtime.bigint();
  const requestId = req.headers["x-request-id"] || randomUUID();

  req.requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  req.log = createRequestLogger(req, requestId);

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    req.log.info("http_request", {
      status: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      contentLength: res.get("content-length"),
    });
  });

  next();
};
