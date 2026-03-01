import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export interface Attendance {
  id: string;
  worker_id: string;
  date: string;
  status: "Present" | "Absent" | "Leave";
  created_at: string;
  updated_at: string;
}

export interface AttendanceWithWorker extends Attendance {
  workers: {
    worker_id: string;
    worker_name: string;
    department: string;
  };
}

export function useAttendanceByDate(date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");
  
  return useQuery({
    queryKey: ["attendance", dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
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
      return data as AttendanceWithWorker[];
    },
  });
}

export function useWorkerAttendanceStats(workerId: string) {
  return useQuery({
    queryKey: ["attendance", "stats", workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("status")
        .eq("worker_id", workerId);
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        present: data.filter((a) => a.status === "Present").length,
        absent: data.filter((a) => a.status === "Absent").length,
        leave: data.filter((a) => a.status === "Leave").length,
        percentage: 0,
      };
      
      stats.percentage = stats.total > 0 
        ? Math.round((stats.present / stats.total) * 100) 
        : 0;
      
      return stats;
    },
    enabled: !!workerId,
  });
}

export function useTodayAttendanceStats() {
  const today = format(new Date(), "yyyy-MM-dd");
  
  return useQuery({
    queryKey: ["attendance", "today", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("status")
        .eq("date", today);
      
      if (error) throw error;
      
      const present = data.filter((a) => a.status === "Present").length;
      const absent = data.filter((a) => a.status === "Absent").length;
      const leave = data.filter((a) => a.status === "Leave").length;
      const total = present + absent + leave;
      
      return {
        present,
        absent,
        leave,
        total,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    },
  });
}

export function useTodayAttendanceWithWorkers() {
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["attendance", "today-details", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          status,
          workers (
            worker_id,
            worker_name,
            department
          )
        `)
        .eq("date", today);

      if (error) throw error;

      const present: { worker_id: string; worker_name: string; department: string }[] = [];
      const absent: { worker_id: string; worker_name: string; department: string }[] = [];
      const leave: { worker_id: string; worker_name: string; department: string }[] = [];

      (data as any[]).forEach((a) => {
        const w = { worker_id: a.workers.worker_id, worker_name: a.workers.worker_name, department: a.workers.department };
        if (a.status === "Present") present.push(w);
        else if (a.status === "Absent") absent.push(w);
        else if (a.status === "Leave") leave.push(w);
      });

      return { present, absent, leave };
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      workerId,
      date,
      status,
    }: {
      workerId: string;
      date: string;
      status: "Present" | "Absent" | "Leave";
    }) => {
      const { data, error } = await supabase
        .from("attendance")
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
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance marked successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });
}
export function useDeleteAttendance() {
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
        .from("attendance")
        .delete()
        .match({ worker_id: workerId, date });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance record removed");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove record: ${error.message}`);
    },
  });
}
