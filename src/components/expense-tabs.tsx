"use client";

import { useState, useEffect } from "react";
import { 
  getExpensesData, 
  createExpense, 
  createExpenseCategory, 
  createExpenseHead, 
  createExpenseSubHead 
} from "@/server/actions/expense";
import { useToast } from "@/components/toast-provider";
import { Plus, Receipt, FolderTree, ListTree, Tag } from "lucide-react";
import Link from "next/link";

export function ExpenseTabs() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("history");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const res = await getExpensesData();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
        <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} icon={<Receipt size={16} />} label="Expense History" />
        <TabButton active={activeTab === "categories"} onClick={() => setActiveTab("categories")} icon={<FolderTree size={16} />} label="Categories" />
        <TabButton active={activeTab === "heads"} onClick={() => setActiveTab("heads")} icon={<Tag size={16} />} label="Heads" />
        <TabButton active={activeTab === "subheads"} onClick={() => setActiveTab("subheads")} icon={<ListTree size={16} />} label="Sub-Heads" />
      </div>

      <div className="mt-4">
        {activeTab === "history" && (
          <ExpenseHistoryTab 
            expenses={data.expenses} 
            categories={data.categories} 
            heads={data.heads} 
            subHeads={data.subHeads} 
            paymentAccounts={data.paymentAccounts} 
            refresh={loadData} 
          />
        )}
        {activeTab === "categories" && (
          <CategoryTab categories={data.categories} refresh={loadData} />
        )}
        {activeTab === "heads" && (
          <HeadTab heads={data.heads} categories={data.categories} refresh={loadData} />
        )}
        {activeTab === "subheads" && (
          <SubHeadTab subHeads={data.subHeads} heads={data.heads} refresh={loadData} />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
        active ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
      }`}
    >
      {icon} {label}
    </button>
  );
}

// --- ১. Expense History Tab ---
function ExpenseHistoryTab({ expenses, categories, heads, subHeads, paymentAccounts, refresh }: any) {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const filteredHeads = selectedCategory 
    ? heads.filter((h: any) => h.categoryId === selectedCategory) 
    : heads;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Add New Expense</h2>
        <form action={async (formData) => {
          const res = await createExpense(formData);
          if (res.success) {
            showToast("Expense added!");
            refresh();
          }
        }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="title" placeholder="Title (e.g., Office Rent)" required className="input-premium" />
          <input name="amount" type="number" step="0.01" placeholder="Amount (৳)" required className="input-premium" />
          <input name="invoiceNo" placeholder="Invoice No (Optional)" className="input-premium" />
          
          <select name="categoryId" required onChange={(e) => setSelectedCategory(e.target.value)} className="input-premium cursor-pointer">
            <option value="">Select Category</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <select name="headId" className="input-premium cursor-pointer">
            <option value="">Select Head (Optional)</option>
            {filteredHeads.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>

          <select name="subHeadId" className="input-premium cursor-pointer">
            <option value="">Select Sub-Head (Optional)</option>
            {subHeads.map((sh: any) => <option key={sh.id} value={sh.id}>{sh.name}</option>)}
          </select>

          <select name="paymentAccountId" className="input-premium cursor-pointer">
            <option value="">Select Payment Account (Optional)</option>
            {paymentAccounts.map((acc: any) => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
          </select>

          <input name="notes" placeholder="Notes (Optional)" className="input-premium md:col-span-2" />
          
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 md:col-span-3">
            Add Expense
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Expense History</h2>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="table-premium">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Head</th>
                <th>Sub-Head</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp: any) => (
                <tr key={exp.id}>
                  <td className="text-xs">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="font-medium">{exp.title}</td>
                  <td>{exp.category?.name || "N/A"}</td>
                  <td>{exp.head?.name || "N/A"}</td>
                  <td>{exp.subHead?.name || "N/A"}</td>
                  <td className="text-right font-bold text-red-600">৳ {Number(exp.amount).toLocaleString()}</td>
                  <td className="text-right">
                    <Link href={`/expenses/${exp.id}/receipt`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-xs font-semibold">
                      <Receipt size={14} /> Receipt
                    </Link>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-slate-500">No expenses found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- ২. Category Tab ---
function CategoryTab({ categories, refresh }: any) {
  const { showToast } = useToast();
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Add Expense Category</h2>
      <form action={async (formData) => {
        await createExpenseCategory(formData);
        showToast("Category added!");
        refresh();
      }} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Category Name</label>
          <input name="name" placeholder="e.g., Office Expenses" required className="input-premium" />
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap">
          Add Category
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Category Name</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c: any) => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td className="text-center py-6 text-slate-500">No categories added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- ৩. Head Tab ---
function HeadTab({ heads, categories, refresh }: any) {
  const { showToast } = useToast();
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Add Expense Head</h2>
      <form action={async (formData) => {
        await createExpenseHead(formData);
        showToast("Head added!");
        refresh();
      }} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Head Name</label>
          <input name="name" placeholder="e.g., Software License" required className="input-premium" />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Under Category</label>
          <select name="categoryId" required className="input-premium cursor-pointer">
            <option value="">Select Category</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap">
          Add Head
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Head Name</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {heads.map((h: any) => (
              <tr key={h.id}>
                <td className="font-medium">{h.name}</td>
                <td>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                    {h.category.name}
                  </span>
                </td>
              </tr>
            ))}
            {heads.length === 0 && (
              <tr><td colSpan={2} className="text-center py-6 text-slate-500">No heads added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- ৪. Sub-Head Tab ---
function SubHeadTab({ subHeads, heads, refresh }: any) {
  const { showToast } = useToast();
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
      <h2 className="font-semibold mb-4 text-slate-800 dark:text-white">Add Expense Sub-Head</h2>
      <form action={async (formData) => {
        await createExpenseSubHead(formData);
        showToast("Sub-Head added!");
        refresh();
      }} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Sub-Head Name</label>
          <input name="name" placeholder="e.g., Antivirus License" required className="input-premium" />
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-500 mb-1">Under Head</label>
          <select name="headId" required className="input-premium cursor-pointer">
            <option value="">Select Head</option>
            {heads.map((h: any) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 whitespace-nowrap">
          Add Sub-Head
        </button>
      </form>

      <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="table-premium">
          <thead>
            <tr>
              <th>Sub-Head Name</th>
              <th>Under Head</th>
            </tr>
          </thead>
          <tbody>
            {subHeads.map((sh: any) => (
              <tr key={sh.id}>
                <td className="font-medium">{sh.name}</td>
                <td>
                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                    {sh.head.name}
                  </span>
                </td>
              </tr>
            ))}
            {subHeads.length === 0 && (
              <tr><td colSpan={2} className="text-center py-6 text-slate-500">No sub-heads added yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}