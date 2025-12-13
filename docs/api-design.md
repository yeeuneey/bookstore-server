# Bookstore API Design

## 기본 정보
- Base URL: 기본적으로 `http://localhost:8080` (`PORT` 환경변수로 변경 가능).
- 모든 요청/응답은 `application/json`; 날짜는 ISO-8601 문자열 사용.
- 인증: `Authorization: Bearer <accessToken>` 헤더. Access Token 만료 1h, Refresh Token 만료 7d (`/auth/refresh`로 재발급).
- 권한: 기본 USER, 관리 전용 엔드포인트는 ADMIN. 일부 엔드포인트는 “본인 혹은 ADMIN” 검증을 수행.

## 공통 규칙
- 페이지네이션/정렬(목록 공통): `page`(1 기준), `size`, `sort=field,ASC|DESC`.
- 검색/필터: 다수의 목록 API가 `keyword`, `dateFrom`, `dateTo` 등을 지원(아래 표 참조).
- 오류 응답: `{ timestamp, path, status, code, message, details? }` 형식으로 반환.
- 데이터 유효성 검증: Zod 스키마 기반. 잘못된 입력 시 400/422 계열 에러.

## 주요 도메인 모델(요약)
- User: `id, email, password, name, role(USER|ADMIN), gender?, refreshToken?, bannedAt?, createdAt...`
- Book: `id, title, isbn, price, publisher?, summary?, publicationDate?, authors[], categories[]`
- Review: `id, userId, bookId, rating(1~5), comment?, createdAt...`
- Comment: `id, reviewId, userId, comment, createdAt...`
- Cart: `id, userId, bookId, quantity, createdAt...`
- Order: `id, userId, orderStatus(PENDING|SHIPPED|DELIVERED|CANCELLED), totalPrice, deliveryAddress, orderItems[]`
- 기타: Favorite(사용자-도서), BookAuthor, BookCategory 등 연결 테이블.

## 인증(Auth)
| Method | Path | Auth | 요청 본문 | 응답/비고 |
| --- | --- | --- | --- | --- |
| POST | `/auth/login` | 공개 | `{ email, password }` | `{ accessToken, refreshToken, user }` 반환. |
| POST | `/auth/refresh` | 공개 | `{ refreshToken }` | 새 `accessToken` 발급. |
| POST | `/auth/logout` | 공개 | `{ userId }` | 토큰 무효화는 없으며 성공 메시지 반환. |

## 사용자(Users)
| Method | Path | Auth/권한 | 요청 | 응답/비고 |
| --- | --- | --- | --- | --- |
| POST | `/users` | 공개 | `{ email, password, name, gender? }` | 회원가입, 중복 이메일 시 409. |
| GET | `/users/me` | USER/ADMIN | - | 로그인 사용자의 프로필. |
| GET | `/users` | ADMIN | `page,size,sort,keyword,role,dateFrom,dateTo` | 사용자 목록(페이지네이션). |
| GET | `/users/:id` | 본인 또는 ADMIN | Path `id` | 단일 사용자 프로필. |
| PATCH | `/users/:id` | 본인 또는 ADMIN | `{ email?, password?, name?, gender? }` | 이메일 변경 시 중복 검사. |
| DELETE | `/users/:id` | 본인 또는 ADMIN | Path `id` | 사용자 삭제. |
| GET | `/users/:id/reviews` | 본인 또는 ADMIN | - | 사용자가 작성한 리뷰 배열. |
| GET | `/users/:id/comments` | 본인 또는 ADMIN | - | 사용자가 작성한 댓글 배열. |
| GET | `/users/:id/favorites` | 본인 또는 ADMIN | - | 즐겨찾기 도서 목록. |
| GET | `/users/:id/carts` | 본인 또는 ADMIN | - | 사용자의 장바구니 품목. |
| GET | `/users/:id/orders` | 본인 또는 ADMIN | - | 사용자의 주문 목록. |

## 도서(Books)
| Method | Path | Auth/권한 | 요청 | 응답/비고 |
| --- | --- | --- | --- | --- |
| GET | `/books` | 공개 | `page,size,sort,keyword,category,dateFrom,dateTo` | 도서 목록(+저자/카테고리/리뷰 포함). |
| GET | `/books/:id` | 공개 | Path `id` | 도서 상세(+저자, 카테고리, 리뷰). |
| POST | `/books` | USER/ADMIN (토큰 필요) | `{ title, isbn, price, publisher?, summary?, publicationDate?, categoryIds?, authorIds? }` | ISBN 중복 시 409. |
| PATCH | `/books/:id` | USER/ADMIN (토큰 필요) | 위 필드 부분 업데이트 | 저자/카테고리는 전체 재설정. |
| DELETE | `/books/:id` | USER/ADMIN (토큰 필요) | Path `id` | 도서 삭제. |
| GET | `/books/:id/reviews` | 공개 | Path `id` | 특정 도서의 리뷰 목록. |
| GET | `/books/:id/categories` | 공개 | Path `id` | 도서-카테고리 매핑 목록. |
| GET | `/books/:id/authors` | 공개 | Path `id` | 도서-저자 매핑 목록. |

