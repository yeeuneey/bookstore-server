// src/controllers/comments.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 댓글 생성 (POST /comments)
=========================================================== */
exports.createComment = async (req, res, next) => {
  try {
    const { userId, reviewId, comment } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("유저를 찾을 수 없습니다.", 404, ERROR_CODES.USER_NOT_FOUND);
    }

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      throw new AppError("리뷰를 찾을 수 없습니다.", 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const newComment = await prisma.comment.create({
      data: { userId, reviewId, comment },
    });

    return res.status(201).json({ message: "댓글 생성 완료", comment: newComment });
  } catch (err) {
    req.log.error("Create Comment Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   2) 댓글 목록 조회 (GET /comments)
=========================================================== */
exports.getComments = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 20,
      sort = "createdAt,DESC",
      keyword,
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
        dateFrom ? { createdAt: { gte: new Date(dateFrom) } } : {},
        dateTo ? { createdAt: { lte: new Date(dateTo) } } : {},
      ],
    };

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        orderBy: { [sortField || "createdAt"]: sortDirection },
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
      size: take,
      total,
      comments,
    });
  } catch (err) {
    req.log.error("Get Comments Error:", { error: err });
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
      throw new AppError(
        "댓글을 찾을 수 없습니다.",
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    return res.json(comment);
  } catch (err) {
    req.log.error("Get Comment Error:", { error: err });
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
      throw new AppError(
        "댓글을 찾을 수 없습니다.",
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      throw new AppError(
        "본인 또는 관리자만 수정/삭제할 수 있습니다.",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { comment },
    });

    return res.json({ message: "댓글 수정 완료", comment: updated });
  } catch (err) {
    req.log.error("Update Comment Error:", { error: err });
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
      throw new AppError(
        "댓글을 찾을 수 없습니다.",
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }
    if (req.user.role !== "ADMIN" && exists.userId !== req.user.id) {
      throw new AppError(
        "본인 또는 관리자만 수정/삭제할 수 있습니다.",
        403,
        ERROR_CODES.FORBIDDEN
      );
    }

    await prisma.comment.delete({ where: { id } });

    return res.json({ message: "댓글 삭제 완료" });
  } catch (err) {
    req.log.error("Delete Comment Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   6) 댓글 좋아요 생성 (POST /comments/:id/likes)
=========================================================== */
exports.likeComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("로그인이 필요합니다.", 401, ERROR_CODES.UNAUTHORIZED);
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new AppError("댓글을 찾을 수 없습니다.", 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (existing) {
      throw new AppError("이미 좋아요를 눌렀습니다.", 409, ERROR_CODES.DUPLICATE_RESOURCE);
    }

    const like = await prisma.commentLike.create({
      data: { userId, commentId },
    });

    return res.status(201).json({ message: "댓글 좋아요 생성 완료", like });
  } catch (err) {
    req.log.error("Like Comment Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   7) 댓글 좋아요 취소 (DELETE /comments/:id/likes)
=========================================================== */
exports.unlikeComment = async (req, res, next) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("로그인이 필요합니다.", 401, ERROR_CODES.UNAUTHORIZED);
    }

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (!existing) {
      throw new AppError("좋아요 내역이 없습니다.", 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    await prisma.commentLike.delete({ where: { userId_commentId: { userId, commentId } } });

    return res.json({ message: "댓글 좋아요 취소 완료" });
  } catch (err) {
    req.log.error("Unlike Comment Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   8) 댓글 좋아요 목록 (GET /comments/:id/likes)
=========================================================== */
exports.getCommentLikes = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new AppError(
        "댓글을 찾을 수 없습니다.",
        404,
        ERROR_CODES.RESOURCE_NOT_FOUND
      );
    }

    const likes = await prisma.commentLike.findMany({
      where: { commentId: id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ commentId: id, count: likes.length, likes });
  } catch (err) {
    req.log.error("Get Comment Likes Error:", { error: err });
    return next(err);
  }
};
