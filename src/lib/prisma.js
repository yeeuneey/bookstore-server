require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const mariadb = require("mariadb");

// Shared MariaDB/MySQL pool via Prisma adapter
const poolUrl =
  (process.env.DATABASE_URL || "").replace(/^mysql:\/\//i, "mariadb://");
const pool = mariadb.createPool(poolUrl);
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
