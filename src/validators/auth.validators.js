const { z } = require("zod");

exports.loginSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
});

exports.refreshSchema = z.object({
  refreshToken: z.string().min(10, "Refresh Token이 비정상입니다."),
});

exports.logoutSchema = z.object({
  userId: z.coerce.number().int().positive("유효한 userId가 아닙니다."),
});
