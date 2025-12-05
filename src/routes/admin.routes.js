const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authMiddleware } = require("../middlewares/auth");
const { adminOnly } = require("../middlewares/admin");
const { validateParams } = require("../middlewares/validate");
const { userIdParamSchema } = require("../validators/user.validators");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: 관리자 전용 API
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: 전체 사용자 목록 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count: { type: integer, example: 2 }
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get("/users", authMiddleware, adminOnly, adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   patch:
 *     tags: [Admin]
 *     summary: 특정 사용자 차단 처리
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 5 }
 *     responses:
 *       200:
 *         description: 차단 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: "사용자가 차단되었습니다." }
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.patch(
  "/users/:id/ban",
  authMiddleware,
  adminOnly,
  validateParams(userIdParamSchema),
  adminController.banUser
);

/**
 * @swagger
 * /admin/statistics/orders:
 *   get:
 *     tags: [Admin]
 *     summary: 주문 통계 조회
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 주문 집계 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders: { type: integer, example: 120 }
 *                 totalSales: { type: number, example: 524000 }
 *                 topBooks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       bookId: { type: integer }
 *                       title: { type: string }
 *                       totalQuantity: { type: integer }
 */
router.get("/statistics/orders", authMiddleware, adminOnly, adminController.getOrderStatistics);

module.exports = router;
