import { useState, type FC } from 'react';
import { useParams } from 'react-router-dom';
import TaskTable from './TaskTable';
import type { Task, TaskGroup } from '../types';

const Board: FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  
  const [groups, setGroups] = useState<TaskGroup[]>([
    {
      id: 'g1',
      title: 'UI Design',
      color: '#579bfc',
      tasks: [
        { id: 't1', title: 'Create login wireframes', owner: 'Omar Zh', status: 'Done', deadline: '2026-02-25' },
        { id: 't2', title: 'Design system tokens', owner: 'Omar Zh', status: 'Working on it', deadline: '2026-02-26' },
      ]
    },
    {
      id: 'g2',
      title: 'API Development',
      color: '#a25ddc',
      tasks: [
        { id: 't3', title: 'Setup Express server', owner: 'Omar Zh', status: 'Done', deadline: '2026-02-24' },
      ]
    }
  ]);

  const handleAddTask = (groupId: string) => {
    setGroups(prevGroups => prevGroups.map(group => {
      if (group.id === groupId) {
        const newTask: Task = {
          id: `t-${Date.now()}`,
          title: '',
          owner: 'Omar Zh',
          status: 'Not Started',
          deadline: '2026-02-24'
        };
        return { ...group, tasks: [...group.tasks, newTask] };
      }
      return group;
    }));
  };

  const handleUpdateTask = (groupId: string, taskId: string, updates: Partial<Task>) => {
    setGroups(prevGroups => prevGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          tasks: group.tasks.map(task => task.id === taskId ? { ...task, ...updates } : task)
        };
      }
      return group;
    }));
  };

  return (
    <div className="flex flex-col w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">
          {boardId?.replace(/-/g, ' ')}
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">
          Manage your tasks and track progress for this project.
        </p>
      </header>
      
      {groups.map((group) => (
        <TaskTable 
          key={group.id} 
          group={group} 
          onAddTask={() => handleAddTask(group.id)}
          onUpdateTask={(taskId, updates) => handleUpdateTask(group.id, taskId, updates)}
        />
      ))}
    </div>
  );
};

export default Board;
