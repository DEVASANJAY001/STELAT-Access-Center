import { useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar as CalendarIcon, Plus, Trash2, CheckCircle, Clock, Search } from "lucide-react";
import { useWorkers } from "@/hooks/useWorkers";
import { useAuth } from "@/contexts/AuthContext";
import {
  useOvertimePlansByDate, useUpcomingOvertimePlans, useCreateOvertimePlan,
  useUpdateOvertimePlanStatus, useDeleteOvertimePlan,
} from "@/hooks/useOvertimePlans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OvertimePlanning() {
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    workerId: "", startTime: "17:30", endTime: "20:30", notes: "",
  });
  const { isAdmin } = useAuth();

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: workers } = useWorkers();
  const filteredWorkers = workers?.filter(
    (w) => w.status === "Active" &&
      (searchTerm === "" ||
        w.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.worker_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const { data: datePlans, isLoading } = useOvertimePlansByDate(dateStr);
  const { data: upcomingPlans } = useUpcomingOvertimePlans();
  const createPlan = useCreateOvertimePlan();
  const updateStatus = useUpdateOvertimePlanStatus();
  const deletePlan = useDeleteOvertimePlan();

  const calculateHours = (start: string, end: string) => {
    const s = new Date(`2000-01-01T${start}`);
    const e = new Date(`2000-01-01T${end}`);
    let h = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
    if (h < 0) h += 24;
    return Math.round(h * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workerId || !formData.startTime || !formData.endTime) return;
    await createPlan.mutateAsync({
      worker_id: formData.workerId,
      planned_date: dateStr,
      planned_start_time: formData.startTime,
      planned_end_time: formData.endTime,
      planned_hours: calculateHours(formData.startTime, formData.endTime),
      notes: formData.notes || undefined,
    });
    setIsFormOpen(false);
    setFormData({ workerId: "", startTime: "17:30", endTime: "20:30", notes: "" });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "Planned": return "bg-info/10 text-info border border-info/20";
      case "Completed": return "bg-success/10 text-success border border-success/20";
      case "Cancelled": return "bg-destructive/10 text-destructive border border-destructive/20";
      default: return "";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Overtime Planning</h1>
          <p className="text-muted-foreground mt-1">Plan and schedule future overtime assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />{format(selectedDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus />
            </PopoverContent>
          </Popover>

          {isAdmin && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Plan Overtime</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Plan Overtime for {format(selectedDate, "MMM dd, yyyy")}</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Worker</Label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search workers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                    <Select value={formData.workerId} onValueChange={(v) => setFormData({ ...formData, workerId: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a worker" /></SelectTrigger>
                      <SelectContent>
                        {filteredWorkers?.map((w) => (
                          <SelectItem key={w.id} value={w.id}>{w.worker_id} - {w.worker_name}</SelectItem>
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
                  {formData.startTime && formData.endTime && (
                    <p className="text-sm text-muted-foreground">Planned hours: {calculateHours(formData.startTime, formData.endTime)}h</p>
                  )}
                  <div className="space-y-2">
                    <Label>Notes (optional)</Label>
                    <Textarea placeholder="Reason or details..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createPlan.isPending}>{createPlan.isPending ? "Saving..." : "Create Plan"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs defaultValue="date">
        <TabsList>
          <TabsTrigger value="date">By Date</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="date" className="space-y-4">
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
                    <th>Status</th>
                    <th className="hidden md:table-cell">Notes</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={isAdmin ? 9 : 8} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                  ) : !datePlans?.length ? (
                    <tr><td colSpan={isAdmin ? 9 : 8} className="text-center py-8 text-muted-foreground">No plans for this date.</td></tr>
                  ) : (
                    datePlans.map((plan) => (
                      <tr key={plan.id}>
                        <td className="font-medium">{plan.workers.worker_id}</td>
                        <td>{plan.workers.worker_name}</td>
                        <td className="hidden md:table-cell">{plan.workers.department}</td>
                        <td>{plan.planned_start_time}</td>
                        <td>{plan.planned_end_time}</td>
                        <td className="font-semibold">{plan.planned_hours}h</td>
                        <td><Badge variant="outline" className={statusColor(plan.status)}>{plan.status}</Badge></td>
                        <td className="hidden md:table-cell text-sm text-muted-foreground max-w-[150px] truncate">{plan.notes || "-"}</td>
                        {isAdmin && (
                          <td>
                            <div className="flex items-center gap-1">
                              {plan.status === "Planned" && (
                                <Button variant="ghost" size="icon" title="Mark Completed" onClick={() => updateStatus.mutate({ id: plan.id, status: "Completed" })}>
                                  <CheckCircle className="w-4 h-4 text-success" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" title="Delete" onClick={() => deletePlan.mutate(plan.id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-3">
            {!upcomingPlans?.length ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No upcoming overtime plans.</CardContent></Card>
            ) : (
              upcomingPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center bg-muted rounded-lg px-3 py-2">
                        <div className="text-xs text-muted-foreground">{format(new Date(plan.planned_date), "MMM")}</div>
                        <div className="text-xl font-bold">{format(new Date(plan.planned_date), "dd")}</div>
                      </div>
                      <div>
                        <p className="font-medium">{plan.workers.worker_name} <span className="text-muted-foreground text-sm">({plan.workers.worker_id})</span></p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {plan.planned_start_time} - {plan.planned_end_time} ({plan.planned_hours}h)
                        </p>
                        {plan.notes && <p className="text-xs text-muted-foreground mt-1">{plan.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusColor(plan.status)}>{plan.status}</Badge>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" onClick={() => deletePlan.mutate(plan.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
        <p><strong>Admin Planning:</strong> Schedule overtime in advance. Mark plans as Completed once the worker finishes, or delete cancelled plans.</p>
      </div>
    </div>
  );
}
