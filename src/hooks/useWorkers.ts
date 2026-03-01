import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Worker {
  id: string;
  worker_id: string;
  worker_name: string;
  department: string;
  designation: string;
  shift: string;
  date_of_joining: string;
  status: "Active" | "Inactive";
  created_at: string;
  updated_at: string;
}

export type WorkerInsert = Omit<Worker, "id" | "created_at" | "updated_at">;
export type WorkerUpdate = Partial<WorkerInsert>;

export function useWorkers(searchTerm?: string) {
  return useQuery({
    queryKey: ["workers", searchTerm],
    queryFn: async () => {
      let query = supabase.from("workers").select("*").order("worker_name");
      
      if (searchTerm) {
        query = query.or(`worker_name.ilike.%${searchTerm}%,worker_id.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Worker[];
    },
  });
}

export function useWorker(id: string) {
  return useQuery({
    queryKey: ["worker", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Worker | null;
    },
    enabled: !!id,
  });
}

export function useCreateWorker() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (worker: WorkerInsert) => {
      const { data, error } = await supabase
        .from("workers")
        .insert(worker)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Worker added successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to add worker: ${error.message}`);
    },
  });
}

export function useBulkCreateWorkers() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (workers: WorkerInsert[]) => {
      const { data, error } = await supabase
        .from("workers")
        .insert(workers)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Workers imported successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to import workers: ${error.message}`);
    },
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkerUpdate }) => {
      const { data: result, error } = await supabase
        .from("workers")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Worker updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update worker: ${error.message}`);
    },
  });
}

export function useDeleteWorker() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("workers")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast.success("Worker deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete worker: ${error.message}`);
    },
  });
}

export function useActiveWorkerCount() {
  return useQuery({
    queryKey: ["workers", "activeCount"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("workers")
        .select("*", { count: "exact", head: true })
        .eq("status", "Active");
      
      if (error) throw error;
      return count || 0;
    },
  });
}
