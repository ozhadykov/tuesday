import React from 'react';
import { MoreVertical, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
}

interface ColumnProps {
  title: string;
  tasks: Task[];
}

const Column: React.FC<ColumnProps> = ({ title, tasks }) => {
  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <span className="text-sm text-zinc-500">{tasks.length}</span>
        </div>
        <button className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-500">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex flex-col gap-2 overflow-y-auto">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className="bg-white dark:bg-zinc-900 p-3 rounded border border-zinc-200 dark:border-zinc-700 shadow-sm hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-all"
          >
            <p className="text-sm text-zinc-800 dark:text-zinc-200">{task.title}</p>
          </div>
        ))}
      </div>

      <button className="mt-4 flex items-center gap-2 text-zinc-500 hover:text-blue-600 transition-colors px-1 py-2 text-sm">
        <Plus className="w-4 h-4" />
        <span>Add a task</span>
      </button>
    </div>
  );
};

export default Column;
