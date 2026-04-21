import { useState } from "react";
import { format } from "date-fns";
import { Users, Calendar, Clock, AlertCircle, BarChart3, PieChart as PieChartIcon, CheckCircle2 } from "lucide-react";
import { DownloadReportDialog } from "@/components/reports/DownloadReportDialog";
import { StatCard } from "@/components/dashboard/StatCard";
import { useWorkers, useActiveWorkerCount } from "@/hooks/useWorkers";
import { useTodayAttendanceStats, useTodayAttendanceWithWorkers, useAttendanceStatsByRange } from "@/hooks/useAttendance";
import { useTodayOvertimeStats, useOvertimeStatsByRange } from "@/hooks/useOvertime";
import { useBriefingAnalytics, useBriefingStatsByRange } from "@/hooks/useBriefingAttendance";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area,
} from "recharts";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";

const COLORS = ["hsl(var(--success))", "hsl(var(--destructive))", "hsl(var(--warning))"];

export default function Dashboard() {
  const [showList, setShowList] = useState<"present" | "absent" | "leave" | null>(null);
  const [rangeType, setRangeType] = useState<"7d" | "30d" | "custom">("7d");
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  const [briefingRange, setBriefingRange] = useState<"7d" | "30d" | "all">("7d");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("all");

  const { user } = useAuth();
  const { data: workers } = useWorkers();
  const { data: workerCount } = useActiveWorkerCount();

  const startDate = rangeType === "7d" ? subDays(new Date(), 7) : rangeType === "30d" ? subDays(new Date(), 30) : customRange.from;
  const endDate = rangeType === "custom" ? customRange.to : new Date();

  const briefingStartDate = briefingRange === "7d" ? subDays(new Date(), 7) : briefingRange === "30d" ? subDays(new Date(), 30) : subDays(new Date(), 365); // "all" last year

  const { data: attendanceRangeStats } = useAttendanceStatsByRange(startDate, endDate, selectedWorkerId);
  const { data: briefingRangeStats } = useBriefingStatsByRange(briefingStartDate, new Date(), selectedWorkerId);
  const { data: overtimeRangeStats } = useOvertimeStatsByRange(startDate, endDate, selectedWorkerId);

  const { data: attendanceStats } = useTodayAttendanceStats();
  const { data: attendanceDetails } = useTodayAttendanceWithWorkers();
  const { data: briefingAnalytics } = useBriefingAnalytics(new Date());

  const stats = {
    total: workerCount || 0,
    present: attendanceStats?.present || 0,
    absent: attendanceStats?.absent || 0,
    leave: attendanceStats?.leave || 0,
  };

  const trendData = briefingRangeStats?.byDate
    ? Object.entries(briefingRangeStats.byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: date.slice(5),
        present: data.present,
        absent: data.absent,
      }))
    : [];

  const pieData = attendanceRangeStats ? [
    { name: "Present", value: attendanceRangeStats.present, color: "hsl(var(--success))" },
    { name: "Absent", value: attendanceRangeStats.absent, color: "hsl(var(--destructive))" },
    { name: "Leave", value: attendanceRangeStats.leave, color: "hsl(var(--warning))" },
  ] : [];

  const getListData = () => {
    if (!attendanceDetails || !showList) return [];
    return attendanceDetails[showList] || [];
  };

  const listTitle = showList === "present" ? "Present Today" : showList === "absent" ? "Absent Today" : "On Leave Today";
  const listColor = showList === "present" ? "bg-success" : showList === "absent" ? "bg-destructive" : "bg-warning";

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-full overflow-hidden pb-20">
      {/* Premium Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-gradient">Dashboard</h1>
            <Badge variant="outline" className="h-6 rounded-full font-black text-[10px] uppercase bg-primary/10 text-primary border-primary/20 shadow-sm px-3">
              {user?.role || "ADMIN"}
            </Badge>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            STELANTIS ATTENDANCE ANALYTICS · {format(new Date(), "MMMM yyyy")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-muted/20 p-1 rounded-2xl border border-white/5">
            <Button
              variant={rangeType === "7d" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-xl font-black text-[10px] uppercase tracking-widest h-8"
              onClick={() => setRangeType("7d")}
            >7 Days</Button>
            <Button
              variant={rangeType === "30d" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-xl font-black text-[10px] uppercase tracking-widest h-8"
              onClick={() => setRangeType("30d")}
            >30 Days</Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={rangeType === "custom" ? "secondary" : "ghost"}
                  size="sm"
                  className="rounded-xl font-black text-[10px] uppercase tracking-widest h-8 gap-2"
                >
                  <Calendar className="w-3 h-3" />
                  {rangeType === "custom" ? `${format(customRange.from, "MMM d")} - ${format(customRange.to, "MMM d")}` : "Custom"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarPicker
                  mode="range"
                  selected={{ from: customRange.from, to: customRange.to }}
                  onSelect={(range: any) => {
                    if (range?.from && range?.to) {
                      setCustomRange({ from: range.from, to: range.to });
                      setRangeType("custom");
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
            <SelectTrigger className="w-[180px] h-10 bg-muted/20 border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest">
              <SelectValue placeholder="All Members" />
            </SelectTrigger>
            <SelectContent className="glass-morphism rounded-2xl border-white/10">
              <SelectItem value="all" className="text-xs font-bold uppercase tracking-widest">All Members</SelectItem>
              {workers?.map(w => (
                <SelectItem key={w.id} value={w.id} className="text-xs font-bold uppercase tracking-widest">
                  {w.worker_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DownloadReportDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="cursor-pointer transition-all active:scale-95 border-primary/20 bg-gradient-to-br from-primary/[0.03] to-transparent shadow-sm rounded-3xl" onClick={() => { }}>
          <StatCard
            title="Total Active"
            value={stats.total}
            icon={Users}
          />
        </div>
        <div className="cursor-pointer transition-all active:scale-95 border-success/20 bg-gradient-to-br from-success/[0.03] to-transparent shadow-sm rounded-3xl" onClick={() => setShowList("present")}>
          <StatCard
            title="Present Today"
            value={stats.present}
            icon={CheckCircle2}
            variant="success"
            subtitle={`${stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% Attendance Rate`}
          />
        </div>
        <div className="cursor-pointer transition-all active:scale-95 border-destructive/20 bg-gradient-to-br from-destructive/[0.03] to-transparent text-destructive shadow-sm rounded-3xl" onClick={() => setShowList("absent")}>
          <StatCard
            title="Absent / Leave"
            value={stats.absent + stats.leave}
            icon={AlertCircle}
            variant="destructive"
            subtitle={`${stats.absent} Absent · ${stats.leave} On Leave`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Attendance Trends - Premium Card */}
        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 px-2">
            <div>
              <CardTitle className="section-header text-xs uppercase tracking-[0.15em] text-muted-foreground">Briefing Trends</CardTitle>
              <CardDescription className="text-[10px] font-bold opacity-50">DAILY BRIEFING PARTICIPATION</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-white/5">
                {(["7d", "30d", "all"] as const).map((r) => (
                  <Button
                    key={r}
                    variant={briefingRange === r ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-3 rounded-lg font-black text-[9px] uppercase tracking-wider"
                    onClick={() => setBriefingRange(r)}
                  >
                    {r === "all" ? "All" : r.toUpperCase()}
                  </Button>
                ))}
              </div>
              <div className="p-2 bg-muted/30 rounded-xl">
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pt-2">
            <div className="h-64 sm:h-80 w-full pl-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" className="stroke-border/30" vertical={false} />
                  <XAxis
                    dataKey="date"
                    className="text-[10px] font-black"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-[10px] font-black"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "16px",
                      boxShadow: "0 10px 30px -5px rgba(0,0,0,0.1)",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="hsl(var(--success))"
                    fillOpacity={1}
                    fill="url(#colorPresent)"
                    strokeWidth={4}
                    dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--background))" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "hsl(var(--success))" }}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution - Premium Card */}
        <Card className="premium-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 px-2">
            <div>
              <CardTitle className="section-header text-xs uppercase tracking-[0.15em] text-muted-foreground">Status Distribution</CardTitle>
              <CardDescription className="text-[10px] font-bold opacity-50">TODAY'S SNAPSHOT</CardDescription>
            </div>
            <div className="p-2 bg-muted/30 rounded-xl">
              <PieChartIcon className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-2">
            <div className="h-64 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={10}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1200}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-8 w-full -mt-10 px-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.name}</span>
                  </div>
                  <p className="text-xl font-black">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Names Dialog */}
      <Dialog open={!!showList} onOpenChange={() => setShowList(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg rounded-3xl glass-morphism p-0 overflow-hidden border-border/40">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-gradient">
                  {listTitle}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                  DETAILED VIEW · {format(new Date(), "MMM dd")}
                </DialogDescription>
              </div>
              <Badge variant="outline" className={cn(listColor, "text-white border-none rounded-full h-8 px-4 font-black text-sm")}>
                {getListData().length}
              </Badge>
            </div>
          </DialogHeader>
          <div className="p-6 pt-2 max-h-[60vh] overflow-y-auto">
            {getListData().length === 0 ? (
              <div className="py-20 text-center font-bold text-muted-foreground italic">No records found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {getListData().map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border border-border/30 transition-all hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-background border border-border/40 flex items-center justify-center font-black text-primary text-xs shadow-sm">
                        {w.worker_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm tracking-tight">{w.worker_name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{w.worker_id} · {w.department}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 bg-muted/10 border-t border-border/20">
            <Button variant="ghost" className="w-full font-black text-xs uppercase tracking-widest py-6" onClick={() => setShowList(null)}>
              Dismiss View
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
