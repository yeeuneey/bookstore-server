require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { MariaDbAdapter } = require("@prisma/adapter-mariadb");
const mariadb = require("mariadb");

// Create a MariaDB/MySQL pool using the connection string.
const pool = mariadb.createPool(process.env.DATABASE_URL);

// PrismaClient with the MariaDB adapter (required for Prisma 7+ when URL is in prisma.config.ts).
const prisma = new PrismaClient({
  adapter: new MariaDbAdapter(pool),
});

module.exports = prisma;
