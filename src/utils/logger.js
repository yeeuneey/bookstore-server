const stringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (_err) {
    return String(value);
  }
};

const baseLog = (level, message, meta = {}) => {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (meta?.error instanceof Error) {
    payload.errorName = meta.error.name;
    payload.errorMessage = meta.error.message;
    payload.stack = meta.error.stack;
  }

  // Avoid circular structures in meta
  const safePayload = stringify(payload);
  const printer = level === "error" ? console.error : console.log;
  printer(safePayload);
};

const info = (message, meta) => baseLog("info", message, meta);
const warn = (message, meta) => baseLog("warn", message, meta);
const error = (message, meta) => baseLog("error", message, meta);

const child = (baseMeta = {}) => ({
  info: (message, meta) => info(message, { ...baseMeta, ...meta }),
  warn: (message, meta) => warn(message, { ...baseMeta, ...meta }),
  error: (message, meta) => error(message, { ...baseMeta, ...meta }),
});

module.exports = { info, warn, error, child };
