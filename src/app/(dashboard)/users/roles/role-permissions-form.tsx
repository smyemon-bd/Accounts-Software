"use client";

import { useState } from "react";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";
import { Check } from "lucide-react";

export function RolePermissionsForm({ role, allPermissions, updateAction }: { 
  role: any; 
  allPermissions: any[]; 
  updateAction: (formData: FormData) => Promise<any> 
}) {
  const { showToast } = useToast();
  
  // বর্তমানে রোলের যে পারমিশনগুলো আছে, সেগুলোর ID লিস্ট
  const currentPermissionIds = role.permissions.map((p: any) => p.permissionId);

  async function handleSubmit(formData: FormData) {
    const res = await updateAction(formData);
    if (res?.success) {
      showToast(`Permissions updated for ${role.name}!`);
    }
  }

  // পারমিশনগুলোকে গ্রুপ করা (যেমন: user.*, client.*)
  const groupedPermissions = allPermissions.reduce((acc: any, perm: any) => {
    const group = perm.key.split('.')[0];
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="roleId" value={role.id} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {Object.entries(groupedPermissions).map(([group, perms]: [string, any]) => (
          <div key={group} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
              {group} Management
            </h4>
            <div className="space-y-2.5">
              {perms.map((perm: any) => (
                <label key={perm.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      name="permissions" 
                      value={perm.id} 
                      defaultChecked={currentPermissionIds.includes(perm.id)}
                      className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
                    />
                    <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {perm.key.split('.')[1].toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
        <SubmitButton className="w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-6 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
          Save Permissions
        </SubmitButton>
      </div>
    </form>
  );
}