import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, ClipboardList, Clock,
  CalendarClock, LogOut, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Workers", path: "/workers" },
  { icon: Calendar, label: "Attendance", path: "/attendance" },
  { icon: ClipboardList, label: "Briefing", path: "/briefing" },
  { icon: Clock, label: "Overtime", path: "/overtime" },
  { icon: CalendarClock, label: "OT Planning", path: "/overtime-planning" },
];

export function Sidebar() {
  const location = useLocation();
  const { user, role, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <img src="/stellantis-logo.svg" alt="Stellantis" className="h-14 w-auto brightness-0 invert opacity-100" />
        </div>
        <div className="mt-2">
          <h1 className="text-sm font-semibold text-sidebar-foreground tracking-tight">Attendance Tracker</h1>
          <p className="text-[9px] text-sidebar-foreground/40 font-medium mt-0.5">
            Developed by DAVNS INDUSTRIES
          </p>
        </div>
        <p className="text-[10px] text-sidebar-foreground/50 font-medium mt-1">
          {role === "admin" ? "Admin Panel" : "Worker View"}
        </p>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-corporate group hover-lift",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-medium flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-2.5 border-t border-sidebar-border">
        <div className="px-2.5 py-1.5 mb-1">
          <p className="text-xs font-medium text-sidebar-foreground truncate">
            {user?.user_metadata?.full_name || user?.email || "User"}
          </p>
          <p className="text-[10px] text-sidebar-foreground/40 truncate">
            {role === "admin" ? "Administrator" : "Worker"}
          </p>
        </div>
        <LogoutConfirmDialog onConfirm={signOut} />
      </div>
    </aside>
  );
}
