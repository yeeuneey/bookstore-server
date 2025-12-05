// src/controllers/comments.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 댓글 생성 (POST /comments)
=========================================================== */
exports.createComment = async (req, res, next) => {
  try {
    const { userId, reviewId, comment } = req.body;

    if (!userId || !reviewId || !comment) {
      return res.status(400).json({ message: "필수 항목 누락" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) return res.status(404).json({ message: "리뷰를 찾을 수 없습니다." });

    const newComment = await prisma.comment.create({
      data: { userId, reviewId, comment },
    });

    return res.status(201).json({ message: "댓글 생성 완료", comment: newComment });
  } catch (err) {
    console.error("Create Comment Error:", err);
    return next(err);
  }
};

/* ===========================================================
   2) 댓글 목록 조회 + 검색/정렬/페이지네이션 (GET /comments)
=========================================================== */
exports.getComments = async (req, res, next) => {
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

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true } },
          review: { select: { id: true, rating: true } },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    return res.json({
      page: pageNum,
      limit: take,
      total,
      comments,
    });
  } catch (err) {
    console.error("Get Comments Error:", err);
    return next(err);
  }
};

/* ===========================================================
   3) 댓글 상세 조회 (GET /comments/:id)
=========================================================== */
exports.getCommentById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        review: { select: { id: true, rating: true } },
      },
    });

    if (!comment) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }

    return res.json(comment);
  } catch (err) {
    console.error("Get Comment Error:", err);
    return next(err);
  }
};

/* ===========================================================
   4) 댓글 수정 (PATCH /comments/:id)
=========================================================== */
exports.updateComment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { comment } = req.body;

    const exists = await prisma.comment.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      throw new AppError("본인 또는 관리자만 수정/삭제할 수 있습니다.", 403, "FORBIDDEN");
    }
    
    const updated = await prisma.comment.update({
      where: { id },
      data: { comment },
    });

    return res.json({ message: "댓글 수정 완료", comment: updated });
  } catch (err) {
    console.error("Update Comment Error:", err);
    return next(err);
  }
};

/* ===========================================================
   5) 댓글 삭제 (DELETE /comments/:id)
=========================================================== */
exports.deleteComment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.comment.findUnique({ where: { id } });
    if (!exists) {
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
    }
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      throw new AppError("본인 또는 관리자만 수정/삭제할 수 있습니다.", 403, "FORBIDDEN");
    }

    await prisma.comment.delete({ where: { id } });

    return res.json({ message: "댓글 삭제 완료" });
  } catch (err) {
    console.error("Delete Comment Error:", err);
    return next(err);
  }
};

/* ===========================================================
   6) 댓글의 좋아요 목록 (GET /comments/:id/likes)
=========================================================== */
exports.getCommentLikes = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment)
      return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });

    const likes = await prisma.commentLike.findMany({
      where: { commentId: id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ commentId: id, count: likes.length, likes });
  } catch (err) {
    console.error("Get Comment Likes Error:", err);
    return next(err);
  }
};
