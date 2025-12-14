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

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: 도서 조회 및 관리
 */

/**
 * @swagger
 * /books:
 *   get:
 *     tags: [Books]
 *     summary: 도서 목록 조회
 *     description: >
 *       Example: GET /books?page=1&size=5&sort=price,ASC&keyword=샘플&category=IT&dateFrom=2023-01-01T00:00:00.000Z&dateTo=2030-12-31T23:59:59.000Z
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, example: 5 }
 *       - in: query
 *         name: keyword
 *         schema: { type: string, example: "샘플" }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "price,ASC" }
 *       - in: query
 *         name: category
 *         schema: { type: string, example: "IT" }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time, example: "2023-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time, example: "2030-12-31T23:59:59.000Z" }
 *     responses:
 *       200:
 *         description: 도서 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page: { type: integer }
 *                 size: { type: integer }
 *                 total: { type: integer }
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 */
router.get("/", validateQuery(bookListQuerySchema), booksController.getBooks);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: 도서 상세 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *     responses:
 *       200:
 *         description: 도서 상세
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       500:
 *         $ref: '#/components/responses/Error500'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       422:
 *         $ref: '#/components/responses/Error400'
 */
router.get("/:id", validateParams(bookIdParamSchema), booksController.getBookById);

/**
 * @swagger
 * /books:
 *   post:
 *     tags: [Books]
 *     summary: 도서 생성 (관리자)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookCreateInput'
 *     responses:
 *       201:
 *         description: 생성된 도서
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       409:
 *         $ref: '#/components/responses/Error409'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.post(
  "/",
  authMiddleware,
  adminOnly,
  validateBody(createBookSchema),
  booksController.createBook
);

/**
 * @swagger
 * /books/{id}:
 *   patch:
 *     tags: [Books]
 *     summary: 도서 수정 (관리자)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookUpdateInput'
 *     responses:
 *       200:
 *         description: 수정된 도서
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.patch(
  "/:id",
  authMiddleware,
  adminOnly,
  validateParams(bookIdParamSchema),
  validateBody(updateBookSchema),
  booksController.updateBook
);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: 도서 삭제 (관리자)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *     responses:
 *       200:
 *         description: 삭제 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "도서가 삭제되었습니다."
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  validateParams(bookIdParamSchema),
  booksController.deleteBook
);

/**
 * @swagger
 * /books/{id}/reviews:
 *   get:
 *     tags: [Books]
 *     summary: 도서에 달린 리뷰 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *     responses:
 *       200:
 *         description: 리뷰 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/reviews",
  validateParams(bookIdParamSchema),
  booksController.getBookReviews
);

/**
 * @swagger
 * /books/{id}/categories:
 *   get:
 *     tags: [Books]
 *     summary: 도서 카테고리 목록
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *     responses:
 *       200:
 *         description: 카테고리 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/categories",
  validateParams(bookIdParamSchema),
  booksController.getBookCategories
);

/**
 * @swagger
 * /books/{id}/authors:
 *   get:
 *     tags: [Books]
 *     summary: 도서 저자 목록
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 101 }
 *     responses:
 *       200:
 *         description: 저자 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   author:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/authors",
  validateParams(bookIdParamSchema),
  booksController.getBookAuthors
);

module.exports = router;
