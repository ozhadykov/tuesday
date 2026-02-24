import { useState, type FC } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import type { Task } from '../types';

const WeeklyOverview: FC = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const teamMembers = [
    { id: '1', name: 'Omar Zh', initial: 'OZ' },
    { id: '2', name: 'Jane Doe', initial: 'JD' },
    { id: '3', name: 'John Smith', initial: 'JS' },
  ];

  const [selectedMember, setSelectedMember] = useState(teamMembers[0]);

  // Mock data for a person's week
  const weeklyTasks: Record<string, Task[]> = {
    'Monday': [
      { id: '1', title: 'Daily Standup', owner: 'Omar Zh', status: 'Done', deadline: '2026-02-24' },
      { id: '2', title: 'API Documentation', owner: 'Omar Zh', status: 'Working on it', deadline: '2026-02-24' },
    ],
    'Tuesday': [
      { id: '3', title: 'Database Migration', owner: 'Omar Zh', status: 'Working on it', deadline: '2026-02-25' },
    ],
    'Wednesday': [
      { id: '4', title: 'Frontend Layout Fixes', owner: 'Omar Zh', status: 'Not Started', deadline: '2026-02-26' },
    ],
    'Thursday': [],
    'Friday': [
      { id: '5', title: 'Weekly Review', owner: 'Omar Zh', status: 'Not Started', deadline: '2026-02-28' },
    ],
    'Saturday': [],
    'Sunday': [],
  };

  const statusColors = {
    'Working on it': 'bg-orange-500',
    'Stuck': 'bg-red-500',
    'Done': 'bg-green-500',
    'Not Started': 'bg-zinc-400',
  };

  return (
    <div className="max-w-full">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Weekly Overview</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">
            Tracking progress for <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedMember.name}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 shadow-sm">
            <User className="w-4 h-4 text-zinc-400" />
            <select 
              value={selectedMember.id}
              onChange={(e) => {
                const member = teamMembers.find(m => m.id === e.target.value);
                if (member) setSelectedMember(member);
              }}
              className="bg-transparent text-sm font-medium focus:outline-none text-zinc-900 dark:text-zinc-50 cursor-pointer"
            >
              {teamMembers.map(member => (
                <option key={member.id} value={member.id} className="bg-white dark:bg-zinc-900">
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-all shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-2">Feb 24 - Mar 2</span>
            <button className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-all shadow-sm">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-h-[500px]">
        {days.map((day) => (
          <div key={day} className="flex flex-col bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{day}</h3>
            </div>
            
            <div className="p-2 flex-1 space-y-2">
              {weeklyTasks[day]?.length > 0 ? (
                weeklyTasks[day].map((task) => (
                  <div 
                    key={task.id}
                    className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm group hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <div className="flex flex-col gap-2">
                      <div className={`w-8 h-1 rounded-full ${statusColors[task.status]}`} />
                      <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2">
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-zinc-100 dark:border-zinc-800/50 rounded-lg">
                   <span className="text-[10px] text-zinc-400">No tasks</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyOverview;
