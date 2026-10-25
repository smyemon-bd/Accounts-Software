"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { NotificationBell } from "@/components/notification-bell";
import { ToastProvider } from "@/components/toast-provider";
import { TopLoader } from "@/components/top-loader";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/global-search";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, Users, Briefcase, FileText, CreditCard, Package, 
  MonitorSmartphone, TrendingUp, Landmark, AlertCircle, BookOpen, Receipt, UserCircle, Settings, Database,
  PieChart, Wallet, CalendarCheck, Layers // ✅ Layers আইকন যোগ করা হলো
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: sessionData } = useSession();

  const user = sessionData?.user || { name: "Loading...", role: "USER", permissions: [] };
  const perms: string[] = (user as any).permissions || [];
  const has = (p: string) => perms.includes("*") || perms.includes(p);

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/masters", label: "Masters", icon: Database, show: true },
    { href: "/sales", label: "Sales", icon: FileText, show: true },
    { href: "/payments", label: "Payments", icon: CreditCard, show: has("payment.read") },
    { href: "/bulk-payments", label: "Bulk Entry", icon: Layers, show: has("dashboard.admin") }, // ✅ নতুন মেনু
    { href: "/investments", label: "Investments", icon: TrendingUp, show: has("dashboard.admin") },
    { href: "/loans", label: "Loans", icon: Landmark, show: has("dashboard.admin") },
    { href: "/expenses", label: "Expenses", icon: Receipt, show: has("dashboard.admin") },
    { href: "/attendance", label: "Attendance", icon: CalendarCheck, show: has("dashboard.admin") },
    { href: "/reports", label: "Due Reports", icon: AlertCircle, show: has("dashboard.admin") },
    { href: "/accounting", label: "Accounting", icon: BookOpen, show: has("dashboard.admin") },
    { href: "/cashbook", label: "Cash Book", icon: Landmark, show: has("dashboard.admin") },
    { href: "/dividends", label: "Dividends", icon: PieChart, show: has("dashboard.admin") },
    { href: "/users", label: "Users", icon: UserCircle, show: has("user.read") },
    { href: "/settings", label: "Settings", icon: Settings, show: has("dashboard.admin") },
  ];

  return (
    <ToastProvider>
      <TopLoader />
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
        
        {/* মোবাইল হেডার */}
        <div className="md:hidden print:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 flex items-center justify-between px-4 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <MobileSidebar nav={nav} user={user} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">ByteFlow BMS </h2>
          </div>
          <div className="flex items-center gap-2">
            <GlobalSearch />
            <ThemeToggle />
            <NotificationBell />
            <UserProfileMenu user={user} />
          </div>
        </div>

        {/* ডেস্কটপ সাইডবার */}
        <aside className="hidden md:flex print:hidden w-64 bg-slate-900 dark:bg-slate-950 text-slate-300 flex-col shadow-2xl z-20 border-r border-slate-800 dark:border-slate-900 transition-colors h-screen sticky top-0 overflow-y-auto">
          <div className="h-16 flex items-center px-6 border-b border-slate-800/50 bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-sm shrink-0">
            <h2 className="text-xl font-bold text-white tracking-wide">
              ByteFlow <span className="text-blue-500">BMS</span>
            </h2>
          </div>
          
          <nav className="flex-1 py-4 space-y-1 px-3">
            {nav.filter(n => n.show).map(n => {
              const isActive = pathname === n.href || pathname.startsWith(n.href + "/");
              const Icon = n.icon;
              return (
                <Link 
                  key={n.href} 
                  href={n.href} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 group ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                      : "hover:bg-slate-800 dark:hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Icon size={18} className={`transition-colors duration-200 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`} />
                  <span>{n.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        
        {/* মূল কন্টেন্ট এরিয়া */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden pt-16 md:pt-0">
          
          {/* ডেস্কটপ হেডার */}
          <div className="hidden md:flex print:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 items-center justify-end gap-4 px-8 sticky top-0 z-20 shadow-sm transition-colors shrink-0">
            <GlobalSearch />
            <ThemeToggle />
            <NotificationBell />
            <UserProfileMenu user={user} />
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}