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
let user2Login;

before(async () => {
  await startServer();
  adminLogin = await login("admin@example.com", "P@ssw0rd!");
  user1Login = await login("user1@example.com", "P@ssw0rd!");
  user2Login = await login("user2@example.com", "P@ssw0rd2!");
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
    headers: authHeader(user2Login.accessToken),
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
