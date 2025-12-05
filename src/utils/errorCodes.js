// 표준 에러 코드 정의 (최소 10종 이상)
module.exports.ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST", // 400 요청 형식이 올바르지 않음
  VALIDATION_FAILED: "VALIDATION_FAILED", // 400 필드 유효성 검사 실패
  INVALID_QUERY_PARAM: "INVALID_QUERY_PARAM", // 400 쿼리 파라미터 값이 잘못됨
  UNAUTHORIZED: "UNAUTHORIZED", // 401 인증 토큰 없음 또는 잘못된 토큰
  TOKEN_EXPIRED: "TOKEN_EXPIRED", // 401 토큰 만료
  FORBIDDEN: "FORBIDDEN", // 403 접근 권한 없음 (Role 불일치 등)
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND", // 404 요청한 리소스가 존재하지 않음
  USER_NOT_FOUND: "USER_NOT_FOUND", // 404 사용자 ID가 존재하지 않음
  DUPLICATE_RESOURCE: "DUPLICATE_RESOURCE", // 409 중복 데이터 존재(이메일 중복 등)
  STATE_CONFLICT: "STATE_CONFLICT", // 409 리소스 상태 충돌(이미 삭제된 항목 등)
  UNPROCESSABLE_ENTITY: "UNPROCESSABLE_ENTITY", // 422 처리할 수 없는 요청 내용(형식은 맞지만 논리적 오류)
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS", // 429 요청 한도 초과 (rate limiting)
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR", // 500 서버 내부 오류
  DATABASE_ERROR: "DATABASE_ERROR", // 500 DB 연동 오류
  UNKNOWN_ERROR: "UNKNOWN_ERROR", // 500 알 수 없는 오류 (최종 fallback)
};
