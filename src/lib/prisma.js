require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const rawUrl = process.env.DATABASE_URL;
const connectionUrl = rawUrl?.replace(/^mysql:\/\//i, "mariadb://");

if (!connectionUrl) {
  throw new Error("DATABASE_URL is not set");
}

// Prisma 7+ with datasource URL in prisma.config.ts requires an adapter.
const adapter = new PrismaMariaDb(connectionUrl);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
