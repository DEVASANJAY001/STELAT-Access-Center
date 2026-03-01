import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus, Search, Award, Trash2 } from "lucide-react";
import { useWorkers } from "@/hooks/useWorkers";
import { useOvertimeByDate, useAddOvertime, useDeleteOvertime } from "@/hooks/useOvertime";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Overtime() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingRecord, setDeletingRecord] = useState<{ id: string; name: string } | null>(null);
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    workerId: "",
    startTime: "",
    endTime: "",
  });

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: workers } = useWorkers();
  const filteredWorkers = workers?.filter(
    (w) =>
      w.status === "Active" &&
      (searchTerm === "" ||
        w.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.worker_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const { data: overtime, isLoading } = useOvertimeByDate(selectedDate);
  const addOvertime = useAddOvertime();
  const deleteOvertime = useDeleteOvertime();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId || !formData.startTime || !formData.endTime) return;
    await addOvertime.mutateAsync({
      workerId: formData.workerId,
      date: dateStr,
      startTime: formData.startTime,
      endTime: formData.endTime,
    });
    setIsFormOpen(false);
    setFormData({ workerId: "", startTime: "", endTime: "" });
  };

  const { data: allOvertime } = useQuery({
    queryKey: ["overtime", "all-credits"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("overtime")
        .select("worker_id, hours_worked, workers(worker_id, worker_name, department)");
      if (error) throw error;
      return data;
    },
  });

  const workerOTCredits = (() => {
    if (!allOvertime) return [];
    const map: Record<string, { wid: string; name: string; dept: string; totalHours: number }> = {};
    allOvertime.forEach((o: any) => {
      const key = o.worker_id;
      if (!map[key]) map[key] = { wid: o.workers?.worker_id || "", name: o.workers?.worker_name || "", dept: o.workers?.department || "", totalHours: 0 };
      map[key].totalHours += Number(o.hours_worked);
    });
    return Object.values(map).filter(w => w.totalHours > 0).sort((a, b) => b.totalHours - a.totalHours);
  })();

  const totalHours = overtime?.reduce((sum, o) => sum + Number(o.hours_worked), 0) || 0;
  const workerCount = new Set(overtime?.map((o) => o.worker_id)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Stay Back / Overtime Tracking</h1>
          <p className="text-muted-foreground mt-1">Record and track worker overtime hours</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, "MMMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} initialFocus />
            </PopoverContent>
          </Popover>

          {isAdmin && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Add Overtime</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Record Overtime</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Worker</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search workers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Select value={formData.workerId} onValueChange={(value) => setFormData({ ...formData, workerId: value })}>
                      <SelectTrigger><SelectValue placeholder="Select a worker" /></SelectTrigger>
                      <SelectContent>
                        {filteredWorkers?.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>{worker.worker_id} - {worker.worker_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Date: {format(selectedDate, "MMMM dd, yyyy")}</p>
                    {formData.startTime && formData.endTime && (
                      <p>Calculated hours: {(() => {
                        const start = new Date(`2000-01-01T${formData.startTime}`);
                        const end = new Date(`2000-01-01T${formData.endTime}`);
                        let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                        if (hours < 0) hours += 24;
                        return Math.round(hours * 100) / 100;
                      })()}h</p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={addOvertime.isPending}>{addOvertime.isPending ? "Saving..." : "Save"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 text-primary">
            <Clock className="w-5 h-5" />
            <span className="stat-label">Total Hours Today</span>
          </div>
          <p className="stat-value">{Math.round(totalHours * 100) / 100}h</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Workers with Overtime</p>
          <p className="stat-value">{workerCount}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Name</th>
                <th className="hidden md:table-cell">Department</th>
                <th>Start</th>
                <th>End</th>
                <th>Hours</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : overtime?.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">No overtime records for this date.</td></tr>
              ) : (
                overtime?.map((record) => (
                  <tr key={record.id}>
                    <td className="font-medium">{record.workers.worker_id}</td>
                    <td>{record.workers.worker_name}</td>
                    <td className="hidden md:table-cell">{record.workers.department}</td>
                    <td>{record.start_time}</td>
                    <td>{record.end_time}</td>
                    <td className="font-semibold">{record.hours_worked}h</td>
                    {isAdmin && (
                      <td>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeletingRecord({ id: record.id, name: record.workers.worker_name })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Worker OT Day Credits */}
      {workerOTCredits.length > 0 && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="section-header">Overtime Day Credits (9h = 1 Day)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker ID</th>
                  <th>Name</th>
                  <th className="hidden md:table-cell">Department</th>
                  <th>Total Hours</th>
                  <th>OT Days</th>
                  <th>Remaining</th>
                </tr>
              </thead>
              <tbody>
                {workerOTCredits.map((w) => (
                  <tr key={w.wid}>
                    <td className="font-medium">{w.wid}</td>
                    <td>{w.name}</td>
                    <td className="hidden md:table-cell">{w.dept}</td>
                    <td>{Math.round(w.totalHours * 100) / 100}h</td>
                    <td className="font-bold text-primary">{Math.floor(w.totalHours / 9)}</td>
                    <td>{Math.round((w.totalHours % 9) * 100) / 100}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
        <p><strong>Overtime Rule:</strong> Every 9 hours of overtime equals 1 overtime day.</p>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRecord} onOpenChange={(open) => !open && setDeletingRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Overtime Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the overtime record for <strong>{deletingRecord?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingRecord) {
                  deleteOvertime.mutate(deletingRecord.id);
                  setDeletingRecord(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
