import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/rbac";
import { getDashboardSettings } from "@/server/actions/dashboard-setting";
import { getAllAccountBalances } from "@/server/actions/accounting";
import { 
  MonthlyCollectionChart, 
  StockPieChart, 
  MonthlyExpenseChart, 
  ExpenseCategoryChart, 
  NoDataChart 
} from "@/components/charts";
import Link from "next/link";
import { 
  Users, FileText, Wallet, AlertCircle, TrendingUp, Filter, X, 
  Landmark, Smartphone, QrCode, Banknote, PieChart, HandCoins, Receipt, ArrowUpRight, Package, Layers 
} from "lucide-react";

export default async function DashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ month?: string, year?: string }> 
}) {
  const sessionUser = await getSessionUser();
  const dbUser = sessionUser ? await prisma.user.findUnique({ where: { id: (sessionUser as any).id }, select: { name: true } }) : null;
  const user = { ...sessionUser, name: dbUser?.name || sessionUser?.name };
  
  const settings = await getDashboardSettings();

  const resolvedParams = await searchParams;
  const selectedMonth = resolvedParams.month ? parseInt(resolvedParams.month) : new Date().getMonth();
  const selectedYear = resolvedParams.year ? parseInt(resolvedParams.year) : new Date().getFullYear();

  const startDate = new Date(selectedYear, selectedMonth, 1);
  const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);

  const [clients, orders, allOrders, collectedAgg, recent, payments, products, expenses, upcomingDues, filteredPayments, filteredExpenses, loans, loanRepayments, investments, usersCount, sales, accountBalances, dividends, shareHolders, lowStockCount] = await Promise.all([
    prisma.client.count(),
    prisma.serviceOrder.count(),
    prisma.serviceOrder.findMany({
      where: { status: { not: "CANCELLED" } },
      include: { payments: true }
    }),
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.serviceOrder.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      include: { client: true, service: true },
    }),
    prisma.payment.findMany({ orderBy: { paidAt: "desc" }, take: 50 }),
    prisma.product.findMany(),
    prisma.expense.findMany({ orderBy: { date: "desc" }, take: 50, include: { category: true } }),
    prisma.installment.findMany({
      where: {
        status: { in: ["DUE", "PARTIAL"] },
        dueDate: {
          lte: new Date(new Date().setDate(new Date().getDate() + 7)),
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        }
      },
      include: { serviceOrder: { include: { client: true } } },
      orderBy: { dueDate: "asc" },
      take: 5
    }),
    prisma.payment.findMany({ where: { paidAt: { gte: startDate, lte: endDate } } }),
    prisma.expense.findMany({ where: { date: { gte: startDate, lte: endDate } }, include: { category: true } }),
    prisma.loan.findMany(),
    prisma.loanRepayment.findMany(),
    prisma.investment.findMany(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.sale.findMany({ orderBy: { createdAt: "desc" } }),
    getAllAccountBalances(),
    prisma.dividend.findMany(),
    prisma.shareHolder.findMany(),
    prisma.product.count({ where: { stockQty: { lte: prisma.product.fields.reorderLvl } } }), // ✅ Low Stock Count
  ]);

  const totalDue = sales.reduce((acc, sale) => acc + Number(sale.dueAmount), 0);
  const totalCollected = Number(collectedAgg._sum.amount ?? 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const netProfit = totalCollected - totalExpense;

  const monthlyCollected = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const monthlyExpense = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const totalLoan = loans.reduce((sum, l) => sum + Number(l.principal), 0);
  const totalLoanPaid = loanRepayments.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalInvestment = investments.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalStockValue = products.reduce((sum, p) => sum + (Number(p.sellPrice) * p.stockQty), 0);
  const totalPurchaseValue = products.reduce((sum, p) => sum + (Number(p.costPrice) * p.stockQty), 0);
  const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);

  const totalShares = shareHolders.reduce((sum, h) => sum + h.totalShares, 0);
  const totalDividendDeclared = dividends.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalDividendPaid = dividends.filter(d => d.status === "PAID").reduce((sum, d) => sum + Number(d.amount), 0);
  const totalDividendDue = totalDividendDeclared - totalDividendPaid;

  const monthlyDataMap = new Map();
  const monthlyExpenseMap = new Map();
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('default', { month: 'short' });
    monthlyDataMap.set(monthName, 0);
    monthlyExpenseMap.set(monthName, 0);
  }
  payments.forEach(p => {
    const monthName = new Date(p.paidAt).toLocaleString('default', { month: 'short' });
    if (monthlyDataMap.has(monthName)) monthlyDataMap.set(monthName, monthlyDataMap.get(monthName) + Number(p.amount));
  });
  expenses.forEach(e => {
    const monthName = new Date(e.date).toLocaleString('default', { month: 'short' });
    if (monthlyExpenseMap.has(monthName)) monthlyExpenseMap.set(monthName, monthlyExpenseMap.get(monthName) + Number(e.amount));
  });
  const monthlyData = Array.from(monthlyDataMap, ([name, total]) => ({ name, total }));
  const monthlyExpenseData = Array.from(monthlyExpenseMap, ([name, total]) => ({ name, total }));

  const expenseCategoryMap = new Map();
  filteredExpenses.forEach((e: any) => {
    const catName = e.category?.name || "Others"; 
    const current = expenseCategoryMap.get(catName) || 0;
    expenseCategoryMap.set(catName, current + Number(e.amount));
  });
  const expenseCategoryData = Array.from(expenseCategoryMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const stockData = products.map(p => ({ name: p.name, value: p.stockQty })).filter(p => p.value > 0).sort((a, b) => b.value - a.value).slice(0, 5);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const monthlyTarget = 100000;
  const targetProgress = Math.min(100, Math.round((monthlyCollected / monthlyTarget) * 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Track your sales activity, leads and deals here.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <form className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <Filter size={16} className="text-slate-400 ml-2" />
            <select name="month" defaultValue={selectedMonth} className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
              {monthNames.map((m, idx) => <option key={idx} value={idx} className="dark:bg-slate-900">{m}</option>)}
            </select>
            <select name="year" defaultValue={selectedYear} className="bg-transparent border-none text-sm font-medium text-slate-700 dark:text-slate-200 outline-none cursor-pointer">
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y} className="dark:bg-slate-900">{y}</option>)}
            </select>
            <button type="submit" className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">Apply</button>
            {(resolvedParams.month || resolvedParams.year) && (
              <Link href="/dashboard" className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Clear Filter">
                <X size={16} />
              </Link>
            )}
          </form>
          <Link href="/reports" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
            <ArrowUpRight size={16} /> Export
          </Link>
        </div>
      </div>

      {/* ✅ Low Stock Alert Banner */}
      {lowStockCount > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/40 p-2.5 rounded-xl text-red-600 dark:text-red-400 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">Low Stock Alert!</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{lowStockCount} products are running low on stock. Please reorder soon to avoid sales disruption.</p>
            </div>
          </div>
          <Link href="/masters?tab=products" className="w-full md:w-auto text-center bg-white dark:bg-slate-900 text-red-600 border border-red-200 dark:border-red-800 px-5 py-2 rounded-xl text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors shrink-0">
            View Products
          </Link>
        </div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <h3 className="text-lg font-bold mb-1">Monthly Target</h3>
          <p className="text-indigo-100 text-xs mb-4">You have completed <span className="font-bold text-white">{targetProgress}%</span> of your target.</p>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">৳ {monthlyCollected.toLocaleString()}</p>
              <p className="text-xs text-indigo-200 mt-1">Target: ৳ {monthlyTarget.toLocaleString()}</p>
            </div>
            <div className="relative w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-indigo-300" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-white" strokeDasharray={`${targetProgress}, 100`} strokeWidth="4" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="text-sm font-bold">{targetProgress}%</span>
            </div>
          </div>
        </div>

        {settings?.showCash && <StatCard label="Total Collected" value={`৳ ${totalCollected.toLocaleString()}`} icon={<Wallet size={20} />} color="bg-green-100 text-green-600" />}
        {settings?.showSale && <StatCard label="Total Sales" value={`৳ ${totalSales.toLocaleString()}`} icon={<FileText size={20} />} color="bg-blue-100 text-blue-600" />}
        {settings?.showDue && <StatCard label="Total Due" value={`৳ ${totalDue.toLocaleString()}`} icon={<AlertCircle size={20} />} color="bg-red-100 text-red-600" />}
      </div>

      {/* Other KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {settings?.showInvestment && <MiniKpiCard label="Total Investment" value={`৳ ${totalInvestment.toLocaleString()}`} icon={<TrendingUp size={16} />} />}
        {settings?.showLoan && <MiniKpiCard label="Loan Taken" value={`৳ ${totalLoan.toLocaleString()}`} icon={<Landmark size={16} />} />}
        {settings?.showLoanPaid && <MiniKpiCard label="Loan Paid" value={`৳ ${totalLoanPaid.toLocaleString()}`} icon={<HandCoins size={16} />} />}
        {settings?.showUserCount && <MiniKpiCard label="Active Users" value={usersCount.toString()} icon={<Users size={16} />} />}
        {settings?.showStock && <MiniKpiCard label="Stock Value (Sale)" value={`৳ ${totalStockValue.toLocaleString()}`} icon={<Package size={16} />} />}
        {settings?.showStock && <MiniKpiCard label="Stock Value (Purchase)" value={`৳ ${totalPurchaseValue.toLocaleString()}`} icon={<Layers size={16} />} />}
        
        {accountBalances.cashBalance > 0 && (
          <MiniKpiCard label="Cash Balance" value={`৳ ${accountBalances.cashBalance.toLocaleString()}`} icon={<Banknote size={16} />} />
        )}
        
        {settings?.showPettyCash && accountBalances.balances.filter((b: any) => b.type === "PETTY_CASH").map((acc: any) => (
          <MiniKpiCard 
            key={acc.id} 
            label={`${acc.name} (Petty Cash)`} 
            value={`৳ ${acc.balance.toLocaleString()}`} 
            icon={<Wallet size={16} />} 
          />
        ))}

        {accountBalances.balances.filter((acc: any) => acc.type !== "PETTY_CASH").map((acc: any) => (
          <MiniKpiCard 
            key={acc.id} 
            label={`${acc.name} (${acc.type})`} 
            value={`৳ ${acc.balance.toLocaleString()}`} 
            icon={acc.type === "BANK" ? <Landmark size={16} /> : acc.type === "MFS" ? <Smartphone size={16} /> : <QrCode size={16} />} 
          />
        ))}
      </div>

      {/* Dividend KPI Cards */}
      {settings?.showDividend && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MiniKpiCard label="Total Shares" value={totalShares.toString()} icon={<PieChart size={16} />} />
          <MiniKpiCard label="Dividend Declared" value={`৳ ${totalDividendDeclared.toLocaleString()}`} icon={<FileText size={16} />} />
          <MiniKpiCard label="Dividend Paid" value={`৳ ${totalDividendPaid.toLocaleString()}`} icon={<HandCoins size={16} />} />
          <MiniKpiCard label="Dividend Due" value={`৳ ${totalDividendDue.toLocaleString()}`} icon={<AlertCircle size={16} />} />
        </div>
      )}

      {/* Charts Section */}
      {settings?.showGraph && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 dark:text-white">Revenue Analytics</h2>
                <span className="text-xs text-slate-400">Last 6 Months</span>
              </div>
              {monthlyData.some(d => d.total > 0) ? (
                <MonthlyCollectionChart data={monthlyData} />
              ) : (
                <NoDataChart message="No revenue data for the last 6 months" />
              )}
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 dark:text-white">Expenses Overview</h2>
                <span className="text-xs text-slate-400">Last 6 Months</span>
              </div>
              {monthlyExpenseData.some(d => d.total > 0) ? (
                <MonthlyExpenseChart data={monthlyExpenseData} />
              ) : (
                <NoDataChart message="No expense data for the last 6 months" />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 dark:text-white">Stock Distribution</h2>
                <span className="text-xs text-slate-400">Top 5 Products</span>
              </div>
              {stockData.length > 0 ? (
                <StockPieChart data={stockData} />
              ) : (
                <NoDataChart message="No stock data available" />
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-slate-800 dark:text-white">Expense Breakdown</h2>
                <span className="text-xs text-slate-400">By Category</span>
              </div>
              {expenseCategoryData.length > 0 ? (
                <ExpenseCategoryChart data={expenseCategoryData} />
              ) : (
                <NoDataChart message="No expense categories found" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800 dark:text-white">Recent Orders</h2>
          <Link href="/sales" className="text-xs text-blue-600 font-medium hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-medium">Order No</th>
                <th className="px-4 font-medium">Client</th>
                <th className="px-4 font-medium">Amount</th>
                <th className="px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{o.orderNo}</td>
                  <td className="px-4 text-slate-600 dark:text-slate-300">{o.client.name}</td>
                  <td className="px-4 font-medium text-slate-800 dark:text-slate-200">৳ {Number(o.totalAmount).toLocaleString()}</td>
                  <td className="px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      o.status === 'PAID' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                      o.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center">
      <div className={`p-3 rounded-xl ${color} w-fit mb-4`}>
        {icon}
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

function MiniKpiCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{label}</p>
        <p className="text-sm font-bold mt-0.5 text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}