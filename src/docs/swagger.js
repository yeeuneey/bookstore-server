const path = require("path");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bookstore API",
      version: "1.0.0",
      description: `Express.js 기반 백엔드 API 명세서

### 인증 방식
- 모든 보호된 엔드포인트는 Bearer 토큰(JWT) 필요
- 우측 상단 "Authorize" 버튼을 눌러 Access Token을 입력하세요.

### 공통 에러 포맷
모든 오류는 동일한 형태로 반환됩니다.
\`\`\`json
{
  "timestamp": "2025-03-05T12:34:56Z",
  "path": "/api/posts/1",
  "status": 404,
  "code": "RESOURCE_NOT_FOUND",
  "message": "요청한 리소스를 찾을 수 없습니다.",
  "details": { "resource": "post" }
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
    // Swagger UI에서 표시되는 그룹 순서를 스크린샷과 동일하게 유지
    tags: [
      { name: "Admin", description: "관리자 전용" },
      { name: "Auth", description: "로그인/토큰 갱신/로그아웃" },
      { name: "Books", description: "도서" },
      { name: "Carts", description: "장바구니" },
      { name: "Comments", description: "댓글" },
      { name: "Orders", description: "주문" },
      { name: "Reviews", description: "리뷰" },
      { name: "Users", description: "회원" },
      { name: "Health", description: "상태 체크" },
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
            timestamp: { type: "string", format: "date-time", example: "2025-03-05T12:34:56Z" },
            path: { type: "string", example: "/api/posts/1" },
            status: { type: "integer", example: 404 },
            code: { type: "string", example: "USER_NOT_FOUND" },
            message: { type: "string", example: "요청한 사용자를 찾을 수 없습니다." },
            details: { type: "object", nullable: true, example: { field: "현재 길이 150자" } },
          },
          required: ["timestamp", "path", "status", "code", "message"],
        },
        PaginationMeta: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            size: { type: "integer", example: 10 },
            total: { type: "integer", example: 125 },
          },
        },
        AuthTokens: {
          type: "object",
          properties: {
            accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            refreshToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            message: { type: "string", example: "로그인되었습니다." },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user1@example.com" },
            password: { type: "string", example: "P@ssw0rd!" },
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
            email: { type: "string", example: "user1@example.com" },
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
            email: { type: "string", format: "email", example: "user1@example.com" },
            password: { type: "string", example: "P@ssw0rd!" },
            name: { type: "string", example: "홍길동" },
            gender: { type: "string", enum: ["MALE", "FEMALE"], example: "MALE" },
          },
        },
        UserUpdateInput: {
          type: "object",
          properties: {
            email: { type: "string", format: "email", example: "user104@example.com" },
            password: { type: "string", example: "password123" },
            name: { type: "string", example: "John Doe" },
            gender: { type: "string", enum: ["MALE", "FEMALE"], example: "MALE" },
          },
          example: {
            email: "user104@example.com",
            password: "password123",
            name: "John Doe",
            gender: "MALE",
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
              enum: ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"],
              example: "SHIPPED",
            },
          },
        },
      },
      responses: {
        Error400: {
          description: "요청 형식이 올바르지 않음",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                badRequest: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 400,
                    code: "BAD_REQUEST",
                    message: "요청 형식이 올바르지 않습니다.",
                  },
                },
                validationFailed: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 400,
                    code: "VALIDATION_FAILED",
                    message: "필드 유효성 검사 실패하였습니다.",
                  },
                },
                invalidQueryParam: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 400,
                    code: "INVALID_QUERY_PARAM",
                    message: "쿼리 파라미터 값이 잘못되었습니다.",
                  },
                },
              },
            },
          },
        },
        Error401: {
          description: "인증 토큰 없음 또는 잘못된 토큰",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                unauthorized: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 401,
                    code: "UNAUTHORIZED",
                    message: "인증 토큰이 없거나 잘못된 토큰입니다.",
                  },
                },
                tokenExpired: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 401,
                    code: "TOKEN_EXPIRED",
                    message: "토큰 만료",
                  },
                },
              },
            },
          },
        },
        Error403: {
          description: "접근 권한 없음 (Role 불일치 등)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                forbidden: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 403,
                    code: "FORBIDDEN",
                    message: "접근 권한이 없습니다.",
                  },
                },
              },
            },
          },
        },
        Error404: {
          description: "요청한 리소스가 존재하지 않음",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                notFound: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 404,
                    code: "RESOURCE_NOT_FOUND",
                    message: "요청한 리소스가 존재하지 않습니다.",
                  },
                },
                userNotFound: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 404,
                    code: "USER_NOT_FOUND",
                    message: "사용자 ID가 존재하지 않습니다.",
                  },
                },
              },
            },
          },
        },
        Error409: {
          description: "중복 데이터 존재 또는 리소스 상태 충돌",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                conflict: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 409,
                    code: "DUPLICATE_RESOURCE",
                    message: "중복 데이터가 존재합니다.",
                  },
                },
                stateConflict: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 409,
                    code: "STATE_CONFLICT",
                    message: "리소스 상태가 충돌하였습니다.",
                  },
                },
              },
            },
          },
        },
        Error422: {
          description: "처리할 수 없는 요청 내용",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                validation: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 422,
                    code: "UNPROCESSABLE_ENTITY",
                    message: "처리할 수 없는 요청 내용입니다.",
                    details: [{ path: ["field"], message: "필수 입력입니다." }],
                  },
                },
              },
            },
          },
        },
        Error429: {
          description: "요청 한도 초과 (rate limiting)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                rateLimit: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 429,
                    code: "TOO_MANY_REQUESTS",
                    message: "요청 한도를 초과했습니다.",
                  },
                },
              },
            },
          },
        },
        Error500: {
          description: "서버 내부 오류",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
              examples: {
                internal: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 500,
                    code: "INTERNAL_SERVER_ERROR",
                    message: "서버 내부 오류",
                  },
                },
                databaseError: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 500,
                    code: "DATABASE_ERROR",
                    message: "DB 연동 오류",
                  },
                },
                unknownError: {
                  value: {
                    timestamp: "2025-03-05T12:34:56Z",
                    path: "/api/example",
                    status: 500,
                    code: "UNKNOWN_ERROR",
                    message: "알 수 없는 오류",
                  },
                },
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
const tagOrder = options.definition.tags.map((t) => t.name);

const operationOrder = {
  Admin: [
    "특정 사용자 차단 처리",
    "전체 사용자 목록 조회",
    "주문 통계 조회",
    "전체 사용자 주문 목록",
    "전체 사용자 장바구니 목록",
  ],
  Auth: ["로그인", "토큰 재발급", "로그아웃"],
  Books: [
    "도서 목록 조회",
    "도서 생성",
    "도서에 달린 리뷰 조회",
    "도서 카테고리 목록",
    "도서 저자 목록",
    "도서 상세 조회",
    "도서 수정",
    "도서 삭제",
  ],
  Carts: [
    "장바구니에 상품 추가",
    "사용자의 장바구니 조회",
    "장바구니 아이템 단건 조회",
    "장바구니 아이템 수량 수정",
    "장바구니 아이템 삭제",
  ],
  Comments: ["댓글 작성", "댓글 목록 조회", "댓글 상세 조회", "댓글 수정", "댓글 삭제"],
  Orders: ["주문 생성", "사용자의 주문 목록", "주문 상세 조회", "주문 상태 변경", "주문 삭제"],
  Reviews: [
    "리뷰 작성",
    "리뷰 목록 조회",
    "리뷰에 달린 댓글 조회",
    "리뷰 상세 조회",
    "리뷰 수정",
    "리뷰 삭제",
  ],
  Users: [
    "회원가입",
    "내 프로필 조회",
    "사용자가 작성한 댓글 목록",
    "사용자의 즐겨찾기 도서 목록",
    "사용자의 장바구니 목록",
    "사용자의 주문 목록",
    "사용자 상세",
    "사용자 정보 수정 (본인 혹은 관리자)",
    "사용자 삭제 (본인 혹은 관리자)",
    "사용자가 작성한 리뷰 목록",
  ],
  Health: ["서버 상태 확인", "데이터베이스 연결 상태 확인"],
};

const swaggerUiOptions = {
  swaggerOptions: {
    tagsSorter: "order", // tags 배열 순서대로 표시
    operationsSorter: (a, b) => {
      try {
        const tagA = (a?.get && a.get("tags")?.[0]) || "";
        const tagB = (b?.get && b.get("tags")?.[0]) || "";

        if (tagA !== tagB) {
          const idxA = tagOrder.indexOf(tagA);
          const idxB = tagOrder.indexOf(tagB);
          if (idxA !== -1 && idxB !== -1) return idxA - idxB;
          return tagA.localeCompare(tagB);
        }

        const summaryA = (a?.get && a.get("summary")) || "";
        const summaryB = (b?.get && b.get("summary")) || "";
        const order = operationOrder[tagA] || [];
        const idxA = order.indexOf(summaryA);
        const idxB = order.indexOf(summaryB);

        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;

        return summaryA.localeCompare(summaryB);
      } catch (err) {
        // 정렬 중 문제가 생기면 기본 정렬로 회귀
        return 0;
      }
    },
  },
};

// NOTE: Swagger 문서에서만 ID 예시를 Postman 스타일 변수로 노출해주기 위한 후처리.
// 실제 라우팅은 /:id 그대로 유지됩니다.
const pathIdPlaceholders = [
  { prefix: "/users", example: "{{userId}}" },
  { prefix: "/admin/users", example: "{{userId}}" },
  { prefix: "/books", example: "{{bookId}}" },
  { prefix: "/carts", example: "{{cartId}}" },
  { prefix: "/orders", example: "{{orderId}}" },
  { prefix: "/reviews", example: "{{reviewId}}" },
  { prefix: "/comments", example: "{{commentId}}" },
];

function injectIdExamples(spec) {
  if (!spec?.paths) return;
  for (const [path, pathItem] of Object.entries(spec.paths)) {
    const matched = pathIdPlaceholders.find(
      ({ prefix }) => path.startsWith(prefix) && path.includes("{id}")
    );
    if (!matched) continue;

    for (const op of Object.values(pathItem)) {
      if (!op?.parameters) continue;
      op.parameters = op.parameters.map((param) => {
        if (param?.in === "path" && param?.name === "id") {
          const updated = { ...param, description: param.description };
          updated.schema = { ...(param.schema || {}) };
          updated.schema.example = matched.example;
          updated.description = `${param.description || "Path ID"} (예: ${matched.example})`;
          return updated;
        }
        return param;
      });
    }
  }
}

injectIdExamples(swaggerSpec);

// 공통 에러 응답 설명 자동 보강
const defaultErrorDescriptions = {
  400: "잘못된 요청 형식입니다. 파라미터 또는 바디를 확인하세요.",
  401: "인증 정보가 없거나 만료/위조되었습니다.",
  403: "요청 권한이 없습니다. (본인 또는 관리자만 가능)",
  404: "요청한 리소스를 찾을 수 없습니다.",
  422: "유효성 검증에 실패했습니다. 요청 스키마를 확인하세요.",
};

function enrichErrorResponses(spec) {
  if (!spec?.paths) return;
  const targetCodes = Object.keys(defaultErrorDescriptions);

  for (const pathItem of Object.values(spec.paths)) {
    for (const op of Object.values(pathItem)) {
      if (!op?.responses) continue;
      for (const code of targetCodes) {
        const resp = op.responses[code];
        if (!resp) continue;
        // description이 비어 있으면 기본 설명을 채워준다.
        if (!resp.description) {
          resp.description = defaultErrorDescriptions[code];
        }
      }
    }
  }
}

enrichErrorResponses(swaggerSpec);

module.exports = { swaggerUi, swaggerSpec, swaggerUiOptions };
