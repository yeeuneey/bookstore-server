const { z } = require("zod");

exports.bookIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

exports.bookListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().regex(/^[a-zA-Z0-9_]+,(ASC|DESC)$/i).default("createdAt,DESC"),
  keyword: z.string().optional(),
  category: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

exports.createBookSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다."),
  isbn: z.string().min(5, "ISBN이 너무 짧습니다."),
  price: z.coerce.number().nonnegative("가격은 0 이상이어야 합니다."),
  publisher: z.string().min(1, "출판사는 필수입니다."),
  summary: z.string().optional(),
  publicationDate: z.string().datetime().optional(),
  categoryIds: z.array(z.coerce.number().int().positive()).optional(),
  authorIds: z.array(z.coerce.number().int().positive()).optional(),
});

exports.updateBookSchema = exports.createBookSchema.partial();

exports.popularBooksQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
