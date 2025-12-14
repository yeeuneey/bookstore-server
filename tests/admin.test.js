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
let userLogin;

before(async () => {
  await startServer();
  adminLogin = await login("admin@example.com", "P@ssw0rd!");
  userLogin = await login("user1@example.com", "P@ssw0rd!");
});

after(async () => {
  await stopServer();
});

test("Admin endpoints require ADMIN role", async (t) => {
  const baseURL = getBaseURL();

  await t.test("GET /admin/users returns list for admin", async () => {
    const res = await fetch(`${baseURL}/admin/users`, {
      headers: authHeader(adminLogin.accessToken),
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(body.users));
  });

  await t.test("GET /admin/users denies non-admins", async () => {
    const res = await fetch(`${baseURL}/admin/users`, {
      headers: authHeader(userLogin.accessToken),
    });

    assert.equal(res.status, 403);
  });

  await t.test("PATCH /admin/users/:id/ban marks a user as banned", async () => {
    // Create a fresh user to ban
    const uniqueEmail = `ban-test-${Date.now()}@example.com`;
    const createRes = await fetch(`${baseURL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: uniqueEmail,
        password: "BanTest1!",
        name: "Ban Target",
      }),
    });
    const created = await createRes.json();
    assert.equal(createRes.status, 201);

    const banRes = await fetch(`${baseURL}/admin/users/${created.user.id}/ban`, {
      method: "PATCH",
      headers: authHeader(adminLogin.accessToken),
    });
    const body = await banRes.json();

    assert.equal(banRes.status, 200);
    assert.ok(body.user.bannedAt);
  });
});
