import { getSettings } from "@/server/actions/settings";
import { SettingsForm } from "./settings-form";
import { Settings, Landmark, Building2, LayoutDashboard, DatabaseBackup } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PaymentAccountsList } from "./payment-accounts-list";
import { DashboardCardsSettings } from "./dashboard-cards-settings";
import { BackupSettings } from "./backup-settings";
import Link from "next/link";

export default async function SettingsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ tab?: string }> 
}) {
  const resolvedParams = await searchParams;
  const activeTab = resolvedParams.tab || "general";

  const settings = await getSettings();
  const accounts = await prisma.paymentAccount.findMany({ orderBy: { createdAt: "desc" } });
  const dashboardSettings = await prisma.dashboardSetting.findUnique({ where: { id: "global_dashboard" } });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="text-blue-500" /> Company Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your company info, payment accounts, and dashboard.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
        <Link 
          href="/settings?tab=general"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "general" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Building2 size={16} /> General
        </Link>
        <Link 
          href="/settings?tab=payment"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "payment" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Landmark size={16} /> Payment Methods
        </Link>
        <Link 
          href="/settings?tab=dashboard"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "dashboard" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <LayoutDashboard size={16} /> Dashboard Cards
        </Link>
        <Link 
          href="/settings?tab=backup"
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "backup" ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <DatabaseBackup size={16} /> Backup
        </Link>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "general" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <SettingsForm initialData={settings} />
          </div>
        )}

        {activeTab === "payment" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <PaymentAccountsList accounts={accounts} />
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <DashboardCardsSettings settings={dashboardSettings} />
          </div>
        )}

        {activeTab === "backup" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <BackupSettings />
          </div>
        )}
      </div>
    </div>
  );
}