// src/lib/cache.js
// Lightweight in-memory cache with TTL support. Designed to be easily swappable
// with Redis later while keeping controllers async-friendly.
const logger = require("../utils/logger");

const enabled = process.env.CACHE_ENABLED !== "false";
const defaultTtlSeconds = Number(process.env.CACHE_TTL_SECONDS || 300) || 300;

const store = new Map();

const now = () => Date.now();

const get = async (key) => {
  if (!enabled) return null;
  const entry = store.get(key);
  if (!entry) return null;

  if (entry.expiresAt && entry.expiresAt <= now()) {
    store.delete(key);
    return null;
  }

  return entry.value;
};

const set = async (key, value, ttlSeconds = defaultTtlSeconds) => {
  if (!enabled) return;
  const expiresAt = ttlSeconds > 0 ? now() + ttlSeconds * 1000 : null;
  store.set(key, { value, expiresAt });
};

const del = async (...keys) => {
  if (!enabled) return;
  keys.forEach((key) => store.delete(key));
};

const delByPrefix = async (prefix) => {
  if (!enabled) return;
  for (const key of Array.from(store.keys())) {
    if (String(key).startsWith(prefix)) {
      store.delete(key);
    }
  }
};

// Deterministic key builder so query objects stay stable.
const buildKey = (prefix, payload) => {
  if (payload === undefined || payload === null) return String(prefix);
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
  return `${prefix}:${serialized}`;
};

if (!enabled) {
  logger.info("Cache disabled (set CACHE_ENABLED=true to enable).");
}

module.exports = {
  enabled,
  get,
  set,
  del,
  delByPrefix,
  buildKey,
  defaultTtlSeconds,
};
