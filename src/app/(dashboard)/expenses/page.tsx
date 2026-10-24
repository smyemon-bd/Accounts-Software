import { ExpenseTabs } from "@/components/expense-tabs";

export default function ExpensesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Expenses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your daily business expenses and categories.</p>
      </div>

      <ExpenseTabs />
    </div>
  );
}