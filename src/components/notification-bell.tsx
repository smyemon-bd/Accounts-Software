"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, CheckCircle, Package, CheckCheck } from "lucide-react";
import { getNotifications, getUnreadCount, markAllAsRead } from "@/server/actions/notification";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
      if (isOpen) {
        const list = await getNotifications();
        setNotifications(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    const list = await getNotifications();
    setNotifications(list.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    if (type === "PAYMENT") return <CheckCircle size={16} className="text-green-600" />;
    if (type === "SALE") return <Package size={16} className="text-blue-600" />;
    return <AlertCircle size={16} className="text-orange-600" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-toast">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                No recent notifications
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 flex gap-3 ${!notif.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{notif.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.message}</p>
                    {notif.amount && (
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">৳ {Number(notif.amount).toLocaleString()}</p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}