"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// ১. ড্যাশবোর্ড সেটিংস আনা
export async function getDashboardSettings() {
  await requirePermission("dashboard.admin");
  
  let settings = await prisma.dashboardSetting.findUnique({
    where: { id: "global_dashboard" }
  });

  if (!settings) {
    settings = await prisma.dashboardSetting.create({
      data: { id: "global_dashboard" }
    });
  }
  return settings;
}

// ২. ড্যাশবোর্ড সেটিংস আপডেট
export async function updateDashboardSettings(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const data = {
    showBank: formData.get("showBank") === "on",
    showMFS: formData.get("showMFS") === "on",
    showQR: formData.get("showQR") === "on",
    showCash: formData.get("showCash") === "on",
    showLoan: formData.get("showLoan") === "on",
    showLoanPaid: formData.get("showLoanPaid") === "on",
    showSale: formData.get("showSale") === "on",
    showInvestment: formData.get("showInvestment") === "on",
    showDue: formData.get("showDue") === "on",
    showStock: formData.get("showStock") === "on",
    showUserCount: formData.get("showUserCount") === "on",
    showGraph: formData.get("showGraph") === "on",
    showDividend: formData.get("showDividend") === "on",
  };

  await prisma.dashboardSetting.upsert({
    where: { id: "global_dashboard" },
    update: data,
    create: { id: "global_dashboard", ...data },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}