"use client";

import { useState } from "react";
import { createHardwareSale, updateHardwareSale, deleteHardwareSale } from "@/server/actions/inventory";
import { useToast } from "@/components/toast-provider";
import { MonitorSmartphone, Plus, FileText, Edit, Trash2, X } from "lucide-react";
import Link from "next/link";

export function HardwareSalesList({ clients, products, sales }: { clients: any[], products: any[], sales: any[] }) {
  const { showToast } = useToast();
  
  // নতুন সেলের জন্য স্টেট
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  
  // এডিট সেলের জন্য স্টেট
  const [editingSale, setEditingSale] = useState<any>(null);

  // প্রোডাক্ট চেঞ্জ হ্যান্ডলার (অটো প্রাইস)
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedProduct(pId);
    const prod = products.find(p => p.id === pId);
    if (prod) setUnitPrice(prod.sellPrice.toString());
    else setUnitPrice("");
  };

  const calculateTotal = () => {
    return (Number(qty) * Number(unitPrice)) - Number(discount);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sale? Stock will be restored.")) return;
    const res = await deleteHardwareSale(id);
    if (res.success) showToast("Sale deleted and stock restored!");
  };

  return (
    <div className="space-y-6">
      {/* New Sale Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 dark:bg-purple-900/30 p-2.5 rounded-xl">
            <Plus className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Hardware Sale</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Sell hardware products to clients.</p>
          </div>
        </div>
        
        <form action={async (formData) => {
          await createHardwareSale(formData);
          showToast("Sale recorded successfully!");
        }} className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <select name="clientId" required className="input-premium cursor-pointer appearance-none">
            <option value="">Select Client</option>
            {clients.map(c => <option key={c.id} value={c.id} className="dark:bg-slate-900">{c.name}</option>)}
          </select>
          
          <select name="productId" required onChange={handleProductChange} className="input-premium cursor-pointer appearance-none">
            <option value="">Select Product</option>
            {products.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name} (Stock: {p.stockQty})</option>)}
          </select>
          
          <input name="qty" type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} required className="input-premium" />
          
          <input name="unitPrice" type="number" step="0.01" value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="Unit Price" required className="input-premium" />
          
          <input name="discount" type="number" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Discount" className="input-premium" />
          
          <div className="flex flex-col justify-center px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total</span>
            <span className="font-bold text-lg text-slate-800 dark:text-white">৳ {calculateTotal().toLocaleString()}</span>
          </div>

          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30 active:scale-[0.98] md:col-span-6">
            Sell Product
          </button>
        </form>
      </div>

      {/* Sales List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
            <MonitorSmartphone className="text-slate-600 dark:text-slate-300" size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Hardware Sales</h2>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th className="text-right">Discount</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td className="text-slate-600 dark:text-slate-300 text-xs">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </td>
                    <td className="font-medium text-slate-900 dark:text-slate-100">{sale.client.name}</td>
                    <td className="text-slate-600 dark:text-slate-400">{sale.items.map((i: any) => i.product.name).join(", ")}</td>
                    <td className="text-slate-600 dark:text-slate-300">{sale.items.reduce((sum: number, i: any) => sum + i.qty, 0)}</td>
                    <td className="text-right text-slate-500">৳ {Number(sale.discount || 0).toLocaleString()}</td>
                    <td className="text-right font-bold text-green-600 dark:text-green-400">৳ {Number(sale.total).toLocaleString()}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/hardware-sales/${sale.id}/invoice`} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors" title="Invoice">
                          <FileText size={14} />
                        </Link>
                        <button onClick={() => setEditingSale(sale)} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors" title="Edit Sale">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(sale.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors" title="Delete Sale">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {sales.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <MonitorSmartphone size={40} className="mb-3 opacity-20" />
                        <p className="text-base font-medium">No hardware sales yet</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Sale Modal */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setEditingSale(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Edit Hardware Sale</h2>
            <form action={async (formData) => {
              const res = await updateHardwareSale(formData);
              if (res.success) {
                showToast("Sale updated!");
                setEditingSale(null);
              }
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingSale.id} />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Product</label>
                <select name="productId" defaultValue={editingSale.items[0]?.productId} required className="input-premium">
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                  <input name="qty" type="number" min="1" defaultValue={editingSale.items[0]?.qty} required className="input-premium" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Unit Price</label>
                  <input name="unitPrice" type="number" step="0.01" defaultValue={Number(editingSale.items[0]?.unitPrice)} required className="input-premium" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Discount</label>
                <input name="discount" type="number" step="0.01" defaultValue={Number(editingSale.discount || 0)} className="input-premium" />
              </div>
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/30 mt-2">
                Update Sale
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}