"use client";

import { useState, useRef, useEffect } from "react";
import { createSale } from "@/server/actions/sale";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";
import { Plus, Trash2, ShoppingCart, User, CreditCard, CheckCircle } from "lucide-react";

export function SaleForm({ clients, services, products, paymentAccounts }: { 
  clients: any[], 
  services: any[], 
  products: any[], 
  paymentAccounts: any[] 
}) {
  const { showToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [clientId, setClientId] = useState("");
  const [paymentAccountId, setPaymentAccountId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);

  // Confirmation Modal States
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs for Keyboard Navigation
  const itemDiscountRefs = useRef<(HTMLInputElement | null)[]>([]);
  const globalDiscountRef = useRef<HTMLInputElement>(null);
  const paidAmountRef = useRef<HTMLInputElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  const addItem = (type: "SERVICE" | "PRODUCT") => {
    setItems([...items, { type, id: "", qty: 1, price: 0, discount: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === "id") {
      const item = newItems[index];
      if (item.type === "SERVICE") {
        const svc = services.find(s => s.id === value);
        if (svc) newItems[index].price = svc.price;
      } else {
        const prod = products.find(p => p.id === value);
        if (prod) newItems[index].price = prod.sellPrice;
      }
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    itemDiscountRefs.current = itemDiscountRefs.current.filter((_, i) => i !== index);
  };

  const subTotal = items.reduce((sum, item) => sum + (item.price * item.qty) - (item.discount || 0), 0);
  const total = subTotal - discount;
  const dueAmount = Math.max(0, total - paidAmount);

  // Keydown Handlers for Navigation
  const handleItemDiscountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (index === items.length - 1) {
        globalDiscountRef.current?.focus();
      }
    }
  };

  const handleGlobalDiscountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      paidAmountRef.current?.focus();
    }
  };

  const handlePaidAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitBtnRef.current?.focus();
      
      // setTimeout ব্যবহার করা হলো যাতে Enter চাপার পর মডাল ওপেন হতে একটু সময় নেয়
      setTimeout(() => {
        if (items.length > 0 && clientId) {
          setShowConfirm(true);
        }
      }, 100); 
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return showToast("Please add at least one item.");
    if (!clientId) return showToast("Please select a client.");
    
    const hasEmptyItem = items.some(item => !item.id);
    if (hasEmptyItem) return showToast("Please select all items from the dropdown.");

    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("clientId", clientId);
    formData.append("paymentAccountId", paymentAccountId);
    formData.append("items", JSON.stringify(items));
    formData.append("discount", discount.toString());
    formData.append("paidAmount", paidAmount.toString());

    const res = await createSale(formData);
    setIsSubmitting(false);
    setShowConfirm(false);
    
    if (res.success) {
      showToast("Sale completed successfully!");
      setItems([]);
      setClientId("");
      setPaymentAccountId("");
      setDiscount(0);
      setPaidAmount(0);
    } else {
      showToast((res as any).error || "Failed to complete sale.");
    }
  };

  // কনফার্মেশন মডাল ওপেন থাকলে Enter চাপলে Yes বাটনে ক্লিক হবে
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showConfirm && e.key === "Enter") {
        e.preventDefault();
        if (!isSubmitting) {
          executeSubmit();
        }
      }
    };

    if (showConfirm) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showConfirm, isSubmitting]); 

  return (
    <>
      <form onSubmit={handlePreSubmit} className="space-y-6">
        {/* Client & Payment Account */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <select 
              value={clientId} 
              onChange={e => setClientId(e.target.value)} 
              required 
              className="input-premium cursor-pointer appearance-none" 
              style={{ paddingLeft: '2.75rem' }}
            >
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
              <CreditCard className="h-4 w-4 text-slate-400" />
            </div>
            <select 
              value={paymentAccountId} 
              onChange={e => setPaymentAccountId(e.target.value)} 
              className="input-premium cursor-pointer appearance-none" 
              style={{ paddingLeft: '2.75rem' }}
            >
              <option value="">Select Payment Account (Optional)</option>
              {paymentAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
            </select>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Item Description</label>
                <select 
                  value={item.id} 
                  onChange={e => updateItem(index, "id", e.target.value)} 
                  required 
                  className="input-premium cursor-pointer w-full"
                >
                  <option value="">Select {item.type === "SERVICE" ? "Service" : "Product"}</option>
                  {item.type === "SERVICE" 
                    ? services.map(s => <option key={s.id} value={s.id}>{s.name} (৳{s.price})</option>)
                    : products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQty})</option>)
                  }
                </select>
              </div>

              <div className="w-full md:w-24">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Qty</label>
                <input 
                  type="number" 
                  min="1" 
                  value={item.qty} 
                  onChange={e => updateItem(index, "qty", Number(e.target.value))} 
                  required 
                  className="input-premium w-full text-center" 
                />
              </div>

              <div className="w-full md:w-32">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Unit Price</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={item.price} 
                  onChange={e => updateItem(index, "price", Number(e.target.value))} 
                  required 
                  className="input-premium w-full text-right" 
                />
              </div>

              <div className="w-full md:w-32">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Discount (৳)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={item.discount} 
                  onChange={e => updateItem(index, "discount", Number(e.target.value))} 
                  onKeyDown={(e) => handleItemDiscountKeyDown(e, index)}
                  ref={(el) => { itemDiscountRefs.current[index] = el; }}
                  className="input-premium w-full text-right" 
                />
              </div>

              <div className="w-full md:w-32 flex flex-col justify-end">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</label>
                <div className="h-[42px] flex items-center justify-end px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white">
                  ৳ {((item.price * item.qty) - (item.discount || 0)).toLocaleString()}
                </div>
              </div>

              <div className="flex items-end pb-1">
                <button 
                  type="button" 
                  onClick={() => removeItem(index)} 
                  title="Remove Item"
                  className="p-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Buttons */}
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => addItem("SERVICE")} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-100 transition-colors"
          >
            <Plus size={16} /> Add Service
          </button>
          <button 
            type="button" 
            onClick={() => addItem("PRODUCT")} 
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-semibold hover:bg-purple-100 transition-colors"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-full max-w-sm space-y-2 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sub Total:</span>
              <span className="font-medium">৳ {subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm items-center gap-2">
              <span className="text-slate-500">Discount:</span>
              <input 
                type="number" 
                step="0.01" 
                value={discount} 
                onChange={e => setDiscount(Number(e.target.value))} 
                ref={globalDiscountRef}
                onKeyDown={handleGlobalDiscountKeyDown}
                className="w-24 text-right border rounded px-2 py-1 text-sm dark:bg-slate-900 dark:border-slate-700" 
              />
            </div>
            
            <div className="flex justify-between text-lg font-bold border-t border-slate-200 dark:border-slate-700 pt-2">
              <span>Total:</span>
              <span className="text-blue-600">৳ {total.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-sm items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-500">Paid Amount:</span>
              <input 
                type="number" 
                step="0.01" 
                max={total}
                value={paidAmount} 
                onChange={e => setPaidAmount(Number(e.target.value))} 
                ref={paidAmountRef}
                onKeyDown={handlePaidAmountKeyDown}
                className="w-24 text-right border rounded px-2 py-1 text-sm dark:bg-slate-900 dark:border-slate-700" 
              />
            </div>

            <div className="flex justify-between text-sm font-bold text-red-500">
              <span>Due Amount:</span>
              <span>৳ {dueAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <SubmitButton 
          ref={submitBtnRef}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-3 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} /> Complete Sale
        </SubmitButton>
      </form>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Sale</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Are you sure you want to complete this sale? This will generate an invoice and update your inventory and accounts.
              </p>
              
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Amount:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">৳ {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid Amount:</span>
                  <span className="font-semibold text-green-600">৳ {paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Amount:</span>
                  <span className="font-semibold text-red-500">৳ {dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-slate-200 dark:border-slate-800 gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                No, Go Back
              </button>
              <button
                type="button"
                onClick={executeSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
              >
                {isSubmitting ? "Saving..." : "Yes, Save Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}