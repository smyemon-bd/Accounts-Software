"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

// নেভিগেশন ডেটা (আপনার আসল সেশন ও পারমিশন অনুযায়ী এটি পাস করতে হবে)
export function MobileSidebar({ nav, user }: { nav: any[], user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      {/* হ্যামবার্গার বাটন */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
      >
        <Menu size={24} />
      </button>

      {/* ওভারলে (কালো ব্যাকগ্রাউন্ড) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* স্লাইডিং সাইডবার */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col shadow-2xl`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-wide">
            ByteFlow <span className="text-blue-500">BMS</span>
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
          {nav.filter(n => n.show).map(n => {
            const isActive = pathname === n.href || pathname.startsWith(n.href + "/");
            const Icon = n.icon;
            return (
              <Link 
                key={n.href} 
                href={n.href}
                onClick={() => setIsOpen(false)} // মেনুতে ক্লিক করলে বন্ধ হবে
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive ? "bg-blue-600 text-white shadow-md" : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-slate-400"} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}