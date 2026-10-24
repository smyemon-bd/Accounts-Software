"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";

// ================= INVESTMENT ACTIONS =================

// ১. নতুন ইনভেস্টর তৈরি
export async function createInvestor(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  await prisma.investor.create({
    data: {
      name: String(formData.get("name")),
      phone: formData.get("phone") ? String(formData.get("phone")) : null,
      email: formData.get("email") ? String(formData.get("email")) : null,
      address: formData.get("address") ? String(formData.get("address")) : null,
    },
  });
  revalidatePath("/investments");
}

// ২. নতুন বিনিয়োগ রেকর্ড (Accounting Posting সহ)
export async function createInvestment(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const investorId = String(formData.get("investorId"));
  const amount = Number(formData.get("amount"));
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;

  await prisma.$transaction(async (tx) => {
    // ১. ইনভেস্টমেন্ট সেভ
    await tx.investment.create({
      data: { investorId, amount },
    });

    // ২. অ্যাকাউন্টিং পোস্টিং (Cash Account বাড়বে, Equity বাড়বে)
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

    let equityAccount = await tx.account.findUnique({ where: { code: "3000" } });
    if (!equityAccount) equityAccount = await tx.account.create({ data: { code: "3000", name: "Owner's Equity", type: "EQUITY" } });

    await tx.journalEntry.create({
      data: {
        memo: `Investment received`,
        lines: {
          create: [
            { accountId: cashAccount.id, debit: amount, credit: 0 },
            { accountId: equityAccount.id, debit: 0, credit: amount },
          ],
        },
      },
    });

    // ৩. নোটিফিকেশন
    await createNotification({
      type: "OTHER",
      title: "New Investment",
      message: `Investment of ৳${amount.toLocaleString()} received.`,
      amount: amount,
    });
  });

  revalidatePath("/investments");
  revalidatePath("/cashbook");
  revalidatePath("/accounting");
  revalidatePath("/dashboard");
}

// ================= LOAN ACTIONS =================

// ১. নতুন ঋণ নেওয়া
export async function createLoan(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const lenderName = String(formData.get("lenderName"));
  const principal = Number(formData.get("principal"));
  const interestRate = Number(formData.get("interestRate"));
  const tenureMonths = Number(formData.get("tenureMonths"));
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;

  // EMI ক্যালকুলেশন
  const r = interestRate / 100 / 12;
  const emiAmount = r === 0 ? principal / tenureMonths : (principal * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);

  await prisma.$transaction(async (tx) => {
    // ১. লোন সেভ
    await tx.loan.create({
      data: {
        lenderName,
        principal,
        interestRate,
        tenureMonths,
        emiAmount: Number(emiAmount.toFixed(2)),
        startDate: new Date(),
        status: "ACTIVE",
      },
    });

    // ২. অ্যাকাউন্টিং পোস্টিং (Cash বাড়বে, Liability বাড়বে)
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

    let liabilityAccount = await tx.account.findUnique({ where: { code: "2000" } });
    if (!liabilityAccount) liabilityAccount = await tx.account.create({ data: { code: "2000", name: "Loan Payable", type: "LIABILITY" } });

    await tx.journalEntry.create({
      data: {
        memo: `Loan received from ${lenderName}`,
        lines: {
          create: [
            { accountId: cashAccount.id, debit: principal, credit: 0 },
            { accountId: liabilityAccount.id, debit: 0, credit: principal },
          ],
        },
      },
    });
  });

  revalidatePath("/loans");
  revalidatePath("/cashbook");
  revalidatePath("/accounting");
  revalidatePath("/dashboard");
}

// ২. ঋণ পরিশোধ (Loan Repayment)
export async function repayLoan(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const loanId = String(formData.get("loanId"));
  const amount = Number(formData.get("amount"));
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;

  await prisma.$transaction(async (tx) => {
    // ১. রিপেমেন্ট সেভ
    await tx.loanRepayment.create({
      data: { loanId, amount, paymentAccountId },
    });

    // ২. অ্যাকাউন্টিং পোস্টিং (Liability কমবে, Cash কমবে)
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

    let liabilityAccount = await tx.account.findUnique({ where: { code: "2000" } });
    if (!liabilityAccount) liabilityAccount = await tx.account.create({ data: { code: "2000", name: "Loan Payable", type: "LIABILITY" } });

    await tx.journalEntry.create({
      data: {
        memo: `Loan repayment`,
        lines: {
          create: [
            { accountId: liabilityAccount.id, debit: amount, credit: 0 },
            { accountId: cashAccount.id, debit: 0, credit: amount },
          ],
        },
      },
    });
  });

  revalidatePath("/loans");
  revalidatePath("/cashbook");
  revalidatePath("/accounting");
  revalidatePath("/dashboard");
}