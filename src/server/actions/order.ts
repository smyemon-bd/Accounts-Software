"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { PaymentType } from "@prisma/client";

function orderNo() {
  return "SO-" + Date.now().toString().slice(-8);
}

export async function createServiceOrder(formData: FormData) {
  await requirePermission("order.create");
  const clientId = String(formData.get("clientId"));
  const serviceId = String(formData.get("serviceId"));
  const totalAmount = Number(formData.get("totalAmount"));
  const paymentType = String(formData.get("paymentType")) as PaymentType;
  const installmentCount = Number(formData.get("installmentCount") ?? 0);
  const firstDueDate = formData.get("firstDueDate") as string | null;

  await prisma.$transaction(async tx => {
    const order = await tx.serviceOrder.create({
      data: { orderNo: orderNo(), clientId, serviceId, totalAmount, paymentType },
    });

    if (paymentType === "INSTALLMENT" && installmentCount > 0 && firstDueDate) {
      const each = Math.floor((totalAmount / installmentCount) * 100) / 100;
      const remainder = +(totalAmount - each * installmentCount).toFixed(2);
      const start = new Date(firstDueDate);
      for (let i = 0; i < installmentCount; i++) {
        const due = new Date(start);
        due.setMonth(due.getMonth() + i);
        await tx.installment.create({
          data: {
            serviceOrderId: order.id,
            dueDate: due,
            amount: i === installmentCount - 1 ? each + remainder : each,
          },
        });
      }
    }
  });

  revalidatePath("/orders");
}
export async function cancelOrder(orderId: string) {
  await requirePermission("order.cancel");
  
  await prisma.serviceOrder.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });
  
  revalidatePath("/orders");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/dashboard");
}
// ইনস্টলমেন্ট আপডেট করার অ্যাকশন
export async function updateInstallment(formData: FormData) {
  await requirePermission("order.update"); // পারমিশন চেক
  
  const id = String(formData.get("id"));
  const amount = Number(formData.get("amount"));
  const dueDate = new Date(String(formData.get("dueDate")));
  const orderId = String(formData.get("orderId"));

  await prisma.installment.update({
    where: { id },
    data: {
      amount,
      dueDate,
    },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}