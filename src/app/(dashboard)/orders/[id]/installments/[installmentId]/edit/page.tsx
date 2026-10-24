import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditInstallmentForm } from "./edit-form";

export default async function EditInstallmentPage({ 
  params 
}: { 
  params: Promise<{ id: string, installmentId: string }> 
}) {
  const resolvedParams = await params;
  
  const installment = await prisma.installment.findUnique({
    where: { id: resolvedParams.installmentId }
  });

  if (!installment) notFound();

  const serializableInstallment = {
    ...installment,
    amount: Number(installment.amount),
    paidAmount: Number(installment.paidAmount)
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10">
      <Link 
        href={`/orders/${resolvedParams.id}`} 
        className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        ← Back to Order
      </Link>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Edit Installment</h1>
        <EditInstallmentForm installment={serializableInstallment} orderId={resolvedParams.id} />
      </div>
    </div>
  );
}