// src/routes/carts.routes.js
const express = require("express");
const router = express.Router();
const cartsController = require("../controllers/carts.controller");

// ------------------
// 기본 CRUD
// ------------------
router.post("/", cartsController.createCartItem);                               // 장바구니 추가
router.get("/", cartsController.getCartItems);                                  // 장바구니 전체 조회(검색/정렬/페이지네이션)
router.get("/:id", cartsController.getCartItemById);                            // 장바구니 단일 항목 조회
router.patch("/:id", cartsController.updateCartItem);                           // 장바구니 수량 수정
router.delete("/:id", cartsController.deleteCartItem);                          // 장바구니 항목 삭제

// ------------------
// 유저별 장바구니 조회
// ------------------
router.get("/user/:userId", cartsController.getUserCartItems);                  // 특정 유저의 장바구니 목록

module.exports = router;
