"use server";
import { prisma } from "@/lib/prisma";

export async function globalSearch(query: string) {
  if (!query || query.length < 2) {
    return { clients: [], services: [], orders: [], products: [], expenses: [] };
  }

  const [clients, services, orders, products, expenses] = await Promise.all([
    // ১. ক্লায়েন্ট সার্চ
    prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 3,
    }),
    // ২. সার্ভিস সার্চ
    prisma.service.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 3,
    }),
    // ৩. অর্ডার সার্চ
    prisma.serviceOrder.findMany({
      where: {
        OR: [
          { orderNo: { contains: query, mode: "insensitive" } },
          { client: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: { client: true },
      take: 3,
    }),
    // ৪. প্রোডাক্ট সার্চ
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 3,
    }),
    // ৫. খরচ সার্চ (নতুন ফিল্ড অনুযায়ী)
    prisma.expense.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: { category: true },
      take: 3,
    }),
  ]);

  // ডেটাগুলোকে সিরিয়ালাইজ করা (Decimal সমস্যা এড়াতে)
  return JSON.parse(JSON.stringify({
    clients,
    services,
    orders,
    products,
    expenses
  }));
}