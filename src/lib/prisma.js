require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { MariaDbAdapter } = require("@prisma/adapter-mariadb");
const mariadb = require("mariadb");

// MariaDB driver expects the scheme to be "mariadb://".
// Allow users to provide either mysql:// or mariadb://.
const rawUrl = process.env.DATABASE_URL;
const connectionUrl = rawUrl?.replace(/^mysql:\/\//i, "mariadb://");

if (!connectionUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Create a MariaDB/MySQL pool using the normalized connection string.
const pool = mariadb.createPool(connectionUrl);

// PrismaClient with the MariaDB adapter (required for Prisma 7+ when URL is in prisma.config.ts).
const prisma = new PrismaClient({
  adapter: new MariaDbAdapter(pool),
});

module.exports = prisma;
