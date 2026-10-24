"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function updateSettings(formData: FormData) {
  await requirePermission("dashboard.admin");

  const data = {
    companyName: String(formData.get("companyName")),
    companySub: String(formData.get("companySub")),
    address: String(formData.get("address")),
    phone: String(formData.get("phone")),
    email: String(formData.get("email")),
    bankName: String(formData.get("bankName")),
    accountNumber: String(formData.get("accountNumber")),
    terms: String(formData.get("terms")),
  };

  await prisma.companySettings.upsert({
    where: { id: "global_settings" },
    update: data,
    create: { id: "global_settings", ...data },
  });

  revalidatePath("/settings");
  revalidatePath("/orders/[id]/invoice", "page");
  return { success: true };
}

export async function getSettings() {
  const settings = await prisma.companySettings.findUnique({
    where: { id: "global_settings" }
  });
  
  if (!settings) {
    return {
      companyName: "ByteFlow & Co.",
      companySub: "Technologies",
      address: "123 Tech Street, Dhaka, Bangladesh",
      phone: "+880 1700-000000",
      email: "hello@byteflow.com",
      bankName: "ByteFlow Bank Ltd.",
      accountNumber: "123-456-7890",
      terms: "Please send payment within 30 days of receiving this invoice. There will be 10% interest charge per month on late invoice."
    };
  }
  return settings;
}