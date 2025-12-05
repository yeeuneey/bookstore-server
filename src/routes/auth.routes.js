const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateBody } = require("../middlewares/validate");
const { loginSchema, refreshSchema, logoutSchema } = require("../validators/auth.validators");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 인증/인가 및 토큰 발급
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 이메일과 비밀번호로 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: user@example.com
 *             password: secret123
 *     responses:
 *       200:
 *         description: 로그인 성공 및 토큰 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         description: 잘못된 자격 증명
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", validateBody(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh Token으로 Access Token 재발급
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshInput'
 *           example:
 *             refreshToken: eyJhbGciOi...
 *     responses:
 *       200:
 *         description: 새 Access Token 발급
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "토큰 재발급에 성공했습니다."
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOi...
 *       401:
 *         description: 만료되었거나 위조된 토큰
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/refresh", validateBody(refreshSchema), authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: 현재 사용자의 Refresh Token 무효화
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutInput'
 *           example:
 *             userId: 3
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그아웃 완료"
 *       404:
 *         description: 사용자가 없거나 이미 처리된 경우
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout", validateBody(logoutSchema), authController.logout);

module.exports = router;
