"use server";
import { requirePermission } from "@/lib/rbac";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execAsync = promisify(exec);

export async function createBackup(formData: FormData) {
  await requirePermission("dashboard.admin");
  
  const backupDir = String(formData.get("backupDir"));
  
  if (!backupDir) {
    return { success: false, error: "Please provide a backup directory." };
  }

  // ফোল্ডার না থাকলে তৈরি করা
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `byteflow_backup_${timestamp}.sql`;
  const filePath = path.join(backupDir, fileName);

  // pg_dump এর সম্পূর্ণ পাথ (আপনার ভার্সন ১৬ না হলে পরিবর্তন করুন)
  const pgDumpPath = `"C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe"`;
  
  // কমান্ড তৈরি
  const command = `${pgDumpPath} -U postgres -h localhost -p 5432 -F p -f "${filePath}" byteflow_bms`;

  try {
    // এখানে PGPASSWORD এনভায়রনমেন্ট ভেরিয়েবলটি Node.js থেকে সরাসরি পাঠানো হচ্ছে
    await execAsync(command, { 
      shell: "cmd.exe", 
      windowsHide: true,
      env: { ...process.env, PGPASSWORD: "byteflow" } 
    });
    return { success: true, filePath };
  } catch (error: any) {
    console.error("Backup Error:", error);
    return { success: false, error: error.message || "Backup failed." };
  }
}