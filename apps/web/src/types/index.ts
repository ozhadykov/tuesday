export interface Task {
  id: string;
  title: string;
  owner: string;
  status: 'Working on it' | 'Stuck' | 'Done' | 'Not Started';
  deadline: string;
  dueDate?: string; // ISO string or YYYY-MM-DD
}

export interface TaskGroup {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export interface BoardData {
  id: string;
  title: string;
  groups: TaskGroup[];
}
