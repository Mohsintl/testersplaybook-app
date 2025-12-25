require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");

  const prisma = new PrismaClient();

  await prisma.$connect();
  console.log("Prisma connected");

  const result = await prisma.$queryRawUnsafe("SELECT 1");
  console.log("Query result:", result);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("ERROR:", e);
});
