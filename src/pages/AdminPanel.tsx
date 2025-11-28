import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminSectionCard } from "@/components/AdminSectionCard";
import { StatsCard } from "@/components/StatsCard";
import { NavHeader } from "@/components/NavHeader";
import {
  User,
  TeamMember,
  Team,
  MeetingStats,
  HR_PASSWORD,
  getUsers,
  createUser,
  createTeam,
  addTeamMember,
  getTeamMembers,
  getMeetingStats,
} from "@/lib/api";
import {
  Lock,
  UserPlus,
  Users,
  UsersRound,
  BarChart3,
  Loader2,
  Calendar,
  Clock,
  UserCheck,
  Shield,
} from "lucide-react";

export default function AdminPanel() {
  // Auth
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    name: "",
    email: "",
    role: "EMPLOYEE" as "HR" | "TEAM_LEAD" | "EMPLOYEE",
    password: "",
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Teams
  const [teamLeads, setTeamLeads] = useState<User[]>([]);
  const [newTeam, setNewTeam] = useState({ name: "", lead_username: "" });
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [createdTeams, setCreatedTeams] = useState<Team[]>([]);

  // Add member
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedLeadUsername, setSelectedLeadUsername] = useState<string>("");
  const [memberUsername, setMemberUsername] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Stats
  const [statsFrom, setStatsFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statsTo, setStatsTo] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statsLeadEmail, setStatsLeadEmail] = useState("");
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const handleLogin = () => {
    if (password === HR_PASSWORD) {
      setIsAuthenticated(true);
      toast.success("Welcome, HR Admin!");
      loadInitialData();
    } else {
      toast.error("Invalid password");
    }
  };

  const loadInitialData = async () => {
    setLoadingUsers(true);
    try {
      const [allUsers, leads] = await Promise.all([
        getUsers(),
        getUsers("TEAM_LEAD"),
      ]);
      setUsers(allUsers);
      setTeamLeads(leads);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.name || !newUser.email) {
      toast.error("Please fill all required fields");
      return;
    }

    setCreatingUser(true);
    try {
      const created = await createUser(
        {
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          password: newUser.password || undefined,
        },
        password
      );
      setUsers([...users, created]);
      if (created.role === "TEAM_LEAD") {
        setTeamLeads([...teamLeads, created]);
      }
      setNewUser({ username: "", name: "", email: "", role: "EMPLOYEE", password: "" });
      toast.success(`User "${created.name}" created successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create user";
      toast.error(message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.lead_username) {
      toast.error("Please fill team name and select a lead");
      return;
    }

    setCreatingTeam(true);
    try {
      const created = await createTeam(
        { name: newTeam.name, lead_username: newTeam.lead_username },
        password
      );
      setCreatedTeams([...createdTeams, created]);
      setNewTeam({ name: "", lead_username: "" });
      toast.success(`Team "${created.name}" created successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create team";
      toast.error(message);
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleSelectTeam = async (teamId: string) => {
    setSelectedTeamId(teamId);
    const team = createdTeams.find((t) => t.id.toString() === teamId);
    if (team) {
      setSelectedLeadUsername(team.lead_username);
      try {
        const data = await getTeamMembers(team.lead_username);
        setTeamMembers(data.members);
      } catch {
        setTeamMembers([]);
      }
    }
  };

  const handleAddMember = async () => {
    if (!selectedTeamId || !memberUsername) {
      toast.error("Please select a team and enter member username");
      return;
    }

    setAddingMember(true);
    try {
      await addTeamMember(parseInt(selectedTeamId), memberUsername, password);
      toast.success(`Member "${memberUsername}" added to team`);
      setMemberUsername("");
      // Refresh members
      const data = await getTeamMembers(selectedLeadUsername);
      setTeamMembers(data.members);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to add member";
      toast.error(message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleLoadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getMeetingStats(statsFrom, statsTo, statsLeadEmail || undefined);
      setStats(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load stats";
      toast.error(message);
    } finally {
      setLoadingStats(false);
    }
  };

  // Unauthenticated view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <NavHeader />
        <main className="max-w-md mx-auto px-4 py-16">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-wine/10 flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-wine" />
              </div>
              <CardTitle>HR Admin Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter HR password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
              </div>
              <Button onClick={handleLogin} className="w-full" variant="wine">
                <Lock className="w-4 h-4 mr-2" />
                Authenticate
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-foreground">HR Admin Panel</h1>
              <p className="text-sm text-muted-foreground">
                Manage users, teams, and view meeting statistics
              </p>
            </div>
            <Badge variant="wine">Authenticated</Badge>
          </div>

          {/* Users Section */}
          <AdminSectionCard
            title="Create User"
            description="Add a new employee to the system"
            icon={<UserPlus className="w-4 h-4" />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input
                  placeholder="john_doe"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  placeholder="John Doe"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v) => setNewUser({ ...newUser, role: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="TEAM_LEAD">Team Lead</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Password (optional)</Label>
                <Input
                  type="password"
                  placeholder="Leave empty for auto-generated"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={handleCreateUser}
              disabled={creatingUser}
              className="mt-4"
              variant="wine"
            >
              {creatingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create User
            </Button>
          </AdminSectionCard>

          {/* Users Table */}
          <AdminSectionCard
            title="Existing Users"
            description="All registered employees"
            icon={<Users className="w-4 h-4" />}
          >
            {loadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-wine" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No users found
              </p>
            ) : (
              <div className="rounded border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">@{user.username}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "HR"
                                ? "wine"
                                : user.role === "TEAM_LEAD"
                                ? "wine-outline"
                                : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "success" : "muted"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </AdminSectionCard>

          {/* Teams Section */}
          <div className="grid gap-6 md:grid-cols-2">
            <AdminSectionCard
              title="Create Team"
              description="Create a new team with a lead"
              icon={<UsersRound className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Team Name</Label>
                  <Input
                    placeholder="Backend Team"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team Lead</Label>
                  <Select
                    value={newTeam.lead_username}
                    onValueChange={(v) => setNewTeam({ ...newTeam, lead_username: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamLeads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.username}>
                          {lead.name} (@{lead.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreateTeam}
                  disabled={creatingTeam}
                  variant="wine"
                  className="w-full"
                >
                  {creatingTeam ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Team
                </Button>
              </div>
            </AdminSectionCard>

            <AdminSectionCard
              title="Add Team Member"
              description="Add a member to an existing team"
              icon={<UserCheck className="w-4 h-4" />}
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Team</Label>
                  <Select value={selectedTeamId} onValueChange={handleSelectTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      {createdTeams.map((team) => (
                        <SelectItem key={team.id} value={team.id.toString()}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Member Username</Label>
                  <Input
                    placeholder="alice01"
                    value={memberUsername}
                    onChange={(e) => setMemberUsername(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleAddMember}
                  disabled={addingMember || !selectedTeamId}
                  variant="wine"
                  className="w-full"
                >
                  {addingMember ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Add Member
                </Button>

                {teamMembers.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground mb-2">Current Members:</p>
                    <div className="flex flex-wrap gap-1">
                      {teamMembers.map((m) => (
                        <Badge key={m.id} variant="secondary">
                          {m.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AdminSectionCard>
          </div>

          {/* Stats Section */}
          <AdminSectionCard
            title="Meeting Statistics"
            description="View meeting metrics for a date range"
            icon={<BarChart3 className="w-4 h-4" />}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={statsFrom}
                  onChange={(e) => setStatsFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={statsTo}
                  onChange={(e) => setStatsTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Lead Email (optional)</Label>
                <Input
                  type="email"
                  placeholder="Filter by lead"
                  value={statsLeadEmail}
                  onChange={(e) => setStatsLeadEmail(e.target.value)}
                />
              </div>
            </div>
            <Button
              onClick={handleLoadStats}
              disabled={loadingStats}
              className="mt-4"
              variant="wine-outline"
            >
              {loadingStats ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Load Statistics
            </Button>

            {stats && (
              <div className="grid gap-4 sm:grid-cols-3 mt-6">
                <StatsCard
                  title="Total Meetings"
                  value={stats.meetings_count}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <StatsCard
                  title="Avg Duration"
                  value={`${stats.avg_minutes.toFixed(1)} min`}
                  icon={<Clock className="w-4 h-4" />}
                />
                <StatsCard
                  title="Total Participants"
                  value={stats.total_participants}
                  icon={<Users className="w-4 h-4" />}
                />
              </div>
            )}
          </AdminSectionCard>
        </div>
      </main>
    </div>
  );
}
