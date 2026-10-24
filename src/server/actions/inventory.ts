"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notification";

// ================= PRODUCT ACTIONS =================

export async function createProduct(formData: FormData) {
  await requirePermission("dashboard.admin");
  await prisma.product.create({
    data: {
      sku: String(formData.get("sku")),
      name: String(formData.get("name")),
      costPrice: Number(formData.get("costPrice")),
      sellPrice: Number(formData.get("sellPrice")),
      stockQty: Number(formData.get("stockQty")),
    },
  });
  revalidatePath("/masters");
}

export async function updateProduct(formData: FormData) {
  await requirePermission("dashboard.admin");
  const id = String(formData.get("id"));
  await prisma.product.update({
    where: { id },
    data: {
      sku: String(formData.get("sku")),
      name: String(formData.get("name")),
      costPrice: Number(formData.get("costPrice")),
      sellPrice: Number(formData.get("sellPrice")),
      stockQty: Number(formData.get("stockQty")),
    },
  });
  revalidatePath("/masters");
  return { success: true };
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
  await requirePermission("dashboard.admin");
  await prisma.product.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  revalidatePath("/masters");
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requirePermission("dashboard.admin");
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/masters");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Cannot delete product because it is used in purchases or sales." };
  }
}

// ================= DISTRIBUTOR ACTIONS =================

export async function createDistributor(formData: FormData) {
  await requirePermission("dashboard.admin");
  await prisma.distributor.create({
    data: {
      name: String(formData.get("name")),
      phone: formData.get("phone") ? String(formData.get("phone")) : null,
    },
  });
  revalidatePath("/masters");
}

export async function updateDistributor(formData: FormData) {
  await requirePermission("dashboard.admin");
  const id = String(formData.get("id"));
  await prisma.distributor.update({
    where: { id },
    data: {
      name: String(formData.get("name")),
      phone: formData.get("phone") ? String(formData.get("phone")) : null,
    },
  });
  revalidatePath("/masters");
  return { success: true };
}

export async function toggleDistributorStatus(id: string, currentStatus: boolean) {
  await requirePermission("dashboard.admin");
  await prisma.distributor.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  revalidatePath("/masters");
  return { success: true };
}

export async function deleteDistributor(id: string) {
  await requirePermission("dashboard.admin");
  try {
    await prisma.distributor.delete({ where: { id } });
    revalidatePath("/masters");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Cannot delete distributor because they are used in purchases." };
  }
}

// ================= PURCHASE ACTIONS =================

export async function createPurchase(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const distributorId = String(formData.get("distributorId"));
  const productId = String(formData.get("productId"));
  const qty = Number(formData.get("qty"));
  const unitCost = Number(formData.get("unitCost"));
  const total = qty * unitCost;
  
  const paymentAccountId = formData.get("paymentAccountId") ? String(formData.get("paymentAccountId")) : null;
  const isCredit = formData.get("isCredit") === "true";
  const paidAmount = isCredit ? 0 : total;

  await prisma.$transaction(async (tx) => {
    // ১. পারচেজ তৈরি
    const purchase = await tx.purchase.create({
      data: {
        distributorId,
        total,
        paidAmount,
        status: isCredit ? "CREDIT" : "PAID",
        paymentAccountId,
        items: {
          create: { productId, qty, unitCost }
        }
      }
    });

    // ২. স্টক বাড়ানো
    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { increment: qty } }
    });

    // ৩. অ্যাকাউন্টিং পোস্টিং
    let inventoryAccount = await tx.account.findUnique({ where: { code: "1200" } });
    if (!inventoryAccount) inventoryAccount = await tx.account.create({ data: { code: "1200", name: "Inventory", type: "ASSET" } });

    if (isCredit) {
      // Credit Purchase: Inventory বাড়বে, Accounts Payable (Liability) বাড়বে
      let payableAccount = await tx.account.findUnique({ where: { code: "2100" } });
      if (!payableAccount) payableAccount = await tx.account.create({ data: { code: "2100", name: "Accounts Payable", type: "LIABILITY" } });

      await tx.journalEntry.create({
        data: {
          memo: `Credit Purchase from Distributor`,
          lines: {
            create: [
              { accountId: inventoryAccount.id, debit: total, credit: 0 },
              { accountId: payableAccount.id, debit: 0, credit: total },
            ]
          }
        }
      });
    } else {
      // Instant Payment: Inventory বাড়বে, Cash/Bank কমবে
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

      await tx.journalEntry.create({
        data: {
          memo: `Instant Purchase from Distributor`,
          lines: {
            create: [
              { accountId: inventoryAccount.id, debit: total, credit: 0 },
              { accountId: cashAccount.id, debit: 0, credit: total },
            ]
          }
        }
      });
    }
  });

  revalidatePath("/masters");
  revalidatePath("/cashbook");
  revalidatePath("/accounting");
  revalidatePath("/dashboard");
}
// ================= HARDWARE SALE ACTIONS =================

