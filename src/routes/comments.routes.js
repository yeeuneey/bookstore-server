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

const { selfOrAdminByBody } = require("../middlewares/ownership");


// ======================================================
// 기본 CRUD
// ======================================================

// POST /comments - 댓글 작성
router.post(
  "/",
  authMiddleware,
  validateBody(createCommentSchema),
  commentsController.createComment
);

// GET /comments - 댓글 목록 조회
router.get(
  "/",
  validateQuery(commentListQuerySchema),
  commentsController.getComments
);

// GET /comments/:id - 댓글 상세 조회
router.get(
  "/:id",
  validateParams(commentIdParamSchema),
  commentsController.getCommentById
);

// PATCH /comments/:id - 댓글 수정(작성자 또는 관리자)
router.patch(
  "/:id",
  authMiddleware,
  validateParams(commentIdParamSchema),
  validateBody(updateCommentSchema),
  commentsController.updateComment
);

// DELETE /comments/:id - 댓글 삭제(작성자 또는 관리자)
router.delete(
  "/:id",
  authMiddleware,
  validateParams(commentIdParamSchema),
  commentsController.deleteComment
);



// ======================================================
// 관계형 Sub-resource
// ======================================================

// GET /comments/:id/likes - 해당 댓글 좋아요 목록
router.get(
  "/:id/likes",
  validateParams(commentIdParamSchema),
  commentsController.getCommentLikes
);

module.exports = router;
