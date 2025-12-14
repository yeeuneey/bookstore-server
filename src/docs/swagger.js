// src/docs/swagger.js
const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// 태그/엔드포인트 정렬 우선순위
const TAG_ORDER = [
  "Health",
  "Auth",
  "Users",
  "Books",
  "Carts",
  "Orders",
  "Comments",
  "Reviews",
  "Admin",
];

const OP_ORDER = [
  "/", // root health
  "/health",
  "/health/db",
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/users",
  "/users/me",
  "/users/{id}/comments",
  "/users/{id}/favorites",
  "/users/{id}/carts",
  "/users/{id}/orders",
  "/users/{id}/reviews",
  "/users/{id}",
  "/books",
  "/books/{id}",
  "/books/{id}/reviews",
  "/books/{id}/categories",
  "/books/{id}/authors",
  "/carts",
  "/carts/user/{userId}",
  "/carts/{id}",
  "/orders",
  "/orders/user/{userId}",
  "/orders/{id}",
  "/comments",
  "/comments/{id}",
  "/reviews",
  "/reviews/{id}",
  "/reviews/{id}/comments",
  "/admin/users",
  "/admin/users/{id}/ban",
  "/admin/statistics/orders",
];

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bookstore API",
      version: "1.0.0",
      description: "Express.js 기반 백엔드 API 명세서",
    },

    // 중요: servers에서 HTTPS 유도 제거
    servers: [
      {
        url: "/", // 상대경로 → 현재 접속한 프로토콜 그대로 사용 (HTTP)
      },
    ],

    // 원하는 순서대로 정렬: health > auth > users > books > carts > orders > comments > reviews > admin
    tags: [
      { name: "Health" },
      { name: "Auth" },
      { name: "Users" },
      { name: "Books" },
      { name: "Carts" },
      { name: "Orders" },
      { name: "Comments" },
      { name: "Reviews" },
      { name: "Admin" },
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

// Swagger UI 옵션: HTTPS 관련 옵션 전부 OFF + 커스텀 정렬
const swaggerUiOptions = {
  swaggerOptions: {
    supportedSubmitMethods: ["get", "post", "put", "patch", "delete"],
    tagsSorter: (a, b) => {
      const ai = TAG_ORDER.indexOf(a);
      const bi = TAG_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    },
    operationsSorter: (a, b) => {
      const pa = a.get("path");
      const pb = b.get("path");
      const ai = OP_ORDER.indexOf(pa);
      const bi = OP_ORDER.indexOf(pb);
      if (ai === -1 && bi === -1) return pa.localeCompare(pb);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    },
  },
  customSiteTitle: "Bookstore API Docs",
};

module.exports = {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions,
};
