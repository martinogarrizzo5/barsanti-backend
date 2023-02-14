import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // TODO: Add queries to seed database (maybe using faker.js to generate data)
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
