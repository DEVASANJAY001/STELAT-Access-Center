import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Calendar, ClipboardList, Clock,
  CalendarClock, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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

export function MobileHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, role, signOut } = useAuth();

  const currentPage = menuItems.find(item => item.path === location.pathname)?.label || "Attendance Tracker";

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border h-12 flex items-center justify-between px-3">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground">
            <Menu className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-sidebar border-sidebar-border p-0">
          <div className="p-4 border-b border-sidebar-border">
            <img src="/stellantis-logo.svg" alt="Stellantis" className="h-12 w-auto brightness-0 invert opacity-100 mb-2" />
            <h1 className="text-sm font-semibold text-sidebar-foreground">Attendance Tracker</h1>
            <p className="text-[9px] text-sidebar-foreground/40 font-medium">Developed by DAVNS INDUSTRIES</p>
            <p className="text-[10px] text-sidebar-foreground/50 font-medium mt-1">
              {role === "admin" ? "Admin" : "Worker"}
            </p>
          </div>

          <nav className="p-2 space-y-0.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-2.5 border-t border-sidebar-border">
            <div className="px-2.5 py-1.5 mb-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.user_metadata?.full_name || user?.email || "User"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate">
                {role === "admin" ? "Administrator" : "Worker"}
              </p>
            </div>
            <LogoutConfirmDialog onConfirm={() => { signOut(); setOpen(false); }} />
          </div>
        </SheetContent>
      </Sheet>

      <span className="text-xs font-semibold text-foreground">{currentPage}</span>

      <div className="w-8" />
    </header>
  );
}
