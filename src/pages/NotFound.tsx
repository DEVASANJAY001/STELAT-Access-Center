import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-fade-in">
      <div className="text-center space-y-4">
        <p className="text-6xl font-semibold text-muted-foreground/30">404</p>
        <p className="text-base text-muted-foreground">This page doesn't exist</p>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link to="/"><Home className="w-4 h-4" /> Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
