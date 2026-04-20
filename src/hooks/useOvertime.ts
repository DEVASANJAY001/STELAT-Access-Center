import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export interface Overtime {
  id: string;
  worker_id: string;
  date: string;
  start_time: string;
  end_time: string;
  hours_worked: number;
  created_at: string;
  updated_at: string;
}

export interface OvertimeWithWorker extends Overtime {
  workers: {
    worker_id: string;
    worker_name: string;
    department: string;
  };
}

export function useOvertimeByDate(date: Date) {
  const dateStr = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["overtime", dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("overtime")
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
      return data as OvertimeWithWorker[];
    },
  });
}

export function useWorkerOvertimeStats(workerId: string) {
  return useQuery({
    queryKey: ["overtime", "stats", workerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("overtime")
        .select("*")
        .eq("worker_id", workerId)
        .order("date", { ascending: false });

      if (error) throw error;

      const totalHours = data.reduce((sum, record) => sum + Number(record.hours_worked), 0);
      const overtimeDays = Math.floor(totalHours / 9);

      return {
        records: data as Overtime[],
        totalHours: Math.round(totalHours * 100) / 100,
        overtimeDays,
      };
    },
    enabled: !!workerId,
  });
}

export function useTodayOvertimeStats() {
  const today = format(new Date(), "yyyy-MM-dd");

  return useQuery({
    queryKey: ["overtime", "today", today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("overtime")
        .select("hours_worked, worker_id")
        .eq("date", today);

      if (error) throw error;

      const totalHours = data.reduce((sum, record) => sum + Number(record.hours_worked), 0);
      const workerCount = new Set(data.map((r) => r.worker_id)).size;

      return {
        totalHours: Math.round(totalHours * 100) / 100,
        workerCount,
      };
    },
  });
}

export function useOvertimeStatsByRange(startDate: Date, endDate: Date, workerId?: string) {
  const start = format(startDate, "yyyy-MM-dd");
  const end = format(endDate, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["overtime", "range", start, end, workerId],
    queryFn: async () => {
      let query = supabase
        .from("overtime")
        .select("hours_worked, date, worker_id, workers(worker_name, department)")
        .gte("date", start)
        .lte("date", end);

      if (workerId && workerId !== "all") {
        query = query.eq("worker_id", workerId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const totalHours = data.reduce((sum, r) => sum + Number(r.hours_worked), 0);
      const workerCount = new Set(data.map((r) => r.worker_id)).size;

      const byDate: Record<string, number> = {};
      const byWorker: Record<string, { name: string; hours: number; dept: string }> = {};

      data.forEach((r: any) => {
        byDate[r.date] = (byDate[r.date] || 0) + Number(r.hours_worked);

        if (!byWorker[r.worker_id]) {
          byWorker[r.worker_id] = {
            name: r.workers?.worker_name || "Unknown",
            hours: 0,
            dept: r.workers?.department || "N/A"
          };
        }
        byWorker[r.worker_id].hours += Number(r.hours_worked);
      });

      return {
        totalHours: Math.round(totalHours * 100) / 100,
        workerCount,
        byDate,
        byWorker: Object.entries(byWorker).map(([id, stats]) => ({ id, ...stats })),
      };
    },
  });
}

export function useAddOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workerId,
      date,
      startTime,
      endTime,
    }: {
      workerId: string;
      date: string;
      startTime: string;
      endTime: string;
    }) => {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      if (hours < 0) hours += 24;

      const { data, error } = await supabase
        .from("overtime")
        .insert({
          worker_id: workerId,
          date,
          start_time: startTime,
          end_time: endTime,
          hours_worked: Math.round(hours * 100) / 100,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime"] });
      toast.success("Overtime recorded successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to record overtime: ${error.message}`);
    },
  });
}

export function useDeleteOvertime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("overtime").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime"] });
      toast.success("Overtime record deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}
