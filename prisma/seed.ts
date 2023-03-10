import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // TODO: Add queries to seed database (maybe using faker.js to generate data)
  await prisma.user.create({
    data: {
      email: "martin.meneghetti@barsanti.edu.it",
      role: "ADMIN",
      googleId: "1234",
      name: "martin",
      isEditor: true,
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
