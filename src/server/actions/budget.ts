"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function setBudget(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const categoryId = String(formData.get("categoryId"));
  const amount = Number(formData.get("amount"));
  const month = Number(formData.get("month"));
  const year = Number(formData.get("year"));

  await prisma.budget.upsert({
    where: {
      categoryId_month_year: { categoryId, month, year }
    },
    update: { amount },
    create: { categoryId, amount, month, year },
  });

  revalidatePath("/expenses/budget");
  revalidatePath("/dashboard");
}

export async function getBudgetsWithExpenses(month: number, year: number) {
  await requirePermission("dashboard.admin");

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  // সব ক্যাটাগরি এবং তাদের বাজেট আনা
  const categories = await prisma.expenseCategory.findMany({
    include: {
      budgets: {
        where: { month, year }
      }
    }
  });

  // চলতি মাসের খরচগুলো ক্যাটাগরি অনুযায়ী গ্রুপ করা
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    select: { categoryId: true, amount: true }
  });

  const expenseMap = new Map();
  expenses.forEach(e => {
    if (!e.categoryId) return;
    const current = expenseMap.get(e.categoryId) || 0;
    expenseMap.set(e.categoryId, current + Number(e.amount));
  });

  return categories.map(cat => {
    const budgetAmount = cat.budgets[0] ? Number(cat.budgets[0].amount) : 0;
    const spentAmount = expenseMap.get(cat.id) || 0;
    const percentage = budgetAmount > 0 ? Math.min(100, Math.round((spentAmount / budgetAmount) * 100)) : 0;

    return {
      id: cat.id,
      name: cat.name,
      budget: budgetAmount,
      spent: spentAmount,
      percentage,
      isOver: spentAmount > budgetAmount && budgetAmount > 0,
    };
  });
}