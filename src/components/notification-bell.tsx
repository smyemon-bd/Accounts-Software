"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, CheckCircle, Package, CheckCheck, ExternalLink, Inbox } from "lucide-react";
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from "@/server/actions/notification";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const router = useRouter();
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

  const handleOpen = () => setIsOpen(!isOpen);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    const list = await getNotifications();
    setNotifications(list.map((n: any) => ({ ...n, isRead: true })));
  };

  const handleNotifClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setIsOpen(false);
    if (notif.type === "SALE") router.push("/sales?tab=history");
    else if (notif.type === "PAYMENT") router.push("/payments");
    else router.push("/dashboard");
    loadNotifications();
  };

  const getIcon = (type: string) => {
    if (type === "PAYMENT") return <CheckCircle size={18} className="text-emerald-500" />;
    if (type === "SALE") return <Package size={18} className="text-blue-500" />;
    return <AlertCircle size={18} className="text-orange-500" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={handleOpen}
        className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={20} className={unreadCount > 0 ? "text-blue-600 dark:text-blue-400" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-200">{unreadCount} new</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 transition-colors bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          
          {/* List */}
          <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-10 text-center flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <Inbox size={40} className="mb-3 opacity-20 text-slate-400" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  onClick={() => handleNotifClick(notif)}
                  className={`p-4 transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-0 flex gap-3 cursor-pointer group relative ${
                    !notif.isRead 
                      ? 'bg-blue-50/80 dark:bg-blue-900/20 border-l-4 border-l-blue-500 hover:bg-blue-100/50 dark:hover:bg-blue-900/30' 
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={`text-sm pr-4 ${!notif.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                        {notif.title}
                      </p>
                      <ExternalLink size={14} className="absolute right-4 top-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                    
                    {notif.amount && (
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1.5 bg-white dark:bg-slate-800 inline-block px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                        ৳ {Number(notif.amount).toLocaleString()}
                      </p>
                    )}
                    
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">
                      {new Date(notif.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>

                  {/* Unread Blue Dot */}
                  {!notif.isRead && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-center">
              <button onClick={() => setIsOpen(false)} className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors">
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}