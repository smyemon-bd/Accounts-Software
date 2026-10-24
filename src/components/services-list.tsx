"use client";

import { useState, useEffect } from "react";
import { createService, deleteService, toggleServiceStatus, getServices } from "@/server/actions/service";
import { useToast } from "@/components/toast-provider";
import Link from "next/link";
import { Briefcase, Edit, Trash2, Eye, EyeOff, Plus, Search } from "lucide-react";
import { SearchBar } from "@/components/search-bar";

export function ServicesList({ initialServices }: { initialServices: any[] }) {
  const { showToast } = useToast();
  const [services, setServices] = useState<any[]>(initialServices);
  const [searchTerm, setSearchTerm] = useState("");

  async function handleAction(actionFn: () => Promise<any>, successMsg: string) {
    await actionFn();
    showToast(successMsg);
    const updated = await getServices();
    setServices(updated);
  }

  // সার্চ ফিল্টার
  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Add Service Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <Plus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Service</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add a new service to your catalog.</p>
          </div>
        </div>
        
        <form action={async (formData) => {
          await handleAction(async () => await createService(formData), "Service added successfully!");
        }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input name="name" placeholder="Service Name" required className="input-premium" />
          <input name="price" type="number" step="0.01" placeholder="Price (৳)" required className="input-premium" />
          <input name="description" placeholder="Short Description" className="input-premium" />
          <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]">
            Add Service
          </button>
        </form>
      </div>

      {/* Services List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
              <Briefcase className="text-slate-600 dark:text-slate-300" size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Services Catalog</h2>
          </div>
          
          <SearchBar placeholder="Search services..." />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Service Name</th>
                  <th>Description</th>
                  <th className="text-right">Price</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(s => (
                  <tr key={s.id}>
                    <td className="font-semibold text-slate-900 dark:text-slate-100">{s.name}</td>
                    <td className="text-slate-500 dark:text-slate-400 max-w-[300px] truncate">{s.description || "N/A"}</td>
                    <td className="text-right font-bold text-blue-600 dark:text-blue-400">৳ {Number(s.price).toLocaleString()}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                        s.isActive 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {s.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAction(async () => await toggleServiceStatus(s.id, s.isActive), `Service ${s.isActive ? 'hidden' : 'shown'}!`)}
                          title={s.isActive ? "Hide Service" : "Show Service"}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          {s.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <Link 
                          href={`/services/${s.id}/edit`}
                          title="Edit Service"
                          className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                        >
                          <Edit size={14} />
                        </Link>
                        <button 
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this service?")) {
                              handleAction(async () => await deleteService(s.id), "Service deleted!");
                            }
                          }}
                          title="Delete Service"
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-500">
                      <Briefcase size={32} className="mx-auto mb-2 opacity-30" />
                      <p>No services found.</p>
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