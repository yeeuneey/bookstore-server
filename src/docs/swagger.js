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
      description: "Express.js 기반 북스토어 API 명세입니다.",
    },
    servers: [{ url: "/" }],
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
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js"), path.join(__dirname, "../app.js")],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerUiOptions = {
  swaggerOptions: {
    supportedSubmitMethods: ["get", "post", "put", "patch", "delete"],
    tagsSorter: (a, b) => {
      const order = ["Health", "Auth", "Users", "Books", "Carts", "Orders", "Comments", "Reviews", "Admin"];
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    },
    operationsSorter: (a, b) => {
      const order = [
        "/",
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
      const pa = a.get("path");
      const pb = b.get("path");
      const ai = order.indexOf(pa);
      const bi = order.indexOf(pb);
      if (ai === -1 && bi === -1) return pa.localeCompare(pb);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    },
  },
  customSiteTitle: "Bookstore API Docs",
};

module.exports = { swaggerUi, swaggerSpec, swaggerUiOptions };
