const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      skill_level: "BEGINNER",
    },
  });
  console.log("Created user:", user);

  // Fetch all users
  const users = await prisma.user.findMany();
  console.log("All users:", users);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });