import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Calendar, ClipboardList, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Home", path: "/" },
  { icon: Calendar, label: "Attend", path: "/attendance" },
  { icon: ClipboardList, label: "Brief", path: "/briefing" },
  { icon: Clock, label: "OT", path: "/overtime" },
  { icon: Users, label: "Workers", path: "/workers" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-1 py-1 rounded-2xl transition-corporate min-w-[4.5rem] relative active:scale-95",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-corporate",
                isActive ? "bg-primary/10 shadow-sm" : "bg-transparent"
              )}>
                <item.icon className={cn("w-5 h-5 transition-corporate", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[10px] uppercase tracking-tighter transition-all duration-300", 
                isActive ? "font-black opacity-100" : "font-bold opacity-70"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-full animate-fade-in" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
