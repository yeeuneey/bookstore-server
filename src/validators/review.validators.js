const { z } = require("zod");

exports.reviewIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

exports.reviewListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
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
