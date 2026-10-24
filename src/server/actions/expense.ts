"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// --- ১. Category/Head/Sub-Head Management ---

export async function createExpenseCategory(formData: FormData) {
  await requirePermission("dashboard.admin");
  await prisma.expenseCategory.create({
    data: { name: String(formData.get("name")) },
  });
  revalidatePath("/expenses");
}

export async function createExpenseHead(formData: FormData) {
  await requirePermission("dashboard.admin");
  await prisma.expenseHead.create({
    data: {
      name: String(formData.get("name")),
      categoryId: String(formData.get("categoryId")),
    },
  });
  revalidatePath("/expenses");
}

export async function createExpenseSubHead(formData: FormData) {
  await requirePermission("dashboard.admin");
  await prisma.expenseSubHead.create({
    data: {
      name: String(formData.get("name")),
      headId: String(formData.get("headId")),
    },
  });
  revalidatePath("/expenses");
}

// --- ২. Expense CRUD ---

export async function createExpense(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const title = String(formData.get("title"));
  const amount = Number(formData.get("amount"));
  const categoryId = String(formData.get("categoryId"));
  const headId = formData.get("headId") ? String(formData.get("headId")) : null;
  const subHeadId = formData.get("subHeadId") ? String(formData.get("subHeadId")) : null;
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;
  const notes = formData.get("notes") as string | null;
  const invoiceNo = formData.get("invoiceNo") as string | null;

  await prisma.$transaction(async (tx) => {
    // ১. খরচ সেভ করা
    await tx.expense.create({
      data: { 
        title, 
        amount, 
        categoryId, 
        headId, 
        subHeadId, 
        paymentAccountId, 
        notes,
        invoiceNo
      }
    });

    // ২. অ্যাকাউন্টিং পোস্টিং (খরচ বাবদ অ্যাকাউন্ট কমবে)
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

    let expenseAccount = await tx.account.findUnique({ where: { code: "5000" } });
    if (!expenseAccount) expenseAccount = await tx.account.create({ data: { code: "5000", name: "General Expense", type: "EXPENSE" } });

    await tx.journalEntry.create({
      data: {
        memo: `Expense: ${title}`,
        lines: {
          create: [
            { accountId: expenseAccount.id, debit: amount, credit: 0 },
            { accountId: cashAccount.id, debit: 0, credit: amount },
          ]
        }
      }
    });
  });

  revalidatePath("/expenses");
  revalidatePath("/cashbook");
  revalidatePath("/accounting");
  revalidatePath("/dashboard");
  return { success: true };
}

// --- ৩. ডেটা আনার ফাংশন ---

export async function getExpensesData() {
  await requirePermission("dashboard.admin");

  const [categories, heads, subHeads, expenses, paymentAccounts] = await Promise.all([
    prisma.expenseCategory.findMany({ orderBy: { name: "asc" } }),
    prisma.expenseHead.findMany({ orderBy: { name: "asc" }, include: { category: true } }),
    prisma.expenseSubHead.findMany({ orderBy: { name: "asc" }, include: { head: true } }),
    prisma.expense.findMany({ 
      orderBy: { date: "desc" },
      include: { category: true, head: true, subHead: true, paymentAccount: true }
    }),
    prisma.paymentAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  return JSON.parse(JSON.stringify({
    categories,
    heads,
    subHeads,
    expenses,
    paymentAccounts
  }));
}