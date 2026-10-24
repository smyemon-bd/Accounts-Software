"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

// ১. নতুন ক্লায়েন্ট তৈরি
export async function createClient(formData: FormData) {
  await requirePermission("client.create");
  
  const data = schema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
  });
  
  await prisma.client.create({ data });
  revalidatePath("/clients");
}

// ২. ক্লায়েন্ট আপডেট (Edit)
export async function updateClient(formData: FormData) {
  await requirePermission("client.update");
  
  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  const phone = formData.get("phone") ? String(formData.get("phone")) : null;
  const email = formData.get("email") ? String(formData.get("email")) : null;

  await prisma.client.update({
    where: { id },
    data: { name, phone, email },
  });

  revalidatePath("/clients");
  return { success: true }; // রিডাইরেক্টের বদলে সাকসেস রেসপন্স রিটার্ন করবে
}