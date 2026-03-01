import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWorker, useCreateWorker, useUpdateWorker } from "@/hooks/useWorkers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const workerSchema = z.object({
  worker_id: z.string().min(1, "Worker ID is required"),
  worker_name: z.string().min(1, "Name is required"),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  shift: z.string().min(1, "Shift is required"),
  date_of_joining: z.string().min(1, "Date of joining is required"),
  status: z.enum(["Active", "Inactive"]),
});

type WorkerFormValues = z.infer<typeof workerSchema>;

const departments = [
  "Production",
  "Quality Control",
  "Maintenance",
  "Logistics",
  "Administration",
  "Safety",
];

const shifts = ["Morning", "Afternoon", "Night", "General"];

interface WorkerFormProps {
  workerId?: string | null;
  onSuccess: () => void;
}

export function WorkerForm({ workerId, onSuccess }: WorkerFormProps) {
  const { data: worker } = useWorker(workerId || "");
  const createWorker = useCreateWorker();
  const updateWorker = useUpdateWorker();

  const form = useForm<WorkerFormValues>({
    resolver: zodResolver(workerSchema),
    defaultValues: {
      worker_id: "",
      worker_name: "",
      department: "",
      designation: "",
      shift: "",
      date_of_joining: new Date().toISOString().split("T")[0],
      status: "Active",
    },
  });

  useEffect(() => {
    if (worker) {
      form.reset({
        worker_id: worker.worker_id,
        worker_name: worker.worker_name,
        department: worker.department,
        designation: worker.designation,
        shift: worker.shift,
        date_of_joining: worker.date_of_joining,
        status: worker.status,
      });
    }
  }, [worker, form]);

  const onSubmit = async (values: WorkerFormValues) => {
    try {
      if (workerId) {
        await updateWorker.mutateAsync({ id: workerId, data: values });
      } else {
        await createWorker.mutateAsync(values as import("@/hooks/useWorkers").WorkerInsert);
      }
      onSuccess();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const isLoading = createWorker.isPending || updateWorker.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="worker_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Worker ID</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., W001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="worker_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Operator" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift} value={shift}>
                        {shift}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_joining"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Joining</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : workerId ? "Update Worker" : "Add Worker"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
