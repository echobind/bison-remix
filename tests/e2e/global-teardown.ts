import type { FullConfig } from "@playwright/test";
import { getSchema } from "../helpers";
import { prisma } from "~/utils/db.server";

async function globalTeardown(_config: FullConfig) {
  const schema = getSchema(process.env.DATABASE_URL!);

  prisma.$executeRaw`DROP SCHEMA ${schema} CASCADE`;
  prisma.$executeRaw`CREATE SCHEMA ${schema}`;
}

export default globalTeardown;
