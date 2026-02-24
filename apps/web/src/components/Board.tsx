import { useState, useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import TaskTable from './TaskTable';
import type { Task, TaskGroup } from '../types';

const API_BASE = 'http://localhost:4000/api';

const Board: FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [boardTitle, setBoardTitle] = useState('');
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!boardId) return;
    setLoading(true);
    
    fetch(`${API_BASE}/boards/${boardId}`)
      .then(res => {
        if (!res.ok) throw new Error('Board not found');
        return res.json();
      })
      .then(data => {
        setBoardTitle(data.title);
        setGroups(data.columns.map((col: any) => ({
          id: col.id,
          title: col.title,
          color: col.color,
          tasks: col.tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            owner: t.owner,
            status: t.status,
            deadline: t.deadline || '',
          }))
        })));
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [boardId]);

  const handleAddGroup = async () => {
    const title = prompt('Enter group name (e.g., UI Design, Infrastructure):');
    if (!title) return;

    // Optional: Let user pick a color or randomly assign one
    const colors = ['#579bfc', '#a25ddc', '#ffcb00', '#00c875', '#ff9900'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      const res = await fetch(`${API_BASE}/boards/${boardId}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, color: randomColor })
      });
      const newCol = await res.json();
      
      setGroups(prev => [...prev, {
        id: newCol.id,
        title: newCol.title,
        color: newCol.color,
        tasks: []
      }]);
    } catch (e) {
      console.error('Failed to create group', e);
    }
  };

  const handleAddTask = async (groupId: string) => {
    try {
      const res = await fetch(`${API_BASE}/columns/${groupId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Backend defaults title to empty string
      });
      const newTask = await res.json();
      
      const formattedTask: Task = {
        id: newTask.id,
        title: newTask.title,
        owner: newTask.owner,
        status: newTask.status,
        deadline: newTask.deadline || ''
      };
      
      setGroups(prevGroups => prevGroups.map(group => {
        if (group.id === groupId) {
          return { ...group, tasks: [...group.tasks, formattedTask] };
        }
        return group;
      }));
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const handleUpdateTask = async (groupId: string, taskId: string, updates: Partial<Task>) => {
    // Optimistic UI update
    setGroups(prevGroups => prevGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          tasks: group.tasks.map(task => task.id === taskId ? { ...task, ...updates } : task)
        };
      }
      return group;
    }));

    // Send update to the backend
    try {
      await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Failed to update task', error);
      // In a robust app, we would revert the optimistic update here if the request failed.
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-zinc-500">Loading board details...</div>;
  }

  if (!boardTitle && !loading) {
     return <div className="text-red-500">Board not found or an error occurred.</div>;
  }

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">
            {boardTitle}
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">
            Manage your tasks and track progress for this project.
          </p>
        </div>
        <button
          onClick={handleAddGroup}
          className="px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-md shadow-sm transition-colors"
        >
          Add Task Group
        </button>
      </header>
      
      {groups.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/50">
          <p className="text-zinc-500 mb-4">No task groups yet.</p>
          <button
            onClick={handleAddGroup}
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
            onAddTask={() => handleAddTask(group.id)}
            onUpdateTask={(taskId, updates) => handleUpdateTask(group.id, taskId, updates)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
