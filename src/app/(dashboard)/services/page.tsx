"use client";

import { useState, useEffect } from "react";
import { createService, deleteService, toggleServiceStatus, getServices } from "@/server/actions/service";
import { useToast } from "@/components/toast-provider";
import Link from "next/link";
import { Briefcase, Edit, Trash2, Eye, EyeOff, Plus } from "lucide-react";

export default function ServicesPage() {
  const { showToast } = useToast();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ডেটা লোড করা
  useEffect(() => {
    getServices().then(data => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  // অ্যাকশন হ্যান্ডলার
  async function handleAction(actionFn: () => Promise<any>, successMsg: string) {
    await actionFn();
    showToast(successMsg);
    const updated = await getServices();
    setServices(updated);
  }

  if (loading) return <div className="p-10 text-center text-slate-500 dark:text-slate-400">Loading services...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Services</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage the services you offer to clients.</p>
        </div>
      </div>

      {/* Add Service Form */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
            <Plus className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Service</h2>
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

      {/* Services Grid - নতুন প্রিমিয়াম ডিজাইন */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <div 
            key={s.id} 
            className="group relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
          >
            {/* হোভার করলে কার্ডের উপরে একটি হালকা নীল আভা (Glow) তৈরি হবে */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>

            <div>
              <div className="flex justify-between items-start mb-5">
                {/* আইকন ডিজাইন */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3.5 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Briefcase className="text-white" size={22} />
                </div>
                
                {/* Status Badge */}
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-extrabold ${
                  s.isActive 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}>
                  {s.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              
              <h3 className="font-bold text-xl text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{s.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2 min-h-[40px] leading-relaxed">
                {s.description || "No description provided for this service."}
              </p>
              
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-1">Price</p>
                  <p className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                    ৳ {Number(s.price).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              {/* Hide/Show Toggle */}
              <button 
                onClick={() => handleAction(async () => await toggleServiceStatus(s.id, s.isActive), `Service ${s.isActive ? 'hidden' : 'shown'} successfully!`)}
                title={s.isActive ? "Hide Service" : "Show Service"}
                className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white transition-all duration-200"
              >
                {s.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {/* Edit Button */}
              <Link 
                href={`/services/${s.id}/edit`}
                title="Edit Service"
                className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white transition-all duration-200 shadow-sm"
              >
                <Edit size={18} />
              </Link>

              {/* Delete Button */}
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to delete this service?")) {
                    handleAction(async () => await deleteService(s.id), "Service deleted successfully!");
                  }
                }}
                title="Delete Service"
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all duration-200 shadow-sm"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {services.length === 0 && (
          <div className="col-span-full text-center py-20 glass-panel rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <Briefcase size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No services yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Add your first service using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
}