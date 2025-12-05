const { z } = require("zod");

exports.cartIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

exports.cartUserParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

exports.cartListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

exports.createCartItemSchema = z.object({
  userId: z.coerce.number().int().positive(),
  bookId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1, "수량은 최소 1 이상이어야 합니다."),
});

exports.updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, "수량은 최소 1 이상이어야 합니다."),
});
