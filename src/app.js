// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// 공통 미들웨어
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'online-bookstore backend is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
