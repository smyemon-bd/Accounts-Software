import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditClientForm } from "./edit-form"; // ক্লায়েন্ট ফর্ম কম্পোনেন্ট ইমপোর্ট

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const client = await prisma.client.findUnique({
    where: { id: resolvedParams.id }
  });

  if (!client) notFound();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
          ← Back to Clients
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-slate-800 mb-6">Edit Client: {client.name}</h1>
        
        {/* ক্লায়েন্ট ফর্ম কম্পোনেন্ট */}
        <EditClientForm client={client} />
      </div>
    </div>
  );
}