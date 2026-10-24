import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@byteflow.local";
  const newPassword = "admin123";

  // ১. পাসওয়ার্ড হ্যাশ তৈরি
  const passwordHash = await bcrypt.hash(newPassword, 10);
  console.log("Generated Hash:", passwordHash);

  // ২. ইউজার খুঁজে বের করা বা তৈরি করা
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // ইউজার থাকলে পাসওয়ার্ড আপডেট
    await prisma.user.update({
      where: { email },
      data: { passwordHash, isActive: true },
    });
    console.log(`✅ Password reset for existing user: ${email}`);
  } else {
    // ইউজার না থাকলে নতুন তৈরি (SUPER_ADMIN রোল সহ)
    const adminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
    if (!adminRole) throw new Error("SUPER_ADMIN role not found. Run seed first.");

    await prisma.user.create({
      data: {
        name: "Super Admin",
        email,
        passwordHash,
        roleId: adminRole.id,
        isActive: true,
      },
    });
    console.log(`✅ New admin user created: ${email}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());