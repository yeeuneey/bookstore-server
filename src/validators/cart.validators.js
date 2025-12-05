const { z } = require("zod");

exports.cartIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

exports.cartUserParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

exports.cartListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().regex(/^[a-zA-Z0-9_]+,(ASC|DESC)$/i).default("createdAt,DESC"),
  keyword: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

exports.createCartItemSchema = z.object({
  userId: z.coerce.number().int().positive(),
  bookId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1, "수량은 최소 1 이상이어야 합니다."),
});

exports.updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1, "수량은 최소 1 이상이어야 합니다."),
});
