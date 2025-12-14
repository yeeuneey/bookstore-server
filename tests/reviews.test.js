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

  // 테스트용 일반 사용자 생성(동일 이메일이 존재하면 로그인만 시도)
  const baseURL = getBaseURL();
  const email = `temp_user_reviews_${Date.now()}@example.com`;
  const password = "TempUser123!";
  const res = await fetch(`${baseURL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name: "Temp Reviewer",
      gender: "MALE",
    }),
  });
  if (res.status !== 201 && res.status !== 409) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Failed to create temp user for tests (${res.status}): ${body.message || "unknown"}`);
  }
  otherLogin = await login(email, password);
});

after(async () => {
  await stopServer();
});

test("Review lifecycle enforces ownership rules", async (t) => {
  const baseURL = getBaseURL();
  const comment = `리뷰 내용 - ${Date.now()}`;
  let reviewId;

  await t.test("POST /reviews allows the owner to create", async () => {
    const res = await fetch(`${baseURL}/reviews`, {
      method: "POST",
      headers: authHeader(user1Login.accessToken),
      body: JSON.stringify({
        userId: user1Login.user.id,
        bookId: 1,
        rating: 5,
        comment,
      }),
    });

    const body = await res.json();
    assert.equal(res.status, 201);
    assert.ok(body.review?.id);
    reviewId = body.review.id;
  });

  await t.test("PATCH /reviews/:id works for the owner", async () => {
    const res = await fetch(`${baseURL}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: authHeader(user1Login.accessToken),
      body: JSON.stringify({ rating: 4, comment: `${comment} - updated` }),
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.review.rating, 4);
  });

  await t.test("PATCH /reviews/:id forbids other users", async () => {
    const res = await fetch(`${baseURL}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: authHeader(otherLogin.accessToken),
      body: JSON.stringify({ rating: 3 }),
    });

    assert.equal(res.status, 403);
  });

  await t.test("DELETE /reviews/:id is allowed for admin", async () => {
    const res = await fetch(`${baseURL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: authHeader(adminLogin.accessToken),
    });

    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.message, "리뷰 삭제 완료");
  });
});
