import { getClientSession, updateClientProfile } from "@/server/actions/portal";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";

export default async function ClientProfilePage() {
  const client = await getClientSession();
  if (!client) redirect("/portal/login");

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateClientProfile(formData);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">My Profile</h1>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
            <input name="name" defaultValue={client.name} required className="input-premium" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
            <input defaultValue={client.email || ""} disabled className="input-premium opacity-50 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Phone Number</label>
            <input name="phone" defaultValue={client.phone || ""} className="input-premium" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-500 mb-1">Address</label>
            <input name="address" defaultValue={client.address || ""} className="input-premium" />
          </div>
          <SubmitButton>Update Profile</SubmitButton>
        </form>
      </div>
    </div>
  );
}