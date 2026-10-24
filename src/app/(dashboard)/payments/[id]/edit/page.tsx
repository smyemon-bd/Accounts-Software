import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditPaymentForm } from "./edit-form";

export default async function EditPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const payment = await prisma.payment.findUnique({
    where: { id: resolvedParams.id },
  });

  if (!payment) notFound();

  const serializablePayment = {
    ...payment,
    amount: Number(payment.amount),
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10">
      <Link href="/payments" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
        ← Back to Payments
      </Link>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Edit Payment</h1>
        <EditPaymentForm payment={serializablePayment} />
      </div>
    </div>
  );
}