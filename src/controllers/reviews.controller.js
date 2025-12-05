// src/controllers/reviews.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 리뷰 생성 (POST /reviews)
=========================================================== */
exports.createReview = async (req, res) => {
  try {
    const { userId, bookId, rating, comment } = req.body;

    if (!userId || !bookId || !rating) {
      return res.status(400).json({ message: "필수 항목 누락" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) return res.status(404).json({ message: "도서를 찾을 수 없습니다." });

    const review = await prisma.review.create({
      data: { userId, bookId, rating, comment },
    });

    return res.status(201).json({ message: "리뷰 작성 완료", review });
  } catch (err) {
    console.error("Create Review Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   2) 리뷰 목록 조회 (GET /reviews)
      - 검색
      - 정렬
      - 페이지네이션
      - 관계 include (도서명/작성자)
=========================================================== */
exports.getReviews = async (req, res) => {
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
      ? { comment: { contains: search } }
      : {};

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
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   3) 리뷰 상세 조회 (GET /reviews/:id)
=========================================================== */
exports.getReviewById = async (req, res) => {
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
      return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
    }

    return res.json(review);
  } catch (err) {
    console.error("Get Review Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   4) 리뷰 수정 (PATCH /reviews/:id)
=========================================================== */
exports.updateReview = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rating, comment } = req.body;

    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      return res.status(403).json({ message: "본인 또는 관리자만 수정/삭제할 수 있습니다." });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });

    return res.json({ message: "리뷰 수정 완료", review: updated });
  } catch (err) {
    console.error("Update Review Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   5) 리뷰 삭제 (DELETE /reviews/:id)
=========================================================== */
exports.deleteReview = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.review.findUnique({ where: { id } });
    if (!exists)
      return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      return res.status(403).json({ message: "본인 또는 관리자만 수정/삭제할 수 있습니다." });
    }

    await prisma.review.delete({ where: { id } });

    return res.json({ message: "리뷰 삭제 완료" });
  } catch (err) {
    console.error("Delete Review Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   6) 리뷰의 댓글 목록 (GET /reviews/:id/comments)
=========================================================== */
exports.getReviewComments = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review)
      return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });

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
    return res.status(500).json({ message: "서버 오류" });
  }
};

/* ===========================================================
   7) 리뷰의 좋아요 목록 (GET /reviews/:id/likes)
=========================================================== */
exports.getReviewLikes = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review)
      return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });

    const likes = await prisma.reviewLike.findMany({
      where: { reviewId: id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ reviewId: id, count: likes.length, likes });
  } catch (err) {
    console.error("Get Review Likes Error:", err);
    return res.status(500).json({ message: "서버 오류" });
  }
};
