import { useEffect, useMemo, useState, type FC } from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { buildApiUrl } from '../lib/api';
import type { UserSummary, WeeklyOverviewData } from '../types';

interface WeeklyOverviewProps {
  users: UserSummary[];
  defaultUserId?: string;
}

function getMonday(date: Date): Date {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = copy.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  copy.setUTCDate(copy.getUTCDate() + offset);
  return copy;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekRangeLabel(weekStart: string, weekEnd: string): string {
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const end = new Date(`${weekEnd}T00:00:00.000Z`);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

const statusColors: Record<string, string> = {
  'Working on it': 'bg-orange-500',
  Stuck: 'bg-red-500',
  Done: 'bg-green-500',
  'Not Started': 'bg-zinc-400',
};

const WeeklyOverview: FC<WeeklyOverviewProps> = ({ users, defaultUserId }) => {
  const [selectedUserId, setSelectedUserId] = useState(defaultUserId ?? '');
  const [weekStart, setWeekStart] = useState(() => formatDate(getMonday(new Date())));
  const [overview, setOverview] = useState<WeeklyOverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultUserId && users.some((user) => user.id === defaultUserId)) {
      setSelectedUserId(defaultUserId);
      return;
    }

    if (!selectedUserId && users.length > 0) {
      setSelectedUserId(users[0].id);
    }
  }, [defaultUserId, users, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      setOverview(null);
      return;
    }

    const fetchOverview = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          buildApiUrl('/overview/weekly', {
            userId: selectedUserId,
            weekStart,
          }),
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weekly overview');
        }

        const data: WeeklyOverviewData = await response.json();
        setOverview(data);
      } catch (fetchError) {
        console.error(fetchError);
        setError('Failed to load weekly overview.');
        setOverview(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchOverview();
  }, [selectedUserId, weekStart]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [users, selectedUserId],
  );

  const handleShiftWeek = (direction: -1 | 1) => {
    const current = new Date(`${weekStart}T00:00:00.000Z`);
    current.setUTCDate(current.getUTCDate() + direction * 7);
    setWeekStart(formatDate(getMonday(current)));
  };

  return (
    <div className="max-w-full">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Weekly Overview</h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">
            Team lead view by person and week.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 shadow-sm">
            <User className="w-4 h-4 text-zinc-400" />
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none text-zinc-900 dark:text-zinc-50 cursor-pointer"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id} className="bg-white dark:bg-zinc-900">
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button
              onClick={() => handleShiftWeek(-1)}
              className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium px-2 min-w-[140px] text-center">
              {overview ? getWeekRangeLabel(overview.weekStart, overview.weekEnd) : 'Loading...'}
            </span>
            <button
              onClick={() => handleShiftWeek(1)}
              className="p-1.5 hover:bg-white dark:hover:bg-zinc-700 rounded-md transition-all shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {selectedUser && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Showing tasks for <span className="font-semibold text-zinc-800 dark:text-zinc-100">{selectedUser.name}</span>
        </p>
      )}

      {loading && <div className="text-zinc-500">Loading weekly tasks...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && overview && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 min-h-[500px]">
          {overview.days.map((day) => (
            <div
              key={day.date}
              className="flex flex-col bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
            >
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{day.weekday}</h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">{day.date}</p>
              </div>

              <div className="p-2 flex-1 space-y-2">
                {day.tasks.length > 0 ? (
                  day.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm group hover:border-blue-500 transition-all"
                    >
                      <div className="flex flex-col gap-2">
                        <div className={`w-8 h-1 rounded-full ${statusColors[task.status] ?? 'bg-zinc-400'}`} />
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 line-clamp-2">{task.title}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                          {task.boardTitle} / {task.columnTitle}
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
      )}
    </div>
  );
};

export default WeeklyOverview;
