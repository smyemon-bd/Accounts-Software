"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export async function getProfitLossData(month: number, year: number) {
  await requirePermission("dashboard.admin");

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  // ১. আয় (Revenue)
  const payments = await prisma.payment.findMany({
    where: { paidAt: { gte: startDate, lte: endDate } },
    include: { 
      sale: { include: { items: true } },
      serviceOrder: true
    }
  });

  let revenue = 0;
  const incomeBreakdown: Record<string, number> = {};

  payments.forEach(p => {
    const amt = Number(p.amount);
    revenue += amt;
    
    // পেমেন্টটি সেল নাকি সার্ভিস অর্ডার, তার ভিত্তিতে আয়ের ব্রেকডাউন
    let type = "Other Income";
    if (p.saleId) type = "Product Sales";
    else if (p.serviceOrderId) type = "Service Revenue";
    
    incomeBreakdown[type] = (incomeBreakdown[type] || 0) + amt;
  });

  // ২. ব্যয় (Expenses)
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startDate, lte: endDate } },
    include: { category: true }
  });

  let totalExpense = 0;
  const expenseBreakdown: Record<string, number> = {};

  expenses.forEach(exp => {
    const amt = Number(exp.amount);
    totalExpense += amt;
    
    const catName = exp.category?.name || "Uncategorized";
    expenseBreakdown[catName] = (expenseBreakdown[catName] || 0) + amt;
  });

  const netProfit = revenue - totalExpense;

  return {
    revenue,
    totalExpense,
    netProfit,
    incomeBreakdown,
    expenseBreakdown,
  };
}