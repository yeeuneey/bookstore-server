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
 *     summary: 전체 사용자 목록 조회 (관리자)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 0, example: 1 }
 *         description: 페이지 번호(0 또는 1부터 입력 가능)
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 20, example: 20 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, example: "id,ASC" }
 *         description: 정렬 필드,방향
 *       - in: query
 *         name: keyword
 *         schema: { type: string, example: "hong" }
 *         description: 이메일/이름 검색
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [USER, ADMIN], example: USER }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time, example: "2024-01-01T00:00:00.000Z" }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time, example: "2024-12-31T23:59:59.000Z" }
 *     responses:
 *       200:
 *         description: 사용자 목록 (페이지네이션)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 page: { type: integer, example: 1 }
 *                 size: { type: integer, example: 20 }
 *                 total: { type: integer, example: 153 }
 *                 totalPages: { type: integer, example: 8 }
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
router.get("/users", authMiddleware, adminOnly, adminController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/ban:
 *   patch:
 *     tags: [Admin]
 *     summary: 특정 사용자 차단 처리 (관리자)
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
 *     summary: 주문 통계 조회 (관리자)
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
router.get("/statistics/orders", authMiddleware, adminOnly, adminController.getOrderStatistics);

module.exports = router;
