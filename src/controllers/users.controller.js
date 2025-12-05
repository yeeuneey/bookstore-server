// src/controllers/users.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

exports.getMe = async (req, res, next) => {
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
    req.log.error("Get Me Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   1) 회원가입 (POST /users)
================================================== */
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, name, gender } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new AppError(
        "이미 존재하는 이메일입니다.",
        409,
        ERROR_CODES.DUPLICATE_RESOURCE
      );
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
    req.log.error("Create User Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   2) 사용자 목록 조회 (GET /users)
================================================== */
exports.getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 20,
      sort = "id,ASC",
      keyword,
      role,
      dateFrom,
      dateTo,
    } = req.query;

    const [sortField, sortDirRaw] = String(sort).split(",");
    const sortDirection = sortDirRaw?.toLowerCase() === "desc" ? "desc" : "asc";

    const pageNum = parseInt(page, 10);
    const take = parseInt(size, 10);
    const skip = (pageNum - 1) * take;

    const where = {
      AND: [
        keyword
          ? {
              OR: [
                { email: { contains: keyword } },
                { name: { contains: keyword } },
              ],
            }
          : {},
        role ? { role } : {},
        dateFrom ? { createdAt: { gte: new Date(dateFrom) } } : {},
        dateTo ? { createdAt: { lte: new Date(dateTo) } } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortField || "id"]: sortDirection },
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
      size: take,
      total,
      users,
    });
  } catch (err) {
    req.log.error("Get Users Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   3) 개별 사용자 조회 (GET /users/:id)
================================================== */
exports.getUserById = async (req, res, next) => {
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
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    return res.json({ user });
  } catch (err) {
    req.log.error("Get User Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   4) 사용자 수정 (PATCH /users/:id)
================================================== */
exports.updateUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { name, gender } = req.body;

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
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

    return res.json({ message: "사용자 정보 수정 성공", user: updated });
  } catch (err) {
    req.log.error("Update User Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   5) 사용자 삭제 (DELETE /users/:id)
================================================== */
exports.deleteUser = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ message: "사용자 삭제 완료" });
  } catch (err) {
    req.log.error("Delete User Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   6) 관계형: 사용자가 작성한 리뷰 (GET /users/:id/reviews)
================================================== */
exports.getUserReviews = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    const reviews = await prisma.review.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        book: { select: { id: true, title: true } },
      },
    });

    return res.json({ userId: id, count: reviews.length, reviews });
  } catch (err) {
    req.log.error("Get User Reviews Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   7) 관계형: 사용자가 남긴 댓글 목록 (GET /users/:id/comments)
================================================== */
exports.getUserComments = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    const comments = await prisma.comment.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: {
        review: { select: { id: true, comment: true } },
      },
    });

    return res.json({ userId: id, count: comments.length, comments });
  } catch (err) {
    req.log.error("Get User Comments Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   8) 관계형: 사용자가 좋아한 리뷰 (GET /users/:id/review-likes)
================================================== */
exports.getUserReviewLikes = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

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
    req.log.error("Get User ReviewLikes Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   9) 관계형: 사용자가 좋아한 댓글 (GET /users/:id/comment-likes)
================================================== */
exports.getUserCommentLikes = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

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
    req.log.error("Get User CommentLikes Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   10) 관계형: 사용자 즐겨찾기 목록
================================================== */
exports.getUserFavorites = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: id },
      include: {
        book: { select: { id: true, title: true, price: true } },
      },
    });

    return res.json({ userId: id, count: favorites.length, favorites });
  } catch (err) {
    req.log.error("Get User Favorites Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   11) 관계형: 사용자 장바구니 (GET /users/:id/carts)
================================================== */
exports.getUserCarts = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    const carts = await prisma.cart.findMany({
      where: { userId: id },
      include: {
        book: { select: { id: true, title: true, price: true } },
      },
    });

    return res.json({ userId: id, count: carts.length, carts });
  } catch (err) {
    req.log.error("Get User Carts Error:", { error: err });
    return next(err);
  }
};

/* ==================================================
   12) 관계형: 사용자 주문 목록 (GET /users/:id/orders)
================================================== */
exports.getUserOrders = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

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
    req.log.error("Get User Orders Error:", { error: err });
    return next(err);
  }
};