## 리뷰(Reviews)
| Method | Path | Auth/권한 | 요청 | 응답/비고 |
| --- | --- | --- | --- | --- |
| POST | `/reviews` | USER/ADMIN & 본인 userId | `{ userId, bookId, rating(1~5), comment? }` | 리뷰 생성. |
| GET | `/reviews` | 공개 | `page,size,sort,keyword,rating,dateFrom,dateTo` | 리뷰 목록(작성자/도서 포함). |
| GET | `/reviews/:id` | 공개 | Path `id` | 리뷰 상세. |
| PATCH | `/reviews/:id` | 작성자 또는 ADMIN | `{ rating?, comment? }` | 부분 수정. |
| DELETE | `/reviews/:id` | 작성자 또는 ADMIN | Path `id` | 리뷰 삭제. |
| GET | `/reviews/:id/comments` | 공개 | Path `id` | 해당 리뷰의 댓글 목록. |

## 댓글(Comments)
| Method | Path | Auth/권한 | 요청 | 응답/비고 |
| --- | --- | --- | --- | --- |
| POST | `/comments` | USER/ADMIN & 본인 userId | `{ userId, reviewId, comment }` | 댓글 작성. |
| GET | `/comments` | 공개 | `page,size,sort,keyword,dateFrom,dateTo` | 댓글 목록(작성자/리뷰 포함). |
| GET | `/comments/:id` | 공개 | Path `id` | 댓글 상세. |
| PATCH | `/comments/:id` | 작성자 또는 ADMIN | `{ comment }` | 내용 수정. |
| DELETE | `/comments/:id` | 작성자 또는 ADMIN | Path `id` | 댓글 삭제. |

## 장바구니(Carts)
| Method | Path | Auth/권한 | 요청 | 응답/비고 |
| --- | --- | --- | --- | --- |
| POST | `/carts` | USER/ADMIN & 본인 userId | `{ userId, bookId, quantity }` | 기존 항목 있으면 수량 누적 후 반환. |
| GET | `/carts` | ADMIN | `page,size,sort,userName,userEmail,bookTitle,dateFrom,dateTo` | 전체 장바구니 목록. |
| GET | `/carts/user/:userId` | 본인 또는 ADMIN | Path `userId` | 특정 사용자의 장바구니. |
| GET | `/carts/:id` | 작성자 또는 ADMIN | Path `id` | 장바구니 항목 상세. |
| PATCH | `/carts/:id` | 작성자 또는 ADMIN | `{ quantity }` | 수량 변경. |
| DELETE | `/carts/:id` | 작성자 또는 ADMIN | Path `id` | 항목 삭제. |

## 주문(Orders)
| Method | Path | Auth/권한 | 요청 | 응답/비고 |
| --- | --- | --- | --- | --- |
| POST | `/orders` | USER/ADMIN | `{ userId, deliveryAddress, items:[{ bookId, quantity }] }` | 총액 계산 후 주문/주문항목 생성. |
| GET | `/orders` | ADMIN | `page,size,sort,keyword,status,dateFrom,dateTo` | 전체 주문 목록. |
| GET | `/orders/user/:userId` | USER/ADMIN | Path `userId` | 사용자 주문 배열. |
| GET | `/orders/:id` | 주문자 또는 ADMIN | Path `id` | 주문 상세(주문자/항목 포함). |
| PATCH | `/orders/:id` | 주문자 또는 ADMIN | `{ orderStatus }` | 상태 변경(PENDING/SHIPPED/DELIVERED/CANCELLED). |
| DELETE | `/orders/:id` | 주문자 또는 ADMIN | Path `id` | 주문 삭제. |

## 관리자(Admin)
| Method | Path | 권한 | 요청 | 응답/비고 |
| --- | --- | --- | --- | --- |
| GET | `/admin/users` | ADMIN | `page,size,sort,keyword,role,dateFrom,dateTo` | 전체 사용자 목록(0 또는 1 기반 page 허용). |
| PATCH | `/admin/users/:id/ban` | ADMIN | Path `id` | `bannedAt` 설정, 이미 차단 시 409. |
| GET | `/admin/statistics/orders` | ADMIN | - | `totalOrders`, `totalSales`, `topBooks`(주문 수량 상위 5) 통계. |

## 헬스체크/루트
| Method | Path | Auth | 설명 |
| --- | --- | --- | --- |
| GET | `/` | 공개 | `{ status:"ok", message }` 서버 상태. |
| GET | `/health` | 공개 | 애플리케이션 헬스 및 `timestamp`. |
| GET | `/health/db` | 공개 | DB 커넥션 확인(성공/실패 JSON). |

## 사용 팁
- Swagger UI: `/docs`, 스펙 JSON: `/docs.json`.
- 보호 자원 호출 시 `Authorization` 헤더 필수. self-or-admin 제약이 있는 엔드포인트는 `userId` 파라미터가 토큰의 `id`와 일치해야 한다.
- 정렬 필드는 `field,DESC|ASC` 형태; 필터 날짜는 ISO-8601 문자열을 사용.
