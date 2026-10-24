"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";
import { createNotification } from "./notification";

// হেল্পার ফাংশন: পেমেন্ট পরিবর্তনের পর ইনস্টলমেন্ট রি-ক্যালকুলেট করা
async function recalculateInstallments(tx: any, orderId: string) {
  const allPayments = await tx.payment.findMany({
    where: { serviceOrderId: orderId },
  });
  
  let totalPaid = allPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  const installments = await tx.installment.findMany({
    where: { serviceOrderId: orderId },
    orderBy: { dueDate: "asc" },
  });

  for (const inst of installments) {
    const dueAmount = Number(inst.amount);
    const payAmount = Math.min(totalPaid, dueAmount);
    
    let status: "DUE" | "PARTIAL" | "PAID" = "DUE";
    if (payAmount >= dueAmount && dueAmount > 0) status = "PAID";
    else if (payAmount > 0) status = "PARTIAL";

    await tx.installment.update({
      where: { id: inst.id },
      data: { paidAmount: payAmount, status },
    });

    totalPaid -= payAmount;
  }

  const updatedInstallments = await tx.installment.findMany({ where: { serviceOrderId: orderId } });
  let orderStatus: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
  
  if (updatedInstallments.length > 0) {
    const allPaid = updatedInstallments.every((i: any) => i.status === "PAID");
    const anyPaid = updatedInstallments.some((i: any) => Number(i.paidAmount) > 0);
    orderStatus = allPaid ? "PAID" : anyPaid ? "PARTIAL" : "PENDING";
  } else {
    const order = await tx.serviceOrder.findUnique({ where: { id: orderId } });
    const finalPaid = allPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    orderStatus = finalPaid >= Number(order.totalAmount) ? "PAID" : finalPaid > 0 ? "PARTIAL" : "PENDING";
  }

  await tx.serviceOrder.update({ where: { id: orderId }, data: { status: orderStatus } });
}

// ১. নতুন পেমেন্ট রেকর্ড করা
export async function recordPayment(formData: FormData) {
  const user = await requirePermission("payment.create");
  const serviceOrderId = String(formData.get("serviceOrderId"));
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method")) as PaymentMethod;
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;
  const reference = formData.get("reference") as string | null;

  await prisma.$transaction(async (tx) => {
    // ১. পেমেন্ট তৈরি
    const payment = await tx.payment.create({
      data: { 
        serviceOrderId, 
        amount, 
        method, 
        reference, 
        receivedById: user.id,
        paymentAccountId 
      },
    });

    // ২. ইনস্টলমেন্ট রি-ক্যালকুলেট
    await recalculateInstallments(tx, serviceOrderId);

    const order = await tx.serviceOrder.findUniqueOrThrow({ where: { id: serviceOrderId } });

    // ৩. Accounting Posting
   // Accounting Posting (Dynamic Account)
    let cashAccount;
    if (paymentAccountId) {
      // নির্দিষ্ট ব্যাংক বা MFS অ্যাকাউন্ট
      cashAccount = await tx.account.findUnique({ where: { code: `ACC-${paymentAccountId}` } });
      if (!cashAccount) {
        const pAcc = await tx.paymentAccount.findUnique({ where: { id: paymentAccountId } });
        cashAccount = await tx.account.create({ 
          data: { 
            code: `ACC-${paymentAccountId}`, 
            name: `${pAcc?.name} (${pAcc?.type})`, 
            type: "ASSET" 
          } 
        });
      }
    } else {
      // ডিফল্ট ক্যাশ
      cashAccount = await tx.account.findUnique({ where: { code: "1000" } });
      if (!cashAccount) cashAccount = await tx.account.create({ data: { code: "1000", name: "Cash", type: "ASSET" } });
    }

    let revenueAccount = await tx.account.findUnique({ where: { code: "4000" } });
    if (!revenueAccount) revenueAccount = await tx.account.create({ data: { code: "4000", name: "Service Revenue", type: "REVENUE" } });

    await tx.journalEntry.create({
      data: {
        paymentId: payment.id,
        memo: `Payment for Order ${order.orderNo}`,
        lines: {
          create: [
            { accountId: cashAccount.id, debit: amount, credit: 0 },
            { accountId: revenueAccount.id, debit: 0, credit: amount },
          ],
        },
      },
    });

    // ৪. নোটিফিকেশন
    await createNotification({
      type: "PAYMENT",
      title: "Payment Received",
      message: `Order ${order.orderNo} - Received from ${user.name}`,
      amount: amount,
    });
  });

  revalidatePath("/orders");
  revalidatePath(`/orders/${serviceOrderId}`);
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/accounting");
  revalidatePath("/cashbook");
}

// ২. পেমেন্ট আপডেট করা
export async function updatePayment(formData: FormData) {
  await requirePermission("payment.update");
  const id = String(formData.get("id"));
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method")) as PaymentMethod;
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;
  const reference = formData.get("reference") as string | null;
  const orderId = String(formData.get("orderId"));

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id },
      data: { amount, method, reference, paymentAccountId },
    });

    await recalculateInstallments(tx, orderId);
    
    const journalEntry = await tx.journalEntry.findUnique({ where: { paymentId: id } });
    if (journalEntry) {
       await tx.journalLine.updateMany({
         where: { journalEntryId: journalEntry.id, debit: { gt: 0 } },
         data: { debit: amount }
       });
       await tx.journalLine.updateMany({
         where: { journalEntryId: journalEntry.id, credit: { gt: 0 } },
         data: { credit: amount }
       });
    }
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/payments");
  revalidatePath("/cashbook");
  revalidatePath("/accounting");
  return { success: true };
}

// ৩. পেমেন্ট ডিলিট করা
export async function deletePayment(paymentId: string, orderId: string) {
  await prisma.$transaction(async (tx) => {
    const journalEntry = await tx.journalEntry.findUnique({ where: { paymentId } });
    if (journalEntry) {
      await tx.journalLine.deleteMany({ where: { journalEntryId: journalEntry.id } });
      await tx.journalEntry.delete({ where: { id: journalEntry.id } });
    }
    
    await tx.payment.delete({ where: { id: paymentId } });
    await recalculateInstallments(tx, orderId);
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/payments");
  revalidatePath("/cashbook");
  revalidatePath("/accounting");
  revalidatePath("/dashboard");
  return { success: true };
}