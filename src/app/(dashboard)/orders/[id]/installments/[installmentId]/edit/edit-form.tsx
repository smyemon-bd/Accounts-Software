"use client";

import { useRouter } from "next/navigation";
import { updateInstallment } from "@/server/actions/order";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";

export function EditInstallmentForm({ installment, orderId }: { installment: any, orderId: string }) {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    const res = await updateInstallment(formData);
    
    if (res?.success) {
      showToast("Installment updated successfully!");
      setTimeout(() => {
        router.push(`/orders/${orderId}`);
        router.refresh();
      }, 1500);
    }
  }

  // Date ফরম্যাট YYYY-MM-DD করতে হবে ইনপুটের জন্য
  const formattedDate = new Date(installment.dueDate).toISOString().split('T')[0];

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="id" value={installment.id} />
      <input type="hidden" name="orderId" value={orderId} />
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
        <input 
          name="dueDate" 
          type="date" 
          defaultValue={formattedDate} 
          required 
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (৳)</label>
        <input 
          name="amount" 
          type="number" 
          step="0.01" 
          defaultValue={installment.amount} 
          required 
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
        />
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">Note: The total installment amount should match the order's total amount. Adjusting this will affect the balance calculation.</p>
      </div>
      
      <div className="pt-2">
        <SubmitButton>
          Update Installment
        </SubmitButton>
      </div>
    </form>
  );
}