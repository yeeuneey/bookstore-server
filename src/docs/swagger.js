
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
      description: "Express.js ?? ???? API ?????.",
    },
    servers: [{ url: "/" }],
    tags: [
      { name: "health" },
      { name: "auth" },
      { name: "users" },
      { name: "books" },
      { name: "carts" },
      { name: "orders" },
      { name: "comments" },
      { name: "reviews" },
      { name: "admin" },
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
      const order = ["health", "auth", "users", "books", "carts", "orders", "comments", "reviews", "admin"];
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
        "/users/{id}",
        "/users/{id}/comments",
        "/users/{id}/favorites",
        "/users/{id}/carts",
        "/users/{id}/orders",
        "/users/{id}/reviews",
        "/books",
        "/books/{id}/reviews",
        "/books/{id}/categories",
        "/books/{id}/authors",
        "/books/{id}",
        "/carts",
        "/carts/user/{id}",
        "/carts/{id}",
        "/orders",
        "/orders/user/{id}",
        "/orders/{id}",
        "/comments",
        "/comments/{id}",
        "/reviews",
        "/reviews/{id}/comments",
        "/reviews/{id}",
        "/admin/users/{id}/ban",
        "/admin/users",
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
