const http = require("node:http");
require("dotenv").config({ path: ".env" });

const app = require("../../src/app");
const prisma = require("../../src/lib/prisma");

let server;
let baseURL;

const startServer = async () => {
  if (server && baseURL) {
    return { server, baseURL };
  }

  await prisma.$connect();

  await new Promise((resolve) => {
    server = http.createServer(app).listen(0, "127.0.0.1", () => {
      const address = server.address();
      baseURL = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });

  return { server, baseURL };
};

const stopServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    server = null;
    baseURL = undefined;
  }

  await prisma.$disconnect().catch(() => {});
};

const getBaseURL = () => {
  if (!baseURL) {
    throw new Error("Test server is not started. Call startServer() first.");
  }
  return baseURL;
};

const authHeader = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  "Content-Type": "application/json",
});

const login = async (email, password) => {
  const { baseURL: url } = await startServer();
  const res = await fetch(`${url}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Login failed (${res.status}): ${data.message || "unknown error"}`
    );
  }

  return data;
};

module.exports = {
  startServer,
  stopServer,
  getBaseURL,
  authHeader,
  login,
  prisma,
};
