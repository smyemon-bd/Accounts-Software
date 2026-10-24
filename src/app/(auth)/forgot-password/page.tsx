"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/toast-provider";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // এখানে ইমেইল পাঠানোর লজিক যোগ হবে (আপাতত শুধু মেসেজ)
    showToast("Password reset link sent to your email!");
    setEmail("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Forgot Password</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input 
                className="input-premium" 
                placeholder="Email"
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-2.5 font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
            >
              Send Reset Link
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}