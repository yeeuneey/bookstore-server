const { z } = require("zod");

exports.orderIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

exports.orderUserParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

exports.orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().regex(/^[a-zA-Z0-9_]+,(ASC|DESC)$/i).default("createdAt,DESC"),
  keyword: z.string().optional(),
  status: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

exports.createOrderSchema = z.object({
  userId: z.coerce.number().int().positive(),
  deliveryAddress: z.string().min(1, "배송 주소는 필수입니다."),
  items: z.array(
    z.object({
      bookId: z.coerce.number().int().positive(),
      quantity: z.coerce.number().int().min(1, "수량은 최소 1 이상이어야 합니다."),
    })
  ).min(1, "주문 항목은 최소 1개 이상이어야 합니다."),
});

exports.updateOrderSchema = z.object({
  orderStatus: z.enum(["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});
