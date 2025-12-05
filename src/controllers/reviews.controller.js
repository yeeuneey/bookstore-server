// src/controllers/reviews.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 리뷰 생성 (POST /reviews)
=========================================================== */
exports.createReview = async (req, res, next) => {
  try {
    const { userId, bookId, rating, comment } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new AppError("도서를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    const review = await prisma.review.create({
      data: { userId, bookId, rating, comment },
    });

    return res.status(201).json({ message: "리뷰 작성 완료", review });
  } catch (err) {
    console.error("Create Review Error:", err);
    return next(err);
  }
};

/* ===========================================================
   2) 리뷰 목록 조회 (GET /reviews)
=========================================================== */
exports.getReviews = async (req, res, next) => {
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

    const where = search ? { comment: { contains: search } } : {};

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true } },
          book: { select: { id: true, title: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return res.json({
      page: pageNum,
      limit: take,
      total,
      reviews,
    });
  } catch (err) {
    console.error("Get Reviews Error:", err);
    return next(err);
  }
};

/* ===========================================================
   3) 리뷰 상세 조회 (GET /reviews/:id)
=========================================================== */
exports.getReviewById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        book: { select: { id: true, title: true } },
      },
    });

    if (!review) {
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    return res.json(review);
  } catch (err) {
    console.error("Get Review Error:", err);
    return next(err);
  }
};

/* ===========================================================
   4) 리뷰 수정 (PATCH /reviews/:id)
=========================================================== */
exports.updateReview = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rating, comment } = req.body;

    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      throw new AppError(
        "본인 또는 관리자만 수정/삭제할 수 있습니다.",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });

    return res.json({ message: "리뷰 수정 완료", review: updated });
  } catch (err) {
    console.error("Update Review Error:", err);
    return next(err);
  }
};

/* ===========================================================
   5) 리뷰 삭제 (DELETE /reviews/:id)
=========================================================== */
exports.deleteReview = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      throw new AppError(
        "본인 또는 관리자만 수정/삭제할 수 있습니다.",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    await prisma.review.delete({ where: { id } });

    return res.json({ message: "리뷰 삭제 완료" });
  } catch (err) {
    console.error("Delete Review Error:", err);
    return next(err);
  }
};

/* ===========================================================
   6) 리뷰의 댓글 목록 (GET /reviews/:id/comments)
=========================================================== */
exports.getReviewComments = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    const comments = await prisma.comment.findMany({
      where: { reviewId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ reviewId: id, count: comments.length, comments });
  } catch (err) {
    console.error("Get Review Comments Error:", err);
    return next(err);
  }
};

/* ===========================================================
   7) 리뷰 좋아요 목록 (GET /reviews/:id/likes)
=========================================================== */
exports.getReviewLikes = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    const likes = await prisma.reviewLike.findMany({
      where: { reviewId: id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ reviewId: id, count: likes.length, likes });
  } catch (err) {
    console.error("Get Review Likes Error:", err);
    return next(err);
  }
};

