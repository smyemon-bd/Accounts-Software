import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import ExportButton from "@/components/export-button";
import Link from "next/link";
import { AlertCircle, FileText, Search, X, Calendar } from "lucide-react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; startDate?: string; endDate?: string }>;
}) {
  await requirePermission("dashboard.admin");

  const resolvedParams = await searchParams;
  const query = resolvedParams.q?.trim() || "";
  const startDate = resolvedParams.startDate || "";
  const endDate = resolvedParams.endDate || "";

  // ডেট ফিল্টার কন্ডিশন তৈরি
  const dateFilter: any = {};
  if (startDate) dateFilter.gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.lte = end;
  }

  // নতুন Sale টেবিল থেকে Due সেলগুলো আনা
  const dueSales = await prisma.sale.findMany({
    where: {
      dueAmount: { gt: 0 },
      ...(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}),
      ...(query
        ? {
            OR: [
              { invoiceNo: { contains: query, mode: "insensitive" } },
              {
                client: {
                  name: { contains: query, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      client: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serializableSales = JSON.parse(JSON.stringify(dueSales)).map(
    (s: any) => ({
      ...s,
      total: Number(s.total),
      paidAmount: Number(s.paidAmount),
      dueAmount: Number(s.dueAmount),
    })
  );

  const totalDue = serializableSales.reduce(
    (acc: number, sale: any) => acc + sale.dueAmount,
    0
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Due Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Track and collect outstanding payments from clients.
          </p>
        </div>
        <ExportButton
          data={serializableSales.map((sale: any) => ({
            InvoiceNo: sale.invoiceNo,
            Client: sale.client.name,
            Phone: sale.client.phone || "",
            Date: new Date(sale.createdAt).toLocaleDateString(),
            Total: sale.total,
            Paid: sale.paidAmount,
            Due: sale.dueAmount,
          }))}
          filename="ByteFlow_Due_Reports"
        />
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-sm">
        <form className="flex flex-col md:flex-row flex-wrap gap-4 items-end">
          
          {/* Search Input */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search by Invoice or Client..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>
          </div>

          {/* Start Date */}
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="date"
                name="startDate"
                defaultValue={startDate}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>
          </div>

          {/* End Date */}
          <div className="w-full md:w-48">
            <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="date"
                name="endDate"
                defaultValue={endDate}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 py-2.5 text-sm text-slate-800 dark:text-white outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="submit"
              className="flex-1 md:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] flex items-center justify-center"
            >
              Filter
            </button>
            {(query || startDate || endDate) && (
              <Link
                href="/reports"
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <X size={16} /> Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Total Due Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="bg-red-100 dark:bg-red-900/40 p-3.5 rounded-xl">
            <AlertCircle
              className="text-red-600 dark:text-red-400"
              size={24}
            />
          </div>
          <div>
            <p className="text-red-800 dark:text-red-300 text-sm font-medium">
              Total Outstanding Due
            </p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-200 mt-1">
              ৳ {totalDue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Due Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm transition-colors">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <div className="overflow-x-auto">
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Invoice No</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Paid</th>
                  <th className="text-right">Due Amount</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {serializableSales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center text-slate-500 dark:text-slate-400 py-10 text-sm"
                    >
                      {query || startDate || endDate
                        ? "No due records matched your filter."
                        : "No outstanding dues. All payments are clear."}
                    </td>
                  </tr>
                ) : (
                  serializableSales.map((sale: any) => (
                    <tr key={sale.id}>
                      <td className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {sale.client.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {sale.client.phone || "No phone"}
                        </div>
                      </td>
                      <td className="text-blue-600 dark:text-blue-400">
                        {sale.invoiceNo}
                      </td>
                      <td className="text-right text-slate-600 dark:text-slate-300">
                        ৳ {sale.total.toLocaleString()}
                      </td>
                      <td className="text-right text-green-600">
                        ৳ {sale.paidAmount.toLocaleString()}
                      </td>
                      <td className="text-right font-bold text-red-600 dark:text-red-400">
                        ৳ {sale.dueAmount.toLocaleString()}
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/sales/${sale.id}/invoice`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs font-semibold transition-colors border border-blue-100 dark:border-blue-800/50"
                        >
                          <FileText size={14} /> View Invoice
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}