import { prisma } from "@/lib/prisma";
import { BulkPaymentForm } from "./bulk-payment-form";
import { Layers } from "lucide-react";
import Link from "next/link";

export default async function BulkPaymentsPage() {
  // ক্লায়েন্ট এবং পেমেন্ট অ্যাকাউন্টগুলো আনা হচ্ছে ফর্মের জন্য
  const [clients, paymentAccounts] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, phone: true } }),
    prisma.paymentAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="text-blue-500" /> Bulk Payment Entry
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Record multiple payments at once.</p>
        </div>
        <Link href="/payments" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
          ← Back to Payments
        </Link>
      </div>

      <BulkPaymentForm clients={clients} paymentAccounts={paymentAccounts} />
    </div>
  );
}