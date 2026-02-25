import type React from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Hash, Calendar, Shield } from 'lucide-react';
import type { BoardListItem } from '../types';

interface SidebarProps {
  boards: BoardListItem[];
  onAddBoard: () => void;
  showAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ boards, onAddBoard, showAdmin = false }) => {
  return (
    <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50 dark:bg-zinc-950/50">
      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <NavLink
            to="/overview"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`
            }
          >
            <Calendar className="w-4 h-4" />
            Weekly Overview
          </NavLink>

          {showAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`
              }
            >
              <Shield className="w-4 h-4" />
              Admin Menu
            </NavLink>
          )}
        </div>

        <div className="pt-2">
          <h2 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Boards</h2>
          <nav className="space-y-1">
            {boards.map((board) => (
              <NavLink
                key={board.id}
                to={`/boards/${board.id}`}
                className={({ isActive }) =>
                  `flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                  }`
                }
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Hash className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{board.title}</span>
                </span>
                {board.team?.name && (
                  <span className="text-[10px] uppercase tracking-wide bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {board.team.name}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={onAddBoard}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Board
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