export async function createHardwareSale(formData: FormData) {
  const user = await requirePermission("dashboard.admin");
  
  const clientId = String(formData.get("clientId"));
  const productId = String(formData.get("productId"));
  const qty = Number(formData.get("qty"));
  const unitPrice = Number(formData.get("unitPrice"));
  const discount = Number(formData.get("discount") || 0);
  const total = (qty * unitPrice) - discount;

  await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product || product.stockQty < qty) {
      throw new Error("Not enough stock available");
    }

    // ১. সেল তৈরি
    const sale = await tx.hardwareSale.create({
      data: {
        clientId,
        total,
        discount,
        items: { create: { productId, qty, unitPrice, discount } }
      }
    });

    // ২. স্টক কমানো
    await tx.product.update({
      where: { id: productId },
      data: { stockQty: { decrement: qty } }
    });

    // ৩. Payment তৈরি (Hardware Sale-এর জন্য)
    await tx.payment.create({
      data: {
        hardwareSaleId: sale.id,
        amount: total,
        method: "CASH", // আপাতত ডিফল্ট, পরে ফর্ম থেকে নেওয়া যাবে
        receivedById: user.id,
      }
    });

    // ৪. Accounting Posting
    let cashAccount = await tx.account.findUnique({ where: { code: "1000" } });
    if (!cashAccount) cashAccount = await tx.account.create({ data: { code: "1000", name: "Cash", type: "ASSET" } });

    let salesRevenueAccount = await tx.account.findUnique({ where: { code: "4100" } });
    if (!salesRevenueAccount) salesRevenueAccount = await tx.account.create({ data: { code: "4100", name: "Hardware Sales Revenue", type: "REVENUE" } });

    await tx.journalEntry.create({
      data: {
        memo: `Hardware Sale - ${product.name}`,
        lines: {
          create: [
            { accountId: cashAccount.id, debit: total, credit: 0 },
            { accountId: salesRevenueAccount.id, debit: 0, credit: total },
          ],
        },
      },
    });

    // ৫. নোটিফিকেশন
    await createNotification({
      type: "SALE",
      title: "Hardware Sale Completed",
      message: `Sold ${qty} units of ${product.name}`,
      amount: total,
    });
  });

  revalidatePath("/masters");
  revalidatePath("/sales");
  revalidatePath("/payments");
  revalidatePath("/accounting");
  revalidatePath("/cashbook");
  revalidatePath("/dashboard");
}

export async function updateHardwareSale(formData: FormData) {
  await requirePermission("dashboard.admin");
  const id = String(formData.get("id"));
  const qty = Number(formData.get("qty"));
  const unitPrice = Number(formData.get("unitPrice"));
  const discount = Number(formData.get("discount") || 0);
  const total = (qty * unitPrice) - discount;

  await prisma.$transaction(async (tx) => {
    const oldSale = await tx.hardwareSale.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!oldSale) throw new Error("Sale not found");

    for (const item of oldSale.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { increment: item.qty } }
      });
    }

    await tx.hardwareSale.update({
      where: { id },
      data: {
        total,
        discount,
        items: {
          deleteMany: {},
          create: {
            productId: String(formData.get("productId")),
            qty,
            unitPrice,
            discount
          }
        }
      }
    });

    await tx.product.update({
      where: { id: String(formData.get("productId")) },
      data: { stockQty: { decrement: qty } }
    });
  });

  revalidatePath("/sales");
  return { success: true };
}

export async function deleteHardwareSale(id: string) {
  await requirePermission("dashboard.admin");
  await prisma.$transaction(async (tx) => {
    const sale = await tx.hardwareSale.findUnique({
      where: { id },
      include: { items: true }
    });

    if (sale) {
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { increment: item.qty } }
        });
      }
      await tx.hardwareSale.delete({ where: { id } });
    }
  });

  revalidatePath("/sales");
  return { success: true };
}