// src/routes/users.routes.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

// ------------------
// 기본 CRUD
// ------------------
router.post("/", usersController.createUser);                               // 회원가입
router.get("/", usersController.getUsers);                                  // 유저 목록
router.get("/:id", usersController.getUserById);                            // 단일 유저 조회
router.patch("/:id", usersController.updateUser);                           // 유저 수정
router.delete("/:id", usersController.deleteUser);                          // 유저 삭제

// ------------------
// 관계형 Sub-resource
// ------------------
router.get("/:id/reviews", usersController.getUserReviews);                 // 유저가 작성한 리뷰 목록
router.get("/:id/comments", usersController.getUserComments);               // 유저가 작성한 리뷰 목록
router.get("/:id/review-likes", usersController.getUserReviewLikes);        // 유저가 좋아요한 리뷰
router.get("/:id/comment-likes", usersController.getUserCommentLikes);      // 유저가 좋아요한 댓글
router.get("/:id/favorites", usersController.getUserFavorites);             // 유저가 찜한 도서 목록
router.get("/:id/carts", usersController.getUserCarts);                     // 유저 장바구니
router.get("/:id/orders", usersController.getUserOrders);                   // 유저 주문 목록

module.exports = router;
