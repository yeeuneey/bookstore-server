
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
      description: "Express.js 기반 Book Store API 명세입니다.",
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
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            timestamp: { type: "string", format: "date-time", example: "2025-01-01T12:00:00Z" },
            path: { type: "string", example: "/users/1" },
            status: { type: "integer", example: 400 },
            code: { type: "string", example: "BAD_REQUEST" },
            message: { type: "string", example: "요청 값이 올바르지 않습니다." },
            details: { type: "object", nullable: true },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            size: { type: "integer", example: 20 },
            total: { type: "integer", example: 120 },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            email: { type: "string", example: "user1@example.com" },
            name: { type: "string", example: "Hong Gil-dong" },
            role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
            gender: { type: "string", enum: ["MALE", "FEMALE"], nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UserCreateInput: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            name: { type: "string" },
            gender: { type: "string", enum: ["MALE", "FEMALE"] },
          },
        },
        UserUpdateInput: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            name: { type: "string" },
            gender: { type: "string", enum: ["MALE", "FEMALE"] },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        RefreshInput: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
        LogoutInput: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "integer", example: 3 },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
          },
        },
        Book: {
          type: "object",
          properties: {
            id: { type: "integer", example: 101 },
            title: { type: "string", example: "Clean Code" },
            publisher: { type: "string", example: "Prentice Hall" },
            summary: { type: "string", nullable: true },
            isbn: { type: "string", example: "9780132350884" },
            price: { type: "number", format: "float", example: 28000 },
            publicationDate: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        BookCreateInput: {
          type: "object",
          required: ["title", "isbn", "price", "publisher"],
          properties: {
            title: { type: "string" },
            isbn: { type: "string" },
            price: { type: "number", format: "float" },
            publisher: { type: "string" },
            summary: { type: "string" },
            publicationDate: { type: "string", format: "date-time" },
            categoryIds: { type: "array", items: { type: "integer" } },
            authorIds: { type: "array", items: { type: "integer" } },
          },
        },
        BookUpdateInput: {
          type: "object",
          properties: {
            title: { type: "string" },
            isbn: { type: "string" },
            price: { type: "number", format: "float" },
            publisher: { type: "string" },
            summary: { type: "string" },
            publicationDate: { type: "string", format: "date-time" },
            categoryIds: { type: "array", items: { type: "integer" } },
            authorIds: { type: "array", items: { type: "integer" } },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string", nullable: true },
            userId: { type: "integer" },
            bookId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ReviewCreateInput: {
          type: "object",
          required: ["userId", "bookId", "rating"],
          properties: {
            userId: { type: "integer" },
            bookId: { type: "integer" },
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string" },
          },
        },
        ReviewUpdateInput: {
          type: "object",
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5 },
            comment: { type: "string" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer" },
            comment: { type: "string" },
            userId: { type: "integer" },
            reviewId: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CommentCreateInput: {
          type: "object",
          required: ["userId", "reviewId", "comment"],
          properties: {
            userId: { type: "integer" },
            reviewId: { type: "integer" },
            comment: { type: "string" },
          },
        },
        CommentUpdateInput: {
          type: "object",
          required: ["comment"],
          properties: {
            comment: { type: "string" },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            bookId: { type: "integer" },
            quantity: { type: "integer", example: 2 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CartCreateInput: {
          type: "object",
          required: ["userId", "bookId", "quantity"],
          properties: {
            userId: { type: "integer" },
            bookId: { type: "integer" },
            quantity: { type: "integer", minimum: 1 },
          },
        },
        CartUpdateInput: {
          type: "object",
          required: ["quantity"],
          properties: {
            quantity: { type: "integer", minimum: 1 },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer" },
            userId: { type: "integer" },
            totalPrice: { type: "number", format: "float" },
            deliveryAddress: { type: "string" },
            orderStatus: {
              type: "string",
              enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        OrderCreateInput: {
          type: "object",
          required: ["userId", "deliveryAddress", "items"],
          properties: {
            userId: { type: "integer" },
            deliveryAddress: { type: "string" },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["bookId", "quantity"],
                properties: {
                  bookId: { type: "integer" },
                  quantity: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
        OrderUpdateInput: {
          type: "object",
          required: ["orderStatus"],
          properties: {
            orderStatus: {
              type: "string",
              enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
            },
          },
        },
      },
      responses: {
        Error400: {
          description: "요청 값이 올바르지 않거나 검증에 실패했습니다.",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                timestamp: "2025-01-01T12:00:00Z",
                path: "/users",
                status: 400,
                code: "BAD_REQUEST",
                message: "요청 값이 올바르지 않습니다.",
              },
            },
          },
        },
        Error401: {
          description: "인증 필요 또는 토큰 오류",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                timestamp: "2025-01-01T12:00:00Z",
                path: "/users",
                status: 401,
                code: "UNAUTHORIZED",
                message: "인증이 필요합니다.",
              },
            },
          },
        },
        Error403: {
          description: "권한 없음",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                timestamp: "2025-01-01T12:00:00Z",
                path: "/admin/users",
                status: 403,
                code: "FORBIDDEN",
                message: "권한이 없습니다.",
              },
            },
          },
        },
        Error404: {
          description: "리소스를 찾을 수 없음",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                timestamp: "2025-01-01T12:00:00Z",
                path: "/users/9999",
                status: 404,
                code: "RESOURCE_NOT_FOUND",
                message: "리소스를 찾을 수 없습니다.",
              },
            },
          },
        },
        Error409: {
          description: "중복 또는 상태 충돌",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                timestamp: "2025-01-01T12:00:00Z",
                path: "/users",
                status: 409,
                code: "DUPLICATE_RESOURCE",
                message: "이미 존재합니다.",
              },
            },
          },
        },
        Error422: {
          description: "처리 불가능한 엔티티 (검증 실패)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                timestamp: "2025-01-01T12:00:00Z",
                path: "/users",
                status: 422,
                code: "UNPROCESSABLE_ENTITY",
                message: "검증 오류",
                details: { field: "email" },
              },
            },
          },
        },
        Error500: {
          description: "서버 내부 오류",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              example: {
                timestamp: "2025-01-01T12:00:00Z",
                path: "/users",
                status: 500,
                code: "UNKNOWN_ERROR",
                message: "서버 오류가 발생했습니다.",
              },
            },
          },
        },
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
