const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateBody } = require("../middlewares/validate");
const { loginSchema, refreshSchema, logoutSchema } = require("../validators/auth.validators");

router.post("/login", validateBody(loginSchema), authController.login);          // 로그인
router.post("/refresh", validateBody(refreshSchema), authController.refresh);    // 토큰 재발급
router.post("/logout", validateBody(logoutSchema), authController.logout);       // 로그아웃

module.exports = router;
