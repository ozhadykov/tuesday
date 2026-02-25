import type React from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import type { Task, TaskGroup, UserSummary } from '../types';

interface TaskTableProps {
  group: TaskGroup;
  users: UserSummary[];
  onAddTask: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const statusOptions: Task['status'][] = ['Working on it', 'Stuck', 'Done', 'Not Started'];

const statusColors: Record<Task['status'], string> = {
  'Working on it': 'bg-orange-500',
  Stuck: 'bg-red-500',
  Done: 'bg-green-500',
  'Not Started': 'bg-zinc-400',
};

const TaskTable: React.FC<TaskTableProps> = ({ group, users, onAddTask, onUpdateTask }) => {
  return (
    <div className="mb-8 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
      <div className="flex items-center gap-2 p-3 border-b border-zinc-200 dark:border-zinc-800">
        <ChevronDown className="w-4 h-4 text-zinc-400" />
        <h3 className="font-bold text-lg" style={{ color: group.color }}>
          {group.title}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse min-w-[680px]">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 uppercase text-[11px] font-semibold border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-2 w-1/2 border-r border-zinc-200 dark:border-zinc-800">Task</th>
              <th className="px-4 py-2 text-center border-r border-zinc-200 dark:border-zinc-800 w-52">Owner</th>
              <th className="px-4 py-2 text-center border-r border-zinc-200 dark:border-zinc-800 w-40">Status</th>
              <th className="px-4 py-2 text-center w-48">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {group.tasks.map((task) => (
              <tr key={task.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group relative">
                <td className="px-4 py-2 border-r border-zinc-200 dark:border-zinc-800 flex items-center gap-2 relative">
                  <div className="w-1 h-full absolute left-0 top-0" style={{ backgroundColor: group.color }} />
                  <input
                    type="text"
                    value={task.title}
                    onChange={(event) => onUpdateTask(task.id, { title: event.target.value })}
                    placeholder="Task name"
                    className="w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -ml-1 text-zinc-900 dark:text-zinc-100"
                  />
                </td>

                <td className="px-4 py-2 border-r border-zinc-200 dark:border-zinc-800">
                  <select
                    value={task.assigneeId ?? ''}
                    onChange={(event) => {
                      const selectedAssigneeId = event.target.value || null;
                      const selectedUser = users.find((user) => user.id === selectedAssigneeId);

                      onUpdateTask(task.id, {
                        assigneeId: selectedAssigneeId,
                        owner: selectedUser?.name ?? 'Unassigned',
                      });
                    }}
                    className="w-full bg-transparent text-center focus:outline-none text-xs cursor-pointer dark:text-zinc-200"
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id} className="bg-white dark:bg-zinc-900">
                        {user.name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-2 border-r border-zinc-200 dark:border-zinc-800 p-0">
                  <select
                    value={task.status}
                    onChange={(event) => onUpdateTask(task.id, { status: event.target.value as Task['status'] })}
                    className={`w-full h-full appearance-none px-2 py-2 text-white text-[11px] text-center font-bold focus:outline-none cursor-pointer ${statusColors[task.status]}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        {status}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-4 py-2 text-center text-zinc-500 dark:text-zinc-400">
                  <input
                    type="date"
                    value={task.deadline}
                    onChange={(event) => onUpdateTask(task.id, { deadline: event.target.value })}
                    className="w-full bg-transparent text-center focus:outline-none text-xs cursor-pointer dark:text-zinc-200 [color-scheme:light] dark:[color-scheme:dark]"
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/20">
              <td colSpan={4} className="px-4 py-2">
                <button
                  onClick={onAddTask}
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs w-full text-left"
                >
                  <Plus className="w-3 h-3" />
                  Add Task
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
