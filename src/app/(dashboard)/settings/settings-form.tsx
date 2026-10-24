"use client";

import { updateSettings } from "@/server/actions/settings";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";

export function SettingsForm({ initialData }: { initialData: any }) {
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    const res = await updateSettings(formData);
    if (res?.success) {
      showToast("Settings saved successfully!");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Company Name</label>
          <input name="companyName" defaultValue={initialData.companyName} required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Subtitle (e.g., Technologies)</label>
          <input name="companySub" defaultValue={initialData.companySub} required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Address</label>
          <input name="address" defaultValue={initialData.address} required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Phone</label>
          <input name="phone" defaultValue={initialData.phone} required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Email</label>
          <input name="email" defaultValue={initialData.email} required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800 my-6 transition-colors" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Bank Name</label>
          <input name="bankName" defaultValue={initialData.bankName} required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Account Number</label>
          <input name="accountNumber" defaultValue={initialData.accountNumber} required className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 transition-colors">Terms & Conditions</label>
        <textarea name="terms" defaultValue={initialData.terms} rows={3} className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 resize-none" />
      </div>

      <div className="pt-2">
        <SubmitButton>Save Settings</SubmitButton>
      </div>
    </form>
  );
}