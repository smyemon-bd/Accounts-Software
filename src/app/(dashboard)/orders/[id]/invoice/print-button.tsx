"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2 print:hidden"
    >
      <Printer size={18} /> Print / Save as PDF
    </button>
  );
}