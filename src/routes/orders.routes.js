// src/routes/orders.routes.js
const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");
const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");
const { selfOrAdminByBody, selfOrAdminByParam } = require("../middlewares/ownership");

// ------------------
// 기본 CRUD
// ------------------
router.post("/", authMiddleware, selfOrAdminByBody("userId"), ordersController.createOrder);                         // 주문 생성
router.get("/", authMiddleware, adminOnly, ordersController.getOrders);                                              // 주문 목록 조회
router.get("/user/:userId", authMiddleware, selfOrAdminByParam("userId"), ordersController.getUserOrders);           // 특정 유저의 주문 목록
router.get("/:id", authMiddleware, ordersController.getOrderById);                                                   // 단일 주문 상세 조회
router.patch("/:id", authMiddleware, ordersController.updateOrder);                     // 주문 상태 변경
router.delete("/:id", authMiddleware, ordersController.deleteOrder);                    // 주문 삭제

// ------------------
// 유저별 주문 목록
// ------------------
router.get("/user/:userId", ordersController.getUserOrders);            // 특정 유저의 주문 목록

module.exports = router;
