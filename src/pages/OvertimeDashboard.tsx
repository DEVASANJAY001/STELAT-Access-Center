import { useState } from "react";
import { format, subDays } from "date-fns";
import { Clock, TrendingUp, Users, Calendar, Award, BarChart3, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useOvertimeStatsByRange } from "@/hooks/useOvertime";
import { useWorkers } from "@/hooks/useWorkers";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    CartesianGrid, Tooltip, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function OvertimeDashboard() {
    const [rangeType, setRangeType] = useState<"7d" | "30d" | "all">("7d");
    const [selectedWorkerId, setSelectedWorkerId] = useState<string>("all");

    const startDate = rangeType === "7d" ? subDays(new Date(), 7) : rangeType === "30d" ? subDays(new Date(), 30) : subDays(new Date(), 365);
    const { data: stats, isLoading } = useOvertimeStatsByRange(startDate, new Date(), selectedWorkerId);
    const { data: workers } = useWorkers();

    const chartData = stats?.byDate ? Object.entries(stats.byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, hours]) => ({
            date: format(new Date(date), "MMM dd"),
            hours
        })) : [];

    const topPerformers = stats?.byWorker
        ? [...stats.byWorker].sort((a, b) => b.hours - a.hours).slice(0, 5)
        : [];

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gradient">OT Analytics</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mt-1">
                        STELANTIS VIRTUAL OVERTIME DASHBOARD
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted/20 p-1 rounded-2xl border border-white/5">
                        <Button
                            variant={rangeType === "7d" ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-8"
                            onClick={() => setRangeType("7d")}
                        >7D</Button>
                        <Button
                            variant={rangeType === "30d" ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-8"
                            onClick={() => setRangeType("30d")}
                        >30D</Button>
                        <Button
                            variant={rangeType === "all" ? "secondary" : "ghost"}
                            size="sm"
                            className="rounded-xl font-black text-[10px] uppercase tracking-widest h-8"
                            onClick={() => setRangeType("all")}
                        >Year</Button>
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
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="Total OT Hours"
                    value={stats?.totalHours || 0}
                    icon={Clock}
                    variant="primary"
                    subtitle="Cumulative duration"
                />
                <StatCard
                    title="OT Day Credits"
                    value={Math.floor((stats?.totalHours || 0) / 9)}
                    icon={Award}
                    variant="success"
                    subtitle="9 Hours = 1 Day"
                />
                <StatCard
                    title="Active Participants"
                    value={stats?.workerCount || 0}
                    icon={Users}
                    variant="warning"
                    subtitle="Workers recording OT"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="premium-card lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="section-header text-xs uppercase tracking-[0.15em] text-muted-foreground">Hours Distribution</CardTitle>
                        <CardDescription className="text-[10px] font-bold opacity-50">OVERTIME TRENDS OVER TIME</CardDescription>
                    </CardHeader>
                    <CardContent className="h-80 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                                <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="hours" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorHours)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="premium-card">
                    <CardHeader>
                        <CardTitle className="section-header text-xs uppercase tracking-[0.15em] text-muted-foreground">Top Performers</CardTitle>
                        <CardDescription className="text-[10px] font-bold opacity-50">RANKED BY OT HOURS</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 pt-2">
                            {topPerformers.map((w, index) => (
                                <div key={w.id} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 border border-white/5 transition-all hover:bg-muted/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-[10px]">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black">{w.name}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">{w.dept}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black">{w.hours}h</p>
                                        <p className="text-[9px] font-bold text-success uppercase">{Math.floor(w.hours / 9)} Days</p>
                                    </div>
                                </div>
                            ))}
                            {topPerformers.length === 0 && <p className="text-center py-10 text-xs font-bold text-muted-foreground">No records found</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="premium-card">
                <CardHeader>
                    <CardTitle className="section-header text-xs uppercase tracking-[0.15em] text-muted-foreground">Recent Activity Log</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Member</th>
                                <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Department</th>
                                <th className="pb-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Hours</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.byWorker?.map((w) => (
                                <tr key={w.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 text-xs font-black">{w.name}</td>
                                    <td className="py-4 text-[10px] font-bold text-muted-foreground/60 uppercase">{w.dept}</td>
                                    <td className="py-4 text-xs font-black text-right">{w.hours}h</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
