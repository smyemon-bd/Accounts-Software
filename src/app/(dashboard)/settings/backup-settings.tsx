"use client";

import { useState } from "react";
import { createBackup } from "@/server/actions/backup";
import { useToast } from "@/components/toast-provider";
import { DatabaseBackup, Download } from "lucide-react";

export function BackupSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [backupDir, setBackupDir] = useState("C:\\ByteFlow_Backups");

  const handleBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("backupDir", backupDir);

    const res = await createBackup(formData);
    setLoading(false);

    if (res.success) {
      showToast(`Backup saved successfully at: ${res.filePath}`);
    } else {
      showToast(res.error || "Backup failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
          <DatabaseBackup className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Manual Data Backup</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Save a copy of your entire database to your local computer.</p>
        </div>
      </div>

      <form onSubmit={handleBackup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Backup Directory (Local Path)
          </label>
          <input 
            value={backupDir} 
            onChange={e => setBackupDir(e.target.value)} 
            placeholder="e.g., C:\ByteFlow_Backups" 
            required 
            className="input-premium" 
          />
          <p className="text-xs text-slate-500 mt-1">The backup file (.sql) will be saved in this directory.</p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-5 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download size={16} /> {loading ? "Backing up..." : "Create Backup"}
        </button>
      </form>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2">How it works:</h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
          <li>A file named <code>byteflow_backup_[timestamp].sql</code> will be created in the specified directory.</li>
          <li>You can use this file to restore your database later using <code>psql</code> or pgAdmin.</li>
          <li><strong>Note:</strong> Ensure PostgreSQL's <code>bin</code> folder is in your system's PATH for this to work.</li>
        </ul>
      </div>
    </div>
  );
}