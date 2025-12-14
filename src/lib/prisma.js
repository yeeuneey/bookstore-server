const { PrismaClient } = require("@prisma/client");

// Simple Prisma client (no MariaDB adapter)
const prisma = new PrismaClient();

module.exports = prisma;
