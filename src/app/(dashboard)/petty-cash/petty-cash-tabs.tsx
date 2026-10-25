"use client";

import { useState } from "react";
import { ArrowRightLeft, Receipt } from "lucide-react";
import { PettyCashForm } from "./petty-cash-form";
import { PettyCashExpenseForm } from "./expense-form";

export function PettyCashTabs({ 
  mainAccounts, 
  pettyCashAccounts, 
  categories, 
  heads, 
  subHeads 
}: { 
  mainAccounts: any[], 
  pettyCashAccounts: any[], 
  categories: any[], 
  heads: any[], 
  subHeads: any[] 
}) {
  const [activeTab, setActiveTab] = useState("transfer");

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Tabs Header */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("transfer")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "transfer" 
              ? "border-green-500 text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/10" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          <ArrowRightLeft size={18} /> Transfer Funds
        </button>
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "expense" 
              ? "border-red-500 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/10" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          <Receipt size={18} /> Record Expense
        </button>
      </div>

      {/* Tabs Content */}
      <div className="p-6">
        {activeTab === "transfer" && (
          <div className="animate-in fade-in duration-300">
            <PettyCashForm mainAccounts={mainAccounts} pettyCashAccounts={pettyCashAccounts} />
          </div>
        )}
        
        {activeTab === "expense" && (
          <div className="animate-in fade-in duration-300">
            <PettyCashExpenseForm 
              pettyCashAccounts={pettyCashAccounts} 
              categories={categories} 
              heads={heads} 
              subHeads={subHeads} 
            />
          </div>
        )}
      </div>
    </div>
  );
}