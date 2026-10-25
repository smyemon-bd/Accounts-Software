"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs"; // ✅ bcrypt যোগ করা হলো

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
});

// ১. নতুন ক্লায়েন্ট তৈরি
export async function createClient(formData: FormData) {
  await requirePermission("client.create");
  
  const data = schema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    address: formData.get("address") || undefined,
  });
  
  // চেক করা: এই ইমেইলে আগে থেকে কেউ আছে কি না (unique constraint)
  if (data.email) {
    const existing = await prisma.client.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("A client with this email already exists.");
  }

  await prisma.client.create({ data });
  revalidatePath("/clients");
  revalidatePath("/masters");
}

// ২. ক্লায়েন্ট আপডেট (Edit) - এখানে পাসওয়ার্ড সেট করার লজিক যোগ করা হলো
export async function updateClient(formData: FormData) {
  await requirePermission("client.update");
  
  const id = String(formData.get("id"));
  const name = String(formData.get("name"));
  const phone = formData.get("phone") ? String(formData.get("phone")) : null;
  const email = formData.get("email") ? String(formData.get("email")) : null;
  const portalPassword = formData.get("portalPassword") as string | null; // ✅ নতুন ফিল্ড

  const updateData: any = { name, phone, email };

  // যদি নতুন পাসওয়ার্ড দেওয়া হয়, তবে হ্যাশ করে সেভ করা হবে
  if (portalPassword && portalPassword.trim() !== "") {
    if (portalPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    updateData.passwordHash = await bcrypt.hash(portalPassword, 10);
  }

  await prisma.client.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/clients");
  revalidatePath("/masters");
  return { success: true };
}