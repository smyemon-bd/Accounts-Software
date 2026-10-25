"use client";

import { useState } from "react";
import { 
  createProduct, createDistributor, createPurchase, 
  updateProduct, deleteProduct, toggleProductStatus,
  updateDistributor, deleteDistributor, toggleDistributorStatus
} from "@/server/actions/inventory";
import { useToast } from "@/components/toast-provider";
import { Package, Truck, Plus, Boxes, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";
import ExportButton from "@/components/export-button";

export function InventoryList({ 
  products, 
  distributors,
  paymentAccounts = [],
  activeTab = "products" 
}: { 
  products: any[], 
  distributors: any[],
  paymentAccounts?: any[],
  activeTab?: string 
}) {
  const { showToast } = useToast();
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingDistributor, setEditingDistributor] = useState<any>(null);

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const res = await deleteProduct(id);
    if (res.success) showToast("Product deleted!");
    else showToast(res.error || "Failed to delete product");
  };

  const handleDeleteDistributor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this distributor?")) return;
    const res = await deleteDistributor(id);
    if (res.success) showToast("Distributor deleted!");
    else showToast(res.error || "Failed to delete distributor");
  };

  const handleToggleProduct = async (id: string, currentStatus: boolean) => {
    const res = await toggleProductStatus(id, currentStatus);
    if (res.success) showToast(`Product ${currentStatus ? 'hidden' : 'shown'} successfully!`);
  };

  const handleToggleDistributor = async (id: string, currentStatus: boolean) => {
    const res = await toggleDistributorStatus(id, currentStatus);
    if (res.success) showToast(`Distributor ${currentStatus ? 'hidden' : 'shown'} successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* ================= PRODUCTS TAB ================= */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
            {/* Add Product Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
                  <Boxes className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Product</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Add a new product to your inventory.</p>
                </div>
              </div>
              
              <form action={createProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="sku" placeholder="SKU (e.g. HW-001)" required className="input-premium" />
                  <input name="name" placeholder="Product Name" required className="input-premium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="costPrice" type="number" step="0.01" placeholder="Cost Price" required className="input-premium" />
                  <input name="sellPrice" type="number" step="0.01" placeholder="Sell Price" required className="input-premium" />
                </div>
                <input name="stockQty" type="number" placeholder="Initial Stock Qty" required className="input-premium" />
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]">
                  Save Product
                </button>
              </form>
            </div>

            {/* Purchase Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 transition-colors">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl">
                  <Plus className="text-indigo-600 dark:text-indigo-400" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">New Purchase (Add Stock)</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Buy products from distributors.</p>
                </div>
              </div>
              
              <form action={createPurchase} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <select name="distributorId" required className="input-premium cursor-pointer appearance-none">
                    <option value="">Select Distributor</option>
                    {distributors.map(d => <option key={d.id} value={d.id} className="dark:bg-slate-900">{d.name}</option>)}
                  </select>
                  <select name="productId" required className="input-premium cursor-pointer appearance-none">
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="qty" type="number" placeholder="Quantity" required className="input-premium" />
                  <input name="unitCost" type="number" step="0.01" placeholder="Unit Cost" required className="input-premium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <select name="paymentAccountId" className="input-premium cursor-pointer appearance-none">
                    <option value="">Payment Account (Optional)</option>
                    {paymentAccounts?.map((acc: any) => (
                      <option key={acc.id} value={acc.id} className="dark:bg-slate-900">{acc.name} ({acc.type})</option>
                    ))}
                  </select>
                  <select name="isCredit" className="input-premium cursor-pointer appearance-none">
                    <option value="false">Instant Payment</option>
                    <option value="true">Credit (Due)</option>
                  </select>
                </div>
                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-[0.98]">
                  Purchase
                </button>
              </form>
            </div>
          </div>

          {/* Product Stock Report */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors print:p-0 print:border-0 print:shadow-none">
            
            {/* Report Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-6 border-b-4 border-slate-800 dark:border-slate-200 print:flex-row print:items-end">
              <div>
                <h2 className="text-4xl font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">
                  Inventory<br/>Valuation
                </h2>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-4 uppercase tracking-widest">
                  ByteFlow Technologies
                </p>
              </div>
              
              <div className="text-left md:text-right mt-4 md:mt-0 print:text-right">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Generated Date</p>
                <p className="text-lg font-medium text-slate-800 dark:text-white">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date().toLocaleTimeString()}</p>
                <div className="print:hidden mt-4 md:mt-6 flex justify-end gap-2">
                  <ExportButton 
                    data={products.map(p => ({
                      SKU: p.sku,
                      Name: p.name,
                      CostPrice: Number(p.costPrice),
                      SellPrice: Number(p.sellPrice),
                      StockQty: p.stockQty,
                      TotalValue: Number(p.sellPrice) * p.stockQty
                    }))} 
                    filename="ByteFlow_Inventory_Report" 
                  />
                  <PrintButton />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 print:hidden">
              <div className="border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-r-xl">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Purchase Value</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {products.reduce((sum, p) => sum + (Number(p.costPrice) * p.stockQty), 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Based on cost price</p>
              </div>
              
              <div className="border-l-4 border-green-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-r-xl">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Sale Value</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {products.reduce((sum, p) => sum + (Number(p.sellPrice) * p.stockQty), 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Expected revenue</p>
              </div>

              <div className="border-l-4 border-purple-500 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-r-xl">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Estimated Profit</p>
                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                  {products.reduce((sum, p) => sum + ((Number(p.sellPrice) - Number(p.costPrice)) * p.stockQty), 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">If all stock is sold</p>
              </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full text-left border-collapse border border-slate-300 dark:border-slate-700">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    <th className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-bold uppercase tracking-wider">SKU</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-bold uppercase tracking-wider">Product Name</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-bold uppercase tracking-wider text-right">Cost</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-bold uppercase tracking-wider text-right">Sell</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-bold uppercase tracking-wider text-right">Stock</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-bold uppercase tracking-wider text-right">Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-slate-300 dark:border-slate-700">
                      <td className="border border-slate-300 dark:border-slate-700 p-3 text-xs font-mono text-slate-600 dark:text-slate-400">{p.sku}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-3 text-sm text-right text-slate-700 dark:text-slate-300">{Number(p.costPrice).toLocaleString()}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-3 text-sm text-right text-slate-700 dark:text-slate-300">{Number(p.sellPrice).toLocaleString()}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-3 text-sm text-right font-bold text-slate-800 dark:text-slate-200">{p.stockQty}</td>
                      <td className="border border-slate-300 dark:border-slate-700 p-3 text-sm text-right font-bold text-slate-800 dark:text-slate-200">{(Number(p.sellPrice) * p.stockQty).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer for Print */}
            <div className="hidden print:block mt-12 pt-4 border-t border-slate-300 text-center text-xs text-slate-500">
              <p>This is a computer-generated inventory valuation report.</p>
              <p className="mt-1">ByteFlow Technologies &copy; {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      )}

      {/* ================= DISTRIBUTORS TAB ================= */}
      {activeTab === "distributors" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 md:p-8 transition-colors print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
                <Truck className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Add New Distributor</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Add a supplier to your database.</p>
              </div>
            </div>
            
            <form action={createDistributor} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="name" placeholder="Distributor Name" required className="input-premium" />
              <input name="phone" placeholder="Phone Number (Optional)" className="input-premium" />
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98]">
                Save Distributor
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                <Truck className="text-slate-600 dark:text-slate-300" size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Distributors List</h2>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
              <div className="overflow-x-auto">
                <table className="table-premium">
                  <thead>
                    <tr>
                      <th>Distributor Name</th>
                      <th>Phone Number</th>
                      <th>Status</th>
                      <th className="text-right">Joined Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributors.map(d => (
                      <tr key={d.id}>
                        <td className="font-medium text-slate-900 dark:text-slate-100">{d.name}</td>
                        <td>{d.phone || <span className="text-slate-400 dark:text-slate-600">N/A</span>}</td>
                        <td>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                            d.isActive 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {d.isActive ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleToggleDistributor(d.id, d.isActive)} title={d.isActive ? "Hide Distributor" : "Show Distributor"} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                              {d.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => setEditingDistributor(d)} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteDistributor(d.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT PRODUCT MODAL ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setEditingProduct(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Edit Product</h2>
            <form action={async (formData) => {
              const res = await updateProduct(formData);
              if (res.success) {
                showToast("Product updated!");
                setEditingProduct(null);
              }
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingProduct.id} />
              <input name="sku" defaultValue={editingProduct.sku} required className="input-premium" />
              <input name="name" defaultValue={editingProduct.name} required className="input-premium" />
              <input name="costPrice" type="number" step="0.01" defaultValue={editingProduct.costPrice} required className="input-premium" />
              <input name="sellPrice" type="number" step="0.01" defaultValue={editingProduct.sellPrice} required className="input-premium" />
              <input name="stockQty" type="number" defaultValue={editingProduct.stockQty} required className="input-premium" />
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT DISTRIBUTOR MODAL ================= */}
      {editingDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setEditingDistributor(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Edit Distributor</h2>
            <form action={async (formData) => {
              const res = await updateDistributor(formData);
              if (res.success) {
                showToast("Distributor updated!");
                setEditingDistributor(null);
              }
            }} className="space-y-4">
              <input type="hidden" name="id" value={editingDistributor.id} />
              <input name="name" defaultValue={editingDistributor.name} required className="input-premium" />
              <input name="phone" defaultValue={editingDistributor.phone || ""} className="input-premium" />
              <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                Update Distributor
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}