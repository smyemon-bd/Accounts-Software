"use client";

import { updateProfile } from "@/server/actions/user";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";
import { useState } from "react";

export function ProfileForm({ user }: { user: any }) {
  const { showToast } = useToast();
  const [preview, setPreview] = useState(user.image || "");

  async function handleUpdateProfile(formData: FormData) {
    const res = await updateProfile(formData);
    if (res?.success) {
      showToast("Profile updated successfully!");
      window.location.reload();
    }
  }

  // Date ফরম্যাট YYYY-MM-DD
  const dobFormatted = user.dob ? new Date(user.dob).toISOString().split('T')[0] : "";

  return (
    <form action={handleUpdateProfile} className="space-y-5">
      {/* Profile Image */}
      <div className="flex items-center gap-6">
        <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
          {preview ? <img src={preview} alt="Profile" className="h-full w-full object-cover" /> : user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Profile Image</label>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-300" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <input name="name" defaultValue={user.name} required className="input-premium" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <input defaultValue={user.email} disabled className="input-premium opacity-50 cursor-not-allowed" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
          <input name="phone" defaultValue={user.phone || ""} placeholder="+880 1700-000000" className="input-premium" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
          <input name="dob" type="date" defaultValue={dobFormatted} className="input-premium" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
        <input name="address" defaultValue={user.address || ""} placeholder="Your full address" className="input-premium" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Short Bio</label>
        <textarea name="bio" defaultValue={user.bio || ""} rows={3} placeholder="Tell something about yourself..." className="input-premium resize-none" />
      </div>

      <div className="pt-2">
        <SubmitButton>Save Profile</SubmitButton>
      </div>
    </form>
  );
}