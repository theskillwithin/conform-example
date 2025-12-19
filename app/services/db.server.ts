import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "~/generated/prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __db__: PrismaClient;
}

let prisma: PrismaClient;

function getSqliteFileFromDatabaseUrl(databaseUrl: string) {
  if (databaseUrl.startsWith("file:")) {
    return databaseUrl.slice("file:".length);
  }

  return databaseUrl;
}

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({
  url: getSqliteFileFromDatabaseUrl(databaseUrl),
});

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter, errorFormat: "colorless" });
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient({ adapter, errorFormat: "colorless" });
  }
  prisma = global.__db__;
}

export { prisma };
