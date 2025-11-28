import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  subtitle?: string;
}

export function StatsCard({ title, value, icon, subtitle }: StatsCardProps) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-medium text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded bg-wine/10 text-wine">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
