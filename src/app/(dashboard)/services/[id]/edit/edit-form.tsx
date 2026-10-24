"use client";

import { useRouter } from "next/navigation";
import { updateService } from "@/server/actions/service";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";

export function EditServiceForm({ service }: { service: any }) {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    const res = await updateService(formData);
    if (res?.success) {
      showToast("Service updated successfully!");
      setTimeout(() => {
        router.push("/masters?tab=services"); // <-- Masters-এ ফিরে যাবে
        router.refresh();
      }, 1500);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={service.id} />
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Name</label>
        <input name="name" defaultValue={service.name} required className="input-premium" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (৳)</label>
        <input name="price" type="number" step="0.01" defaultValue={service.price} required className="input-premium" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea name="description" defaultValue={service.description || ""} rows={4} className="input-premium resize-none" />
      </div>
      
      <div className="pt-2">
        <SubmitButton>Update Service</SubmitButton>
      </div>
    </form>
  );
}