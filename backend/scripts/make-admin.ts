import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    console.error("Usage: npx tsx make-admin.ts <email> <SUPER_ADMIN | ADMIN | USER>");
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role },
    });
    console.log(`Successfully updated ${email} to role: ${role}`);
  } catch (error) {
    console.error("Failed to update user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
