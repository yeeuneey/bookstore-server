# Architecture Overview

## 계층 구조
- **Entrypoint**: `src/server.js`에서 `app.js`를 불러 HTTP 서버를 시작.
- **App 구성**: `app.js`가 Express 인스턴스를 생성하고 공통 미들웨어(CORS, Helmet, JSON 파서, 로거), Swagger(`/docs`, `/docs.json`), 라우터, 에러 핸들러를 연결.
- **Routing Layer**: `src/routes/**/*.routes.js`에서 도메인별 엔드포인트 선언. 경로 ↔ 컨트롤러 매핑 및 인증/인가/검증 미들웨어 연결.
- **Controller Layer**: `src/controllers/*.controller.js`가 비즈니스 로직을 담당. 입력 파라미터 처리, 권한 체크, Prisma 호출, 응답 포맷팅.
- **Service/DB Access**: 별도 서비스 계층 없이 컨트롤러가 `src/lib/prisma.js`를 통해 Prisma Client를 직접 호출.
- **Validation**: `src/validators/*.validators.js`에서 Zod 스키마 정의. `src/middlewares/validate.js`가 각 스키마로 요청을 검사.
- **Auth/Ownership**: `src/middlewares/auth.js`에서 JWT 검증 및 `req.user` 세팅, `src/middlewares/ownership.js`에서 본인/관리자 확인.
- **Admin Guard**: `src/middlewares/admin.js`에서 ADMIN 역할만 접근 허용.
- **Error Handling**: `src/middlewares/errorHandler.js`에서 AppError/일반 에러를 JSON 응답으로 변환하고 `src/utils/logger.js`로 로깅.
- **Swagger Docs**: `src/docs/swagger.js`가 Swagger 스펙을 생성하며, 라우트 파일의 JSDoc 어노테이션을 스캔.
- **Config**: `.env`를 `dotenv`로 로드, Prisma는 `prisma/schema.prisma`와 `prisma.config.ts`를 사용.

## 디렉터리 의존성 흐름
`server.js` → `app.js`
`app.js` → `routes/*` → `controllers/*` → `lib/prisma` → DB
`app.js` → `middlewares/*` (auth, admin, ownership, validate, requestLogger, errorHandler)
`controllers/*` → `utils/*` (AppError, errorCodes, logger)
`routes/*` → `validators/*` (입력 검증)
`app.js` → `docs/swagger.js` → `routes/*.js`, `app.js` (주석 스캔)

## 모듈 요약
- `src/lib/prisma.js`: Prisma Client 초기화 및 단일 인스턴스 제공.
- `src/utils/`: `AppError`, `errorCodes`, `logger` 등 공용 유틸.
- `src/middlewares/`: 인증/인가, 입력 검증, 로깅, 에러 처리.
- `src/routes/`: 도메인별 라우터(Admin, Auth, Books, Carts, Orders, Reviews, Comments, Users).
- `src/controllers/`: 각 도메인의 비즈니스 로직. (서비스 계층 없이 컨트롤러에서 바로 DB 접근)
- `src/docs/`: Swagger 스펙 생성기.
- `prisma/`: Prisma 스키마와 시드/마이그레이션.
- `docs/`: 설계 문서(`api-design.md`, `db-schema.md`, 본 파일).

## 요청 라이프사이클 (예시)
1) 클라이언트 → Express 라우트(`routes/*.routes.js`)
2) 인증/인가 미들웨어(`auth`, `admin`, `ownership`)
3) 입력 검증(`validate` + Zod 스키마)
4) 컨트롤러에서 비즈니스 처리 + Prisma DB 액세스
5) 성공 응답 또는 예외 발생 시 `AppError` → `errorHandler` → JSON 에러 응답 및 로깅

## 참고
- Swagger UI: `/docs`, 스펙 JSON: `/docs.json`.
- 헬스체크: `/health`, `/health/db`.
