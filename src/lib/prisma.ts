import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function resolveDatabaseUrl(): string {
  // If an external database URL (e.g. Postgres) is provided, use it directly
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  // Paths to template database
  const projectDbPath = path.join(process.cwd(), "prisma", "dev.db");
  const localDbPath = path.join(process.cwd(), "dev.db");

  // On Vercel / AWS Lambda, the root deployment directory is read-only.
  // We copy the pre-seeded SQLite database to /tmp so it is both accessible and writable.
  const isVercelOrLambda = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
  if (isVercelOrLambda) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(projectDbPath)) {
          fs.copyFileSync(projectDbPath, tmpDbPath);
        } else if (fs.existsSync(localDbPath)) {
          fs.copyFileSync(localDbPath, tmpDbPath);
        }
      }
    } catch (err) {
      console.warn("Notice: could not initialize SQLite in /tmp:", err);
    }
    const targetUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = targetUrl;
    return targetUrl;
  }

  // Local development / standalone
  if (fs.existsSync(projectDbPath)) {
    const targetUrl = `file:${projectDbPath}`;
    process.env.DATABASE_URL = process.env.DATABASE_URL || targetUrl;
    return process.env.DATABASE_URL;
  }

  process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./prisma/dev.db";
  return process.env.DATABASE_URL;
}

const resolvedDbUrl = resolveDatabaseUrl();

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
