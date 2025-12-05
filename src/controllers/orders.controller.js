// src/controllers/orders.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 주문 생성 (POST /orders)
=========================================================== */
exports.createOrder = async (req, res) => {
  try {
    const { userId, deliveryAddress, items } = req.body;

    /**
     * items = [
     *    { bookId: 1, quantity: 2 },
     *    { bookId: 5, quantity: 1 },
     * ]
     */

    if (!userId || !deliveryAddress || !items || items.length === 0) {
      return res.status(400).json({ message: "필수 항목 누락" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    // 총 가격 계산
    let totalPrice = 0;
    const orderItemsData = [];

    for (const item of items) {
      const book = await prisma.book.findUnique({ where: { id: item.bookId } });
      if (!book)
        return res
          .status(404)
          .json({ message: `bookId=${item.bookId} 도서를 찾을 수 없습니다.` });

      const itemPrice = book.price * item.quantity;
      totalPrice += itemPrice;

      orderItemsData.push({
        bookId: item.bookId,
        quantity: item.quantity,
        priceAtPurchase: book.price,
      });
    }

    // 주문 생성 (order + orderItems)
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
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   2) 주문 목록 조회 (GET /orders)
      - 검색(search: 주소)
      - 정렬(sort/order)
      - 페이지네이션
=========================================================== */
exports.getOrders = async (req, res) => {
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
      ? { deliveryAddress: { contains: search } }
      : {};

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
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   3) 단일 주문 상세 조회 (GET /orders/:id)
=========================================================== */
exports.getOrderById = async (req, res) => {
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

    if (!order)
      return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return res.status(403).json({ message: "본인 또는 관리자만 조회할 수 있습니다." });
    }
    return res.json(order);
  } catch (err) {
    console.error("Get Order Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   4) 주문 상태 변경 (PATCH /orders/:id)
=========================================================== */
exports.updateOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({ message: "orderStatus 필수" });
    }

    const exists = await prisma.order.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return res.status(403).json({ message: "본인 또는 관리자만 조회할 수 있습니다." });
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { orderStatus },
    });

    return res.json({ message: "주문 상태 변경 완료", order: updated });
  } catch (err) {
    console.error("Update Order Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   5) 주문 삭제 (DELETE /orders/:id)
=========================================================== */
exports.deleteOrder = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.order.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "주문을 찾을 수 없습니다." });
    if (req.user.role !== "ADMIN" && order.userId !== req.user.id) {
      return res.status(403).json({ message: "본인 또는 관리자만 조회할 수 있습니다." });
    }

    await prisma.order.delete({ where: { id } });

    return res.json({ message: "주문 삭제 완료" });
  } catch (err) {
    console.error("Delete Order Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   6) 특정 유저의 주문 목록 조회 (GET /orders/user/:userId)
=========================================================== */
exports.getUserOrders = async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

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
    return res.status(500).json({ message: "서버 오류" });
  }
};
