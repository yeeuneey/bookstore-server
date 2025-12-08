require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 전체 사용자 목록 조회 (GET /admin/users)
      - 지원 필터: keyword(이메일/이름), role, dateFrom/dateTo
      - 정렬: sort=field,DESC|ASC (기본 createdAt,DESC)
      - 페이지: page(0 또는 1 입력 시 첫 페이지), size
=========================================================== */
exports.getAllUsers = async (req, res, next) => {
  try {
    const pageRaw = Number(req.query.page ?? 0);
    const sizeRaw = Number(req.query.size ?? 20);
    const pageInput = Number.isFinite(pageRaw) && pageRaw >= 0 ? pageRaw : 0;
    const size = Number.isFinite(sizeRaw) && sizeRaw > 0 ? sizeRaw : 20;
    const page = pageInput > 0 ? pageInput - 1 : 0; // 1부터 입력해도 첫 페이지로 해석
    const skip = page * size;

    const keyword = req.query.keyword?.trim();
    const roleRaw = req.query.role?.toUpperCase();
    const role =
      roleRaw && ["USER", "ADMIN"].includes(roleRaw) ? roleRaw : undefined;

    const parseDate = (value) => {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const fromDate = parseDate(req.query.dateFrom);
    const toDate = parseDate(req.query.dateTo);

    const [sortFieldRaw, sortDirRaw] = (req.query.sort || "createdAt,DESC").split(
      ","
    );
    const allowedSort = ["id", "email", "name", "createdAt", "updatedAt"];
    const sortField = allowedSort.includes(sortFieldRaw)
      ? sortFieldRaw
      : "createdAt";
    const sortDirection =
      (sortDirRaw || "DESC").toLowerCase() === "asc" ? "asc" : "desc";

    const where = {
      ...(keyword
        ? {
            OR: [
              { email: { contains: keyword } },
              { name: { contains: keyword } },
            ],
          }
        : {}),
      ...(role ? { Role: role } : {}),
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: toDate } : {}),
            },
          }
        : {}),
    };

    const [total, usersRaw] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { [sortField]: sortDirection },
        skip,
        take: size,
        select: {
          id: true,
          email: true,
          name: true,
          Role: true,
          bannedAt: true,
          createdAt: true,
        },
      }),
    ]);

    const users = usersRaw.map(({ Role, ...rest }) => ({
      ...rest,
      role: Role,
    }));

    const totalPages = total > 0 ? Math.ceil(total / size) : 0;

    return res.json({
      page: pageInput,
      size,
      total,
      totalPages,
      users,
    });
  } catch (err) {
    req.log.error("Admin Get Users Error:", { error: err });
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
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    if (user.bannedAt) {
      throw new AppError(
        "이미 정지된 유저입니다.",
        409,
        ERROR_CODES.DUPLICATE_RESOURCE
      );
    }

    const updatedRaw = await prisma.user.update({
      where: { id },
      data: { bannedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        Role: true,
        bannedAt: true,
      },
    });

    const { Role, ...restUpdated } = updatedRaw;
    const updated = { ...restUpdated, role: Role };

    return res.json({ message: "정지 처리 완료", user: updated });
  } catch (err) {
    req.log.error("Ban User Error:", { error: err });
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
    req.log.error("Order Statistics Error:", { error: err });
    return next(err);
  }
};
