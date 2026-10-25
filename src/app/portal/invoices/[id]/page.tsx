import { prisma } from "@/lib/prisma";
import { getClientSession } from "@/server/actions/portal";
import { getSettings } from "@/server/actions/settings";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";

export default async function PortalInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const client = await getClientSession();

  if (!client) redirect("/portal/login");

  // ✅ এখানে sale এবং settings একসাথে ফেচ করা হচ্ছে
  const [sale, settings] = await Promise.all([
    prisma.sale.findUnique({
      where: { id: resolvedParams.id },
      include: {
        client: true,
        paymentAccount: true,
        items: { include: { service: true, product: true } },
        payments: true,
      },
    }),
    getSettings()
  ]);

  if (!sale || sale.clientId !== client.id) {
    notFound();
  }

  const totalAmount = Number(sale.total);
  const paidAmount = Number(sale.paidAmount);
  const dueAmount = Number(sale.dueAmount);

  return (
    <div className="max-w-[210mm] mx-auto space-y-4 print:space-y-0 pb-6">
      
      {/* Back Button (Hidden on Print) */}
      <div className="print:hidden pt-4">
        <Link href="/portal" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>

      {/* Invoice Container (Print Friendly & A4 Size) */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
        
        <div className="p-6 md:p-8 print:p-0">
          
          {/* Header: Company Info & Invoice Details */}
          <div className="flex flex-col md:flex-row print:flex-row justify-between items-start gap-4 mb-6">
            
            {/* Company Info (Left Side) */}
            <div className="flex-1 print:w-1/2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg print:w-8 print:h-8 print:text-lg">
                  {settings.companyName.charAt(0)}
                </div>
                <h1 className="text-2xl font-black text-blue-700 uppercase tracking-tight print:text-xl">{settings.companyName}</h1>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-xs">{settings.address}</p>
              <p className="text-xs text-slate-600 mt-0.5">Phone: {settings.phone}</p>
              <p className="text-xs text-slate-600">Email: {settings.email}</p>
            </div>
            
            {/* Invoice Details (Right Side) */}
            <div className="flex flex-col items-end print:w-1/2">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase mb-4 print:text-3xl print:mb-2">Invoice</h2>
              
              {/* Grid Layout for Dates & Invoice Number */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-right print:gap-x-4 print:gap-y-1">
                <div className="text-left">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block print:text-[10px]">Invoice Number</span>
                  <span className="font-bold text-slate-900 text-sm print:text-xs">{sale.invoiceNo}</span>
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block print:text-[10px]">Invoice Date</span>
                  <span className="font-medium text-slate-800 print:text-xs">{new Date(sale.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block print:text-[10px]">Due Date</span>
                  <span className="font-medium text-slate-800 print:text-xs">{new Date(sale.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-500 uppercase tracking-wider block print:text-[10px]">Customer ID</span>
                  <span className="font-medium text-slate-800 print:text-xs">{sale.clientId.slice(-6).toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="mb-6 border-t-2 border-slate-800 pt-4 flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To</h3>
              <p className="text-sm font-bold text-slate-900">{sale.client.name}</p>
              {sale.client.address && <p className="text-xs text-slate-600">{sale.client.address}</p>}
              <p className="text-xs text-slate-600 mt-1">Phone: {sale.client.phone || "N/A"}</p>
              <p className="text-xs text-slate-600">Email: {sale.client.email || "N/A"}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 p-2 text-[10px] font-bold uppercase tracking-wider">Description</th>
                  <th className="border border-slate-300 p-2 text-[10px] font-bold uppercase tracking-wider text-center w-16">Qty</th>
                  <th className="border border-slate-300 p-2 text-[10px] font-bold uppercase tracking-wider text-right w-24">Unit Price</th>
                  <th className="border border-slate-300 p-2 text-[10px] font-bold uppercase tracking-wider text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map(item => (
                  <tr key={item.id}>
                    <td className="border border-slate-300 p-2 text-xs font-medium text-slate-800">
                      {item.itemType === "SERVICE" ? item.service?.name : item.product?.name}
                    </td>
                    <td className="border border-slate-300 p-2 text-xs text-center text-slate-600">{item.qty}</td>
                    <td className="border border-slate-300 p-2 text-xs text-right text-slate-600">৳ {Number(item.unitPrice).toLocaleString()}</td>
                    <td className="border border-slate-300 p-2 text-xs text-right font-bold text-slate-800">৳ {(Number(item.unitPrice) * item.qty).toLocaleString()}</td>
                  </tr>
                ))}
                
                {/* Summary Rows inside Table */}
                <tr>
                  <td colSpan={3} className="border border-slate-300 p-1.5 text-xs text-right font-semibold text-slate-600">Sub Total</td>
                  <td className="border border-slate-300 p-1.5 text-xs text-right font-bold text-slate-800">৳ {(totalAmount + Number(sale.discount)).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="border border-slate-300 p-1.5 text-xs text-right font-semibold text-slate-600">Discount</td>
                  <td className="border border-slate-300 p-1.5 text-xs text-right font-bold text-slate-800">৳ {Number(sale.discount).toLocaleString()}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="border border-slate-300 p-1.5 text-xs text-right font-semibold text-slate-600">Amount Received</td>
                  <td className="border border-slate-300 p-1.5 text-xs text-right font-bold text-emerald-600">৳ {paidAmount.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td colSpan={3} className="border border-slate-300 p-2 text-sm text-right font-bold text-slate-800">Grand Total</td>
                  <td className="border border-slate-300 p-2 text-sm text-right font-black text-slate-900">৳ {totalAmount.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status */}
          <div className="mb-6 flex items-center justify-end">
            <p className="text-xs font-bold text-slate-600 mr-2">Payment Status:</p>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              dueAmount <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
            }`}>
              {dueAmount <= 0 ? "Paid" : "Overdue"}
            </span>
          </div>

          {/* Payment Instructions */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3 text-[11px] leading-snug">
            <div>
              <h3 className="font-bold text-slate-800 uppercase mb-1">Please make your payment to the following Account:</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-700">
                <p><span className="font-semibold">Account Name:</span> {settings.companyName}</p>
                <p><span className="font-semibold">Account Number:</span> {settings.accountNumber}</p>
                <p><span className="font-semibold">Bank Name:</span> {settings.bankName}</p>
                <p><span className="font-semibold">Branch Name:</span> Main Branch</p>
                <p><span className="font-semibold">Routing Number:</span> 095260439</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-2">
              <h3 className="font-bold text-slate-800 uppercase mb-1">Bkash Payment Instructions:</h3>
              <p className="text-slate-700">
                Open Bkash &gt; Bill pay &gt; Write {settings.companyName} &gt; Enter your Customer ID ({sale.clientId.slice(-6).toUpperCase()}) &gt; Enter your Contact Number &gt; Enter the Invoice Amount &gt; Enter your bKash PIN and Confirm.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-2">
              <h3 className="font-bold text-slate-800 uppercase mb-1">Bank Payment Instructions:</h3>
              <p className="text-slate-700">
                Kindly ensure that all Payments made via bank transfer, cheque or cash deposit are accompanied by a scanned copy of the deposit slip. Please send the slip to {settings.email} or via Whatsapp at {settings.phone} for verification and record-keeping purposes.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 p-4 flex justify-between items-center text-[10px] text-slate-500 print:hidden">
          <p>This is a computer-generated invoice. No signature is required.</p>
          <PrintButton />
        </div>

      </div>
    </div>
  );
}