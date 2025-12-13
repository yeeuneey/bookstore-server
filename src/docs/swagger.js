// src/docs/swagger.js
const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bookstore API",
      version: "1.0.0",
      description: "Express.js 기반 백엔드 API 명세서",
    },

    // 🚨 중요: servers에서 HTTPS 유도 제거
    servers: [
      {
        url: "/", // 상대경로 → 현재 접속한 프로토콜 그대로 사용 (HTTP)
      },
    ],

    tags: [
      { name: "Admin" },
      { name: "Auth" },
      { name: "Books" },
      { name: "Carts" },
      { name: "Comments" },
      { name: "Orders" },
      { name: "Reviews" },
      { name: "Users" },
      { name: "Health" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  // Swagger 주석 스캔 경로
  apis: [
    path.join(__dirname, "../routes/*.js"),
    path.join(__dirname, "../app.js"),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

// 🔥 Swagger UI 옵션: HTTPS 관련 옵션 전부 OFF
const swaggerUiOptions = {
  swaggerOptions: {
    supportedSubmitMethods: ["get", "post", "put", "patch", "delete"],
  },
  customSiteTitle: "Bookstore API Docs",
};

module.exports = {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions,
};
