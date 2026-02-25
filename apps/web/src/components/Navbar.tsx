import type { FC } from 'react';
import { Sun, Moon, Layout, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import type { UserSummary } from '../types';

interface NavbarProps {
  users: UserSummary[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
}

const Navbar: FC<NavbarProps> = ({ users, selectedUserId, onSelectUser }) => {
  const { theme, toggleTheme } = useTheme();

  const selectedUser = users.find((user) => user.id === selectedUserId);

  return (
    <nav className="border-b bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between transition-colors sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <Layout className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-xl text-zinc-900 dark:text-zinc-50 tracking-tight">Tuesday</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {users.length > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40">
            <UserRound className="w-4 h-4 text-zinc-500" />
            <select
              value={selectedUserId}
              onChange={(event) => onSelectUser(event.target.value)}
              className="bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id} className="bg-white dark:bg-zinc-900">
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            {selectedUser?.role === 'ADMIN' && (
              <span className="text-[10px] uppercase tracking-wide bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-zinc-500">No users configured</span>
        )}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:border-zinc-800 mx-2" />

        <Link
          to="/settings"
          className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold border border-zinc-200 dark:border-zinc-700">
            {selectedUser?.name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase() || 'NA'}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
