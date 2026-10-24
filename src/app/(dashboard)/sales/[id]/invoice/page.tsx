import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";
import { getSettings } from "@/server/actions/settings";

export default async function SaleInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  const sale = await prisma.sale.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: true,
      paymentAccount: true,
      items: { include: { service: true, product: true } }
    }
  });

  if (!sale) notFound();

  const settings = await getSettings();
  const totalAmount = Number(sale.total);
  const paidAmount = Number(sale.paidAmount);
  const dueAmount = Number(sale.dueAmount);

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-8 print:py-0 print:max-w-full">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/sales?tab=history" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          ← Back to Sales History
        </Link>
        <PrintButton />
      </div>

      <div className="invoice-container bg-white text-slate-800 shadow-2xl rounded-sm overflow-hidden print:shadow-none">
        {/* Header */}
        <div className="pt-10 pb-6 px-10 border-b border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {settings.companyName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">{settings.companyName}</h1>
                  <p className="text-[10px] font-bold tracking-[0.2em] text-blue-600 uppercase">{settings.companySub}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2">{settings.address}<br />Phone: {settings.phone} | Email: {settings.email}</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">INVOICE</h2>
            </div>
          </div>
        </div>

        {/* Client & Invoice Info */}
        <div className="px-10 py-6 flex justify-between bg-slate-50">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
            <h3 className="font-bold text-lg text-slate-900">{sale.client.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{sale.client.address || "N/A"}</p>
            <p className="text-sm text-slate-600">{sale.client.phone || "N/A"}</p>
            <p className="text-sm text-slate-600">{sale.client.email || "N/A"}</p>
          </div>
          <div className="text-right flex flex-col justify-end">
            <div className="mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Number</span>
              <span className="text-sm font-semibold text-slate-800">{sale.invoiceNo}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Invoice Date</span>
              <span className="text-sm font-medium text-slate-800">{new Date(sale.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-10 py-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider border border-slate-200">Item Description</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-center border border-slate-200 w-16">Qty</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right border border-slate-200 w-32">Unit Price</th>
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-right border border-slate-200 w-32">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map(item => (
                <tr key={item.id}>
                  <td className="py-3 px-4 border border-slate-200 text-sm font-medium text-slate-800">
                    {item.itemType === "SERVICE" ? item.service?.name : item.product?.name}
                  </td>
                  <td className="py-3 px-4 border border-slate-200 text-sm text-center">{item.qty}</td>
                  <td className="py-3 px-4 border border-slate-200 text-sm text-right">৳ {Number(item.unitPrice).toLocaleString()}</td>
                  <td className="py-3 px-4 border border-slate-200 text-sm text-right font-bold">৳ {(Number(item.unitPrice) * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-10 flex justify-end mb-8">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Sub Total:</span>
              <span className="font-semibold">৳ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Discount:</span>
              <span className="font-semibold">৳ {Number(sale.discount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-200 pt-2">
              <span className="text-slate-500">Paid Amount:</span>
              <span className="font-semibold text-green-600">৳ {paidAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-bold">Due Amount:</span>
              <span className="font-bold text-red-600">৳ {dueAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800 text-white py-2 px-3 mt-2 rounded">
              <span className="font-bold uppercase">Grand Total:</span>
              <span className="text-lg font-black">৳ {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-slate-50 border-t border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method:</p>
          <p className="text-sm text-slate-700">{sale.paymentAccount?.name || "Cash / Bank Transfer"}</p>
          <p className="text-xs text-slate-500 mt-4">Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}