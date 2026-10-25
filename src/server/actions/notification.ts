"use server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

// ১. নতুন নোটিফিকেশন তৈরি করা
export async function createNotification(data: { type: string, title: string, message: string, amount?: number }) {
  await prisma.activityLog.create({
    data: {
      type: data.type,
      title: data.title,
      message: data.message,
      amount: data.amount,
    }
  });
  // ড্যাশবোর্ডের নোটিফিকেশন বেল রিফ্রেশ করার জন্য
  revalidatePath("/dashboard");
}

// ২. নোটিফিকেশন লিস্ট আনা
export async function getNotifications() {
  const user = await getSessionUser();
  if (!user) return [];

  const notifications = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return notifications.map(notif => ({
    ...notif,
    amount: notif.amount ? Number(notif.amount) : null,
  }));
}

// ৩. আনরিড কাউন্ট বের করা
export async function getUnreadCount() {
  const user = await getSessionUser();
  if (!user) return 0;

  return await prisma.activityLog.count({ where: { isRead: false } });
}

// ৪. একটি নির্দিষ্ট নোটিফিকেশন রিড হিসেবে মার্ক করা
export async function markAsRead(id: string) {
  await prisma.activityLog.update({
    where: { id },
    data: { isRead: true },
  });
  revalidatePath("/dashboard");
}

// ৫. সব নোটিফিকেশন রিড হিসেবে মার্ক করা
export async function markAllAsRead() {
  const user = await getSessionUser();
  if (!user) return { success: false };

  await prisma.activityLog.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard");
  return { success: true };
}