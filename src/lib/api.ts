const API_BASE = "http://localhost:5000";
export const HR_PASSWORD = "change-me-hr-admin";

// Types
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: "HR" | "TEAM_LEAD" | "EMPLOYEE";
  is_active: boolean;
}

export interface TeamMember {
  id: number;
  username: string;
  name: string;
  email: string;
}

export interface TeamMembersResponse {
  team_id: number;
  lead_username: string;
  members: TeamMember[];
}

export interface SlotRequest {
  lead_email: string;
  participant_emails: string[];
  date_start: string;
  date_end: string;
  duration_minutes: number;
}

export interface SlotResponse {
  slot_start: string;
  slot_end: string;
  time_zone: string;
}

export interface ScheduleWithN8nRequest {
  lead_email: string;
  participant_emails: string[];
  date_start: string;
  date_end: string;
  duration_minutes: number;
  subject: string;
  description?: string;
}

export interface ScheduleWithN8nResponse {
  slot_start: string;
  slot_end: string;
  time_zone: string;
  n8n_status: string;
}

export interface MeetingLog {
  google_event_id: string;
  lead_email: string;
  subject: string;
  start_time: string;
  end_time: string;
  participants_count: number;
}

export interface MeetingStats {
  meetings_count: number;
  avg_minutes: number;
  total_participants: number;
}

export interface CreateUserRequest {
  username: string;
  name: string;
  email: string;
  role: "HR" | "TEAM_LEAD" | "EMPLOYEE";
  password?: string;
}

export interface CreateTeamRequest {
  name: string;
  lead_username: string;
}

export interface Team {
  id: number;
  name: string;
  lead_username: string;
}

// API helpers
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

// User endpoints
export async function getUserByUsername(username: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users/by-username/${encodeURIComponent(username)}`);
  return handleResponse<User>(response);
}

export async function getUsers(role?: string): Promise<User[]> {
  const url = role ? `${API_BASE}/users?role=${encodeURIComponent(role)}` : `${API_BASE}/users`;
  const response = await fetch(url);
  return handleResponse<User[]>(response);
}

export async function createUser(data: CreateUserRequest, hrPassword: string): Promise<User> {
  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-HR-Password": hrPassword,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<User>(response);
}

// Team endpoints
export async function getTeamMembers(leadUsername: string): Promise<TeamMembersResponse> {
  const response = await fetch(`${API_BASE}/teams/${encodeURIComponent(leadUsername)}/members`);
  return handleResponse<TeamMembersResponse>(response);
}

export async function createTeam(data: CreateTeamRequest, hrPassword: string): Promise<Team> {
  const response = await fetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-HR-Password": hrPassword,
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Team>(response);
}

export async function addTeamMember(teamId: number, username: string, hrPassword: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/teams/${teamId}/add-member`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-HR-Password": hrPassword,
    },
    body: JSON.stringify({ username }),
  });
  return handleResponse<{ success: boolean }>(response);
}

// Calendar endpoints
export async function findSlot(data: SlotRequest): Promise<SlotResponse> {
  const response = await fetch(`${API_BASE}/calendar/find-slot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<SlotResponse>(response);
}

// Schedule with n8n endpoint
export async function scheduleWithN8n(data: ScheduleWithN8nRequest): Promise<ScheduleWithN8nResponse> {
  const response = await fetch(`${API_BASE}/schedule/with-n8n`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<ScheduleWithN8nResponse>(response);
}

// Meeting endpoints
export async function logMeeting(data: MeetingLog): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE}/meetings/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<{ success: boolean }>(response);
}

export async function getMeetingStats(from: string, to: string, leadEmail?: string): Promise<MeetingStats> {
  let url = `${API_BASE}/meetings/stats?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  if (leadEmail) {
    url += `&lead_email=${encodeURIComponent(leadEmail)}`;
  }
  const response = await fetch(url);
  return handleResponse<MeetingStats>(response);
}
