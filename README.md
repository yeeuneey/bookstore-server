# Bookstore Server

## 프로젝트 개요
- Express + Prisma + MySQL 기반 온라인 서점 백엔드 API.
- 도서 조회/생성/수정/삭제, 리뷰·댓글 CRUD, 즐겨찾기/장바구니/주문 흐름, 관리자 통계(주문 집계, 사용자 차단) 제공.
- JWT 인증과 역할 기반 접근 제어(ROLE_USER, ROLE_ADMIN), Zod 스키마로 요청 검증, Swagger UI로 전체 API 문서화.

## 실행 방법
- 로컬 실행 (마이그레이션/시드 포함):
```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start 
```

## JCloud 배포 실행 방법
```bash
npm install
npx prisma migrate deploy
NODE_ENV=production PORT=8080 node src/server.js
# 또는 pm2
pm2 start src/server.js --name bookstore
```

## 환경변수 설명 (.env.example 기준)
- `DATABASE_URL` : Prisma에서 사용하는 DB URL (`mysql://USER:PASSWORD@HOST:PORT/DBNAME`).
- `PORT` : 서버 포트(기본 8080).
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` : 액세스/리프레시 토큰 서명 키.
- `MYSQL_ROOT_PASSWORD` / `MYSQL_DATABASE` / `MYSQL_USER` / `MYSQL_PASSWORD` / `MYSQL_PORT` : docker-compose용 MySQL 설정.
- `SWAGGER_SERVER_URL`(선택) : Swagger 서버 표시용 URL. 미설정 시 `http://localhost:4000` 이므로 실제 포트에 맞게 설정 권장.
- API Root: 루트(`/`) 기준.
- Swagger 스키마 소스: `src/docs/swagger.js`

## jcloud 배포/접속 주소
- Base URL: `http://113.198.66.68:10012`
- Swagger: `http://113.198.66.68:10012/docs`
- Health: `http://113.198.66.68:10012/health`
![Health 체크 화면](docs/헬스체크200.png)

## Automated Tests (Node test)
- 러너: Node 내장 테스트 러너(`node --test`), 명령은 `npm test` (`node --test --test-concurrency=1 tests`).
- 준비: `.env`에 `DATABASE_URL`, `JWT_*`, `PORT` 등 설정 후 `npx prisma migrate deploy` → `node prisma/seed.js`.
- 실행: `npm test` (테스트 서버를 포트 0에서 띄워 내부 fetch로 API 호출).
- DB 의존: MySQL이 열려 있어야 하고, 시드된 계정 비밀번호가 테스트 기대값과 일치해야 함.
- CI: GitHub Actions 워크플로에서 install → migrate → generate → seed → lint/test/build 순으로 자동 실행.
- 기대/권한: 기본적으로 관리자(`admin@example.com / P@ssw0rd!`)와 일반 사용자(`user1@example.com / P@ssw0rd!`) 토큰을 사용해 200(성공)/403·401(권한 부족·미인증)/404(리소스 없음) 응답을 검증함. 시드/DB가 어긋나면 인증 단계에서 401 등으로 실패할 수 있음.
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

## 역할/권한 표 
| 구분 | 비로그인 | 일반 사용자(본인 기준) | 관리자 |
| --- | --- | --- | --- |
| 공용 | - `GET /health`, `GET /health/db`<br>- `POST /auth/login`, `POST /auth/refresh`<br>- `POST /users` 회원가입<br>- 도서 공개 조회: `GET /books`, `/books/popular`, `/books/:id`, `/books/:id/reviews`, `/books/:id/categories`, `/books/:id/authors` | 동일 | 동일 |
| 본인 전용 (selfOrAdmin*) | - | - 내 정보: `GET /users/me`, `GET/PATCH/DELETE /users/:id`<br>- 내 부가정보: `GET /users/:id/reviews`, `/users/:id/comments`, `/users/:id/favorites`, `/users/:id/carts`, `/users/:id/orders`<br>- 장바구니: `POST /carts`, `GET /carts/user/:userId`, `PATCH/DELETE /carts/:id`<br>- 주문: `POST /orders`, `GET /orders/user/:userId`, `PATCH/DELETE /orders/:id`<br>- 리뷰/댓글: `POST /reviews`, `PATCH/DELETE /reviews/:id`, `POST /comments`, `PATCH/DELETE /comments/:id` | selfOrAdmin 미들웨어로 본인 제약 없이 모두 가능 |
| 관리자 전용 | - | - | - 사용자 관리: `GET /admin/users`, `PATCH /admin/users/:id/ban`, `GET /users`(목록)<br>- 도서 관리: `POST/PATCH/DELETE /books`<br>- 주문·장바구니 전체 조회: `GET /orders`, `GET /carts`<br>- 통계: `GET /admin/statistics/orders` |

