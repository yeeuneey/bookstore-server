// src/controllers/books.controller.js
require("dotenv").config();
const prisma = require("../lib/prisma");
const cache = require("../lib/cache");
const AppError = require("../utils/AppError");
const { ERROR_CODES } = require("../utils/errorCodes");

const BOOK_NOT_FOUND_MSG = "도서를 찾을 수 없습니다.";
const ISBN_DUP_MSG = "ISBN이 이미 존재합니다.";
const CREATE_SUCCESS_MSG = "도서 생성 완료";
const UPDATE_SUCCESS_MSG = "도서 수정 완료";
const DELETE_SUCCESS_MSG = "도서 삭제 완료";

/* ===========================================================
   0) 인기 도서 목록 (GET /books/popular)
=========================================================== */
exports.getPopularBooks = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const cacheKey = cache.buildKey("books:popular", { limit });

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const books = await prisma.book.findMany({
      take: limit,
      orderBy: [
        { favorites: { _count: "desc" } },
        { reviews: { _count: "desc" } },
        { createdAt: "desc" },
      ],
      include: {
        authors: { include: { author: true } },
        categories: { include: { category: true } },
        _count: { select: { favorites: true, reviews: true } },
      },
    });

    const payload = { size: books.length, books };
    await cache.set(cacheKey, payload, 300);
    return res.json(payload);
  } catch (err) {
    req.log.error("Get Popular Books Error:", { error: err });
    return next(err);
  }
};

/* ===========================================================
   1) 도서 목록 조회 + 검색/필터/페이지네이션 (GET /books)
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
    const normalizedSort = `${sortField || "createdAt"},${sortDirection.toUpperCase()}`;

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

    const cacheKey = cache.buildKey("books:list", {
      page: pageNum,
      size: take,
      sort: normalizedSort,
      keyword: keyword || "",
      category: category || "",
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
    });

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

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

    const payload = {
      page: pageNum,
      size: take,
      total,
      books,
    };

    await cache.set(cacheKey, payload, 300);
    return res.json(payload);
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

    const cacheKey = cache.buildKey("books:detail", id);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

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
      throw new AppError(BOOK_NOT_FOUND_MSG, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    await cache.set(cacheKey, book, 600);
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
      throw new AppError(ISBN_DUP_MSG, 409, ERROR_CODES.DUPLICATE_RESOURCE);
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

    await cache.delByPrefix("books:list");
    await cache.delByPrefix("books:popular");

    return res.status(201).json({ message: CREATE_SUCCESS_MSG, book });
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
      throw new AppError(BOOK_NOT_FOUND_MSG, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
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

    await cache.del(cache.buildKey("books:detail", id));
    await cache.del(cache.buildKey("books:categories", id));
    await cache.del(cache.buildKey("books:authors", id));
    await cache.delByPrefix("books:list");
    await cache.delByPrefix("books:popular");

    return res.json({ message: UPDATE_SUCCESS_MSG, book });
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
      throw new AppError(BOOK_NOT_FOUND_MSG, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
    }

    await prisma.book.delete({ where: { id } });

    await cache.del(cache.buildKey("books:detail", id));
    await cache.del(cache.buildKey("books:categories", id));
    await cache.del(cache.buildKey("books:authors", id));
    await cache.delByPrefix("books:list");
    await cache.delByPrefix("books:popular");

    return res.json({ message: DELETE_SUCCESS_MSG });
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
      throw new AppError(BOOK_NOT_FOUND_MSG, 404, ERROR_CODES.RESOURCE_NOT_FOUND);
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

    const cacheKey = cache.buildKey("books:categories", id);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const categories = await prisma.bookCategory.findMany({
      where: { bookId: id },
      include: {
        category: true,
      },
    });

    await cache.set(cacheKey, categories, 3600);
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

    const cacheKey = cache.buildKey("books:authors", id);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const authors = await prisma.bookAuthor.findMany({
      where: { bookId: id },
      include: {
        author: true,
      },
    });

    await cache.set(cacheKey, authors, 3600);
    return res.json(authors);
  } catch (err) {
    req.log.error("Get Book Authors Error:", { error: err });
    return next(err);
  }
};
