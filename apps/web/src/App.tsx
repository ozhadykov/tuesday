import { useState, useEffect, useMemo, useCallback, type FormEvent } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Board from './components/Board';
import Modal from './components/Modal';
import Settings from './components/Settings';
import WeeklyOverview from './components/WeeklyOverview';
import Admin from './components/Admin';
import { buildApiUrl } from './lib/api';
import type { BoardListItem, UserSummary } from './types';
import './App.css';

function AppContent() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [users, selectedUserId],
  );

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl('/users'));
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UserSummary[] = await response.json();
      setUsers(data);
      setSelectedUserId((previousUserId) => {
        if (previousUserId && data.some((user) => user.id === previousUserId)) {
          return previousUserId;
        }
        return data[0]?.id ?? '';
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadBoards = useCallback(async (userId?: string) => {
    setBoardsLoading(true);

    try {
      const response = await fetch(
        buildApiUrl('/boards', {
          userId,
        }),
      );

      if (!response.ok) {
        throw new Error('Failed to fetch boards');
      }

      const data: BoardListItem[] = await response.json();
      setBoards(data);
    } catch (error) {
      console.error(error);
      setBoards([]);
    } finally {
      setBoardsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadBoards(selectedUserId || undefined);
  }, [selectedUserId, loadBoards]);

  const handleAddBoard = async (event: FormEvent) => {
    event.preventDefault();

    if (!newBoardTitle.trim()) {
      return;
    }

    try {
      const response = await fetch(buildApiUrl('/boards'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBoardTitle.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create board');
      }

      const newBoard: BoardListItem = await response.json();
      setBoards((previousBoards) => [newBoard, ...previousBoards]);
      setNewBoardTitle('');
      setIsModalOpen(false);
      navigate(`/boards/${newBoard.id}`);
    } catch (error) {
      console.error('Failed to create board', error);
    }
  };

  const handleAdminDataChanged = async () => {
    await loadUsers();
    await loadBoards(selectedUserId || undefined);
  };

  if (boardsLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-500">
        Loading workspaces...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors flex flex-col">
      <Navbar
        users={users}
        selectedUserId={selectedUserId}
        onSelectUser={setSelectedUserId}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          boards={boards}
          onAddBoard={() => setIsModalOpen(true)}
          showAdmin={selectedUser?.role === 'ADMIN' || users.length === 0}
        />

        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route
              path="/boards/:boardId"
              element={
                <Board
                  currentUserId={selectedUserId || undefined}
                  users={users}
                />
              }
            />
            <Route
              path="/overview"
              element={
                <WeeklyOverview
                  users={users}
                  defaultUserId={selectedUserId || undefined}
                />
              }
            />
            <Route
              path="/admin"
              element={<Admin onDataChanged={handleAdminDataChanged} />}
            />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/"
              element={
                boards.length > 0 ? (
                  <Navigate to={`/boards/${boards[0].id}`} replace />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-500">
                    Please create a board from the sidebar to get started.
                  </div>
                )
              }
            />
          </Routes>
        </main>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create new board"
      >
        <form onSubmit={handleAddBoard} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Board Title
            </label>
            <input
              autoFocus
              type="text"
              value={newBoardTitle}
              onChange={(event) => setNewBoardTitle(event.target.value)}
              placeholder="e.g. Q1 Roadmap"
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
              disabled={!newBoardTitle.trim()}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors"
            >
              Create Board
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
