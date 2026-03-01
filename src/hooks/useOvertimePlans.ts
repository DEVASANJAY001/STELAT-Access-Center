import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OvertimePlan {
  id: string;
  worker_id: string;
  planned_date: string;
  planned_start_time: string;
  planned_end_time: string;
  planned_hours: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OvertimePlanWithWorker extends OvertimePlan {
  workers: {
    worker_id: string;
    worker_name: string;
    department: string;
  };
}

export function useOvertimePlansByDate(date: string) {
  return useQuery({
    queryKey: ["overtime-plans", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("overtime_plans")
        .select(`*, workers (worker_id, worker_name, department)`)
        .eq("planned_date", date)
        .order("planned_start_time");

      if (error) throw error;
      return data as OvertimePlanWithWorker[];
    },
  });
}

export function useUpcomingOvertimePlans() {
  const today = new Date().toISOString().split("T")[0];

  return useQuery({
    queryKey: ["overtime-plans", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("overtime_plans")
        .select(`*, workers (worker_id, worker_name, department)`)
        .gte("planned_date", today)
        .eq("status", "Planned")
        .order("planned_date")
        .limit(50);

      if (error) throw error;
      return data as OvertimePlanWithWorker[];
    },
  });
}

export function useCreateOvertimePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: {
      worker_id: string;
      planned_date: string;
      planned_start_time: string;
      planned_end_time: string;
      planned_hours: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("overtime_plans")
        .insert(plan)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-plans"] });
      toast.success("Overtime plan created");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create plan: ${error.message}`);
    },
  });
}

export function useUpdateOvertimePlanStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("overtime_plans")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-plans"] });
      toast.success("Plan status updated");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
}

export function useDeleteOvertimePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("overtime_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["overtime-plans"] });
      toast.success("Plan deleted");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}
