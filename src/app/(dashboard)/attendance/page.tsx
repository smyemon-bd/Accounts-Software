import { getAttendanceByDate } from "@/server/actions/attendance";
import { AttendanceForm } from "./attendance-form";
import { CalendarCheck } from "lucide-react";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const resolvedParams = await searchParams;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const selectedDate = resolvedParams.date || today;

  const records = await getAttendanceByDate(selectedDate);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarCheck className="text-blue-500" /> Employee Attendance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage daily attendance for your team members.</p>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4">
        <form className="flex items-center gap-3">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Date:</label>
          <input 
            type="date" 
            name="date" 
            defaultValue={selectedDate} 
            className="input-premium max-w-xs cursor-pointer" 
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">Load</button>
        </form>
      </div>

      {/* Attendance Form */}
      <AttendanceForm 
        records={records} 
        date={selectedDate} 
      />
    </div>
  );
}