// src/routes/reviews.routes.js
const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviews.controller");

// ------------------
// 기본 CRUD
// ------------------
router.post("/", reviewsController.createReview);                        // 리뷰 작성
router.get("/", reviewsController.getReviews);                           // 리뷰 목록(검색/정렬/페이지네이션)
router.get("/:id", reviewsController.getReviewById);                     // 단일 리뷰 조회
router.patch("/:id", reviewsController.updateReview);                    // 리뷰 수정
router.delete("/:id", reviewsController.deleteReview);                   // 리뷰 삭제

// ------------------
// 관계형 Sub-resource
// ------------------
router.get("/:id/comments", reviewsController.getReviewComments);        // 리뷰의 댓글 목록
router.get("/:id/likes", reviewsController.getReviewLikes);              // 리뷰의 좋아요 목록

module.exports = router;
