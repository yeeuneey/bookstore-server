// prisma/seed.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const SALT = 10;

// Adapter 기반 Prisma Client
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

/* -----------------------------------------
   Helper Functions 
----------------------------------------- */

// 사용자 생성 또는 조회
async function ensureUser(email, password, name, gender = "MALE") {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;

  const hashed = await bcrypt.hash(password, SALT);

  return prisma.user.create({
    data: { email, password: hashed, name, gender },
  });
}

// 카테고리 생성 또는 조회
async function ensureCategory(name) {
  return prisma.category.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

// 저자 생성 또는 조회
async function ensureAuthor(name) {
  const found = await prisma.author.findFirst({ where: { name } });
  if (found) return found;
  return prisma.author.create({ data: { name } });
}

// 도서 생성 또는 조회
async function ensureBook(data) {
  return prisma.book.upsert({
    where: { isbn: data.isbn },
    update: {},
    create: data,
  });
}

/* -----------------------------------------
    MAIN SEED LOGIC
----------------------------------------- */

async function main() {
  console.log("🌱 Seeding started...");

  /* -----------------------------------------
      1) Users (20명 생성) 
  ----------------------------------------- */
  const admin = await ensureUser(
    "admin@example.com",
    "admin1234!",
    "관리자",
    "MALE"
  );

  const users = [admin];

  for (let i = 1; i <= 20; i++) { 
    const user = await ensureUser(
      `user${i}@test.com`,
      `password${i}!`,
      `유저${i}`,
      i % 2 === 0 ? "FEMALE" : "MALE"
    );
    users.push(user);
  }

  /* -----------------------------------------
      2) Categories (10개)
  ----------------------------------------- */
  const categoryNames = [
    "IT", "소설", "자기계발", "여행", "과학",
    "예술", "철학", "경제", "역사", "요리"
  ];

  const categories = [];
  for (const c of categoryNames) {
    categories.push(await ensureCategory(c));
  }

  /* -----------------------------------------
      3) Authors (20명)
  ----------------------------------------- */
  const authorNames = [];
  for (let i = 1; i <= 20; i++) {
    authorNames.push(`저자${i}`);
  }

  const authors = [];
  for (const name of authorNames) {
    authors.push(await ensureAuthor(name));
  }

  /* -----------------------------------------
      4) Books (50권) 
  ----------------------------------------- */
  const books = [];
  for (let i = 1; i <= 50; i++) { 
    const book = await ensureBook({
      title: `샘플 도서 ${i}`,
      isbn: `ISBN-${1000 + i}`,
      price: 10000 + i * 300,
      publisher: "샘플출판사",
      summary: `샘플 도서 ${i}의 요약입니다.`,
      publicationDate: new Date("2023-01-01")
    });

    // 카테고리 2개 연결
    await prisma.bookCategory.createMany({
      data: [
        { bookId: book.id, categoryId: categories[i % categories.length].id },
        { bookId: book.id, categoryId: categories[(i + 3) % categories.length].id },
      ],
      skipDuplicates: true,
    });

    // 저자 1~2명 연결
    await prisma.bookAuthor.createMany({
      data: [
        { bookId: book.id, authorId: authors[i % authors.length].id },
        { bookId: book.id, authorId: authors[(i + 5) % authors.length].id },
      ],
      skipDuplicates: true,
    });

    books.push(book);
  }

  /* -----------------------------------------
      5) Reviews (50개) 
  ----------------------------------------- */
  const reviews = [];
  for (let i = 1; i <= 50; i++) { 
    const review = await prisma.review.create({
      data: {
        rating: (i % 5) + 1,
        comment: `리뷰 내용 ${i}`,
        userId: users[i % users.length].id,
        bookId: books[i % books.length].id
      }
    });
    reviews.push(review);
  }

  /* -----------------------------------------
      6) Comments (50개) 
  ----------------------------------------- */
  for (let i = 1; i <= 50; i++) { 
    await prisma.comment.create({
      data: {
        comment: `댓글 내용 ${i}`,
        userId: users[(i + 3) % users.length].id,
        reviewId: reviews[i % reviews.length].id
      }
    });
  }

  /* -----------------------------------------
      7) Favorites (50개)
  ----------------------------------------- */
  for (let i = 1; i <= 50; i++) {
    await prisma.favorite.create({
      data: {
        userId: users[i % users.length].id,
        bookId: books[i % books.length].id,
      }
    }).catch(() => {});
  }

  /* -----------------------------------------
      8) Carts (50개) 
  ----------------------------------------- */
  for (let i = 1; i <= 50; i++) { 
    await prisma.cart.create({
      data: {
        userId: users[i % users.length].id,
        bookId: books[(i * 2) % books.length].id,
        quantity: (i % 3) + 1
      }
    }).catch(() => {});
  }

  /* -----------------------------------------
      9) Orders (30개) + OrderItems (60개)
  ----------------------------------------- */
  for (let i = 1; i <= 30; i++) {
    const order = await prisma.order.create({
      data: {
        userId: users[i % users.length].id,
        orderStatus: "PENDING",
        totalPrice: 20000 + i * 500,
        deliveryAddress: `전주시 건지로 ${i}`
      }
    });

    await prisma.orderItem.createMany({
      data: [
        {
          orderId: order.id,
          bookId: books[(i * 3) % books.length].id,
          quantity: 1,
          priceAtPurchase: books[(i * 3) % books.length].price,
        },
        {
          orderId: order.id,
          bookId: books[(i * 5) % books.length].id,
          quantity: 2,
          priceAtPurchase: books[(i * 5) % books.length].price,
        },
      ],
      skipDuplicates: true,
    });
  }

  console.log("🌱 Seed Completed!");
}

/* -----------------------------------------
    Execute
----------------------------------------- */
main()
  .catch((err) => {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
