import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Starting accounting fix...");

  // ১. ডিফল্ট অ্যাকাউন্টগুলো তৈরি করা (যদি না থাকে)
  const getOrCreateAccount = async (code: string, name: string, type: string) => {
    let acc = await prisma.account.findUnique({ where: { code } });
    if (!acc) {
      acc = await prisma.account.create({ data: { code, name, type } });
      console.log(`Created Account: ${name}`);
    }
    return acc;
  };

  const cashAcc = await getOrCreateAccount("1000", "Cash", "ASSET");
  const revAcc = await getOrCreateAccount("4000", "Sales Revenue", "REVENUE");
  const arAcc = await getOrCreateAccount("1100", "Accounts Receivable", "ASSET");
  const expAcc = await getOrCreateAccount("5000", "General Expense", "EXPENSE");

  // ২. পুরনো পেমেন্টগুলো চেক করা এবং জার্নাল এন্ট্রি তৈরি করা
  const payments = await prisma.payment.findMany();
  let paymentCount = 0;
  
  for (const p of payments) {
    // চেক করা: এই পেমেন্টের জন্য আগে থেকে কোনো জার্নাল এন্ট্রি আছে কি না
    const existingEntry = await prisma.journalEntry.findUnique({ where: { paymentId: p.id } });
    
    if (!existingEntry) {
      await prisma.journalEntry.create({
        data: {
          paymentId: p.id,
          memo: `Backfilled Payment - ${p.id.slice(-6)}`,
          lines: {
            create: [
              { accountId: cashAcc.id, debit: p.amount, credit: 0 },
              { accountId: revAcc.id, debit: 0, credit: p.amount },
            ],
          },
        },
      });
      paymentCount++;
    }
  }
  console.log(`Fixed ${paymentCount} old payments.`);

  // ৩. পুরনো সেলগুলো চেক করা এবং Due Amount (AR) এর এন্ট্রি তৈরি করা
  const sales = await prisma.sale.findMany({ include: { items: true } });
  let saleCount = 0;
  
  for (const sale of sales) {
    if (Number(sale.dueAmount) > 0) {
      // Due এর জন্য জার্নাল এন্ট্রি আছে কি না চেক (মেমো টেক্সট দিয়ে)
      const existingAR = await prisma.journalEntry.findFirst({ 
        where: { memo: `Sale Due - ${sale.invoiceNo}` } 
      });
      
      if (!existingAR) {
        await prisma.journalEntry.create({
          data: {
            memo: `Sale Due - ${sale.invoiceNo}`,
            lines: {
              create: [
                { accountId: arAcc.id, debit: sale.dueAmount, credit: 0 },
                { accountId: revAcc.id, debit: 0, credit: sale.dueAmount },
              ],
            },
          },
        });
        saleCount++;
      }
    }
  }
  console.log(`Fixed Due amounts for ${saleCount} sales.`);

  console.log("✅ Accounting backfill complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });