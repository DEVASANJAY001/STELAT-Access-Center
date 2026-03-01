import { format } from "date-fns";
import { useWorker } from "@/hooks/useWorkers";
import { useWorkerAttendanceStats } from "@/hooks/useAttendance";
import { useWorkerOvertimeStats } from "@/hooks/useOvertime";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, Calendar, CheckCircle, XCircle, Timer } from "lucide-react";

interface WorkerDetailsProps {
  workerId: string;
}

export function WorkerDetails({ workerId }: WorkerDetailsProps) {
  const { data: worker, isLoading: isLoadingWorker } = useWorker(workerId);
  const { data: attendanceStats, isLoading: isLoadingAttendance } =
    useWorkerAttendanceStats(workerId);
  const { data: overtimeStats, isLoading: isLoadingOvertime } =
    useWorkerOvertimeStats(workerId);

  if (isLoadingWorker) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  if (!worker) {
    return <div className="text-center py-8 text-muted-foreground">Worker not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{worker.worker_name}</h2>
          <p className="text-muted-foreground">{worker.worker_id}</p>
        </div>
        <Badge
          variant="outline"
          className={worker.status === "Active" ? "badge-active" : "badge-inactive"}
        >
          {worker.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-muted-foreground">Department:</span>
          <p className="font-medium">{worker.department}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Designation:</span>
          <p className="font-medium">{worker.designation}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Shift:</span>
          <p className="font-medium">{worker.shift}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Date of Joining:</span>
          <p className="font-medium">
            {format(new Date(worker.date_of_joining), "MMM dd, yyyy")}
          </p>
        </div>
      </div>

      <Separator />

      {/* Attendance Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Attendance Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAttendance ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span>Attendance Rate</span>
                <span className="font-semibold">{attendanceStats?.percentage || 0}%</span>
              </div>
              <Progress value={attendanceStats?.percentage || 0} className="h-2" />
              
              <div className="grid grid-cols-4 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold">{attendanceStats?.total || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    {attendanceStats?.present || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive">
                    {attendanceStats?.absent || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {attendanceStats?.leave || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Leave</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overtime Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Overtime Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOvertime ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">
                    {overtimeStats?.totalHours || 0}h
                  </div>
                  <div className="text-sm text-muted-foreground">Total Overtime Hours</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-accent">
                    {overtimeStats?.overtimeDays || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Overtime Days (9h = 1 day)</div>
                </div>
              </div>

              {overtimeStats?.records && overtimeStats.records.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Recent Overtime Records</h4>
                  <div className="max-h-40 overflow-auto space-y-2">
                    {overtimeStats.records.slice(0, 5).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                      >
                        <span>{format(new Date(record.date), "MMM dd, yyyy")}</span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {record.start_time} - {record.end_time}
                        </span>
                        <span className="font-medium">{record.hours_worked}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
