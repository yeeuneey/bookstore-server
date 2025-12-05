// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const prisma = require('./lib/prisma');
const adminRouter = require("./routes/admin.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use("/admin", adminRouter);
app.use(errorHandler);

// 기존 헬스 체크
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'server is running',
    timestamp: new Date().toISOString(),
  });
});

// ★ DB 헬스 체크 추가
app.get('/health/db', async (req, res) => {
  try {
    // 단순한 쿼리 (User 테이블 개수 세기)
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('DB connection failed:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// Users routes
const usersRouter = require("./routes/users.routes");
app.use("/users", usersRouter);

module.exports = app;

