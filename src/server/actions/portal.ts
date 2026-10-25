"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ১. ক্লায়েন্ট লগইন
export async function clientLogin(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const client = await prisma.client.findUnique({ where: { email } });
  if (!client || !client.passwordHash) return { error: "Invalid credentials" };

  const isValid = await bcrypt.compare(password, client.passwordHash);
  if (!isValid) return { error: "Invalid credentials" };

  // কুকি সেট করা (৭ দিনের জন্য)
  const cookieStore = await cookies();
  cookieStore.set("client_session", client.id, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/portal"
  });

  return { success: true };
}

// ২. ক্লায়েন্ট লগআউট
export async function clientLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("client_session");
}

// ৩. ক্লায়েন্ট সেশন চেক
export async function getClientSession() {
  const cookieStore = await cookies();
  const clientId = cookieStore.get("client_session")?.value;
  
  if (!clientId) return null;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, email: true, phone: true, address: true }
  });

  return client;
}

// ৪. ক্লায়েন্ট ড্যাশবোর্ড ডেটা (ইনভয়েস, পেমেন্ট)
export async function getClientDashboardData() {
  const client = await getClientSession();
  if (!client) return null;

  const sales = await prisma.sale.findMany({
    where: { clientId: client.id },
    include: { items: { include: { service: true, product: true } }, payments: true },
    orderBy: { createdAt: "desc" }
  });

  const totalBilled = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalPaid = sales.reduce((sum, s) => sum + Number(s.paidAmount), 0);
  const totalDue = totalBilled - totalPaid;

  return {
    client,
    sales: JSON.parse(JSON.stringify(sales)),
    summary: { totalBilled, totalPaid, totalDue }
  };
}

// ৫. ক্লায়েন্ট প্রোফাইল আপডেট
export async function updateClientProfile(formData: FormData) {
  const client = await getClientSession();
  if (!client) return { error: "Unauthorized" };

  await prisma.client.update({
    where: { id: client.id },
    data: {
      name: String(formData.get("name")),
      phone: formData.get("phone") ? String(formData.get("phone")) : null,
      address: formData.get("address") ? String(formData.get("address")) : null,
    }
  });

  revalidatePath("/portal");
  return { success: true };
}