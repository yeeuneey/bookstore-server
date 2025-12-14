# Bookstore Server

## 프로젝트 개요
- Express + Prisma + MySQL 기반 북스토어 백엔드 API (과제 요구사항 충족).
- 도서 조회/생성/수정/삭제, 리뷰·댓글 CRUD, 즐겨찾기/장바구니/주문 흐름, 관리자 통계(주문 집계, 사용자 차단) 제공.
- JWT 인증과 역할 기반 접근 제어(ROLE_USER, ROLE_ADMIN), Zod 스키마로 요청 검증, Swagger UI로 전체 API 문서화.

## 요구사항 충족 요약
- 엔드포인트 30개 이상 구현 (총 34개)
- 4개 이상 리소스(users, books, reviews, comments, carts, orders, favorites 등)
- JWT 인증 + RBAC(ROLE_USER, ROLE_ADMIN)
- 페이지네이션 / 검색 / 정렬 지원
- 공통 에러 포맷 + 검증(Zod) + 10종 이상의 에러 코드
- JCloud 배포 및 Health Check 포함
- Swagger + Postman 자동화 테스트 포함

## 실행 방법
- 사전 준비: Node >= 18.0.0, Docker(선택: `docker compose up -d mysql`로 로컬 DB 기동), .env 작성.
- 로컬 실행 (마이그레이션/시드 포함):
```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start   # 개발 중엔 npm run dev
```
- Swagger 문서: 서버 기동 후 `http://localhost:8080/docs` (JSON: `/docs.json`).
- Swagger UI에서는 우측 상단 **Authorize** 버튼을 통해 Access Token(Bearer) 입력 후 인증 요청을 바로 테스트할 수 있습니다.
- Postman/VS Code REST용 예시 요청: `test.http` 참고.
- Swagger 문서에는 모든 엔드포인트의 성공 응답과 함께 400 / 401 / 403 / 404 / 422 / 500 에러 응답 예시를 포함합니다.

## 환경변수 설명 (.env.example 기준)
- `DATABASE_URL` : Prisma에서 사용하는 DB URL (`mysql://USER:PASSWORD@HOST:PORT/DBNAME`).
- `PORT` : 서버 포트(기본 8080).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` : 액세스/리프레시 토큰 서명 키.
- `MYSQL_ROOT_PASSWORD` / `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_PORT` : docker-compose용 MySQL 설정.
- `SWAGGER_SERVER_URL`(선택) : Swagger 서버 표시용 URL. 미설정 시 `http://localhost:4000` 이므로 실제 포트에 맞게 설정 권장.
- API Root: 루트(`/`) 기준(별도 `/api` prefix 없음).
- Swagger 스키마 소스: `src/docs/swagger.js`

## 배포/접속 주소 (로컬 기준)
- Base URL: `http://localhost:8080`
- Swagger: `http://localhost:8080/docs`
- Health: `http://localhost:8080/health`, DB: `http://localhost:8080/health/db`



## Automated Tests (Node test)
- 러너: Node 내장 테스트 러너(`node --test`), 명령은 `npm test` (`node --test --test-concurrency=1 tests`).
- 준비: `.env`에 `DATABASE_URL`, `JWT_*`, `PORT` 등 설정 후 `npx prisma migrate deploy` → `node prisma/seed.js`.
- 실행: `npm test` (테스트 서버를 포트 0에서 띄워 내부 fetch로 API 호출).
- DB 의존: MySQL이 열려 있어야 하고, 시드된 계정 비밀번호가 테스트 기대값과 일치해야 함.
- CI: GitHub Actions 워크플로에서 install → migrate → generate → seed → lint/test/build 순으로 자동 실행.
```bash
# 사전 준비
npx prisma migrate deploy
node prisma/seed.js

# 테스트 실행
npm test
```



## 인증 플로우 설명
- 회원가입 `POST /users` → 로그인 `POST /auth/login` 시 access/refresh 토큰 수신.
- 보호 API 호출 시 `Authorization: Bearer <accessToken>` 헤더 사용.
- access 만료 시 `POST /auth/refresh` 로 갱신.
- `POST /auth/logout` 은 사용자 존재 확인만 수행(현 구현상 서버측 토큰 무효화 없음).

## 역할/권한 표 (주요 예시)
- 공용: `GET /health`, `GET /health/db`, `GET /books`, `GET /books/:id` 등 조회계.
- 인증 필요: 장바구니/주문/리뷰/댓글 CRUD, 내 정보 `GET /users/me`, 도서 생성·수정·삭제(현 구현상 로그인만 요구).
- 본인 또는 관리자: `GET/PATCH/DELETE /users/:id`, `GET /users/:id/(reviews|comments|favorites|carts|orders)` 등.
- 관리자 전용: `GET /admin/users`, `PATCH /admin/users/:id/ban`, `GET /admin/statistics/orders`, `GET /orders`(전체), `GET /carts`(전체).

## 예제 계정 (prisma/seed.js)
- 관리자: `admin@example.com / P@ssw0rd!`
- 기본 사용자: `user1@example.com / P@ssw0rd!`
- 추가 사용자: `user2@example.com / P@ssw0rd2!` … `user20@example.com / P@ssw0rd20!`

