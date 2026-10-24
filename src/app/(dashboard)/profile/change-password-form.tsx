"use client";

import { changePassword } from "@/server/actions/user";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";

export function ChangePasswordForm() {
  const { showToast } = useToast();

  async function handleChangePassword(formData: FormData) {
    try {
      await changePassword(formData);
      showToast("Password changed successfully!");
    } catch (error: any) {
      showToast(error.message || "Failed to change password");
    }
  }

  return (
    <form action={handleChangePassword} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
        <input name="currentPassword" type="password" required className="input-premium" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
        <input name="newPassword" type="password" required className="input-premium" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
        <input name="confirmPassword" type="password" required className="input-premium" />
      </div>

      <div className="pt-2">
        <SubmitButton>Update Password</SubmitButton>
      </div>
    </form>
  );
}