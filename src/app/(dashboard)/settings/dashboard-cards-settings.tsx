"use client";

import { updateDashboardSettings } from "@/server/actions/dashboard-setting";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";

export function DashboardCardsSettings({ settings }: { settings: any }) {
  const { showToast } = useToast();

  return (
    <form action={async (formData) => {
      await updateDashboardSettings(formData);
      showToast("Dashboard settings updated!");
    }} className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Show/Hide Dashboard Cards</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Select which KPI cards you want to see on the dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ToggleSetting name="showCash" label="Cash Balance" defaultChecked={settings?.showCash} />
        <ToggleSetting name="showBank" label="Bank Balance" defaultChecked={settings?.showBank} />
        <ToggleSetting name="showMFS" label="MFS Balance" defaultChecked={settings?.showMFS} />
        <ToggleSetting name="showQR" label="QR Balance" defaultChecked={settings?.showQR} />
        <ToggleSetting name="showLoan" label="Loan Taken" defaultChecked={settings?.showLoan} />
        <ToggleSetting name="showLoanPaid" label="Loan Paid" defaultChecked={settings?.showLoanPaid} />
        <ToggleSetting name="showSale" label="Total Sales" defaultChecked={settings?.showSale} />
        <ToggleSetting name="showInvestment" label="Total Investment" defaultChecked={settings?.showInvestment} />
        <ToggleSetting name="showDue" label="Outstanding Due" defaultChecked={settings?.showDue} />
        <ToggleSetting name="showStock" label="Hardware Stock Value" defaultChecked={settings?.showStock} />
        <ToggleSetting name="showUserCount" label="User Accounts" defaultChecked={settings?.showUserCount} />
        <ToggleSetting name="showGraph" label="Monthly Sales Graph" defaultChecked={settings?.showGraph} />
        <ToggleSetting name="showDividend" label="Dividend Info" defaultChecked={settings?.showDividend} />
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <SubmitButton>Save Settings</SubmitButton>
      </div>
    </form>
  );
}

function ToggleSetting({ name, label, defaultChecked }: { name: string, label: string, defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <input 
        type="checkbox" 
        name={name} 
        defaultChecked={defaultChecked ?? true} 
        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
      />
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
    </label>
  );
}