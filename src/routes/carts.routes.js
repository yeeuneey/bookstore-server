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


// ======================================================
// 기본 CRUD
// ======================================================

// POST /carts - 장바구니 추가
router.post(
  "/",
  authMiddleware,
  validateBody(createCartItemSchema),
  cartsController.createCartItem
);

// GET /carts - 전체 장바구니 목록(관리자)
router.get(
  "/",
  authMiddleware,
  adminOnly,
  validateQuery(cartListQuerySchema),
  cartsController.getCartItems
);

// GET /carts/user/:userId - 유저 장바구니 조회
router.get(
  "/user/:userId",
  authMiddleware,
  validateParams(cartUserParamSchema),
  cartsController.getUserCartItems
);

// GET /carts/:id - 장바구니 단일 항목 조회
router.get(
  "/:id",
  authMiddleware,
  validateParams(cartIdParamSchema),
  cartsController.getCartItemById
);

// PATCH /carts/:id - 장바구니 항목 수정
router.patch(
  "/:id",
  authMiddleware,
  validateParams(cartIdParamSchema),
  validateBody(updateCartItemSchema),
  cartsController.updateCartItem
);

// DELETE /carts/:id - 장바구니 항목 삭제
router.delete(
  "/:id",
  authMiddleware,
  validateParams(cartIdParamSchema),
  cartsController.deleteCartItem
);

module.exports = router;
