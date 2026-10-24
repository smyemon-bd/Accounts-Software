"use server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/rbac";

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
}

// ২. নোটিফিকেশন লিস্ট আনা
export async function getNotifications() {
  const user = await getSessionUser();
  if (!user) return [];

  const notifications = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Decimal টাইপকে Number-এ কনভার্ট করা (এরর সমাধানের জন্য)
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

// ৪. সব নোটিফিকেশন রিড হিসেবে মার্ক করা
export async function markAllAsRead() {
  const user = await getSessionUser();
  if (!user) return { success: false };

  await prisma.activityLog.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  
  return { success: true };
}