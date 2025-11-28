import { User } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Mail } from "lucide-react";

interface LeadHeaderProps {
  user: User;
}

export function LeadHeader({ user }: LeadHeaderProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded animate-fade-in">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-wine/10 text-wine">
        <UserIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-foreground truncate">{user.name}</span>
          <Badge variant="wine-outline">{user.role}</Badge>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
          <Mail className="w-3.5 h-3.5" />
          <span className="truncate">{user.email}</span>
        </div>
      </div>
    </div>
  );
}
