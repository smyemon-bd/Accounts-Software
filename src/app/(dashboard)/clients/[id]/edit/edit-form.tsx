"use client";

import { useRouter } from "next/navigation";
import { updateClient } from "@/server/actions/client";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";
import { ShieldCheck } from "lucide-react"; // ✅ আইকন যোগ

export function EditClientForm({ client }: { client: any }) {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    try {
      const res = await updateClient(formData);
      if (res?.success) {
        showToast("Client updated successfully!");
        setTimeout(() => {
          router.push("/masters?tab=clients"); 
          router.refresh();
        }, 1500);
      }
    } catch (error: any) {
      showToast(error.message || "Failed to update client");
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
        <input name="email" type="email" defaultValue={client.email || ""} required className="input-premium" />
        <p className="text-[10px] text-slate-500 mt-1">Email is required for client portal login.</p>
      </div>

      {/* ✅ নতুন পোর্টাল পাসওয়ার্ড সেকশন */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={16} className="text-blue-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Client Portal Access</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">Set a password to allow this client to log in to the portal.</p>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {client.passwordHash ? "Change Portal Password" : "Set Portal Password"}
          </label>
          <input 
            name="portalPassword" 
            type="text" 
            placeholder={client.passwordHash ? "Leave blank to keep current password" : "Enter a password (min 6 chars)"} 
            className="input-premium" 
          />
        </div>
      </div>
      
      <div className="pt-4">
        <SubmitButton>Update Client</SubmitButton>
      </div>
    </form>
  );
}