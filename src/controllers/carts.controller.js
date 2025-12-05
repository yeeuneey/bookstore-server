// src/controllers/carts.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 장바구니 추가 (POST /carts)
=========================================================== */
exports.createCartItem = async (req, res, next) => {
  try {
    const { userId, bookId, quantity } = req.body;

    if (!userId || !bookId || !quantity) {
      return res.status(400).json({ message: "필수 항목 누락" });
    }

    // 유저/도서 검증
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ message: "도서를 찾을 수 없습니다." });

    // 이미 장바구니에 존재할 경우 수량 증가
    const exists = await prisma.cart.findFirst({
      where: { userId, bookId },
    });

    if (exists) {
      const updated = await prisma.cart.update({
        where: { id: exists.id },
        data: { quantity: exists.quantity + quantity },
      });
      return res.json({ message: "장바구니 수량 증가", item: updated });
    }

    // 새 장바구니 항목 생성
    const item = await prisma.cart.create({
      data: { userId, bookId, quantity },
    });

    return res.status(201).json({ message: "장바구니 추가 완료", item });
  } catch (err) {
    console.error("Create Cart Error:", err);
    return next(err);
  }
};

/* ===========================================================
   2) 장바구니 목록 조회 (GET /carts)
      - 검색(도서명)
      - 정렬
      - 페이지네이션
=========================================================== */
exports.getCartItems = async (req, res, next) => {
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

    const where = search
      ? { book: { title: { contains: search } } }
      : {};

    const [items, total] = await Promise.all([
      prisma.cart.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true } },
          book: { select: { id: true, title: true, price: true } },
        },
      }),
      prisma.cart.count({ where }),
    ]);

    return res.json({
      page: pageNum,
      limit: take,
      total,
      items,
    });
  } catch (err) {
    console.error("Get Cart Items Error:", err);
    return next(err);
  }
};

/* ===========================================================
   3) 장바구니 단일 조회 (GET /carts/:id)
=========================================================== */
exports.getCartItemById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.cart.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        book: { select: { id: true, title: true, price: true } },
      },
    });

    if (!item) {
      return res.status(404).json({ message: "장바구니 항목을 찾을 수 없습니다." });
    }
    if (req.user.role !== "ADMIN" && item.userId !== req.user.id) {
      throw new AppError("본인 또는 관리자만 접근할 수 있습니다.", 403, "FORBIDDEN");
    }

    return res.json(item);
  } catch (err) {
    console.error("Get Cart Item Error:", err);
    return next(err);
  }
};

/* ===========================================================
   4) 장바구니 수량 수정 (PATCH /carts/:id)
=========================================================== */
exports.updateCartItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { quantity } = req.body;

    if (!quantity) {
      return res.status(400).json({ message: "수량(quantity)은 필수입니다." });
    }

    const exists = await prisma.cart.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ message: "장바구니 항목을 찾을 수 없습니다." });
    }
    if (req.user.role !== "ADMIN" && item.userId !== req.user.id) {
      throw new AppError("본인 또는 관리자만 접근할 수 있습니다.", 403, "FORBIDDEN");
    }

    const updated = await prisma.cart.update({
      where: { id },
      data: { quantity },
    });

    return res.json({ message: "장바구니 수정 완료", item: updated });
  } catch (err) {
    console.error("Update Cart Item Error:", err);
    return next(err);
  }
};

/* ===========================================================
   5) 장바구니 항목 삭제 (DELETE /carts/:id)
=========================================================== */
exports.deleteCartItem = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.cart.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ message: "장바구니 항목을 찾을 수 없습니다." });
    }
    if (req.user.role !== "ADMIN" && item.userId !== req.user.id) {
      throw new AppError("본인 또는 관리자만 접근할 수 있습니다.", 403, "FORBIDDEN");
    }

    await prisma.cart.delete({ where: { id } });

    return res.json({ message: "장바구니 항목 삭제 완료" });
  } catch (err) {
    console.error("Delete Cart Item Error:", err);
    return next(err);
  }
};

/* ===========================================================
   6) 특정 유저의 장바구니 조회 (GET /carts/user/:userId)
=========================================================== */
exports.getUserCartItems = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const items = await prisma.cart.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        book: { select: { id: true, title: true, price: true } },
      },
    });

    return res.json({ userId, count: items.length, items });
  } catch (err) {
    console.error("Get User Cart Error:", err);
    return next(err);
  }
};
