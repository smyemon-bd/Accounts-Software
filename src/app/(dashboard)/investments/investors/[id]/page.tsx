import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Phone, Mail, Calendar, Printer } from "lucide-react";
import { getSettings } from "@/server/actions/settings";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";

export default async function InvestorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  const investor = await prisma.investor.findUnique({
    where: { id: resolvedParams.id },
    include: {
      investments: {
        orderBy: { investedAt: "desc" }
      }
    }
  });

  if (!investor) notFound();

  const settings = await getSettings();
  const totalInvested = investor.investments.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      {/* Print & Back Button */}
      <div className="flex justify-between items-center print:hidden">
        <Link 
          href="/investments?tab=investments" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Investments
        </Link>
        <PrintButton />
      </div>

      {/* Main Statement Container */}
      <div className="bg-white text-slate-800 shadow-2xl rounded-sm overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Company Header */}
        <div className="relative pt-10 pb-8 px-10 border-b-4 border-[#D4AF37]">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-[#D4AF37] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {settings.companyName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">{settings.companyName}</h1>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">{settings.companySub}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">{settings.address}<br />Phone: {settings.phone} | Email: {settings.email}</p>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Statement</h2>
              <p className="text-sm text-slate-500 mt-2">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Investor Info */}
        <div className="px-10 py-8 flex justify-between bg-slate-50">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Investor Details</p>
            <h3 className="font-bold text-xl text-slate-900">{investor.name}</h3>
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
              <Phone size={14} className="text-slate-400" /> {investor.phone || "N/A"}
            </p>
            <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
              <Mail size={14} className="text-slate-400" /> {investor.email || "N/A"}
            </p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <div className="mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Joined Date</span>
              <span className="text-sm font-medium text-slate-800">
                {new Date(investor.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Invested</span>
              <span className="text-2xl font-black text-green-600">৳ {totalInvested.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Investment History Table */}
        <div className="px-10 py-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wider">Investment History</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider w-16">No</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider">Time</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {investor.investments.map((inv, index) => (
                <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-500">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-3 px-4 text-sm font-medium text-slate-800">
                    {new Date(inv.investedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {new Date(inv.investedAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-slate-800 text-right">
                    ৳ {Number(inv.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 text-slate-500 text-center px-10 py-4 text-xs mt-10">
          <p>This is a computer-generated statement. No signature is required.</p>
          <p className="mt-1">© {new Date().getFullYear()} {settings.companyName}. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}