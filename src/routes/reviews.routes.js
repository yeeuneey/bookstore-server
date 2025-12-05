// src/routes/reviews.routes.js
const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");
const { authMiddleware } = require("../middlewares/auth");
const { selfOrAdminByBody } = require("../middlewares/ownership");

// ------------------
// 기본 CRUD
// ------------------
router.post("/", authMiddleware, selfOrAdminByBody("userId"), reviewsController.createReview);                        // 리뷰 작성
router.get("/", reviewsController.getReviews);                                                                        // 리뷰 목록
router.get("/:id", reviewsController.getReviewById);                                                                  // 단일 리뷰 조회
router.patch("/:id", authMiddleware, reviewsController.updateReview);                                                 // 리뷰 수정
router.delete("/:id", authMiddleware, reviewsController.deleteReview);                                                // 리뷰 삭제

// ------------------
// 관계형 Sub-resource
// ------------------
router.get("/:id/comments", reviewsController.getReviewComments);        // 리뷰의 댓글 목록
router.get("/:id/likes", reviewsController.getReviewLikes);              // 리뷰의 좋아요 목록

module.exports = router;
