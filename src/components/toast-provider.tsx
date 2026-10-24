"use client";

import { createContext, useContext, useState } from "react";
import { Toast } from "./toast";

const ToastContext = createContext({
  showToast: (msg: string) => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string) => setMessage(msg);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && <Toast message={message} onClose={() => setMessage(null)} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);