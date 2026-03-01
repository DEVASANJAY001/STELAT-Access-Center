import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export interface BriefingAttendance {
  id: string;
  worker_id: string;
  date: string;
  status: "Present" | "Absent";
  created_at: string;
  updated_at: string;
}

export interface BriefingAttendanceWithWorker extends BriefingAttendance {
  workers: {
    worker_id: string;
    worker_name: string;
    department: string;
  };
}

export function useBriefingAttendanceByDate(date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");
  
  return useQuery({
    queryKey: ["briefing_attendance", dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("briefing_attendance")
        .select(`
          *,
          workers (
            worker_id,
            worker_name,
            department
          )
        `)
        .eq("date", dateStr);
      
      if (error) throw error;
      return data as BriefingAttendanceWithWorker[];
    },
  });
}

export function useBriefingAnalytics(month?: Date, year?: Date) {
  return useQuery({
    queryKey: ["briefing_attendance", "analytics", month?.toISOString(), year?.toISOString()],
    queryFn: async () => {
      let query = supabase.from("briefing_attendance").select("date, status");
      
      if (month) {
        const start = format(startOfMonth(month), "yyyy-MM-dd");
        const end = format(endOfMonth(month), "yyyy-MM-dd");
        query = query.gte("date", start).lte("date", end);
      } else if (year) {
        const start = format(startOfYear(year), "yyyy-MM-dd");
        const end = format(endOfYear(year), "yyyy-MM-dd");
        query = query.gte("date", start).lte("date", end);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Group by date
      const byDate: Record<string, { present: number; absent: number }> = {};
      
      data.forEach((record) => {
        if (!byDate[record.date]) {
          byDate[record.date] = { present: 0, absent: 0 };
        }
        if (record.status === "Present") {
          byDate[record.date].present++;
        } else {
          byDate[record.date].absent++;
        }
      });
      
      // Calculate totals and percentages
      const totalPresent = data.filter((r) => r.status === "Present").length;
      const totalAbsent = data.filter((r) => r.status === "Absent").length;
      const total = totalPresent + totalAbsent;
      
      return {
        byDate,
        totalPresent,
        totalAbsent,
        total,
        percentage: total > 0 ? Math.round((totalPresent / total) * 100) : 0,
      };
    },
  });
}

export function useMarkBriefingAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      workerId,
      date,
      status,
    }: {
      workerId: string;
      date: string;
      status: "Present" | "Absent";
    }) => {
      const { data, error } = await supabase
        .from("briefing_attendance")
        .upsert(
          { worker_id: workerId, date, status },
          { onConflict: "worker_id,date" }
        )
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing_attendance"] });
      toast.success("Briefing attendance marked");
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });
}
export function useDeleteBriefingAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      workerId,
      date,
    }: {
      workerId: string;
      date: string;
    }) => {
      const { error } = await supabase
        .from("briefing_attendance")
        .delete()
        .match({ worker_id: workerId, date });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["briefing_attendance"] });
      toast.success("Briefing record removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove record: ${error.message}`);
    },
  });
}
