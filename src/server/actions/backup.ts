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

  // .env থেকে পাথ এবং পাসওয়ার্ড নেওয়া হচ্ছে (ফallback হিসেবে ডিফল্ট ভ্যালু)
  const pgDumpPath = `"${process.env.PG_DUMP_PATH || 'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe'}"`; 
  const dbName = process.env.DB_NAME || "byteflow_bms";
  const dbUser = process.env.DB_USER || "postgres";
  const dbHost = process.env.DB_HOST || "localhost";
  const dbPass = process.env.DB_PASSWORD || "byteflow";
  const dbPort = process.env.DB_PORT || "5432";

  const command = `${pgDumpPath} -U ${dbUser} -h ${dbHost} -p ${dbPort} -F p -f "${filePath}" ${dbName}`;

  try {
    await execAsync(command, { 
      shell: "cmd.exe", 
      windowsHide: true,
      env: { ...process.env, PGPASSWORD: dbPass } 
    });
    return { success: true, filePath };
  } catch (error: any) {
    console.error("Backup Error:", error);
    return { success: false, error: error.message || "Backup failed." };
  }
}