## DB 연결 정보 (테스트용)
- MySQL 8.0 (docker-compose): `host=localhost`, `port=${MYSQL_PORT}`(예: 3306), `db=${MYSQL_DATABASE}`.
- 예시 .env 조합:
```env
DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:${MYSQL_PORT}/${MYSQL_DATABASE}"
MYSQL_DATABASE=bookstore
MYSQL_USER=book_user
MYSQL_PASSWORD=book_pass
MYSQL_PORT=3306
```

## 엔드포인트 요약(발췌)
- (총 34개)
- Health: `GET /health`, `GET /health/db`
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Users: `POST /users`, `GET /users/me`, `GET|PATCH|DELETE /users/:id`, `GET /users`(admin)
- Books: `GET /books`, `GET /books/:id`, `POST|PATCH|DELETE /books`, `GET /books/:id/reviews|categories|authors`
- Reviews: `POST /reviews`, `GET /reviews`, `GET|PATCH|DELETE /reviews/:id`, `GET /reviews/:id/comments`
- Comments: `POST /comments`, `GET /comments`, `GET|PATCH|DELETE /comments/:id`
- Carts: `POST /carts`, `GET /carts`(admin), `GET /carts/user/:userId`, `GET|PATCH|DELETE /carts/:id`
- Orders: `POST /orders`, `GET /orders`(admin), `GET /orders/user/:userId`, `GET|PATCH|DELETE /orders/:id`
- Admin: `GET /admin/users`, `PATCH /admin/users/:id/ban`, `GET /admin/statistics/orders`

## 성능/보안 고려사항
- `helmet`, `cors`, `express.json()` 기본 보안/JSON 설정, `morgan` 대체 `requestLogger`로 요청 추적(요청 ID 포함).
- JWT 만료(access 1h, refresh 7d)와 Bearer 인증, 역할 체크 미들웨어(`adminOnly`, `selfOrAdmin*`).
- Zod 스키마 기반 바디/쿼리/파라미터 검증, Prisma에서 유니크 제약/관계 정의.
- Swagger(OpenAPI 3.0)로 문서화 및 예제/에러 응답 스키마 제공.
- Prisma `include`/`select`로 리뷰·댓글·연관 도서 조회 시 N+1 최소화, 필요한 필드만 조회해 응답/쿼리 최적화.

## 한계와 개선 계획
- 도서 등록/수정/삭제에 관리자 권한 미적용 → `adminOnly` 추가 검토.
- 로그아웃 시 refresh 토큰 무효화/블랙리스트 미구현 → 토큰 저장소 또는 로테이션 도입 필요.
- 일부 한글 Swagger 설명/시드 텍스트 인코딩 깨짐 존재 → UTF-8 리소스 정리 필요.
- 부하/보안: Rate limiting, 요청 크기 제한, 쿼리 최적화 인덱스 추가 검토.

## ERD
![ERD](./docs/db-schema.png)

## 에러 응답 표준 포맷
```json
{
  "timestamp": "2025-01-01T12:00:00Z",
  "path": "/books/1",
  "status": 400,
  "code": "VALIDATION_FAILED",
  "message": "요청 데이터가 올바르지 않습니다.",
  "details": { "title": "최소 1자 이상" }
}
```
구현된 대표 에러 코드
- BAD_REQUEST
- VALIDATION_FAILED
- INVALID_QUERY_PARAM
- UNAUTHORIZED
- TOKEN_EXPIRED
- FORBIDDEN
- RESOURCE_NOT_FOUND (USER_NOT_FOUND 포함)
- DUPLICATE_RESOURCE
- STATE_CONFLICT
- UNPROCESSABLE_ENTITY
- TOO_MANY_REQUESTS
- INTERNAL_SERVER_ERROR
- DATABASE_ERROR
- UNKNOWN_ERROR

## Postman Collection
- 전체 API 자동화 테스트 스크립트 포함, Pre-request Script로 Access Token 자동 주입, Tests Script로 성공/에러 검증.
- Postman 컬렉션에는 최소 5개 이상의 Tests 스크립트가 포함되어 있으며, 성공/실패/권한/검증 오류 등 대표 에러 케이스를 실제 요청으로 검증하도록 구성했습니다.
- 컬렉션 파일: `postman/bookstore.postman_collection.json`
- VS Code REST 예제: `test.http` (토큰/ID 변수 포함)

## JCloud 배포 실행 방법 (예시)
```bash
npm install
npx prisma migrate deploy
NODE_ENV=production PORT=8080 node src/server.js
# 또는 pm2
pm2 start src/server.js --name bookstore
```

## 기타 참고
- DB 시드 데이터: 사용자 20+, 카테고리 10, 저자 20, 도서 50, 리뷰/댓글/좋아요/장바구니/주문 등 포함(200건 이상).
- API Prefix 없음(`/auth`, `/books` 등 바로 사용).

## 보안/제출 관련 안내
본 GitHub 저장소에는 `.env`, DB 비밀번호, JWT Secret, JCloud 접속 키(.pem/.ppk) 등 민감한 정보는 포함되어 있지 않습니다. 이 파일들은 Classroom 제출용 ZIP에만 포함됩니다.

## 시스템 아키텍처
상세 구조는 `docs/architecture.md` 참고.
