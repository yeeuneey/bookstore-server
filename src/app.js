// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const prisma = require("./lib/prisma");

// routers
const authRouter = require("./routes/auth.routes");
const adminRouter = require("./routes/admin.routes");
const booksRouter = require("./routes/books.routes");
const cartsRouter = require("./routes/carts.routes");
const ordersRouter = require("./routes/orders.routes");
const reviewsRouter = require("./routes/reviews.routes");
const commentsRouter = require("./routes/comments.routes");
const usersRouter = require("./routes/users.routes");

// middlewares
const requestLogger = require("./middlewares/requestLogger");
const errorHandler = require("./middlewares/errorHandler");

// swagger
const { swaggerUi, swaggerSpec, swaggerUiOptions } = require("./docs/swagger");

const app = express();

/**
 * 🚨 1️⃣ helmet을 Swagger보다 "먼저" 적용
 * → HTTPS 강제 / COOP / CSP 완전 비활성화
 */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
    hsts: false,
  })
);

app.use(cors());
app.use(express.json());
app.use(requestLogger);

/**
 * 🚨 2️⃣ Swagger UI
 */
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

/**
 * 🚨 3️⃣ Swagger JSON
 */
app.get("/docs.json", (_req, res) => {
  res.type("application/json").send(swaggerSpec);
});

// routers
app.use("/auth", authRouter);
app.use("/books", booksRouter);
app.use("/carts", cartsRouter);
app.use("/orders", ordersRouter);
app.use("/reviews", reviewsRouter);
app.use("/comments", commentsRouter);
app.use("/admin", adminRouter);
app.use("/users", usersRouter);

// root
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "bookstore API is running" });
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: 서버 상태 확인
 *     responses:
 *       200:
 *         description: 서버 동작 여부와 타임스탬프를 반환합니다.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-01-01T12:00:00.000Z
 *
 * /health/db:
 *   get:
 *     tags: [Health]
 *     summary: 데이터베이스 연결 상태 확인
 *     responses:
 *       200:
 *         description: DB 연결 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "ok" }
 *                 database: { type: string, example: "connected" }
 *       500:
 *         description: DB 연결 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "error" }
 *                 database: { type: string, example: "disconnected" }
 */
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (e) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// error handler
app.use(errorHandler);

module.exports = app;
