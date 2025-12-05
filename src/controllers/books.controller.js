// src/controllers/books.controller.js
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* ===========================================================
   1) 도서 목록 조회 + 검색/정렬/페이지네이션 (GET /books)
=========================================================== */
exports.getBooks = async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 20,
      sort = "createdAt,DESC",
      keyword,
      category,
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
        keyword
          ? {
              OR: [
                { title: { contains: keyword } },
                { summary: { contains: keyword } },
                { publisher: { contains: keyword } },
              ],
            }
          : {},
        category
          ? {
              categories: {
                some: {
                  category: { name: { contains: category } },
                },
              },
            }
          : {},
        dateFrom ? { createdAt: { gte: new Date(dateFrom) } } : {},
        dateTo ? { createdAt: { lte: new Date(dateTo) } } : {},
      ],
    };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: { [sortField || "createdAt"]: sortDirection },
        skip,
        take,
        include: {
          authors: { include: { author: true } },
          categories: { include: { category: true } },
          reviews: true,
        },
      }),
      prisma.book.count({ where }),
    ]);

    return res.json({
      page: pageNum,
      size: take,
      total,
      books,
    });
  } catch (err) {
    req.log.error("Get Books Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   2) 개별 도서 상세 조회 (GET /books/:id)
=========================================================== */
exports.getBookById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
        reviews: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!book) {
      throw new AppError("도서를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    return res.json(book);
  } catch (err) {
    req.log.error("Get Book Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   3) 도서 생성 (POST /books)
=========================================================== */
exports.createBook = async (req, res, next) => {
  try {
    const {
      title,
      isbn,
      price,
      publisher,
      summary,
      publicationDate,
      categoryIds = [],
      authorIds = [],
    } = req.body;

    const exists = await prisma.book.findUnique({ where: { isbn } });
    if (exists) {
      throw new AppError("ISBN이 이미 존재합니다.", 409, ERROR_CODES.CONFLICT);
    }

    const book = await prisma.book.create({
      data: {
        title,
        isbn,
        price,
        publisher,
        summary,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        authors: {
          create: authorIds.map((id) => ({ authorId: id })),
        },
        categories: {
          create: categoryIds.map((id) => ({ categoryId: id })),
        },
      },
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
      },
    });

    return res.status(201).json({ message: "도서 생성 완료", book });
  } catch (err) {
    req.log.error("Create Book Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   4) 도서 수정 (PATCH /books/:id)
=========================================================== */
exports.updateBook = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.book.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("도서를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    const {
      title,
      price,
      publisher,
      summary,
      publicationDate,
      categoryIds = [],
      authorIds = [],
    } = req.body;

    const book = await prisma.book.update({
      where: { id },
      data: {
        title,
        price,
        publisher,
        summary,
        publicationDate: publicationDate ? new Date(publicationDate) : null,
        authors: {
          deleteMany: {},
          create: authorIds.map((aid) => ({ authorId: aid })),
        },
        categories: {
          deleteMany: {},
          create: categoryIds.map((cid) => ({ categoryId: cid })),
        },
      },
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
      },
    });

    return res.json({ message: "도서 수정 완료", book });
  } catch (err) {
    req.log.error("Update Book Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   5) 도서 삭제 (DELETE /books/:id)
=========================================================== */
exports.deleteBook = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const exists = await prisma.book.findUnique({ where: { id } });
    if (!exists) {
      throw new AppError("도서를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    await prisma.book.delete({ where: { id } });

    return res.json({ message: "도서 삭제 완료" });
  } catch (err) {
    req.log.error("Delete Book Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   6) 도서 리뷰 목록 (GET /books/:id/reviews)
=========================================================== */
exports.getBookReviews = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new AppError("도서를 찾을 수 없습니다.", 404, ERROR_CODES.NOT_FOUND);
    }

    const reviews = await prisma.review.findMany({
      where: { bookId: id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.json({ bookId: id, count: reviews.length, reviews });
  } catch (err) {
    req.log.error("Get Book Reviews Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   7) 도서 카테고리 목록 (GET /books/:id/categories)
=========================================================== */
exports.getBookCategories = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const categories = await prisma.bookCategory.findMany({
      where: { bookId: id },
      include: {
        category: true,
      },
    });

    return res.json(categories);
  } catch (err) {
    req.log.error("Get Book Categories Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   8) 도서 저자 목록 (GET /books/:id/authors)
=========================================================== */
exports.getBookAuthors = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const authors = await prisma.bookAuthor.findMany({
      where: { bookId: id },
      include: {
        author: true,
      },
    });

    return res.json(authors);
  } catch (err) {
    req.log.error("Get Book Authors Error:", { error: err });
    return next(err);
  }
};
