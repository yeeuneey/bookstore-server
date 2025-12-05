const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Online Bookstore API",
      version: "1.0.0",
      description: `온라인 서점 서비스용 REST API 문서입니다.

### 인증 방식
- 모든 보호된 엔드포인트는 Bearer 토큰(JWT) 필요
- 우측 상단 "Authorize" 버튼을 눌러 Access Token을 입력하세요.

### 공통 에러 포맷
모든 오류는 동일한 형태로 반환됩니다.
\`\`\`json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "요청한 리소스를 찾을 수 없습니다.",
    "status": 404
  }
}
\`\`\`
      `,
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || "http://localhost:4000",
        description: "Local server",
      },
    ],
    tags: [
      { name: "Auth", description: "로그인/로그아웃 및 토큰" },
      { name: "Users", description: "회원 정보 및 활동" },
      { name: "Books", description: "도서 조회 및 관리" },
      { name: "Carts", description: "장바구니" },
      { name: "Orders", description: "주문" },
      { name: "Reviews", description: "리뷰" },
      { name: "Comments", description: "댓글" },
      { name: "Admin", description: "관리자 기능" },
      { name: "Health", description: "상태 점검" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "USER_NOT_FOUND" },
                message: { type: "string", example: "요청한 사용자를 찾을 수 없습니다." },
                status: { type: "integer", example: 404 },
              },
              required: ["code", "message", "status"],
            },
          },
          required: ["success", "error"],
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            total: { type: "integer", example: 125 },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            message: { type: "string", example: "로그인에 성공했습니다." },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "secret123" },
          },
        },
        RefreshInput: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string", example: "eyJhbGciOi..." },
          },
        },
        LogoutInput: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: { type: "integer", example: 3 },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 12 },
            email: { type: "string", example: "user@example.com" },
            name: { type: "string", example: "홍길동" },
            role: { type: "string", example: "USER" },
            gender: { type: "string", nullable: true, example: "MALE" },
            address: { type: "string", nullable: true, example: "서울시 중구 세종대로 110" },
            phoneNumber: { type: "string", nullable: true, example: "010-1234-5678" },
            bannedAt: { type: "string", nullable: true, format: "date-time" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        UserCreateInput: {
          type: "object",
          required: ["email", "password", "name"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", example: "secret123" },
            name: { type: "string", example: "홍길동" },
            gender: { type: "string", enum: ["MALE", "FEMALE"], example: "MALE" },
          },
        },
        UserUpdateInput: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
            name: { type: "string" },
            gender: { type: "string", enum: ["MALE", "FEMALE"] },
            address: { type: "string" },
            phoneNumber: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
          },
        },
        Book: {
          type: "object",
          properties: {
            id: { type: "integer", example: 101 },
            title: { type: "string", example: "클린 코드" },
            isbn: { type: "string", example: "9788966260959" },
            price: { type: "number", example: 18000 },
            publisher: { type: "string", example: "인사이트" },
            summary: { type: "string", example: "좋은 코드를 작성하는 원칙" },
            publicationDate: { type: "string", nullable: true, format: "date-time" },
            categories: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: {
                    type: "object",
                    properties: { id: { type: "integer" }, name: { type: "string" } },
                  },
                },
              },
            },
            authors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  author: {
                    type: "object",
                    properties: { id: { type: "integer" }, name: { type: "string" } },
                  },
                },
              },
            },
          },
        },
        BookCreateInput: {
          type: "object",
          required: ["title", "isbn", "price", "publisher"],
          properties: {
            title: { type: "string", example: "클린 아키텍처" },
            isbn: { type: "string", example: "9791189323151" },
            price: { type: "number", example: 22000 },
            publisher: { type: "string", example: "위키북스" },
            summary: { type: "string", example: "소프트웨어 설계 원칙" },
            publicationDate: { type: "string", format: "date-time", example: "2024-01-15T00:00:00.000Z" },
            categoryIds: { type: "array", items: { type: "integer" }, example: [1, 2] },
            authorIds: { type: "array", items: { type: "integer" }, example: [3] },
          },
        },
        BookUpdateInput: { $ref: "#/components/schemas/BookCreateInput" },
        Review: {
          type: "object",
          properties: {
            id: { type: "integer", example: 5 },
            rating: { type: "integer", example: 4 },
            comment: { type: "string", example: "재미있게 읽었습니다." },
            userId: { type: "integer", example: 1 },
            bookId: { type: "integer", example: 101 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ReviewCreateInput: {
          type: "object",
          required: ["userId", "bookId", "rating"],
          properties: {
            userId: { type: "integer", example: 1 },
            bookId: { type: "integer", example: 101 },
            rating: { type: "integer", example: 5, minimum: 1, maximum: 5 },
            comment: { type: "string", example: "추천합니다." },
          },
        },
        ReviewUpdateInput: {
          type: "object",
          properties: {
            rating: { type: "integer", example: 4 },
            comment: { type: "string", example: "수정된 댓글" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "integer", example: 8 },
            comment: { type: "string", example: "동의합니다!" },
            reviewId: { type: "integer", example: 5 },
            userId: { type: "integer", example: 2 },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        CommentCreateInput: {
          type: "object",
          required: ["userId", "reviewId", "comment"],
          properties: {
            userId: { type: "integer", example: 2 },
            reviewId: { type: "integer", example: 5 },
            comment: { type: "string", example: "공감해요." },
          },
        },
        CommentUpdateInput: {
          type: "object",
          properties: {
            comment: { type: "string", example: "의견을 수정합니다." },
          },
        },
        CartItem: {
          type: "object",
          properties: {
            id: { type: "integer", example: 15 },
            userId: { type: "integer", example: 1 },
            bookId: { type: "integer", example: 101 },
            quantity: { type: "integer", example: 2 },
          },
        },
        CartCreateInput: {
          type: "object",
          required: ["userId", "bookId", "quantity"],
          properties: {
            userId: { type: "integer", example: 1 },
            bookId: { type: "integer", example: 101 },
            quantity: { type: "integer", example: 1 },
          },
        },
        CartUpdateInput: {
          type: "object",
          properties: { quantity: { type: "integer", example: 3 } },
        },
        OrderItem: {
          type: "object",
          properties: {
            bookId: { type: "integer", example: 101 },
            quantity: { type: "integer", example: 1 },
            priceAtPurchase: { type: "number", example: 18000 },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "integer", example: 9 },
            userId: { type: "integer", example: 1 },
            orderStatus: { type: "string", example: "PENDING" },
            totalPrice: { type: "number", example: 36000 },
            deliveryAddress: { type: "string", example: "서울시 성동구 성수동" },
            orderItems: { type: "array", items: { $ref: "#/components/schemas/OrderItem" } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        OrderCreateInput: {
          type: "object",
          required: ["userId", "deliveryAddress", "items"],
          properties: {
            userId: { type: "integer", example: 1 },
            deliveryAddress: { type: "string", example: "서울시 강남구 테헤란로 123" },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  bookId: { type: "integer", example: 101 },
                  quantity: { type: "integer", example: 2 },
                },
                required: ["bookId", "quantity"],
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
              enum: ["PENDING", "PAID", "SHIPPED", "CANCELLED"],
              example: "PAID",
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "../routes/*.js"), path.join(__dirname, "../app.js")],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
