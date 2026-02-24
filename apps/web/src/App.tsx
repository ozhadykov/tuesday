import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Board from './components/Board'
import Modal from './components/Modal'
import Settings from './components/Settings'
import WeeklyOverview from './components/WeeklyOverview'
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState([
    { id: 'main', title: 'Main Board' },
    { id: 'marketing', title: 'Marketing' },
  ])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')

  const handleAddBoard = (e: React.FormEvent) => {
    e.preventDefault()
    if (newBoardTitle.trim()) {
      const id = newBoardTitle.toLowerCase().replace(/\s+/g, '-')
      const newBoard = { id, title: newBoardTitle }
      setBoards([...boards, newBoard])
      setNewBoardTitle('')
      setIsModalOpen(false)
      navigate(`/boards/${id}`)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar boards={boards} onAddBoard={() => setIsModalOpen(true)} />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/boards/:boardId" element={<Board />} />
            <Route path="/overview" element={<WeeklyOverview />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Navigate to="/boards/main" replace />} />
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
              onChange={(e) => setNewBoardTitle(e.target.value)}
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
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
