import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AdminSectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  icon?: ReactNode;
}

export function AdminSectionCard({ title, description, children, icon }: AdminSectionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded bg-wine/10 text-wine">
              {icon}
            </div>
          )}
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
