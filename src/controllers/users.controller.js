// src/controllers/users.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const bcrypt = require("bcrypt");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

exports.getMe = async (req, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return res.json(me);
  } catch (err) {
    console.error("Get Me Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   1) 회원가입 (POST /users)
================================================== */
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, gender } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "필수 입력값이 누락되었습니다." });
    }

    // 이메일 중복 체크
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashed, name, gender },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ message: "회원가입 성공", user });
  } catch (err) {
    console.error("Create User Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   2) 유저 목록 조회 + 검색/정렬/페이지네이션 (GET /users)
================================================== */
exports.getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sort = "id",
      order = "asc",
    } = req.query;

    const pageNum = parseInt(page);
    const take = parseInt(limit);
    const skip = (pageNum - 1) * take;

    // 검색 조건
    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sort]: order === "desc" ? "desc" : "asc" },
        skip,
        take,
        select: {
          id: true,
          email: true,
          name: true,
          gender: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      page: pageNum,
      limit: take,
      total,
      users,
    });
  } catch (err) {
    console.error("Get Users Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   3) 개별 유저 조회 (GET /users/:id)
================================================== */
exports.getUserById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Get User Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   4) 유저 수정 (PATCH /users/:id)
================================================== */
exports.updateUser = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, gender } = req.body;

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { name, gender },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        createdAt: true,
      },
    });

    return res.json({ message: "유저 정보 수정 성공", user: updated });
  } catch (err) {
    console.error("Update User Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   5) 유저 삭제 (DELETE /users/:id)
================================================== */
exports.deleteUser = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ message: "유저 삭제 완료" });
  } catch (err) {
    console.error("Delete User Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   6) 관계형: 유저가 작성한 리뷰 (GET /users/:id/reviews)
================================================== */
exports.getUserReviews = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const reviews = await prisma.review.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        book: { select: { id: true, title: true } },
      },
    });

    return res.json({ userId: id, count: reviews.length, reviews });
  } catch (err) {
    console.error("Get User Reviews Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   7) 관계형: 유저의 댓글 목록 (GET /users/:id/comments)
================================================== */
exports.getUserComments = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const comments = await prisma.comment.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        review: { select: { id: true, comment: true } },
      },
    });

    return res.json({ userId: id, count: comments.length, comments });
  } catch (err) {
    console.error("Get User Comments Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   8) 관계형: 유저가 좋아요한 리뷰 (GET /users/:id/review-likes)
================================================== */
exports.getUserReviewLikes = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const likes = await prisma.reviewLike.findMany({
      where: { userId: id },
      include: {
        review: {
          include: {
            book: { select: { id: true, title: true } },
          },
        },
      },
    });

    return res.json({ userId: id, count: likes.length, likes });
  } catch (err) {
    console.error("Get User ReviewLikes Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   9) 관계형: 유저가 좋아요한 댓글 (GET /users/:id/comment-likes)
================================================== */
exports.getUserCommentLikes = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const likes = await prisma.commentLike.findMany({
      where: { userId: id },
      include: {
        comment: {
          include: {
            review: true,
          },
        },
      },
    });

    return res.json({ userId: id, count: likes.length, likes });
  } catch (err) {
    console.error("Get User CommentLikes Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   10) 관계형: 유저의 찜(Favorites)
================================================== */
exports.getUserFavorites = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const favorites = await prisma.favorite.findMany({
      where: { userId: id },
      include: {
        book: { select: { id: true, title: true, price: true } },
      },
    });

    return res.json({ userId: id, count: favorites.length, favorites });
  } catch (err) {
    console.error("Get User Favorites Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   11) 관계형: 유저 장바구니 (GET /users/:id/carts)
================================================== */
exports.getUserCarts = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const carts = await prisma.cart.findMany({
      where: { userId: id },
      include: {
        book: { select: { id: true, title: true, price: true } },
      },
    });

    return res.json({ userId: id, count: carts.length, carts });
  } catch (err) {
    console.error("Get User Carts Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ==================================================
   12) 관계형: 유저 주문 목록 (GET /users/:id/orders)
================================================== */
exports.getUserOrders = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const orders = await prisma.order.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            book: { select: { id: true, title: true, price: true } },
          },
        },
      },
    });

    return res.json({ userId: id, count: orders.length, orders });
  } catch (err) {
    console.error("Get User Orders Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};
