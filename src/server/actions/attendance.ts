"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import { AttendanceStatus } from "@prisma/client";

export async function saveAttendance(formData: FormData) {
  await requirePermission("dashboard.admin");

  const dateString = String(formData.get("date")); // YYYY-MM-DD
  const dateObj = new Date(dateString);
  
  // টাইমজোন ইস্যু এড়াতে শুধু তারিখ রাখা
  const date = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));

  const records = formData.getAll("records") as string[]; 
  // records ফরম্যাট হবে: ["userId_1|PRESENT|note", "userId_2|ABSENT|note"]

  await prisma.$transaction(async (tx) => {
    for (const record of records) {
      const [userId, status, note] = record.split("|");
      
      await tx.attendance.upsert({
        where: { userId_date: { userId, date } },
        update: { status: status as AttendanceStatus, note: note || null },
        create: { userId, date, status: status as AttendanceStatus, note: note || null },
      });
    }
  });

  revalidatePath("/attendance");
  return { success: true };
}

export async function getAttendanceByDate(dateString: string) {
  await requirePermission("dashboard.admin");
  
  const dateObj = new Date(dateString);
  const date = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));

  // সব অ্যাক্টিভ ইউজার এবং তাদের এই দিনের হাজিরা আনা
  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      attendances: {
        where: { date }
      }
    },
    orderBy: { name: "asc" }
  });

  return users.map(u => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    role: u.role?.name, // যদি relation থাকে
    status: u.attendances[0]?.status || "PRESENT", // ডিফল্ট Present
    note: u.attendances[0]?.note || "",
  }));
}