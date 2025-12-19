import { prisma } from "~/services/db.server";

export async function cleanupDatabase() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    // Prisma disconnect can throw if the client is already disconnected; ignore that case.
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("disconnected")
    ) {
      return;
    }
    throw error;
  }
}
