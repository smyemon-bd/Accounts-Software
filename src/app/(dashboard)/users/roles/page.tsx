import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { createRole, updateRolePermissions } from "@/server/actions/role";
import Link from "next/link";
import { Shield, Plus, Users } from "lucide-react";
import { RolePermissionsForm } from "./role-permissions-form";

export default async function RolesPage() {
  await requirePermission("dashboard.admin");

  const roles = await prisma.role.findMany({
    include: {
      _count: { select: { users: true } },
      permissions: { include: { permission: true } },
    },
    orderBy: { name: "asc" },
  });

  const allPermissions = await prisma.permission.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="text-blue-500" /> Roles & Permissions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage user roles and customize their access levels.
          </p>
        </div>
        <Link href="/users" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
          <Users size={16} /> Back to Users
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Create Role Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
                <Plus className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Role</h2>
            </div>

            <form action={createRole} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role Name</label>
                <input name="name" placeholder="e.g., SALES_MANAGER" required className="input-premium uppercase" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                <textarea name="description" placeholder="Role description..." rows={3} className="input-premium resize-none" />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
                Create Role
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Roles List & Permissions */}
        <div className="lg:col-span-2 space-y-6">
          {roles.map(role => (
            <div key={role.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {role.name}
                    {role.name === "SUPER_ADMIN" && (
                      <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">Full Access</span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{role.description || "No description provided."}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Users size={16} className="text-slate-500" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{role._count.users} Users</span>
                </div>
              </div>

              {/* Permissions Form */}
              {role.name !== "SUPER_ADMIN" ? (
                <RolePermissionsForm 
                  role={role} 
                  allPermissions={allPermissions} 
                  updateAction={updateRolePermissions}
                />
              ) : (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl text-indigo-700 dark:text-indigo-300 text-sm font-medium flex items-center gap-2">
                  <Shield size={18} /> This role has super admin access to everything. Permissions cannot be modified.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}