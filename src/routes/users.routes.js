const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");
const { selfOrAdminByParam } = require("../middlewares/ownership");
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../middlewares/validate");

const {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userListQuerySchema,
} = require("../validators/user.validators");


// ======================================================
// 기본 CRUD
// ======================================================

// POST /users - 회원가입
router.post("/", validateBody(createUserSchema), usersController.createUser);

// GET /users/me - 내 정보 조회
router.get("/me", authMiddleware, usersController.getMe);

// GET /users - 전체 유저 목록 (관리자)
router.get(
  "/",
  authMiddleware,
  adminOnly,
  validateQuery(userListQuerySchema),
  usersController.getUsers
);

// GET /users/:id - 유저 상세 조회 (본인 또는 관리자)
router.get(
  "/:id",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserById
);

// PATCH /users/:id - 유저 수정 (본인 또는 관리자)
router.patch(
  "/:id",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  validateBody(updateUserSchema),
  usersController.updateUser
);

// DELETE /users/:id - 유저 삭제 (관리자)
router.delete(
  "/:id",
  authMiddleware,
  validateParams(userIdParamSchema),
  adminOnly,
  usersController.deleteUser
);



// ======================================================
// 관계형 Sub-resource
// ======================================================

// GET /users/:id/reviews - 유저가 작성한 리뷰 목록
router.get(
  "/:id/reviews",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserReviews
);

// GET /users/:id/comments - 유저가 작성한 댓글 목록
router.get(
  "/:id/comments",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserComments
);

// GET /users/:id/review-likes - 유저가 좋아요한 리뷰
router.get(
  "/:id/review-likes",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserReviewLikes
);

// GET /users/:id/comment-likes - 유저가 좋아요한 댓글
router.get(
  "/:id/comment-likes",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserCommentLikes
);

// GET /users/:id/favorites - 유저의 찜 목록
router.get(
  "/:id/favorites",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserFavorites
);

// GET /users/:id/carts - 유저 장바구니 목록
router.get(
  "/:id/carts",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserCarts
);

// GET /users/:id/orders - 유저 주문 목록
router.get(
  "/:id/orders",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserOrders
);

module.exports = router;
