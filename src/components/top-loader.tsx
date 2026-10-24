"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600); // ৬০০ মিলি-সেকেন্ড পর লোডার চলে যাবে

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[200] pointer-events-none">
      <div className="h-1 bg-blue-600 animate-progress origin-left w-full" />
    </div>
  );
}