import { getClientSession, clientLogout } from "@/server/actions/portal";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, UserCircle } from "lucide-react";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const client = await getClientSession();
  
  if (!client) {
    return <>{children}</>; // লগইন পেজের জন্য লেআউট ছাড়া রেন্ডার হবে
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Portal Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/portal" className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">B</span>
            Client Portal
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/portal" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              My Invoices
            </Link>
            <Link href="/portal/profile" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              My Profile
            </Link>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{client.name}</span>
              <form action={async () => { 
                "use server";
                await clientLogout();
                redirect("/portal/login");
              }}>
                <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Logout">
                  <LogOut size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}