import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PrintButton from "@/app/(dashboard)/orders/[id]/invoice/print-button";
import { getSettings } from "@/server/actions/settings";

export default async function ClientStatementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const client = await prisma.client.findUnique({
    where: { id: resolvedParams.id },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { include: { service: true, product: true } },
          payments: true,
        }
      }
    },
  });

  if (!client) notFound();

  const settings = await getSettings();

  let totalBilled = 0;
  let totalPaid = 0;

  client.sales.forEach(sale => {
    totalBilled += Number(sale.total);
    totalPaid += Number(sale.paidAmount);
  });

  const totalDue = totalBilled - totalPaid;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/masters?tab=clients" className="text-blue-600 hover:underline text-sm font-medium">
          ← Back to Clients
        </Link>
        <PrintButton />
      </div>

      <div className="bg-white border p-8 rounded-xl shadow-sm print:shadow-none print:border-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{settings.companyName}</h1>
            <p className="text-sm text-slate-500 mt-1">Client Statement</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-600">{client.name}</h2>
            <p className="text-sm text-slate-500 mt-1">Phone: {client.phone || "N/A"}</p>
            <p className="text-sm text-slate-500">Email: {client.email || "N/A"}</p>
            <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-lg border text-center">
            <p className="text-slate-500 text-sm">Total Billed</p>
            <p className="font-bold text-lg text-slate-800">৳ {totalBilled.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 text-center">
            <p className="text-green-700 text-sm">Total Paid</p>
            <p className="font-bold text-lg text-green-800">৳ {totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
            <p className="text-red-700 text-sm">Outstanding Due</p>
            <p className="font-bold text-lg text-red-800">৳ {totalDue.toLocaleString()}</p>
          </div>
        </div>

        {/* Order History Table */}
        <h3 className="font-semibold text-slate-800 mb-3">Order History</h3>
        <table className="w-full text-sm text-left mb-8">
          <thead className="bg-slate-50 text-slate-600 border-y">
            <tr>
              <th className="py-2 px-3 font-semibold">Date</th>
              <th className="py-2 px-3 font-semibold">Invoice No</th>
              <th className="py-2 px-3 font-semibold">Items</th>
              <th className="py-2 px-3 font-semibold text-right">Billed Amount</th>
              <th className="py-2 px-3 font-semibold text-right">Paid Amount</th>
              <th className="py-2 px-3 font-semibold text-right">Due</th>
            </tr>
          </thead>
          <tbody>
            {client.sales.map(sale => {
              const paid = Number(sale.paidAmount);
              const due = Number(sale.dueAmount);
              return (
                <tr key={sale.id} className="border-b last:border-0">
                  <td className="py-3 px-3">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td className="px-3 font-medium text-blue-600">{sale.invoiceNo}</td>
                  <td className="px-3">
                    {sale.items.map((i, idx) => (
                      <span key={i.id}>
                        {i.itemType === "SERVICE" ? i.service?.name : i.product?.name}
                        {idx < sale.items.length - 1 && ", "}
                      </span>
                    ))}
                  </td>
                  <td className="px-3 text-right">৳ {Number(sale.total).toLocaleString()}</td>
                  <td className="px-3 text-right text-green-600">৳ {paid.toLocaleString()}</td>
                  <td className="px-3 text-right font-semibold text-red-600">৳ {due.toLocaleString()}</td>
                </tr>
              );
            })}
            {client.sales.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">No orders found for this client.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}