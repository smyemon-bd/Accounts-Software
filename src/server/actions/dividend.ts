"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// ১. নতুন শেয়ার হোল্ডার তৈরি
export async function createShareHolder(formData: FormData) {
  await requirePermission("dashboard.admin");
  await prisma.shareHolder.create({
    data: {
      name: String(formData.get("name")),
      phone: formData.get("phone") ? String(formData.get("phone")) : null,
      email: formData.get("email") ? String(formData.get("email")) : null,
      totalShares: Number(formData.get("totalShares") || 0),
    },
  });
  revalidatePath("/dividends");
}

// ২. শেয়ার বরাদ্দ (Allocation)
export async function allocateShares(formData: FormData) {
  await requirePermission("dashboard.admin");
  const shareHolderId = String(formData.get("shareHolderId"));
  const shares = Number(formData.get("shares"));
  const pricePerShare = Number(formData.get("pricePerShare"));

  await prisma.$transaction(async (tx) => {
    await tx.shareAllocation.create({
      data: { shareHolderId, shares, pricePerShare },
    });
    await tx.shareHolder.update({
      where: { id: shareHolderId },
      data: { totalShares: { increment: shares } },
    });
  });
  revalidatePath("/dividends");
}

// ৩. লভ্যাংশ ঘোষণা (Dividend Declaration)
export async function declareDividend(formData: FormData) {
  await requirePermission("dashboard.admin");
  const shareHolderId = String(formData.get("shareHolderId"));
  const amount = Number(formData.get("amount"));

  await prisma.dividend.create({
    data: { shareHolderId, amount, status: "PENDING" },
  });
  revalidatePath("/dividends");
}


// ৪. লভ্যাংশ পরিশোধ (Dividend Paid)
export async function payDividend(formData: FormData) {
  await requirePermission("dashboard.admin");
  const id = String(formData.get("id"));
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;

  await prisma.$transaction(async (tx) => {
    // ১. ডিভিডেন্ডের ডেটা খুঁজে বের করা (amount পাওয়ার জন্য)
    const dividend = await tx.dividend.findUnique({
      where: { id }
    });

    if (!dividend) throw new Error("Dividend not found");
    
    const amount = Number(dividend.amount); // এখানে amount ডিফাইন করা হলো

    // ২. স্ট্যাটাস আপডেট
    await tx.dividend.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date() },
    });

    // ৩. Accounting Posting
    let cashAccount;
    if (paymentAccountId) {
      cashAccount = await tx.account.findUnique({ where: { code: `ACC-${paymentAccountId}` } });
      if (!cashAccount) {
        const pAcc = await tx.paymentAccount.findUnique({ where: { id: paymentAccountId } });
        cashAccount = await tx.account.create({ 
          data: { code: `ACC-${paymentAccountId}`, name: `${pAcc?.name} (${pAcc?.type})`, type: "ASSET" } 
        });
      }
    } else {
      cashAccount = await tx.account.findUnique({ where: { code: "1000" } });
      if (!cashAccount) cashAccount = await tx.account.create({ data: { code: "1000", name: "Cash", type: "ASSET" } });
    }

    let dividendExpenseAccount = await tx.account.findUnique({ where: { code: "5200" } });
    if (!dividendExpenseAccount) dividendExpenseAccount = await tx.account.create({ data: { code: "5200", name: "Dividend Expense", type: "EXPENSE" } });

    await tx.journalEntry.create({
      data: {
        memo: `Dividend Paid - ${dividend.id.slice(-8)}`,
        lines: {
          create: [
            { accountId: dividendExpenseAccount.id, debit: amount, credit: 0 },
            { accountId: cashAccount.id, debit: 0, credit: amount },
          ],
        },
      },
    });
  });

  revalidatePath("/dividends");
  revalidatePath("/cashbook");
  revalidatePath("/accounting");
  revalidatePath("/dashboard");
  return { success: true };
}