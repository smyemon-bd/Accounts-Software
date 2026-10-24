import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function can(permission: string) {
  const user = await requireAuth();
  return user.permissions?.includes("*") || user.permissions?.includes(permission);
}

export async function requirePermission(permission: string) {
  const user = await requireAuth(); // <-- এখানে ইউজার ডেটা নিচ্ছে
  if (!(user.permissions?.includes("*") || user.permissions?.includes(permission))) {
    throw new Error("FORBIDDEN");
  }
  return user; // <-- খুব গুরুত্বপূর্ণ: ইউজার ডেটা রিটার্ন করছে
}