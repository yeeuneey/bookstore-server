// src/routes/orders.routes.js
const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/orders.controller");

// ------------------
// 기본 CRUD
// ------------------
router.post("/", ordersController.createOrder);                         // 주문 생성
router.get("/", ordersController.getOrders);                            // 주문 목록 조회(검색/정렬/페이지네이션)
router.get("/:id", ordersController.getOrderById);                      // 단일 주문 상세 조회
router.patch("/:id", ordersController.updateOrder);                     // 주문 상태 변경
router.delete("/:id", ordersController.deleteOrder);                    // 주문 삭제

// ------------------
// 유저별 주문 목록
// ------------------
router.get("/user/:userId", ordersController.getUserOrders);            // 특정 유저의 주문 목록

module.exports = router;
