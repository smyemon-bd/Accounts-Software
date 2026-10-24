import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  "user.create", "user.read", "user.update", "user.delete",
  "client.create", "client.read", "client.update", "client.delete",
  "service.create", "service.read", "service.update", "service.delete",
  "order.create", "order.read", "order.update", "order.cancel",
  "payment.create", "payment.read", "payment.update", "payment.delete", // নতুন পারমিশন যোগ করা হলো
  "dashboard.admin", "dashboard.sales", "dashboard.accountant",
];

const ROLES: Record<string, string[]> = {
  SUPER_ADMIN: ["*"],
  ACCOUNTANT: [
    "client.read", "order.read", 
    "payment.create", "payment.read", "payment.update", "payment.delete", 
    "dashboard.accountant"
  ],
  SALES: [
    "client.create", "client.read", "client.update",
    "service.read", "order.create", "order.read", 
    "payment.create", "payment.read", 
    "dashboard.sales",
  ],
};

async function main() {
  // ১. পারমিশন তৈরি বা আপডেট করা
  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({ 
      where: { key }, 
      update: {}, 
      create: { key } 
    });
  }
  const allPerms = await prisma.permission.findMany();

  // ২. রোল তৈরি এবং পারমিশন অ্যাসাইন করা
  for (const [roleName, keys] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    
    const perms = keys.includes("*") ? allPerms : allPerms.filter(p => keys.includes(p.key));
    
    for (const p of perms) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: p.id } },
        update: {},
        create: { roleId: role.id, permissionId: p.id },
      });
    }
  }

  // ৩. প্রথম সুপার অ্যাডমিন তৈরি করা
  const adminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  const passwordHash = await bcrypt.hash("admin123", 10);
  
  await prisma.user.upsert({
    where: { email: "admin@byteflow.local" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@byteflow.local",
      passwordHash,
      roleId: adminRole!.id,
    },
  });

  console.log("✅ Seed complete: Permissions and Roles updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });