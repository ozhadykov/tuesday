import type { FC } from 'react';
import { Sun, Moon, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between transition-colors sticky top-0 z-40">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <Layout className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-xl text-zinc-900 dark:text-zinc-50 tracking-tight">Tuesday</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
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
            OZ
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
