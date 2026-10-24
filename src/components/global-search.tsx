"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, User, Briefcase, FileText, Loader2, Package, Receipt } from "lucide-react";
import Link from "next/link";
import { globalSearch } from "@/server/actions/search";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ clients: any[], services: any[], orders: any[], products: any[], expenses: any[] }>({ 
    clients: [], services: [], orders: [], products: [], expenses: [] 
  });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ clients: [], services: [], orders: [], products: [], expenses: [] });
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(async () => {
      const res = await globalSearch(query);
      setResults(res);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results.clients.length > 0 || results.services.length > 0 || results.orders.length > 0 || results.products.length > 0 || results.expenses.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm border border-slate-200 dark:border-slate-700"
      >
        <Search size={16} />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600">Ctrl K</kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-toast">
            <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search clients, services, orders, products, expenses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-slate-800 dark:text-white placeholder-slate-400 outline-none text-lg"
              />
              {isLoading && <Loader2 className="animate-spin text-blue-500 mr-2" size={20} />}
              <button onClick={() => setIsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.length < 2 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Type at least 2 characters to search...
                </div>
              ) : !hasResults && !isLoading ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                  No results found for "<span className="font-semibold text-slate-800 dark:text-slate-200">{query}</span>"
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {/* Clients */}
                  {results.clients.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Clients</p>
                      {results.clients.map(c => (
                        <Link key={c.id} href={`/clients/${c.id}/statement`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md text-blue-600 dark:text-blue-400"><User size={16} /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.phone || c.email || "No contact info"}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Services */}
                  {results.services.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Services</p>
                      {results.services.map(s => (
                        <Link key={s.id} href={`/services/${s.id}/edit`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-md text-green-600 dark:text-green-400"><Briefcase size={16} /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{s.name}</p>
                            <p className="text-xs text-slate-500">৳ {Number(s.price).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Orders */}
                  {results.orders.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Orders</p>
                      {results.orders.map(o => (
                        <Link key={o.id} href={`/orders/${o.id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-md text-purple-600 dark:text-purple-400"><FileText size={16} /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{o.orderNo} — {o.client.name}</p>
                            <p className="text-xs text-slate-500">{o.status} • ৳ {Number(o.totalAmount).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {results.products.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Products</p>
                      {results.products.map(p => (
                        <Link key={p.id} href={`/masters?tab=products`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-md text-orange-600 dark:text-orange-400"><Package size={16} /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{p.name}</p>
                            <p className="text-xs text-slate-500">SKU: {p.sku} • Stock: {p.stockQty}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Expenses */}
                  {results.expenses.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Expenses</p>
                      {results.expenses.map(e => (
                        <Link key={e.id} href={`/expenses`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-md text-red-600 dark:text-red-400"><Receipt size={16} /></div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{e.title}</p>
                            <p className="text-xs text-slate-500">{e.category} • ৳ {Number(e.amount).toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}