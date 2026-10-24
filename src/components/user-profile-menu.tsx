"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { User, LogOut, KeyRound, Settings, ChevronDown } from "lucide-react";
import { getUserProfileData } from "@/server/actions/user"; // নতুন ইমপোর্ট

export function UserProfileMenu({ user: initialUser }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(initialUser); // ডাইনামিক স্টেট
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ডেটাবেজ থেকে আসল নাম ও ছবি আনা
  useEffect(() => {
    getUserProfileData().then(data => {
      if (data) {
        setUser((prev: any) => ({ ...prev, name: data.name, image: data.image }));
      }
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-inner overflow-hidden border border-slate-200 dark:border-slate-700">
          {user.image ? (
            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            user.name.charAt(0)
          )}
        </div>
        <ChevronDown size={14} className="text-slate-400 hidden md:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-toast">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <User size={16} className="text-slate-400" /> My Profile
            </Link>
            <Link href="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <KeyRound size={16} className="text-slate-400" /> Change Password
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Settings size={16} className="text-slate-400" /> Settings
            </Link>
          </div>

          <div className="p-2 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}