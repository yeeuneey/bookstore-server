require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in the environment.');
}

// MariaDB adapter works with MySQL protocol servers (e.g., MySQL 8)
const adapter = new PrismaMariaDb(databaseUrl);

const prisma = new PrismaClient({ adapter });

module.exports = prisma;
