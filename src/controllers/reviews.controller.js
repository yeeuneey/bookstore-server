// src/controllers/reviews.controller.js
require("dotenv").config();
const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

/* ===========================================================
   1) 리뷰 생성 (POST /reviews)
=========================================================== */
exports.createReview = async (req, res, next) => {
  try {
    const { userId, bookId, rating, comment } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new AppError("도서를 찾을 수 없습니다.", 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const review = await prisma.review.create({
      data: { userId, bookId, rating, comment },
    });

    return res.status(201).json({ message: "리뷰 작성 완료", review });
  } catch (err) {
    req.log.error("Create Review Error:", { error: err });
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
      size = 20,
      sort = "createdAt,DESC",
      keyword,
      rating,
      dateFrom,
      dateTo,
    } = req.query;

    const [sortField, sortDirRaw] = String(sort).split(",");
    const sortDirection = sortDirRaw?.toLowerCase() === "asc" ? "asc" : "desc";

    const pageNum = Number(page);
    const take = Number(size);
    const skip = (pageNum - 1) * take;

    const where = {
      AND: [
        keyword ? { comment: { contains: keyword } } : {},
        rating ? { rating: Number(rating) } : {},
        dateFrom ? { createdAt: { gte: new Date(dateFrom) } } : {},
        dateTo ? { createdAt: { lte: new Date(dateTo) } } : {},
      ],
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { [sortField || "createdAt"]: sortDirection },
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
      size: take,
      total,
      reviews,
    });
  } catch (err) {
    req.log.error("Get Reviews Error:", { error: err });
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
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    return res.json(review);
  } catch (err) {
    req.log.error("Get Review Error:", { error: err });
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
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.RESOURCE_NOT_FOUND);
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
    req.log.error("Update Review Error:", { error: err });
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
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.RESOURCE_NOT_FOUND);
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
    req.log.error("Delete Review Error:", { error: err });
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
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.RESOURCE_NOT_FOUND);
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
    req.log.error("Get Review Comments Error:", { error: err });
    return next(err);
  }
};
