"use client";

import { createClient } from "@/server/actions/client";
import Link from "next/link";
import { FileText, Edit, Search, UserPlus, X } from "lucide-react";
import { SearchBar } from "@/components/search-bar";

export function ClientsList({ clients, query }: { clients: any[], query: string }) {
  return (
    <div className="space-y-6">
      {/* Add Client Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <UserPlus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Client</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add a new customer to your database.</p>
          </div>
        </div>
        
        <form action={createClient} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" placeholder="Client Name" required className="input-premium" />
          <input name="phone" placeholder="Phone Number" className="input-premium" />
          <input name="email" type="email" placeholder="Email Address" className="input-premium" />
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]">
            Add Client
          </button>
        </form>
      </div>

      {/* Clients List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
        
        {/* Search Bar */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <SearchBar placeholder="Search by name, phone or email..." />
          
          {query && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing results for "<span className="font-semibold text-slate-800 dark:text-white">{query}</span>"
            </p>
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</td>
                    <td>{c.phone || <span className="text-slate-400 dark:text-slate-600">N/A</span>}</td>
                    <td>{c.email || <span className="text-slate-400 dark:text-slate-600">N/A</span>}</td>
                    <td className="text-xs font-medium">{c.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/clients/${c.id}/statement`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs font-semibold transition-colors border border-blue-100 dark:border-blue-800/50"
                        >
                          <FileText size={14} /> Statement
                        </Link>
                        <Link 
                          href={`/clients/${c.id}/edit`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg text-xs font-semibold transition-colors border border-amber-100 dark:border-amber-800/50"
                        >
                          <Edit size={14} /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <Search size={40} className="mx-auto mb-3 opacity-20" />
                      <p className="text-base font-medium">No clients found</p>
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