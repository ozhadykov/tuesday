export type UserRole = 'ADMIN' | 'MEMBER';
export type TeamRole = 'LEAD' | 'MEMBER';

export interface TeamRef {
  id: string;
  name: string;
}

export interface TeamMembership {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  team: TeamRef;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  memberships: TeamMembership[];
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  assigneeId?: string | null;
  status: 'Working on it' | 'Stuck' | 'Done' | 'Not Started';
  deadline: string;
}

export interface TaskGroup {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export interface BoardListItem {
  id: string;
  title: string;
  teamId?: string | null;
  team?: TeamRef | null;
}

export interface WeeklyTask {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  boardId: string;
  boardTitle: string;
  columnId: string;
  columnTitle: string;
}

export interface WeeklyDay {
  weekday: string;
  date: string;
  tasks: WeeklyTask[];
}

export interface WeeklyOverviewData {
  user: {
    id: string;
    name: string;
  };
  weekStart: string;
  weekEnd: string;
  days: WeeklyDay[];
}

export interface TeamSummary {
  id: string;
  name: string;
  memberships: Array<{
    id: string;
    userId: string;
    teamId: string;
    role: TeamRole;
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    };
  }>;
}

export interface AdminOverviewData {
  users: UserSummary[];
  teams: TeamSummary[];
  boards: BoardListItem[];
}
