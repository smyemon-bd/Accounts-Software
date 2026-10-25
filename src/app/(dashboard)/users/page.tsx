import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { createUser, toggleUserStatus } from "@/server/actions/user";
import { UserPlus, Shield, CheckCircle2, XCircle } from "lucide-react";
import { UserPasswordReset } from "@/components/user-password-reset";
import Link from "next/link";

export default async function UsersPage() {
  await requirePermission("user.read");
  
  const users = await prisma.user.findMany({ 
    include: { role: true }, 
    orderBy: { createdAt: "desc" } 
  });
  
  const roles = await prisma.role.findMany();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Users</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your team members and their roles.</p>
        </div>
        
        {/* ✅ Manage Roles বাটন */}
        <Link 
          href="/users/roles" 
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <Shield size={16} /> Manage Roles
        </Link>
      </div>

      {/* Add User Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <UserPlus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New User</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create a new user and assign a role.</p>
          </div>
        </div>
        
        <form action={createUser} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input 
            name="name" 
            placeholder="Full Name" 
            required 
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email Address" 
            required 
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            required 
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
          />
          <select 
            name="roleId" 
            required 
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
          >
            <option value="">Select Role</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]">
            Add User
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
            <Shield className="text-slate-600 dark:text-slate-300" size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Team Members</h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="font-medium text-slate-900 dark:text-slate-100">{u.name}</td>
                    <td className="text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {u.role.name}
                      </span>
                    </td>
                    <td>
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <UserPasswordReset userId={u.id} userName={u.name} />
                        <form action={async () => {
                          "use server";
                          await toggleUserStatus(u.id, u.isActive);
                        }}>
                          <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            u.isActive 
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' 
                              : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40'
                          }`}>
                            {u.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <Shield size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-base font-medium">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}