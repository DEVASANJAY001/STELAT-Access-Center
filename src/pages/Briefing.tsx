import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle, XCircle, Search, Trash2 } from "lucide-react";
import { useWorkers } from "@/hooks/useWorkers";
import {
  useBriefingAttendanceByDate,
  useMarkBriefingAttendance,
  useDeleteBriefingAttendance,
  useBriefingAnalytics,
} from "@/hooks/useBriefingAttendance";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(142, 70%, 45%)", "hsl(0, 72%, 51%)"];

export default function Briefing() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { isAdmin } = useAuth();

  const { data: workers, isLoading: isLoadingWorkers } = useWorkers();
  const { data: attendance, isLoading: isLoadingAttendance } =
    useBriefingAttendanceByDate(selectedDate);
  const { data: analytics } = useBriefingAnalytics(new Date());
  const markAttendance = useMarkBriefingAttendance();
  const deleteAttendance = useDeleteBriefingAttendance();

  const attendanceMap = new Map(
    attendance?.map((a) => [a.worker_id, a.status]) || []
  );

  const handleMarkAttendance = (workerId: string, status: "Present" | "Absent") => {
    markAttendance.mutate({ workerId, date: dateStr, status });
  };

  const handleDeleteAttendance = (workerId: string) => {
    deleteAttendance.mutate({ workerId, date: dateStr });
  };

  const filteredWorkers = (workers?.filter((w) => {
    const isActive = w.status === "Active";
    const matchesSearch = w.worker_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         w.worker_id.toLowerCase().includes(searchTerm.toLowerCase());
    return isActive && matchesSearch;
  }) || []).slice().sort((a, b) => (a.worker_name || "").localeCompare(b.worker_name || ""));

  const activeWorkersCount = workers?.filter((w) => w.status === "Active").length || 0;

  const stats = {
    total: activeWorkersCount,
    present: attendance?.filter((a) => a.status === "Present").length || 0,
    absent: attendance?.filter((a) => a.status === "Absent").length || 0,
  };

  const pieData = [
    { name: "Present", value: analytics?.totalPresent || 0 },
    { name: "Absent", value: analytics?.totalAbsent || 0 },
  ];

  const barChartData = analytics?.byDate
    ? Object.entries(analytics.byDate)
        .slice(-10)
        .map(([date, data]) => ({
          date: date.slice(5),
          present: data.present,
          absent: data.absent,
        }))
    : [];

  const activeWorkers = workers?.filter((w) => w.status === "Active") || [];

  return (
    <div className="flex flex-col gap-4 animate-fade-in max-w-full overflow-hidden">
      {/* Premium Header - More Compact */}
      <div className="flex flex-col gap-3 sticky top-0 z-40 py-2 bg-background/80 backdrop-blur-lg border-b border-border/40 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-gradient">Briefing</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
              MEETING ATTENDANCE
            </p>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2.5 gap-1.5 rounded-lg border-border/60 bg-background/50 backdrop-blur-sm shadow-sm transition-all active:scale-95">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold">{format(selectedDate, "MMM dd")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search workers..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-9 h-9 text-xs rounded-lg border-border/40 bg-muted/40 focus:bg-background transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Stats - Compact Single Row */}
      <div className="grid grid-cols-3 gap-2 px-0.5">
        <div className="stat-card flex flex-col items-center justify-center text-center py-2 px-1 rounded-xl">
          <span className="stat-label text-[8px] mb-0.5">Active</span>
          <span className="stat-value text-lg leading-none">{stats.total}</span>
        </div>
        <div className="stat-card flex flex-col items-center justify-center text-center py-2 px-1 rounded-xl border-success/20 bg-success/[0.02]">
          <span className="stat-label text-success text-[8px] mb-0.5">Present</span>
          <span className="stat-value text-lg text-success leading-none">{stats.present}</span>
        </div>
        <div className="stat-card flex flex-col items-center justify-center text-center py-2 px-1 rounded-xl border-destructive/20 bg-destructive/[0.02]">
          <span className="stat-label text-destructive text-[8px] mb-0.5">Absent</span>
          <span className="stat-value text-lg text-destructive leading-none">{stats.absent}</span>
        </div>
      </div>

      {/* Analytics Charts - Hidden on mobile for extreme density, visible on large screens */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        <Card className="lg:col-span-2 premium-card shadow-sm">
          <CardHeader className="p-4">
            <CardTitle className="section-header text-xs uppercase tracking-widest text-muted-foreground">Daily Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" vertical={false} />
                  <XAxis dataKey="date" className="text-[10px] font-bold" axisLine={false} tickLine={false} />
                  <YAxis className="text-[10px] font-bold" axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      fontSize: "10px",
                    }}
                  />
                  <Bar dataKey="present" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card shadow-sm">
          <CardHeader className="p-4">
            <CardTitle className="section-header text-xs uppercase tracking-widest text-muted-foreground">Monthly</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 flex flex-col items-center">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xl font-black text-primary">{analytics?.percentage || 0}%</p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase">Average</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workers List - High Density row style (Mirroring Attendance) */}
      <div className="space-y-2 pb-20">
        {isLoadingWorkers || isLoadingAttendance ? (
          <div className="space-y-2 px-1">
             {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-muted/40 animate-pulse rounded-xl" />)}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-20 px-6">
            <p className="text-muted-foreground text-sm font-bold italic tracking-tight opacity-50">No workers found.</p>
          </div>
        ) : (
          filteredWorkers.map((worker) => {
            const currentStatus = attendanceMap.get(worker.id);
            return (
              <div 
                key={worker.id} 
                className={cn(
                  "premium-card flex items-center justify-between p-2 pl-3 border-l-4 transition-all duration-300 rounded-xl",
                  currentStatus === "Present" ? "border-l-success bg-success/[0.01]" : 
                  currentStatus === "Absent" ? "border-l-destructive bg-destructive/[0.01]" : "border-l-muted bg-card"
                )}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-bold text-xs tracking-tight truncate leading-tight">{worker.worker_name}</p>
                  <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tighter truncate">
                    {worker.worker_id} · {worker.department}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 px-1">
                  {isAdmin ? (
                    <div className="flex items-center gap-1.5">
                      <Button 
                        size="icon"
                        variant="outline"
                        className={cn(
                          "h-9 w-9 rounded-full font-black text-xs border-2 transition-all active:scale-90",
                          currentStatus === "Present" 
                            ? "bg-success border-success text-white shadow-sm" 
                            : "bg-background border-success/20 text-success hover:bg-success/5"
                        )}
                        onClick={() => handleMarkAttendance(worker.id, "Present")}
                      >
                        P
                      </Button>
                      <Button 
                        size="icon"
                        variant="outline"
                        className={cn(
                          "h-9 w-9 rounded-full font-black text-xs border-2 transition-all active:scale-90",
                          currentStatus === "Absent" 
                            ? "bg-destructive border-destructive text-white shadow-sm" 
                            : "bg-background border-destructive/20 text-destructive hover:bg-destructive/5"
                        )}
                        onClick={() => handleMarkAttendance(worker.id, "Absent")}
                      >
                        A
                      </Button>
                      {currentStatus && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteAttendance(worker.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ) : (
                    currentStatus && (
                      <Badge className={cn(
                        "rounded-full font-black text-[9px] px-2 h-5 shadow-none border-none",
                        currentStatus === "Present" ? "bg-success text-white" : "bg-destructive text-white"
                      )}>
                        {currentStatus === "Present" ? "P" : "A"}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
