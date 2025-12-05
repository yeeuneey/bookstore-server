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


// ======================================================
// 기본 CRUD
// ======================================================

// POST /reviews - 리뷰 작성
router.post(
  "/",
  authMiddleware,
  validateBody(createReviewSchema),
  selfOrAdminByBody("userId"),
  reviewsController.createReview
);

// GET /reviews - 리뷰 목록 조회
router.get(
  "/",
  validateQuery(reviewListQuerySchema),
  reviewsController.getReviews
);

// GET /reviews/:id - 리뷰 상세 조회
router.get(
  "/:id",
  validateParams(reviewIdParamSchema),
  reviewsController.getReviewById
);

// PATCH /reviews/:id - 리뷰 수정(작성자 또는 관리자)
router.patch(
  "/:id",
  authMiddleware,
  validateParams(reviewIdParamSchema),
  validateBody(updateReviewSchema),
  reviewsController.updateReview
);

// DELETE /reviews/:id - 리뷰 삭제(작성자 또는 관리자)
router.delete(
  "/:id",
  authMiddleware,
  validateParams(reviewIdParamSchema),
  reviewsController.deleteReview
);



// ======================================================
// 관계형 Sub-resource
// ======================================================

// GET /reviews/:id/comments - 해당 리뷰의 댓글 목록
router.get(
  "/:id/comments",
  validateParams(reviewIdParamSchema),
  reviewsController.getReviewComments
);

// GET /reviews/:id/likes - 해당 리뷰의 좋아요 목록
router.get(
  "/:id/likes",
  validateParams(reviewIdParamSchema),
  reviewsController.getReviewLikes
);

module.exports = router;
