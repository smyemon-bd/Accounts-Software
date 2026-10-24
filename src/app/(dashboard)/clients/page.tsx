import { prisma } from "@/lib/prisma";
import { createClient } from "@/server/actions/client";
import ExportButton from "@/components/export-button";
import Link from "next/link";
import { FileText, Edit, Search, UserPlus, X } from "lucide-react";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  const clients = await prisma.client.findMany({ 
    where: query ? {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ]
    } : {},
    orderBy: { createdAt: "desc" } 
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Clients</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage and view your customer database.</p>
        </div>
        <ExportButton 
          data={clients.map(c => ({
            ID: c.id, Name: c.name, Phone: c.phone || "", Email: c.email || "", Address: c.address || "", Joined: c.createdAt.toLocaleDateString()
          }))} 
          filename="ByteFlow_Clients" 
        />
      </div>

      {/* Add Client Form */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <UserPlus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Client</h2>
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
      <div className="glass-panel rounded-2xl p-6 md:p-8 transition-colors">
        
        {/* Search Bar - নিখুঁত ডিজাইন */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <form className="flex w-full max-w-lg gap-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                name="q" 
                defaultValue={query}
                placeholder="Search by name, phone or email..." 
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20"
                style={{ paddingLeft: '2.75rem', paddingRight: '1rem' }} // সরাসরি স্টাইল দেওয়া হলো
              />
            </div>
            <button 
              type="submit" 
              className="bg-slate-800 dark:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm shrink-0"
            >
              Search
            </button>
          </form>
          
          {query && (
            <Link href="/clients" className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors">
              <X size={16} />
              Clear Search
            </Link>
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
                    
                    {/* Action Buttons */}
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/clients/${c.id}/statement`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs font-semibold transition-colors border border-blue-100 dark:border-blue-800/50"
                        >
                          <FileText size={14} />
                          Statement
                        </Link>
                        <Link 
                          href={`/clients/${c.id}/edit`} 
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg text-xs font-semibold transition-colors border border-amber-100 dark:border-amber-800/50"
                        >
                          <Edit size={14} />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <Search size={40} className="mb-3 opacity-20" />
                        <p className="text-base font-medium">No clients found</p>
                        <p className="text-sm mt-1">Try adjusting your search for "{query}"</p>
                      </div>
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