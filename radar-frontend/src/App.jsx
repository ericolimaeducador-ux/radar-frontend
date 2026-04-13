import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { auth, dashboardAPI } from './lib/api'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import MonitorsPage from './pages/MonitorsPage'
import PublicationsPage from './pages/PublicationsPage'
import NotesPage from './pages/NotesPage'
import AdminPage from './pages/AdminPage'
import './index.css'

function ProtectedLayout() {
  const location = useLocation()
  const user = auth.getUser()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    dashboardAPI.stats().then(r => {
      if (r.success) setUnreadCount(r.stats.unreadCount)
    })
  }, [location.pathname])

  if (!auth.isLoggedIn()) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="app-shell">
      <Sidebar unreadCount={unreadCount} />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard"    element={<DashboardPage />} />
          <Route path="/monitors"     element={<MonitorsPage />} />
          <Route path="/publications" element={<PublicationsPage />} />
          <Route path="/notes"        element={<NotesPage />} />
          <Route path="/collections"  element={<Navigate to="/notes" replace />} />
          {user?.role === 'admin' && (
            <Route path="/admin" element={<AdminPage />} />
          )}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function PublicRoute() {
  if (auth.isLoggedIn()) return <Navigate to="/dashboard" replace />
  return <AuthPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<PublicRoute />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