## 예제 계정 (prisma/seed.js)
- 관리자: `admin@example.com / P@ssw0rd!`
- 기본 사용자: `user1@example.com / P@ssw0rd!`
- 추가 사용자: `user2@example.com / P@ssw0rd!` … `user20@example.com / P@ssw0rd!`

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

## 엔드포인트
- Health: `GET /health`, `GET /health/db`
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Users: `POST /users`, `GET /users/me`, `GET|PATCH|DELETE /users/:id`, `GET /users`(admin)
- Books: `GET /books`, `GET /books/popular`, `GET /books/:id`, `POST|PATCH|DELETE /books`, `GET /books/:id/reviews|categories|authors`
  - 인기 도서: `GET /books/popular?limit=10` (limit 기본 10, 최대 50)
- Reviews: `POST /reviews`, `GET /reviews`, `GET|PATCH|DELETE /reviews/:id`, `GET /reviews/:id/comments`
- Comments: `POST /comments`, `GET /comments`, `GET|PATCH|DELETE /comments/:id`
- Carts: `POST /carts`, `GET /carts`(admin), `GET /carts/user/:userId`, `GET|PATCH|DELETE /carts/:id`
- Orders: `POST /orders`, `GET /orders`(admin), `GET /orders/user/:userId`, `GET|PATCH|DELETE /orders/:id`
- Admin: `GET /admin/users`, `PATCH /admin/users/:id/ban`, `GET /admin/statistics/orders`

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

## 기타 참고
- DB 시드 데이터: 사용자 20+, 카테고리 10, 저자 20, 도서 50, 리뷰/댓글/좋아요/장바구니/주문 등 포함(200건 이상).

## 시스템 아키텍처
상세 구조는 `docs/architecture.md` 참고.
## Cache
- In-memory cache added for book list/detail, categories/authors, and popular books endpoint to reduce DB load.
- Toggle via `CACHE_ENABLED` (default true) and TTL via `CACHE_TTL_SECONDS` (seconds, default 300) in `.env`.
- Cache invalidates automatically on book create/update/delete; popular list cache expires after a few minutes.

## 성능/보안 고려사항
- `helmet`, `cors`, `express.json()` 기본 보안/JSON 설정, `morgan` 대체 `requestLogger`로 요청 추적(요청 ID 포함).
- JWT 만료(access 1h, refresh 7d)와 Bearer 인증, 역할 체크 미들웨어(`adminOnly`, `selfOrAdmin*`).
- Zod 스키마 기반 바디/쿼리/파라미터 검증, Prisma에서 유니크 제약/관계 정의.
- Swagger(OpenAPI 3.0)로 문서화 및 예제/에러 응답 스키마 제공.
- Prisma `include`/`select`로 리뷰·댓글·연관 도서 조회 시 N+1 최소화, 필요한 필드만 조회해 응답/쿼리 최적화.

## 한계와 개선 계획
- 로그아웃 시 refresh 토큰 무효화/블랙리스트 미구현 → 토큰 저장소 또는 로테이션 도입 필요.
- 부하/보안: Rate limiting, 요청 크기 제한, 쿼리 최적화 인덱스 추가 검토.
