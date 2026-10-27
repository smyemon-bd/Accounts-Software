"use server";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireAuth } from "@/lib/rbac";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.string().min(1),
});

// ১. নতুন ইউজার তৈরি
export async function createUser(formData: FormData) {
  await requirePermission("user.create");

  const data = userSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    roleId: formData.get("roleId"),
  });

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Email already in use");

  const passwordHash = await bcrypt.hash(data.password, 10);
  
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      roleId: data.roleId,
    },
  });
  revalidatePath("/users");
}

// ২. ইউজার অ্যাক্টিভ/ইনঅ্যাক্টিভ করা
export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  await requirePermission("user.update");
  
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !currentStatus },
  });
  revalidatePath("/users");
}

// ৩. পাসওয়ার্ড পরিবর্তন
export async function changePassword(formData: FormData) {
  const sessionUser = await requireAuth();
  const userId = (sessionUser as any).id || sessionUser.id;
  if (!userId) throw new Error("User not found");

  const currentPassword = String(formData.get("currentPassword"));
  const newPassword = String(formData.get("newPassword"));
  const confirmPassword = String(formData.get("confirmPassword"));

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match");
  }

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new Error("Incorrect current password");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });
}

// ৪. প্রোফাইল আপডেট (নাম ও ছবি - Supabase Storage সহ)
export async function updateProfile(formData: FormData) {
  const sessionUser = await requireAuth();
  const userId = (sessionUser as any).id || sessionUser.id;
  if (!userId) throw new Error("User not found");
  
  const name = String(formData.get("name"));
  const phone = formData.get("phone") ? String(formData.get("phone")) : null;
  const address = formData.get("address") ? String(formData.get("address")) : null;
  const bio = formData.get("bio") ? String(formData.get("bio")) : null;
  const dobString = formData.get("dob") ? String(formData.get("dob")) : null;
  const dob = dobString ? new Date(dobString) : null;

  const imageFile = formData.get("image") as File | null;
  let imageUrl = undefined;
  
  if (imageFile && imageFile.size > 0) {
    const filename = `${Date.now()}-${imageFile.name.replace(/\s/g, "-")}`;
    
    // ✅ Supabase-এ আপলোড (Vercel-এ কাজ করবে)
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filename, imageFile, { upsert: true });

    if (error) {
      console.error("Upload Error:", error);
      throw new Error("Failed to upload image");
    }

    // ✅ পাবলিক URL বের করা
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filename);

    imageUrl = publicUrlData.publicUrl;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || undefined,
      phone,
      address,
      bio,
      dob,
      ...(imageUrl && { image: imageUrl }),
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { success: true };
}

// ৫. সাইডবার/প্রোফাইল মেনুর জন্য ইউজার ডেটা আনা
export async function getUserProfileData() {
  const sessionUser = await requireAuth();
  const userId = (sessionUser as any).id || sessionUser.id;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, image: true }
  });
  return user;
}

// ৬. অ্যাডমিন কর্তৃক ইউজারের পাসওয়ার্ড রিসেট
export async function resetUserPassword(formData: FormData) {
  await requirePermission("user.update");
  const id = String(formData.get("id"));
  const newPassword = String(formData.get("newPassword"));

  if (newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id },
    data: { passwordHash },
  });

  revalidatePath("/users");
  return { success: true };
}
