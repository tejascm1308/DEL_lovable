import { useState } from "react";
import { format, parse, isValid, isBefore, isEqual } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LeadHeader } from "@/components/LeadHeader";
import { TeamMemberSelect } from "@/components/TeamMemberSelect";
import { MeetingConfirmation } from "@/components/MeetingConfirmation";
import { NavHeader } from "@/components/NavHeader";
import {
  User,
  TeamMember,
  ScheduleWithN8nResponse,
  getUserByUsername,
  getTeamMembers,
  scheduleWithN8n,
  logMeeting,
} from "@/lib/api";
import { CalendarIcon, Loader2, UserCircle, Clock, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LeadScheduler() {
  // Lead identification
  const [leadUsername, setLeadUsername] = useState("");
  const [lead, setLead] = useState<User | null>(null);
  const [loadingLead, setLoadingLead] = useState(false);

  // Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);

  // Meeting details
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [timeFrom, setTimeFrom] = useState("09:00");
  const [timeTo, setTimeTo] = useState("18:00");
  const [duration, setDuration] = useState("45");

  // Scheduling state
  const [scheduling, setScheduling] = useState(false);
  const [scheduledSlot, setScheduledSlot] = useState<ScheduleWithN8nResponse | null>(null);

  const handleLoadTeam = async () => {
    if (!leadUsername.trim()) {
      toast.error("Please enter your username");
      return;
    }

    setLoadingLead(true);
    setLead(null);
    setTeamMembers([]);
    setSelectedMemberIds([]);
    setScheduledSlot(null);

    try {
      const user = await getUserByUsername(leadUsername.trim());
      
      if (!user.is_active) {
        toast.error("This user account is inactive");
        return;
      }

      setLead(user);

      // Load team members
      const teamData = await getTeamMembers(user.username);
      setTeamMembers(teamData.members);

      if (teamData.members.length === 0) {
        toast.info("No team members found. Ask HR to add members to your team.");
      } else {
        toast.success(`Loaded ${teamData.members.length} team members`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load user";
      toast.error(message);
    } finally {
      setLoadingLead(false);
    }
  };

  const handleScheduleMeeting = async () => {
    // Validation
    if (!lead) {
      toast.error("Please load your team first");
      return;
    }
    if (selectedMemberIds.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a meeting subject");
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    if (!endDate) {
      toast.error("Please select an end date");
      return;
    }

    // Validate date range
    if (isBefore(endDate, startDate)) {
      toast.error("End date must be on or after start date");
      return;
    }

    // Validate duration
    const durationMinutes = parseInt(duration, 10);
    if (isNaN(durationMinutes) || durationMinutes <= 0) {
      toast.error("Please enter a valid duration (positive number)");
      return;
    }

    // Parse times
    const fromTime = parse(timeFrom, "HH:mm", new Date());
    const toTime = parse(timeTo, "HH:mm", new Date());

    if (!isValid(fromTime) || !isValid(toTime)) {
      toast.error("Invalid time format");
      return;
    }

    if (fromTime >= toTime) {
      toast.error("End time must be after start time");
      return;
    }

    setScheduling(true);
    setScheduledSlot(null);

    try {
      const selectedMembers = teamMembers.filter((m) =>
        selectedMemberIds.includes(m.id)
      );
      const participantEmails = selectedMembers.map((m) => m.email);

      // Build ISO datetime strings for date range
      const startDateStr = format(startDate, "yyyy-MM-dd");
      const endDateStr = format(endDate, "yyyy-MM-dd");
      const dateStart = `${startDateStr}T${timeFrom}:00`;
      const dateEnd = `${endDateStr}T${timeTo}:00`;

      // Call the new /schedule/with-n8n endpoint
      const slot = await scheduleWithN8n({
        lead_email: lead.email,
        participant_emails: participantEmails,
        date_start: dateStart,
        date_end: dateEnd,
        duration_minutes: durationMinutes,
        subject: subject.trim(),
        description: description.trim() || undefined,
      });

      // Log the meeting
      await logMeeting({
        google_event_id: "pending-google-event-id",
        lead_email: lead.email,
        subject: subject.trim(),
        start_time: slot.slot_start,
        end_time: slot.slot_end,
        participants_count: selectedMembers.length,
      });

      setScheduledSlot(slot);
      toast.success("Meeting scheduled successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to schedule meeting";
      toast.error(message);
    } finally {
      setScheduling(false);
    }
  };

  const selectedParticipants = teamMembers.filter((m) =>
    selectedMemberIds.includes(m.id)
  );

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-medium text-foreground">Schedule a Team Meeting</h1>
            <p className="text-sm text-muted-foreground">
              Find the perfect time slot for your team
            </p>
          </div>

          {/* Step 1: Identify Lead */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-wine" />
                <CardTitle className="text-base">Your Identity</CardTitle>
              </div>
              <CardDescription>Enter your username to load your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your username"
                  value={leadUsername}
                  onChange={(e) => setLeadUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLoadTeam()}
                  disabled={loadingLead}
                />
                <Button
                  onClick={handleLoadTeam}
                  disabled={loadingLead || !leadUsername.trim()}
                  variant="wine"
                >
                  {loadingLead ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Load Team"
                  )}
                </Button>
              </div>

              {lead && <LeadHeader user={lead} />}
            </CardContent>
          </Card>

          {/* Step 2: Select Participants */}
          {lead && (
            <Card className="animate-slide-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-wine" />
                  <CardTitle className="text-base">Select Participants</CardTitle>
                </div>
                <CardDescription>Choose team members for the meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamMemberSelect
                  members={teamMembers}
                  selectedIds={selectedMemberIds}
                  onSelectionChange={setSelectedMemberIds}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Meeting Details */}
          {lead && selectedMemberIds.length > 0 && (
            <Card className="animate-slide-up">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-wine" />
                  <CardTitle className="text-base">Meeting Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Project sync, Sprint planning..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description / Agenda</Label>
                  <Textarea
                    id="description"
                    placeholder="Optional meeting agenda or notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Date Range Selection */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            // If end date is before new start date, reset it
                            if (date && endDate && isBefore(endDate, date)) {
                              setEndDate(date);
                            }
                          }}
                          disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(d) => {
                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                            if (d < today) return true;
                            if (startDate && d < startDate) return true;
                            return false;
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Duration - Free text input */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="e.g., 30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Typical: 15, 30, 45, 60
                  </p>
                </div>

                {/* Time Window */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Daily Time Window (IST)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleScheduleMeeting}
                  disabled={scheduling || !subject.trim() || !startDate || !endDate}
                  className="w-full"
                  variant="wine"
                  size="lg"
                >
                  {scheduling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Finding slot...
                    </>
                  ) : (
                    "Find & Schedule Meeting"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Confirmation */}
          {scheduledSlot && (
            <MeetingConfirmation
              slot={scheduledSlot}
              subject={subject}
              description={description || undefined}
              participants={selectedParticipants}
            />
          )}
        </div>
      </main>
    </div>
  );
}
