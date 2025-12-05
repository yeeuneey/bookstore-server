const express = require("express");
const router = express.Router();
const commentsController = require("../controllers/comments.controller");

const { authMiddleware } = require("../middlewares/auth");
const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middlewares/validate");

const {
  createCommentSchema,
  updateCommentSchema,
  commentIdParamSchema,
  commentListQuerySchema,
} = require("../validators/comment.validators");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: 댓글 작성 및 관리
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     tags: [Comments]
 *     summary: 댓글 작성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentCreateInput'
 *     responses:
 *       201:
 *         description: 생성된 댓글
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.post(
  "/",
  authMiddleware,
  validateBody(createCommentSchema),
  commentsController.createComment
);

/**
 * @swagger
 * /comments:
 *   get:
 *     tags: [Comments]
 *     summary: 댓글 목록 조회
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: 댓글 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get(
  "/",
  validateQuery(commentListQuerySchema),
  commentsController.getComments
);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     tags: [Comments]
 *     summary: 댓글 상세 조회
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 8 }
 *     responses:
 *       200:
 *         description: 댓글 상세
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.get(
  "/:id",
  validateParams(commentIdParamSchema),
  commentsController.getCommentById
);

/**
 * @swagger
 * /comments/{id}:
 *   patch:
 *     tags: [Comments]
 *     summary: 댓글 수정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 8 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommentUpdateInput'
 *     responses:
 *       200:
 *         description: 수정된 댓글
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 */
router.patch(
  "/:id",
  authMiddleware,
  validateParams(commentIdParamSchema),
  validateBody(updateCommentSchema),
  commentsController.updateComment
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     tags: [Comments]
 *     summary: 댓글 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 8 }
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
 *                   example: "댓글이 삭제되었습니다."
 */
router.delete(
  "/:id",
  authMiddleware,
  validateParams(commentIdParamSchema),
  commentsController.deleteComment
);

/**
 * @swagger
 * /comments/{id}/likes:
 *   get:
 *     tags: [Comments]
 *     summary: 댓글 좋아요 목록
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 8 }
 *     responses:
 *       200:
 *         description: 좋아요 사용자 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId: { type: integer }
 */
router.get(
  "/:id/likes",
  validateParams(commentIdParamSchema),
  commentsController.getCommentLikes
);

module.exports = router;
