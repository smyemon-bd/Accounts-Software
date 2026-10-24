"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function AccountSelector({ accountOptions, selectedAccountId }: { 
  accountOptions: { id: string, name: string }[], 
  selectedAccountId: string 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAccountId = e.target.value;
    // URL-এ নতুন accountId সেট করে পেজ রিফ্রেশ করা
    router.push(`/cashbook?accountId=${newAccountId}`);
  };

  return (
    <select 
      value={selectedAccountId}
      onChange={handleChange}
      className="border rounded-xl px-3 py-2 text-sm dark:bg-slate-900 dark:text-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-500"
    >
      {accountOptions.map(acc => (
        <option key={acc.id} value={acc.id}>{acc.name}</option>
      ))}
    </select>
  );
}