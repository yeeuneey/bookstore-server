const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateBody } = require("../middlewares/validate");
const { loginSchema, refreshSchema, logoutSchema } = require("../validators/auth.validators");

/**
 * @swagger
 * tags:
 *   name: auth
 *   description: 인증/인가 및 토큰 발급
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [auth]
 *     summary: 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: user1@example.com
 *             password: P@ssw0rd!
 *     responses:
 *       200:
 *         description: 로그인 후 토큰 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokens'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.post("/login", validateBody(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [auth]
 *     summary: 토큰 재발급
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
 *                   example: "토큰 재발급이 완료되었습니다."
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOi...
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.post("/refresh", validateBody(refreshSchema), authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [auth]
 *     summary: 로그아웃
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
 *         description: 로그아웃 완료
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그아웃 완료"
 *       404:
 *         $ref: '#/components/responses/Error404'
 *       400:
 *         $ref: '#/components/responses/Error400'
 *       401:
 *         $ref: '#/components/responses/Error401'
 *       403:
 *         $ref: '#/components/responses/Error403'
 *       422:
 *         $ref: '#/components/responses/Error400'
 *       500:
 *         $ref: '#/components/responses/Error500'
 */
router.post("/logout", validateBody(logoutSchema), authController.logout);

module.exports = router;
