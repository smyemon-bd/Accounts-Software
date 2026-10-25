"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";

export async function createBulkPayments(formData: FormData) {
  const user = await requirePermission("payment.create");
  
  const dateString = String(formData.get("date"));
  const paymentDate = dateString ? new Date(dateString) : new Date();

  const records = formData.getAll("records") as string[];
  // ফরম্যাট: "clientId|amount|paymentAccountId|reference|notes"

  const validRecords = records.map(r => {
    const [clientId, amount, paymentAccountId, reference, notes] = r.split("|");
    return { 
      clientId, 
      amount: Number(amount), 
      paymentAccountId: paymentAccountId || null, 
      reference, 
      notes 
    };
  }).filter(r => r.clientId && r.amount > 0);

  if (validRecords.length === 0) {
    return { success: false, error: "No valid records to save." };
  }

  await prisma.$transaction(async (tx) => {
    for (const record of validRecords) {
      
      // ১. পেমেন্ট তৈরি (সাধারণ পেমেন্ট হিসেবে, তবে এখানে কোনো নির্দিষ্ট অর্ডার বা সেলের সাথে লিংক করা হচ্ছে না, 
      // শুধু ক্লায়েন্টের অ্যাডভান্স বা জেনারেল পেমেন্ট হিসেবে রাখা হচ্ছে)
      const payment = await tx.payment.create({
        data: {
          amount: record.amount,
          method: "CASH", // ডিফল্ট
          paymentAccountId: record.paymentAccountId,
          reference: record.reference || "Bulk Payment",
          notes: record.notes || `Bulk payment for Client ID: ${record.clientId}`,
          receivedById: user.id,
          paidAt: paymentDate,
        }
      });

      // ২. অ্যাকাউন্টিং পোস্টিং (যদি পেমেন্ট অ্যাকাউন্ট সিলেক্ট করা থাকে)
      let cashAccount;
      if (record.paymentAccountId) {
        cashAccount = await tx.account.findUnique({ where: { code: `ACC-${record.paymentAccountId}` } });
        if (!cashAccount) {
          const pAcc = await tx.paymentAccount.findUnique({ where: { id: record.paymentAccountId } });
          cashAccount = await tx.account.create({ 
            data: { code: `ACC-${record.paymentAccountId}`, name: `${pAcc?.name} (${pAcc?.type})`, type: "ASSET" } 
          });
        }
      } else {
        cashAccount = await tx.account.findUnique({ where: { code: "1000" } });
        if (!cashAccount) cashAccount = await tx.account.create({ data: { code: "1000", name: "Cash", type: "ASSET" } });
      }

      let revenueAccount = await tx.account.findUnique({ where: { code: "4000" } });
      if (!revenueAccount) revenueAccount = await tx.account.create({ data: { code: "4000", name: "Sales Revenue", type: "REVENUE" } });

      await tx.journalEntry.create({
        data: {
          paymentId: payment.id,
          memo: `Bulk Payment - ${record.reference || "Entry"}`,
          lines: {
            create: [
              { accountId: cashAccount.id, debit: record.amount, credit: 0 },
              { accountId: revenueAccount.id, debit: 0, credit: record.amount },
            ],
          },
        },
      });
    }
  });

  revalidatePath("/payments");
  revalidatePath("/bulk-payments");
  revalidatePath("/accounting");
  revalidatePath("/cashbook");
  revalidatePath("/dashboard");
  
  return { success: true };
}