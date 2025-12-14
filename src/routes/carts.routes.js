const express = require("express");
const router = express.Router();
const cartsController = require("../controllers/carts.controller");

const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");
const { selfOrAdminByParam, selfOrAdminByBody } = require("../middlewares/ownership");
const { validateBody, validateParams, validateQuery } = require("../middlewares/validate");

const { createCartItemSchema, updateCartItemSchema, cartIdParamSchema, cartUserParamSchema, cartListQuerySchema } =
  require("../validators/cart.validators");

/**
 * @swagger
 * tags:
 *   name: carts
 *   description: 장바구니 관련 API
 */

/**
 * @swagger
 * /carts:
 *   post:
 *     tags: [carts]
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
 *         description: 장바구니 추가 완료
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItem'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.post("/", authMiddleware, selfOrAdminByBody("userId"), validateBody(createCartItemSchema), cartsController.createCartItem);

/**
 * @swagger
 * /carts:
 *   get:
 *     tags: [carts]
 *     summary: 전체 사용자 장바구니 목록 (관리자)
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
 *         schema: { type: string, example: "createdAt,DESC" }
 *     responses:
 *       200:
 *         description: 정렬된 장바구니 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CartItem'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       404:
 *         $ref: '#/components/responses/Error404'
 */
router.get("/", authMiddleware, adminOnly, validateQuery(cartListQuerySchema), cartsController.getCartItems);

/**
 * @swagger
 * /carts/user/{userId}:
 *   get:
 *     tags: [carts]
 *     summary: 내 장바구니 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: 사용자의 장바구니
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
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.get(
  "/user/:userId",
  authMiddleware,
  selfOrAdminByParam("userId"),
  validateParams(cartUserParamSchema),
  cartsController.getUserCartItems
);

/**
 * @swagger
 * /carts/{cartId}:
 *   patch:
 *     tags: [carts]
 *     summary: 내 장바구니 아이템 수량 수정
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
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
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.patch("/:id", authMiddleware, validateParams(cartIdParamSchema), validateBody(updateCartItemSchema), cartsController.updateCartItem);

/**
 * @swagger
 * /carts/{cartId}:
 *   delete:
 *     tags: [carts]
 *     summary: 장바구니 아이템 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema: { type: integer, example: 10 }
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
 *                   example: "장바구니에서 제거되었습니다."
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.delete("/:id", authMiddleware, validateParams(cartIdParamSchema), cartsController.deleteCartItem);

module.exports = router;
