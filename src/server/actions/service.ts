"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// ১. নতুন সার্ভিস তৈরি
export async function createService(formData: FormData) {
  await requirePermission("service.create");
  
  await prisma.service.create({
    data: {
      name: String(formData.get("name")),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price")),
    },
  });
  
  revalidatePath("/services");
  return { success: true };
}

// ২. সার্ভিসের লিস্ট আনা (ক্লায়েন্ট কম্পোনেন্টের জন্য)
export async function getServices() {
  const services = await prisma.service.findMany({ 
    orderBy: { createdAt: "desc" } 
  });

  // Decimal টাইপকে Number-এ কনভার্ট করা হচ্ছে
  return services.map(service => ({
    ...service,
    price: Number(service.price)
  }));
}

// ৩. সার্ভিস আপডেট (Edit)
export async function updateService(formData: FormData) {
  await requirePermission("service.update");
  
  const id = String(formData.get("id"));
  
  await prisma.service.update({
    where: { id },
    data: {
      name: String(formData.get("name")),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price")),
    },
  });
  
  revalidatePath("/services");
  return { success: true };
}

// ৪. সার্ভিস Hide/Show (Active/Inactive)
export async function toggleServiceStatus(id: string, currentStatus: boolean) {
  await requirePermission("service.update");
  
  await prisma.service.update({
    where: { id },
    data: { isActive: !currentStatus },
  });
  
  revalidatePath("/services");
  return { success: true };
}

// ৫. সার্ভিস ডিলিট
export async function deleteService(id: string) {
  await requirePermission("service.delete");
  
  await prisma.service.delete({ 
    where: { id } 
  });
  
  revalidatePath("/services");
  return { success: true };
}