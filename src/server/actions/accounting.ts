"use server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";

// ১. ট্রায়াল ব্যালেন্স
export async function getTrialBalance() {
  await requirePermission("dashboard.admin");
  
  const lines = await prisma.journalLine.findMany({
    include: { account: true }
  });

  const accounts: Record<string, { code: string, name: string, type: string, debit: number, credit: number }> = {};

  for (const line of lines) {
    if (!accounts[line.accountId]) {
      accounts[line.accountId] = { 
        code: line.account.code, 
        name: line.account.name, 
        type: line.account.type, 
        debit: 0, 
        credit: 0 
      };
    }
    accounts[line.accountId].debit += Number(line.debit);
    accounts[line.accountId].credit += Number(line.credit);
  }

  return Object.values(accounts);
}

// ২. নির্দিষ্ট অ্যাকাউন্টের লেনদেন (Cashbook এর জন্য)
export async function getAccountBook(accountCode: string) {
  await requireAuth();

  const account = await prisma.account.findUnique({
    where: { code: accountCode },
    include: {
      lines: {
        include: { journalEntry: true },
        orderBy: { journalEntry: { createdAt: "desc" } }
      }
    }
  });

  if (!account) return { totalIn: 0, totalOut: 0, balance: 0, transactions: [] };

  let totalIn = 0;
  let totalOut = 0;

  const transactions = account.lines.map(line => {
    const debit = Number(line.debit);
    const credit = Number(line.credit);
    
    if (debit > 0) totalIn += debit;
    if (credit > 0) totalOut += credit;

    return {
      id: line.id,
      date: line.journalEntry.createdAt,
      memo: line.journalEntry.memo || "Transaction",
      type: debit > 0 ? "IN" : "OUT",
      amount: debit > 0 ? debit : credit,
    };
  });

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
    transactions
  };
}

// ৩. ক্যাশ ফ্লো
export async function getCashFlow() {
  return await getAccountBook("1000");
}

// ৪. সব অ্যাকাউন্টের ব্যালেন্স (ড্যাশবোর্ডের জন্য)
export async function getAllAccountBalances() {
  await requireAuth();

  const paymentAccounts = await prisma.paymentAccount.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });

  const allJournalLines = await prisma.journalLine.findMany({
    include: { account: true }
  });

  const balances = paymentAccounts.map((acc) => {
    const accountCode = `ACC-${acc.id}`;
    const lines = allJournalLines.filter(l => l.account.code === accountCode);
    
    const totalIn = lines.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalOut = lines.reduce((sum, l) => sum + Number(l.credit), 0);

    return { ...acc, balance: totalIn - totalOut };
  });

  const cashAccountLines = allJournalLines.filter(l => l.account.code === "1000");
  const cashIn = cashAccountLines.reduce((sum, l) => sum + Number(l.debit), 0);
  const cashOut = cashAccountLines.reduce((sum, l) => sum + Number(l.credit), 0);
  const cashBalance = cashIn - cashOut;

  return { balances, cashBalance };
}