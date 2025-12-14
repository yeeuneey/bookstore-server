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
 *   name: orders
 *   description: 주문 생성 및 관리
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [orders]
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
 *     tags: [orders]
 *     summary: 전체 사용자 주문 목록 (관리자)
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
 *       - in: query
 *         name: keyword
 *         schema: { type: string, example: "전주" }
 *       - in: query
 *         name: status
 *         schema: { type: string, example: "PENDING" }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time, example: "2025-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time, example: "2025-12-31T23:59:59.000Z" }
 *     responses:
 *       200:
 *         description: 주문 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
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
router.get("/", authMiddleware, adminOnly, validateQuery(orderListQuerySchema), ordersController.getOrders);

/**
 * @swagger
 * /orders/user/{userId}:
 *   get:
 *     tags: [orders]
 *     summary: 사용자의 주문 목록
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
  validateParams(orderUserParamSchema),
  ordersController.getUserOrders
);

/**
 * @swagger
 * /orders/{orderId}:
 *   patch:
 *     tags: [orders]
 *     summary: 주문 상태 변경 (관리자)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
router.patch(
  "/:id",
  authMiddleware,
  adminOnly,
  validateParams(orderIdParamSchema),
  validateBody(updateOrderSchema),
  ordersController.updateOrder
);

/**
 * @swagger
 * /orders/{orderId}:
 *   delete:
 *     tags: [orders]
 *     summary: 주문 삭제
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *                   example: "주문이 삭제되었습니다."
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
router.delete(
  "/:id",
  authMiddleware,
  validateParams(orderIdParamSchema),
  ordersController.deleteOrder
);

module.exports = router;
