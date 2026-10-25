import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditClientForm } from "./edit-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const client = await prisma.client.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!client) notFound();

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10">
      {/* ✅ ব্যাক লিংক ফিক্স করা হলো */}
      <Link 
        href="/masters?tab=clients" 
        className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        ← Back to Clients
      </Link>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Edit Client: {client.name}</h1>
        
        {/* ক্লায়েন্ট ফর্ম কম্পোনেন্ট */}
        <EditClientForm client={client} />
      </div>
    </div>
  );
}