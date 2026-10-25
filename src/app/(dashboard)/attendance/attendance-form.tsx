"use client";

import { useState } from "react";
import { saveAttendance } from "@/server/actions/attendance";
import { useToast } from "@/components/toast-provider";
import { SubmitButton } from "@/components/submit-button";
import { CheckCircle2, XCircle, Clock, UserMinus } from "lucide-react";

export function AttendanceForm({ records, date }: { records: any[], date: string }) {
  const { showToast } = useToast();
  const [localRecords, setLocalRecords] = useState(records);

  const handleStatusChange = (userId: string, newStatus: string) => {
    setLocalRecords(localRecords.map(r => 
      r.userId === userId ? { ...r, status: newStatus } : r
    ));
  };

  const handleNoteChange = (userId: string, note: string) => {
    setLocalRecords(localRecords.map(r => 
      r.userId === userId ? { ...r, note } : r
    ));
  };

  async function handleSubmit(formData: FormData) {
    const dataToSave = localRecords.map(r => `${r.userId}|${r.status}|${r.note || ""}`);
    formData.delete("records");
    dataToSave.forEach(d => formData.append("records", d));

    const res = await saveAttendance(formData);
    if (res?.success) {
      showToast("Attendance saved successfully!");
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === "PRESENT") return <CheckCircle2 size={16} className="text-emerald-500" />;
    if (status === "ABSENT") return <XCircle size={16} className="text-red-500" />;
    if (status === "LATE") return <Clock size={16} className="text-amber-500" />;
    return <UserMinus size={16} className="text-slate-500" />;
  };

  return (
    <form action={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <input type="hidden" name="date" value={date} />
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
              <th className="p-4 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Employee Name</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-center">Status</th>
              <th className="p-4 font-bold text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Note (Optional)</th>
            </tr>
          </thead>
          <tbody>
            {localRecords.map(record => (
              <tr key={record.userId} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                <td className="p-4">
                  <div className="font-bold text-slate-900 dark:text-white">{record.name}</div>
                  <div className="text-xs text-slate-500">{record.email}</div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <select 
                      value={record.status}
                      onChange={(e) => handleStatusChange(record.userId, e.target.value)}
                      className={`font-bold rounded-lg px-3 py-1.5 border outline-none cursor-pointer ${
                        record.status === "PRESENT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        record.status === "ABSENT" ? "bg-red-50 text-red-700 border-red-200" :
                        record.status === "LATE" ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LATE">Late</option>
                      <option value="HALF_DAY">Half Day</option>
                      <option value="LEAVE">Leave</option>
                    </select>
                    {getStatusIcon(record.status)}
                  </div>
                </td>
                <td className="p-4">
                  <input 
                    type="text" 
                    value={record.note}
                    onChange={(e) => handleNoteChange(record.userId, e.target.value)}
                    placeholder="Reason..." 
                    className="input-premium py-1.5 text-sm w-full max-w-[200px]"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <SubmitButton className="w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl px-8 py-2.5 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30">
          Save Attendance
        </SubmitButton>
      </div>
    </form>
  );
}