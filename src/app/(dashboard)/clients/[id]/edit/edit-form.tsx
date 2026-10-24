"use client";

import { useRouter } from "next/navigation";
import { updateClient } from "@/server/actions/client";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";

export function EditClientForm({ client }: { client: any }) {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    const res = await updateClient(formData);
    if (res?.success) {
      showToast("Client updated successfully!");
      setTimeout(() => {
        router.push("/masters?tab=clients"); // <-- Masters-এ ফিরে যাবে
        router.refresh();
      }, 1500);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={client.id} />
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
        <input name="name" defaultValue={client.name} required className="input-premium" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
        <input name="phone" defaultValue={client.phone || ""} className="input-premium" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
        <input name="email" type="email" defaultValue={client.email || ""} className="input-premium" />
      </div>
      
      <div className="pt-2">
        <SubmitButton>Update Client</SubmitButton>
      </div>
    </form>
  );
}