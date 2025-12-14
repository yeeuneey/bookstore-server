const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { startServer, stopServer, getBaseURL, login } = require("./helpers/server");

let adminLogin;

before(async () => {
  await startServer();
  adminLogin = await login("admin@example.com", "P@ssw0rd!");
});

after(async () => {
  await stopServer();
});

test("POST /auth/login succeeds for admin", async () => {
  assert.ok(adminLogin.accessToken);
  assert.ok(adminLogin.refreshToken);
  assert.equal(adminLogin.user.email, "admin@example.com");
  assert.equal(adminLogin.user.role, "ADMIN");
});

test("POST /auth/login rejects invalid password", async () => {
  const res = await fetch(`${getBaseURL()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@example.com", password: "wrong-pass" }),
  });

  const body = await res.json();
  assert.equal(res.status, 401);
  assert.equal(body.code, "UNAUTHORIZED");
});

test("POST /auth/refresh issues a new access token", async () => {
  const res = await fetch(`${getBaseURL()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: adminLogin.refreshToken }),
  });

  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(body.accessToken);
});

test("POST /auth/refresh rejects malformed tokens", async () => {
  const res = await fetch(`${getBaseURL()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: "not-a-token" }),
  });

  assert.equal(res.status, 401);
});

test("POST /auth/logout returns success", async () => {
  const res = await fetch(`${getBaseURL()}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: adminLogin.user.id }),
  });

  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.message, "로그아웃 완료");
});
