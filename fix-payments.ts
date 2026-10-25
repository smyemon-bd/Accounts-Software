import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Fixing old payments and account books...");

  const getOrCreateAccount = async (code: string, name: string, type: string) => {
    let acc = await prisma.account.findUnique({ where: { code } });
    if (!acc) acc = await prisma.account.create({ data: { code, name, type } });
    return acc;
  };

  // ১. পুরনো পেমেন্টগুলো খোঁজা যেগুলোর কোনো জার্নাল এন্ট্রি নেই
  const payments = await prisma.payment.findMany({
    where: { journalEntry: null } 
  });
  
  let count = 0;
  for (const p of payments) {
    let cashAccountCode = "1000"; // ডিফল্ট ক্যাশ
    
    // যদি পেমেন্টের সাথে কোনো ব্যাংক/MFS অ্যাকাউন্ট যুক্ত থাকে, সেটার কোড নাও
    if (p.paymentAccountId) {
      cashAccountCode = `ACC-${p.paymentAccountId}`;
      const pAcc = await prisma.paymentAccount.findUnique({ where: { id: p.paymentAccountId } });
      if (pAcc) {
        await getOrCreateAccount(cashAccountCode, `${pAcc.name} (${pAcc.type})`, "ASSET");
      }
    } else {
      await getOrCreateAccount("1000", "Cash", "ASSET");
    }

    const revenueAcc = await getOrCreateAccount("4000", "Sales Revenue", "REVENUE");
    const cashAcc = await prisma.account.findUniqueOrThrow({ where: { code: cashAccountCode } });

    // নতুন করে জার্নাল এন্ট্রি তৈরি করা সঠিক অ্যাকাউন্টে
    await prisma.journalEntry.create({
      data: {
        paymentId: p.id,
        memo: `Old Payment Fixed - ${p.id.slice(-6)}`,
        lines: {
          create: [
            { accountId: cashAcc.id, debit: p.amount, credit: 0 },
            { accountId: revenueAcc.id, debit: 0, credit: p.amount },
          ],
        },
      },
    });
    count++;
  }

  console.log(`✅ Successfully fixed ${count} old payments and linked them to the correct accounts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });