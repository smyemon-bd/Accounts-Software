import { getSessionUser } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";
import Link from "next/link";
import { User, KeyRound } from "lucide-react";

export default async function ProfilePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  const sessionUser = await getSessionUser();
  const user = await prisma.user.findUnique({
    where: { id: sessionUser?.id },
  });

  if (!user) return null;

  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "profile";

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-10">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Update your personal information and password.</p>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
          <Link 
            href="/profile?tab=profile"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "profile" 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <User size={16} /> Profile Information
          </Link>
          <Link 
            href="/profile?tab=password"
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "password" 
                ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            <KeyRound size={16} /> Change Password
          </Link>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && <ProfileForm user={user} />}
        {activeTab === "password" && <ChangePasswordForm />}
      </div>
    </div>
  );
}