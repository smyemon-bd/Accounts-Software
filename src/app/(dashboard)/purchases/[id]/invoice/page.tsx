import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";
import { getSettings } from "@/server/actions/settings";

export default async function PurchaseInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const purchase = await prisma.purchase.findUnique({
    where: { id: resolvedParams.id },
    include: {
      distributor: true,
      items: { include: { product: true } },
    },
  });

  if (!purchase) notFound();

  const settings = await getSettings();
  const totalAmount = Number(purchase.total);

  return (
    <div className="max-w-[800px] mx-auto space-y-4 py-8 print:py-0 print:max-w-full">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/masters?tab=products" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          ← Back to Inventory
        </Link>
        <PrintButton />
      </div>

      <div className="invoice-container bg-white text-slate-800 shadow-2xl rounded-sm overflow-hidden print:shadow-none">
        <div className="relative pt-8 pb-6 px-8">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#111827]"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">PURCHASE ORDER</h1>
              <p className="text-[10px] text-slate-500 mt-1">ByteFlow Technologies</p>
            </div>

            <div className="text-right mt-2">
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter">INVOICE</h2>
            </div>
          </div>
        </div>

        {/* Distributor Details */}
        <div className="px-8 flex justify-between mb-6">
          <div>
            <p className="text-[9px] font-bold text-[#111827] uppercase tracking-wider mb-1">Supplier / Distributor</p>
            <h3 className="font-bold text-base text-slate-900">{purchase.distributor.name}</h3>
            <p className="text-xs text-slate-600 mt-1">{purchase.distributor.phone || "N/A"}</p>
          </div>
          
          <div className="text-right flex flex-col justify-end">
            <div className="mb-1">
              <span className="text-[9px] font-bold text-[#111827] uppercase tracking-wider block">Date</span>
              <span className="text-xs font-medium text-slate-800">{purchase.createdAt.toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#111827] uppercase tracking-wider block">PO No</span>
              <span className="text-xs font-medium text-slate-800">{purchase.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="px-8 mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111827] text-white">
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider w-12">NO</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Product</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center w-16">Qty</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-right w-24">Unit Cost</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {purchase.items.map((item, index) => (
                <tr key={item.id} className="bg-slate-50">
                  <td className="py-2 px-3 text-xs font-medium text-slate-800 border-b border-white">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2 px-3 text-xs font-medium text-slate-800 border-b border-white">
                    {item.product.name}
                    <p className="text-[9px] text-slate-500 mt-0.5">SKU: {item.product.sku}</p>
                  </td>
                  <td className="py-2 px-3 text-xs text-center text-slate-800 border-b border-white">{item.qty}</td>
                  <td className="py-2 px-3 text-xs text-right text-slate-800 border-b border-white">৳ {Number(item.unitCost).toLocaleString()}</td>
                  <td className="py-2 px-3 text-xs text-right font-bold text-slate-800 border-b border-white">৳ {(Number(item.unitCost) * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="px-8 flex justify-end mb-12">
          <div className="w-[250px] space-y-1.5">
            <div className="flex justify-between items-center bg-slate-100 py-1 px-2">
              <span className="text-xs font-semibold text-slate-800">Sub Total :</span>
              <span className="text-xs font-bold text-slate-800">৳ {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center bg-[#111827] text-white py-1.5 px-2 mt-1">
              <span className="text-xs font-bold uppercase">Grand Total :</span>
              <span className="text-sm font-bold text-white">৳ {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 text-slate-800 flex items-center justify-between px-8 py-3 mt-4">
          <div className="text-xs font-bold">ByteFlow Technologies</div>
          <div className="text-[10px] text-slate-500">{settings.address}</div>
        </div>
      </div>
    </div>
  );
}