const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { startServer, stopServer, getBaseURL } = require("./helpers/server");

before(async () => {
  await startServer();
});

after(async () => {
  await stopServer();
});

test("GET /health returns service status", async () => {
  const res = await fetch(`${getBaseURL()}/health`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.status, "ok");
  assert.ok(body.timestamp);
});

test("GET /health/db reports database connectivity", async () => {
  const res = await fetch(`${getBaseURL()}/health/db`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.database, "connected");
});
