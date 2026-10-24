import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";
import { getSettings } from "@/server/actions/settings";

export default async function ExpenseReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const expense = await prisma.expense.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!expense) notFound();

  const settings = await getSettings();

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-8 print:py-0 print:max-w-full">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/expenses" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          ← Back to Expenses
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white text-slate-800 shadow-2xl rounded-sm overflow-hidden print:shadow-none relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
        
        <div className="pt-10 pb-8 px-10">
          <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {settings.companyName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">{settings.companyName}</h1>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-red-600 uppercase">{settings.companySub}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">{settings.address}<br />Phone: {settings.phone} | Email: {settings.email}</p>
            </div>

            <div className="text-right mt-2">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">RECEIPT</h2>
            </div>
          </div>

          <div className="flex justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Expense Details</p>
              <h3 className="font-bold text-lg text-slate-900">{expense.title}</h3>
              <p className="text-xs text-slate-600 mt-1">Category: {expense.category}</p>
              <p className="text-xs text-slate-600">Notes: {expense.notes || "N/A"}</p>
            </div>
            
            <div className="text-right flex flex-col justify-end">
              <div className="mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date</span>
                <span className="text-sm font-medium text-slate-800">{expense.date.toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Receipt No</span>
                <span className="text-sm font-medium text-slate-800">{expense.id.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 py-4 px-6 rounded-xl flex justify-between items-center mb-8">
            <span className="text-sm font-bold text-slate-700">Total Amount Paid</span>
            <span className="text-2xl font-black text-red-600">৳ {Number(expense.amount).toLocaleString()}</span>
          </div>

          <div className="text-center text-xs text-slate-500 mb-8">
            <p>This is a computer-generated receipt.</p>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-100 flex items-center justify-between px-10 py-3 text-slate-500">
          <div className="text-xs font-bold uppercase tracking-wider">ByteFlow Technologies</div>
          <div className="text-[10px]">{settings.phone}</div>
        </div>
      </div>
    </div>
  );
}