import { Link, useLocation } from "react-router-dom";
import { Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function NavHeader() {
  const location = useLocation();

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-foreground hover:text-wine transition-colors">
          <Calendar className="w-5 h-5 text-wine" />
          <span className="font-medium">Meeting Scheduler</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={cn(
              "px-3 py-1.5 rounded text-sm transition-colors",
              location.pathname === "/"
                ? "bg-wine/10 text-wine"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            Schedule
          </Link>
          <Link
            to="/admin"
            className={cn(
              "px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1.5",
              location.pathname === "/admin"
                ? "bg-wine/10 text-wine"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Settings className="w-3.5 h-3.5" />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
