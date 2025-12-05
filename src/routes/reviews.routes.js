const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");

const { authMiddleware } = require("../middlewares/auth");
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middlewares/validate");

const {
  createReviewSchema,
  updateReviewSchema,
  reviewIdParamSchema,
  reviewListQuerySchema,
} = require("../validators/review.validators");

const { selfOrAdminByBody } = require("../middlewares/ownership");

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 리뷰 작성 및 조회
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: 리뷰 작성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewCreateInput'
 *     responses:
 *       201:
 *         description: 생성된 리뷰
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
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
  validateBody(createReviewSchema),
  selfOrAdminByBody("userId"),
  reviewsController.createReview
);

/**
 * @swagger
 * /reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: 리뷰 목록 조회
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1, minimum: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, example: 20, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "createdAt,DESC" }
 *       - in: query
 *         name: keyword
 *         schema: { type: string, example: "좋아요" }
 *       - in: query
 *         name: rating
 *         schema: { type: integer, example: 5 }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time, example: "2024-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time, example: "2024-12-31T23:59:59.000Z" }
 *     responses:
 *       200:
 *         description: 리뷰 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 */
router.get("/", validateQuery(reviewListQuerySchema), reviewsController.getReviews);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: 리뷰 상세 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 리뷰 상세
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
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
  "/:id",
  validateParams(reviewIdParamSchema),
  reviewsController.getReviewById
);

/**
 * @swagger
 * /reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: 리뷰 수정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewUpdateInput'
 *     responses:
 *       200:
 *         description: 수정된 리뷰
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
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
router.patch(
  "/:id",
  authMiddleware,
  validateParams(reviewIdParamSchema),
  validateBody(updateReviewSchema),
  reviewsController.updateReview
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: 리뷰 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "리뷰가 삭제되었습니다."
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
  validateParams(reviewIdParamSchema),
  reviewsController.deleteReview
);

/**
 * @swagger
 * /reviews/{id}/comments:
 *   get:
 *     tags: [Reviews]
 *     summary: 리뷰에 달린 댓글 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 댓글 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
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
  "/:id/comments",
  validateParams(reviewIdParamSchema),
  reviewsController.getReviewComments
);

/**
 * @swagger
 * /reviews/{id}/likes:
 *   get:
 *     tags: [Reviews]
 *     summary: 리뷰 좋아요 목록
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 좋아요 수/사용자 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId: { type: integer }
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
  "/:id/likes",
  validateParams(reviewIdParamSchema),
  reviewsController.getReviewLikes
);

module.exports = router;
