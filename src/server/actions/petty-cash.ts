"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// ১. ফান্ড ট্রান্সফার (Main Account -> Petty Cash)
export async function refillPettyCash(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const fromAccountId = String(formData.get("fromAccountId"));
  const pettyCashAccountId = String(formData.get("pettyCashAccountId"));
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note"));

  try {
    await prisma.$transaction(async (tx) => {
      const pettyAcc = await tx.paymentAccount.findUnique({ where: { id: pettyCashAccountId } });
      if (!pettyAcc) throw new Error("Petty Cash account not found");

      // সোর্স অ্যাকাউন্টের লেজার কোড
      let fromLedger = await tx.account.findUnique({ where: { code: `ACC-${fromAccountId}` } });
      if (!fromLedger) {
        const fromAcc = await tx.paymentAccount.findUnique({ where: { id: fromAccountId } });
        fromLedger = await tx.account.create({ 
          data: { code: `ACC-${fromAccountId}`, name: `${fromAcc?.name} (${fromAcc?.type})`, type: "ASSET" } 
        });
      }

      // পেটি ক্যাশের লেজার কোড
      let pettyLedger = await tx.account.findUnique({ where: { code: `ACC-${pettyCashAccountId}` } });
      if (!pettyLedger) {
        pettyLedger = await tx.account.create({ 
          data: { code: `ACC-${pettyCashAccountId}`, name: `${pettyAcc.name} (${pettyAcc.type})`, type: "ASSET" } 
        });
      }

      // ডাবল এন্ট্রি: পেটি ক্যাশ (Debit) এবং মেইন অ্যাকাউন্ট (Credit)
      await tx.journalEntry.create({
        data: {
          memo: `Refill Petty Cash: ${note}`,
          lines: {
            create: [
              { accountId: pettyLedger.id, debit: amount, credit: 0 },
              { accountId: fromLedger.id, debit: 0, credit: amount },
            ],
          },
        },
      });
    });
    
    revalidatePath("/petty-cash");
    revalidatePath("/cashbook");
    revalidatePath("/accounting");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}