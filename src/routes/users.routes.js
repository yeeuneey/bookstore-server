// src/routes/users.routes.js
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");
const { selfOrAdminByParam } = require("../middlewares/ownership");

// 현재 로그인한 유저 정보 조회
router.get("/me", authMiddleware, usersController.getMe);

// ------------------
// 기본 CRUD
// ------------------
router.post("/", usersController.createUser);                               // 회원가입
router.get("/me", authMiddleware, usersController.getMe);                   // 내 정보 조회
router.get("/", authMiddleware, adminOnly, usersController.getUsers);                                  // 전체 유저 목록 조회
router.get("/:id", authMiddleware, selfOrAdminByParam("id"), usersController.getUserById);                            // 단일 유저 조회
router.patch("/:id", authMiddleware, selfOrAdminByParam("id"), usersController.updateUser);                           // 유저 정보 수정
router.delete("/:id", authMiddleware, adminOnly, usersController.deleteUser);                          // 유저 삭제

// ------------------
// 관계형 Sub-resource
// ------------------
router.get("/:id/reviews", authMiddleware, selfOrAdminByParam("id"), usersController.getUserReviews);                 // 유저가 작성한 리뷰 목록
router.get("/:id/comments", authMiddleware, selfOrAdminByParam("id"), usersController.getUserComments);               // 유저가 작성한 리뷰 목록
router.get("/:id/review-likes", authMiddleware, selfOrAdminByParam("id"), usersController.getUserReviewLikes);        // 유저가 좋아요한 리뷰
router.get("/:id/comment-likes", authMiddleware, selfOrAdminByParam("id"), usersController.getUserCommentLikes);      // 유저가 좋아요한 댓글
router.get("/:id/favorites", authMiddleware, selfOrAdminByParam("id"), usersController.getUserFavorites);             // 유저가 찜한 도서 목록
router.get("/:id/carts", authMiddleware, selfOrAdminByParam("id"), usersController.getUserCarts);                     // 유저 장바구니
router.get("/:id/orders", authMiddleware, selfOrAdminByParam("id"), usersController.getUserOrders);                   // 유저 주문 목록

module.exports = router;
