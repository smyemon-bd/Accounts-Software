"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function saveAttendance(formData: FormData) {
  await requirePermission("dashboard.admin");

  const dateString = String(formData.get("date")); // YYYY-MM-DD
  const dateObj = new Date(dateString);
  const date = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));

  const records = formData.getAll("records") as string[]; 

  await prisma.$transaction(async (tx) => {
    for (const record of records) {
      const [userId, status, note] = record.split("|");
      
      await tx.attendance.upsert({
        where: { userId_date: { userId, date } },
        update: { status: status as any, note: note || null },
        create: { userId, date, status: status as any, note: note || null },
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

  const users = await prisma.user.findMany({
    where: { isActive: true },
    include: {
      attendances: {
        where: { date }
      },
      role: true
    },
    orderBy: { name: "asc" }
  });

  return users.map(u => ({
    userId: u.id,
    name: u.name,
    email: u.email,
    role: u.role?.name,
    status: u.attendances[0]?.status || "PRESENT",
    note: u.attendances[0]?.note || "",
  }));
}