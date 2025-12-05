const { z } = require("zod");

exports.commentIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

exports.commentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

exports.createCommentSchema = z.object({
  userId: z.coerce.number().int().positive(),
  reviewId: z.coerce.number().int().positive(),
  comment: z.string().min(1, "댓글 내용은 필수입니다."),
});

exports.updateCommentSchema = z.object({
  comment: z.string().min(1, "댓글 내용은 필수입니다."),
});
