/**
 * Prisma Client for Supabase PostgreSQL
 *
 * Reserved for custom app data only:
 * - Onboarding progress
 * - User preferences
 * - Feedback/ratings
 *
 * NOT used for Shopify sessions (handled by SQLite)
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient;
}

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient();

export default prisma;
