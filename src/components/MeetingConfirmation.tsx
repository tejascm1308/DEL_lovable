import { TeamMember, SlotResponse } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Calendar, Clock, Users, FileText } from "lucide-react";
import { format, parseISO } from "date-fns";

interface MeetingConfirmationProps {
  slot: SlotResponse;
  subject: string;
  description?: string;
  participants: TeamMember[];
}

export function MeetingConfirmation({
  slot,
  subject,
  description,
  participants,
}: MeetingConfirmationProps) {
  const startDate = parseISO(slot.slot_start);
  const endDate = parseISO(slot.slot_end);

  return (
    <Card className="border-emerald-200 bg-emerald-50/50 animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <CardTitle className="text-emerald-700">Meeting Scheduled!</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-start gap-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-xs text-muted-foreground block">Subject</span>
              <span className="font-medium text-foreground">{subject}</span>
            </div>
          </div>

          {description && (
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-muted-foreground mt-0.5 opacity-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Description</span>
                <span className="text-sm text-foreground">{description}</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-xs text-muted-foreground block">Date</span>
              <span className="font-medium text-foreground">
                {format(startDate, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-xs text-muted-foreground block">Time (IST)</span>
              <span className="font-medium text-foreground">
                {format(startDate, "h:mm a")} – {format(endDate, "h:mm a")}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <span className="text-xs text-muted-foreground block">
                Participants ({participants.length})
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {participants.map((p) => (
                  <Badge key={p.id} variant="secondary" className="text-xs">
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
