const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const {
  startServer,
  stopServer,
  getBaseURL,
  login,
  authHeader,
} = require("./helpers/server");

let adminLogin;
let user1Login;
let otherLogin;

before(async () => {
  await startServer();
  adminLogin = await login("admin@example.com", "P@ssw0rd!");
  user1Login = await login("user1@example.com", "P@ssw0rd!");

  // 테스트용 일반 사용자 생성(동일 이메일이 있으면 로그인만 시도)
  const baseURL = getBaseURL();
  const email = `temp_user_${Date.now()}@example.com`;
  const password = "TempUser123!";
  const res = await fetch(`${baseURL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name: "Temp User",
      gender: "MALE",
    }),
  });
  if (res.status !== 201 && res.status !== 409) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Failed to create temp user (${res.status}): ${body.message || "unknown"}`);
  }
  otherLogin = await login(email, password);
});

after(async () => {
  await stopServer();
});

test("GET /users/me returns the logged-in profile", async () => {
  const res = await fetch(`${getBaseURL()}/users/me`, {
    headers: authHeader(user1Login.accessToken),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.email, "user1@example.com");
  assert.equal(body.id, user1Login.user.id);
});

test("PATCH /users/:id allows self-update", async () => {
  const newName = `user1-updated-${Date.now()}`;
  const res = await fetch(`${getBaseURL()}/users/${user1Login.user.id}`, {
    method: "PATCH",
    headers: authHeader(user1Login.accessToken),
    body: JSON.stringify({ name: newName }),
  });

  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.user.name, newName);
});

test("GET /users/:id blocks access to other users when not admin", async () => {
  const res = await fetch(`${getBaseURL()}/users/${user1Login.user.id}`, {
    headers: authHeader(otherLogin.accessToken),
  });
  const body = await res.json();

  assert.equal(res.status, 403);
  assert.ok(body.message);
});

test("GET /users (admin) returns paginated list", async () => {
  const res = await fetch(`${getBaseURL()}/users`, {
    headers: authHeader(adminLogin.accessToken),
  });
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.users));
  assert.ok(body.total >= body.users.length);
});
