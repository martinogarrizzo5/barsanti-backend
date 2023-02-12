import { PrismaClient, Role } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // TODO: Add queries to seed database (maybe using faker.js to generate data)
  prisma.user.create({
    data: {
      id: "uniqueId",
      name: "admin",
      email: "admin-app@example.it", // change it to your email before running the seed
      role: Role.ADMIN,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
