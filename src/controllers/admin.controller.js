require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 전체 사용자 목록 조회 (GET /admin/users)
=========================================================== */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bannedAt: true,
        createdAt: true,
      },
    });

    return res.json({ count: users.length, users });
  } catch (err) {
    console.error("Admin Get Users Error:", err);
    return next(err);
  }
};

/* ===========================================================
   2) 특정 사용자 정지 처리 (PATCH /admin/users/:id/ban)
=========================================================== */
exports.banUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError(
        "유저를 찾을 수 없습니다.",
        404,
        ERROR_CODES.NOT_FOUND
      );
    }

    if (user.bannedAt) {
      throw new AppError(
        "이미 정지된 유저입니다.",
        409,
        ERROR_CODES.CONFLICT
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { bannedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        bannedAt: true,
      },
    });

    return res.json({ message: "정지 처리 완료", user: updated });
  } catch (err) {
    console.error("Ban User Error:", err);
    return next(err);
  }
};

/* ===========================================================
   3) 주문 통계 조회 (GET /admin/statistics/orders)
=========================================================== */
exports.getOrderStatistics = async (req, res, next) => {
  try {
    // 오늘 기준 통계 or 전체 통계
    const totalOrders = await prisma.order.count();

    const totalSalesData = await prisma.order.aggregate({
      _sum: { totalPrice: true },
    });

    const totalSales = totalSalesData._sum.totalPrice || 0;

    // 가장 많이 주문된 책 TOP 5
    const topBooks = await prisma.orderItem.groupBy({
      by: ["bookId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    // bookId → title 맵핑
    const bookIds = topBooks.map((b) => b.bookId);

    const books = await prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { id: true, title: true },
    });

    const mergedTopBooks = topBooks.map((tb) => ({
      bookId: tb.bookId,
      title: books.find((b) => b.id === tb.bookId)?.title || "Unknown",
      totalQuantity: tb._sum.quantity,
    }));

    return res.json({
      totalOrders,
      totalSales,
      topBooks: mergedTopBooks,
    });
  } catch (err) {
    console.error("Order Statistics Error:", err);
    return next(err);
  }
};

