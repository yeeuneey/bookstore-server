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


// ======================================================
// 기본 CRUD
// ======================================================

// POST /orders - 주문 생성
router.post(
  "/",
  authMiddleware,
  validateBody(createOrderSchema),
  ordersController.createOrder
);

// GET /orders - 전체 주문 목록(관리자)
router.get(
  "/",
  authMiddleware,
  adminOnly,
  validateQuery(orderListQuerySchema),
  ordersController.getOrders
);

// GET /orders/user/:userId - 특정 유저의 주문 목록
router.get(
  "/user/:userId",
  authMiddleware,
  validateParams(orderUserParamSchema),
  ordersController.getUserOrders
);

// GET /orders/:id - 주문 상세 조회
router.get(
  "/:id",
  authMiddleware,
  validateParams(orderIdParamSchema),
  ordersController.getOrderById
);

// PATCH /orders/:id - 주문 상태 변경(관리자)
router.patch(
  "/:id",
  authMiddleware,
  validateParams(orderIdParamSchema),
  validateBody(updateOrderSchema),
  ordersController.updateOrder
);

// DELETE /orders/:id - 주문 삭제(관리자)
router.delete(
  "/:id",
  authMiddleware,
  validateParams(orderIdParamSchema),
  ordersController.deleteOrder
);

module.exports = router;
