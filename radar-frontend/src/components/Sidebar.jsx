import { NavLink, useNavigate } from 'react-router-dom'
import { auth, authAPI } from '../lib/api'
import { useToast } from './Toast'

const icons = {
  home: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z"/>
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/>
    </svg>
  ),
  publications: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="1" width="10" height="13" rx="1"/><path d="M5 4h6M5 7h6M5 10h4"/><path d="M12 4h2v10H5"/>
    </svg>
  ),
  notes: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2h8l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z"/><path d="M11 2v4h3M5 8h6M5 11h4"/>
    </svg>
  ),
  collections: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="14" height="10" rx="1"/><path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v1"/>
    </svg>
  ),
  admin: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.22 3.22l1.42 1.42M11.36 11.36l1.42 1.42M3.22 12.78l1.42-1.42M11.36 4.64l1.42-1.42"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 11l3-3-3-3M14 8H6"/>
    </svg>
  ),
}

export default function Sidebar({ unreadCount = 0 }) {
  const user = auth.getUser()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogout = async () => {
    await authAPI.logout()
    toast('Sessão encerrada.', 'info')
    navigate('/')
  }

  const initials = (user?.name || 'U')
    .split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="10" stroke="#f0a500" strokeWidth="1.5"/>
            <circle cx="11" cy="11" r="4" fill="#f0a500" opacity="0.2"/>
            <circle cx="11" cy="11" r="1.5" fill="#f0a500"/>
            <path d="M11 1 L11 5 M11 17 L11 21 M1 11 L5 11 M17 11 L21 11" stroke="#f0a500" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
          </svg>
          Radar
        </div>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>Científico</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Principal</div>

        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{icons.home}</span>
          Dashboard
        </NavLink>

        <NavLink to="/monitors" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{icons.monitor}</span>
          Monitores
        </NavLink>

        <NavLink to="/publications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{icons.publications}</span>
          Publicações
          {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
        </NavLink>

        <div className="nav-section-label">Organização</div>

        <NavLink to="/notes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{icons.notes}</span>
          Notas
        </NavLink>

        <NavLink to="/collections" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{icons.collections}</span>
          Coleções
        </NavLink>

        {user?.role === 'admin' && (
          <>
            <div className="nav-section-label">Sistema</div>
            <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">{icons.admin}</span>
              Administração
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Pesquisador'}</div>
          </div>
          <button
            className="btn btn-icon btn-ghost"
            onClick={handleLogout}
            title="Sair"
            style={{ padding: '6px', marginLeft: 'auto' }}
          >
            {icons.logout}
          </button>
        </div>
      </div>
    </aside>
  )
}
