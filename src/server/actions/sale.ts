"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";

// ১. নতুন সেল তৈরি
export async function createSale(formData: FormData) {
  const user = await requirePermission("dashboard.admin");
  
  const clientId = String(formData.get("clientId"));
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;
  const itemsJson = String(formData.get("items"));
  const items = JSON.parse(itemsJson); 
  
  const discount = Number(formData.get("discount") || 0);
  const paidAmount = Number(formData.get("paidAmount") || 0);
  
  let subTotal = 0;
  for (const item of items) {
    subTotal += (item.price * item.qty) - (item.discount || 0);
  }
  const total = subTotal - discount;
  const dueAmount = total - paidAmount;

  const invoiceNo = "INV-" + Date.now().toString().slice(-8);

  await prisma.$transaction(async (tx) => {
    // ১. সেল তৈরি
    const sale = await tx.sale.create({
      data: {
        invoiceNo,
        clientId,
        total,
        discount,
        paidAmount,
        dueAmount,
        paymentAccountId,
        items: {
          create: items.map((item: any) => ({
            itemType: item.type,
            serviceId: item.type === "SERVICE" ? item.id : null,
            productId: item.type === "PRODUCT" ? item.id : null,
            qty: item.qty,
            unitPrice: item.price,
            discount: item.discount || 0,
          }))
        }
      }
    });

    // ২. প্রোডাক্ট স্টক কমানো
    for (const item of items) {
      if (item.type === "PRODUCT") {
        await tx.product.update({
          where: { id: item.id },
          data: { stockQty: { decrement: item.qty } }
        });
      }
    }

    // ৩. পেমেন্ট তৈরি (যদি Paid Amount > 0 হয়)
    if (paidAmount > 0) {
      const payment = await tx.payment.create({
        data: {
          saleId: sale.id,
          amount: paidAmount,
          method: "CASH",
          paymentAccountId,
          receivedById: user.id,
        }
      });

      // ৪. Accounting Posting (Paid Amount এর জন্য)
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

      let revenueAccount = await tx.account.findUnique({ where: { code: "4000" } });
      if (!revenueAccount) revenueAccount = await tx.account.create({ data: { code: "4000", name: "Sales Revenue", type: "REVENUE" } });

      await tx.journalEntry.create({
        data: {
          paymentId: payment.id,
          memo: `Sale - ${invoiceNo}`,
          lines: {
            create: [
              { accountId: cashAccount.id, debit: paidAmount, credit: 0 },
              { accountId: revenueAccount.id, debit: 0, credit: paidAmount },
            ],
          },
        },
      });
    }

    // ৫. নোটিফিকেশন
    await createNotification({
      type: "SALE",
      title: "New Sale Completed",
      message: `Invoice ${invoiceNo} - Total ৳${total.toLocaleString()}`,
      amount: paidAmount,
    });
  });

  revalidatePath("/sales");
  revalidatePath("/payments");
  revalidatePath("/accounting");
  revalidatePath("/cashbook");
  revalidatePath("/dashboard");
  return { success: true };
}

// ২. সেলের লিস্ট আনা (History)
export async function getSales() {
  await requirePermission("dashboard.admin");
  
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      paymentAccount: true,
      items: {
        include: { service: true, product: true }
      },
      payments: true
    }
  });

  // ডেটা সিরিয়ালাইজ করা
  return JSON.parse(JSON.stringify(sales)).map((sale: any) => ({
    ...sale,
    total: Number(sale.total),
    paidAmount: Number(sale.paidAmount),
    dueAmount: Number(sale.dueAmount),
    discount: Number(sale.discount),
    items: sale.items.map((i: any) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      discount: Number(i.discount),
    }))
  }));
}

// ৩. পুরনো সেল আপডেট (Edit)
export async function updateSale(formData: FormData) {
  const user = await requirePermission("dashboard.admin");
  const id = String(formData.get("id"));
  const discount = Number(formData.get("discount") || 0);
  const paidAmount = Number(formData.get("paidAmount") || 0);

  await prisma.$transaction(async (tx) => {
    // ১. সেল ডেটা আনা
    const sale = await tx.sale.findUnique({
      where: { id },
      include: { items: true }
    });
    if (!sale) throw new Error("Sale not found");

    let subTotal = 0;
    for (const item of sale.items) {
      subTotal += (Number(item.unitPrice) * item.qty) - Number(item.discount);
    }
    const total = subTotal - discount;
    const dueAmount = total - paidAmount;

    // ২. সেল আপডেট
    await tx.sale.update({
      where: { id },
      data: { total, discount, paidAmount, dueAmount }
    });

    // ৩. পুরনো জার্নাল এন্ট্রি ডিলিট করা
    const oldPayments = await tx.payment.findMany({ where: { saleId: id } });
    for (const p of oldPayments) {
      const journalEntry = await tx.journalEntry.findUnique({ where: { paymentId: p.id } });
      if (journalEntry) {
        await tx.journalLine.deleteMany({ where: { journalEntryId: journalEntry.id } });
        await tx.journalEntry.delete({ where: { id: journalEntry.id } });
      }
    }

    // ৪. পুরনো পেমেন্ট ডিলিট
    await tx.payment.deleteMany({ where: { saleId: id } });

    // ৫. নতুন পেমেন্ট ও জার্নাল এন্ট্রি তৈরি (যদি Paid Amount > 0 হয়)
    if (paidAmount > 0) {
      const payment = await tx.payment.create({
        data: {
          saleId: id,
          amount: paidAmount,
          method: "CASH",
          paymentAccountId: sale.paymentAccountId,
          receivedById: user.id,
        }
      });

      // Accounting Posting
      let cashAccount;
      if (sale.paymentAccountId) {
        cashAccount = await tx.account.findUnique({ where: { code: `ACC-${sale.paymentAccountId}` } });
        if (!cashAccount) {
          const pAcc = await tx.paymentAccount.findUnique({ where: { id: sale.paymentAccountId } });
          cashAccount = await tx.account.create({ 
            data: { code: `ACC-${sale.paymentAccountId}`, name: `${pAcc?.name} (${pAcc?.type})`, type: "ASSET" } 
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
          memo: `Sale Updated - ${sale.invoiceNo}`,
          lines: {
            create: [
              { accountId: cashAccount.id, debit: paidAmount, credit: 0 },
              { accountId: revenueAccount.id, debit: 0, credit: paidAmount },
            ],
          },
        },
      });
    }
  });

  // ✅ সব পেজ রিভ্যালিডেট করা যাতে ডেটা আপডেট হয়
  revalidatePath("/sales");
  revalidatePath("/payments");
  revalidatePath("/accounting");
  revalidatePath("/cashbook");
  revalidatePath("/dashboard");
  return { success: true };
}