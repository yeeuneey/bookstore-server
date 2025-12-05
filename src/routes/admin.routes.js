const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");

// ------------------
// 관리자 전용 API (3개)
// ------------------
router.get("/users", authMiddleware, adminOnly, adminController.getAllUsers);           // 전체 유저 조회
router.patch("/users/:id/ban", authMiddleware, adminOnly, adminController.banUser);     // 유저 정지 처리
router.get("/statistics/orders", authMiddleware, adminOnly, adminController.getOrderStatistics); // 주문 통계

module.exports = router;
