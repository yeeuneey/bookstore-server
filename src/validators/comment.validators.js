const { z } = require("zod");

exports.commentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

exports.commentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().regex(/^[a-zA-Z0-9_]+,(ASC|DESC)$/i).default("createdAt,DESC"),
  keyword: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

exports.createCommentSchema = z.object({
  userId: z.coerce.number().int().positive(),
  reviewId: z.coerce.number().int().positive(),
  comment: z.string().min(1, "댓글 내용은 필수입니다."),
});

exports.updateCommentSchema = z.object({
  comment: z.string().min(1, "댓글 내용은 필수입니다."),
});
