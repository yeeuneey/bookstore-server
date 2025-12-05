const { z } = require("zod");

exports.reviewIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

exports.reviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().regex(/^[a-zA-Z0-9_]+,(ASC|DESC)$/i).default("createdAt,DESC"),
  keyword: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

exports.createReviewSchema = z.object({
  userId: z.coerce.number().int().positive(),
  bookId: z.coerce.number().int().positive(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(1, "리뷰 내용은 필수입니다.").optional(),
});

exports.updateReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).optional(),
});
