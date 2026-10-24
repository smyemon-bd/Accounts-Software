"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mt-2 text-sm text-red-600 hover:text-red-800 hover:underline font-medium transition-colors block text-left w-full"
    >
      Logout
    </button>
  );
}