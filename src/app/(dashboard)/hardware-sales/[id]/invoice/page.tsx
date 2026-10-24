import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";
import { getSettings } from "@/server/actions/settings";

export default async function HardwareInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const sale = await prisma.hardwareSale.findUnique({
    where: { id: resolvedParams.id },
    include: {
      client: true,
      items: { include: { product: true } },
    },
  });

  if (!sale) notFound();

  const settings = await getSettings();
  const totalAmount = Number(sale.total);

  return (
    <div className="max-w-[800px] mx-auto space-y-4 py-8 print:py-0 print:max-w-full">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/sales?tab=hardware" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
          ← Back to Sales
        </Link>
        <PrintButton />
      </div>

      <div className="invoice-container bg-white text-slate-800 shadow-2xl rounded-sm overflow-hidden print:shadow-none">
        {/* Header */}
        <div className="relative pt-8 pb-6 px-8">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#D4AF37]"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {settings.companyName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">{settings.companyName}</h1>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">{settings.companySub}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{settings.address}<br />Phone: {settings.phone}</p>
            </div>

            <div className="text-right mt-2">
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">INVOICE</h2>
            </div>
          </div>
        </div>

        {/* Client Details */}
        <div className="px-8 flex justify-between mb-6">
          <div>
            <p className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">Invoice To</p>
            <h3 className="font-bold text-base text-slate-900">{sale.client.name}</h3>
            <p className="text-xs text-slate-600 mt-1">{sale.client.phone || "N/A"}</p>
            <p className="text-xs text-slate-600">{sale.client.email || "N/A"}</p>
          </div>
          
          <div className="text-right flex flex-col justify-end">
            <div className="mb-1">
              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">Date</span>
              <span className="text-xs font-medium text-slate-800">{sale.createdAt.toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-wider block">Invoice No</span>
              <span className="text-xs font-medium text-slate-800">{sale.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="px-8 mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111827] text-white">
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider w-12">NO</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Product Description</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center w-16">Qty</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-right w-24">Unit Price</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-right w-24">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item, index) => (
                <tr key={item.id} className="bg-[#FEF3C7]">
                  <td className="py-2 px-3 text-xs font-medium text-slate-800 border-b border-white">{String(index + 1).padStart(2, '0')}</td>
                  <td className="py-2 px-3 text-xs font-medium text-slate-800 border-b border-white">
                    {item.product.name}
                    <p className="text-[9px] text-slate-500 mt-0.5">SKU: {item.product.sku}</p>
                  </td>
                  <td className="py-2 px-3 text-xs text-center text-slate-800 border-b border-white">{item.qty}</td>
                  <td className="py-2 px-3 text-xs text-right text-slate-800 border-b border-white">৳ {Number(item.unitPrice).toLocaleString()}</td>
                  <td className="py-2 px-3 text-xs text-right font-bold text-slate-800 border-b border-white">৳ {(Number(item.unitPrice) * item.qty).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

                {/* Total Summary */}
        <div className="px-8 flex justify-between mb-8">
          <div className="w-1/2">
            <p className="text-xs font-bold text-slate-900 mb-1">Payment Method :</p>
            <p className="text-[10px] text-slate-600">Bank Name : {settings.bankName}</p>
            <p className="text-[10px] text-slate-600">Account Number : {settings.accountNumber}</p>
          </div>

          <div className="w-[250px] space-y-1.5">
            <div className="flex justify-between items-center bg-[#FEF3C7] py-1 px-2">
              <span className="text-xs font-semibold text-slate-800">Sub Total :</span>
              <span className="text-xs font-bold text-slate-800">
                ৳ {(sale.items.reduce((sum: number, item: any) => sum + (Number(item.unitPrice) * item.qty), 0)).toLocaleString()}
              </span>
            </div>
            
            {/* Discount (যদি থাকে) */}
            {Number(sale.discount) > 0 && (
              <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/20 py-1 px-2">
                <span className="text-xs font-semibold text-red-600">Discount :</span>
                <span className="text-xs font-bold text-red-600">- ৳ {Number(sale.discount).toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between items-center bg-[#111827] text-white py-1.5 px-2 mt-1">
              <span className="text-xs font-bold uppercase">Grand Total :</span>
              <span className="text-sm font-bold text-[#FEF3C7]">৳ {Number(sale.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms & Signature */}
        <div className="px-8 flex justify-between mb-6">
          <div className="w-1/2">
            <p className="text-xs font-bold text-slate-900 mb-1">Term & Conditions :</p>
            <p className="text-[9px] text-slate-500 leading-relaxed pr-6">{settings.terms}</p>
          </div>
          <div className="w-1/3 text-center flex flex-col justify-end pb-2">
             <p className="font-['Brush_Script_MT',cursive] text-xl text-slate-700 border-b border-slate-300 pb-1 mb-1">ByteFlow</p>
             <p className="text-[10px] font-bold text-slate-900">ByteFlow Admin</p>
             <p className="text-[8px] text-slate-500 uppercase tracking-wider">Authorised Signatory</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#111827] text-white flex items-center justify-between px-8 py-3 mt-4">
          <div className="bg-[#D4AF37] text-[#111827] font-black uppercase tracking-wider text-xs py-1.5 px-4 -ml-8">
            Our Contact
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-300">
            <span>{settings.phone}</span>
            <span>{settings.email}</span>
            <span>{settings.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
}