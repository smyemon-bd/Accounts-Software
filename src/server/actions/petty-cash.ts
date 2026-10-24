"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ১. মেইন ক্যাশ থেকে Petty Cash এ টাকা ট্রান্সফার করা
export async function transferToPettyCash(fromAccountId: string, pettyCashAccountId: string, amount: number, note: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // ১. মেইন অ্যাকাউন্ট থেকে টাকা কাটা
      const fromAcc = await tx.paymentAccount.findUnique({ where: { id: fromAccountId } });
      if (!fromAcc) throw new Error("Source account not found");

      // ২. Petty Cash এ টাকা যোগ করা
      await tx.paymentAccount.update({
        where: { id: pettyCashAccountId },
        data: { /* ব্যালেন্স আপনার সিস্টেমে কীভাবে হিসাব হয় তার উপর নির্ভর করে, এখানে শুধু লজিক দেখানো হলো */ }
      });

      // ৩. খরচ বা ট্রান্সফারের রেকর্ড রাখার জন্য Expense টেবিল ব্যবহার করা
      await tx.expense.create({
        data: {
          title: `Petty Cash Transfer: ${note}`,
          amount: amount,
          paymentAccountId: fromAccountId, // টাকা যেখান থেকে গেছে
          date: new Date(),
          notes: `Transferred to Petty Cash (${pettyCashAccountId})`
        }
      });
    });
    revalidatePath("/petty-cash");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ২. Petty Cash থেকে খরচ করা
export async function logPettyCashExpense(pettyCashAccountId: string, amount: number, title: string, categoryId?: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Expense টেবিলে এন্ট্রি দেওয়া (এটি অটোমেটিক Petty Cash অ্যাকাউন্ট থেকে কেটে নেবে)
      await tx.expense.create({
        data: {
          title: title,
          amount: amount,
          paymentAccountId: pettyCashAccountId, // পেমেন্ট হবে Petty Cash থেকে
          categoryId: categoryId,
          date: new Date(),
        }
      });
    });
    revalidatePath("/petty-cash");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}