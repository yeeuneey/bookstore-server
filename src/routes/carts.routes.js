const express = require("express");
const router = express.Router();
const cartsController = require("../controllers/carts.controller");

const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");

const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middlewares/validate");

const {
  createCartItemSchema,
  updateCartItemSchema,
  cartIdParamSchema,
  cartUserParamSchema,
  cartListQuerySchema,
} = require("../validators/cart.validators");

/**
 * @swagger
 * tags:
 *   name: Carts
 *   description: 장바구니 관련 API
 */

/**
 * @swagger
 * /carts:
 *   post:
 *     tags: [Carts]
 *     summary: 장바구니에 상품 추가
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartCreateInput'
 *     responses:
 *       201:
 *         description: 장바구니 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 */
router.post(
  "/",
  authMiddleware,
  validateBody(createCartItemSchema),
  cartsController.createCartItem
);

/**
 * @swagger
 * /carts:
 *   get:
 *     tags: [Carts]
 *     summary: 전체 장바구니 목록 (관리자)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, example: 20 }
 *     responses:
 *       200:
 *         description: 페이징된 장바구니 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 */
router.get(
  "/",
  authMiddleware,
  adminOnly,
  validateQuery(cartListQuerySchema),
  cartsController.getCartItems
);

/**
 * @swagger
 * /carts/user/{userId}:
 *   get:
 *     tags: [Carts]
 *     summary: 특정 사용자의 장바구니 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: 사용자 장바구니
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 */
router.get(
  "/user/:userId",
  authMiddleware,
  validateParams(cartUserParamSchema),
  cartsController.getUserCartItems
);

/**
 * @swagger
 * /carts/{id}:
 *   get:
 *     tags: [Carts]
 *     summary: 장바구니 아이템 단건 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: 단일 장바구니 아이템
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 */
router.get(
  "/:id",
  authMiddleware,
  validateParams(cartIdParamSchema),
  cartsController.getCartItemById
);

/**
 * @swagger
 * /carts/{id}:
 *   patch:
 *     tags: [Carts]
 *     summary: 장바구니 수량 수정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 10 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartUpdateInput'
 *     responses:
 *       200:
 *         description: 수정된 장바구니 아이템
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 */
router.patch(
  "/:id",
  authMiddleware,
  validateParams(cartIdParamSchema),
  validateBody(updateCartItemSchema),
  cartsController.updateCartItem
);

/**
 * @swagger
 * /carts/{id}:
 *   delete:
 *     tags: [Carts]
 *     summary: 장바구니 아이템 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 10 }
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
 *                   example: "장바구니에서 제거되었습니다."
 */
router.delete(
  "/:id",
  authMiddleware,
  validateParams(cartIdParamSchema),
  cartsController.deleteCartItem
);

module.exports = router;
