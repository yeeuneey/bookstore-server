const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");

const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");

const {
  validateBody,
  validateParams,
  validateQuery,
} = require("../middlewares/validate");

const {
  createOrderSchema,
  updateOrderSchema,
  orderIdParamSchema,
  orderUserParamSchema,
  orderListQuerySchema,
} = require("../validators/order.validators");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: 주문 생성 및 관리
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: 주문 생성
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderCreateInput'
 *     responses:
 *       201:
 *         description: 생성된 주문
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.post(
  "/",
  authMiddleware,
  validateBody(createOrderSchema),
  ordersController.createOrder
);

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: 전체 주문 목록 (관리자)
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
 *         description: 주문 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get(
  "/",
  authMiddleware,
  adminOnly,
  validateQuery(orderListQuerySchema),
  ordersController.getOrders
);

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: 특정 사용자의 주문 목록
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: 주문 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get(
  "/user/:userId",
  authMiddleware,
  validateParams(orderUserParamSchema),
  ordersController.getUserOrders
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: 주문 상세 조회
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 10 }
 *     responses:
 *       200:
 *         description: 주문 상세
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.get(
  "/:id",
  authMiddleware,
  validateParams(orderIdParamSchema),
  ordersController.getOrderById
);

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     tags: [Orders]
 *     summary: 주문 상태 변경
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
 *             $ref: '#/components/schemas/OrderUpdateInput'
 *     responses:
 *       200:
 *         description: 변경된 주문
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.patch(
  "/:id",
  authMiddleware,
  validateParams(orderIdParamSchema),
  validateBody(updateOrderSchema),
  ordersController.updateOrder
);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: 주문 삭제
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
 *                   example: "주문이 삭제되었습니다."
 */
router.delete(
  "/:id",
  authMiddleware,
  validateParams(orderIdParamSchema),
  ordersController.deleteOrder
);

module.exports = router;
