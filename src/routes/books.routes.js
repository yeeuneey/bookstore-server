// src/routes/books.routes.js
const express = require("express");
const router = express.Router();
const booksController = require("../controllers/books.controller");

// ------------------
// 기본 CRUD
// ------------------
router.get("/", booksController.getBooks);                                   // 도서 목록 조회(검색/정렬/페이지네이션 포함)
router.get("/:id", booksController.getBookById);                             // 단일 도서 상세 조회
router.post("/", booksController.createBook);                                // 도서 생성
router.patch("/:id", booksController.updateBook);                            // 도서 수정
router.delete("/:id", booksController.deleteBook);                           // 도서 삭제

// ------------------
// 관계형 Sub-resource
// ------------------
router.get("/:id/reviews", booksController.getBookReviews);                  // 해당 도서의 리뷰 목록
router.get("/:id/categories", booksController.getBookCategories);            // 해당 도서의 카테고리 목록
router.get("/:id/authors", booksController.getBookAuthors);                  // 해당 도서의 저자 목록

module.exports = router;
