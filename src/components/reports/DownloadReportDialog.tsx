import { useState } from "react";
import { Download } from "lucide-react";
import { format, subMonths, subYears } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const periods = [
  { label: "1 Month", months: 1 },
  { label: "3 Months", months: 3 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 },
];

export function DownloadReportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<number | null>(null);

  const handleDownload = async (months: number) => {
    setLoading(months);
    try {
      const endDate = format(new Date(), "yyyy-MM-dd");
      const startDate = format(
        months === 12 ? subYears(new Date(), 1) : subMonths(new Date(), months),
        "yyyy-MM-dd"
      );

      // Fetch all data in parallel
      const [workersRes, attendanceRes, briefingRes, overtimeRes] = await Promise.all([
        supabase.from("workers").select("*").order("worker_name"),
        supabase.from("attendance").select("*, workers(worker_id, worker_name, department)").gte("date", startDate).lte("date", endDate).order("date"),
        supabase.from("briefing_attendance").select("*, workers(worker_id, worker_name, department)").gte("date", startDate).lte("date", endDate).order("date"),
        supabase.from("overtime").select("*, workers(worker_id, worker_name, department)").gte("date", startDate).lte("date", endDate).order("date"),
      ]);

      if (workersRes.error) throw workersRes.error;
      if (attendanceRes.error) throw attendanceRes.error;
      if (briefingRes.error) throw briefingRes.error;
      if (overtimeRes.error) throw overtimeRes.error;

      const wb = XLSX.utils.book_new();

      const styleSheet = (ws: XLSX.WorkSheet, colCount: number) => {
        // Set column widths for comfortable spacing
        ws["!cols"] = Array.from({ length: colCount }, () => ({ wch: 20 }));
        // Bold dark headers via cell styling
        for (let c = 0; c < colCount; c++) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c });
          if (ws[cellRef]) {
            ws[cellRef].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "2D3748" } },
              alignment: { horizontal: "center", vertical: "center" },
            };
          }
        }
      };

      // Workers sheet
      const workersData = workersRes.data.map((w: any) => ({
        "Worker ID": w.worker_id,
        "Name": w.worker_name,
        "Department": w.department,
        "Designation": w.designation,
        "Shift": w.shift,
        "Status": w.status,
        "Date of Joining": w.date_of_joining,
      }));
      const wsWorkers = XLSX.utils.json_to_sheet(workersData);
      styleSheet(wsWorkers, 7);
      XLSX.utils.book_append_sheet(wb, wsWorkers, "Workers");

      // Daily Attendance sheet
      const attendanceData = attendanceRes.data.map((a: any) => ({
        "Date": a.date,
        "Worker ID": a.workers?.worker_id || "",
        "Name": a.workers?.worker_name || "",
        "Department": a.workers?.department || "",
        "Status": a.status,
      }));
      const wsAtt = XLSX.utils.json_to_sheet(attendanceData);
      styleSheet(wsAtt, 5);
      XLSX.utils.book_append_sheet(wb, wsAtt, "Daily Attendance");

      // Attendance Summary
      const workerAttSummary: Record<string, { name: string; dept: string; wid: string; present: number; absent: number; leave: number }> = {};
      attendanceRes.data.forEach((a: any) => {
        const key = a.worker_id;
        if (!workerAttSummary[key]) {
          workerAttSummary[key] = { name: a.workers?.worker_name || "", dept: a.workers?.department || "", wid: a.workers?.worker_id || "", present: 0, absent: 0, leave: 0 };
        }
        if (a.status === "Present") workerAttSummary[key].present++;
        else if (a.status === "Absent") workerAttSummary[key].absent++;
        else if (a.status === "Leave") workerAttSummary[key].leave++;
      });
      const attSummaryData = Object.values(workerAttSummary).map(s => ({
        "Worker ID": s.wid,
        "Name": s.name,
        "Department": s.dept,
        "Present Days": s.present,
        "Absent Days": s.absent,
        "Leave Days": s.leave,
        "Total Days": s.present + s.absent + s.leave,
        "Attendance %": s.present + s.absent + s.leave > 0
          ? Math.round((s.present / (s.present + s.absent + s.leave)) * 100) + "%"
          : "0%",
      }));
      const wsAttSummary = XLSX.utils.json_to_sheet(attSummaryData);
      styleSheet(wsAttSummary, 8);
      XLSX.utils.book_append_sheet(wb, wsAttSummary, "Attendance Summary");

      // Briefing Attendance sheet
      const briefingData = briefingRes.data.map((b: any) => ({
        "Date": b.date,
        "Worker ID": b.workers?.worker_id || "",
        "Name": b.workers?.worker_name || "",
        "Department": b.workers?.department || "",
        "Status": b.status,
      }));
      const wsBriefing = XLSX.utils.json_to_sheet(briefingData);
      styleSheet(wsBriefing, 5);
      XLSX.utils.book_append_sheet(wb, wsBriefing, "Briefing Attendance");

      // Briefing Summary
      const workerBriefSummary: Record<string, { name: string; dept: string; wid: string; present: number; absent: number }> = {};
      briefingRes.data.forEach((b: any) => {
        const key = b.worker_id;
        if (!workerBriefSummary[key]) {
          workerBriefSummary[key] = { name: b.workers?.worker_name || "", dept: b.workers?.department || "", wid: b.workers?.worker_id || "", present: 0, absent: 0 };
        }
        if (b.status === "Present") workerBriefSummary[key].present++;
        else workerBriefSummary[key].absent++;
      });
      const briefSummaryData = Object.values(workerBriefSummary).map(s => ({
        "Worker ID": s.wid,
        "Name": s.name,
        "Department": s.dept,
        "Present": s.present,
        "Absent": s.absent,
        "Total": s.present + s.absent,
        "Attendance %": s.present + s.absent > 0
          ? Math.round((s.present / (s.present + s.absent)) * 100) + "%"
          : "0%",
      }));
      const wsBriefSummary = XLSX.utils.json_to_sheet(briefSummaryData);
      styleSheet(wsBriefSummary, 7);
      XLSX.utils.book_append_sheet(wb, wsBriefSummary, "Briefing Summary");

      // Overtime sheet
      const overtimeData = overtimeRes.data.map((o: any) => ({
        "Date": o.date,
        "Worker ID": o.workers?.worker_id || "",
        "Name": o.workers?.worker_name || "",
        "Department": o.workers?.department || "",
        "Start Time": o.start_time,
        "End Time": o.end_time,
        "Hours Worked": o.hours_worked,
      }));
      const wsOT = XLSX.utils.json_to_sheet(overtimeData);
      styleSheet(wsOT, 7);
      XLSX.utils.book_append_sheet(wb, wsOT, "Overtime Records");

      // Overtime Summary with day credits
      const workerOTSummary: Record<string, { name: string; dept: string; wid: string; totalHours: number; sessions: number }> = {};
      overtimeRes.data.forEach((o: any) => {
        const key = o.worker_id;
        if (!workerOTSummary[key]) {
          workerOTSummary[key] = { name: o.workers?.worker_name || "", dept: o.workers?.department || "", wid: o.workers?.worker_id || "", totalHours: 0, sessions: 0 };
        }
        workerOTSummary[key].totalHours += Number(o.hours_worked);
        workerOTSummary[key].sessions++;
      });
      const otSummaryData = Object.values(workerOTSummary).map(s => ({
        "Worker ID": s.wid,
        "Name": s.name,
        "Department": s.dept,
        "Total OT Hours": Math.round(s.totalHours * 100) / 100,
        "OT Days Earned (9h=1day)": Math.floor(s.totalHours / 9),
        "Remaining Hours": Math.round((s.totalHours % 9) * 100) / 100,
        "Total Sessions": s.sessions,
      }));
      const wsOTSummary = XLSX.utils.json_to_sheet(otSummaryData);
      styleSheet(wsOTSummary, 7);
      XLSX.utils.book_append_sheet(wb, wsOTSummary, "Overtime Summary");

      const periodLabel = periods.find(p => p.months === months)?.label || "";
      XLSX.writeFile(wb, `WorkForce_Report_${periodLabel.replace(" ", "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`);

      toast.success(`Report downloaded for ${periodLabel}`);
      setIsOpen(false);
    } catch (error: any) {
      toast.error(`Failed to download report: ${error.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download Report</span>
          <span className="sm:hidden">Report</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Download Report</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Select a period to download the complete workforce report including attendance, briefing, and overtime data.
        </p>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {periods.map((p) => (
            <Button
              key={p.months}
              variant="outline"
              className="h-16 flex flex-col gap-1"
              onClick={() => handleDownload(p.months)}
              disabled={loading !== null}
            >
              {loading === p.months ? (
                <span className="text-sm">Downloading...</span>
              ) : (
                <>
                  <span className="font-semibold">{p.label}</span>
                  <span className="text-xs text-muted-foreground">Export Excel</span>
                </>
              )}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
