"use client";

import { useRouter } from "next/navigation";
import { updatePayment } from "@/server/actions/payment";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";

export function EditPaymentForm({ payment }: { payment: any }) {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    const res = await updatePayment(formData);
    
    if (res?.success) {
      showToast("Payment updated successfully!");
      setTimeout(() => {
        router.push("/payments");
        router.refresh();
      }, 1500);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <input type="hidden" name="id" value={payment.id} />
      <input type="hidden" name="orderId" value={payment.serviceOrderId} />
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (৳)</label>
        <input name="amount" type="number" step="0.01" defaultValue={payment.amount} required className="input-premium" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
        <select name="method" defaultValue={payment.method} className="input-premium cursor-pointer">
          <option value="CASH">Cash</option>
          <option value="BANK">Bank</option>
          <option value="MOBILE">Mobile</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference (Optional)</label>
        <input name="reference" defaultValue={payment.reference || ""} className="input-premium" />
      </div>
      
      <div className="pt-2">
        <SubmitButton>Update Payment</SubmitButton>
      </div>
    </form>
  );
}