import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EditServiceForm } from "./edit-form";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const service = await prisma.service.findUnique({ 
    where: { id: resolvedParams.id } 
  });

  if (!service) notFound();

  // Decimal টাইপকে Number-এ কনভার্ট করা হচ্ছে
  const serializableService = {
    ...service,
    price: Number(service.price)
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pt-10">
      <Link href="/services" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
        ← Back to Services
      </Link>

      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Edit Service</h1>
        
        {/* ফর্মটি ক্লায়েন্ট কম্পোনেন্টে পাঠানো হলো */}
        <EditServiceForm service={serializableService} />
      </div>
    </div>
  );
}