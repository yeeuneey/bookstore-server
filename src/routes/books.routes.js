const express = require("express");
const router = express.Router();
const booksController = require("../controllers/books.controller");

const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");

const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../middlewares/validate");

const {
  bookIdParamSchema,
  bookListQuerySchema,
  createBookSchema,
  updateBookSchema,
} = require("../validators/book.validators");


// ======================================================
// 기본 CRUD
// ======================================================

// GET /books - 도서 목록 조회
router.get(
  "/",
  validateQuery(bookListQuerySchema),
  booksController.getBooks
);

// GET /books/:id - 도서 상세 조회
router.get(
  "/:id",
  validateParams(bookIdParamSchema),
  booksController.getBookById
);

// POST /books - 도서 생성(관리자)
router.post(
  "/",
  authMiddleware,
  adminOnly,
  validateBody(createBookSchema),
  booksController.createBook
);

// PATCH /books/:id - 도서 수정(관리자)
router.patch(
  "/:id",
  authMiddleware,
  adminOnly,
  validateParams(bookIdParamSchema),
  validateBody(updateBookSchema),
  booksController.updateBook
);

// DELETE /books/:id - 도서 삭제(관리자)
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  validateParams(bookIdParamSchema),
  booksController.deleteBook
);



// ======================================================
// 관계형 Sub-resource
// ======================================================

// GET /books/:id/reviews - 해당 도서의 리뷰 목록
router.get(
  "/:id/reviews",
  validateParams(bookIdParamSchema),
  booksController.getBookReviews
);

// GET /books/:id/categories - 해당 도서의 카테고리 목록
router.get(
  "/:id/categories",
  validateParams(bookIdParamSchema),
  booksController.getBookCategories
);

// GET /books/:id/authors - 해당 도서의 저자 목록
router.get(
  "/:id/authors",
  validateParams(bookIdParamSchema),
  booksController.getBookAuthors
);

module.exports = router;
