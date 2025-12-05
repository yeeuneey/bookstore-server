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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 회원 정보 및 활동
 */

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: 회원가입
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateInput'
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "회원가입이 완료되었습니다."
 *                 user:
 *                   $ref: '#/components/schemas/User'
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
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.post("/", validateBody(createUserSchema), usersController.createUser);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: 내 프로필 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그인된 사용자 정보
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get("/me", authMiddleware, usersController.getMe);

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: 전체 사용자 목록 (관리자)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1, minimum: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, example: 20, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "id,ASC" }
 *       - in: query
 *         name: keyword
 *         schema: { type: string, example: "hong" }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: ["USER", "ADMIN"], example: "USER" }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time, example: "2024-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time, example: "2024-12-31T23:59:59.000Z" }
 *     responses:
 *       200:
 *         description: 페이징된 사용자 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginationMeta'
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       422:
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       404:
 *         $ref: '#/components/responses/Error404'
 */
router.get(
  "/",
  authMiddleware,
  adminOnly,
  validateQuery(userListQuerySchema),
  usersController.getUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: 특정 사용자 상세 (본인 혹은 관리자)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 사용자 상세
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       422:
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserById
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: 사용자 정보 수정 (본인 혹은 관리자)
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
 *             $ref: '#/components/schemas/UserUpdateInput'
 *     responses:
 *       200:
 *         description: 수정된 사용자 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       422:
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.patch(
  "/:id",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  validateBody(updateUserSchema),
  usersController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: 사용자 삭제 (관리자)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
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
 *                   example: "사용자가 삭제되었습니다."
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.delete(
  "/:id",
  authMiddleware,
  validateParams(userIdParamSchema),
  adminOnly,
  usersController.deleteUser
);

/**
 * @swagger
 * /users/{id}/reviews:
 *   get:
 *     tags: [Users]
 *     summary: 사용자가 작성한 리뷰 목록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 리뷰 배열
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
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/reviews",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserReviews
);

/**
 * @swagger
 * /users/{id}/comments:
 *   get:
 *     tags: [Users]
 *     summary: 사용자가 작성한 댓글 목록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 댓글 배열
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
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/comments",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserComments
);

/**
 * @swagger
 * /users/{id}/review-likes:
 *   get:
 *     tags: [Users]
 *     summary: 사용자가 좋아요한 리뷰 목록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 좋아요한 리뷰 ID 목록
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
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/review-likes",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserReviewLikes
);

/**
 * @swagger
 * /users/{id}/comment-likes:
 *   get:
 *     tags: [Users]
 *     summary: 사용자가 좋아요한 댓글 목록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 좋아요한 댓글 목록
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
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/comment-likes",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserCommentLikes
);

/**
 * @swagger
 * /users/{id}/favorites:
 *   get:
 *     tags: [Users]
 *     summary: 사용자의 즐겨찾기 도서 목록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 도서 배열
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/favorites",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserFavorites
);

/**
 * @swagger
 * /users/{id}/carts:
 *   get:
 *     tags: [Users]
 *     summary: 사용자의 장바구니 목록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 장바구니 아이템 배열
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/carts",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserCarts
);

/**
 * @swagger
 * /users/{id}/orders:
 *   get:
 *     tags: [Users]
 *     summary: 사용자의 주문 목록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 주문 배열
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error422'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/:id/orders",
  authMiddleware,
  validateParams(userIdParamSchema),
  selfOrAdminByParam("id"),
  usersController.getUserOrders
);

module.exports = router;
