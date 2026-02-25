import { useState, useEffect, type FC, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import TaskTable from './TaskTable';
import Modal from './Modal';
import { buildApiUrl } from '../lib/api';
import type { Task, TaskGroup, UserSummary } from '../types';

interface BoardProps {
  currentUserId?: string;
  users: UserSummary[];
}

interface ApiTask {
  id: string;
  title: string;
  owner: string;
  assigneeId: string | null;
  status: Task['status'];
  deadline: string | null;
}

interface ApiColumn {
  id: string;
  title: string;
  color: string;
  tasks: ApiTask[];
}

interface ApiBoardResponse {
  id: string;
  title: string;
  columns: ApiColumn[];
}

const Board: FC<BoardProps> = ({ currentUserId, users }) => {
  const { boardId } = useParams<{ boardId: string }>();
  const [boardTitle, setBoardTitle] = useState('');
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');

  useEffect(() => {
    if (!boardId) {
      return;
    }

    const fetchBoard = async () => {
      try {
        const response = await fetch(
          buildApiUrl(`/boards/${boardId}`, {
            userId: currentUserId,
          }),
        );

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('You do not have access to this board.');
          }
          throw new Error('Board not found');
        }

        const data: ApiBoardResponse = await response.json();

        setBoardTitle(data.title);
        setGroups(
          data.columns.map((column) => ({
            id: column.id,
            title: column.title,
            color: column.color,
            tasks: column.tasks.map((task) => ({
              id: task.id,
              title: task.title,
              owner: task.owner,
              assigneeId: task.assigneeId,
              status: task.status,
              deadline: task.deadline || '',
            })),
          })),
        );
        setError(null);
      } catch (fetchError) {
        console.error(fetchError);
        setBoardTitle('');
        setGroups([]);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load board');
      } finally {
        setLoading(false);
      }
    };

    void fetchBoard();
  }, [boardId, currentUserId]);

  const handleAddGroupSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!newGroupTitle.trim() || !boardId) {
      return;
    }

    const colors = ['#579bfc', '#a25ddc', '#ffcb00', '#00c875', '#ff9900'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      const response = await fetch(buildApiUrl(`/boards/${boardId}/columns`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newGroupTitle, color: randomColor }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task group');
      }

      const newColumn: { id: string; title: string; color: string } = await response.json();

      setGroups((previousGroups) => [
        ...previousGroups,
        {
          id: newColumn.id,
          title: newColumn.title,
          color: newColumn.color,
          tasks: [],
        },
      ]);

      setNewGroupTitle('');
      setIsModalOpen(false);
    } catch (createError) {
      console.error('Failed to create group', createError);
    }
  };

  const handleAddTask = async (groupId: string) => {
    try {
      const response = await fetch(buildApiUrl(`/columns/${groupId}/tasks`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const newTask: ApiTask = await response.json();

      const formattedTask: Task = {
        id: newTask.id,
        title: newTask.title,
        owner: newTask.owner,
        assigneeId: newTask.assigneeId,
        status: newTask.status,
        deadline: newTask.deadline || '',
      };

      setGroups((previousGroups) =>
        previousGroups.map((group) => {
          if (group.id === groupId) {
            return { ...group, tasks: [...group.tasks, formattedTask] };
          }
          return group;
        }),
      );
    } catch (addError) {
      console.error('Failed to add task', addError);
    }
  };

  const handleUpdateTask = async (groupId: string, taskId: string, updates: Partial<Task>) => {
    setGroups((previousGroups) =>
      previousGroups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            tasks: group.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
          };
        }
        return group;
      }),
    );

    try {
      const response = await fetch(buildApiUrl(`/tasks/${taskId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }
    } catch (updateError) {
      console.error('Failed to update task', updateError);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-zinc-500">Loading board details...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <>
      <div className="flex flex-col w-full animate-in fade-in duration-200">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">{boardTitle}</h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">
              Manage your tasks and track progress for this project.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-md shadow-sm transition-colors"
          >
            Add Task Group
          </button>
        </header>

        {groups.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50">
            <p className="text-zinc-500 mb-4">No task groups yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors"
            >
              Create first group
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <TaskTable
              key={group.id}
              group={group}
              users={users}
              onAddTask={() => handleAddTask(group.id)}
              onUpdateTask={(taskId, updates) => handleUpdateTask(group.id, taskId, updates)}
            />
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create new task group">
        <form onSubmit={handleAddGroupSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Group Title</label>
            <input
              autoFocus
              type="text"
              value={newGroupTitle}
              onChange={(event) => setNewGroupTitle(event.target.value)}
              placeholder="e.g. UI Design, Infrastructure"
              className="w-full px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newGroupTitle.trim()}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              Add Group
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Board;
