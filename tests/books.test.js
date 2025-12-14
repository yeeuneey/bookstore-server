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
let sampleBookId;

before(async () => {
  await startServer();
  adminLogin = await login("admin@example.com", "P@ssw0rd!");
});

after(async () => {
  await stopServer();
});

test("GET /books returns a paginated list", async () => {
  const res = await fetch(`${getBaseURL()}/books`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(body.books));
  assert.ok(body.total >= body.books.length);
  sampleBookId = body.books[0]?.id || 1;
});

test("GET /books/:id returns a book detail", async () => {
  const targetId = sampleBookId || 1;
  const res = await fetch(`${getBaseURL()}/books/${targetId}`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.equal(body.id, targetId);
  assert.ok(body.title);
});

test("Book creation enforces unique ISBNs", async (t) => {
  const isbn = `TEST-ISBN-${Date.now()}`;
  let createdBookId;

  await t.test("POST /books creates a new book", async () => {
    const res = await fetch(`${getBaseURL()}/books`, {
      method: "POST",
      headers: authHeader(adminLogin.accessToken),
      body: JSON.stringify({
        title: "테스트 도서",
        isbn,
        price: 12345,
        publisher: "테스트출판",
        summary: "통합 테스트로 생성된 도서",
        publicationDate: new Date().toISOString(),
        categoryIds: [1, 2],
        authorIds: [1],
      }),
    });

    const body = await res.json();
    assert.equal(res.status, 201);
    assert.ok(body.book?.id);
    createdBookId = body.book.id;
  });

  await t.test("POST /books rejects duplicate ISBN", async () => {
    const res = await fetch(`${getBaseURL()}/books`, {
      method: "POST",
      headers: authHeader(adminLogin.accessToken),
      body: JSON.stringify({
        title: "중복 ISBN 도서",
        isbn,
        price: 15000,
        publisher: "테스트출판",
        summary: "중복 ISBN 방지 테스트",
        publicationDate: new Date().toISOString(),
        categoryIds: [1],
        authorIds: [1],
      }),
    });

    const body = await res.json();
    assert.equal(res.status, 409);
    assert.equal(body.code, "DUPLICATE_RESOURCE");
  });

  await t.test("GET /books/:id can fetch the newly created book", async () => {
    const res = await fetch(`${getBaseURL()}/books/${createdBookId}`);
    const body = await res.json();

    assert.equal(res.status, 200);
    assert.equal(body.id, createdBookId);
    assert.equal(body.isbn, isbn);
  });
});
