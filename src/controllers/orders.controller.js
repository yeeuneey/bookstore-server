// src/controllers/orders.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 주문 생성 (POST /orders)
=========================================================== */
exports.createOrder = async (req, res, next) => {
  try {
    const { userId, deliveryAddress, items } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const book = await prisma.book.findUnique({ where: { id: item.bookId } });
      if (!book) {
        throw new AppError(
          `bookId=${item.bookId} 도서를 찾을 수 없습니다.`,
          404,
          ERROR_CODES.NOT_FOUND
        );
      }

      const itemPrice = book.price * item.quantity;
      totalPrice += itemPrice;

      orderItemsData.push({
        bookId: item.bookId,
        quantity: item.quantity,
        priceAtPurchase: book.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId,
        deliveryAddress,
        totalPrice,
        orderStatus: "PENDING",
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            book: { select: { id: true, title: true } },
          },
        },
      },
    });

    return res.status(201).json({ message: "주문 생성 완료", order });
  } catch (err) {
    console.error("Create Order Error:", err);
    return next(err);
  }
};

/* ===========================================================
   2) 주문 목록 조회 (GET /orders)
=========================================================== */
exports.getOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "createdAt",
      order = "desc",
    } = req.query;

    const pageNum = Number(page);
    const take = Number(limit);
    const skip = (pageNum - 1) * take;

    const where = search ? { deliveryAddress: { contains: search } } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true } },
          orderItems: {
            include: {
              book: { select: { id: true, title: true, price: true } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      page: pageNum,
      limit: take,
      total,
      orders,
    });
  } catch (err) {
    console.error("Get Orders Error:", err);
    return next(err);
  }
};

/* ===========================================================
   3) 주문 상세 조회 (GET /orders/:id)
=========================================================== */
exports.getOrderById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        orderItems: {
          include: {
            book: { select: { id: true, title: true, price: true } },
          },
        },
      },
    });

    if (!order) {
      throw new AppError("주문을 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }
    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      throw new AppError(
        "본인 또는 관리자만 조회할 수 있습니다.",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }
    return res.json(order);
  } catch (err) {
    console.error("Get Order Error:", err);
    return next(err);
  }
};

/* ===========================================================
   4) 주문 상태 변경 (PATCH /orders/:id)
=========================================================== */
exports.updateOrder = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { orderStatus } = req.body;

    const exists = await prisma.order.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("주문을 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      throw new AppError(
        "본인 또는 관리자만 수정할 수 있습니다.",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { orderStatus },
    });

    return res.json({ message: "주문 상태 변경 완료", order: updated });
  } catch (err) {
    console.error("Update Order Error:", err);
    return next(err);
  }
};

/* ===========================================================
   5) 주문 삭제 (DELETE /orders/:id)
=========================================================== */
exports.deleteOrder = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.order.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("주문을 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      throw new AppError(
        "본인 또는 관리자만 삭제할 수 있습니다.",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    await prisma.order.delete({ where: { id } });

    return res.json({ message: "주문 삭제 완료" });
  } catch (err) {
    console.error("Delete Order Error:", err);
    return next(err);
  }
};

/* ===========================================================
   6) 특정 사용자의 주문 목록 (GET /orders/user/:userId)
=========================================================== */
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            book: { select: { id: true, title: true, price: true } },
          },
        },
      },
    });

    return res.json({ userId, count: orders.length, orders });
  } catch (err) {
    console.error("Get User Orders Error:", err);
    return next(err);
  }
};

