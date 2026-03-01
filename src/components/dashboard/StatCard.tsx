import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: StatCardProps) {
  const iconColorClasses = {
    default: "bg-primary/8 text-primary",
    primary: "bg-primary/8 text-primary",
    success: "bg-success/8 text-success",
    warning: "bg-warning/8 text-warning",
    destructive: "bg-destructive/8 text-destructive",
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={cn(
                  "text-[11px] font-medium",
                  trend === "up" && "text-success",
                  trend === "down" && "text-destructive",
                  trend === "neutral" && "text-muted-foreground"
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={cn("p-2 rounded-lg", iconColorClasses[variant])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
