const { z } = require("zod");

const genderEnum = z.enum(["MALE", "FEMALE"]).optional();
exports.createUserSchema = z.object({
  email: z.string().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
  name: z.string().min(1, "이름은 필수입니다."),
  gender: genderEnum,
});

exports.updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  name: z.string().min(1).optional(),
  gender: genderEnum,
});

exports.userIdParamSchema = z.object({
  id: z.coerce.number().int().positive("유효한 id가 아닙니다."),
});

exports.userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().regex(/^[a-zA-Z0-9_]+,(ASC|DESC)$/i).default("id,ASC"),
  keyword: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});
