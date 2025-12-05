// src/routes/carts.routes.js
const express = require("express");
const router = express.Router();
const cartsController = require("../controllers/carts.controller");
const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");
const { selfOrAdminByBody, selfOrAdminByParam } = require("../middlewares/ownership");

// ------------------
// 기본 CRUD
// ------------------
router.post("/", authMiddleware, selfOrAdminByBody("userId"), cartsController.createCartItem);                               // 장바구니 추가
router.get("/", authMiddleware, adminOnly, cartsController.getCartItems);                                                    // 장바구니 전체 조회
router.get("/user/:userId", authMiddleware, selfOrAdminByParam("userId"), cartsController.getUserCartItems);                 // 특정 유저의 장바구니 목록
router.get("/:id", authMiddleware, cartsController.getCartItemById);                                                         // 장바구니 단일 항목 조회
router.patch("/:id", authMiddleware, cartsController.updateCartItem);                                                        // 장바구니 수량 수정
router.delete("/:id", authMiddleware, cartsController.deleteCartItem);                                                       // 장바구니 항목 삭제

module.exports = router;
