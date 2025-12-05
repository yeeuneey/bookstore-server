// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const prisma = require("./lib/prisma");
const authRouter = require("./routes/auth.routes");
const adminRouter = require("./routes/admin.routes");
const booksRouter = require("./routes/books.routes");
const cartsRouter = require("./routes/carts.routes");
const ordersRouter = require("./routes/orders.routes");
const reviewsRouter = require("./routes/reviews.routes");
const commentsRouter = require("./routes/comments.routes");
const usersRouter = require("./routes/users.routes");
const errorHandler = require("./middlewares/errorHandler");
const { swaggerUi, swaggerSpec } = require("./docs/swagger");
const requestLogger = require("./middlewares/requestLogger");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use("/auth", authRouter);
app.use("/books", booksRouter);
app.use("/carts", cartsRouter);
app.use("/orders", ordersRouter);
app.use("/reviews", reviewsRouter);
app.use("/comments", commentsRouter);
app.use("/admin", adminRouter);
app.use("/users", usersRouter);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(errorHandler);

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: 서버 상태 점검
 */

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: 서버 상태 확인
 *     responses:
 *       200:
 *         description: 서버 정상 동작
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: "ok" }
 *                 message: { type: string, example: "server is running" }
 *                 timestamp: { type: string, format: date-time }
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "server is running",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
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
 *                 timestamp: { type: string, format: date-time }
 *       500:
 *         description: DB 연결 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get("/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    req.log.error("DB connection failed:", { error });
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
    });
  }
});

module.exports = app;
