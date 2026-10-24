"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function createPaymentAccount(formData: FormData) {
  await requirePermission("dashboard.admin");
  await prisma.paymentAccount.create({
    data: {
      name: String(formData.get("name")),
      type: String(formData.get("type")),
      accountNo: formData.get("accountNo") ? String(formData.get("accountNo")) : null,
    },
  });
  revalidatePath("/settings");
}

export async function togglePaymentAccount(id: string, currentStatus: boolean) {
  await requirePermission("dashboard.admin");
  await prisma.paymentAccount.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  revalidatePath("/settings");
}

export async function deletePaymentAccount(id: string) {
  await requirePermission("dashboard.admin");
  try {
    await prisma.paymentAccount.delete({ where: { id } });
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Cannot delete account because it is used in payments." };
  }
}