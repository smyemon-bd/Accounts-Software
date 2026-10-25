"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// ১. নতুন রোল তৈরি করা
export async function createRole(formData: FormData) {
  await requirePermission("dashboard.admin");
  const name = String(formData.get("name")).toUpperCase().replace(/\s+/g, "_");
  
  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) throw new Error("Role already exists");

  await prisma.role.create({
    data: {
      name,
      description: String(formData.get("description") || ""),
    },
  });
  revalidatePath("/users/roles");
}

// ২. রোলের পারমিশন আপডেট করা
export async function updateRolePermissions(formData: FormData) {
  await requirePermission("dashboard.admin");
  const roleId = String(formData.get("roleId"));
  const permissions = formData.getAll("permissions") as string[]; // Array of permission IDs

  await prisma.$transaction(async (tx) => {
    // আগের সব পারমিশন ডিলিট করা
    await tx.rolePermission.deleteMany({
      where: { roleId },
    });

    // নতুন পারমিশন যোগ করা
    for (const permId of permissions) {
      await tx.rolePermission.create({
        data: { roleId, permissionId: permId },
      });
    }
  });

  revalidatePath("/users/roles");
  return { success: true };
}